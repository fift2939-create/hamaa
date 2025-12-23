
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Task, Employee, Department, TaskStatus } from '../types';

interface InsightsProps {
  tasks: Task[];
  employees: Employee[];
  departments: Department[];
}

const Insights: React.FC<InsightsProps> = ({ tasks, employees, departments }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const analyzeData = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const summary = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
        overdue: tasks.filter(t => t.status === TaskStatus.OVERDUE).length,
        deptStats: departments.map(d => ({
          name: d.name,
          tasks: tasks.filter(t => t.departmentId === d.id).length
        }))
      };

      const prompt = `بصفتك محلل أداء إداري خبير، قم بتحليل بيانات العمل التالية وقدم تقريراً استراتيجياً باللغة العربية:
      - إجمالي المهام: ${summary.total}
      - المكتملة: ${summary.completed}
      - المتأخرة: ${summary.overdue}
      - توزيع الأقسام: ${JSON.stringify(summary.deptStats)}
      
      المطلوب:
      1. تقييم الإنتاجية الحالية.
      2. تحديد نقاط الضعف أو الأقسام التي تحتاج لدعم.
      3. تقديم 3 نصائح عملية للمدير لتحسين سير العمل.
      اجعل التقرير مهنياً، ملهماً، ومختصراً جداً بصيغة نقاط.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
      });

      setInsight(response.text || 'تعذر الحصول على تحليل حالياً.');
    } catch (err) {
      console.error(err);
      setInsight('حدث خطأ أثناء الاتصال بـ Gemini.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
      <div className="bg-slate-900/80 backdrop-blur-3xl text-white p-12 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/30 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] -ml-40 -mb-40"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-700 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-violet-500/40 rotate-6 hover:rotate-0 transition-transform duration-500 border border-white/20">
             <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9-.4-2.593-.886l-.548-.547z" /></svg>
          </div>
          
          <p className="text-slate-300 text-xl font-medium leading-relaxed mb-10">استثمر قوة الذكاء الاصطناعي في تحليل بياناتك والحصول على رؤى تقودك للقمة</p>
          
          <button 
            onClick={analyzeData}
            disabled={loading}
            className="group relative bg-white text-slate-950 px-12 py-6 rounded-[2rem] font-black text-2xl hover:shadow-[0_20px_60px_rgba(255,255,255,0.2)] hover:-translate-y-2 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-5"
          >
            {loading ? (
              <><div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div> جاري المعالجة...</>
            ) : (
              <>
                ابدأ التحليل الآن ✨
                <svg className="w-6 h-6 transition-transform group-hover:translate-x-[-8px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </>
            )}
          </button>
        </div>
      </div>

      {insight && (
        <div className="bg-white/60 backdrop-blur-2xl p-12 rounded-[4rem] border border-white/50 shadow-2xl animate-in zoom-in-95 duration-500">
           <div className="flex items-center gap-5 mb-10">
              <span className="w-4 h-12 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full shadow-lg"></span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">تقرير الأداء الذكي والمقترحات</h3>
           </div>
           <div className="prose prose-slate max-w-none text-slate-700 font-bold leading-loose whitespace-pre-wrap text-xl bg-white/40 backdrop-blur-md p-12 rounded-[3.5rem] border border-white/60 shadow-inner">
             {insight}
           </div>
           <div className="mt-10 flex justify-end gap-4">
              <button className="bg-white/70 backdrop-blur-md text-slate-600 px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-white transition-all shadow-sm border border-white/60">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                 مشاركة
              </button>
              <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:shadow-2xl transition-all shadow-xl">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                 حفظ كتقرير PDF
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
