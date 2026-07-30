-- =============================================================================
-- Msari Web — Seed Data FIXED
-- BUG FIX: AmenityCategory enum values must be UPPERCASE (GENERAL, DINING, etc.)
--           The original seed-data.sql used lowercase which fails PostgreSQL enum check
-- الاستخدام: Supabase Dashboard → SQL Editor → Paste → Run
-- =============================================================================

-- ─── PHASE 1: TRUNCATE ────────────────────────────────────────────────────────
TRUNCATE TABLE room_amenities, hotel_amenities, room_images, hotel_images,
               rooms, reviews, bookings, discounts, favorites,
               hotels, amenities, cities, offers CASCADE;

-- ─── PHASE 2: المرافق (UPPERCASE enum values — البق الأصلي كان lowercase) ───
INSERT INTO amenities (id, "nameAr", "nameEn", icon, category) VALUES
  ('am_wifi',     'واي فاي مجاني',    'Free WiFi',        'wifi',           'GENERAL'),
  ('am_park',     'موقف سيارات',      'Parking',          'car',            'GENERAL'),
  ('am_rest',     'مطعم',             'Restaurant',       'utensils',       'DINING'),
  ('am_pool',     'مسبح',             'Swimming Pool',    'waves',          'SPORT'),
  ('am_gym',      'صالة رياضية',     'Gym',              'dumbbell',       'SPORT'),
  ('am_ac',       'تكييف هواء',      'Air Conditioning', 'wind',           'ROOM'),
  ('am_room_svc', 'خدمة الغرف',      'Room Service',     'concierge-bell', 'GENERAL'),
  ('am_recep',    'استقبال 24/7',    '24/7 Reception',   'clock',          'GENERAL'),
  ('am_biz',      'مركز أعمال',      'Business Center',  'briefcase',      'BUSINESS'),
  ('am_spa',      'سبا',              'Spa',              'sparkles',       'WELLNESS'),
  ('am_brkfst',   'إفطار مجاني',     'Free Breakfast',   'coffee',         'DINING'),
  ('am_safe',     'خزنة أمان',       'Safe Box',         'lock',           'ROOM'),
  ('am_tv',       'تلفزيون',         'TV',               'tv',             'ROOM'),
  ('am_transfer', 'خدمة نقل المطار','Airport Transfer',  'plane',          'GENERAL')
ON CONFLICT (id) DO NOTHING;

-- ─── PHASE 3: المدن ───────────────────────────────────────────────────────────
INSERT INTO cities (id, "nameAr", "nameEn", "governorateAr", "governorateEn", "imageUrl", "isActive") VALUES
  ('city_sanaa',    'صنعاء',   'Sana''a',    'أمانة العاصمة','Sana''a Capital','https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=800',true),
  ('city_aden',     'عدن',     'Aden',       'عدن',          'Aden',           'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800',true),
  ('city_hadh',     'حضرموت', 'Hadhramaut', 'حضرموت',       'Hadhramaut',     'https://images.unsplash.com/photo-1466442929976-97f336a657be?q=80&w=800',true),
  ('city_mukalla',  'المكلا',  'Al-Mukalla', 'حضرموت',       'Hadhramaut',     'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800',true),
  ('city_taiz',     'تعز',    'Ta''iz',      'تعز',          'Ta''iz',         'https://images.unsplash.com/photo-1583418855835-06e8b6f39ecf?q=80&w=800',true),
  ('city_hudaydah', 'الحديدة','Hudaydah',   'الحديدة',      'Hudaydah',       'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800',true)
ON CONFLICT (id) DO NOTHING;

