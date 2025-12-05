import React from 'react';
import { Task, TaskStatus } from '../types';
import { CheckIcon, XIcon, TrashIcon, GripVerticalIcon } from './Icons';

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  
  // DnD Props
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnter?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  isDragged?: boolean;
  isDragOver?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onUpdateStatus, 
  onDelete, 
  onEdit,
  isDraggable = false,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragged,
  isDragOver
}) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isSkipped = task.status === TaskStatus.SKIPPED;
  const isPending = task.status === TaskStatus.PENDING;

  // DnD Style logic
  const dragStyle = isDragged ? 'opacity-30 scale-95' : 'opacity-100';
  const dragOverStyle = isDragOver ? 'mt-[50px] transition-[margin] duration-300' : 'mt-0 transition-[margin] duration-300';
  const containerClass = `
      relative flex items-center gap-2 p-3 bg-white rounded-xl border transition-all duration-200
      ${isCompleted ? 'border-green-100 bg-green-50/30' : ''}
      ${isSkipped ? 'border-red-100 bg-red-50/30 opacity-75' : ''}
      ${isPending ? 'border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] active:scale-[0.99]' : ''}
      ${dragStyle} ${dragOverStyle}
  `;

  return (
    <div 
      className={containerClass}
      draggable={isDraggable && isPending}
      onDragStart={(e) => isPending && onDragStart && onDragStart(e, task.id)}
      onDragEnter={(e) => isPending && onDragEnter && onDragEnter(e, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => isPending && onDrop && onDrop(e, task.id)}
      onDragEnd={onDragEnd}
    >
      {/* Squeeze Placeholder Indicator (Ghost box appearing above) */}
      {isDragOver && (
        <div className="absolute -top-[45px] left-0 right-0 h-[40px] border-2 border-dashed border-primary-200 bg-primary-50/50 rounded-xl pointer-events-none animate-pulse"></div>
      )}

      {/* Drag Handle */}
      {isDraggable && isPending && (
        <div className="text-gray-300 cursor-grab hover:text-gray-500 shrink-0 touch-none">
          <GripVerticalIcon className="w-5 h-5" />
        </div>
      )}

      {/* Content Area (Clickable for Edit) */}
      <div 
        className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer group select-none"
        onClick={() => onEdit(task)}
      >
        <div className="flex items-center gap-2 mb-0.5">
          {/* Device Badge (Left of Title) */}
          <span className={`
             shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-medium border
             ${isCompleted ? 'bg-green-100 text-green-700 border-green-200' : 
               isSkipped ? 'bg-red-50 text-red-400 border-red-100' : 
               'bg-gray-100 text-gray-500 border-gray-200 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-100 transition-colors'}
          `}>
            {task.device}
          </span>

          {/* Title */}
          <h3 className={`font-bold text-gray-800 text-sm truncate leading-tight transition-colors ${
            isCompleted || isSkipped ? 'line-through text-gray-400' : 'group-hover:text-primary-600'
          }`}>
            {task.name}
          </h3>
        </div>
        
        {/* Metadata Row (Description/App/Url) */}
        <div className="flex items-center gap-2 text-[10px] text-gray-400 truncate h-4 pl-0.5">
          {task.appOrUrl && (
             <span className="truncate text-gray-500">{task.appOrUrl}</span>
          )}
          {task.appOrUrl && task.description && (
             <span className="text-gray-300">|</span>
          )}
          {task.description && (
            <span className="truncate text-gray-400">{task.description}</span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {isPending ? (
          <>
            {/* Complete Button */}
            <button
              onClick={() => onUpdateStatus(task.id, TaskStatus.COMPLETED)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 active:scale-90 transition-all border border-green-100"
              title="完成"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
            
            {/* Skip Button */}
            <button
              onClick={() => onUpdateStatus(task.id, TaskStatus.SKIPPED)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:scale-90 transition-all border border-gray-100"
              title="跳过"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </>
        ) : (
          /* Undo Button (for Completed/Skipped) */
          <button
            onClick={() => onUpdateStatus(task.id, TaskStatus.PENDING)}
            className="px-2 py-1 text-xs font-medium text-gray-400 bg-white border border-gray-200 rounded-md hover:bg-gray-50 active:scale-95"
          >
            撤销
          </button>
        )}

        {/* Delete Button (Always visible but small) */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 active:bg-red-50 rounded-full transition-colors ml-1"
          title="删除"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;