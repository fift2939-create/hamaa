
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Department, Beneficiary, OfficeMessage } from '../types';

interface OfficeServicesProps {
  departments: Department[];
  beneficiaries: Beneficiary[];
  onAddBeneficiary: (b: Omit<Beneficiary, 'id'>) => void;
  onBulkAddBeneficiaries: (list: Omit<Beneficiary, 'id'>[]) => void;
  messages: OfficeMessage[];
  onSendMessage: (msg: Omit<OfficeMessage, 'id' | 'sentAt'>) => void;
  onSimulateReply: (msgId: string, replyText?: string) => void;
}

const OfficeServices: React.FC<OfficeServicesProps> = ({ 
  departments, 
  beneficiaries, 
  onAddBeneficiary, 
  onBulkAddBeneficiaries,
  messages, 
  onSendMessage,
  onSimulateReply
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'send' | 'tracking' | 'beneficiaries'>('send');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState<{id: string, name: string} | null>(null);
  const [replyInput, setReplyInput] = useState('');
  
  const [selectedDept, setSelectedDept] = useState(departments[0]?.id || '');
  const [msgSubject, setMsgSubject] = useState('إشعار إداري عاجل');
  const [msgContent, setMsgContent] = useState('السلام عليكم ورحمة الله، السيد/ة {الاسم}.\n\nنحيطكم علماً بصدور معاملة جديدة لكم لدى {القسم}.\nيرجى التكرم بالمراجعة لاستكمال الإجراءات.\n\nشاكرين تعاونكم.');
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);
  
  const [isCampaignActive, setIsCampaignActive] = useState(false);
  const [campaignQueue, setCampaignQueue] = useState<string[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatPhoneNumber = (phone: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('05')) clean = '966' + clean.substring(1);
    else if (clean.startsWith('5')) clean = '966' + clean;
    return clean;
  };

  const processTemplate = (template: string, benName: string, deptName: string) => {
    return template
      .replace(/{الاسم}/g, benName)
      .replace(/{القسم}/g, deptName);
  };

  const startCampaign = () => {
    if (selectedBeneficiaries.length === 0) return alert('يرجى اختيار مستفيدين أولاً');
    if (!msgContent.trim()) return alert('يرجى كتابة نص الرسالة أولاً');
    setCampaignQueue(selectedBeneficiaries);
    setCurrentQueueIndex(0);
    setIsCampaignActive(true);
  };

  const sendNextInCampaign = () => {
    if (currentQueueIndex >= campaignQueue.length) {
      setIsCampaignActive(false);
      setSelectedBeneficiaries([]);
      alert('اكتملت الحملة بنجاح!');
      setActiveSubTab('tracking');
      return;
    }

    const id = campaignQueue[currentQueueIndex];
    const ben = beneficiaries.find(b => b.id === id);
    
    if (ben) {
      const deptName = departments.find(d => d.id === selectedDept)?.name || 'الإدارة';
      const finalContent = processTemplate(msgContent, ben.name, deptName);
      
      onSendMessage({
        beneficiaryId: id,
        departmentId: selectedDept,
        messageType: msgSubject,
        content: finalContent,
        isDelivered: true,
        hasReplied: false
      });
      
      const formattedPhone = formatPhoneNumber(ben.phone);
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(finalContent)}`, '_blank');
      setCurrentQueueIndex(prev => prev + 1);
    }
  };

  const handleReplySubmit = () => {
    if (showReplyModal && replyInput.trim()) {
      onSimulateReply(showReplyModal.id, replyInput);
      setShowReplyModal(null);
      setReplyInput('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Main Nav */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="bg-white px-8 py-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
           </div>
           <div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">مركز المراسلات الذكي</h2>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Automated Smart Dispatcher</p>
           </div>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-white rounded-3xl border border-slate-100 shadow-sm">
           {[
             {id: 'send', label: 'إنشاء حملة', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8'},
             {id: 'tracking', label: 'سجل التتبع', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'},
             {id: 'beneficiaries', label: 'المستفيدين', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'}
           ].map((tab) => (
             <button 
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-6 py-3 rounded-2xl font-black transition-all flex items-center gap-2 text-xs ${
                activeSubTab === tab.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'bg-transparent text-slate-500 hover:bg-slate-50'
              }`}
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} /></svg>
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* Campaign Wizard Banner */}
      {isCampaignActive && (
        <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 relative overflow-hidden border-4 border-emerald-500/30">
           <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]"></div>
                    <h3 className="text-2xl font-black tracking-tight">معالج الحملة الذكي نشط</h3>
                 </div>
                 <div className="w-full bg-white/5 h-4 rounded-full mt-4 overflow-hidden border border-white/5 p-1">
                    <div 
                      className="bg-gradient-to-l from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                      style={{ width: `${(currentQueueIndex / campaignQueue.length) * 100}%` }}
                    ></div>
                 </div>
                 <div className="flex justify-between items-center mt-4">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                       تمت معالجة {currentQueueIndex} من أصل {campaignQueue.length}
                    </p>
                    <p className="text-emerald-400 text-xs font-black">
                       {Math.round((currentQueueIndex / campaignQueue.length) * 100)}% مكتمل
                    </p>
                 </div>
              </div>
              
              <div className="flex gap-4">
                 <button 
                   onClick={sendNextInCampaign}
                   className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-12 py-6 rounded-[1.75rem] font-black text-xl flex items-center gap-4 shadow-2xl shadow-emerald-500/20 transition-all hover:-translate-y-2 active:scale-95 group"
                 >
                    {currentQueueIndex === campaignQueue.length ? 'إنهاء الحملة' : 'إرسال الرسالة التالية'}
                    <svg className="w-7 h-7 transition-transform group-hover:translate-x-[-5px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </button>
                 <button 
                   onClick={() => setIsCampaignActive(false)}
                   className="bg-white/10 hover:bg-white/20 text-white px-8 py-6 rounded-[1.75rem] font-black text-sm transition-all border border-white/10"
                 >
                    إيقاف مؤقت
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeSubTab === 'send' && !isCampaignActive && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
           {/* Section 1: Composer */}
           <div className="xl:col-span-2 space-y-8">
              <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 
                 <div className="flex items-center gap-5 mb-10 relative z-10">
                    <div className="w-14 h-14 bg-violet-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-violet-100">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">محرر الرسالة والقسم</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Message Template Designer</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-500 uppercase mr-3 tracking-widest">القسم المرسل</label>
                      <select 
                        value={selectedDept} 
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50/50 font-black focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition-all outline-none text-slate-800"
                      >
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-500 uppercase mr-3 tracking-widest">موضوع الرسالة</label>
                      <input 
                        type="text"
                        value={msgSubject}
                        onChange={(e) => setMsgSubject(e.target.value)}
                        placeholder="أدخل عنواناً للمراسلة..."
                        className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50/50 font-black focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition-all outline-none text-slate-800"
                      />
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center mr-3">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">محتوى الرسالة الكامل</label>
                      <div className="flex gap-2">
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black border border-emerald-100">{'{الاسم}'}</span>
                        <span className="text-[9px] bg-sky-50 text-sky-600 px-3 py-1 rounded-full font-black border border-sky-100">{'{القسم}'}</span>
                      </div>
                    </div>
                    <textarea 
                      value={msgContent}
                      onChange={(e) => setMsgContent(e.target.value)}
                      className="w-full p-8 rounded-[2.5rem] border-2 border-slate-50 bg-slate-50/50 font-bold text-base min-h-[220px] focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition-all outline-none leading-relaxed text-slate-700 shadow-inner"
                      placeholder="اكتب نص الرسالة هنا..."
                    ></textarea>
                    <p className="text-[9px] text-slate-400 font-bold text-left">* سيتم استبدال الأكواد بالاسم الفعلي لكل مستفيد تلقائياً</p>
                 </div>
              </div>
           </div>

           {/* Section 2: Recipient Picker */}
           <div className="space-y-8">
              <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                       </div>
                       <div>
                         <h3 className="text-lg font-black text-slate-900 tracking-tight">المستلمون ({selectedBeneficiaries.length})</h3>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                    {beneficiaries.map(ben => (
                       <label key={ben.id} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${selectedBeneficiaries.includes(ben.id) ? 'bg-violet-50/50 border-violet-500' : 'bg-slate-50/50 border-transparent hover:border-slate-100'}`}>
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={selectedBeneficiaries.includes(ben.id)} 
                              onChange={() => setSelectedBeneficiaries(prev => prev.includes(ben.id) ? prev.filter(i => i !== ben.id) : [...prev, ben.id])}
                              className="w-5 h-5 rounded-md accent-violet-600"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-black text-[11px] text-slate-800 truncate">{ben.name}</span>
                              <span className="text-[9px] text-slate-400 font-bold">{ben.phone}</span>
                            </div>
                          </div>
                          {selectedBeneficiaries.includes(ben.id) && <div className="w-2 h-2 bg-violet-600 rounded-full shadow-[0_0_8px_#7c3aed]"></div>}
                       </label>
                    ))}
                 </div>

                 <div className="flex gap-4 mb-6">
                    <button onClick={() => setSelectedBeneficiaries(beneficiaries.map(b => b.id))} className="flex-1 bg-slate-50 text-slate-500 py-3 rounded-xl text-[10px] font-black border border-slate-100 hover:bg-slate-100">تحديد الكل</button>
                    <button onClick={() => setSelectedBeneficiaries([])} className="flex-1 bg-slate-50 text-slate-500 py-3 rounded-xl text-[10px] font-black border border-slate-100 hover:bg-slate-100">مسح التحديد</button>
                 </div>

                 <button 
                   onClick={startCampaign}
                   className="w-full h-16 bg-gradient-to-l from-violet-600 to-indigo-700 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-violet-200 hover:-translate-y-1 active:translate-y-0 transition-all"
                 >
                     تشغيل الحملة الآن
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeSubTab === 'tracking' && (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm animate-in fade-in duration-700">
           <div className="flex items-center gap-5 mb-12">
              <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-sky-50">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">متابعة التفاعل الحي</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Live Interaction Tracking</p>
              </div>
           </div>
           
           <div className="space-y-8 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
              {messages.length > 0 ? messages.map(msg => {
                const ben = beneficiaries.find(b => b.id === msg.beneficiaryId);
                const dept = departments.find(d => d.id === msg.departmentId);
                return (
                 <div key={msg.id} className="bg-slate-50/30 rounded-[3rem] border border-slate-100 overflow-hidden group hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 border-r-8 border-r-violet-500">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600 rounded-2xl flex items-center justify-center font-black text-xl border border-violet-100 shadow-inner">
                                {ben?.name[0] || '؟'}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-lg leading-tight">{ben?.name || 'مستفيد غير موجود'}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{dept?.name}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span className="text-[10px] text-violet-500 font-black uppercase tracking-wider">{msg.messageType}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 mb-2 ${msg.hasReplied ? 'bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                               {msg.hasReplied ? (
                                 <><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> تم استلام رد</>
                               ) : 'بانتظار الرد'}
                            </div>
                            <p className="text-[10px] text-slate-300 font-bold">{new Date(msg.sentAt).toLocaleTimeString('ar-SA')}</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-8 bg-white/30">
                        {/* Sent Bubble */}
                        <div className="flex flex-col items-start w-full">
                            <div className="max-w-[80%] bg-gradient-to-l from-violet-600 to-violet-700 text-white p-6 rounded-[2.5rem] rounded-tr-none text-sm font-bold leading-relaxed shadow-xl shadow-violet-100 relative">
                                {msg.content}
                                <div className="absolute top-0 right-[-8px] w-4 h-4 bg-violet-600 rotate-45 -z-10"></div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 mr-4">
                               <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                               <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">تلقائي من النظام</span>
                            </div>
                        </div>

                        {/* Received Bubble */}
                        {msg.hasReplied ? (
                            <div className="flex flex-col items-end w-full animate-in slide-in-from-left-4">
                                <div className="max-w-[80%] bg-white border-2 border-slate-100 p-6 rounded-[2.5rem] rounded-tl-none text-sm font-black text-slate-700 leading-relaxed shadow-lg shadow-slate-50 relative">
                                    {msg.replyContent}
                                    <div className="absolute top-0 left-[-8px] w-4 h-4 bg-white border-2 border-slate-100 rotate-45 -z-10"></div>
                                </div>
                                <div className="flex items-center gap-3 mt-2 ml-4">
                                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">رد العميل</span>
                                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                    <span className="text-[10px] text-slate-300 font-bold">{msg.repliedAt && new Date(msg.repliedAt).toLocaleTimeString('ar-SA')}</span>
                                </div>
                            </div>
                        ) : (
                          <div className="flex justify-center py-4">
                            <button 
                              onClick={() => setShowReplyModal({id: msg.id, name: ben?.name || ''})}
                              className="bg-white border-2 border-violet-100 text-violet-600 px-8 py-3 rounded-2xl text-[11px] font-black hover:bg-violet-600 hover:text-white transition-all shadow-sm hover:shadow-xl hover:shadow-violet-100 flex items-center gap-3 group"
                            >
                               <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                               محاكاة رد العميل الوارد
                            </button>
                          </div>
                        )}
                    </div>
                 </div>
                );
              }) : (
                 <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-200 mb-6 shadow-inner">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <p className="text-slate-400 font-black italic text-lg">لا توجد مراسلات مسجلة في هذا القسم حالياً</p>
                 </div>
              )}
           </div>
        </div>
      )}

      {/* Reply Modal - Glassmorphism style */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
          <div className="bg-white/95 rounded-[3rem] w-full max-w-md p-10 animate-in zoom-in-95 shadow-[0_35px_100px_-15px_rgba(0,0,0,0.3)] border border-white/20">
             <div className="flex items-center gap-5 mb-10">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">محاكاة رد المستفيد</h3>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">العميل الحالي: {showReplyModal.name}</p>
                </div>
             </div>
             <div className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-[11px] font-black text-slate-500 uppercase mr-3 tracking-widest">نص الرد الوارد:</label>
                    <textarea
                      className="w-full p-6 rounded-[2rem] border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500 transition-all font-bold min-h-[160px] outline-none text-slate-800 leading-relaxed shadow-inner"
                      placeholder="ماذا سيقول العميل في رده؟"
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                    ></textarea>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={handleReplySubmit}
                    disabled={!replyInput.trim()}
                    className="flex-[2] bg-emerald-600 text-white h-16 rounded-2xl font-black shadow-2xl shadow-emerald-100 hover:-translate-y-1 transition-all disabled:opacity-30 disabled:translate-y-0"
                  >
                     تأكيد استلام الرد
                  </button>
                  <button 
                    onClick={() => {setShowReplyModal(null); setReplyInput('');}}
                    className="flex-1 bg-slate-100 text-slate-600 h-16 rounded-2xl font-black hover:bg-slate-200 transition-colors"
                  >
                     إلغاء
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Reusable Modals (Add/Import) - Same visual style */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[4rem] w-full max-w-lg p-12 animate-in zoom-in-95 shadow-2xl">
             <div className="text-center mb-10">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">استيراد قاعدة البيانات</h3>
                <p className="text-slate-500 text-sm mt-2">ارفع ملف CSV يحتوي على (الاسم، الهاتف، التصنيف)</p>
             </div>
             <div 
               className="border-4 border-dashed border-slate-100 rounded-[3rem] p-16 text-center hover:border-violet-200 transition-all cursor-pointer bg-slate-50/30 group" 
               onClick={() => fileInputRef.current?.click()}
             >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                   <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-slate-400 font-black text-sm uppercase tracking-widest">انقر لاختيار الملف</p>
                <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={() => {}} />
             </div>
             <button onClick={() => setShowImportModal(false)} className="w-full mt-10 h-16 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black hover:bg-slate-200 transition-colors">إغلاق النافذة</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeServices;
