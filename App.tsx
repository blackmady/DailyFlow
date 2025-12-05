import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, DEFAULT_DEVICES } from './types';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import ConfirmModal from './components/ConfirmModal';
import { PlusIcon, SettingsIcon, DownloadIcon, UploadIcon, XIcon, TrashIcon, EditIcon, CheckIcon } from './components/Icons';

const App: React.FC = () => {
  // Local Persistence with Error Handling
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('dailyflow_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse tasks from localStorage:", e);
      return [];
    }
  });

  const [devices, setDevices] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dailyflow_devices');
      return saved ? JSON.parse(saved) : DEFAULT_DEVICES;
    } catch (e) {
      console.error("Failed to parse devices from localStorage:", e);
      return DEFAULT_DEVICES;
    }
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null); // Track the task being edited
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  
  // Settings State
  const [activeTab, setActiveTab] = useState<'data' | 'devices'>('data');
  const [newDevice, setNewDevice] = useState('');
  const [editingDeviceIndex, setEditingDeviceIndex] = useState<number | null>(null);
  const [editingDeviceValue, setEditingDeviceValue] = useState('');
  
  // Import State
  const [importText, setImportText] = useState('');

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'confirm' | 'alert';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dailyflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('dailyflow_devices', JSON.stringify(devices));
  }, [devices]);

  // Reset import text when settings close
  useEffect(() => {
    if (!isSettingsOpen) {
      setImportText('');
    }
  }, [isSettingsOpen]);

  // Modal Helpers
  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const showAlert = (title: string, message: string) => {
    setModalState({
      isOpen: true,
      type: 'alert',
      title,
      message,
      onConfirm: closeModal,
    });
  };

  const showConfirm = (title: string, message: string, onYes: () => void) => {
    setModalState({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm: () => {
        onYes();
        closeModal();
      },
    });
  };

  // --- Task Management ---

  const handleOpenAddForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(t => 
        t.id === editingTask.id 
          ? { ...t, ...taskData } // Keep original ID and createdAt
          : t
      ));
    } else {
      // Add new task
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      // Add to end of list
      setTasks(prev => [...prev, newTask]);
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTask = (id: string) => {
    showConfirm('删除任务', '确定要删除这个任务吗？此操作无法撤销。', () => {
      setTasks(prev => prev.filter(t => t.id !== id));
    });
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    // Set dragged ID
    setDraggedTaskId(id);
    // Important for Firefox to allow drag
    e.dataTransfer.effectAllowed = 'move';
    // Ghost image handling can be default or custom
  };

  const handleDragEnter = (e: React.DragEvent, id: string) => {
    // If we are dragging something and it's not the same item
    if (draggedTaskId && draggedTaskId !== id) {
      setDragOverTaskId(id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (draggedTaskId && draggedTaskId !== targetId) {
      const copy = [...tasks];
      const fromIndex = copy.findIndex(t => t.id === draggedTaskId);
      const toIndex = copy.findIndex(t => t.id === targetId);

      if (fromIndex !== -1 && toIndex !== -1) {
        // Move item
        const [movedItem] = copy.splice(fromIndex, 1);
        copy.splice(toIndex, 0, movedItem);
        setTasks(copy);
      }
    }
    
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };


  // --- Device Management ---
  const handleAddDevice = () => {
    if (newDevice.trim() && !devices.includes(newDevice.trim())) {
      setDevices([...devices, newDevice.trim()]);
      setNewDevice('');
    }
  };

  const handleDeleteDevice = (index: number) => {
    showConfirm('删除设备', `确定要删除 "${devices[index]}" 吗？`, () => {
      setDevices(devices.filter((_, i) => i !== index));
    });
  };

  const startEditingDevice = (index: number) => {
    setEditingDeviceIndex(index);
    setEditingDeviceValue(devices[index]);
  };

  const saveEditingDevice = (index: number) => {
    if (editingDeviceValue.trim() && !devices.some((d, i) => i !== index && d === editingDeviceValue.trim())) {
      const newDevices = [...devices];
      newDevices[index] = editingDeviceValue.trim();
      setDevices(newDevices);
      setEditingDeviceIndex(null);
    } else if (editingDeviceValue.trim() === devices[index]) {
      setEditingDeviceIndex(null);
    } else {
        showAlert('无法保存', '设备名称不能为空或已存在');
    }
  };

  // --- Data Export/Import ---
  const handleExport = () => {
    const backupData = {
        tasks,
        devices,
        version: 1
    };
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dailyflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImportConfirm = () => {
    if (!importText.trim()) return;

    try {
      const data = JSON.parse(importText);
      
      // Handle legacy export (array of tasks) or new export (object)
      let importedTasks: Task[] = [];
      let importedDevices: string[] | null = null;

      if (Array.isArray(data)) {
          importedTasks = data;
      } else if (data.tasks && Array.isArray(data.tasks)) {
          importedTasks = data.tasks;
          if (data.devices && Array.isArray(data.devices)) {
              importedDevices = data.devices;
          }
      } else {
          showAlert('导入失败', '数据格式无法识别');
          return;
      }

      if (importedTasks.length > 0 || (data.tasks && data.tasks.length === 0)) {
         const isValid = importedTasks.every((t: any) => t.id && t.name && t.checkInTime);
         if (isValid) {
             showConfirm(
               '恢复数据', 
               '确定要恢复数据吗？这将覆盖当前数据且无法撤销。', 
               () => {
                 setTasks(importedTasks);
                 if (importedDevices) {
                     setDevices(importedDevices);
                 }
                 setIsSettingsOpen(false);
                 setImportText('');
                 // Use setTimeout to allow the confirm modal to close fully before showing success alert
                 setTimeout(() => {
                   showAlert('成功', '数据导入成功！');
                 }, 300);
               }
             );
         } else {
             showAlert('导入失败', '任务数据格式不正确');
         }
      } else {
          showAlert('导入失败', '未找到有效的任务数据');
      }

    } catch (err) {
      console.error(err);
      showAlert('导入失败', 'JSON 格式错误');
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === TaskStatus.PENDING);

  const today = new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white sticky top-0 z-20 border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              DailyFlow
            </h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-full transition-colors"
              title="设置"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-100 to-purple-100 flex items-center justify-center text-primary-600 font-bold text-[10px] border border-white shadow-sm">
              AI
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Filter Segmented Control */}
        <div className="flex p-1 bg-white rounded-lg shadow-sm border border-gray-100 w-full">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              filter === 'all' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-500 active:bg-gray-50'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              filter === 'pending' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-500 active:bg-gray-50'
            }`}
          >
            待办
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <div className="text-5xl mb-4 grayscale">📝</div>
              <p className="text-sm text-gray-500 font-medium">
                {filter === 'pending' && tasks.length > 0 ? '任务已全部完成！' : '暂无任务，点击右下角添加'}
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onUpdateStatus={updateTaskStatus}
                onDelete={deleteTask}
                onEdit={handleOpenEditForm}
                
                // DnD Props
                isDraggable={filter === 'all'} // Only allow dragging when showing all tasks
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDragged={draggedTaskId === task.id}
                isDragOver={dragOverTaskId === task.id}
              />
            ))
          )}
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={handleOpenAddForm}
          className="flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-xl shadow-primary-600/30 active:scale-95 transition-all focus:outline-none"
          aria-label="Add Task"
        >
          <PlusIcon className="w-7 h-7" />
        </button>
      </div>

      {/* Add/Edit Task Modal */}
      {isFormOpen && (
        <TaskForm 
          initialTask={editingTask || undefined}
          onSave={handleSaveTask} 
          onClose={() => setIsFormOpen(false)} 
          availableDevices={devices}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-800">设置</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                <button 
                  onClick={() => setActiveTab('data')}
                  className={`flex-1 py-3 text-sm font-medium ${activeTab === 'data' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
                >
                  数据备份
                </button>
                <button 
                  onClick={() => setActiveTab('devices')}
                  className={`flex-1 py-3 text-sm font-medium ${activeTab === 'devices' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
                >
                  设备管理
                </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {activeTab === 'data' ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      导出当前任务和配置为 JSON 文件。
                    </p>
                    <button 
                      onClick={handleExport}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-primary-50 active:bg-primary-100 text-primary-700 rounded-xl transition-colors text-sm font-semibold border border-primary-100"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      导出数据 (Export)
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 mb-2">
                      恢复数据 (请粘贴 JSON 内容或上传文件)
                    </p>
                    <textarea 
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder='{"tasks": [...], "devices": [...]}'
                      className="w-full h-32 p-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3 resize-none"
                    />
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={handleImportClick}
                        className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-white text-gray-600 rounded-lg transition-colors text-xs font-medium border border-gray-300 hover:bg-gray-50"
                      >
                        <UploadIcon className="w-4 h-4" />
                        读取文件
                      </button>
                      
                      <button 
                        onClick={handleImportConfirm}
                        disabled={!importText.trim()}
                        className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-primary-600 text-white rounded-lg transition-colors text-xs font-medium shadow-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckIcon className="w-4 h-4" />
                        确认导入
                      </button>
                    </div>

                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".json"
                      className="hidden" 
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">管理在添加任务时可选的设备列表。</p>
                  
                  <div className="space-y-2">
                    {devices.map((device, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group">
                        {editingDeviceIndex === index ? (
                            <>
                                <input 
                                    className="flex-1 bg-white border border-primary-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    value={editingDeviceValue}
                                    onChange={(e) => setEditingDeviceValue(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if(e.key === 'Enter') saveEditingDevice(index);
                                    }}
                                />
                                <button onClick={() => saveEditingDevice(index)} className="text-green-600 hover:text-green-700 p-1">
                                    <CheckIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingDeviceIndex(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="flex-1 text-sm text-gray-700">{device}</span>
                                <button onClick={() => startEditingDevice(index)} className="text-gray-400 hover:text-blue-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <EditIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteDevice(index)} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <input 
                      type="text"
                      value={newDevice}
                      onChange={(e) => setNewDevice(e.target.value)}
                      placeholder="新设备名称"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddDevice()}
                    />
                    <button 
                      onClick={handleAddDevice}
                      disabled={!newDevice.trim()}
                      className="bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      添加
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Confirmation/Alert Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={closeModal}
      />
    </div>
  );
};

export default App;