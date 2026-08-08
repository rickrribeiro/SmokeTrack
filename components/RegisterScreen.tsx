
import React, { useState } from 'react';
import { SmokingRecord } from '../types';
import { Trash2, PlusCircle, Clock, Pencil } from 'lucide-react';
import Modal from './Modal';
import RecordForm, { RecordFormValues } from './RecordForm';
import EditRecordModal from './EditRecordModal';
import { MOOD_OPTIONS } from '../constants';
import { getLocalISOString, getTimeDifferenceText } from '@/util/dateUtils';


interface RegisterScreenProps {
  smokingTypes: string[];
  activities: string[];
  notes: string[];
  records: SmokingRecord[];
  onAddRecord: (record: SmokingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onUpdateRecord: (record: SmokingRecord) => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({
  smokingTypes,
  activities,
  notes,
  records,
  onAddRecord,
  onDeleteRecord,
  onUpdateRecord
}) => {
  const [formValues, setFormValues] = useState<RecordFormValues>({
    smokeType: smokingTypes.filter(a => a === "Tabaco")[0] || smokingTypes[0] || '',
    activity: activities[0] || '',
    dateTime: getLocalISOString().slice(0, 16),
  });
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [recordToEdit, setRecordToEdit] = useState<SmokingRecord | null>(null);

  const handleRegister = () => {
    const newRecord: SmokingRecord = {
      id: crypto.randomUUID(),
      smokeType: formValues.smokeType,
      activity: formValues.activity,
      dateTime: new Date(formValues.dateTime).toISOString(),
      mood: formValues.mood,
      note: formValues.note,
    };
    onAddRecord(newRecord);
    setFormValues(prev => ({ ...prev, dateTime: getLocalISOString().slice(0, 16), mood: undefined, note: undefined }));
  };

  const todayRecords = records.filter(record => {
    const recordDate = new Date(record.dateTime).toDateString();
    const today = new Date().toDateString();
    return recordDate === today;
  }).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const timeSinceLastRecord = () => {
    if (todayRecords.length === 0) return 'Nenhum registro hoje';
    const lastRecordTime = new Date(todayRecords[0].dateTime).getTime();
    const now = Date.now();
    return getTimeDifferenceText(now, lastRecordTime);
  };

  const moodEmoji = (mood?: SmokingRecord['mood']) => MOOD_OPTIONS.find(m => m.value === mood)?.emoji;

  return (
    <div className="flex flex-col gap-6 pb-24">
      <h2>Tempo desde o último registro: <b>{timeSinceLastRecord()}</b> </h2>
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <PlusCircle className="text-indigo-600" />
          Novo Registro
        </h2>

        <div className="space-y-4">
          <RecordForm
            smokingTypes={smokingTypes}
            activities={activities}
            notes={notes}
            values={formValues}
            onChange={setFormValues}
          />

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
            {todayRecords.map((record, index) => (
              <div>
                <div className="flex items-center justify-center" >
                  <p>
                    {
                      index > 0 ? getTimeDifferenceText(
                        new Date(todayRecords[index-1].dateTime).getTime(),
                        new Date(todayRecords[index].dateTime).getTime()
                      ) : null
                    }
                  </p>
                </div>
                <div key={record.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        {new Date(record.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {moodEmoji(record.mood) && <span className="text-sm">{moodEmoji(record.mood)}</span>}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {record.smokeType} • {record.activity}
                        {record.note && <> • {record.note}</>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setRecordToEdit(record)}
                      className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setRecordToDelete(record.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
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

      <EditRecordModal
        record={recordToEdit}
        smokingTypes={smokingTypes}
        activities={activities}
        notes={notes}
        onClose={() => setRecordToEdit(null)}
        onSave={onUpdateRecord}
      />
    </div>
  );
};

export default RegisterScreen;
