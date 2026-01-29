
import React, { useState, useEffect, useCallback } from 'react';
import { AppData, SmokingRecord } from './types';
import { storageService } from './services/storageService';
import TabBar from './components/TabBar';
import RegisterScreen from './components/RegisterScreen';
import AnalysisScreen from './components/AnalysisScreen';
import SettingsScreen from './components/SettingsScreen';
import { Cigarette } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'analysis' | 'settings'>('register');
  const [data, setData] = useState<AppData>(storageService.loadData());

  useEffect(() => {
    storageService.saveData(data);
  }, [data]);

  const addRecord = useCallback((record: SmokingRecord) => {
    setData(prev => ({
      ...prev,
      records: [...prev.records, record]
    }));
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      records: prev.records.filter(r => r.id !== id)
    }));
  }, []);

  const importData = useCallback((importedData: AppData) => {
    const newData: AppData = { ...data };
    newData.records = newData.records.concat(importedData.records || []);
    newData.smokingTypes = Array.from(new Set([...newData.smokingTypes, ...importedData.smokingTypes || []]));
    newData.activities = Array.from(new Set([...newData.activities, ...importedData.activities || []]));
    setData(newData);
  }, []);

  const updateLists = useCallback((types: string[], activities: string[]) => {
    setData(prev => ({
      ...prev,
      smokingTypes: types,
      activities: activities
    }));
  }, []);

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-slate-50 flex flex-col relative shadow-xl overflow-hidden">
      <header className="p-6 pt-10 pb-4 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Cigarette size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">SmokeTrack</h1>
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">Total até agora: {data.records.length}</p>
        </div>
      </header>

      <main className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        {activeTab === 'register' && (
          <RegisterScreen
            smokingTypes={data.smokingTypes}
            activities={data.activities}
            records={data.records}
            onAddRecord={addRecord}
            onDeleteRecord={deleteRecord}
          />
        )}
        
        {activeTab === 'analysis' && (
          <AnalysisScreen records={data.records} />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen 
            data={data} 
            onImport={importData}
            onUpdateLists={updateLists}
          />
        )}
      </main>

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
