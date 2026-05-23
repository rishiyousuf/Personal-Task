export type Priority = 'low' | 'medium' | 'high';

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD or empty
  listId: string;
  subtasks: SubTask[];
  tags: string[];
  createdAt: string;
}

export interface TaskList {
  id: string;
  name: string;
  color: string; // Tailwind color class roots like 'emerald', 'sky', 'rose', 'amber', 'indigo'
  icon: string; // Lucide icon name
}

export interface TaskFilters {
  search: string;
  priority: 'all' | Priority;
  status: 'all' | 'active' | 'completed' | 'overdue';
  tag: string; // 'all' or specific tag
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'alphabetical';
}
