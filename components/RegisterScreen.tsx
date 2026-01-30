
import React, { useState } from 'react';
import { SmokingRecord } from '../types';
import { Trash2, PlusCircle, Clock } from 'lucide-react';
import Modal from './Modal';
import { getLocalISOString } from '@/util/dateUtils';


interface RegisterScreenProps {
  smokingTypes: string[];
  activities: string[];
  records: SmokingRecord[];
  onAddRecord: (record: SmokingRecord) => void;
  onDeleteRecord: (id: string) => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({
  smokingTypes,
  activities,
  records,
  onAddRecord,
  onDeleteRecord
}) => {
  const [smokeType, setsmokeType] = useState(smokingTypes[0] || '');
  const [activity, setActivity] = useState(activities[0] || '');
  const [dateTime, setDateTime] = useState(getLocalISOString().slice(0, 16));
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const handleRegister = () => {
    const newRecord: SmokingRecord = {
      id: crypto.randomUUID(),
      smokeType,
      activity,
      dateTime: new Date(dateTime).toISOString()
    };
    onAddRecord(newRecord);
    setDateTime(getLocalISOString().slice(0, 16));
  };

  const todayRecords = records.filter(record => {
    const recordDate = new Date(record.dateTime).toDateString();
    const today = new Date().toDateString();
    return recordDate === today;
  }).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return (
    <div className="flex flex-col gap-6 pb-24">
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <PlusCircle className="text-indigo-600" />
          Novo Registro
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1 ml-1">O que eu fumei?</label>
            <select
              value={smokeType}
              onChange={(e) => setsmokeType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
            >
              {smokingTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1 ml-1">Data e Hora</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1 ml-1">O que eu estava fazendo?</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
            >
              {activities.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <button
            onClick={handleRegister}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            Registrar
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-lg font-bold text-slate-800">Registros de Hoje</h2>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {todayRecords.length} {todayRecords.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {todayRecords.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300">
            <p className="text-slate-400 text-sm">Nenhum registro hoje.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayRecords.map(record => (
              <div key={record.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">
                      {new Date(record.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {record.smokeType} • {record.activity}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setRecordToDelete(record.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <p className="text-slate-600">Tem certeza que deseja excluir este registro?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setRecordToDelete(null)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (recordToDelete) {
                  onDeleteRecord(recordToDelete);
                  setRecordToDelete(null);
                }
              }}
              className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RegisterScreen;
