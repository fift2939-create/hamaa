
import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectsManagerProps {
  projects: Project[];
  onAddProject: (p: Omit<Project, 'id'>) => void;
}

const ProjectsManager: React.FC<ProjectsManagerProps> = ({ projects, onAddProject }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', budget: 0 });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black">إدارة المحفظة الاستثمارية</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-violet-600 transition-all shadow-xl"
        >
          إنشاء مشروع جديد +
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(p => (
          <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all">
            <h4 className="text-xl font-black mb-4 group-hover:text-violet-600 transition-colors">{p.name}</h4>
            <p className="text-slate-500 text-xs font-bold mb-6 line-clamp-2">{p.description}</p>
            
            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الميزانية:</span>
                <span className="text-sm font-black text-emerald-600">{p.budget.toLocaleString()} ريال</span>
              </div>
              <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 animate-in zoom-in-95 shadow-2xl">
             <h3 className="text-2xl font-black mb-8 text-center">إضافة مشروع استراتيجي</h3>
             <div className="space-y-6">
                <input 
                  type="text" 
                  placeholder="اسم المشروع" 
                  className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 font-bold"
                  value={formData.name}
                  onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                />
                <textarea 
                  placeholder="وصف المشروع" 
                  className="w-full p-6 rounded-2xl border-2 border-slate-100 font-bold min-h-[120px]"
                  value={formData.description}
                  onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                />
                <input 
                  type="number" 
                  placeholder="الميزانية المخصصة" 
                  className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 font-bold"
                  value={formData.budget}
                  onChange={e => setFormData(p => ({...p, budget: Number(e.target.value)}))}
                />
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => { onAddProject({...formData, spent: 0, startDate: '', endDate: '', managerId: ''}); setShowModal(false); }}
                    className="flex-[2] bg-slate-900 text-white h-16 rounded-2xl font-black"
                  >
                    حفظ المشروع
                  </button>
                  <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-500 h-16 rounded-2xl font-black">إلغاء</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;
