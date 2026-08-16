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
  taglineEn?: string;
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
    tagline: 'مدينة سام وعاصمة التاريخ والحضارة المعمارية الفريدة في التراث العالمي',
    heroImage: '/images/destinations/sanaa.jpg',
    overview: {
      history: 'تُعد صنعاء واحدة من أقدم المدن المأهولة في التاريخ البشري، وتُعرف بـ "مدينة سام بن نوح". تتميز بنمطها المعماري البرجي الاستثنائي المبني بالحجر والآجر المحروق والمزين بالقمريات الجبسية الملونة والنقوش الهندسية الدقيقة، وهي مدرجة ضمن قائمة مواقع التراث العالمي لليونسكو.',
      climate: 'تتمتع صنعاء بمناخ جبلي لطيف ومعتدل طوال العام بفضل ارتفاعها لأكثر من 2200 متر فوق سطح البحر، وتتميز بصيف معتدل تتخلله أمطار موسمية منعشة وشتاء جاف ومنعش.',
      culture: 'حاضرة التراث والفنون والفلكلور اليمني العريق، وتزخر بأسواق الحرف اليدوية كصناعة الجنابي الصنعانية الأصيلة وصياغة الفضة والبهارات في سوق الملح ومجالس الغناء والتوشيح التراثي.',
      bestTimeToVisit: 'من سبتمبر إلى مايو حيث تكون درجات الحرارة معتدلة ومثالية للتجول واستكشاف المعالم التاريخية.',
    },
    landmarks: [
      {
        id: 'dar_al_hajar',
        name: 'دار الحجر (قصر الصخرة في وادي ظهر)',
        nameEn: 'Dar Al-Hajar (Rock Palace)',
        category: 'معماري',
        image: '/images/destinations/dar_al_hajar.jpg',
        description: 'أيقونة معمارية يمنية شيدت بعبقرية هندسية فوق قمة صخرة طبيعية شاهقة في وادي ظهر الخصيب.',
        locationText: 'وادي ظهر - شمال صنعاء',
      },
      {
        id: 'old_sanaa',
        name: 'مدينة صنعاء القديمة وباب اليمن',
        nameEn: 'Old City of Sanaa & Bab Al-Yaman',
        category: 'تاريخي',
        image: '/images/destinations/bab_al_yaman.jpg',
        description: 'البوابة التاريخية العتيقة لمدينة صنعاء القديمة وأسواقها التراثية ومنازلها البرجية المحفوظة عبر القرون.',
        locationText: 'قلب صنعاء القديمة',
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
    tagline: 'عروس البحر العربي وثغر اليمن الباسم بشواطئها الساحرة وموانئها التاريخية',
    heroImage: '/images/destinations/aden.jpg',
    overview: {
      history: 'تعتبر عدن من أقدم وأعرق الموانئ الطبيعية والتجارية في العالم، حيث تقع داخل فوهة بركانية قديمة تشرف على مضيق باب المندب وخليج عدن. شكلت عبر آلاف السنين محطة رئيسية على طريق الحرير والبخور والتجارة البحرية الدولية.',
      climate: 'مناخ ساحلي دافئ واستوائي يلطفه نسيم البحر العليل، وتكون الأجواء معتدلة ومنعشة جداً خلال فصلي الخريف والشتاء.',
      culture: 'تتميز عدن بطابع مدني مفتوح ومتنوع يجمع بين التراث البحري العريق والأنشطة الترفيهية والمأكولات البحرية الطازجة كالصيادية والمخبازة، إلى جانب مقاهي كورنيش صيرة وخور مكسر.',
      bestTimeToVisit: 'من أكتوبر إلى أبريل حيث تكون درجات الحرارة معتدلة ومثالية للسباحة والرحلات البحرية والتنزه الشاطئي.',
    },
    landmarks: [
      {
        id: 'tawila_tanks',
        name: 'صهاريج الطويلة التاريخية',
        nameEn: 'Cisterns of Tawila',
        category: 'معماري',
        image: '/images/destinations/tawila_tanks.jpg',
        description: 'منظومة مائية هندسية عملاقة منحوتة في صخور جبل شمسان البركانية لجمع وتصريف مياه الأمطار العذبة لحماية وتغذية المدينة.',
        locationText: 'وادي الطويلة - كريتر',
      },
      {
        id: 'sira_fortress',
        name: 'قلعة صيرة التاريخية',
        nameEn: 'Sira Fortress',
        category: 'تاريخي',
        image: '/images/destinations/sira_castle.jpg',
        description: 'حصن دفاعي أثري شامخ على جزيرة صيرة البركانية يوفر إطلالة بانورامية ساحرة على ميناء وخليج عدن.',
        locationText: 'جزيرة صيرة - كريتر',
      },
      {
        id: 'gold_mohur_beach',
        name: 'ساحل جولد مور وقوس خليج الفيل',
        nameEn: 'Gold Mohur & Elephant Rock Bay',
        category: 'طبيعي',
        image: '/images/destinations/gold_mohur.jpg',
        description: 'شاطئ رملي ذهبي رائع يمتاز بتكوينه الصخري البركاني الفريد على شكل فيل يمتد داخل مياه البحر العربي الصافية.',
        locationText: 'التواهي - ساحل جولد مور',
      },
    ],
  },
  mukalla: {
    id: 'mukalla',
    slug: 'mukalla',
    name: 'المكلا',
    nameEn: 'Al Mukalla',
    governorate: 'محافظة حضرموت',
    governorateEn: 'Hadramout Governorate',
    tagline: 'عروس بحر العرب ودرة شواطئ حضرموت الذهبية والقصور السلاطينية',
    heroImage: '/images/destinations/mukalla.jpg',
    overview: {
      history: 'المكلا هي عاصمة حضرموت الساحلية وميناؤها التاريخي الأبرز. تمتاز بمبانيها البيضاء الناصعة وقصورها السلاطينية ذات الطراز المعماري الهندي والإسلامي الفريد المطل على مياه بحر العرب.',
      climate: 'مناخ ساحلي استوائي دافئ يتحول إلى أجواء بحرية لطيفة ومعتدلة طوال أشهر الخريف والشتاء، خصوصاً خلال موسم البلدة السياحي.',
      culture: 'عاصمة الأدب والدان الحضرمي، وتشتهر بأسواقها التراثية لبيع العسل الدوعني الفاخر والمشغولات الفضية والحرف البحرية التقليدية.',
      bestTimeToVisit: 'من أكتوبر إلى مارس للاستمتاع بخور المكلا والشواطئ ومهرجانات التراث الحضرمي.',
    },
    landmarks: [
      {
        id: 'quaiti_palace',
        name: 'قصر السلطان القعيطي (متحف المكلا)',
        nameEn: 'Sultan Al-Qu\'aiti Palace Museum',
        category: 'تاريخي',
        image: '/images/destinations/quaiti_palace.jpg',
        description: 'تحفة معمارية سلاطينية تجمع بين الفن الهندي والعربي وتشرف مباشرة على خور وميناء المكلا القديم.',
        locationText: 'كورنيش المكلا القديم',
      },
      {
        id: 'ghuwayzi_fort',
        name: 'حصن الغويزي التاريخي',
        nameEn: 'Al-Ghuwayzi Fort',
        category: 'تاريخي',
        image: '/images/destinations/ghuwayzi_fort.jpg',
        description: 'حصن عسكري أثري فريد شيد على قمة صخرة طبيعية مرتفعة لحماية المدخل الشمالي لمدينة المكلا وقوافلها التجارية.',
        locationText: 'المدخل الشرقي لمدينة المكلا',
      },
    ],
  },
  seiyun: {
    id: 'seiyun',
    slug: 'seiyun',
    name: 'سيئون',
    nameEn: 'Seiyun',
    governorate: 'محافظة حضرموت',
    governorateEn: 'Hadramout Governorate',
    tagline: 'مدينة الطويلة وعاصمة وادي حضرموت وقصر الكثيري الطيني المهيب',
    heroImage: '/images/destinations/seiyun.jpg',
    overview: {
      history: 'سيئون هي حاضرة وادي حضرموت التاريخية، وتشتهر بقصر الكثيري الأبيض الذي يُعد أحد أضخم المباني الطينية في العالم. تعود أهميتها لكونها مركزاً للتجارة والعلم والقوافل التاريخية في قلب وادي حضرموت الخصيب.',
      climate: 'مناخ صحراوي جاف يتميز بأيام مشمسة دافئة وأمسيات لطيفة، ويكون الطقس معتدلاً ومريحاً للغاية في فصل الشتاء.',
      culture: 'تراث وادي حضرموت الأصيل ومزارع النخيل الباسقة، وتشتهر بصناعة الفخار والمشغولات الخوصية وأجود أنواع تمور الوادي والأهازيج الشعبية.',
      bestTimeToVisit: 'من نوفمبر إلى مارس للاستمتاع باعتدال الطقس وزيارة القصور والمعالم الأثرية المحيطة.',
    },
    landmarks: [
      {
        id: 'kathiri_palace',
        name: 'قصر الكثيري (قصر سيئون الأبيض)',
        nameEn: 'Kathiri Palace (Al-Kathiri Sultanate Palace)',
        category: 'معماري',
        image: '/images/destinations/seiyun.jpg',
        description: 'أحد أكبر وأجمل القصور والمباني الطينية في العالم، تميزه عمارته البيضاء الناصعة وأبراجه المتناسقة بين واحات النخيل.',
        locationText: 'وسط مدينة سيئون - وادي حضرموت',
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
    tagline: 'اللواء الأخضر وعاصمة السياحة الطبيعية وجنة الشلالات والمدرجات الجبلية',
    heroImage: '/images/destinations/ibb.jpg',
    overview: {
      history: 'تلقب محافظة إب بـ "اللواء الأخضر" لخصوبة أراضيها ومدرجاتها الجبلية الخلابة التي تحتضن قرى تاريخية معلقة وقلاعاً أثرية شامخة شيدت في عهد الدولة الصليحية والملكة أروى بنت أحمد.',
      climate: 'أكثر مناطق اليمن هطولاً للأمطار واعتدالاً، حيث تكتسي جبالها وسهولها بالخضرة الدائمة وضباب القمم الساحر على مدار أشهر الصيف والربيع.',
      culture: 'حياة ريفية جبلية أصيلة، كرم ضيافة وتنوع زراعي للمحاصيل والبن والفواكه، إلى جانب الأسواق الأسبوعية الشعبية في القرى والوديان.',
      bestTimeToVisit: 'من مايو إلى سبتمبر لمشاهدة مواسم الأمطار والشلالات المتدفقة والمدرجات الخضراء في أبهى حللها.',
    },
    landmarks: [
      {
        id: 'wadi_banna',
        name: 'شلالات ومدرجات وادي بنا ووادي الدور',
        nameEn: 'Wadi Banna Waterfalls & Terraces',
        category: 'طبيعي',
        image: '/images/destinations/wadi_banna.jpg',
        description: 'شلالات مياه طبيعية تتدفق بين المدرجات الزراعية الخضراء والقرى الجبلية المعلقة التي تعانق السحاب.',
        locationText: 'أرياف محافظة إب',
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
      history: 'الحديدة هي الحاضرة التاريخية لسهل تهامة وميناء اليمن الرئيسي على البحر الأحمر، وتمتاز بأسواقها العريقة وتاريخها التجاري والبحري الممتد لقرون.',
      climate: 'مناخ ساحلي تهامي دافئ صيفاً ومعتدل ولطيف للغاية في فصل الشتاء مع نسائم البحر الأحمر الرطبة.',
      culture: 'تراث تهامي أصيل يبرز في المأكولات البحرية الطازجة كالسمك المخبازة، وفنون الرقص الفلكلوري التهامي، وصناعات القش والخزف التقليدية.',
      bestTimeToVisit: 'من نوفمبر إلى مارس حيث تكون درجات الحرارة معتدلة ومثالية للتنزه على الكورنيش.',
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
    ],
  },
  shahr: {
    id: 'shahr',
    slug: 'shahr',
    name: 'الشحر',
    nameEn: 'Ash Shihr',
    governorate: 'محافظة حضرموت',
    governorateEn: 'Hadramout Governorate',
    tagline: 'مدينة اللبان والشعراء وأقدم موانئ حضرموت التاريخية على بحر العرب',
    heroImage: '/images/destinations/shahr.jpg',
    overview: {
      history: 'الشحر هي إحدى أقدم الموانئ التاريخية على بحر العرب، وعرفت تاريخياً بـ "سعاد الزبينة". اشتهرت بتصدير اللبان والمر والتجارة مع موانئ الهند وشرق أفريقيا، وتضم سورا تاريخياً وقلاعاً عسكرية وبوابات أثرية كبوابة العيدروس.',
      climate: 'مناخ ساحلي دافئ يلطفه نسيم البحر العربي، وتكون درجات الحرارة معتدلة ولطيفة خلال فصلي الخريف والشتاء.',
      culture: 'موطن كبار شعراء الدان والقصيد الحضرمي الأصيل كالمحضار، وتمتاز بمهن صيد الأسماك وصناعة السفن الخشبية التراثية (القوارب الشراعية).',
      bestTimeToVisit: 'من أكتوبر إلى مارس للاستمتاع بالأجواء الشاطئية وزيارة المعالم التراثية والأسواق البحرية.',
    },
    landmarks: [
      {
        id: 'shahr_historic_gate',
        name: 'سور الشحر وبوابة العيدروس التاريخية',
        nameEn: 'Ash Shihr Historic Wall & Gate',
        category: 'تاريخي',
        image: '/images/destinations/shahr.jpg',
        description: 'بوابة دفاعية أثرية وسور حجري عريق كان يحمي مدينة الشحر وميناءها من الغزوات البحرية عبر التاريخ.',
        locationText: 'المدخل الرئيسي لمدينة الشحر',
      },
    ],
  },
  'al-mahra': {
    id: 'al-mahra',
    slug: 'al-mahra',
    name: 'المهرة',
    nameEn: 'Al Mahra',
    governorate: 'محافظة المهرة',
    governorateEn: 'Al Mahra Governorate',
    tagline: 'بوابة الشرق وجنة الضباب الاستوائي ومحمية حوف الطبيعية البكر',
    heroImage: '/images/destinations/al_mahra.jpg',
    overview: {
      history: 'المهرة هي البوابة الشرقية لليمن، وتتميز بطبيعتها البكر وتاريخها العريق ولغتها المهرية السامية الفريدة التي حافظ عليها أهلها عبر آلاف السنين.',
      climate: 'مناخ استوائي فريد يتحول في موسم الخريف (يونيو إلى سبتمبر) إلى جنة استوائية خضراء يغطيها الضباب والرذاذ الموسمي وتهبط فيها درجات الحرارة لأجواء ربيعية ساحرة.',
      culture: 'ثقافة مهرية أصيلة غنية بالأهازيج واللغة التراثية، إلى جانب التقاليد البدوية والبحرية وكرم الضيافة المهري المتميز.',
      bestTimeToVisit: 'من يوليو إلى سبتمبر خلال موسم خريف حوف، وكذلك من نوفمبر إلى مارس للأجواء الشاطئية والبحرية.',
    },
    landmarks: [
      {
        id: 'hawf_reserve',
        name: 'محمية حوف الطبيعية الساحلية',
        nameEn: 'Hawf Nature Reserve',
        category: 'طبيعي',
        image: '/images/destinations/al_mahra.jpg',
        description: 'غابات جبلية استوائية نادرة تعانق بحر العرب وتكسوها سحب الضباب والرذاذ الموسمي مع تنوع بيئي ونباتي فريد.',
        locationText: 'محمية حوف - شرق المهرة',
      },
    ],
  },
  shabwa: {
    id: 'shabwa',
    slug: 'shabwa',
    name: 'شبوة',
    nameEn: 'Shabwa',
    governorate: 'محافظة شبوة',
    governorateEn: 'Shabwa Governorate',
    tagline: 'حاضرة ممالك اللبان القديمة وموطن القلاع الحصينة والموانئ التاريخية',
    heroImage: '/images/destinations/shabwa.jpg',
    overview: {
      history: 'شبوة هي مهد الحضارات العربية القديمة كعاصمة مملكة حضرموت التاريخية، ومقر ميناء قنا الأثري (بير علي) الذي انطلقت منه سفن تجارة اللبان والبخور إلى بقاع العالم القديم.',
      climate: 'مناخ متنوع يجمع بين الأجواء الصحراوية الجافة في الهضاب الداخلية، والأجواء الساحلية المنعشة على شواطئ بحر العرب الجنوبية في بلحاف وبير علي.',
      culture: 'عادات قبلية عربية أصيلة، فنون الشلات والزوامل الشعبية، وتاريخ حافل بالتجارة البدوية والأسواق التقليدية في عتق وبيحان.',
      bestTimeToVisit: 'من أكتوبر إلى أبريل حيث تكون الأجواء معتدلة ومثالية لاستكشاف المواقع الأثرية والشواطئ البكر.',
    },
    landmarks: [
      {
        id: 'qana_historic_port',
        name: 'ميناء قنا التاريخي وحصن الغراب',
        nameEn: 'Ancient Port of Qana & Husn Al-Ghurab',
        category: 'تاريخي',
        image: '/images/destinations/shabwa.jpg',
        description: 'أشهر موانئ تجارة اللبان في العالم القديم وبير علي، مع بقايا حصن الغراب الأثري والبحيرات البركانية الساحلية.',
        locationText: 'بير علي - ساحل شبوة',
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
  const norm = (s: string) => s.replace(/[أإآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim().toLowerCase();
  const targetNorm = norm(key);

  if (targetNorm.includes('حديد') || key.includes('huday') || key.includes('hodei')) {
    return DESTINATIONS_DATA['hodeidah'];
  }
  if (targetNorm.includes('مكلا') || key.includes('mukalla')) {
    return DESTINATIONS_DATA['mukalla'];
  }
  if (targetNorm.includes('سيئون') || key.includes('seiyun')) {
    return DESTINATIONS_DATA['seiyun'];
  }
  if (targetNorm.includes('شحر') || key.includes('shahr')) {
    return DESTINATIONS_DATA['shahr'];
  }
  if (targetNorm.includes('مهره') || key.includes('mahra')) {
    return DESTINATIONS_DATA['al-mahra'];
  }
  if (targetNorm.includes('شبو') || key.includes('shabwa')) {
    return DESTINATIONS_DATA['shabwa'];
  }
  if (targetNorm.includes('صنعا') || key.includes('sanaa')) {
    return DESTINATIONS_DATA['sanaa'];
  }
  if (targetNorm.includes('عدن') || key.includes('aden')) {
    return DESTINATIONS_DATA['aden'];
  }
  if (targetNorm.includes('اب') || key.includes('ibb')) {
    return DESTINATIONS_DATA['ibb'];
  }

  const foundKey = Object.keys(DESTINATIONS_DATA).find(k => {
    const item = DESTINATIONS_DATA[k];
    return norm(item.name).includes(targetNorm) || norm(item.slug).includes(targetNorm);
  });

  return foundKey ? DESTINATIONS_DATA[foundKey] : undefined;
}
