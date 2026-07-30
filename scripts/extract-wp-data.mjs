/**
 * extract-wp-data.mjs
 * ────────────────────────────────────────────────────────────────
 * Streaming SQL dump parser — extracts only the tables needed for
 * hotel migration.
 *
 * Output: migration-output/extracted/
 *   ├── wp_posts.json
 *   ├── wp_postmeta.json
 *   ├── wp_st_hotel.json
 *   ├── wp_hotel_room.json
 *   ├── wp_terms.json
 *   ├── wp_term_taxonomy.json
 *   ├── wp_term_relationships.json
 *   ├── wp_termmeta.json
 *   ├── wp_st_location_nested.json
 *   ├── wp_st_location_relationships.json
 *   └── wp_st_price.json
 *
 * Usage: node scripts/extract-wp-data.mjs
 */

import { createReadStream, mkdirSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DUMP_PATH  = join(__dirname, '..', 'migration-output', 'u105057739_iArbx.sql');
const OUT_DIR    = join(__dirname, '..', 'migration-output', 'extracted');

// ── Tables to extract (use wp_ prefix — the main site) ──────────
const TARGET_TABLES = new Set([
  'wp_posts',
  'wp_postmeta',
  'wp_st_hotel',
  'wp_hotel_room',
  'wp_terms',
  'wp_term_taxonomy',
  'wp_term_relationships',
  'wp_termmeta',
  'wp_st_location_nested',
  'wp_st_location_relationships',
  'wp_st_price',
]);

// ── State ────────────────────────────────────────────────────────
const extracted   = {};   // tableName -> { columns: [], rows: [] }
let currentTable  = null; // name of table being processed
let currentCols   = null; // column names array
let insertBuffer  = '';   // accumulates multi-line INSERT
let inInsert      = false;
let lineNo        = 0;

// ── SQL value parser (MySQL-flavoured) ───────────────────────────
/**
 * Parse a MySQL VALUES row string into an array of JS values.
 * Handles: NULL, integers, floats, 'string with \'escapes\\'
 */
function parseValues(valuesStr) {
  const rows = [];
  let i = 0;
  const len = valuesStr.length;

  function skipWS() { while (i < len && (valuesStr[i] === ' ' || valuesStr[i] === '\t' || valuesStr[i] === '\n' || valuesStr[i] === '\r')) i++; }

  function parseValue() {
    skipWS();
    if (i >= len) return undefined;

    const ch = valuesStr[i];

    // NULL
    if (valuesStr.startsWith('NULL', i)) { i += 4; return null; }

    // Quoted string
    if (ch === "'") {
      i++; // skip opening quote
      let str = '';
      while (i < len) {
        const c = valuesStr[i];
        if (c === '\\') {
          i++;
          const esc = valuesStr[i];
          if      (esc === 'n')  str += '\n';
          else if (esc === 'r')  str += '\r';
          else if (esc === 't')  str += '\t';
          else if (esc === "'")  str += "'";
          else if (esc === '"')  str += '"';
          else if (esc === '\\') str += '\\';
          else                   str += esc;
          i++;
        } else if (c === "'") {
          i++; // skip closing quote
          // Handle '' (double-quote escape in some dumps)
          if (valuesStr[i] === "'") { str += "'"; i++; continue; }
          break;
        } else {
          str += c;
          i++;
        }
      }
      return str;
    }

    // Number (including negative)
    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      let numStr = '';
      if (ch === '-') { numStr = '-'; i++; }
      while (i < len && ((valuesStr[i] >= '0' && valuesStr[i] <= '9') || valuesStr[i] === '.')) {
        numStr += valuesStr[i++];
      }
      return numStr.includes('.') ? parseFloat(numStr) : parseInt(numStr, 10);
    }

    // Unquoted keyword fallback
    let word = '';
    while (i < len && valuesStr[i] !== ',' && valuesStr[i] !== ')' && valuesStr[i] !== ' ') {
      word += valuesStr[i++];
    }
    return word || null;
  }

  function parseRow() {
    skipWS();
    if (valuesStr[i] !== '(') return null;
    i++; // skip (
    const row = [];
    while (i < len) {
      skipWS();
      if (valuesStr[i] === ')') { i++; break; }
      if (valuesStr[i] === ',') { i++; continue; }
      row.push(parseValue());
    }
    return row;
  }

  while (i < len) {
    skipWS();
    if (i >= len) break;
    if (valuesStr[i] === ',') { i++; continue; }
    if (valuesStr[i] === ';') break;
    if (valuesStr[i] === '(') {
      const row = parseRow();
      if (row) rows.push(row);
    } else {
      i++; // skip unexpected chars
    }
  }

  return rows;
}

/**
 * Extract column names from CREATE TABLE or INSERT INTO statement.
 * Returns array of column names, or null if not found.
 */
function extractColumns(line) {
  // INSERT INTO `table` (`col1`, `col2`) VALUES ...
  const colMatch = line.match(/INSERT INTO `[^`]+` \(([^)]+)\) VALUES/i);
  if (colMatch) {
    return colMatch[1].split(',').map(c => c.trim().replace(/`/g, ''));
  }
  return null;
}

/**
 * Extract VALUES portion from an INSERT line.
 */
