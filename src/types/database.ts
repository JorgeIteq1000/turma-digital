// Database types for EduConnect Platform

export type UserRole = 'admin' | 'student';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassGroup {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  course?: Course;
}

export interface Lesson {
  id: string;
  class_group_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  youtube_url: string;
  material_url?: string;
  material_name?: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  class_group?: ClassGroup;
}

export interface ClassEnrollment {
  id: string;
  user_id: string;
  class_group_id: string;
  enrolled_at: string;
  is_active: boolean;
  class_group?: ClassGroup;
  profile?: Profile;
}

export interface LessonView {
  id: string;
  user_id: string;
  lesson_id: string;
  viewed_at: string;
  watch_duration_seconds?: number;
  profile?: Profile;
  lesson?: Lesson;
}

// Helper types for UI
export interface LessonWithStatus extends Lesson {
  isAvailable: boolean;
  isLive: boolean;
  hasBeenWatched: boolean;
}

export interface ClassGroupWithLessons extends ClassGroup {
  lessons: LessonWithStatus[];
  upcomingLessons: LessonWithStatus[];
  recordedLessons: LessonWithStatus[];
}
