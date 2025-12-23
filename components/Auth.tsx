
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  // الرابط المباشر للملف (متاح للقراءة للجميع)
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1fyorOoriLnN3c67aBu5yFbhPf1NoWRrpW0itia6UBbA/edit?usp=sharing';
  const logoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7g1ve0r5U4Y_DQw6wlPy33VNF0tfrqhrrvA&s";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSyncing(true);

    try {
      const sheetId = SHEET_URL.match(/\/d\/(.+?)\//)?.[1];
      if (!sheetId) throw new Error('رابط غير صالح');
      
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(exportUrl);
      
      if (!response.ok) throw new Error('فشل الاتصال بالسحابة');
      
      const data = await response.text();
      const lines = data.split('\n');
      const users: User[] = [];
      
      // معالجة بيانات الإكسل بناءً على الترتيب المطلوب:
      // parts[0]: الاسم (الدخول) | parts[1]: الإيميل | parts[2]: كلمة المرور | parts[3]: الهاتف | parts[4]: المنصب | parts[5]: الصلاحية
      lines.slice(1).forEach((line, idx) => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          users.push({
            id: `u-cloud-${idx}`,
            name: parts[0],              // العمود A
            username: parts[0],          // العمود A (يستخدم كإسم مستخدم)
            password: parts[2],          // العمود C
            email: parts[1] || '',       // العمود B
            role: (parts[5] === 'مدير' || parts[5] === 'Admin') ? 'Admin' : 'Employee' // العمود F
          });
        }
      });

      // البحث عن المستخدم بمطابقة الاسم (العمود A) وكلمة المرور (العمود C)
      const user = users.find(u => 
        String(u.username).toLowerCase() === String(formData.username).toLowerCase() && 
        String(u.password) === String(formData.password)
      );

      if (user) {
        localStorage.setItem('app_users', JSON.stringify(users));
        onLogin(user);
      } else {
        setError('بيانات الدخول غير صحيحة. يرجى التأكد من الاسم وكلمة المرور في ملف الإكسل.');
      }
    } catch (err) {
      console.error(err);
      setError('فشل في الوصول لملف السحابة. تأكد من الإنترنت وأن الملف متاح "لأي شخص لديه الرابط".');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden font-['Tajawal']" dir="rtl">
      
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[160px] -mr-64 -mt-64 z-0"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] -ml-64 -mb-64 z-0"></div>

      <div className="bg-white/80 backdrop-blur-[40px] rounded-[4rem] shadow-2xl w-full max-w-md p-12 relative z-10 border border-white/30 animate-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-violet-500 rounded-[2.5rem] blur-3xl opacity-40 animate-pulse"></div>
            <div className="relative bg-white p-2 rounded-[2.5rem] shadow-2xl border border-white/50 -rotate-2">
              <img src={logoUrl} alt="شعار همة" className="w-24 h-24 object-cover rounded-[2rem]" />
            </div>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">همة</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-slate-200"></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Cloud Database Sync</p>
            <span className="h-px w-8 bg-slate-200"></span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mr-3">الاسم (كما في الإكسل)</label>
            <input
              type="text"
              required
              placeholder="أدخل الاسم الكامل..."
              className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all font-bold text-slate-800 outline-none"
              value={formData.username}
              onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mr-3">كلمة المرور</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all font-bold text-slate-800 outline-none"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-5 rounded-2xl text-[11px] font-black text-center border border-rose-100">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSyncing}
            className="w-full bg-slate-900 text-white h-20 rounded-[2rem] font-black text-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-70 shadow-xl"
          >
            {isSyncing ? (
              <>
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري التحقق من السحابة...
              </>
            ) : (
              <>دخول النظام</>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-[10px] font-bold">
            يتم جلب البيانات من ملف Google Sheet المعتمد.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
