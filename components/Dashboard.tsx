
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Task, TaskStatus, Stats } from '../types';

interface DashboardProps {
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL' | null>(null);

  const stats: Stats = useMemo(() => {
    const s = { totalTasks: tasks.length, completedTasks: 0, overdueTasks: 0, pendingTasks: 0 };
    tasks.forEach(t => {
      if (t.status === TaskStatus.COMPLETED) s.completedTasks++;
      else if (t.status === TaskStatus.OVERDUE) s.overdueTasks++;
      else s.pendingTasks++;
    });
    return s;
  }, [tasks]);

  const filteredTasksList = useMemo(() => {
    if (!filterStatus || filterStatus === 'ALL') return [];
    return tasks.filter(t => {
      if (filterStatus === TaskStatus.PENDING) {
        return t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS;
      }
      return t.status === filterStatus;
    });
  }, [tasks, filterStatus]);

  const chartData = [
    { name: 'مكتملة', value: stats.completedTasks, color: '#10b981', status: TaskStatus.COMPLETED },
    { name: 'متأخرة', value: stats.overdueTasks, color: '#f43f5e', status: TaskStatus.OVERDUE },
    { name: 'نشطة', value: stats.pendingTasks, color: '#f59e0b', status: TaskStatus.PENDING },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="إجمالي المهام" 
          value={stats.totalTasks} 
          color="brand" 
          active={filterStatus === 'ALL'}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2"
          onClick={() => setFilterStatus(filterStatus === 'ALL' ? null : 'ALL')}
        />
        <StatCard 
          title="المنجزة بنجاح" 
          value={stats.completedTasks} 
          color="success" 
          active={filterStatus === TaskStatus.COMPLETED}
          icon="M5 13l4 4L19 7"
          onClick={() => setFilterStatus(filterStatus === TaskStatus.COMPLETED ? null : TaskStatus.COMPLETED)}
        />
        <StatCard 
          title="متأخرات العمل" 
          value={stats.overdueTasks} 
          color="danger" 
          active={filterStatus === TaskStatus.OVERDUE}
          icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          onClick={() => setFilterStatus(filterStatus === TaskStatus.OVERDUE ? null : TaskStatus.OVERDUE)}
        />
        <StatCard 
          title="قيد التنفيذ حالياً" 
          value={stats.pendingTasks} 
          color="warning" 
          active={filterStatus === TaskStatus.PENDING}
          icon="M13 10V3L4 14h7v7l9-11h-7z"
          onClick={() => setFilterStatus(filterStatus === TaskStatus.PENDING ? null : TaskStatus.PENDING)}
        />
      </div>

      {filterStatus && (
        <div className="bg-white/60 backdrop-blur-2xl p-10 rounded-[3.5rem] shadow-2xl border border-white/50 animate-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100/30 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50"></div>
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-2xl font-black flex items-center gap-5 text-slate-900">
              <span className="w-3 h-10 bg-slate-900 rounded-full shadow-lg"></span>
              تفاصيل الحالة: 
              <span className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-sm font-black shadow-xl">
                {filterStatus === 'ALL' ? 'الكل' : 
                 filterStatus === TaskStatus.COMPLETED ? 'المكتملة' : 
                 filterStatus === TaskStatus.OVERDUE ? 'المتأخرة' : 'قيد التنفيذ'}
              </span>
            </h3>
            <button onClick={() => setFilterStatus(null)} className="w-12 h-12 bg-white/40 flex items-center justify-center rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-white/60 shadow-sm backdrop-blur-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar relative z-10">
            {(filterStatus === 'ALL' ? tasks : filteredTasksList).map(task => (
              <div key={task.id} className="p-7 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border-2 border-white/60 hover:border-violet-300 hover:shadow-2xl transition-all group">
                <p className="font-black text-slate-800 mb-2 group-hover:text-violet-700 transition-colors line-clamp-1">{task.title}</p>
                <p className="text-[11px] text-slate-500 font-bold mb-5 line-clamp-2 leading-relaxed">{task.description}</p>
                <div className="flex justify-between items-center pt-5 border-t border-slate-200/40">
                   <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{task.deadline}</span>
                   </div>
                   <span className={`text-[9px] px-3 py-1 rounded-lg font-black tracking-widest uppercase shadow-sm border ${
                    task.status === TaskStatus.COMPLETED ? 'bg-emerald-500 text-white border-emerald-400' :
                    task.status === TaskStatus.OVERDUE ? 'bg-rose-500 text-white border-rose-400' :
                    'bg-amber-500 text-white border-amber-400'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white/60 backdrop-blur-2xl p-12 rounded-[4rem] shadow-2xl border border-white/50 hover:shadow-violet-200/40 transition-all duration-500 group">
          <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center font-black shadow-xl group-hover:rotate-6 transition-transform">1</div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">تحليل كفاءة المخرجات</h3>
          </div>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={chartData} 
                  innerRadius={110} 
                  outerRadius={140} 
                  paddingAngle={12} 
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} cursor="pointer" className="outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '25px', border: '1px solid rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontFamily: 'Tajawal', fontWeight: 'bold', direction: 'rtl' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '40px', fontFamily: 'Tajawal', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-2xl p-12 rounded-[4rem] shadow-2xl border border-white/50 hover:shadow-violet-200/40 transition-all duration-500 group">
          <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center font-black shadow-xl group-hover:rotate-6 transition-transform">2</div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">مؤشرات الإنجاز الكمي</h3>
          </div>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 'bold', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.3)', radius: 25 }} contentStyle={{ borderRadius: '25px', border: '1px solid rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 15px 35px -5px rgba(0,0,0,0.08)', direction: 'rtl' }} />
                <Bar dataKey="value" radius={[25, 25, 25, 25]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  color: 'brand' | 'success' | 'danger' | 'warning';
  onClick: () => void;
  active: boolean;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, onClick, active, icon }) => {
  const styles = {
    brand: { 
      light: 'bg-violet-100/50', 
      main: 'text-violet-600', 
      border: 'border-violet-300', 
      gradient: 'from-violet-600 to-indigo-700',
      shadow: 'shadow-violet-200' 
    },
    success: { 
      light: 'bg-emerald-100/50', 
      main: 'text-emerald-600', 
      border: 'border-emerald-300', 
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-200' 
    },
    danger: { 
      light: 'bg-rose-100/50', 
      main: 'text-rose-600', 
      border: 'border-rose-300', 
      gradient: 'from-rose-500 to-red-700',
      shadow: 'shadow-rose-200' 
    },
    warning: { 
      light: 'bg-amber-100/50', 
      main: 'text-amber-600', 
      border: 'border-amber-300', 
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-200' 
    },
  };

  const current = styles[color];

  return (
    <button 
      onClick={onClick}
      className={`relative group flex flex-col items-start p-8 rounded-[3rem] border-2 transition-all duration-500 overflow-hidden active:scale-95 text-right w-full backdrop-blur-xl ${
        active 
          ? `bg-white/80 ${current.border} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] scale-[1.05] z-10` 
          : 'bg-white/40 border-white/60 hover:border-white hover:bg-white/60 hover:shadow-2xl'
      }`}
    >
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-10 transition-opacity duration-500 ${active ? 'opacity-30' : 'group-hover:opacity-20'} bg-gradient-to-br ${current.gradient}`}></div>
      
      <div className="relative z-10 flex justify-between items-center w-full mb-6">
        <div className={`p-4 rounded-2xl transition-all duration-700 shadow-xl ${
          active 
            ? `bg-gradient-to-br ${current.gradient} text-white -rotate-6` 
            : `${current.light} ${current.main} group-hover:scale-110 group-hover:rotate-6`
        }`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon} /></svg>
        </div>
        
        {active && <div className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></div>}
      </div>

      <div className="relative z-10">
        <p className={`text-[11px] font-black uppercase tracking-[0.2em] mb-1.5 transition-colors ${
          active ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'
        }`}>{title}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
      
      <div className={`mt-6 w-full h-1.5 rounded-full bg-white/40 overflow-hidden`}>
        <div 
          className={`h-full rounded-full bg-gradient-to-l ${current.gradient} transition-all duration-1000 ${active ? 'w-full' : 'w-1/3'}`}
        ></div>
      </div>
    </button>
  );
};

export default Dashboard;
