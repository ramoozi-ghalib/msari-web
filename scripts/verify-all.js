async function main() {
  console.log('--- 1. Testing Destination: Aden ---');
  const resAden = await fetch('http://localhost:3000/ar/destinations/aden');
  const adenHtml = await resAden.text();
  console.log('Aden HTTP status:', resAden.status);
  console.log('Has history text:', adenHtml.includes('تعتبر مدينة عدن'));
  console.log('Has climate text:', adenHtml.includes('معتدل'));
  console.log('Has culture text:', adenHtml.includes('متنوعة'));
  console.log('Has season text:', adenHtml.includes('طوال العام'));
  console.log('Has Tawila tanks:', adenHtml.includes('صهاريج الطويلة'));
  console.log('Has Sira fortress:', adenHtml.includes('قلعة صيرة'));
  console.log('Has Gold Mohur:', adenHtml.includes('ساحل جولد مور'));

  console.log('\n--- 2. Testing Destination: Sanaa ---');
  const resSanaa = await fetch('http://localhost:3000/ar/destinations/sanaa');
  const sanaaHtml = await resSanaa.text();
  console.log('Sanaa HTTP status:', resSanaa.status);
  console.log('Has Dar Al-Hajar:', sanaaHtml.includes('دار الحجر'));
  console.log('Has Bab Al-Yaman:', sanaaHtml.includes('باب اليمن'));

  console.log('\n--- 3. Testing Destination: Mukalla ---');
  const resMukalla = await fetch('http://localhost:3000/ar/destinations/mukalla');
  const mukallaHtml = await resMukalla.text();
  console.log('Mukalla HTTP status:', resMukalla.status);
  console.log('Has Quaiti Palace:', mukallaHtml.includes('قصر السلطان القعيطي'));
  console.log('Has Ghuwayzi Fort:', mukallaHtml.includes('حصن الغويزي'));

  console.log('\n--- 4. Testing Destination: Seiyun ---');
  const resSeiyun = await fetch('http://localhost:3000/ar/destinations/seiyun');
  const seiyunHtml = await resSeiyun.text();
  console.log('Seiyun HTTP status:', resSeiyun.status);
  console.log('Has Kathiri Palace:', seiyunHtml.includes('قصر الكثيري'));

  console.log('\n--- 5. Testing Destination: Ibb ---');
  const resIbb = await fetch('http://localhost:3000/ar/destinations/ibb');
  const ibbHtml = await resIbb.text();
  console.log('Ibb HTTP status:', resIbb.status);
  console.log('Has Wadi Banna:', ibbHtml.includes('وادي بنا'));

  console.log('\n--- 6. Testing Blog List ---');
  const resBlog = await fetch('http://localhost:3000/ar/blog');
  const blogHtml = await resBlog.text();
  console.log('Blog HTTP status:', resBlog.status);
  const matchedSlugs = [
    'sanaa-heritage-hotels-guide',
    'aden-tourism-guide-2026',
    'mukalla-beach-resorts-2026',
    'top-10-hotels-sanaa',
    'best-hotels-aden-sea-view',
    'socotra-travel-tips'
  ];
  for (const slug of matchedSlugs) {
    console.log(`Blog contains [${slug}]:`, blogHtml.includes(slug));
  }
}

main().catch(console.error);
