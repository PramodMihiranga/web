
export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface Unit {
  id: string;
  name: string;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  progress: number;
  color: string;
  units: Unit[];
  isPrioritized?: boolean;
}

export interface Stream {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  deadline?: number;
}

export interface User {
  name: string;
  isLoggedIn: boolean;
  streamId?: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  category: 'YouTube' | 'PDF' | 'Portal' | 'Other';
}

export interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  note?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: number;
  type: 'mastery' | 'units' | 'streak' | 'goals';
}

export interface UserStats {
  currentStreak: number;
  lastActiveDate: string; // ISO string
  totalUnitsCompleted: number;
}
