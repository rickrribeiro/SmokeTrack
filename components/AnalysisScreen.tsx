
import React, { useMemo, useState } from 'react';
import { SmokingRecord, FilterRange } from '../types';
import { PERIODS } from '../constants';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { format, subDays, isWithinInterval, startOfDay, endOfDay, getDay, getHours } from 'date-fns';

interface AnalysisScreenProps {
  records: SmokingRecord[];
}

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ records }) => {
  const [periodo, setPeriodo] = useState<FilterRange>(FilterRange.DAYS_7);

  const filteredRecords = useMemo(() => {
    if (periodo === FilterRange.TOTAL) return records;
    
    const days = parseInt(periodo.split(' ')[0]);
    const startDate = subDays(new Date(), days);
    
    return records.filter(record => 
      isWithinInterval(new Date(record.dateTime), {
        start: startOfDay(startDate),
        end: endOfDay(new Date())
      })
    );
  }, [records, periodo]);

  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRecords.forEach(r => {
      const d = format(new Date(r.dateTime), 'dd/MM');
      map[d] = (map[d] || 0) + 1;
    });
    return Object.keys(map).map(date => ({ date, count: map[date] })).sort((a,b) => {
        return 1; 
    });
  }, [filteredRecords]);

  const dowData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    filteredRecords.forEach(r => {
      counts[getDay(new Date(r.dateTime))] += 1;
    });
    return days.map((day, i) => ({ day, count: counts[i] }));
  }, [filteredRecords]);

  const hourlyData = useMemo(() => {
    const counts = Array(24).fill(0);
    filteredRecords.forEach(r => {
      counts[getHours(new Date(r.dateTime))] += 1;
    });
    return counts.map((count, hour) => ({ hour: `${hour}h`, count }));
  }, [filteredRecords]);

  const activityData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRecords.forEach(r => {
      map[r.activity] = (map[r.activity] || 0) + 1;
    });
    return Object.keys(map).map(name => ({ name, count: map[name] })).sort((a,b) => b.count - a.count);
  }, [filteredRecords]);

  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRecords.forEach(r => {
      map[r.smokeType] = (map[r.smokeType] || 0) + 1;
    });
    return Object.keys(map).map(name => ({ name, count: map[name] })).sort((a,b) => b.count - a.count);
  }, [filteredRecords]);

  // const averageData = useMemo(() => {
  //   const totalDays = periodo === FilterRange.TOTAL ? Math.max(1, Math.ceil((new Date().getTime() - new Date(records[0]?.dateTime || new Date()).getTime()) / (1000 * 60 * 60 * 24))) : parseInt(periodo.split(' ')[0]);
  //   const average = filteredRecords.length / totalDays;
  //   return average.toFixed(2);
  // }, [filteredRecords, periodo, records]);

  const averageDataWhithoutToday = useMemo(() => {
    const totalDays = periodo === FilterRange.TOTAL ? Math.max(1, Math.ceil((new Date().getTime() - new Date(records[0]?.dateTime || new Date()).getTime()) / (1000 * 60 * 60 * 24))) - 1 : parseInt(periodo.split(' ')[0]) - 1;
    const recordsWithoutToday = filteredRecords.filter(r => {
      const recordDate = new Date(r.dateTime).toDateString();
      const today = new Date().toDateString();
      return recordDate !== today;
    });
    const average = recordsWithoutToday.length / totalDays;
    return average.toFixed(2);
  }, [filteredRecords, periodo, records]);

  const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

  return (
    <div className="flex flex-col gap-6 pb-24">
      <section className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md pt-2 pb-4">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Período de Análise</label>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value as FilterRange)}
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </section>

      <div className="space-y-6">
        <ChartCard title="Média Diária ( sem hoje )" >
          <div className="text-3xl font-bold text-slate-800">
            { averageDataWhithoutToday }
          </div>
        </ChartCard>
        <ChartCard title="Fumo por Dia">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                itemStyle={{color: '#6366f1'}}
              />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fumo por Dia da Semana">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dowData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis hide />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {dowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fumo por Horário">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData}>
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis hide />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fumo por Atividade">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={activityData.slice(0, 5)}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fill: '#64748b', fontSize: 10}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" fill="#818cf8" radius={[0, 8, 8, 0]}>
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Por Tipo de Fumo">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData.slice(0, 5)}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis hide />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

const ChartCard: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
    <h3 className="text-sm font-bold text-slate-700 mb-4">{title}</h3>
    {children}
  </div>
);

export default AnalysisScreen;
