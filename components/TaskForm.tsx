import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { generateTaskSuggestion } from '../services/geminiService';
import { SparklesIcon, PlusIcon, XIcon, CheckIcon } from './Icons';

interface TaskFormProps {
  initialTask?: Task; // Optional prop for editing
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  availableDevices: string[];
}

const TaskForm: React.FC<TaskFormProps> = ({ initialTask, onSave, onClose, availableDevices }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [checkInTime, setCheckInTime] = useState('09:00');
  const [device, setDevice] = useState<string>(availableDevices[0] || '');
  const [appOrUrl, setAppOrUrl] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with initialTask if provided
  useEffect(() => {
    if (initialTask) {
      setName(initialTask.name);
      setDescription(initialTask.description);
      setCheckInTime(initialTask.checkInTime);
      setDevice(initialTask.device);
      setAppOrUrl(initialTask.appOrUrl);
    } else {
        // Reset defaults if no initialTask (useful if component is reused without unmount, though mostly unmounted)
        setDevice(availableDevices[0] || '');
    }
  }, [initialTask, availableDevices]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      checkInTime,
      device: device || availableDevices[0] || 'Unknown',
      appOrUrl,
      status: initialTask ? initialTask.status : TaskStatus.PENDING,
    });
  };

  const handleSmartFill = async () => {
    if (!name.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const suggestion = await generateTaskSuggestion(name);
      setName(suggestion.name);
      setDescription(suggestion.description);
      setCheckInTime(suggestion.checkInTime);
      
      // Match suggested device with available devices
      if (availableDevices.includes(suggestion.device)) {
        setDevice(suggestion.device);
      } else if (availableDevices.length > 0) {
        setDevice(availableDevices[0]);
      }
      
      setAppOrUrl(suggestion.appOrUrl);
    } catch (err) {
      setError('AI 生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {initialTask ? '编辑任务' : '添加新任务'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Input with AI Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：背单词, 健身..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={handleSmartFill}
                  disabled={isGenerating || !name.trim()}
                  className={`px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md flex items-center gap-2 transition-all
                    ${isGenerating || !name.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105 active:scale-95'}
                  `}
                  title="输入任务名，点击让 AI 自动填充"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <SparklesIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium hidden sm:inline">智能填充</span>
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              {!initialTask && <p className="text-xs text-gray-400 mt-1">输入关键词后点击 ✨智能填充，AI 将帮你完善细节。</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">说明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="任务的具体描述或备注"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">签到时间</label>
                <input
                  type="time"
                  required
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">设备</label>
                <div className="relative">
                  <select
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white pr-8 text-gray-700"
                  >
                    {availableDevices.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">应用或网址</label>
              <input
                type="text"
                value={appOrUrl}
                onChange={(e) => setAppOrUrl(e.target.value)}
                placeholder="例如：Chrome, 微信, Notion"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {initialTask ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                {initialTask ? '保存修改' : '添加任务'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;