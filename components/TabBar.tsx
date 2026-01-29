
import React from 'react';
import { ClipboardList, BarChart3, Settings } from 'lucide-react';

interface TabBarProps {
  activeTab: 'register' | 'analysis' | 'settings';
  setActiveTab: (tab: 'register' | 'analysis' | 'settings') => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-around items-center z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button
        onClick={() => setActiveTab('register')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'register' ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <ClipboardList size={24} />
        <span className="text-[10px] font-medium uppercase tracking-wider">Registro</span>
      </button>
      
      <button
        onClick={() => setActiveTab('analysis')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'analysis' ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <BarChart3 size={24} />
        <span className="text-[10px] font-medium uppercase tracking-wider">Análise</span>
      </button>
      
      <button
        onClick={() => setActiveTab('settings')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <Settings size={24} />
        <span className="text-[10px] font-medium uppercase tracking-wider">Dados</span>
      </button>
    </div>
  );
};

export default TabBar;
