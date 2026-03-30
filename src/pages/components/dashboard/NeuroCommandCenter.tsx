import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Card, Typography, Tag, Spin, Button, Badge, Progress
} from "antd";
import {
  IconBrain, IconTrendingUp, IconAlertTriangle, IconRefresh, IconTimeline, IconRobot
} from "@tabler/icons-react";
import api from "@/lib/api";
import dayjs from "dayjs";
import DashboardCard from "../shared/DashboardCard";

const { Text, Title, Paragraph } = Typography;

const NeuroCommandCenter = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNeuralCore = async (refresh: boolean = false) => {
    if (refresh) setRefreshing(refresh);
    else setLoading(true);

    try {
      const resp = await api.get(`/api/v1/erp/ai/neural?refresh=${refresh}`);
      if (resp.data.success) {
        setData(resp.data.data);
      }
    } catch (err) {
      console.error("Neural Sync Error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNeuralCore();
  }, []);

  if (loading) {
    return (
      <DashboardCard className="h-[600px] flex items-center justify-center bg-emerald-950/20">
        <Spin size="large" tip="Orchestrating Neural Intelligence..." />
      </DashboardCard>
    );
  }

  if (!data) {
    return (
      <DashboardCard className="h-[400px] flex flex-col items-center justify-center bg-emerald-50/20 border-dashed border-2 border-emerald-100">
        <IconBrain size={64} className="text-emerald-200 mb-4 animate-pulse" />
        <Title level={4} className="text-emerald-900 m-0">Synchronizing Neural Core</Title>
        <Text className="text-emerald-800/40 text-[11px] uppercase font-black tracking-widest mt-2">
           Performing deep analysis on 365 days of context...
        </Text>
        <Button 
           type="link" 
           icon={<IconRefresh size={14}/>} 
           onClick={() => fetchNeuralCore(true)}
           className="mt-6 text-emerald-600 hover:text-emerald-500 font-bold"
        >
           PROBE STATUS AGAIN
        </Button>
      </DashboardCard>
    );
  }

  // Pre-process Projections for 120-day runway
  const rawPredictions = data?.projections?.predictions || [];
  const chartPoints: any[] = [];
  if (rawPredictions.length) {
     const runway = dayjs().subtract(120, 'day');
     const start = dayjs(rawPredictions[0].date).isBefore(runway) ? dayjs(rawPredictions[0].date) : runway;
     const end = dayjs(rawPredictions[rawPredictions.length - 1].date);
     const diff = end.diff(start, 'day');
     
     for (let i = 0; i <= diff; i++) {
        const curr = start.add(i, 'day').format('YYYY-MM-DD');
        const found = rawPredictions.find((p: any) => p.date === curr);
        chartPoints.push({
           timestamp: dayjs(curr).valueOf(),
           netSales: found ? found.netSales : 0,
           isForecast: found ? found.isForecast : curr > dayjs().format('YYYY-MM-DD')
        });
     }
  }

  const fIndex = chartPoints.findIndex(p => p.isForecast);

  return (
    <div className="flex flex-col gap-8 p-0">
      {/* 🟢 TOP LAYER: THE MORNING REPORT & HEALTH PULSE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <DashboardCard className="lg:col-span-4 bg-emerald-950 text-white overflow-hidden relative border-none">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <IconBrain size={120} />
           </div>
           <div className="relative z-10 p-4">
              <div className="flex items-center gap-2 mb-6 text-emerald-400">
                 <IconRobot size={24} />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">The Morning Briefing</span>
              </div>
              <Title level={3} className="text-white font-black leading-tight mb-4">
                 {data?.briefing}
              </Title>
              <div className="flex items-center gap-4">
                 <Badge status="processing" color="#10b981" text={<span className="text-emerald-400 text-[10px] font-bold">LIVE NEURAL FEED</span>} />
                 <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{dayjs(data?.generatedAt).fromNow()}</span>
              </div>
           </div>
        </DashboardCard>

        <DashboardCard className="lg:col-span-8 bg-gray-50/50 backdrop-blur-xl border border-gray-100 flex items-center p-8">
           <div className="flex-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Global Business Health</span>
              <div className="flex items-baseline gap-3 mb-4">
                 <span className="text-6xl font-black text-emerald-950 tracking-tighter">{data?.healthScore}%</span>
                 <span className={`text-xs font-black p-1 px-3 rounded-full ${data?.healthScore > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {data?.healthScore > 80 ? 'CRITICAL SUCCESS' : 'STABLE'}
                 </span>
              </div>
              <Progress percent={data?.healthScore} showInfo={false} strokeColor="#059669" trailColor="#e2e8f0" strokeWidth={12} className="m-0" />
           </div>
           <div className="hidden sm:flex flex-col gap-4 ml-12">
              <div className="text-right">
                 <span className="text-[10px] font-black text-gray-400 uppercase">Sales Velocity</span>
                 <span className="block text-xl font-black text-emerald-600">+{data?.reality?.comparison?.percentageChange?.revenue || 0}%</span>
              </div>
              <div className="text-right">
                 <span className="text-[10px] font-black text-gray-400 uppercase">Inventory Risk</span>
                 <span className="block text-xl font-black text-amber-600">LOW</span>
              </div>
           </div>
        </DashboardCard>
      </div>

      {/* 🟠 MIDDLE LAYER: NEURAL PROJECTION & INTERVENTIONS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <DashboardCard className="xl:col-span-8 p-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="flex items-center justify-between mb-10">
              <div>
                 <Title level={4} className="text-emerald-950 font-black m-0 mb-1">Neural Forecast Matrix</Title>
                 <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">14-Day Trajectory Prediction</Text>
              </div>
              <Button type="text" shape="circle" icon={<IconRefresh className={refreshing ? 'animate-spin': ''}/>} onClick={() => fetchNeuralCore(true)} />
           </div>
           
           <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartPoints} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                       <linearGradient id="cSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="cAmber" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="timestamp" 
                       type="number" 
                       domain={['auto', 'auto']} 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                       tickFormatter={(v) => dayjs(v).format('DD MMM')}
                       minTickGap={40}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
                       labelFormatter={(v) => dayjs(v).format('MMMM DD, YYYY')}
                    />
                    <Area type="monotone" dataKey="netSales" stroke="none" fill="url(#cSales)" data={chartPoints.slice(0, fIndex + 1)} isAnimationActive={false} />
                    <Area type="monotone" dataKey="netSales" stroke="none" fill="url(#cAmber)" data={chartPoints.slice(fIndex)} isAnimationActive={false} />
                    <Area type="monotone" dataKey="netSales" stroke="#059669" strokeWidth={3} fill="none" data={chartPoints.slice(0, fIndex + 1)} dot={false} />
                    <Area type="monotone" dataKey="netSales" stroke="#f59e0b" strokeWidth={4} strokeDasharray="8 4" fill="none" data={chartPoints.slice(fIndex)} dot={false} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </DashboardCard>

        <div className="xl:col-span-4 flex flex-col gap-6">
           <div className="flex items-center gap-2 px-2">
              <IconAlertTriangle size={18} className="text-amber-500" />
              <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-none">Intelligence Feed</span>
           </div>
           
           <div className="flex flex-col gap-4 overflow-y-auto max-h-[460px] pr-1 custom-scrollbar">
              {data?.interventions?.map((item: any, idx: number) => (
                 <Card key={idx} size="small" className={`rounded-[1.5rem] border-none shadow-lg ${item.priority === 'CRITICAL' ? 'bg-amber-600 text-white' : 'bg-emerald-950 text-white'}`}>
                    <div className="p-4 flex flex-col gap-2">
                       <div className="flex items-center justify-between opacity-60">
                          <span className="text-[9px] font-black uppercase tracking-widest">{item.type}</span>
                          <Tag color={item.priority === 'CRITICAL' ? 'error' : 'processing'} bordered={false} className="m-0 text-[8px] font-black rounded-full px-2">
                             {item.priority}
                          </Tag>
                       </div>
                       <Title level={5} className="m-0 text-white font-black leading-tight">{item.title}</Title>
                       <Paragraph className="m-0 text-[11px] font-medium opacity-80">{item.desc}</Paragraph>
                    </div>
                 </Card>
              ))}
              {(!data?.interventions || data.interventions.length === 0) && (
                 <div className="bg-gray-50 border border-dashed border-gray-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
                    <IconBrain size={48} className="text-gray-200 mb-4" />
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Neural Balance Achieved</Text>
                    <Text className="text-[10px] font-bold text-gray-300">NO INTERVENTIONS REQUIRED</Text>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default NeuroCommandCenter;
