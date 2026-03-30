import React from "react";
import { Card, Table, Tag, Typography, Space, Button, Progress, Tooltip } from "antd";
import { IconBrain, IconUserExclamation, IconChartLine, IconMail } from "@tabler/icons-react";
import { useNeural } from "@/contexts/NeuralContext";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const NeuralCustomerInsight: React.FC = () => {
  const { data, loading } = useNeural();
  const navigate = useNavigate();

  if (loading || !data) return null;

  const atRisk = data.reality?.customerRetention || [];
  const retentionScore = Math.max(0, 100 - (atRisk.length * 8));

  const columns = [
    {
      title: "Customer",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div>
          <Text strong className="text-indigo-900 block">{text}</Text>
          <Text className="text-[9px] text-gray-400 font-mono uppercase">{record.customerId}</Text>
        </div>
      ),
    },
    {
      title: "Last Seen",
      dataIndex: "daysSinceLast",
      key: "daysSinceLast",
      render: (val: number) => (
        <Space size="small">
          <Text strong className="text-red-500">{val}d ago</Text>
          <Text className="text-[9px] text-gray-400 italic">(Avg. {data.reality.customerRetention.find((c:any) => c.daysSinceLast === val)?.avgGap}d)</Text>
        </Space>
      )
    },
    {
      title: "Value Index",
      dataIndex: "totalSpent",
      key: "totalSpent",
      render: (val: number) => <Text strong className="text-indigo-600">LKR {val.toLocaleString()}</Text>,
    },
    {
      title: "Risk Control",
      key: "action",
      render: () => (
        <Button 
          size="small" 
          type="primary" 
          ghost
          icon={<IconMail size={14} />} 
          className="text-[10px] font-black uppercase rounded-lg"
          onClick={() => navigate('/campaign/coupons')}
        >
          Send Recovery Offer
        </Button>
      ),
    },
  ];

  return (
    <Card 
      className="mb-8 border-none shadow-2xl relative overflow-hidden" 
      style={{ 
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        borderRadius: "32px"
      }}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          {/* Left: Retention Health */}
          <div className="flex-1 p-4">
            <Space align="center" className="mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <IconBrain size={24} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400/60">Neural Loyalty Core</span>
            </Space>
            
            <Title level={2} className="!text-white !mb-2 font-black tracking-tighter">
              Retention Health Index
            </Title>
            <Text className="text-indigo-100/40 text-xs block mb-8 leading-relaxed max-w-sm">
               AI-driven churn prediction using RFM (Recency, Frequency, Monetary) analysis over a 90-day trajectory.
            </Text>

            <div className="flex items-end gap-6 mb-8">
               <div className="flex-1">
                  <div className="flex justify-between mb-2">
                     <span className="text-[10px] font-black text-indigo-100/40 uppercase tracking-widest">Company Pulse</span>
                     <span className="text-[10px] font-black text-indigo-400 uppercase">{retentionScore}% STABLE</span>
                  </div>
                  <Progress 
                    percent={retentionScore} 
                    strokeColor="#818cf8" 
                    trailColor="rgba(255,255,255,0.05)" 
                    strokeWidth={12} 
                    showInfo={false} 
                  />
               </div>
               <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center min-w-[120px]">
                  <div className="text-[9px] font-bold text-indigo-400 uppercase mb-1">Churn Risks</div>
                  <Title level={3} className="m-0 !text-white font-black">{atRisk.length}</Title>
               </div>
            </div>

            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-start gap-3">
               <IconUserExclamation size={18} className="text-indigo-400 mt-1" />
               <Text className="text-[11px] text-indigo-100/70 leading-relaxed uppercase font-bold tracking-tight">
                  {atRisk.length > 0 
                    ? `Neural Core detected ${atRisk.length} high-value customers breaching their predicted 90-day purchase gap.`
                    : "Customer loyalty patterns are currently within the neural growth quadrant."}
               </Text>
            </div>
          </div>

          {/* Right: At-Risk Table */}
          <div className="flex-1 lg:max-w-xl bg-white rounded-[2rem] p-6 shadow-xl border border-indigo-100/50">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                   <IconChartLine size={20} className="text-indigo-600" />
                   <span className="text-xs font-black text-indigo-900 uppercase">At-Risk High Spenders</span>
                </div>
                <Tag color="error" className="m-0 border-none font-black text-[9px] px-2 py-0.5 rounded-full uppercase">Priority Actions</Tag>
             </div>

             <Table 
               dataSource={atRisk} 
               columns={columns} 
               pagination={false} 
               size="small" 
               rowKey="customerId"
               className="neural-retention-table"
             />

             <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center">
                <Button type="link" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                   Launch Re-engagement Campaign →
                </Button>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .neural-retention-table .ant-table { background: transparent !important; }
        .neural-retention-table .ant-table-thead > tr > th { background: transparent !important; border-bottom: 2px solid #f3f4f6 !important; font-size: 9px; text-transform: uppercase; color: #94a3b8; }
        .neural-retention-table .ant-table-tbody > tr > td { padding: 12px 8px !important; border-bottom: 1px solid #f8fafc !important; }
      `}</style>
    </Card>
  );
};

export default NeuralCustomerInsight;
