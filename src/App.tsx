import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskList, TaskFilters, Priority, SubTask } from './types';
import { initialLists, initialTasks } from './initialData';
import DashboardSummary from './components/DashboardSummary';
import TaskFiltersAndControls from './components/TaskFiltersAndControls';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import ListModal from './components/ListModal';
import DynamicListIcon from './components/DynamicListIcon';
import { 
  Plus, 
  FolderPlus, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckSquare, 
  Search, 
  SlidersHorizontal,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Award,
  BookOpen
} from 'lucide-react';

export default function App() {
  // --- Persistent States ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('all-tasks');

  // --- Filtering & UI States ---
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    priority: 'all',
    status: 'all',
    tag: 'all',
    sortBy: 'dueDate',
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [importNotification, setImportNotification] = useState<{ text: string; type: 'success' | 'err' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initialization & LocalStorage Sync ---
  useEffect(() => {
    const savedTasks = localStorage.getItem('personal_tasks');
    const savedLists = localStorage.getItem('personal_lists');
    const savedSelectedList = localStorage.getItem('personal_selected_list');

    if (savedTasks && savedLists) {
      setTasks(JSON.parse(savedTasks));
      setLists(JSON.parse(savedLists));
    } else {
      // First-time load: Seed initial mock database
      setTasks(initialTasks);
      setLists(initialLists);
      localStorage.setItem('personal_tasks', JSON.stringify(initialTasks));
      localStorage.setItem('personal_lists', JSON.stringify(initialLists));
    }

    if (savedSelectedList) {
      setSelectedListId(savedSelectedList);
    }
  }, []);

  // Save states to local storage on changes
  const updateAndPersistTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('personal_tasks', JSON.stringify(updatedTasks));
  };

  const updateAndPersistLists = (updatedLists: TaskList[]) => {
    setLists(updatedLists);
    localStorage.setItem('personal_lists', JSON.stringify(updatedLists));
  };

  const handleSelectList = (id: string) => {
    setSelectedListId(id);
    localStorage.setItem('personal_selected_list', id);
  };

  // --- Task Operations ---
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Edit operation
      const updated = tasks.map((t) => {
        if (t.id === taskData.id) {
          return {
            ...t,
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            listId: taskData.listId,
            dueDate: taskData.dueDate,
            tags: taskData.tags,
            subtasks: taskData.subtasks,
            isCompleted: taskData.isCompleted,
          };
        }
        return t;
      });
      updateAndPersistTasks(updated);
    } else {
      // Create operation
      const newTask: Task = {
        id: 'task-' + Date.now().toString(),
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        listId: taskData.listId,
        dueDate: taskData.dueDate,
        tags: taskData.tags,
        subtasks: taskData.subtasks,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };
      updateAndPersistTasks([newTask, ...tasks]);
    }
    setEditingTask(undefined);
  };

  const handleToggleComplete = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, isCompleted: !t.isCompleted };
      }
      return t;
    });
    updateAndPersistTasks(updated);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map((sub) => {
          if (sub.id === subtaskId) {
            return { ...sub, isCompleted: !sub.isCompleted };
          }
          return sub;
        });
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    });
    updateAndPersistTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    updateAndPersistTasks(updated);
  };

  const handleTriggerEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // --- List Operations ---
  const handleCreateList = (name: string, color: string, icon: string) => {
    const newList: TaskList = {
      id: 'list-' + Date.now().toString(),
      name,
      color,
      icon,
    };
    const updated = [...lists, newList];
    updateAndPersistLists(updated);
    handleSelectList(newList.id);
  };

  const handleDeleteCategoryList = (listIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (listIdToDelete === 'all-tasks') return;
    
    const confirmDelete = window.confirm(
      'Are you sure you want to remove this List Space? Tasks inside will be categorized under the default "All Activities".'
    );
    
    if (confirmDelete) {
      // Re-assign tasks inside to the default work group or first list
      const remainingLists = lists.filter((l) => l.id !== listIdToDelete);
      const updatedTasks = tasks.map((t) => {
        if (t.listId === listIdToDelete) {
          return { ...t, listId: 'work' }; // Re-assign
        }
        return t;
      });

      updateAndPersistLists(remainingLists);
      updateAndPersistTasks(updatedTasks);
      handleSelectList('all-tasks');
    }
  };

  // --- Filter and Sort Computations ---
  const activeList = lists.find((l) => l.id === selectedListId);
  const activeListTasks = tasks.filter((t) => {
    if (selectedListId === 'all-tasks') return true;
    return t.listId === selectedListId;
  });

  // Extract all unique tags dynamically
  const allUniqueTags: string[] = Array.from(
    new Set<string>(tasks.flatMap((t) => t?.tags || []))
  ).sort();

  // Filter Tasks
  const filteredTasks = activeListTasks.filter((task) => {
    // Search filter (handles Title, Description, and Tags match)
    const matchesSearch = 
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase()));

    // Priority filter
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;

    // Status filter
    let matchesStatus = true;
    const todayStr = '2026-05-23';
    if (filters.status === 'active') {
      matchesStatus = !task.isCompleted;
    } else if (filters.status === 'completed') {
      matchesStatus = task.isCompleted;
    } else if (filters.status === 'overdue') {
      matchesStatus = !task.isCompleted && task.dueDate !== '' && task.dueDate < todayStr;
    }

    // Tag filter
    const matchesTag = filters.tag === 'all' || task.tags.includes(filters.tag);

    return matchesSearch && matchesPriority && matchesStatus && matchesTag;
  });

  // Sort Tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (filters.sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    
    if (filters.sortBy === 'priority') {
      const priorityWeights = { high: 3, medium: 2, low: 1 };
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    }

    if (filters.sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }

    // Default or 'createdAt'
    return b.createdAt.localeCompare(a.createdAt);
  });

  // Count active tasks for badge metrics
  const getPendingCountForList = (listId: string) => {
    if (listId === 'all-tasks') {
      return tasks.filter((t) => !t.isCompleted).length;
    }
    return tasks.filter((t) => t.listId === listId && !t.isCompleted).length;
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      priority: 'all',
      status: 'all',
      tag: 'all',
      sortBy: 'dueDate',
    });
  };

  // --- Data Portability ---
  const handleExportData = () => {
    const backup = {
      lists,
      tasks,
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personal_tasks_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data && Array.isArray(data.lists) && Array.isArray(data.tasks)) {
          updateAndPersistLists(data.lists);
          updateAndPersistTasks(data.tasks);
          triggerNotification('Workspace backup imported successfully!', 'success');
        } else {
          triggerNotification('Failed to import: JSON structure is invalid.', 'err');
        }
      } catch (err) {
        triggerNotification('Error parsing details. Please make sure the JSON file is valid.', 'err');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (e.target) e.target.value = '';
  };

  const triggerNotification = (text: string, type: 'success' | 'err') => {
    setImportNotification({ text, type });
    setTimeout(() => {
      setImportNotification(null);
    }, 4500);
  };

  const handleResetToSeedingTemplate = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset all tasks? This replaces custom additions with our tidy pre-seeded template tasks.'
    );
    if (confirmReset) {
      updateAndPersistTasks(initialTasks);
      updateAndPersistLists(initialLists);
      handleSelectList('all-tasks');
      triggerNotification('Lists restored to original template.', 'success');
    }
  };

  // Display color definitions for backgrounds and text
  const getSidebarBgClass = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'sky': return 'bg-sky-550/10 text-sky-850 hover:bg-sky-50';
        case 'emerald': return 'bg-emerald-550/10 text-emerald-850 hover:bg-emerald-50';
        case 'rose': return 'bg-rose-550/10 text-rose-850 hover:bg-rose-50';
        case 'amber': return 'bg-amber-550/10 text-amber-850 hover:bg-amber-50';
        case 'indigo': return 'bg-indigo-550/10 text-indigo-850 hover:bg-indigo-50';
        default: return 'bg-slate-100 text-slate-850 hover:bg-slate-150';
      }
    }
    return 'text-gray-600 hover:bg-slate-50';
  };

  const getSidebarBadgeClass = (color: string) => {
    switch (color) {
      case 'sky': return 'bg-sky-100/70 text-sky-850';
      case 'emerald': return 'bg-emerald-100/70 text-emerald-850';
      case 'rose': return 'bg-rose-100/70 text-rose-850';
      case 'amber': return 'bg-amber-100/70 text-amber-850';
      case 'indigo': return 'bg-indigo-100/70 text-indigo-850';
      default: return 'bg-slate-100 text-slate-850';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 font-sans flex flex-col selection:bg-indigo-500/10 selection:text-indigo-900">
      
      {/* Dynamic backup import notifier toast */}
      {importNotification && (
        <div id="toast-banner" className={`fixed bottom-5 right-5 z-50 p-4 px-5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce border ${
          importNotification.type === 'success' 
            ? 'bg-emerald-900 text-emerald-50 border-emerald-850/80' 
            : 'bg-rose-900 text-rose-550 border-rose-800'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-current shrink-0 animate-ping" />
          <span className="text-xs font-mono font-medium leading-tight">
            {importNotification.text}
          </span>
        </div>
      )}

      {/* Primary Top Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Brand block */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/15 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-gray-950">
                  Personal Task Lists
                </h1>
                <span className="bg-indigo-50 text-[10px] text-indigo-600 font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                  Cloud Workspace
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Active Session: May 23, 2026</span>
              </p>
            </div>
          </div>

          {/* Setup Actions & Portability controllers */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            
            {/* Action Group: Data Portability */}
            <div className="bg-slate-100 p-1 rounded-xl border border-gray-200/50 flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleExportData}
                className="p-1 px-2.5 hover:text-indigo-600 font-mono text-[10px] font-bold text-gray-500 rounded-lg hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
                title="Download workspace as interactive JSON file backup"
              >
                <Download className="w-3.5 h-3.5" /> Export DB
              </button>
              
              <button
                type="button"
                onClick={handleTriggerFileInput}
                className="p-1 px-2.5 hover:text-indigo-600 font-mono text-[10px] font-bold text-gray-500 rounded-lg hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
                title="Restore custom JSON tasks backup"
              >
                <Upload className="w-3.5 h-3.5" /> Import
              </button>

              <input 
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleResetToSeedingTemplate}
                className="p-1 px-2 hover:text-rose-600 rounded-lg hover:bg-white text-gray-400 transition-colors cursor-pointer"
                title="Restore tidy preset activities"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Main Action buttons */}
            <button
              type="button"
              onClick={() => {
                setEditingTask(undefined);
                setIsTaskModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all rounded-xl shadow-md shadow-indigo-600/10 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 cursor-pointer text-center"
            >
              <Plus className="w-4 h-4" /> Add Task Goal
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Core dynamic dashboard summaries */}
        <DashboardSummary 
          tasks={tasks} 
          lists={lists} 
          selectedListId={selectedListId} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Side Panel: Spaces Selector & Workspace Category */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 lg:sticky lg:top-[90px] space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                  List Spaces
                </h2>
                <p className="text-[10px] text-gray-400 font-mono">Select categorical division</p>
              </div>
              <button
                type="button"
                onClick={() => setIsListModalOpen(true)}
                className="p-1 px-2 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-indigo-100"
                title="Create a new workspace list section"
              >
                <Plus className="w-3.5 h-3.5" /> Add Space
              </button>
            </div>

            {/* Render Lists collection */}
            <div id="list-spaces-container" className="space-y-1">
              {lists.map((l) => {
                const isActive = l.id === selectedListId;
                const pendingCount = getPendingCountForList(l.id);
                
                return (
                  <div
                    key={l.id}
                    onClick={() => handleSelectList(l.id)}
                    className={`w-full flex items-center justify-between p-2.5 py-3 rounded-xl text-xs font-medium cursor-pointer transition-all ${getSidebarBgClass(l.color, isActive)}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg border ${
                        isActive ? 'bg-white border-transparent shadow-xs' : 'bg-slate-50 border-gray-150'
                      }`}>
                        <DynamicListIcon name={l.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate font-semibold">{l.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {pendingCount > 0 && (
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${getSidebarBadgeClass(l.color)}`}>
                          {pendingCount}
                        </span>
                      )}
                      
                      {/* Delete option for custom created list spaces */}
                      {l.id !== 'all-tasks' && l.id !== 'work' && l.id !== 'personal' && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCategoryList(l.id, e)}
                          className="p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-slate-100 opacity-60 hover:opacity-100 transition-all cursor-pointer"
                          title="Delete category space"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fast Tips segment inside bottom of side panel */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/40 text-xs">
              <span className="text-[10px] font-semibold text-indigo-700 font-mono tracking-wide uppercase flex items-center gap-1 mb-1">
                <BookOpen className="w-3 h-3" /> Quick Tips
              </span>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Click a task's subtasks checklist directly to tick items off dynamically without having to edit the goal details!
              </p>
            </div>

          </div>

          {/* Right Panel: Primary Task Grid list inside Workspace */}
          <div className="col-span-1 lg:col-span-3 space-y-4">
            
            {/* Active division header line */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2">
              <div>
                <h2 className="text-base font-extrabold text-gray-950 flex items-center gap-2">
                  <span>{activeList ? activeList.name : 'Personal Activity Feed'}</span>
                  <span className="text-xs font-mono font-normal text-gray-500 bg-slate-100/80 p-1 px-2 rounded-lg border border-gray-200/50">
                    {sortedTasks.length} {sortedTasks.length === 1 ? 'goal' : 'goals'} filtered
                  </span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing matches from current scope
                </p>
              </div>
            </div>

            {/* Task Filters selection bar */}
            <TaskFiltersAndControls 
              filters={filters}
              onChangeFilters={setFilters}
              allTags={allUniqueTags}
              onResetFilters={handleResetFilters}
            />

            {/* Listing core goals grid */}
            {sortedTasks.length > 0 ? (
              <div id="tasks-cards-grid" className="grid grid-cols-1 gap-3.5">
                {sortedTasks.map((task) => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    lists={lists}
                    onToggleComplete={handleToggleComplete}
                    onToggleSubtask={handleToggleSubtask}
                    onDelete={handleDeleteTask}
                    onEdit={handleTriggerEdit}
                  />
                ))}
              </div>
            ) : (
              <div id="empty-state-space" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-lg mx-auto my-6 space-y-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 mx-auto">
                  <Search className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-900">No matching activities found</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Try refining your text queries, clearing priority pills, or choosing another Space List.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-150 rounded-xl hover:bg-indigo-100/50 transition-colors"
                  >
                    Reset Active Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(undefined);
                      setIsTaskModalOpen(true);
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-colors"
                  >
                    Create a Task
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto bg-white border-t border-gray-100 py-6 text-center text-[11px] text-gray-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <span>Personal Task Lists Applet • Standard React Environment</span>
          <div className="flex items-center gap-4">
            <button type="button" onClick={handleExportData} className="hover:text-gray-900 transition-colors">Export Database (JSON)</button>
            <button type="button" onClick={handleResetToSeedingTemplate} className="hover:text-gray-900 transition-colors">Reset Local Space</button>
          </div>
        </div>
      </footer>

      {/* Task Creation & Modification dialog core modal */}
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(undefined);
        }}
        onSave={handleSaveTask}
        lists={lists}
        task={editingTask}
        defaultListId={selectedListId}
      />

      {/* Category divisions creation dialog */}
      <ListModal 
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onSave={handleCreateList}
      />

    </div>
  );
}