function extractValuesStr(line) {
  const idx = line.toUpperCase().indexOf('VALUES');
  if (idx === -1) return null;
  return line.slice(idx + 6).trim();
}

/**
 * Detect which table an INSERT statement targets.
 */
function detectTable(line) {
  const m = line.match(/INSERT INTO `([^`]+)`/i);
  return m ? m[1] : null;
}

// ── Process a complete INSERT statement ──────────────────────────
function processInsert(sql) {
  const tableName = detectTable(sql);
  if (!tableName || !TARGET_TABLES.has(tableName)) return;

  // Get or init table entry
  if (!extracted[tableName]) {
    extracted[tableName] = { columns: [], rows: [] };
  }

  // Extract columns if specified in INSERT
  const cols = extractColumns(sql);
  if (cols && extracted[tableName].columns.length === 0) {
    extracted[tableName].columns = cols;
  }

  // Extract and parse VALUES
  const valStr = extractValuesStr(sql);
  if (!valStr) return;

  const rows = parseValues(valStr);
  extracted[tableName].rows.push(...rows);
}

// ── Also capture column definitions from CREATE TABLE ────────────
let inCreate     = false;
let createTable  = null;
let createCols   = [];

function processCreateLine(line) {
  const trimmed = line.trim();

  if (!inCreate) {
    const m = trimmed.match(/^CREATE TABLE `([^`]+)`/i);
    if (m) {
      const tbl = m[1];
      if (TARGET_TABLES.has(tbl)) {
        inCreate    = true;
        createTable = tbl;
        createCols  = [];
      }
    }
    return;
  }

  // End of CREATE TABLE
  if (trimmed.startsWith(')')) {
    if (createTable && extracted[createTable]) {
      if (extracted[createTable].columns.length === 0) {
        extracted[createTable].columns = createCols;
      }
    }
    inCreate    = false;
    createTable = null;
    createCols  = [];
    return;
  }

  // Column definition line
  const colMatch = trimmed.match(/^`([^`]+)`\s+/);
  if (colMatch && !trimmed.startsWith('PRIMARY') && !trimmed.startsWith('KEY') && !trimmed.startsWith('UNIQUE') && !trimmed.startsWith('INDEX')) {
    createCols.push(colMatch[1]);
  }
}

// ── Main streaming logic ─────────────────────────────────────────
async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // Pre-init all tables
  for (const t of TARGET_TABLES) {
    extracted[t] = { columns: [], rows: [] };
  }

  console.log('🔍 Extracting WordPress tables from SQL dump...\n');

  const rl = createInterface({
    input:    createReadStream(DUMP_PATH, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  for await (const rawLine of rl) {
    lineNo++;

    if (lineNo % 50000 === 0) {
      const counts = Object.entries(extracted)
        .filter(([, v]) => v.rows.length > 0)
        .map(([k, v]) => `${k.replace('wp_','')}:${v.rows.length}`)
        .join(' ');
      console.log(`  📊 Line ${lineNo.toLocaleString()} — ${counts || 'scanning...'}`);
    }

    const line = rawLine.trimEnd();

    // CREATE TABLE parsing (for column names)
    processCreateLine(line);

    // Handle INSERT statements
    if (!inInsert) {
      // Check if line starts an INSERT for one of our tables
      const tbl = detectTable(line);
      if (tbl && TARGET_TABLES.has(tbl) && line.toUpperCase().includes('INSERT INTO')) {
        inInsert      = true;
        currentTable  = tbl;
        insertBuffer  = line;

        // If the INSERT ends on the same line
        if (line.trimEnd().endsWith(';')) {
          processInsert(insertBuffer.slice(0, -1)); // remove trailing ;
          inInsert      = false;
          insertBuffer  = '';
          currentTable  = null;
        }
      }
      // ignore all other lines
    } else {
      // Accumulate multi-line INSERT
      insertBuffer += '\n' + line;
      if (line.trimEnd().endsWith(';')) {
        processInsert(insertBuffer.slice(0, insertBuffer.lastIndexOf(';')));
        inInsert     = false;
        insertBuffer = '';
        currentTable = null;
      }
    }
  }

  // ── Write output files ───────────────────────────────────────
  console.log('\n✅ Extraction complete! Writing files...\n');

  let totalRows = 0;
  for (const [tableName, data] of Object.entries(extracted)) {
    if (data.rows.length === 0) {
      console.log(`  ⬜ ${tableName} — 0 rows (skipped)`);
      continue;
    }

    // Convert rows to objects if we have column names
    let output;
    if (data.columns.length > 0 && data.rows.length > 0) {
      const firstRow = data.rows[0];
      if (Array.isArray(firstRow)) {
        output = data.rows.map(row => {
          const obj = {};
          data.columns.forEach((col, i) => { obj[col] = row[i] ?? null; });
          return obj;
        });
      } else {
        output = data.rows;
      }
    } else {
      output = data.rows;
    }

    const outPath = join(OUT_DIR, `${tableName}.json`);
    writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`  ✅ ${tableName} — ${output.length.toLocaleString()} rows → ${tableName}.json`);
    totalRows += output.length;
  }

  console.log(`\n📊 Total: ${totalRows.toLocaleString()} rows extracted`);
  console.log(`📁 Output: migration-output/extracted/`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
