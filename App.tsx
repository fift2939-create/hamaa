
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Employees from './components/Employees';
import ProjectsManager from './components/ProjectsManager';
import Chat from './components/Chat';
import Auth from './components/Auth';
import Departments from './components/Departments';
import { Project, Task, User, Employee, Department, ChatMessage, TaskStatus, AppNotification } from './types';
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [toasts, setToasts] = useState<AppNotification[]>([]);

  // البيانات المخزنة
  const [projects, setProjects] = useState<Project[]>(() => JSON.parse(localStorage.getItem('app_projects') || '[]'));
  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('app_tasks') || '[]'));
  const [employees, setEmployees] = useState<Employee[]>(() => JSON.parse(localStorage.getItem('app_employees') || '[]'));
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('app_departments');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => JSON.parse(localStorage.getItem('app_messages') || '[]'));

  // Notification Sound Generator
  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, []);

  // Add Notification Function
  const addNotification = useCallback((title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setToasts(prev => [...prev, newNotif]);
    playNotificationSound();

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newNotif.id));
    }, 5000);
  }, [playNotificationSound]);

  useEffect(() => {
    localStorage.setItem('app_projects', JSON.stringify(projects));
    localStorage.setItem('app_tasks', JSON.stringify(tasks));
    localStorage.setItem('app_employees', JSON.stringify(employees));
    localStorage.setItem('app_departments', JSON.stringify(departments));
    localStorage.setItem('app_messages', JSON.stringify(messages));
    if (currentUser) localStorage.setItem('current_user', JSON.stringify(currentUser));
  }, [projects, tasks, employees, departments, messages, currentUser]);

  const visibleProjects = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin') return projects;
    return projects.filter(p => p.id === currentUser.projectId);
  }, [projects, currentUser]);

  const activeProject = useMemo(() => {
    if (currentUser?.role !== 'Admin') return visibleProjects[0] || null;
    return projects.find(p => p.id === selectedProjectId) || projects[0] || null;
  }, [selectedProjectId, visibleProjects, projects, currentUser]);

  const visibleTasks = useMemo(() => {
    if (!currentUser || !activeProject) return [];
    let list = tasks.filter(t => t.projectId === activeProject.id);
    
    if (currentUser.role === 'DeptHead') {
      return list.filter(t => t.departmentId === currentUser.departmentId);
    }
    if (currentUser.role === 'Employee') {
      return list.filter(t => t.employeeId === currentUser.id);
    }
    return list;
  }, [tasks, currentUser, activeProject]);

  // Real-time "Mock" Socket Listener
  useEffect(() => {
    if (!currentUser) return;

    // Simulate real-time assignment from another user
    const assignmentTimer = setTimeout(() => {
      addNotification(
        'مهمة جديدة!',
        'لقد تم إسناد مهمة "تحديث التقارير الشهرية" إليك الآن.',
        'assignment'
      );
    }, 15000);

    // Simulated deadline check every 2 minutes
    const deadlineInterval = setInterval(() => {
      const today = new Date();
      const nearDeadlines = visibleTasks.filter(t => {
        const d = new Date(t.deadline);
        const diff = d.getTime() - today.getTime();
        return diff > 0 && diff < 86400000; // Within 24 hours
      });

      if (nearDeadlines.length > 0) {
        addNotification(
          'تنبيه الموعد النهائي',
          `لديك ${nearDeadlines.length} مهام تنتهي صلاحيتها خلال أقل من 24 ساعة.`,
          'deadline'
        );
      }
    }, 120000);

    return () => {
      clearTimeout(assignmentTimer);
      clearInterval(deadlineInterval);
    };
  }, [currentUser?.id, addNotification, visibleTasks.length]);

  const handleUpdateStatus = (tid: string, s: TaskStatus) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === tid);
      if (task && task.status !== s) {
        addNotification(
          'تحديث حالة المهمة',
          `تم تغيير حالة المهمة "${task.title}" إلى ${s}.`,
          'status'
        );
      }
      return prev.map(t => t.id === tid ? { ...t, status: s } : t);
    });
  };

  if (!currentUser) return <Auth onLogin={(user) => setCurrentUser(user)} />;

  const unreadCount = notifications.filter(n => !n.read).length;

  // تجميع الإشعارات حسب النوع
  const groupedNotifications = useMemo(() => {
    const groups: Record<AppNotification['type'], { label: string, color: string, items: AppNotification[] }> = {
      assignment: { label: 'مهام جديدة', color: 'text-emerald-600 bg-emerald-50', items: [] },
      deadline: { label: 'تنبيهات المواعيد', color: 'text-rose-600 bg-rose-50', items: [] },
      status: { label: 'تحديثات الحالة', color: 'text-violet-600 bg-violet-50', items: [] },
      system: { label: 'تنبيهات النظام', color: 'text-sky-600 bg-sky-50', items: [] }
    };

    notifications.forEach(n => {
      if (groups[n.type]) {
        groups[n.type].items.push(n);
      }
    });

    return Object.entries(groups).filter(([_, group]) => group.items.length > 0);
  }, [notifications]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-['Tajawal'] overflow-x-hidden" dir="rtl">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser} 
        onLogout={() => { setCurrentUser(null); localStorage.removeItem('current_user'); }} 
      />
      
      <main className="flex-1 mr-64 p-8 relative min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="animate-in slide-in-from-top-4 duration-500">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{activeProject?.name || 'نظام همة'}</h2>
            <p className="text-slate-500 font-bold text-sm mt-1">
              أهلاً بك، {currentUser.name} 
              <span className="mx-2 text-slate-300">|</span>
              <span className="text-violet-600 font-black uppercase text-xs">
                {currentUser.role === 'Admin' ? 'المدير العام' : currentUser.role === 'DeptHead' ? 'رئيس قسم' : 'موظف'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${
                  showNotificationCenter ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-400 border-slate-100 hover:border-violet-200'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full border-4 border-slate-50 flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown (Grouped) */}
              {showNotificationCenter && (
                <div className="absolute left-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-[110] animate-in zoom-in-95 origin-top-left">
                  <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-black text-slate-900">مركز التنبيهات</h3>
                    <button 
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({...n, read: true})));
                        setShowNotificationCenter(false);
                      }}
                      className="text-[10px] font-black text-violet-600 hover:underline"
                    >
                      تحديد الكل كمقروء
                    </button>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar pb-6">
                    {groupedNotifications.length > 0 ? groupedNotifications.map(([type, group]) => (
                      <div key={type} className="mt-4">
                        <div className={`px-6 py-2 mx-4 mb-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-between ${group.color}`}>
                          {group.label}
                          <span className="opacity-60">{group.items.length}</span>
                        </div>
                        <div className="space-y-1">
                          {group.items.map(n => (
                            <div key={n.id} className={`px-8 py-4 hover:bg-slate-50 transition-colors relative group ${!n.read ? 'bg-violet-50/30' : ''}`}>
                              {!n.read && (
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-violet-600"></div>
                              )}
                              <div className="flex gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-black text-slate-800 truncate">{n.title}</p>
                                    <p className="text-[10px] text-slate-300 font-bold whitespace-nowrap">{new Date(n.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                                  <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">{n.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </div>
                        <p className="text-slate-400 font-bold italic text-sm">لا توجد تنبيهات جديدة</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {currentUser.role === 'Admin' && projects.length > 1 && (
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المشروع النشط:</span>
                <select 
                  value={selectedProjectId || ''} 
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-transparent font-black text-xs outline-none text-violet-700 cursor-pointer"
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
          </div>
        </header>

        {/* Content Tabs */}
        <div className="relative z-10">
          {activeTab === 'dashboard' && <Dashboard tasks={visibleTasks} />}
          {activeTab === 'tasks' && (
            <Tasks 
              tasks={visibleTasks} 
              user={currentUser} 
              project={activeProject}
              departments={departments}
              employees={employees}
              onUpdateStatus={handleUpdateStatus}
              onAddTask={(nt) => {
                setTasks(p => [...p, {...nt, id: Date.now().toString(), projectId: activeProject!.id}]);
                addNotification('إضافة مهمة', `تم إدراج مهمة جديدة: ${nt.title}`, 'assignment');
              }}
            />
          )}
          {activeTab === 'chat' && (
            <Chat 
              messages={messages} 
              user={currentUser} 
              project={activeProject} 
              onSendMessage={(m) => setMessages(p => [...p, {...m, id: Date.now().toString()}])}
            />
          )}
          {activeTab === 'projects' && currentUser.role === 'Admin' && (
            <ProjectsManager 
              projects={projects} 
              onAddProject={(p) => setProjects(prev => [...prev, {...p, id: Date.now().toString()}])} 
            />
          )}
          {activeTab === 'employees' && (currentUser.role === 'Admin' || currentUser.role === 'DeptHead') && (
            <Employees 
              employees={employees} 
              departments={departments} 
              tasks={tasks}
              onAddEmployee={(e) => setEmployees(p => [...p, {...e, id: `e-${Date.now()}`}])}
              onBulkAddEmployees={(list) => setEmployees(p => [...p, ...list.map((e, i) => ({...e, id: `e-bulk-${Date.now()}-${i}`}))])}
              onDeleteEmployee={(id) => setEmployees(p => p.filter(e => e.id !== id))}
            />
          )}
          {activeTab === 'departments' && currentUser.role === 'Admin' && (
            <Departments 
              departments={departments} 
              employees={employees} 
              tasks={tasks} 
              onAddDepartment={(name, color) => setDepartments(p => [...p, {id: `d-${Date.now()}`, name, color, projectId: activeProject?.id || 'p1'}])} 
              onDeleteDepartment={(id) => setDepartments(p => p.filter(d => d.id !== id))} 
            />
          )}
        </div>

        {/* Real-time Toast Stack */}
        <div className="fixed bottom-8 left-8 z-[200] flex flex-col gap-4 pointer-events-none">
          {toasts.map(toast => (
            <div 
              key={toast.id}
              className="bg-white/90 backdrop-blur-xl border-2 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 rounded-[2.5rem] flex items-center gap-6 max-w-sm pointer-events-auto animate-in slide-in-from-left-full duration-500 overflow-hidden relative group"
            >
              <div className={`absolute top-0 right-0 w-1.5 h-full ${
                toast.type === 'assignment' ? 'bg-emerald-500' :
                toast.type === 'deadline' ? 'bg-rose-500' :
                'bg-violet-500'
              }`}></div>
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 relative ${
                 toast.type === 'assignment' ? 'bg-emerald-500 text-white shadow-emerald-200' :
                 toast.type === 'deadline' ? 'bg-rose-500 text-white shadow-rose-200' :
                 'bg-violet-500 text-white shadow-violet-200'
              }`}>
                <div className={`absolute inset-0 rounded-2xl animate-ping opacity-20 ${
                   toast.type === 'assignment' ? 'bg-emerald-500' :
                   toast.type === 'deadline' ? 'bg-rose-500' :
                   'bg-violet-500'
                }`}></div>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="flex-1">
                <h4 className="text-slate-900 font-black text-lg mb-1 leading-tight">{toast.title}</h4>
                <p className="text-slate-500 text-xs font-bold leading-relaxed">{toast.message}</p>
              </div>

              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-all border border-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
