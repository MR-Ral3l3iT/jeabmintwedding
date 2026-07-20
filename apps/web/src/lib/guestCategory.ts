import type { Guest, GuestCategory } from '@/types';

export function guestCategoryLabel(
  guestOrCategoryId: Guest | string | null | undefined,
  categories: GuestCategory[] = [],
): string {
  if (!guestOrCategoryId) return 'ยังไม่ระบุ';

  if (typeof guestOrCategoryId === 'string') {
    return categories.find((c) => c.id === guestOrCategoryId)?.name ?? 'ยังไม่ระบุ';
  }

  if (guestOrCategoryId.categoryName) return guestOrCategoryId.categoryName;
  if (guestOrCategoryId.categoryId) {
    return categories.find((c) => c.id === guestOrCategoryId.categoryId)?.name ?? 'ยังไม่ระบุ';
  }
  return 'ยังไม่ระบุ';
}

export function sortGuestsForPrint(
  guests: Guest[],
  categories: GuestCategory[],
): { categoryId: string | null; categoryName: string; guests: Guest[] }[] {
  const byId = new Map<string | null, Guest[]>();

  for (const category of categories) {
    byId.set(category.id, []);
  }
  byId.set(null, []);

  for (const guest of guests) {
    const key =
      guest.categoryId && byId.has(guest.categoryId) ? guest.categoryId : null;
    byId.get(key)!.push(guest);
  }

  const guestName = (g: Guest) => g.displayName ?? g.name ?? 'ไม่ระบุชื่อ';

  const sections: {
    categoryId: string | null;
    categoryName: string;
    guests: Guest[];
  }[] = categories
    .map((category) => {
      const list = (byId.get(category.id) ?? []).sort((a, b) =>
        guestName(a).localeCompare(guestName(b), 'th'),
      );
      return {
        categoryId: category.id as string | null,
        categoryName: category.name,
        guests: list,
      };
    })
    .filter((section) => section.guests.length > 0);

  const unset = (byId.get(null) ?? []).sort((a, b) =>
    guestName(a).localeCompare(guestName(b), 'th'),
  );
  if (unset.length > 0) {
    sections.push({
      categoryId: null,
      categoryName: 'ยังไม่ระบุ',
      guests: unset,
    });
  }

  return sections;
}
