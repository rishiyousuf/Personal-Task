import React, { useState, useEffect } from 'react';
import { Task, TaskList, Priority, SubTask } from '../types';
import { X, Plus, Trash2, CheckCircle, Tag, Calendar, Layout, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => void;
  lists: TaskList[];
  task?: Task; // If provided, we are in Edit mode
  defaultListId?: string;
}

export default function TaskModal({ isOpen, onClose, onSave, lists, task, defaultListId }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [listId, setListId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Omit<SubTask, 'id'>[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Edit mode
        setTitle(task.title);
        setDescription(task.description);
        setPriority(task.priority);
        setListId(task.listId);
        setDueDate(task.dueDate || '');
        setTagInput(task.tags ? task.tags.join(', ') : '');
        setSubtasks(task.subtasks || []);
      } else {
        // Create mode
        setTitle('');
        setDescription('');
        setPriority('medium');
        // Safely pick default list that isn't the 'all-tasks' filter
        const realLists = lists.filter(l => l.id !== 'all-tasks');
        const fallbackId = realLists.length > 0 ? realLists[0].id : '';
        setListId(defaultListId && defaultListId !== 'all-tasks' ? defaultListId : fallbackId);
        setDueDate('');
        setTagInput('');
        setSubtasks([]);
      }
      setNewSubtaskTitle('');
      setErrors({});
    }
  }, [isOpen, task, defaultListId, lists]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), isCompleted: false }]);
      setNewSubtaskTitle('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setErrors({ title: 'Task Title is required' });
      return;
    }

    // Process tags
    const processedTags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    // Prepare complete data
    const finalSubtasks: SubTask[] = subtasks.map((st, i) => ({
      id: 'sub-' + (task ? task.id : 'temp') + '-' + i + '-' + Date.now(),
      title: st.title,
      isCompleted: st.isCompleted
    }));

    onSave({
      id: task?.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      listId,
      dueDate,
      tags: processedTags,
      subtasks: finalSubtasks,
      isCompleted: task ? task.isCompleted : false,
    });

    onClose();
  };

  const selectableLists = lists.filter(l => l.id !== 'all-tasks');

  return (
    <div id="task-modal-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="task-modal-content"
        className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-lg overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {task ? 'Edit Task Details' : 'Create New Task'}
            </h2>
            <p className="text-xs text-gray-500 font-mono">
              Fill in the target goals and checklist
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 max-h-[70vh]">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono font-medium text-gray-500 uppercase tracking-wider mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({});
              }}
              placeholder="e.g., Finalize presentation slides"
              className={`w-full text-sm p-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                errors.title ? 'border-rose-300 focus:border-rose-500' : 'border-gray-200 focus:border-indigo-500'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-medium text-gray-500 uppercase tracking-wider mb-1">
              Description / Notes
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key context, links, or outline details..."
              rows={3}
              className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* List Selection */}
            <div>
              <label className="block text-xs font-mono font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Layout className="w-3.5 h-3.5 text-gray-400" /> Space List
              </label>
              <select
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                {selectableLists.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-mono font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Due Date
              </label>
              <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm p-2 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Priority Picker */}
          <div>
            <label className="block text-xs font-mono font-medium text-gray-500 uppercase tracking-wider mb-1.5 text-gray-500">
              Task Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-semibold capitalize rounded-lg border transition-all ${
                    priority === p 
                      ? p === 'high' 
                        ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/10'
                        : p === 'medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-500/10'
                          : 'bg-slate-100 text-slate-800 border-slate-300 ring-2 ring-slate-500/10'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-mono font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-gray-400" /> Tags
            </label>
            <input 
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g., Work, Urgent, Shopping (separate with commas)"
              className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Checklist creator */}
          <div className="border-t border-gray-100 pt-3">
            <span className="block text-xs font-mono font-medium text-gray-500 uppercase tracking-wider mb-2">
              Action Plan Checklist
            </span>
            
            {/* List of pending subtasks */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {subtasks.map((st, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-gray-100 text-xs">
                    <span className="text-gray-400">•</span>
                    <span className="flex-1 truncate text-gray-700">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(idx)}
                      className="text-gray-400 hover:text-rose-500 p-0.5 rounded transition-colors"
                      title="Remove Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add row */}
            <div className="flex gap-2">
              <input 
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Break task into actionable steps..."
                className="flex-1 text-xs p-2 rounded-lg border border-gray-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-300 transition-all"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="p-2 px-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-gray-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-500/10 hover:shadow-md transition-all flex items-center gap-1"
            >
              {task ? 'Update Goals' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
