import { User, Match, Cafe } from '../types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Dev',
  email: 'alex@example.com',
  avatarUrl: 'https://picsum.photos/200/200?random=1',
  tags: ['React', 'TypeScript', 'Node.js'],
  level: 'Intermediate',
  timezone: 'IST',
  city: 'Mumbai',
  socialOptIn: true,
};

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    userId: 'u1',
    user: {
      id: 'u2',
      name: 'Taylor Code',
      email: 'taylor@example.com',
      avatarUrl: 'https://picsum.photos/200/200?random=2',
      tags: ['React', 'Next.js', 'Tailwind'],
      level: 'Intermediate',
      timezone: 'IST',
      city: 'Bandra, Mumbai',
      socialOptIn: true,
    },
    score: 92,
    reasons: ['Both love React', 'Same City', 'Complementary Skills'],
    status: 'new',
  },
  {
    id: 'm2',
    userId: 'u1',
    user: {
      id: 'u3',
      name: 'Sam Script',
      email: 'sam@example.com',
      avatarUrl: 'https://picsum.photos/200/200?random=3',
      tags: ['Python', 'Django', 'React'],
      level: 'Advanced',
      timezone: 'PST',
      city: 'San Francisco',
      socialOptIn: false,
    },
    score: 78,
    reasons: ['Mentorship Opportunity', 'Frontend/Backend Duo'],
    status: 'new',
  }
];

export const MOCK_CAFES: Cafe[] = [
  {
    id: 'c1',
    name: 'Love & Latte',
    address: 'Versova, Andheri West, Mumbai',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600',
    distance: '0.8 km',
  },
  {
    id: 'c2',
    name: 'Blue Tokai Coffee Roasters',
    address: 'Laxmi Industrial Estate, Andheri West',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600',
    distance: '1.2 km',
  },
  {
    id: 'c3',
    name: 'Third Wave Coffee',
    address: 'Oberoi Mall, Goregaon (Near Andheri)',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=600',
    distance: '2.5 km',
  }
];