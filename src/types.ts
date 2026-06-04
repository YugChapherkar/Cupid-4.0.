export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  tags: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Senior' | 'Staff/Principal';
  timezone: string;
  city: string;
  socialOptIn: boolean;
  bio?: string;
  github?: string;
}

export interface Match {
  id: string;
  userId: string;
  user: User; // The other user
  score: number;
  reasons: string[];
  status: 'new' | 'chatting' | 'met' | 'proposal';
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  readAt?: string | null;
}

export interface Session {
  id: string;
  matchId: string;
  startTime: number;
  endTime?: number;
  summary?: string;
  active: boolean;
  codeSnippet?: string;
}

export interface Cafe {
  id: string;
  name: string;
  address: string;
  rating: number;
  image: string;
  distance: string;
}

export interface ItineraryItem {
  time: string;
  place: string;
  reason: string;
}

export interface Proposal {
  id: string;
  html: string;
  memory: string;
  message: string;
}