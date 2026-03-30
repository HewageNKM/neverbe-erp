import api from "@/lib/api";
import React, { useState, useEffect } from "react";
import PageContainer from "../../components/container/PageContainer";
import {
  IconBrain,
  IconRobot,
  IconSettingsAutomation,
  IconCalendarStats,
  IconChartInfographic,
} from "@tabler/icons-react";
import { functions } from "@/firebase/firebaseClient";
import { httpsCallable } from "firebase/functions";
import toast from "react-hot-toast";
import {
  Card,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Badge,
  InputNumber,
  Select,
  Divider,
} from "antd";

const { Text, Title } = Typography;

const AISettingsPage = () => {
  const [training, setTraining] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [config, setConfig] = useState({
    historicalRunway: 120,
    forecastWindow: 14,
    weightingMode: 'BALANCED'
  });

  const fetchConfig = async () => {
    try {
      const resp = await api.get('/api/v1/erp/settings/ai');
      if (resp.data.success) {
        setConfig(resp.data.data);
      }
    } catch (err) {
      console.error("Fetch Config Error", err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const resp = await api.post('/api/v1/erp/settings/ai', config);
      if (resp.data.success) {
        toast.success("Neural Matrix Synchronized Successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sync neural matrix");
    } finally {
      setSaving(false);
    }
  };

  const handleManualTrain = async () => {
    try {
      setTraining(true);
      toast.loading("Starting Neural Training Job...", { id: "training-job" });
      const triggerFn = httpsCallable(functions, "triggerManualTraining");
      const result: any = await triggerFn();
      if (result.data.success) {
        toast.success("Training started in background! Dashboard will update soon.", { id: "training-job", duration: 6000 });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger manual training", { id: "training-job" });
    } finally {
      setTraining(false);
    }
  };

  return (
    <PageContainer title="AI Settings" description="Neural Engine Management">
      <Space direction="vertical" size="large" className="w-full">
        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-10 bg-emerald-600 rounded-full" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none mb-1">
                Artificial Intelligence
              </span>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                AI Settings
              </h2>
            </div>
          </div>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <div className="flex flex-col gap-8">
              {/* 🧠 NEURAL ARCHITECTURE CONFIG */}
              <Card
                title={
                  <Space>
                    <IconSettingsAutomation size={20} className="text-emerald-600" /> 
                    <span className="text-emerald-950 font-black">Neural Architecture Configuration</span>
                  </Space>
                }
                className="shadow-2xl shadow-emerald-900/5 rounded-[2rem] border-none"
              >
                <div className="flex flex-col gap-8">
                  <Row gutter={40}>
                    <Col span={12}>
                      <Space direction="vertical" className="w-full">
                        <div className="flex items-center gap-2 mb-1">
                          <IconCalendarStats size={16} className="text-gray-400" />
                          <Text strong className="text-[11px] font-black uppercase tracking-widest text-gray-400">Historical Runway</Text>
                        </div>
                        <InputNumber 
                          min={30} 
                          max={365} 
                          value={config.historicalRunway} 
                          onChange={(v) => setConfig({...config, historicalRunway: v || 120})}
                          className="w-full rounded-xl h-12 flex items-center font-bold text-lg"
                        />
                        <Text className="text-[10px] text-gray-400">Minimum 30 days of sales history required for base context.</Text>
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space direction="vertical" className="w-full">
                        <div className="flex items-center gap-2 mb-1">
                          <IconChartInfographic size={16} className="text-gray-400" />
                          <Text strong className="text-[11px] font-black uppercase tracking-widest text-gray-400">Forecast Window</Text>
                        </div>
                        <InputNumber 
                          min={7} 
                          max={30} 
                          value={config.forecastWindow} 
                          onChange={(v) => setConfig({...config, forecastWindow: v || 14})}
                          className="w-full rounded-xl h-12 flex items-center font-bold text-lg"
                        />
                        <Text className="text-[10px] text-gray-400">Predictive horizon (Future days) for the neural matrix.</Text>
                      </Space>
                    </Col>
                  </Row>

                  <Divider className="m-0 opacity-50" />

                  <Space direction="vertical" className="w-full">
                    <Text strong className="text-[11px] font-black uppercase tracking-widest text-gray-400 block mb-1">Intelligence Weighting Mode</Text>
                    <Select
                      value={config.weightingMode}
                      onChange={(v) => setConfig({...config, weightingMode: v})}
                      className="w-full h-12 rounded-xl text-lg font-black"
                      options={[
                        { value: 'BALANCED', label: 'Balanced (Equal Weight: Sales, Stock, Profit)' },
                        { value: 'GROWTH', label: 'Growth-First (Prioritize Sales Velocity)' },
                        { value: 'STABILITY', label: 'Profit-Focus (Prioritize Margin Stability)' },
                        { value: 'INVENTORY', label: 'Inventory-Safe (Prioritize Stock Resilience)' },
                      ]}
                    />
                    <Text className="text-[10px] text-gray-400 italic">Adjusts how the 'Global Health Score' is calculated across system pillars.</Text>
                  </Space>

                  <div className="flex justify-end pt-4">
                     <Button 
                       type="primary" 
                       onClick={handleSaveConfig} 
                       loading={saving}
                       className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-2xl font-black h-14 px-12 shadow-xl shadow-emerald-200"
                     >
                       SAVE NEURAL MATRIX
                     </Button>
                  </div>
                </div>
              </Card>

              {/* ⚡ MANUAL TRAINING */}
              <Card
                title={
                  <Space>
                    <IconBrain size={20} className="text-emerald-600" /> 
                    <span className="text-emerald-950 font-black">Neural Engine Control</span>
                  </Space>
                }
                className="shadow-2xl shadow-emerald-900/5 rounded-[2rem] border-none bg-emerald-50/20"
              >
                <div className="flex flex-col gap-6">
                  <div>
                    <Text strong className="text-lg block mb-1">Intelligence Hub Training</Text>
                    <Text type="secondary" className="text-sm">
                      Manually re-train the ML model using the latest historical data and custom configuration runway.
                    </Text>
                  </div>
                  
                  <div className="p-8 bg-white rounded-[2rem] border border-emerald-50 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                      <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Engine Status</Text>
                      <Space size="middle">
                        <Badge status="processing" color="#10b981" />
                        <Text strong className="text-emerald-700 text-lg font-black tracking-tight">OPERATIONAL</Text>
                      </Space>
                    </div>
                    
                    <Button 
                      type="primary"
                      size="large"
                      icon={<IconRobot size={20} />}
                      loading={training}
                      onClick={handleManualTrain}
                      className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-2xl font-black h-14 px-8 flex items-center gap-2 shadow-lg shadow-emerald-200"
                    >
                      Trigger Neural Sync
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Neural Sub-Systems</span>}
              bordered={false}
              className="rounded-[2rem] bg-gray-50/50 p-4 border border-gray-100"
            >
              <Space direction="vertical" className="w-full" size="middle">
                {[
                  { label: 'Primary Model', val: 'Gemini 2.0 Flash', color: 'blue' },
                  { label: 'Projection Core', val: 'TensorFlow.js Hub', color: 'emerald' },
                  { label: 'Cloud Region', val: 'us-central1', color: 'gray' },
                  { label: 'Lifecycle', val: 'v4.2.0-neural', color: 'purple' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-none">
                    <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</Text>
                    <Badge color={item.color} text={<span className="font-black text-xs text-gray-800 tracking-tight">{item.val}</span>} />
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </PageContainer>
  );
};

export default AISettingsPage;
