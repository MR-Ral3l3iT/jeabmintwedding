export type GuestCategory =
  | 'GROOM_FRIEND'
  | 'BRIDE_FRIEND'
  | 'GROOM_ELDER'
  | 'BRIDE_ELDER'
  | 'OTHER';

export const GUEST_CATEGORIES: {
  value: GuestCategory;
  label: string;
}[] = [
  { value: 'GROOM_FRIEND', label: 'เพื่อนเจ้าบ่าว' },
  { value: 'BRIDE_FRIEND', label: 'เพื่อนเจ้าสาว' },
  { value: 'GROOM_ELDER', label: 'แขกผู้ใหญ่ฝั่งเจ้าบ่าว' },
  { value: 'BRIDE_ELDER', label: 'แขกผู้ใหญ่ฝั่งเจ้าสาว' },
  { value: 'OTHER', label: 'แขกกลุ่มอื่นๆ' },
];

/** ลำดับตอนปริ้นรายชื่อ */
export const GUEST_CATEGORY_PRINT_ORDER: (GuestCategory | null)[] = [
  'GROOM_ELDER',
  'BRIDE_ELDER',
  'GROOM_FRIEND',
  'BRIDE_FRIEND',
  'OTHER',
  null,
];

export function guestCategoryLabel(category?: GuestCategory | null): string {
  if (!category) return 'ยังไม่ระบุ';
  return GUEST_CATEGORIES.find((c) => c.value === category)?.label ?? 'ยังไม่ระบุ';
}
