import React, { useState, useEffect } from 'react';
import { TaskList } from '../types';
import { X, Check } from 'lucide-react';
import DynamicListIcon from './DynamicListIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string, icon: string) => void;
}

const COLORS = [
  { id: 'sky', bg: 'bg-sky-500', hover: 'hover:bg-sky-600', text: 'text-sky-700', border: 'border-sky-200' },
  { id: 'emerald', bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'indigo', bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', text: 'text-indigo-700', border: 'border-indigo-200' },
  { id: 'amber', bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-700', border: 'border-amber-200' },
  { id: 'rose', bg: 'bg-rose-500', hover: 'hover:bg-rose-600', text: 'text-rose-700', border: 'border-rose-200' },
];

const ICONS = [
  { id: 'Layers', label: 'All Layers' },
  { id: 'Briefcase', label: 'Work / Projects' },
  { id: 'User', label: 'Personal Care' },
  { id: 'DollarSign', label: 'Finance' },
  { id: 'Activity', label: 'Health' },
];

export default function ListModal({ isOpen, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('sky');
  const [selectedIcon, setSelectedIcon] = useState('Briefcase');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setSelectedColor('sky');
      setSelectedIcon('Briefcase');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('List Name is required');
      return;
    }
    onSave(name.trim(), selectedColor, selectedIcon);
    onClose();
  };

  return (
    <div id="list-modal-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="list-modal-content"
        className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Create Task List</h2>
            <p className="text-[11px] text-gray-400 font-mono">Add a custom category space</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-[11px] font-mono font-medium text-gray-500 uppercase tracking-wider mb-1">
              List Name
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Reading List, Cooking"
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {error && (
              <p className="text-[10px] text-rose-500 font-mono mt-1">{error}</p>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text:[11px] font-mono font-medium text-gray-500 uppercase tracking-wider mb-2">
              Theme Color
            </label>
            <div className="flex items-center gap-2">
              {COLORS.map(color => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.id)}
                  className={`w-7 h-7 rounded-full ${color.bg} transition-transform flex items-center justify-center cursor-pointer ${
                    selectedColor === color.id ? 'scale-110 ring-4 ring-indigo-500/20 shadow' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={color.id}
                >
                  {selectedColor === color.id && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-[11px] font-mono font-medium text-gray-500 uppercase tracking-wider mb-2">
              List Header Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map(ic => (
                <button
                  key={ic.id}
                  type="button"
                  onClick={() => setSelectedIcon(ic.id)}
                  className={`p-2 rounded-xl border transition-all flex flex-col justify-center items-center gap-1 hover:bg-slate-50 cursor-pointer ${
                    selectedIcon === ic.id 
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-600' 
                      : 'border-gray-200 text-gray-500 bg-white'
                  }`}
                  title={ic.label}
                >
                  <DynamicListIcon name={ic.id} className="w-4 h-4 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/10 rounded-xl transition-colors"
            >
              Create Space
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
