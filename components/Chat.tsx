
import React, { useState, useMemo } from 'react';
import { ChatMessage, User, Project } from '../types';

interface ChatProps {
  messages: ChatMessage[];
  user: User;
  project: Project | null;
  onSendMessage: (msg: Omit<ChatMessage, 'id'>) => void;
}

const Chat: React.FC<ChatProps> = ({ messages, user, project, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const [chatType, setChatType] = useState<'project' | 'private'>('project');

  const filteredMessages = useMemo(() => {
    if (!project) return [];
    return messages.filter(m => m.projectId === project.id && m.type === chatType);
  }, [messages, project, chatType]);

  const handleSend = () => {
    if (!inputText.trim() || !project) return;
    onSendMessage({
      fromId: user.id,
      toId: chatType === 'project' ? project.id : 'DeptHead', // تبسيط للمثال
      content: inputText,
      timestamp: new Date().toISOString(),
      type: chatType,
      projectId: project.id
    });
    setInputText('');
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex gap-4">
           <button 
            onClick={() => setChatType('project')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${chatType === 'project' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
           >
            المشروع العام
           </button>
           {user.role !== 'Admin' && (
            <button 
              onClick={() => setChatType('private')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${chatType === 'private' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
            >
              استفسارات القسم
            </button>
           )}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {chatType === 'project' ? 'غرفة نقاش المشروع' : 'محادثة خاصة'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {filteredMessages.map(msg => {
          const isMine = msg.fromId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[70%] p-5 rounded-[2rem] text-sm font-bold ${
                isMine ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                {msg.content}
                <div className="mt-2 text-[8px] opacity-50 text-left">
                  {new Date(msg.timestamp).toLocaleTimeString('ar-SA')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100">
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 h-14 px-6 rounded-2xl border-2 border-white bg-white font-bold outline-none focus:border-violet-500 transition-all"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-violet-600 transition-all"
          >
            <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