-- ─── PHASE 4: الفنادق ─────────────────────────────────────────────────────────
INSERT INTO hotels (
  id, slug, type, "nameAr", "nameEn", "descriptionAr", "descriptionEn",
  address, stars, rating, "reviewCount", "priceFrom", currency,
  "thumbnailUrl", "isFeatured", "isActive", "cityId"
) VALUES
  (
    'h_movenpick','movenpick-hotel-sanaa','LOCAL',
    'فندق موفنبيك صنعاء','Movenpick Hotel Sana''a',
    'يقع فندق موفنبيك في قلب العاصمة صنعاء ويوفر إقامة فاخرة مع إطلالات رائعة على المدينة القديمة.',
    'Movenpick Hotel is located in the heart of the Yemeni capital offering luxurious accommodation with stunning views.',
    'شارع الستين، صنعاء',5,4.8,124,120,'USD',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
    true,true,'city_sanaa'
  ),
  (
    'h_hilton','hilton-sanaa','LOCAL',
    'فندق هيلتون صنعاء','Hilton Sana''a',
    'فندق هيلتون صنعاء وجهة مثالية للمسافرين من رجال الأعمال والسياح.',
    'Hilton Sana''a is the perfect destination for business and leisure travelers.',
    'حي السبعين، صنعاء',5,4.6,89,95,'USD',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop',
    true,true,'city_sanaa'
  ),
  (
    'h_sheraton','sheraton-sanaa-resort','LOCAL',
    'شيراتون صنعاء','Sheraton Sana''a Resort',
    'يتميز شيراتون صنعاء بموقعه الاستراتيجي وتصميمه المعماري الفريد الذي يجمع بين الطراز اليمني التقليدي والحداثة.',
    'Sheraton Sana''a features a unique architectural design combining traditional Yemeni style with modernity.',
    'حي سنحان، صنعاء',4,4.3,67,75,'USD',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe49c?q=80&w=800&auto=format&fit=crop',
    false,true,'city_sanaa'
  ),
  (
    'h_qamar','qamar-aden-hotel','LOCAL',
    'فندق قمر عدن','Qamar Aden Hotel',
    'فندق قمر عدن المطل على خليج عدن الساحر، يوفر إقامة لا تُنسى مع إطلالات بانورامية على البحر العربي.',
    'Qamar Aden Hotel overlooking the charming Aden Bay, offers an unforgettable stay with panoramic views.',
    'كريتر، عدن',4,4.5,98,80,'USD',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop',
    true,true,'city_aden'
  ),
  (
    'h_saif','saif-aden-hotel','LOCAL',
    'فندق سيف عدن','Saif Aden Hotel',
    'يقع فندق سيف عدن في منطقة المعلا الحيوية، ويتميز بأسعاره التنافسية وخدماته الراقية.',
    'Located in the vibrant Al-Mualla area, Saif Aden Hotel stands out for its competitive prices.',
    'المعلا، عدن',3,4.1,45,45,'USD',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800&auto=format&fit=crop',
    false,true,'city_aden'
  ),
  (
    'h_seyun','seyun-almukalla-hotel','LOCAL',
    'فندق سيفان المكلا','Seyun Al-Mukalla Hotel',
    'فندق سيفان المطل على خليج المكلا، أفضل وجهة للاستمتاع بالطبيعة الساحلية الخلابة وأجواء حضرموت الأصيلة.',
    'Seyun Hotel overlooking Al-Mukalla Bay, the best destination to enjoy the stunning coastal nature.',
    'شاطئ المكلا، حضرموت',4,4.4,62,70,'USD',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=800&auto=format&fit=crop',
    true,true,'city_mukalla'
  ),
  (
    'h_eastern','eastern-taiz-hotel','LOCAL',
    'فندق إيسترن تعز','Eastern Ta''iz Hotel',
    'فندق إيسترن في قلب مدينة تعز الجبلية الخلابة، يوفر أجواءً هادئة ومريحة مع خدمات متكاملة.',
    'Eastern Hotel in the heart of the mountainous Ta''iz city, provides a calm and comfortable atmosphere.',
    'وسط المدينة، تعز',3,4.0,38,40,'USD',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop',
    false,true,'city_taiz'
  ),
  (
    'h_seashore','hudaydah-seashore-hotel','LOCAL',
    'فندق الحديدة سيشور','Al-Hudaydah Seashore Hotel',
    'فندق الحديدة سيشور الرائد يطل على البحر الأحمر مباشرة، يوفر تجربة بحرية فريدة.',
    'Al-Hudaydah Seashore Hotel directly overlooks the Red Sea, offering a unique maritime experience.',
    'كورنيش الحديدة، الحديدة',3,4.2,54,50,'USD',
    'https://images.unsplash.com/photo-1517840901100-8179e982acb7?q=80&w=800&auto=format&fit=crop',
    false,true,'city_hudaydah'
  )
