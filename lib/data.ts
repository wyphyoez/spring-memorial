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

export const HEROES: Hero[] = [
  {
    id: '1',
    name: 'Kyaw Thu',
    slug: 'kyawthu',
    role: 'PDF/EAO',
    unit: 'Arakan Army',
    unitSlug: 'arakanarmy',
    location: 'Rakhine',
    date: '2021-03-14',
    desc: 'Remembered for his bravery, compassion, and commitment to protecting civilians during conflict.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    name: 'Naw Kyae Phaw',
    slug: 'naw-kyae-phaw',
    role: 'PDF/EAO',
    unit: 'Karen Frontline Unit 3',
    unitSlug: 'karen-frontline-unit-3',
    location: 'Hpa-An',
    date: '2022-07-09',
    desc: 'Served bravely on the frontline and helped evacuate families in danger.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    name: 'Min Thant Zin',
    slug: 'min-thant-zin',
    role: 'CDM',
    unit: 'Mandalay General Hospital',
    unitSlug: 'mandalay-general-hospital',
    location: 'Mandalay',
    date: '2021-09-21',
    desc: 'A doctor who joined the Civil Disobedience Movement and provided care in secret clinics.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    name: 'Thiri Win',
    slug: 'thiri-win',
    role: 'Civilian',
    unit: 'Community Volunteer Network',
    unitSlug: 'community-volunteer-network',
    location: 'Sagaing',
    date: '2022-11-03',
    desc: 'A humanitarian volunteer who distributed food and medicine to displaced families.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'
  }
];

export const QUOTES = [
  'Their sacrifice planted the seeds of freedom in our hearts.',
  'Heroes never fade; they bloom forever in memory.',
  'Every name here is a story of courage and love for the people.',
  'We remember, we honor, and we carry their dreams forward.'
];

export const LANGUAGES = ['MM', 'EN', 'TH', 'CN', 'KR', 'JP'] as const;

export function roleToSlug(role: Hero['role']) {
  return role.toLowerCase().replace('/', '-');
}

export function heroHref(hero: Hero) {
  return `/${hero.unitSlug}/${hero.slug}`;
}
