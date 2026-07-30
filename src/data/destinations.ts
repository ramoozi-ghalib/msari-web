export interface Landmark {
  id: string;
  name: string;
  nameEn: string;
  category: 'تاريخي' | 'طبيعي' | 'معماري' | 'ثقافي' | 'ترفيهي';
  image: string;
  description: string;
  locationText: string;
}

export interface DestinationDetail {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  governorate: string;
  governorateEn: string;
  tagline: string;
  heroImage: string;
  overview: {
    history: string;
    climate: string;
    culture: string;
    bestTimeToVisit: string;
  };
  landmarks: Landmark[];
}

export const DESTINATIONS_DATA: Record<string, DestinationDetail> = {
  sanaa: {
    id: 'sanaa',
    slug: 'sanaa',
    name: 'صنعاء',
    nameEn: "Sana'a",
    governorate: 'أمانة العاصمة',
    governorateEn: "Sana'a Governorate",
    tagline: 'مدينة سام وعروس المباني الطينية التاريخية المسجلة في اليونسكو',
    heroImage: '/images/destinations/sanaa.jpg',
    overview: {
      history: 'تُعد صنعاء واحدة من أقدم المدن المأهولة في العالم، وتُعرف تاريخياً بـ "مدينة سام بن نوح". تتميز بعمارتها الفريدة ذات الأبراج الطينية والقمريات الزجاجية الملونة التي يعود تاريخ بعضها إلى آلاف السنين، وتصنفها اليونسكو ضمن مواقع التراث العالمي.',
      climate: 'تتمتع صنعاء بمناخ معتدل ولطيف على مدار العام بفضل موقعها الجغرافي المرتفع في السراة (2300 متر فوق سطح البحر)، حيث تكون صيفاً دافئة ومعتدلة وشتائاً باردة وجافة.',
      culture: 'تشتهر صنعاء بأسواقها القديمة مثل سوق الملح والفضة، وصناعة الجنابي اليمانية الأصيلة، والمجالس الفلكلورية الصنعانية العريقة التي تزخر بالفن والألحان التراثية.',
      bestTimeToVisit: 'من سبتمبر إلى أبريل، حيث الجو لطيف ومثالي للتجول والاستكشاف.',
    },
    landmarks: [
      {
        id: 'dar_al_hajar',
        name: 'دار الحجر (قصر الصخرة)',
        nameEn: 'Dar Al-Hajar',
        category: 'معماري',
        image: '/images/destinations/dar_al_hajar.jpg',
        description: 'تحفة معمارية فريدة شُيدت فوق صخرة غراميتية عالية في وادي ظهر، وتعد رمزاً هندسياً يمنياً شهيراً في العالم.',
        locationText: 'وادي ظهر - شمال صنعاء',
      },
      {
        id: 'old_sanaa',
        name: 'مدينة صنعاء القديمة وباب اليمن',
        nameEn: 'Old City of Sanaa & Bab Al-Yemen',
        category: 'تاريخي',
        image: '/images/destinations/sanaa.jpg',
        description: 'البوابة التاريخية الرئيسية لمدينة صنعاء القديمة المحاطة بأسوار طينية عتيقة تقع داخلها آلاف المنازل الأثرية.',
        locationText: 'قلب مدينة صنعاء القديمة',
      },
    ],
  },
  aden: {
    id: 'aden',
    slug: 'aden',
    name: 'عدن',
    nameEn: 'Aden',
    governorate: 'محافظة عدن',
    governorateEn: 'Aden Governorate',
    tagline: 'ثغر اليمن الباسم وعروس البحر الأحمر وخليج عدن',
    heroImage: '/images/destinations/aden.jpg',
    overview: {
      history: 'تعد عدن من أهم الموانئ التاريخية والتجارية على مستوى الشرق الأوسط والعالم، بفضل موقعها الاستراتيجي على باب المندب. تتميز بتاريخ حافل بالنشاط التجاري والثقافي المتنوع.',
      climate: 'مناخ ساحلي دافئ صيفاً ومعتدل ولطيف في فصل الشتاء مع نسائم البحر المنعشة.',
      culture: 'تتميز عدن بطابعها المدني المفتوح، ومأكولاتها البحرية الشهيرة، والجسور التاريخية، والمقاهي الشعبية المتنوعة على شواطئ صيرة والغدير.',
      bestTimeToVisit: 'من نوفمبر إلى مارس للاستمتاع بأجواء البحر الساحرة والمناخ المعتدل.',
    },
    landmarks: [
      {
        id: 'sira_fortress',
        name: 'قلعة صيرة التاريخية',
        nameEn: 'Sira Fortress',
        category: 'تاريخي',
        image: '/images/destinations/sira_castle.jpg',
        description: 'قلعة عسكرية أثرية تقف على جزيرة صيرة البركانية، وكانت حارساً تاريخياً لميناء عدن ضد الحملات الغازية.',
        locationText: 'حي كرتير - صيرة',
      },
      {
        id: 'tawila_tanks',
        name: 'صهاريج عدن (صهاريج طويلة)',
        nameEn: 'Cisterns of Tawila',
        category: 'معماري',
        image: '/images/destinations/aden.jpg',
        description: 'شبكة صهاريج مائية هندسية نادرة نحتت في مضيق جبل شمسان لجمع مياه الأمطار لحماية المدينة.',
        locationText: 'جبل شمسان - كرتير',
      },
    ],
  },
  hodeidah: {
    id: 'hodeidah',
    slug: 'hodeidah',
    name: 'الحديدة',
    nameEn: 'Al-Hudaydah',
    governorate: 'محافظة الحديدة',
    governorateEn: 'Hodeidah Governorate',
    tagline: 'عروس البحر الأحمر وبوابة اليمن الغربية على ميناء التجارة التاريخي',
    heroImage: '/images/destinations/hodeidah.jpg',
    overview: {
      history: 'تعتبر الحديدة من أهم وأعرق المدن المينائية والساحلية في اليمن والمنطقة، وتعتبر عروس البحر الأحمر والحاضرة التاريخية للتجارة والزراعة في إقليم تهامة. يمتد تاريخها لعقود طوال في احتضان ميناء اليمن الرئيسي والأسواق التراثية.',
      climate: 'مناخ ساحلي تهامي دافئ صيفاً ومعتدل ولطيف للغاية في فصل الشتاء مع نسائم البحر الأحمر الرطبة.',
      culture: 'تتميز الحديدة بالثقافة التهامية الأصيلة، والمأكولات البحرية والسمك المخبازة التهامية الشهيرة، وفنون الرقص الشعبي التهامي وتراث القش والمصنوعات اليدوية.',
      bestTimeToVisit: 'من نوفمبر إلى مارس حيث تكون درجات الحرارة معتدلة ومثالية للتنزه على الكورنيش والاستمتاع بالشواطئ.',
    },
    landmarks: [
      {
        id: 'hodeidah_corniche',
        name: 'كورنيش الحديدة الساحلي',
        nameEn: 'Hodeidah Red Sea Corniche',
        category: 'طبيعي',
        image: '/images/destinations/hodeidah_corniche.jpg',
        description: 'شريط ساحلي طويل ممتد على البحر الأحمر يمتاز بنسائمه اللطيفة وجلساته العائلية وغروب الشمس الساحر.',
        locationText: 'شاطئ مدينة الحديدة',
      },
      {
        id: 'al_qal_yah',
        name: 'قلعة القلعية التاريخية وباب المشرف',
        nameEn: 'Al-Qal\'yah Historical Castle',
        category: 'تاريخي',
        image: '/images/destinations/hodeidah.jpg',
        description: 'قلعة تاريخية عتيقة تمثل الحصن الدفاعي التاريخي لمدينة الحديدة المطل على البحر الأحمر.',
        locationText: 'وسط مدينة الحديدة القديمة',
      },
    ],
  },
  mukalla: {
    id: 'mukalla',
    slug: 'mukalla',
    name: 'المكلا',
    nameEn: 'Mukalla',
    governorate: 'محافظة حضرموت',
    governorateEn: 'Hadramout Governorate',
    tagline: 'عروس بحر العرب وحاضرة حضرموت الجميلة',
    heroImage: '/images/destinations/mukalla.jpg',
    overview: {
      history: 'المكلا هي عاصمة محافظة حضرموت وأكبر مدنها الساحلية. تمتاز ببيوتها البيضاء الناصعة وقصورها التاريخية المطلة على بحر العرب.',
      climate: 'مناخ ساحلي استوائي دافئ، يتخلله ربيع معتدل وأجواء بحرية لطيفة طوال أشهر الشتاء.',
      culture: 'تشتهر المكلا بالفنون الحضرمية الأصيلة، والدان الحضرمي، والمأكولات الشهيرة مثل اللخم والصيد الطازج ولحوم المندي.',
      bestTimeToVisit: 'من أكتوبر إلى مارس للاستمتاع بخور المكلا وفعاليات مهرجانات البلدة.',
    },
    landmarks: [
      {
        id: 'ghuwayzi_fort',
        name: 'حصن الغويزي',
        nameEn: 'Al-Ghuwayzi Fort',
        category: 'تاريخي',
        image: '/images/destinations/mukalla.jpg',
        description: 'حصن أثري بارز شُيد على صخرة مرتفعة عند المدخل الشمالي للمدينة لرحلات القوافل التاريخية.',
        locationText: 'مدخل مدينة المكلا',
      },
    ],
  },
  ibb: {
    id: 'ibb',
    slug: 'ibb',
    name: 'إب',
    nameEn: 'Ibb',
    governorate: 'محافظة إب',
    governorateEn: 'Ibb Governorate',
    tagline: 'المدينة الخضراء وعاصمة السياحة الطبيعية في اليمن',
    heroImage: '/images/destinations/ibb.jpg',
    overview: {
      history: 'تلقب إب بـ "المدينة الخضراء" بفضل مدرجاتها الزراعية الجبلية الخصبة، وتاريخها العريق المرتبط بالدولة الصليحية والملكة أروى بنت أحمد الصليحي.',
      climate: 'تتمتع بأعلى معدل هطول للأمطار في المنطقة مع مناخ معتدل ومدرجات خضراء تنبض بالحياة خصوصاً في الصيف والربيع.',
      culture: 'تتميز بجمال طبيعتها الفتاكة، والقلاع الجبلية الشامخة، والعادات والتقاليد الزراعية العريقة.',
      bestTimeToVisit: 'من مايو إلى سبتمبر لمشاهدة الأمطار والمدرجات الخضراء في أوج جمالها.',
    },
    landmarks: [
      {
        id: 'ibb_terraces',
        name: 'المدرجات الخضراء وشلالات وادي بنا',
        nameEn: 'Ibb Green Terraces',
        category: 'طبيعي',
        image: '/images/destinations/ibb.jpg',
        description: 'مناظر طبيعية ساحرة ومدرجات جبلية خضراء تعانق السحاب وتشتهر بشلالاتها العذبة.',
        locationText: 'مرتفعات إب ووديانها',
      },
    ],
  },
};

/**
 * Normalizes a city slug or name to look up in DESTINATIONS_DATA
 */
export function getDestinationData(slugOrName: string): DestinationDetail | undefined {
  if (!slugOrName) return undefined;
  const key = slugOrName.toLowerCase().trim();
  
  if (DESTINATIONS_DATA[key]) return DESTINATIONS_DATA[key];
  
  // Match by Arabic name or alternative slugs
  const norm = (s: string) => s.replace(/[أإآا]/g, 'ا').replace(/ة/g, 'ه').trim().toLowerCase();
  const targetNorm = norm(key);

  if (targetNorm.includes('حديد') || key.includes('huday') || key.includes('hodei')) {
    return DESTINATIONS_DATA['hodeidah'];
  }

  const foundKey = Object.keys(DESTINATIONS_DATA).find(k => {
    const item = DESTINATIONS_DATA[k];
    return norm(item.name).includes(targetNorm) || norm(item.slug).includes(targetNorm);
  });

  return foundKey ? DESTINATIONS_DATA[foundKey] : undefined;
}
