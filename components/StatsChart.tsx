import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Task, TaskStatus } from '../types';

interface StatsChartProps {
  tasks: Task[];
}

const StatsChart: React.FC<StatsChartProps> = ({ tasks }) => {
  const pendingCount = tasks.filter(t => t.status === TaskStatus.PENDING).length;
  const completedCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const skippedCount = tasks.filter(t => t.status === TaskStatus.SKIPPED).length;

  const data = [
    { name: '待办', value: pendingCount, color: '#94a3b8' }, // Slate 400
    { name: '完成', value: completedCount, color: '#22c55e' }, // Green 500
    { name: '跳过', value: skippedCount, color: '#ef4444' }, // Red 500
  ];

  // If no tasks, show a placeholder
  if (tasks.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
        暂无任务数据
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={65}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value} 个`, '']}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-xs text-gray-500 mt-[-10px]">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
            <span>{d.name} ({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsChart;