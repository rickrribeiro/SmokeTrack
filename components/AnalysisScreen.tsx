
import React, { useMemo, useState } from 'react';
import { SmokingRecord, FilterRange, filterDays, filterStrategies } from '../types';
import { PERIODS, FILTER_STRATEGIES, FILTER_DAYS } from '../constants';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { format, subDays, isWithinInterval, startOfDay, endOfDay, getDay, getHours, max } from 'date-fns';
import { getDaysDifference } from '../util/dateUtils';
import { Table } from 'lucide-react';

interface AnalysisScreenProps {
  records: SmokingRecord[];
}

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ records }) => {
  const [periodo, setPeriodo] = useState<FilterRange>(FilterRange.DAYS_7);
  const [daysFilter, setDaysFilter] = useState<filterDays>(filterDays.TOTAL);
  const [strategyFilter, setStrategyFilter] = useState<filterStrategies>(filterStrategies.TOTAL);

  const filteredRecords = useMemo(() => {
    let filtered = records;
    if (periodo != FilterRange.TOTAL) {
      const days = parseInt(periodo.split(' ')[0]);
      const startDate = subDays(new Date(), days);
      
      filtered = records.filter(record => 
        isWithinInterval(new Date(record.dateTime), {
          start: startOfDay(startDate),
          end: endOfDay(new Date())
        })
      );
    }
    if (daysFilter === filterDays.WEEK_DAYS) {
      filtered = filtered.filter(r => {
        const day = getDay(new Date(r.dateTime));
        return day !== 0 && day !== 6; 
      });
    } else if (daysFilter === filterDays.WEEKENDS) {
      filtered = filtered.filter(r => {
        const day = getDay(new Date(r.dateTime));
        return day === 0 || day === 6; 
      });
    }

    return filtered.sort((a,b) => {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    });
  }, [records, periodo, daysFilter, strategyFilter]);

  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRecords.forEach(r => {
      const d = format(new Date(r.dateTime), 'dd/MM');
      map[d] = (map[d] || 0) + 1;
    });
    return Object.keys(map).map(date => ({ date, count: map[date] })).sort((a,b) => {
        return -1; 
    });
  }, [filteredRecords]);

  const getTotalByDayOfWeek = () => {
    const counts = [
      { total: 0, diffDays: 0}, 
      { total: 0, diffDays: 0}, 
      { total: 0, diffDays: 0}, 
      { total: 0, diffDays: 0}, 
      { total: 0, diffDays: 0}, 
      { total: 0, diffDays: 0}, 
      { total: 0, diffDays: 0}
    ];
    let lastDay = null;

    filteredRecords.forEach(r => {
      const day = getDay(new Date(r.dateTime));
      if (day !== lastDay) {
        lastDay = day;
        counts[lastDay].diffDays += 1;
      }
      counts[lastDay].total += 1;
    });
    return counts
  }

  const dowData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const counts = getTotalByDayOfWeek();

    return days.map((day, i) => {
      let count = strategyFilter === filterStrategies.AVERAGE && counts[i].diffDays > 0 ? 
      (counts[i].total / counts[i].diffDays).toFixed(1) 
      : counts[i].total;
      return { day, count: count }
    });
  }, [filteredRecords, strategyFilter]);

  const hourlyData = useMemo(() => {
    const counts = Array(24).fill(0);
    filteredRecords.forEach(r => {
      counts[getHours(new Date(r.dateTime))] += 1;
    });
    return counts.map((count, hour) => {
      let days = strategyFilter === filterStrategies.AVERAGE ? getDaysDifference(
        new Date(filteredRecords[filteredRecords.length - 1]?.dateTime), 
        new Date(filteredRecords[0]?.dateTime)) : 1;
      return { hour: `${hour}h`, count: (count/days).toFixed(1) };
    });
  }, [filteredRecords, strategyFilter]);

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

  const averageDataWhithoutToday = useMemo(() => {
    let days = parseInt(periodo.split(' ')[0]);
    const maxRange = getDaysDifference(new Date(), new Date(filteredRecords[0]?.dateTime || new Date()));
    if ( maxRange < days) {
      days = maxRange;
    }
    const totalDays = periodo === FilterRange.TOTAL ? Math.max(1, Math.ceil((new Date().getTime() - new Date(filteredRecords[0]?.dateTime || new Date()).getTime()) / (1000 * 60 * 60 * 24))) - 1 : days;
    if (totalDays <= 0) return "0.00";
    const recordsWithoutToday = filteredRecords.filter(r => {
      const recordDate = new Date(r.dateTime).toDateString();
      const today = new Date().toDateString();
      return recordDate !== today;
    });
    const average = recordsWithoutToday.length / totalDays;
    return average.toFixed(2);
  }, [filteredRecords, periodo, records]);

  const averageDataByTypeOfDay = useMemo(() => {
    const counts = getTotalByDayOfWeek();
    const weekends = (counts[0].total + counts[6].total) / (counts[0].diffDays + counts[6].diffDays || 1);
    const weekDays = (counts.slice(1, 6).reduce((sum, c) => sum + c.total, 0) / (counts.slice(1, 6).reduce((sum, c) => sum + c.diffDays, 0) || 1));
    return {
      [filterDays.WEEKENDS]: weekends.toFixed(2),
      [filterDays.WEEK_DAYS]: weekDays.toFixed(2)
    }
  }, [filteredRecords, periodo, records]);

  const averageTimeBetweenSmokes = useMemo(() => {
    return "to-do"
  }, [filteredRecords, periodo, records]);

  const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div id="filters" className="space-y-1">
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
        <section className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md pt-2 pb-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Dias de Análise</label>
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(e.target.value as filterDays)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {FILTER_DAYS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </section>
        <section className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md pt-2 pb-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Estratégia Análise</label>
          <select
            value={strategyFilter}
            onChange={(e) => setStrategyFilter(e.target.value as filterStrategies)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {FILTER_STRATEGIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </section>
      </div>

      <div className="space-y-6">
        <div> 
          {/* TODO: Separar isso num component depois */}
          <p className="text-lg font-bold pl-8">Médias (Por enquanto quebrado se filtra por dias de análise)</p>
          <table className="border-separate border-spacing-x-8 mt-4">
            <thead>
              <tr>
                <th className="text-left text-sm text-slate-700 pb-2 pr-8 border-r border-slate-500">Média Diária</th>
                <th className="text-left text-sm text-slate-700 pb-2 pr-8 border-r border-slate-500">Dia de Semana</th>
                <th className="text-left text-sm text-slate-700 pb-2 pr-8 border-r border-slate-500">Final de Semana</th>
                <th className="text-left text-sm text-slate-700 pb-2">Média entre fumos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-3xl font-bold text-slate-800 border-r border-slate-500">{averageDataWhithoutToday}</td>
                <td className="text-3xl font-bold text-slate-800 border-r border-slate-500">{averageDataByTypeOfDay[filterDays.WEEK_DAYS]}</td>
                <td className="text-3xl font-bold text-slate-800 border-r border-slate-500">{averageDataByTypeOfDay[filterDays.WEEKENDS]}</td>
                <td className="text-3xl font-bold text-slate-800">{averageTimeBetweenSmokes}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
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

        <ChartCard title={`Fumo por Dia da Semana (${strategyFilter})`}>
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

        <ChartCard title={`Fumo por Horário (${strategyFilter})`}>
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
