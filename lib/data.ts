export type Hero = {
  id: string;
  name: string;
  slug: string;
  role: 'PDF/EAO' | 'Student' | 'CDM' | 'Civilian';
  unit: string;
  unitSlug: string;
  location: string;
  date: string;
  desc: string;
  image: string;
};


export const QUOTES = [
  'Their sacrifice planted the seeds of freedom in our hearts.',
  'Heroes never fade; they bloom forever in memory.',
  'Every name here is a story of courage and love for the people.',
  'We remember, we honor, and we carry their dreams forward.'
];

export const LANGUAGES = ['MM', 'EN', 'TH', 'CN', 'KR', 'JP'] as const;

export function heroHref(hero: Hero) {
  return `/${hero.unitSlug}/${hero.slug}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
