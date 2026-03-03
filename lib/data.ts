export type Hero = {
  id: string;
  name: string;
  role: 'PDF/EAO' | 'Student' | 'CDM' | 'Civilian';
  unit: string;
  location: string;
  date: string;
  desc: string;
  image: string;
};

export const HEROES: Hero[] = [
  {
    id: '1',
    name: 'Aye Chan Oo',
    role: 'Student',
    unit: 'Yangon University Movement',
    location: 'Yangon',
    date: '2021-03-14',
    desc: 'A courageous student leader who organized peaceful demonstrations for democracy and inspired many young citizens.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    name: 'Naw Kyae Phaw',
    role: 'PDF/EAO',
    unit: 'Karen Frontline Unit 3',
    location: 'Hpa-An',
    date: '2022-07-09',
    desc: 'Served bravely on the frontline, protecting displaced communities and helping evacuate families in danger.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    name: 'Min Thant Zin',
    role: 'CDM',
    unit: 'Mandalay General Hospital',
    location: 'Mandalay',
    date: '2021-09-21',
    desc: 'A doctor who joined the Civil Disobedience Movement and continued to provide medical care in secret clinics.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    name: 'Thiri Win',
    role: 'Civilian',
    unit: 'Community Volunteer Network',
    location: 'Sagaing',
    date: '2022-11-03',
    desc: 'A humanitarian volunteer who distributed food and medicine to internally displaced people.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '5',
    name: 'Ko Htet Paing',
    role: 'PDF/EAO',
    unit: 'People Defense Force - Central',
    location: 'Magway',
    date: '2023-02-18',
    desc: 'Known for his unwavering spirit and dedication to protecting his village against raids.',
    image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '6',
    name: 'Mya Nandar',
    role: 'Student',
    unit: 'Technological University Students Union',
    location: 'Taunggyi',
    date: '2021-05-06',
    desc: 'A vocal advocate for freedom, she coordinated youth campaigns and educational aid during unrest.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
  }
];

export const QUOTES = [
  'Their sacrifice planted the seeds of freedom in our hearts.',
  'Heroes never fade; they bloom forever in memory.',
  'Every name here is a story of courage and love for the people.',
  'We remember, we honor, and we carry their dreams forward.'
];
