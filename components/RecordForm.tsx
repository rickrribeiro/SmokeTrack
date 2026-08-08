
import React from 'react';
import { Mood } from '../types';
import { MOOD_OPTIONS } from '../constants';

export interface RecordFormValues {
  smokeType: string;
  activity: string;
  dateTime: string; // formato datetime-local
  mood?: Mood;
  note?: string;
}

interface RecordFormProps {
  smokingTypes: string[];
  activities: string[];
  notes: string[];
  values: RecordFormValues;
  onChange: (values: RecordFormValues) => void;
}

const RecordForm: React.FC<RecordFormProps> = ({ smokingTypes, activities, notes, values, onChange }) => {
  const set = <K extends keyof RecordFormValues>(key: K, value: RecordFormValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  const toggleMood = (mood: Mood) => {
    set('mood', values.mood === mood ? undefined : mood);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-500 mb-1 ml-1">O que eu fumei?</label>
        <select
          value={values.smokeType}
          onChange={(e) => set('smokeType', e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
        >
          {smokingTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-500 mb-1 ml-1">Data e Hora</label>
        <input
          type="datetime-local"
          value={values.dateTime}
          onChange={(e) => set('dateTime', e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-500 mb-1 ml-1">O que eu estava fazendo?</label>
        <select
          value={values.activity}
          onChange={(e) => set('activity', e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
        >
          {activities.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-500 mb-1 ml-1">Como eu estava me sentindo?</label>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map(option => {
            const isSelected = values.mood === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleMood(option.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <span className="text-xl leading-none">{option.emoji}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-500 mb-1 ml-1">Nota (opcional)</label>
        <select
          value={values.note ?? ''}
          onChange={(e) => set('note', e.target.value || undefined)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
        >
          <option value="">Nenhuma</option>
          {notes.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
};

export default RecordForm;
