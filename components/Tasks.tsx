
import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, Department, Employee, Priority, User, Project } from '../types';

interface TasksProps {
  tasks: Task[];
  departments: Department[];
  employees: Employee[];
  user: User;
  project: Project | null;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, departments, employees, user, project, onAddTask, onUpdateStatus }) => {
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL');
  
  // Advanced Filter States
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [filterEmp, setFilterEmp] = useState<string>('ALL');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');

  const [statusChangeRequest, setStatusChangeRequest] = useState<{ id: string, status: TaskStatus } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: departments[0]?.id || '',
    employeeId: employees[0]?.id || '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    priority: Priority.MEDIUM,
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
      const matchesDept = filterDept === 'ALL' || t.departmentId === filterDept;
      const matchesEmp = filterEmp === 'ALL' || t.employeeId === filterEmp;
      const matchesDateStart = !dateStart || t.deadline >= dateStart;
      const matchesDateEnd = !dateEnd || t.deadline <= dateEnd;
      
      return matchesSearch && matchesPriority && matchesDept && matchesEmp && matchesDateStart && matchesDateEnd;
    });
  }, [tasks, searchTerm, filterPriority, filterDept, filterEmp, dateStart, dateEnd]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterPriority('ALL');
    setFilterDept('ALL');
    setFilterEmp('ALL');
    setDateStart('');
    setDateEnd('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    onAddTask({
      ...formData,
      projectId: project.id,
      status: TaskStatus.PENDING,
    });
    setShowModal(false);
    setFormData({
      title: '',
      description: '',
      departmentId: departments[0]?.id || '',
      employeeId: employees[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      deadline: '',
      priority: Priority.MEDIUM,
    });
  };

  const confirmStatusChange = () => {
    if (statusChangeRequest) {
      onUpdateStatus(statusChangeRequest.id, statusChangeRequest.status);
      setStatusChangeRequest(null);
    }
  };

  const statusLabels: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'قيد الانتظار',
    [TaskStatus.IN_PROGRESS]: 'قيد التنفيذ',
    [TaskStatus.COMPLETED]: 'مكتملة',
    [TaskStatus.OVERDUE]: 'متأخرة',
  };

  const priorityConfig = {
    [Priority.HIGH]: {
      bg: 'bg-rose-50/30',
      border: 'border-rose-100',
      hoverBorder: 'hover:border-rose-400',
      shadow: 'hover:shadow-rose-200/50',
      accent: 'bg-rose-500',
      text: 'text-rose-700',
      badge: 'bg-rose-500 text-white border-rose-400 shadow-rose-200',
      label: 'عالية جداً'
    },
    [Priority.MEDIUM]: {
      bg: 'bg-amber-50/30',
      border: 'border-amber-100',
      hoverBorder: 'hover:border-amber-400',
      shadow: 'hover:shadow-amber-200/50',
      accent: 'bg-amber-500',
      text: 'text-amber-700',
      badge: 'bg-amber-500 text-white border-amber-400 shadow-amber-200',
      label: 'متوسطة'
    },
    [Priority.LOW]: {
      bg: 'bg-emerald-50/30',
      border: 'border-emerald-100',
      hoverBorder: 'hover:border-emerald-400',
      shadow: 'hover:shadow-emerald-200/50',
      accent: 'bg-emerald-500',
      text: 'text-emerald-700',
      badge: 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-200',
      label: 'عادية'
    }
  };

  const requestedTask = statusChangeRequest ? tasks.find(t => t.id === statusChangeRequest.id) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">إدارة العمليات والمهام</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">تتبع مسار الإنجاز ووزع المسؤوليات بذكاء</p>
        </div>
        {user.role === 'Admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-l from-violet-600 to-indigo-700 text-white px-10 py-5 rounded-[1.75rem] font-black text-lg hover:shadow-2xl hover:shadow-violet-200 hover:-translate-y-1 transition-all duration-300 shadow-xl flex items-center gap-3 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            إدراج مهمة جديدة
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white/50 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/60">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 relative w-full">
            <input 
              type="text" 
              placeholder="البحث عن اسم المهمة..." 
              className="w-full h-14 pr-12 pl-6 rounded-2xl border-2 border-white/40 bg-white/40 focus:bg-white focus:border-violet-500 transition-all font-bold outline-none text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute right-4 top-4 w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 h-14 rounded-2xl font-black text-xs transition-all border-2 flex items-center gap-2 ${showFilters ? 'bg-violet-600 text-white border-violet-600' : 'bg-white/30 text-slate-500 border-white/60 hover:bg-white/60'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              تصفية متقدمة
            </button>
            <div className="hidden md:flex gap-2">
              {(['ALL', Priority.HIGH, Priority.MEDIUM, Priority.LOW] as const).map(p => (
                <button 
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-4 py-3 rounded-2xl font-black text-[10px] transition-all border-2 backdrop-blur-md ${filterPriority === p ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white/30 text-slate-500 border-white/60 hover:bg-white/60'}`}
                >
                  {p === 'ALL' ? 'الكل' : p === Priority.HIGH ? 'العاجلة' : p === Priority.MEDIUM ? 'المتوسطة' : 'العادية'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Filters Expandable Section */}
        {showFilters && (
          <div className="mt-8 pt-8 border-t border-white/40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تصفية حسب القسم</label>
              <select 
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-white/60 bg-white/40 font-bold text-sm outline-none focus:bg-white transition-all"
              >
                <option value="ALL">جميع الأقسام</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تصفية حسب الموظف</label>
              <select 
                value={filterEmp}
                onChange={(e) => setFilterEmp(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-white/60 bg-white/40 font-bold text-sm outline-none focus:bg-white transition-all"
              >
                <option value="ALL">جميع الموظفين</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">من تاريخ (Deadline)</label>
              <input 
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-white/60 bg-white/40 font-bold text-sm outline-none focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">إلى تاريخ (Deadline)</label>
              <div className="flex gap-2">
                <input 
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-white/60 bg-white/40 font-bold text-sm outline-none focus:bg-white transition-all flex-1"
                />
                <button 
                  onClick={resetFilters}
                  className="h-12 w-12 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl border-2 border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                  title="إعادة ضبط"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredTasks.length > 0 ? filteredTasks.map(task => {
          const emp = employees.find(e => e.id === task.employeeId);
          const dept = departments.find(d => d.id === task.departmentId);
          const config = priorityConfig[task.priority];
          
          return (
            <div 
              key={task.id} 
              className={`backdrop-blur-xl p-8 rounded-[3.5rem] border-2 transition-all duration-500 group relative overflow-hidden shadow-sm ${config.bg} ${config.border} ${config.hoverBorder} ${config.shadow}`}
            >
              <div className={`absolute top-0 right-0 w-2.5 h-full ${config.accent}`}></div>
              
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-5 mb-4">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border shadow-lg ${config.badge}`}>
                      {config.label}
                    </span>
                    <h4 className={`text-2xl font-black transition-colors ${config.text} group-hover:text-slate-900`}>
                      {task.title}
                    </h4>
                  </div>
                  <p className="text-slate-600 text-base line-clamp-2 leading-relaxed mb-6 font-medium">
                    {task.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-white/80 shadow-sm">
                      <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center font-black text-xs shadow-lg ${config.accent}`}>
                        {emp?.name[0] || '؟'}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-xs font-black text-slate-700 uppercase tracking-wider">{emp?.name || 'غير محدد'}</div>
                        <div className="text-[10px] font-bold text-slate-400">{dept?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-white/80 shadow-sm">
                       <svg className={`w-5 h-5 ${config.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{task.deadline}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end xl:self-center">
                  <select
                    value={task.status}
                    onChange={(e) => setStatusChangeRequest({ id: task.id, status: e.target.value as TaskStatus })}
                    className="h-14 px-8 border-2 border-white/60 rounded-2xl bg-white/80 backdrop-blur-md focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all font-black text-xs outline-none cursor-pointer shadow-sm"
                  >
                    <option value={TaskStatus.PENDING}>قيد الانتظار</option>
                    <option value={TaskStatus.IN_PROGRESS}>قيد التنفيذ</option>
                    <option value={TaskStatus.COMPLETED}>مكتملة</option>
                    <option value={TaskStatus.OVERDUE}>متأخرة</option>
                  </select>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-20 text-center bg-white/40 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-slate-200">
            <p className="text-slate-400 font-black text-xl italic">لا توجد مهام مطابقة لخيارات البحث الحالية</p>
            <button onClick={resetFilters} className="mt-4 text-violet-600 font-black text-sm hover:underline">عرض جميع المهام</button>
          </div>
        )}
      </div>

      {/* Confirmation Modal and Task Add Modal (Existing Logic) */}
      {statusChangeRequest && requestedTask && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 animate-in zoom-in-95 shadow-2xl border border-violet-100">
             <div className="text-center mb-8">
                <div className="w-20 h-20 bg-violet-50 text-violet-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">تحديث حالة المهمة</h3>
                <div className="bg-slate-50 p-6 rounded-3xl mt-6 border border-slate-100 shadow-inner">
                  <p className="text-slate-700 text-sm font-bold leading-relaxed mb-2">
                    هل أنت متأكد من رغبتك في تغيير حالة 
                    <span className="text-violet-600 block my-1 font-black text-base">"{requestedTask.title}"</span>
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs font-black">
                    <span className="text-slate-400 line-through">{statusLabels[requestedTask.status]}</span>
                    <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                    <span className="text-violet-600 bg-violet-50 px-3 py-1 rounded-lg border border-violet-100">{statusLabels[statusChangeRequest.status]}</span>
                  </div>
                </div>
             </div>
             <div className="flex gap-4">
                <button 
                  onClick={confirmStatusChange}
                  className="flex-[2] bg-violet-600 text-white h-16 rounded-2xl font-black hover:bg-violet-700 transition-all shadow-xl shadow-violet-100"
                >
                  تأكيد التغيير
                </button>
                <button 
                  onClick={() => setStatusChangeRequest(null)}
                  className="flex-1 bg-slate-100 text-slate-500 h-16 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  تراجع
                </button>
             </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-3xl rounded-[4rem] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_50px_100px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300 border border-white/50 overflow-hidden text-right" dir="rtl">
            <div className="p-8 border-b border-white/20 flex justify-between items-center bg-white/20 shrink-0">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">إسناد مهمة جديدة</h3>
              <button onClick={() => setShowModal(false)} className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] bg-white/50 text-slate-400 hover:text-rose-500 shadow-xl border border-white/60 transition-all active:scale-95">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-10 custom-scrollbar flex-1">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 mr-3">عنوان المهمة</label>
                    <input
                      type="text"
                      required
                      placeholder="أدخل عنوان المهمة باختصار..."
                      className="w-full h-16 px-8 rounded-3xl border-2 border-white/50 bg-white/50 focus:bg-white focus:border-violet-500 transition-all font-black text-xl outline-none shadow-inner text-slate-800"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 mr-3">وصف وتفاصيل المهمة</label>
                    <textarea
                      rows={6}
                      placeholder="اكتب هنا تفاصيل المهمة والخطوات المطلوبة..."
                      className="w-full p-8 rounded-[2.5rem] border-2 border-white/50 bg-white/50 focus:bg-white focus:border-violet-500 transition-all font-bold leading-relaxed outline-none shadow-inner text-slate-700"
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 mr-3">الأولوية</label>
                    <select 
                      className="w-full h-16 px-8 rounded-3xl border-2 border-white/50 bg-white/50 font-black focus:bg-white focus:border-violet-500 transition-all outline-none"
                      value={formData.priority}
                      onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                    >
                      <option value={Priority.HIGH}>عاجلة جداً</option>
                      <option value={Priority.MEDIUM}>متوسطة الأهمية</option>
                      <option value={Priority.LOW}>عادية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 mr-3">الموظف المسؤول</label>
                    <select 
                      className="w-full h-16 px-8 rounded-3xl border-2 border-white/50 bg-white/50 font-black focus:bg-white focus:border-violet-500 transition-all outline-none"
                      value={formData.employeeId}
                      onChange={e => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    >
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({departments.find(d => d.id === e.departmentId)?.name})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 mr-3">تاريخ البدء</label>
                    <input
                      type="date"
                      className="w-full h-16 px-8 rounded-3xl border-2 border-white/50 bg-white/50 font-black"
                      value={formData.startDate}
                      onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 mr-3">الموعد النهائي</label>
                    <input
                      type="date"
                      required
                      className="w-full h-16 px-8 rounded-3xl border-2 border-white/50 bg-white/50 font-black"
                      value={formData.deadline}
                      onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="pt-6 pb-4 flex gap-6 sticky bottom-0 bg-white/10 backdrop-blur-md">
                  <button type="submit" className="flex-[2] bg-gradient-to-l from-violet-600 to-indigo-700 text-white h-20 rounded-[2rem] font-black text-xl hover:shadow-2xl hover:shadow-violet-200 hover:-translate-y-1 transition-all active:scale-95">حفظ المهمة</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border border-slate-200 text-slate-500 h-20 rounded-[2rem] font-black text-lg hover:bg-slate-50 transition-all">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
