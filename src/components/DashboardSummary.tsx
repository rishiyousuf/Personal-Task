import React from 'react';
import { Task, TaskList } from '../types';
import { CheckCircle2, Clock, AlertTriangle, Sparkles, Flame, Check } from 'lucide-react';

interface Props {
  tasks: Task[];
  lists: TaskList[];
  selectedListId: string;
}

export default function DashboardSummary({ tasks, lists, selectedListId }: Props) {
  // Stats on all tasks
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const activeCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Overdue calculation (due date < today's date under completed === false)
  // Today's date is 2026-05-23
  const todayStr = '2026-05-23';
  const overdueCount = tasks.filter(t => !t.isCompleted && t.dueDate && t.dueDate < todayStr).length;

  // Streak metrics
  const completedToday = tasks.filter(t => t.isCompleted && t.dueDate === todayStr).length;

  // Progress color based on level
  const getProgressColor = (percent: number) => {
    if (percent < 30) return 'bg-rose-500';
    if (percent < 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  // List breakdown for visualization (exclude "all-tasks")
  const activeLists = lists.filter(l => l.id !== 'all-tasks');

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Circle progress card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-xs font-mono font-medium uppercase tracking-wider">Overall Focus</span>
          <div className="p-1 px-2 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Growth Space
          </div>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-extrabold text-gray-900 leading-none">{progressPercent}%</span>
          <span className="text-xs text-gray-400 pb-1 font-mono">completed</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-3">
          <div 
            className={`h-full transition-all duration-500 ease-out ${getProgressColor(progressPercent)}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-2 font-mono">
          {completedCount} of {totalCount} goals achieved
        </p>
      </div>

      {/* Pending status card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs font-mono font-medium uppercase tracking-wider">Active Goals</span>
          <div className="p-1.5 rounded-xl bg-sky-50 text-sky-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="text-4xl font-extrabold text-gray-950 leading-none">{activeCount}</span>
          <span className="text-xs text-gray-400 font-mono ml-2">pending</span>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">
          Focusing your daily capacity
        </span>
      </div>

      {/* Overdue alert card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs font-mono font-medium uppercase tracking-wider">Overdue Alert</span>
          <div className={`p-1.5 rounded-xl ${overdueCount > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className={`text-4xl font-extrabold leading-none ${overdueCount > 0 ? 'text-rose-600' : 'text-gray-900'}`}>{overdueCount}</span>
          <span className="text-xs text-gray-400 font-mono ml-2">critical</span>
        </div>
        <span className="text-[11px] font-mono text-gray-400">
          {overdueCount > 0 ? 'Action required immediately' : 'All schedules on track'}
        </span>
      </div>

      {/* Daily streak card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs font-mono font-medium uppercase tracking-wider">Today Completed</span>
          <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="text-4xl font-extrabold text-emerald-600 leading-none">{completedToday}</span>
          <span className="text-xs text-gray-400 font-mono ml-2">today</span>
        </div>
        <span className="text-[11px] font-mono text-gray-400">
          {completedToday > 0 ? 'Solid performance today!' : 'Complete a task for today'}
        </span>
      </div>
    </div>
  );
}
