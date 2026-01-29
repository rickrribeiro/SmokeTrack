
import React, { useState } from 'react';
import { AppData } from '../types';
import { Download, Upload, Copy, Check, Plus, Trash2, List } from 'lucide-react';
import { storageService } from '../services/storageService';
import Modal from './Modal';

interface SettingsScreenProps {
  data: AppData;
  onImport: (newData: AppData) => void;
  onUpdateLists: (types: string[], activities: string[]) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ data, onImport, onUpdateLists }) => {
  const [importJson, setImportJson] = useState('');
  const [exportJson, setExportJson] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  const [newType, setNewType] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [isAddingType, setIsAddingType] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  const handleExport = () => {
    const json = storageService.exportJSON(data);
    setExportJson(json);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportJson);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleImport = () => {
    const validated = storageService.validateImportedData(importJson);
    if (validated) {
      onImport(validated);
      setFeedback({ type: 'success', msg: 'Dados importados com sucesso!' });
      setImportJson('');
    } else {
      setFeedback({ type: 'error', msg: 'JSON inválido. Verifique o formato.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const deleteType = (index: number) => {
    const newList = [...data.smokingTypes];
    newList.splice(index, 1);
    onUpdateLists(newList, data.activities);
  };

  const deleteActivity = (index: number) => {
    const newList = [...data.activities];
    newList.splice(index, 1);
    onUpdateLists(data.smokingTypes, newList);
  };

  const addType = () => {
    if (newType.trim()) {
      onUpdateLists([...data.smokingTypes, newType.trim()], data.activities);
      setNewType('');
      setIsAddingType(false);
    }
  };

  const addActivity = () => {
    if (newActivity.trim()) {
      onUpdateLists(data.smokingTypes, [...data.activities, newActivity.trim()]);
      setNewActivity('');
      setIsAddingActivity(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <List className="text-indigo-600" />
          Gerenciar Listas
        </h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-500">Tipos de Fumo</h3>
              <button 
                onClick={() => setIsAddingType(true)}
                className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.smokingTypes.map((t, i) => (
                <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 group">
                  {t}
                  <button onClick={() => deleteType(i)} className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-500">Activities</h3>
              <button 
                onClick={() => setIsAddingActivity(true)}
                className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.activities.map((a, i) => (
                <span key={i} className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 group">
                  {a}
                  <button onClick={() => deleteActivity(i)} className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Backup de Dados</h2>

        <div className="space-y-8">
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all w-fit"
            >
              <Download size={20} /> Exportar dados em JSON
            </button>
            
            {exportJson && (
              <div className="space-y-3">
                <textarea
                  readOnly
                  value={exportJson}
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[10px] font-mono text-slate-600 custom-scrollbar"
                />
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md hover:bg-indigo-700 transition-all"
                >
                  {isCopied ? <Check size={20} /> : <Copy size={20} />}
                  {isCopied ? 'Copiado!' : 'Copiar JSON'}
                </button>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 px-1">
              <Upload size={18} className="text-indigo-600" /> Importar Dados
            </h3>
            <textarea
              placeholder="Cole seu JSON aqui..."
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[10px] font-mono text-slate-600 custom-scrollbar focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={handleImport}
              className="w-full bg-slate-800 text-white font-bold py-3 rounded-2xl shadow-md hover:bg-slate-900 transition-all"
            >
              Importar JSON
            </button>
          </div>
        </div>
      </section>

      {feedback && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce ${
          feedback.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {feedback.type === 'success' ? <Check size={18} /> : <Trash2 size={18} />}
          <span className="font-bold text-sm">{feedback.msg}</span>
        </div>
      )}

      <Modal isOpen={isAddingType} onClose={() => setIsAddingType(false)} title="Novo Tipo de Fumo">
        <div className="space-y-4">
          <input
            autoFocus
            type="text"
            placeholder="Ex: Pod de Melancia"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addType()}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={addType} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">Adicionar</button>
        </div>
      </Modal>

      <Modal isOpen={isAddingActivity} onClose={() => setIsAddingActivity(false)} title="Nova Activity">
        <div className="space-y-4">
          <input
            autoFocus
            type="text"
            placeholder="Ex: No trânsito"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addActivity()}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={addActivity} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">Adicionar</button>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsScreen;
