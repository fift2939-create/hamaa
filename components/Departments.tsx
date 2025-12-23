
import React, { useState, useMemo } from 'react';
import { Department, Employee, Task, TaskStatus } from '../types';

interface DepartmentsProps {
  departments: Department[];
  employees: Employee[];
  tasks: Task[];
  onAddDepartment: (name: string, color: string) => void;
  onDeleteDepartment: (id: string) => void;
}

const PRESET_COLORS = [
  { name: 'البنفسجي', value: '#8b5cf6' },
  { name: 'الأزرق', value: '#3b82f6' },
  { name: 'الأخضر', value: '#10b981' },
  { name: 'البرتقالي', value: '#f59e0b' },
  { name: 'الأحمر', value: '#f43f5e' },
  { name: 'الوردي', value: '#ec4899' },
  { name: 'السماوي', value: '#0ea5e9' },
  { name: 'النيلي', value: '#6366f1' },
];

const Departments: React.FC<DepartmentsProps> = ({ departments, employees, tasks, onAddDepartment, onDeleteDepartment }) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || '');
  const [showModal, setShowModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);

  const selectedDept = departments.find(d => d.id === selectedDeptId);
  
  const deptEmployees = useMemo(() => 
    employees.filter(e => e.departmentId === selectedDeptId),
  [employees, selectedDeptId]);

  const deptTasks = useMemo(() => 
    tasks.filter(t => t.departmentId === selectedDeptId),
  [tasks, selectedDeptId]);

  const stats = useMemo(() => {
    const total = deptTasks.length;
    const completed = deptTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const overdue = deptTasks.filter(t => t.status === TaskStatus.OVERDUE).length;
    return { total, completed, overdue, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [deptTasks]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDeptName.trim()) {
      onAddDepartment(newDeptName, selectedColor);
      setNewDeptName('');
      setShowModal(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Sidebar - Departments List */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">الأقسام</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            title="إضافة قسم"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3">
          {departments.map(dept => {
            const isActive = selectedDeptId === dept.id;
            const taskCount = tasks.filter(t => t.departmentId === dept.id).length;
            const deptColor = dept.color || '#6366f1';

            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={`w-full text-right px-5 py-5 rounded-3xl border-2 transition-all flex items-center justify-between group relative overflow-hidden ${
                  isActive 
                  ? 'bg-white text-slate-900 border-indigo-600 shadow-xl shadow-indigo-100 scale-[1.02]' 
                  : 'bg-white text-slate-700 border-slate-100 hover:border-indigo-200'
                }`}
              >
                {/* Visual indicator for color */}
                <div 
                  className="absolute right-0 top-0 bottom-0 w-1.5 transition-all"
                  style={{ backgroundColor: deptColor }}
                ></div>

                <div className="flex items-center gap-3">
                  <div 
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'shadow-inner' : 'bg-slate-50'}`}
                    style={{ 
                      backgroundColor: isActive ? `${deptColor}20` : '#f8fafc',
                      color: deptColor 
                    }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <div className="text-right">
                    <span className="font-black block">{dept.name}</span>
                    <span className={`text-[10px] ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                      {taskCount} مهمة
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   {isActive && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteDepartment(dept.id); }}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                  {/* Small Dot indicator always visible */}
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: deptColor }}
                  ></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Detail Area */}
      <div className="flex-1 space-y-8">
        {selectedDept ? (
          <>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
              {/* Color Header Stripe */}
              <div 
                className="absolute top-0 left-0 w-full h-3"
                style={{ backgroundColor: selectedDept.color || '#6366f1' }}
              ></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 mt-4">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-4xl font-black text-slate-900">{selectedDept.name}</h1>
                    <span 
                      className="px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-lg"
                      style={{ backgroundColor: selectedDept.color || '#6366f1' }}
                    >
                      مُعرّف القسم
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium">إدارة الموارد والمهام الخاصة بالقسم</p>
                </div>
                <div 
                  className="p-8 rounded-[2rem] text-white flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: selectedDept.color || '#6366f1',
                    boxShadow: `0 20px 40px -10px ${(selectedDept.color || '#6366f1')}40`
                  }}
                >
                  <p className="text-xs font-bold mb-1 opacity-80 uppercase tracking-widest">معدل الإنجاز</p>
                  <p className="text-4xl font-black">{stats.completionRate}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox label="القوى العاملة" value={deptEmployees.length} sub="موظف مسجل" />
                <StatBox label="إجمالي المهام" value={stats.total} sub="مهمة في الخطة" />
                <StatBox label="عراقيل حالية" value={stats.overdue} sub="مهمة متأخرة" color="rose" />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Employees List */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <span 
                      className="w-2.5 h-7 rounded-full"
                      style={{ backgroundColor: selectedDept.color || '#6366f1' }}
                    ></span>
                    فريق العمل
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">{deptEmployees.length} أعضاء</span>
                </div>
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {deptEmployees.length > 0 ? deptEmployees.map(emp => (
                    <div key={emp.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border-2 border-transparent hover:border-slate-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black shadow-sm group-hover:text-white transition-all"
                          style={{ 
                            color: selectedDept.color || '#6366f1'
                          }}
                        >
                          {emp.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{emp.name}</p>
                          <p className="text-xs text-slate-500 font-bold">{emp.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${emp.phone}`} className="p-2 text-slate-400 hover:text-indigo-600 bg-white rounded-xl shadow-sm border border-slate-100">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </a>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                      <p className="text-slate-400 text-sm font-bold italic">لا يوجد موظفون مخصصون لهذا القسم</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks List */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <span className="w-2.5 h-7 bg-amber-500 rounded-full"></span>
                    المهام النشطة
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">{deptTasks.length} مهام</span>
                </div>
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {deptTasks.length > 0 ? deptTasks.map(task => (
                    <div key={task.id} className="p-5 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-slate-100 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-black text-slate-800 text-sm">{task.title}</h4>
                        <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase shadow-sm ${
                          task.status === TaskStatus.COMPLETED ? 'bg-emerald-500 text-white' :
                          task.status === TaskStatus.OVERDUE ? 'bg-rose-500 text-white' :
                          'bg-amber-500 text-white'
                        }`}>
                          {task.status === TaskStatus.COMPLETED ? 'منجز' : task.status === TaskStatus.OVERDUE ? 'متأخر' : 'قيد العمل'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black shadow-sm"
                            style={{ color: selectedDept.color || '#6366f1' }}
                          >
                            {employees.find(e => e.id === task.employeeId)?.name[0]}
                          </div>
                          <span className="text-[10px] text-slate-600 font-bold">{employees.find(e => e.id === task.employeeId)?.name}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {task.deadline}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                      <p className="text-slate-400 text-sm font-bold italic">لا توجد مهام حالية في هذا القسم</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-24 rounded-[3rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-6 border border-slate-100 shadow-inner">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">يرجى اختيار قسم للمعاينة</h3>
            <p className="text-slate-500 font-medium">اختر من القائمة الجانبية لعرض بيانات الموظفين والمهام التفصيلية</p>
          </div>
        )}
      </div>

      {/* Add Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-slate-100">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900">إضافة قسم جديد</h3>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 flex items-center justify-center transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-8">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 mr-2">اسم القسم الجديد</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-black"
                  placeholder="مثال: الإدارة المالية"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 mr-2">لون تعريف القسم</label>
                <div className="grid grid-cols-4 gap-4">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSelectedColor(color.value)}
                      className={`h-12 rounded-2xl transition-all relative flex items-center justify-center group ${selectedColor === color.value ? 'scale-110 shadow-lg' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-[2] bg-indigo-600 text-white h-16 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95">حفظ القسم</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-50 text-slate-500 h-16 rounded-2xl font-black hover:bg-slate-100 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, sub, color = "indigo" }: { label: string, value: number, sub: string, color?: "indigo" | "rose" }) => (
  <div className={`p-6 rounded-[1.5rem] border-2 transition-all ${color === 'rose' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
    <p className={`text-[10px] font-black mb-2 uppercase tracking-widest ${color === 'rose' ? 'text-rose-600' : 'text-slate-400'}`}>{label}</p>
    <div className="flex items-baseline gap-2">
      <p className={`text-3xl font-black ${color === 'rose' ? 'text-rose-700' : 'text-slate-900'}`}>{value}</p>
      <span className="text-[10px] text-slate-400 font-bold">{sub}</span>
    </div>
  </div>
);

export default Departments;
