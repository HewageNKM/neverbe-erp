import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import {
  Button,
  Tag,
  Spin,
  Typography,
  Tooltip as AntTooltip,
  Badge,
  Card
} from "antd";
import {
  IconBrain,
  IconRefresh,
  IconRobot,
  IconTrendingUp,
  IconInfoCircle,
  IconClock
} from "@tabler/icons-react";
import DashboardCard from "../shared/DashboardCard";
import api from "@/lib/api";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

interface ForecastPoint {
  date: string;
  netSales: number;
  isForecast: boolean;
}

interface HybridData {
  forecast: {
    success?: boolean;
    message?: string;
    predictions: ForecastPoint[];
    metrics: {
      dataPoints: number;
    };
  };
  advisory: string;
  generatedAt: string;
  isAdvisoryFromCache: boolean;
}

const HybridIntelligencePanel = () => {
  const [data, setData] = useState<HybridData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIntelligence = async (refresh: boolean = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get(`/api/v1/erp/ai/hybrid?refresh=${refresh}`);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to sync intelligence hub");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, []);

  if (loading) {
    return (
      <DashboardCard className="h-[400px] flex items-center justify-center">
        <Spin size="large" tip="Synchronizing Neural Intelligence..." />
      </DashboardCard>
    );
  }

  // NEW: Robust Chronological Gap-Filling and Metrics Calculation
  const chartData: any[] = [];
  let avgHistorical = 0;
  let totalProjected = 0;
  let projectedGrowth = 0;

  if (data?.forecast?.predictions?.length) {
    const raw = data.forecast.predictions;
    const firstDataDate = dayjs(raw[0].date);
    const runwayDate = dayjs().subtract(120, 'day');
    const start = firstDataDate.isBefore(runwayDate) ? firstDataDate : runwayDate;
    
    const end = dayjs(raw[raw.length - 1].date);
    const diff = end.diff(start, 'day');
    const today = dayjs().format('YYYY-MM-DD');

    let hSum = 0;
    let hCount = 0;
    let fSum = 0;
    let fCount = 0;

    for (let i = 0; i <= diff; i++) {
      const current = start.add(i, 'day').format('YYYY-MM-DD');
      const found = raw.find(p => p.date === current);
      const val = found ? Number(found.netSales.toFixed(2)) : 0;
      const isForecast = found ? found.isForecast : current > today;

      chartData.push({
        date: current,
        timestamp: dayjs(current).valueOf(),
        netSales: val,
        isForecast
      });

      if (!isForecast && val > 0) {
        hSum += val;
        hCount++;
      } else if (isForecast) {
        fSum += val;
        fCount++;
      }
    }

    avgHistorical = hCount > 0 ? hSum / hCount : 0;
    totalProjected = fSum;
    const avgForecast = fCount > 0 ? fSum / fCount : 0;
    projectedGrowth = avgHistorical > 0 ? ((avgForecast / avgHistorical) - 1) * 100 : 0;
  }
  
  const forecastStartIndex = chartData.findIndex(p => p.isForecast);
  const forecastPoints = chartData.filter(p => p.isForecast);

  return (
    <DashboardCard className="relative overflow-hidden group p-0">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-200/50">
                <IconBrain size={24} className="text-white" />
              </div>
              <h4 className="text-2xl font-black text-emerald-950 m-0 tracking-tight">Intelligence Hub</h4>
            </div>
            <div className="flex items-center gap-2">
              <Tag color="emerald" bordered={false} className="m-0 text-[11px] font-black uppercase tracking-wider rounded-full py-0.5 px-4 bg-emerald-50 text-emerald-600">
                Neural Optimization Engaged
              </Tag>
              {data?.isAdvisoryFromCache && (
                <Tag color="amber" bordered={false} className="m-0 text-[11px] font-black uppercase tracking-wider rounded-full py-0.5 px-4 bg-amber-50 text-amber-600">
                  AI ACTIVE
                </Tag>
              )}
            </div>
            <Text className="text-[11px] text-emerald-950/40 font-medium mt-2 leading-relaxed max-w-md">
              Combining historical sales context with 14-day neural trajectory to advise on inventory and marketing strategy.
            </Text>
          </div>
          
          <Button 
            type="text" 
            icon={<IconRefresh size={18} className={`${refreshing ? 'animate-spin text-emerald-600' : 'text-emerald-400'}`} />} 
            onClick={() => fetchIntelligence(true)}
            disabled={refreshing}
            className="bg-gray-50/50 backdrop-blur-sm hover:bg-emerald-50 border border-gray-100 rounded-2xl px-6 py-6 flex items-center gap-2 transition-all"
          >
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Re-Sync Intelligence</span>
          </Button>
        </div>

        {/* SUMMARY WRAP: Key Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/40 p-4 rounded-3xl border border-gray-100 backdrop-blur-sm">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Historical Benchmark</Text>
            <div className="flex items-baseline gap-1">
              <Text className="text-xl font-black text-emerald-950">Rs. {(avgHistorical / 1000).toFixed(1)}k</Text>
              <Text className="text-[10px] font-bold text-gray-400">/ Day Avg</Text>
            </div>
          </div>
          <div className="bg-amber-50/20 p-4 rounded-3xl border border-amber-100/50 backdrop-blur-sm">
            <Text className="text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em] mb-1 block">Projected Volume (14d)</Text>
            <div className="flex items-baseline gap-1">
              <Text className="text-xl font-black text-amber-600">Rs. {(totalProjected / 1000).toFixed(1)}k</Text>
              <Text className="text-[10px] font-bold text-amber-400">AI Est.</Text>
            </div>
          </div>
          <div className="bg-emerald-50/20 p-4 rounded-3xl border border-emerald-100/50 backdrop-blur-sm">
            <Text className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] mb-1 block">Neural Momentum</Text>
            <div className="flex items-center gap-2">
              <IconTrendingUp size={20} className={projectedGrowth >= 0 ? "text-emerald-500" : "text-amber-500"} />
              <Text className={`text-xl font-black ${projectedGrowth >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                {projectedGrowth >= 0 ? "+" : ""}{projectedGrowth.toFixed(1)}%
              </Text>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* CHART AREA */}
          <div className="xl:col-span-8">
            <div className="h-[320px] w-full relative">
              {!chartData.length && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl">
                  <IconBrain size={48} className="text-gray-300 animate-pulse" />
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAmber" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    labelStyle={{ fontWeight: 800, marginBottom: '8px', fontSize: '13px', color: '#1e293b' }}
                    labelFormatter={(val) => dayjs(val).format('MMMM DD, YYYY')}
                    formatter={(value: number, name: string, props: any) => [
                      <span key="val" className={`font-black text-lg ${props.payload.isForecast ? 'text-amber-600' : 'text-emerald-900'}`}>Rs. {value.toLocaleString()}</span>,
                      <span key="label" className="text-[10px] font-black opacity-50 tracking-widest uppercase">{props.payload.isForecast ? 'Neural Prediction' : 'Historical Record'}</span>
                    ]}
                  />
                  <XAxis 
                    dataKey="timestamp" 
                    type="number"
                    domain={['auto', 'auto']}
                    axisLine={false} 
                    tickLine={false} 
                    padding={{ left: 0, right: 0 }}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    tickFormatter={(val) => dayjs(val).format('DD MMM')}
                    minTickGap={40}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(val) => `Rs.${(val/1000).toFixed(0)}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                  <Area type="monotone" dataKey="netSales" stroke="none" fillOpacity={1} fill="url(#colorSales)" data={chartData.slice(0, forecastStartIndex + 1)} isAnimationActive={false} />
                  <Area type="monotone" dataKey="netSales" stroke="none" fillOpacity={1} fill="url(#colorAmber)" data={chartData.slice(forecastStartIndex)} isAnimationActive={false} />

                  <Area type="monotone" dataKey="netSales" stroke="#059669" strokeWidth={3} fill="none" data={forecastStartIndex !== -1 ? chartData.slice(0, forecastStartIndex + 1) : chartData} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }} />
                  {forecastStartIndex !== -1 && (
                    <Area type="monotone" dataKey="netSales" stroke="#f59e0b" strokeWidth={4} strokeDasharray="10 5" fill="none" data={chartData.slice(forecastStartIndex)} dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#f59e0b' }} />
                  )}
                  {forecastStartIndex !== -1 && (
                    <ReferenceLine x={chartData[forecastStartIndex]?.timestamp} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-emerald-600 rounded-full" />
                <span className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest leading-none">Record</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-amber-500 border-t-2 border-dashed border-amber-500" />
                <span className="text-[10px] font-black text-amber-800/60 uppercase tracking-widest leading-none">Forecast</span>
              </div>
            </div>
          </div>

          {/* DETAILS & ADVISORY SIDEBAR */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            {/* 1. DAILY FORECAST LIST (The "Show Details" request) */}
            <div className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-5 flex flex-col max-h-[220px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Neural Transcript</span>
                </div>
                <Tag color="amber" bordered={false} className="m-0 text-[9px] font-black rounded-full px-2">14-DAY LIST</Tag>
              </div>
              <div className="overflow-y-auto pr-1 flex-1 custom-scrollbar">
                <div className="flex flex-col gap-2">
                  {forecastPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-50 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-emerald-950/40 uppercase">{dayjs(point.date).format('ddd')}</span>
                        <span className="text-[11px] font-black text-emerald-950">{dayjs(point.date).format('MMM DD')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-600 block">Rs. {point.netSales.toLocaleString()}</span>
                        <span className="text-[9px] font-bold text-gray-300">ESTIMATED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. STRATEGIC ADVISOR */}
            <Card 
              size="small" 
              bordered={false} 
              className="bg-emerald-950 rounded-[2rem] border-none flex-1 relative overflow-hidden flex flex-col shadow-2xl shadow-emerald-900/20"
              bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-800/50 rounded-xl backdrop-blur-md">
                  <IconRobot size={18} className="text-emerald-400" />
                </div>
                <span className="text-xs font-black text-emerald-200 uppercase tracking-widest">Strategic Advice</span>
              </div>
              
              <Paragraph className="text-[11px] leading-relaxed text-emerald-100/70 font-medium m-0 italic overflow-y-auto custom-scrollbar flex-1 pr-1">
                "{data?.advisory}"
              </Paragraph>

              <div className="mt-6 pt-4 border-t border-emerald-800/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <IconTrendingUp size={16} />
                  <span className="text-[10px] font-black tracking-widest uppercase">Live Guidance</span>
                </div>
                <AntTooltip title={dayjs(data?.generatedAt).format('MMM DD, hh:mm A')}>
                  <IconInfoCircle size={14} className="text-emerald-700 cursor-help" />
                </AntTooltip>
              </div>
            </Card>

            <div className="px-4 flex items-center justify-between py-1">
              <div className="flex items-center gap-1.5 opacity-40">
                <IconClock size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">Cycle: {dayjs(data?.generatedAt).fromNow()}</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-40">
                <span className="text-[10px] font-black uppercase tracking-widest">{data?.forecast?.metrics?.dataPoints || 0} SAMPLES</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
export default HybridIntelligencePanel;
