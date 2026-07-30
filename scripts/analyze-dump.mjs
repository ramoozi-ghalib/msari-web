/**
 * SQL Dump Analyzer
 * يقرأ ملف SQL dump ويستخرج أسماء الجداول وإحصائيات البيانات
 */

import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const DUMP_PATH = './migration-output/u105057739_iArbx.sql';

async function analyzeDump() {
  console.log('🔍 Analyzing SQL dump...\n');
  
  const tables = new Map(); // table name -> { createLine, insertCount, rowEstimate }
  const postTypes = new Map(); // post_type -> count
  const metaKeys = new Set();
  
  let currentTable = '';
  let lineNum = 0;
  let postMetaLine = 0;
  let postsLine = 0;
  let termsLine = 0;
  let termTaxLine = 0;
  let termRelLine = 0;
  
  const rl = createInterface({
    input: createReadStream(DUMP_PATH, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    lineNum++;
    
    // Find CREATE TABLE statements
    if (line.includes('CREATE TABLE')) {
      const match = line.match(/CREATE TABLE `([^`]+)`/);
      if (match) {
        currentTable = match[1];
        tables.set(currentTable, { createLine: lineNum, insertCount: 0, hasData: false });
      }
    }
    
    // Count INSERT statements
    if (line.startsWith('INSERT INTO')) {
      const match = line.match(/INSERT INTO `([^`]+)`/);
      if (match) {
        const tbl = match[1];
        if (tables.has(tbl)) {
          const info = tables.get(tbl);
          info.insertCount++;
          info.hasData = true;
        }
      }
    }
    
    // Find key tables line numbers
    if (line.includes('posts`') && line.includes('CREATE TABLE')) {
      if (line.includes('postmeta')) postMetaLine = lineNum;
      else postsLine = lineNum;
    }
    if (line.includes('terms`') && line.includes('CREATE TABLE') && !line.includes('termmeta') && !line.includes('taxonomy') && !line.includes('relationships')) {
      termsLine = lineNum;
    }
    if (line.includes('term_taxonomy') && line.includes('CREATE TABLE')) termTaxLine = lineNum;
    if (line.includes('term_relationships') && line.includes('CREATE TABLE')) termRelLine = lineNum;
    
    // Sample post types from posts INSERT
    if (line.includes("'st_hotel'") || line.includes("'st_room'")) {
      if (line.includes("'st_hotel'")) postTypes.set('st_hotel', (postTypes.get('st_hotel') || 0) + 1);
      if (line.includes("'st_room'")) postTypes.set('st_room', (postTypes.get('st_room') || 0) + 1);
    }
    
    // Progress
    if (lineNum % 100000 === 0) {
      process.stdout.write(`  📊 Processed ${lineNum} lines...\r`);
    }
  }
  
  console.log(`\n✅ Total lines: ${lineNum}\n`);
  
  // Output results
  console.log('📋 ALL TABLES FOUND:');
  console.log('='.repeat(70));
  for (const [name, info] of tables) {
    const status = info.hasData ? '✅ DATA' : '⬜ EMPTY';
    console.log(`  ${status}  Line ${String(info.createLine).padStart(6)} | ${name} (${info.insertCount} INSERT stmts)`);
  }
  
  console.log(`\n📊 Total tables: ${tables.size}`);
  
  console.log('\n🏨 Post Types Found:');
  for (const [type, count] of postTypes) {
    console.log(`  ${type}: ~${count} references`);
  }
  
  console.log('\n📍 Key Table Locations:');
  console.log(`  posts:              Line ${postsLine}`);
  console.log(`  postmeta:           Line ${postMetaLine}`);
  console.log(`  terms:              Line ${termsLine}`);
  console.log(`  term_taxonomy:      Line ${termTaxLine}`);
  console.log(`  term_relationships: Line ${termRelLine}`);
}

analyzeDump().catch(console.error);
