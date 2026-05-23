import React, { useState } from 'react';
import { Task, SubTask, TaskList } from '../types';
import { Calendar, Trash2, Edit3, CheckCircle, Circle, Tag, AlertCircle, ChevronDown, ChevronUp, Clock, PlusSquare } from 'lucide-react';

interface Props {
  key?: string;
  task: Task;
  lists: TaskList[];
  onToggleComplete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, lists, onToggleComplete, onToggleSubtask, onDelete, onEdit }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find corresponding list details
  const taskList = lists.find(l => l.id === task.listId);
  
  // Date status calculation (current date: 2026-05-23)
  const todayStr = '2026-05-23';
  const isOverdue = !task.isCompleted && task.dueDate && task.dueDate < todayStr;
  const isDueToday = !task.isCompleted && task.dueDate === todayStr;

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200/50';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200/50';
    }
  };

  const getListBadgeStyles = (color: string) => {
    switch (color) {
      case 'sky': return 'bg-sky-50 text-sky-700 border-sky-200/60';
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'rose': return 'bg-rose-50 text-rose-700 border-rose-200/60';
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'indigo': return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      default: return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  const formatDueDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${monthNames[monthIndex]} ${day}, ${year}`;
    }
    return dateStr;
  };

  const completedSubtasksCount = task.subtasks.filter(s => s.isCompleted).length;
  const totalSubtasksCount = task.subtasks.length;

  return (
    <div 
      id={`task-card-${task.id}`}
      className={`bg-white rounded-xl border transition-all duration-200 ${
        task.isCompleted 
          ? 'border-gray-100 shadow-none opacity-80' 
          : isOverdue 
            ? 'border-rose-200 hover:border-rose-300 shadow-sm' 
            : isDueToday
              ? 'border-amber-200 hover:border-amber-300 shadow-sm'
              : 'border-gray-200/80 hover:border-indigo-200 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Complete toggle checkbox */}
          <button 
            type="button"
            onClick={() => onToggleComplete(task.id)}
            className="mt-0.5 focus:outline-none text-gray-400 hover:text-indigo-600 transition-colors"
            title={task.isCompleted ? 'Mark Active' : 'Mark Completed'}
          >
            {task.isCompleted ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50" />
            ) : (
              <Circle className="w-5 h-5 hover:scale-105 transition-transform" />
            )}
          </button>

          {/* Core content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {/* List Color Badge */}
              {taskList && (
                <span className={`text-[10px] font-mono tracking-tight font-medium px-2 py-0.5 rounded-full border ${getListBadgeStyles(taskList.color)}`}>
                  {taskList.name}
                </span>
              )}

              {/* Priority Indicator */}
              <span className={`text-[10px] font-mono tracking-tight font-medium px-2 py-0.5 rounded-full border capitalize ${getPriorityStyles(task.priority)}`}>
                {task.priority} Priority
              </span>

              {/* Overdue/Today Alert badges */}
              {isOverdue && (
                <span className="text-[10px] font-mono text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Overdue
                </span>
              )}
              {isDueToday && (
                <span className="text-[10px] font-mono text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Due Today
                </span>
              )}
            </div>

            <h3 className={`text-sm font-semibold text-gray-900 leading-snug break-words ${task.isCompleted ? 'line-through text-gray-400 font-normal shadow-none' : ''}`}>
              {task.title}
            </h3>

            {task.description && (
              <p className={`text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2 ${task.isCompleted ? 'text-gray-400 font-light' : ''}`}>
                {task.description}
              </p>
            )}

            {/* Bottom metadata strip */}
            <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 mt-3 pt-3 border-t border-gray-100/60">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {/* Due Date */}
                {task.dueDate && (
                  <div className={`flex items-center gap-1 text-[11px] font-mono ${
                    task.isCompleted 
                      ? 'text-gray-400' 
                      : isOverdue 
                        ? 'text-rose-600 font-semibold' 
                        : isDueToday 
                          ? 'text-amber-700 font-semibold'
                          : 'text-gray-500'
                  }`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDueDate(task.dueDate)}</span>
                  </div>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Tag className="w-3 h-3 text-slate-300" />
                    <span className="truncate max-w-[150px]">{task.tags.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Right side progress summary / status */}
              <div className="flex items-center gap-2">
                {totalSubtasksCount > 0 && (
                  <button 
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 font-mono px-2 py-1 rounded border border-gray-100 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Checklist: {completedSubtasksCount}/{totalSubtasksCount}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}

                {/* Action buttons */}
                <div id={`task-card-actions-${task.id}`} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                    title="Edit Goal"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(task.id)}
                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Checklist Subtasks section */}
        {totalSubtasksCount > 0 && (isExpanded || task.subtasks.some(s => !s.isCompleted && !task.isCompleted)) && (
          <div className="mt-3 pt-3 border-t border-dashed border-gray-100">
            <span className="text-[10px] font-mono font-medium text-gray-400 uppercase tracking-wider block mb-2">
              Goal Checklist
            </span>
            <div className="space-y-1.5">
              {task.subtasks.map(sub => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onToggleSubtask(task.id, sub.id)}
                  className="w-full text-left flex items-start gap-2.5 p-1.5 px-2 rounded-lg hover:bg-slate-50 text-xs transition-colors group cursor-pointer"
                >
                  <span className={`mt-0.5 rounded shrink-0 transition-all ${
                    sub.isCompleted 
                      ? 'text-emerald-500' 
                      : 'text-gray-300 group-hover:text-indigo-500'
                  }`}>
                    {sub.isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5 fill-emerald-50" />
                    ) : (
                      <Circle className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <span className={`break-words ${
                    sub.isCompleted 
                      ? 'line-through text-gray-400 font-light' 
                      : 'text-gray-700'
                  }`}>
                    {sub.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