ON CONFLICT (id) DO NOTHING;

-- ─── PHASE 5: صور الفنادق ─────────────────────────────────────────────────────
INSERT INTO hotel_images (id, "hotelId", url, "order") VALUES
  ('hi_1',  'h_movenpick', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop', 0),
  ('hi_2',  'h_movenpick', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop', 1),
  ('hi_3',  'h_movenpick', 'https://images.unsplash.com/photo-1631049035182-249067d7618e?q=80&w=1200&auto=format&fit=crop', 2),
  ('hi_4',  'h_hilton',    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop', 0),
  ('hi_5',  'h_hilton',    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop', 1),
  ('hi_6',  'h_sheraton',  'https://images.unsplash.com/photo-1551882547-ff40c63fe49c?q=80&w=1200&auto=format&fit=crop', 0),
  ('hi_7',  'h_qamar',     'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop', 0),
  ('hi_8',  'h_qamar',     'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop', 1),
  ('hi_9',  'h_saif',      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200&auto=format&fit=crop', 0),
  ('hi_10', 'h_seyun',     'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200&auto=format&fit=crop', 0),
  ('hi_11', 'h_seyun',     'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200&auto=format&fit=crop', 1),
  ('hi_12', 'h_eastern',   'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop', 0),
  ('hi_13', 'h_seashore',  'https://images.unsplash.com/photo-1517840901100-8179e982acb7?q=80&w=1200&auto=format&fit=crop', 0)
ON CONFLICT (id) DO NOTHING;

-- ─── PHASE 6: مرافق الفنادق ───────────────────────────────────────────────────
INSERT INTO hotel_amenities ("hotelId", "amenityId") VALUES
  ('h_movenpick','am_wifi'), ('h_movenpick','am_park'), ('h_movenpick','am_rest'),
  ('h_movenpick','am_pool'), ('h_movenpick','am_gym'),  ('h_movenpick','am_ac'),
  ('h_movenpick','am_room_svc'), ('h_movenpick','am_recep'), ('h_movenpick','am_biz'),
  ('h_movenpick','am_transfer'), ('h_movenpick','am_spa'),
  ('h_hilton','am_wifi'), ('h_hilton','am_park'), ('h_hilton','am_rest'),
  ('h_hilton','am_pool'), ('h_hilton','am_ac'),   ('h_hilton','am_room_svc'),
  ('h_hilton','am_recep'), ('h_hilton','am_brkfst'),
  ('h_sheraton','am_wifi'), ('h_sheraton','am_park'), ('h_sheraton','am_rest'),
  ('h_sheraton','am_ac'),   ('h_sheraton','am_room_svc'), ('h_sheraton','am_recep'),
  ('h_qamar','am_wifi'), ('h_qamar','am_park'), ('h_qamar','am_rest'),
  ('h_qamar','am_pool'), ('h_qamar','am_ac'),   ('h_qamar','am_room_svc'),
  ('h_qamar','am_recep'), ('h_qamar','am_brkfst'), ('h_qamar','am_transfer'),
  ('h_saif','am_wifi'), ('h_saif','am_park'), ('h_saif','am_rest'),
  ('h_saif','am_ac'),   ('h_saif','am_recep'), ('h_saif','am_brkfst'),
  ('h_seyun','am_wifi'), ('h_seyun','am_park'), ('h_seyun','am_rest'),
  ('h_seyun','am_pool'), ('h_seyun','am_ac'),   ('h_seyun','am_room_svc'), ('h_seyun','am_recep'),
  ('h_eastern','am_wifi'), ('h_eastern','am_park'), ('h_eastern','am_rest'),
  ('h_eastern','am_ac'),   ('h_eastern','am_recep'),
  ('h_seashore','am_wifi'), ('h_seashore','am_park'), ('h_seashore','am_rest'),
  ('h_seashore','am_ac'),   ('h_seashore','am_recep'), ('h_seashore','am_brkfst')
ON CONFLICT DO NOTHING;

-- ─── PHASE 7: الغرف ───────────────────────────────────────────────────────────
INSERT INTO rooms (id, "hotelId", "nameAr", "nameEn", "descriptionAr", capacity, "pricePerNight", "isAvailable") VALUES
  ('r_mov_std', 'h_movenpick', 'غرفة ستاندرد',      'Standard Room',     'غرفة مريحة مع إطلالة على الحديقة',           2, 120, true),
  ('r_mov_dlx', 'h_movenpick', 'غرفة ديلوكس',      'Deluxe Room',       'غرفة فاخرة مع إطلالة على المدينة',           2, 160, true),
  ('r_mov_ste', 'h_movenpick', 'جناح تنفيذي',      'Executive Suite',   'جناح واسع مع صالة جلوس منفصلة',             4, 280, true),
  ('r_hil_sup', 'h_hilton',    'غرفة سوبيريور',    'Superior Room',     'غرفة أنيقة مع مرافق حديثة',                 2,  95, true),
  ('r_hil_kin', 'h_hilton',    'غرفة كينج ديلوكس', 'King Deluxe Room',  'غرفة فاخرة مع سرير كينج',                   2, 140, true),
  ('r_she_cls', 'h_sheraton',  'غرفة كلاسيك',      'Classic Room',      'غرفة بتصميم يمني تقليدي',                   2,  75, true),
  ('r_she_pre', 'h_sheraton',  'غرفة برميوم',      'Premium Room',      'غرفة فاخرة مطلة على المسبح',                3, 110, true),
  ('r_qam_sea', 'h_qamar',     'غرفة إطلالة بحرية','Sea View Room',     'غرفة رائعة مع إطلالة مباشرة على البحر',     2,  80, true),
  ('r_qam_pnt', 'h_qamar',     'جناح بينتهاوس',    'Penthouse Suite',   'جناح فاخر في الطابق الأخير مع تراس خاص',   4, 200, true),
  ('r_sai_sgl', 'h_saif',      'غرفة مفردة',        'Single Room',       'غرفة اقتصادية مريحة',                       1,  45, true),
  ('r_sai_dbl', 'h_saif',      'غرفة مزدوجة',      'Double Room',       'غرفة مزدوجة لشخصين',                        2,  65, true),
  ('r_sey_bay', 'h_seyun',     'غرفة إطلالة خليج', 'Bay View Room',     'غرفة مع إطلالة رائعة على الخليج',           2,  70, true),
  ('r_sey_fam', 'h_seyun',     'غرفة فاميلي',      'Family Room',       'غرفة مناسبة للعائلات مع سريرين',            4, 110, true),
  ('r_eas_std', 'h_eastern',   'غرفة ستاندرد',      'Standard Room',     'غرفة مريحة بإطلالة جبلية',                  2,  40, true),
  ('r_eas_dlx', 'h_eastern',   'غرفة ديلوكس',      'Deluxe Room',       'غرفة فاخرة بمرافق كاملة',                   2,  60, true),
  ('r_sea_sea', 'h_seashore',  'غرفة بحرية',        'Sea Room',          'غرفة مطلة على البحر الأحمر',                2,  50, true),
  ('r_sea_fam', 'h_seashore',  'جناح عائلي',        'Family Suite',      'جناح مناسب للعائلات',                        5,  95, true)
ON CONFLICT (id) DO NOTHING;

-- ─── PHASE 8: مرافق الغرف ─────────────────────────────────────────────────────
INSERT INTO room_amenities ("roomId", "amenityId") VALUES
  ('r_mov_std','am_wifi'), ('r_mov_std','am_ac'), ('r_mov_std','am_tv'),
  ('r_mov_dlx','am_wifi'), ('r_mov_dlx','am_ac'), ('r_mov_dlx','am_tv'), ('r_mov_dlx','am_room_svc'),
  ('r_mov_ste','am_wifi'), ('r_mov_ste','am_ac'), ('r_mov_ste','am_tv'), ('r_mov_ste','am_room_svc'), ('r_mov_ste','am_biz'),
  ('r_hil_sup','am_wifi'), ('r_hil_sup','am_ac'), ('r_hil_sup','am_tv'),
  ('r_hil_kin','am_wifi'), ('r_hil_kin','am_ac'), ('r_hil_kin','am_tv'), ('r_hil_kin','am_room_svc'),
  ('r_she_cls','am_wifi'), ('r_she_cls','am_ac'), ('r_she_cls','am_tv'),
  ('r_she_pre','am_wifi'), ('r_she_pre','am_ac'), ('r_she_pre','am_tv'), ('r_she_pre','am_room_svc'),
  ('r_qam_sea','am_wifi'), ('r_qam_sea','am_ac'), ('r_qam_sea','am_tv'),
  ('r_qam_pnt','am_wifi'), ('r_qam_pnt','am_ac'), ('r_qam_pnt','am_tv'), ('r_qam_pnt','am_room_svc'),
  ('r_sai_sgl','am_wifi'), ('r_sai_sgl','am_ac'), ('r_sai_sgl','am_tv'),
  ('r_sai_dbl','am_wifi'), ('r_sai_dbl','am_ac'), ('r_sai_dbl','am_tv'),
  ('r_sey_bay','am_wifi'), ('r_sey_bay','am_ac'), ('r_sey_bay','am_tv'),
  ('r_sey_fam','am_wifi'), ('r_sey_fam','am_ac'), ('r_sey_fam','am_tv'), ('r_sey_fam','am_room_svc'),
  ('r_eas_std','am_wifi'), ('r_eas_std','am_ac'),
  ('r_eas_dlx','am_wifi'), ('r_eas_dlx','am_ac'), ('r_eas_dlx','am_tv'),
  ('r_sea_sea','am_wifi'), ('r_sea_sea','am_ac'), ('r_sea_sea','am_tv'),
  ('r_sea_fam','am_wifi'), ('r_sea_fam','am_ac'), ('r_sea_fam','am_tv'), ('r_sea_fam','am_room_svc')
ON CONFLICT DO NOTHING;

-- ─── PHASE 9: العروض ──────────────────────────────────────────────────────────
INSERT INTO offers (id, "titleAr", "titleEn", "imageUrl", link, "isActive", "order") VALUES
  ('offer_summer', 'عروض الصيف — وفّر حتى 30%', 'Summer Deals — Save up to 30%',
   'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&auto=format&fit=crop',
   '/hotels', true, 1),
  ('offer_family', 'باقات عائلية مميزة', 'Special Family Packages',
   'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop',
   '/hotels', true, 2)
ON CONFLICT (id) DO NOTHING;

-- ─── PHASE 10: التحقق النهائي ─────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM cities)        AS cities_count,
  (SELECT COUNT(*) FROM hotels)        AS hotels_count,
  (SELECT COUNT(*) FROM amenities)     AS amenities_count,
  (SELECT COUNT(*) FROM rooms)         AS rooms_count,
  (SELECT COUNT(*) FROM hotel_images)  AS hotel_images_count,
  (SELECT COUNT(*) FROM offers)        AS offers_count;

SELECT id, slug, "isActive", "cityId" FROM hotels ORDER BY id;
