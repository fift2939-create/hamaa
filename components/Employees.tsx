
import React, { useState, useMemo, useRef } from 'react';
import { Employee, Department, Task, TaskStatus } from '../types';

interface EmployeesProps {
  employees: Employee[];
  departments: Department[];
  tasks: Task[];
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onBulkAddEmployees: (list: Omit<Employee, 'id'>[]) => void;
  onDeleteEmployee: (id: string) => void;
}

type SortField = 'name' | 'role' | 'hireDate';
type SortOrder = 'asc' | 'desc';

const Employees: React.FC<EmployeesProps> = ({ employees, departments, tasks, onAddEmployee, onBulkAddEmployees, onDeleteEmployee }) => {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Employee' as 'Admin' | 'DeptHead' | 'Employee',
    departmentId: departments[0]?.id || '',
    hireDate: new Date().toISOString().split('T')[0],
    address: '',
  });

  // Filtering Logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            emp.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filterDept === 'all' || emp.departmentId === filterDept;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchQuery, filterDept]);

  // Sorting Logic
  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'hireDate') {
        comparison = new Date(a.hireDate).getTime() - new Date(b.hireDate).getTime();
      } else {
        comparison = a[sortField].localeCompare(b[sortField], 'ar');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredEmployees, sortField, sortOrder]);

  const selectedEmployeeTasks = useMemo(() => {
    if (!selectedEmployeeId) return [];
    return tasks.filter(t => t.employeeId === selectedEmployeeId);
  }, [tasks, selectedEmployeeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEmployee(formData);
    setShowModal(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Employee',
      departmentId: departments[0]?.id || '',
      hireDate: new Date().toISOString().split('T')[0],
      address: '',
    });
  };

  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      onDeleteEmployee(employeeToDelete);
      setEmployeeToDelete(null);
      if (selectedEmployeeId === employeeToDelete) {
        setSelectedEmployeeId(null);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newList: Omit<Employee, 'id'>[] = [];
      
      lines.forEach((line, index) => {
        if (index === 0 && (line.includes('الاسم') || line.includes('name'))) return;
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 4) {
          // Format: Name, DeptName, Phone, Email
          const dept = departments.find(d => d.name.includes(parts[1])) || departments[0];
          newList.push({
            name: parts[0],
            departmentId: dept.id,
            phone: parts[2],
            email: parts[3],
            role: (parts[4] === 'مدير' || parts[4] === 'Admin') ? 'Admin' : (parts[4] === 'رئيس قسم' || parts[4] === 'DeptHead') ? 'DeptHead' : 'Employee',
            hireDate: new Date().toISOString().split('T')[0]
          });
        }
      });

      if (newList.length > 0) {
        onBulkAddEmployees(newList);
        alert(`تم استيراد ${newList.length} موظف بنجاح`);
        setShowImportModal(false);
      } else {
        alert('تنسيق الملف غير صحيح. يرجى استخدام (الاسم, القسم, رقم الهاتف, البريد الإلكتروني)');
      }
    };
    reader.readAsText(file);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إدارة الكوادر البشرية</h2>
          <p className="text-slate-500 text-sm mt-1">عرض وتصفية الموظفين ومتابعة إنتاجيتهم</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black hover:shadow-2xl hover:shadow-emerald-200 transition-all shadow-xl shadow-emerald-100 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            استيراد Excel
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-l from-violet-600 to-violet-700 text-white px-8 py-4 rounded-2xl font-black hover:shadow-2xl hover:shadow-violet-200 transition-all shadow-xl shadow-violet-100"
          >
            إضافة موظف جديد +
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 right-4 flex items-center text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input 
            type="text" 
            placeholder="البحث بالاسم أو المسمى الوظيفي..."
            className="w-full h-14 pr-12 pl-6 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all font-bold outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">القسم:</span>
            <select 
              className="bg-transparent font-bold text-sm outline-none text-slate-700"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <option value="all">الكل</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden xl:block"></div>

          <div className="flex gap-2">
            {[
              { id: 'name', label: 'الاسم' },
              { id: 'role', label: 'المسمى' },
              { id: 'hireDate', label: 'التعيين' },
            ].map((field) => (
              <button
                key={field.id}
                onClick={() => toggleSort(field.id as SortField)}
                className={`px-5 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 ${
                  sortField === field.id
                    ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-200'
                    : 'bg-white text-slate-500 border-slate-100 hover:border-violet-200'
                }`}
              >
                {field.label}
                {sortField === field.id && (
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${selectedEmployeeId ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
          {sortedEmployees.length > 0 ? sortedEmployees.map(employee => {
            const dept = departments.find(d => d.id === employee.departmentId);
            const isSelected = selectedEmployeeId === employee.id;
            const empTasks = tasks.filter(t => t.employeeId === employee.id);
            const overdueCount = empTasks.filter(t => t.status === TaskStatus.OVERDUE).length;

            return (
              <div 
                key={employee.id} 
                onClick={() => setSelectedEmployeeId(isSelected ? null : employee.id)}
                className={`bg-white p-8 rounded-[2.5rem] shadow-sm border-2 transition-all relative group cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 ${
                  isSelected ? 'border-violet-600 scale-[1.02] shadow-xl' : 'border-slate-50 hover:border-violet-200'
                }`}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); setEmployeeToDelete(employee.id); }}
                  className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-rose-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 016.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                
                <div className="flex items-center gap-5 mb-6">
                  <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center text-2xl font-black uppercase shadow-inner transition-colors ${
                    isSelected ? 'bg-violet-600 text-white' : 'bg-slate-50 text-violet-600'
                  }`}>
                    {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{employee.name}</h3>
                    <p className="text-sm text-violet-600 font-black uppercase tracking-wider mt-1">{employee.role}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600 border-t border-slate-50 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      </div>
                      <span className="font-bold">{dept?.name}</span>
                    </div>
                    {overdueCount > 0 && (
                      <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black animate-pulse">
                        {overdueCount} متأخرة
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <span className="font-bold text-slate-400 text-xs">منذ: {employee.hireDate}</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center justify-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
               </div>
               <h3 className="text-xl font-bold text-slate-400">لم يتم العثور على موظفين يطابقون بحثك</h3>
               <button onClick={() => {setSearchQuery(''); setFilterDept('all');}} className="mt-4 text-violet-600 font-black text-sm hover:underline">إعادة ضبط التصفية</button>
            </div>
          )}
        </div>

        {selectedEmployeeId && (
          <div className="lg:col-span-1 space-y-6 animate-in slide-in-from-left-8 duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-violet-100 shadow-2xl shadow-violet-100/50 sticky top-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">سجل المهام</h3>
                <button onClick={() => setSelectedEmployeeId(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-all shadow-inner">×</button>
              </div>
              
              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedEmployeeTasks.length > 0 ? selectedEmployeeTasks.map(task => (
                  <div key={task.id} className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-violet-200 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-black text-sm text-slate-800 leading-tight">{task.title}</h4>
                      <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase shadow-sm whitespace-nowrap ${
                        task.status === TaskStatus.COMPLETED ? 'bg-emerald-500 text-white' :
                        task.status === TaskStatus.OVERDUE ? 'bg-rose-500 text-white' :
                        'bg-amber-500 text-white'
                      }`}>
                        {task.status === TaskStatus.COMPLETED ? 'مكتمل' : task.status === TaskStatus.OVERDUE ? 'متأخر' : 'نشط'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white/50 p-2 rounded-xl border border-slate-50">
                      <svg className="w-3 h-3 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      الاستحقاق: {task.deadline}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-16 opacity-50">
                    <p className="text-slate-400 text-sm font-bold italic">لا توجد مهام حالية لهذا الموظف</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 animate-in zoom-in-95 shadow-2xl border border-rose-100">
             <div className="text-center mb-8">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">هل أنت متأكد؟</h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed font-bold">
                  هل أنت متأكد من رغبتك في حذف هذا الموظف؟ <br/> 
                  <span className="text-rose-600">هذا الإجراء لا يمكن التراجع عنه.</span>
                </p>
             </div>
             <div className="flex gap-4">
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-[2] bg-rose-600 text-white h-16 rounded-2xl font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-100"
                >
                  تأكيد الحذف
                </button>
                <button 
                  onClick={() => setEmployeeToDelete(null)}
                  className="flex-1 bg-slate-100 text-slate-500 h-16 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  إلغاء
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-8 animate-in zoom-in-95">
             <h3 className="text-2xl font-black mb-4">استيراد موظفين من ملف Excel/CSV</h3>
             <p className="text-slate-500 text-sm mb-6 leading-relaxed">يرجى رفع ملف بتنسيق CSV يحتوي على الأعمدة التالية بالترتيب:<br/><b>الاسم، القسم، رقم الهاتف، البريد الإلكتروني، المسمى الوظيفي</b></p>
             <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-10 text-center hover:border-emerald-200 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <svg className="w-12 h-12 text-emerald-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-slate-400 font-bold">انقر للرفع</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                />
             </div>
             <div className="flex gap-4 pt-6">
                <button onClick={() => setShowImportModal(false)} className="w-full bg-slate-100 text-slate-500 h-14 rounded-2xl font-black">إغلاق</button>
             </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900">إضافة عضو جديد للفريق</h3>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-slate-400 hover:text-rose-500 shadow-sm border border-slate-200 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all font-bold outline-none"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">المسمى الوظيفي</label>
                  <input
                    type="text"
                    required
                    className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all font-bold outline-none"
                    value={formData.role}
                    onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all font-bold outline-none"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all font-bold outline-none"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">القسم</label>
                  <select
                    className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 font-bold bg-white outline-none"
                    value={formData.departmentId}
                    onChange={e => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                  >
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">تاريخ التعيين</label>
                  <input
                    type="date"
                    required
                    className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 font-bold outline-none"
                    value={formData.hireDate}
                    onChange={e => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">العنوان السكني</label>
                  <input
                    type="text"
                    className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all font-bold outline-none"
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-[2] bg-gradient-to-l from-violet-600 to-violet-700 text-white h-16 rounded-2xl font-black hover:shadow-2xl hover:shadow-violet-200 transition-all">إضافة الموظف</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 h-16 rounded-2xl font-black hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
