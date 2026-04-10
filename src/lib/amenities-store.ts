/**
 * Centralized amenities store — shared between Settings and Hotel/Room edit modals.
 * In a future version this should be persisted to the DB (amenities table).
 */

export type AmenityType = 'hotel' | 'room' | 'space';

export interface GlobalAmenity {
  id: string;
  name: string;
  icon: string;
  type: AmenityType;
}

export const DEFAULT_AMENITIES: GlobalAmenity[] = [
  // Hotel amenities
  { id: 'h1', name: 'بقالة', icon: 'ShoppingCart', type: 'hotel' },
  { id: 'h2', name: 'مطعم', icon: 'UtensilsCrossed', type: 'hotel' },
  { id: 'h3', name: 'كافيه', icon: 'Coffee', type: 'hotel' },
  { id: 'h4', name: 'كافتيريا', icon: 'CupSoda', type: 'hotel' },
  { id: 'h5', name: 'حراسة أمنية', icon: 'ShieldCheck', type: 'hotel' },
  { id: 'h6', name: 'صالون حلاقة', icon: 'Scissors', type: 'hotel' },
  { id: 'h7', name: 'خدمة الغرف', icon: 'BellRing', type: 'hotel' },
  { id: 'h8', name: 'مسبح', icon: 'Waves', type: 'hotel' },
  { id: 'h9', name: 'خدمة النقل للمطار', icon: 'Plane', type: 'hotel' },
  { id: 'h10', name: 'مغسلة', icon: 'Shirt', type: 'hotel' },
  { id: 'h11', name: 'موقف سيارات', icon: 'ParkingCircle', type: 'hotel' },
  { id: 'h12', name: 'منتزة', icon: 'TreePine', type: 'hotel' },
  { id: 'h13', name: 'نادي صحي', icon: 'Dumbbell', type: 'hotel' },
  { id: 'h14', name: 'شيش ومعسل', icon: 'Flame', type: 'hotel' },
  { id: 'h15', name: 'طيرمانات', icon: 'Tent', type: 'hotel' },
  { id: 'h16', name: 'إنترنت', icon: 'Wifi', type: 'hotel' },
  { id: 'h17', name: 'مصعد', icon: 'ArrowUpDown', type: 'hotel' },
  { id: 'h18', name: 'وسط المدينة', icon: 'MapPin', type: 'hotel' },
  { id: 'h19', name: 'قريب المطار', icon: 'PlaneTakeoff', type: 'hotel' },
  { id: 'h20', name: 'قاعات إجتماعات وتدريب', icon: 'Presentation', type: 'hotel' },

  // Room amenities
  { id: 'r1', name: 'تكييف', icon: 'Snowflake', type: 'room' },
  { id: 'r2', name: 'شاشة ذكية', icon: 'Tv', type: 'room' },
  { id: 'r3', name: 'طاولة طعام', icon: 'Utensils', type: 'room' },
  { id: 'r4', name: 'خزنة', icon: 'Lock', type: 'room' },
  { id: 'r5', name: 'ثلاجة', icon: 'Refrigerator', type: 'room' },
  { id: 'r6', name: 'إنترنت', icon: 'Wifi', type: 'room' },
  { id: 'r7', name: 'إطلالة على البحر', icon: 'Waves', type: 'room' },
  { id: 'r8', name: 'إطلالة على المدينة', icon: 'Building2', type: 'room' },
  { id: 'r9', name: 'مجفف شعر', icon: 'Wind', type: 'room' },
  { id: 'r10', name: 'سخان', icon: 'Flame', type: 'room' },
  { id: 'r11', name: 'جاكوزي', icon: 'Bath', type: 'room' },
  { id: 'r12', name: 'غلاية كهربائية', icon: 'Coffee', type: 'room' },
  { id: 'r13', name: 'ساونا', icon: 'ThermometerSun', type: 'room' },
  { id: 'r14', name: 'مطبخ', icon: 'Microwave', type: 'room' },
  { id: 'r15', name: 'مجلس عربي', icon: 'Sofa', type: 'room' },

  // Space details
  { id: 's1', name: 'عدد الغرف', icon: 'DoorOpen', type: 'space' },
  { id: 's2', name: 'عدد الأسرّه', icon: 'BedDouble', type: 'space' },
  { id: 's3', name: 'عدد الحمامات', icon: 'Bath', type: 'space' },
  { id: 's4', name: 'عدد الأشخاص', icon: 'Users', type: 'space' },
];
