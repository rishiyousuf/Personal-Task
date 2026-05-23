import { Task, TaskList } from './types';

export const initialLists: TaskList[] = [
  { id: 'all-tasks', name: 'All Activities', color: 'indigo', icon: 'Layers' },
  { id: 'work', name: 'Work Project', color: 'sky', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal & Care', color: 'emerald', icon: 'User' },
  { id: 'finance', name: 'Finance Tasks', color: 'amber', icon: 'DollarSign' },
  { id: 'fitness', name: 'Health & Fitness', color: 'rose', icon: 'Activity' },
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Create full-stack project blueprints',
    description: 'Sketch the microservices design and state structures for the team review.',
    isCompleted: false,
    priority: 'high',
    dueDate: '2026-05-24', // Tomorrow
    listId: 'work',
    tags: ['Design', 'Blueprints'],
    createdAt: '2026-05-22T09:00:00Z',
    subtasks: [
      { id: 'sub-1-1', title: 'Define routing and endpoints', isCompleted: true },
      { id: 'sub-1-2', title: 'Draft schema models', isCompleted: false },
      { id: 'sub-1-3', title: 'Add performance test plan', isCompleted: false }
    ]
  },
  {
    id: 'task-2',
    title: 'Complete annual gym induction session',
    description: 'Renew membership badge and schedule the first strength training session with a personal coach.',
    isCompleted: false,
    priority: 'medium',
    dueDate: '2026-05-25',
    listId: 'fitness',
    tags: ['Fitness', 'Health'],
    createdAt: '2026-05-21T14:30:00Z',
    subtasks: [
      { id: 'sub-2-1', title: 'Renew subscription online', isCompleted: true },
      { id: 'sub-2-2', title: 'Verify coach availability', isCompleted: false }
    ]
  },
  {
    id: 'task-3',
    title: 'Review quarterly house insurance quotes',
    description: 'Compare active policies against home value increments and choose the best standard rate.',
    isCompleted: true,
    priority: 'high',
    dueDate: '2026-05-21', // Yesterday (Completed, so it is fine!)
    listId: 'finance',
    tags: ['Insurance', 'Utilities'],
    createdAt: '2026-05-18T10:00:00Z',
    subtasks: []
  },
  {
    id: 'task-4',
    title: 'Organize study desk and cables',
    description: 'Clean surface, bundle loose monitor and charger wires, and store unused books.',
    isCompleted: false,
    priority: 'low',
    dueDate: '2026-05-28',
    listId: 'personal',
    tags: ['Chore', 'Home'],
    createdAt: '2026-05-23T08:00:00Z',
    subtasks: [
      { id: 'sub-4-1', title: 'Wipe desk surface', isCompleted: false },
      { id: 'sub-4-2', title: 'Group charging cables with zip ties', isCompleted: false }
    ]
  },
  {
    id: 'task-5',
    title: 'Pay electric bill',
    description: 'Automatic debit failed. Need to login to provider dashboard and pay via credit card directly.',
    isCompleted: false,
    priority: 'high',
    dueDate: '2026-05-22', // Yesterday - Overdue!
    listId: 'finance',
    tags: ['Utilities', 'Finance'],
    createdAt: '2026-05-20T11:20:00Z',
    subtasks: []
  },
  {
    id: 'task-6',
    title: 'Prepare healthy breakfast plan',
    description: 'Map out macro nutrients for the week. Store fresh fruits and granola jars.',
    isCompleted: true,
    priority: 'low',
    dueDate: '2026-05-23', // Today (Completed)
    listId: 'fitness',
    tags: ['MealPrep', 'Health'],
    createdAt: '2026-05-22T20:00:00Z',
    subtasks: []
  }
];
