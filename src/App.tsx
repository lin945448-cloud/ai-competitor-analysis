import React, { useState, useMemo } from 'react';
import { LayoutDashboard, FileUp, BrainCircuit, Filter, TrendingUp, Users, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { parseExcelFiles } from './utils/excelHelper';
import { fetchAIInsight } from './utils/aiService';
import { NoteRecord } from './types';

export default function App() {
  const [data, setData] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [brandFilter, setBrandFilter] = useState('全部');
  const [monthFilter, setMonthFilter] = useState('总览');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setLoading(true);
    const records = await parseExcelFiles(Array.from(e.target.files));
    setData(records);
    setLoading(false);
  };

  const brands = useMemo(() => ['全部', ...new Set(data.map(d => d.brand))], [data]);
  const months = useMemo(() => ['总览', ...new Set(data.map(d => d.month))], [data]);

  const filteredData = useMemo(() => {
    return data.filter(d => 
      (brandFilter === '全部' || d.brand === brandFilter) &&
      (monthFilter === '总览' || d.month === monthFilter)
    );
  }, [data, brandFilter, monthFilter]);

  const stats = useMemo(() => {
    const totalInter = filteredData.reduce((s, r) => s + r.interactions, 0);
    const totalCost = filteredData.reduce((s, r) => s + r.cost, 0);
    const attrMap: any = {};
    filteredData.forEach(r => {
      attrMap[r.attribute] = (attrMap[r.attribute] || 0) + 1;
    });
    return {
      count: filteredData.length,
      interactions: totalInter,
      cost: totalCost,
      cpe: totalInter > 0 ? (totalCost / totalInter).toFixed(2) : 0,
      chartData: Object.entries(attrMap).map(([name, value]) => ({ name, value }))
    };
  }, [filteredData]);

  const generateAI = async () => {
    setAiResult('AI 正在深度分析中，请稍后...');
    const result = await fetchAIInsight({ stats, brand: brandFilter, month: monthFilter });
    setAiResult(result);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header & Upload */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-xl text-white"><LayoutDashboard size={24} /></div>
          <div><h1 className="text-xl font-bold text-slate-800">竞品达人合作分析 · AI平台</h1><p className="text-sm text-slate-500">支持多文件Excel上传分析</p></div>
        </div>
        <label className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl cursor-pointer hover:bg-indigo-100 transition-all font-medium">
          <FileUp size={20} /><span>{loading ? '解析中...' : '上传多个Excel/XLS数据'}</span>
          <input type="file" multiple accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {data.length > 0 && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dashboard Left */}
          <div className="lg:col-span-7 space-y-6">
            {/* Filters */}
            <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex-1"><label className="text-xs text-slate-400 block mb-1">报备品牌筛选</label>
                <select className="w-full border-none bg-slate-50 rounded-lg p-2 text-sm" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="flex-1"><label className="text-xs text-slate-400 block mb-1">时间维度</label>
                <div className="flex bg-slate-50 rounded-lg p-1">
                  {['总览', ...months.filter(m => m !== '总览')].map(m => (
                    <button key={m} onClick={() => setMonthFilter(m)} className={`flex-1 py-1 text-xs rounded-md ${monthFilter === m ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500'}`}>{m}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                <TrendingUp className="mx-auto mb-2 text-indigo-500" size={20} /><p className="text-2xl font-bold">{(stats.interactions / 10000).toFixed(1)}w</p><p className="text-xs text-slate-400">总互动量</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                <Users className="mx-auto mb-2 text-emerald-500" size={20} /><p className="text-2xl font-bold">{stats.count}</p><p className="text-xs text-slate-400">笔记篇数</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                <DollarSign className="mx-auto mb-2 text-amber-500" size={20} /><p className="text-2xl font-bold">¥{stats.cpe}</p><p className="text-xs text-slate-400">单互动成本(CPE)</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-6">达人层级分布 (按达人属性)</h3>
              <div className="h-64"><ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} /><Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {stats.chartData.map((_, index) => <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'][index % 4]} />)}
                  </Bar>
                </BarChart></ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Panel Right */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <button onClick={generateAI} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              <BrainCircuit size={20} /> 立即生成 AI 深度洞察报告
            </button>
            <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-y-auto custom-scrollbar min-h-[500px]">
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b pb-4"><BrainCircuit className="text-indigo-600" size={18} /> AI 洞察结果</div>
              {aiResult ? (
                <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap animate-in fade-in duration-700">{aiResult}</div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2"><BrainCircuit size={48} /><p>点击按钮，AI 将基于当前数据生成策略建议</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
