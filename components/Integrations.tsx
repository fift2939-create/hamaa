
import React, { useState, useRef } from 'react';
import { Task, Employee, Department, User } from '../types';

interface IntegrationsProps {
  tasks: Task[];
  employees: Employee[];
  departments: Department[];
  onImportData: (data: { tasks?: Task[], employees?: Employee[], users?: User[] }) => void;
}

const Integrations: React.FC<IntegrationsProps> = ({ tasks, employees, departments, onImportData }) => {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1fyorOoriLnN3c67aBu5yFbhPf1NoWRrpW0itia6UBbA/edit?usp=sharing');
  const [isVerified, setIsVerified] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleActivateSync = async () => {
    if (!isVerified) return;
    setSyncing(true);
    setProgress(10);
    
    try {
      const sheetId = sheetUrl.match(/\/d\/(.+?)\//)?.[1];
      if (!sheetId) throw new Error('Invalid Sheet ID');
      
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(exportUrl);
      const data = await response.text();
      
      setProgress(60);
      const lines = data.split('\n');
      const users: User[] = [];
      
      // الترتيب: A: الاسم، B: الإيميل، C: الباسورد، D: الهاتف، E: المنصب، F: الصلاحية
      lines.slice(1).forEach((line, idx) => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          users.push({
            id: `u-cloud-${idx}`,
            name: parts[0],             // العمود A
            username: parts[0],         // العمود A
            password: parts[2],         // العمود C
            email: parts[1] || '',      // العمود B
            role: (parts[5] === 'مدير' || parts[5] === 'Admin') ? 'Admin' : 'Employee' // العمود F
          });
        }
      });

      if (users.length > 0) {
        localStorage.setItem('app_users', JSON.stringify(users));
        onImportData({ users });
        alert(`نجحت المزامنة! تم سحب ${users.length} مستخدم من ملف الإكسل.`);
      }
      
      setProgress(100);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في المزامنة. تأكد من إعدادات المشاركة في الملف.');
    } finally {
      setTimeout(() => {
        setSyncing(false);
        setProgress(0);
      }, 500);
    }
  };

  const exportToExcel = () => {
    setSyncing(true);
    setProgress(20);
    setTimeout(() => {
      setProgress(100);
      const csvContent = "data:text/csv;charset=utf-8," + "المهمة,الحالة,المسؤول\n" + tasks.map(t => `${t.title},${t.status},${t.employeeId}`).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "report.csv");
      document.body.appendChild(link);
      link.click();
      setSyncing(false);
    }, 1000);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white/70 backdrop-blur-2xl p-12 rounded-[4rem] border border-emerald-100 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">تقارير النظام (Local)</h2>
            <p className="text-slate-500 font-bold mb-10 leading-relaxed">تصدير بيانات المهام الحالية إلى ملف إكسل محلي.</p>
            <button 
              onClick={exportToExcel}
              className="w-full bg-emerald-600 text-white h-20 rounded-[1.75rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-emerald-700 transition-all shadow-xl"
            >
              تصدير لـ Excel
            </button>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl p-12 rounded-[4rem] border border-sky-100 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">مزامنة السحابة (Google Sheets)</h2>
            <p className="text-slate-500 font-bold mb-10 leading-relaxed">تحديث بيانات الدخول والصلاحيات من ملف الإكسل المعتمد.</p>
            <button 
              onClick={handleActivateSync}
              disabled={syncing}
              className="w-full bg-slate-900 text-white h-20 rounded-[1.75rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-sky-600 transition-all shadow-xl"
            >
              {syncing ? 'جاري السحب...' : 'مزامنة المستخدمين الآن 🔄'}
            </button>
          </div>
        </div>
      </div>

      {syncing && (
        <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl">
          <div className="flex justify-between mb-4">
            <span className="font-black">جاري المعالجة...</span>
            <span className="font-black text-sky-400">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
