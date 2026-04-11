import React, { useEffect, useState } from "react";
import { Table, Tag, Card, Input, Space, Button, Typography, Modal, Descriptions } from "antd";
import { IconSearch, IconEye, IconRefresh, IconMessage2, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import api from "@/lib/api";
import PageContainer from "../components/container/PageContainer";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const { Text, Title } = Typography;

interface NotificationLog {
  id: string;
  orderId: string;
  type: string;
  to: string;
  content: string;
  status?: string;
  createdAt: any;
  hashValue?: string;
}

const CommunicationsPage = () => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/v1/erp/communications?limit=100");
      setLogs(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch communication logs:", error);
      toast.error("Failed to load communication history");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.orderId?.toLowerCase().includes(searchText.toLowerCase()) ||
    log.to?.toLowerCase().includes(searchText.toLowerCase()) ||
    log.type?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: any) => (
        <Text className="text-gray-500 text-xs">
          {dayjs(date?.toDate?.() || date).format("MMM DD, YYYY HH:mm")}
        </Text>
      ),
      sorter: (a: any, b: any) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (id: string) => (
        <Text strong className="text-emerald-700">#{id?.toUpperCase()}</Text>
      ),
    },
    {
      title: "Channel",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const isEmail = type?.includes("email");
        return (
          <Tag color={isEmail ? "blue" : "green"} className="rounded-full px-3 uppercase text-[10px] font-bold">
            {type?.replace("_", " ")}
          </Tag>
        );
      },
    },
    {
      title: "Recipient",
      dataIndex: "to",
      key: "to",
      render: (to: string) => <Text className="text-xs font-medium">{to}</Text>,
    },
    {
      title: "Content Preview",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (content: string) => <Text className="text-gray-500 text-xs">{content || "Template-based message"}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => status ? (
        <Tag color="cyan" className="rounded-full text-[10px] font-black uppercase">{status}</Tag>
      ) : <Tag color="default" className="rounded-full text-[10px] font-black uppercase">SENT</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: NotificationLog) => (
        <Button 
          type="text" 
          icon={<IconEye size={18} />} 
          onClick={() => setSelectedLog(record)}
          className="hover:text-emerald-600"
        />
      ),
    },
  ];

  return (
    <PageContainer title="Communication Center">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <Title level={4} className="!m-0 text-gray-800">Communication Logs</Title>
            <Text className="text-gray-400 text-xs">Track all outbound customer interactions</Text>
          </div>
          <Space size="middle">
            <Input
              placeholder="Search Order, Phone or Email..."
              prefix={<IconSearch size={16} className="text-gray-400" />}
              className="w-full md:w-72 h-10 rounded-xl"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            <Button 
              icon={<IconRefresh size={18} />} 
              onClick={fetchLogs}
              className="h-10 w-10 flex items-center justify-center rounded-xl border-gray-200"
            />
          </Space>
        </div>

        <Card className="rounded-2xl border-gray-100 shadow-xl shadow-gray-200/50" bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={filteredLogs}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10, position: ["bottomCenter"] }}
            className="custom-table"
          />
        </Card>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <IconMessage2 size={20} />
            </div>
            <span className="font-bold">Message Details</span>
          </div>
        }
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedLog(null)} className="rounded-lg h-10 px-8 font-bold">
            Close
          </Button>
        ]}
        width={600}
        className="rounded-2xl overflow-hidden"
      >
        {selectedLog && (
          <div className="py-4 space-y-6">
            <Descriptions bordered size="small" column={1} className="rounded-lg overflow-hidden border-gray-100">
              <Descriptions.Item label="Order ID" labelStyle={{ fontWeight: 'bold', width: '30%' }}>
                <Text strong className="text-emerald-700">#{selectedLog.orderId?.toUpperCase()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Channel" labelStyle={{ fontWeight: 'bold' }}>
                {selectedLog.type?.replace("_", " ").toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label="Recipient" labelStyle={{ fontWeight: 'bold' }}>
                {selectedLog.to}
              </Descriptions.Item>
              <Descriptions.Item label="Date Sent" labelStyle={{ fontWeight: 'bold' }}>
                {dayjs(selectedLog.createdAt?.toDate?.() || selectedLog.createdAt).format("MMMM DD, YYYY HH:mm:ss")}
              </Descriptions.Item>
              {selectedLog.status && (
                <Descriptions.Item label="Status Hook" labelStyle={{ fontWeight: 'bold' }}>
                  {selectedLog.status}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col gap-3">
              <Text className="text-[10px] uppercase font-black tracking-widest text-gray-400">Content</Text>
              <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-mono italic">
                {selectedLog.content || "Content was rendered from a Handlebars template."}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default CommunicationsPage;
