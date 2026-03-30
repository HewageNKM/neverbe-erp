import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Typography, Space, Button, Badge, Spin } from "antd";
import { IconBrain, IconReceipt2, IconTrendingDown, IconDiscount2 } from "@tabler/icons-react";
import api from "@/lib/api";

const { Text, Title } = Typography;

const NeuralPromoAdvisor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [promoData, setPromoData] = useState<any[]>([]);

  const fetchNeural = async () => {
    try {
      const resp = await api.get("/api/v1/erp/ai/neural");
      if (resp.data.success) {
        setPromoData(resp.data.data.reality?.promoSuggestions || []);
      }
    } catch (err) {
      console.error("Neural Promo Err", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeural();
  }, []);

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong className="text-emerald-900">{text}</Text>,
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      align: "center" as const,
    },
    {
       title: "Neural Velocity",
       dataIndex: "dailyVelocity",
       key: "dailyVelocity",
       render: (val: string) => (
          <Space>
             <IconTrendingDown size={14} className="text-red-400" />
             <Text className="text-[10px] text-gray-400">{val} units/day</Text>
          </Space>
       )
    },
    {
       title: "Rec. Discount",
       dataIndex: "recommendedDiscount",
       key: "recommendedDiscount",
       align: "center" as const,
       render: (val: number) => (
          <Badge 
            count={`${val}%`} 
            style={{ backgroundColor: '#10b981', fontWeight: '900' }} 
          />
       )
    },
    {
      title: "Strategy",
      key: "action",
      render: () => (
        <Button size="small" type="link" icon={<IconDiscount2 size={16} />} className="text-emerald-600 font-bold p-0">
          Apply Strategy
        </Button>
      ),
    },
  ];

  if (loading) return <div className="h-40 flex items-center justify-center bg-white rounded-3xl"><Spin /></div>;

  return (
    <Card 
      className="mb-8 border-none shadow-xl overflow-hidden" 
      style={{ 
        background: "rgba(255, 255, 255, 0.9)", 
        backdropFilter: "blur(20px)",
        borderRadius: "32px",
        border: "1px solid rgba(16, 185, 129, 0.1)"
      }}
    >
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <Space align="center" className="mb-4">
             <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <IconBrain size={20} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/60">Neural Marketing Suite</span>
          </Space>
          
          <Title level={3} className="!mb-1 font-black tracking-tight"> Promotion Strategy Advisor</Title>
          <Text type="secondary" className="text-xs italic block mb-6">
             AI identified {promoData.length} stagnant products causing terminal liquidity drag. 
             Flash sales recommended to optimize warehouse throughput.
          </Text>

          <Table 
            dataSource={promoData} 
            columns={columns} 
            pagination={false} 
            size="small"
            className="neural-table"
            rowKey="productId"
          />
        </div>

        <div className="w-full md:w-72 bg-emerald-600/5 p-6 rounded-3xl border border-emerald-500/10 flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-2 mb-4">
                 <IconReceipt2 size={24} className="text-emerald-600" />
                 <span className="text-sm font-black text-emerald-900 uppercase">Liquidity Impact</span>
              </div>
              <Title level={1} className="!m-0 !text-emerald-600 font-black">Rs {Math.round(promoData.reduce((acc, d) => acc + d.currentStock, 0) * 150 / 1000)}K</Title>
              <Text className="text-[10px] font-bold text-emerald-800/40 uppercase">Locked Capital in Stagnant Stock</Text>
           </div>

           <div className="mt-8">
              <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 flex flex-col items-center text-center">
                 <span className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Neural Goal</span>
                 <span className="text-xs font-bold leading-tight">Clear 40% of Dead Stock by next Neural Cycle</span>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        .neural-table .ant-table { background: transparent !important; }
        .neural-table .ant-table-thead > tr > th { background: rgba(0,0,0,0.02) !important; border-bottom: 2px solid rgba(16, 185, 129, 0.1) !important; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
        .neural-table .ant-table-tbody > tr > td { border-bottom: 1px solid rgba(0,0,0,0.02) !important; padding: 12px 8px !important; }
      `}</style>
    </Card>
  );
};

export default NeuralPromoAdvisor;
