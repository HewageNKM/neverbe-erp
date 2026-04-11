import React, { useEffect, useState } from \"react\";
import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Radio,
  Space,
  Typography,
  Divider,
  Empty,
  Tooltip,
} from \"antd\";
import {
  IconMessage,
  IconMail,
  IconSend,
  IconHistory,
  IconPlus,
  IconHourglass,
  IconInfoCircle,
} from \"@tabler/icons-react\";
import api from \"@/lib/api\";
import toast from \"react-hot-toast\";
import dayjs from \"dayjs\";
import { Order } from \"@/model/Order\";

const { Text, Title, Paragraph } = Typography;

interface Props {
  order: Order;
}

const CommunicationHub: React.FC<Props> = ({ order }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [form] = Form.useForm();
  const [selectedTemplate, setSelectedTemplate] = useState<string>(\"custom\");

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/api/v1/erp/orders/${order.orderId}/notifications`);
      setHistory(data);
    } catch (error) {
      console.error(\"Failed to fetch notification history\", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [order.orderId]);

  const handleSendManual = async (values: any) => {
    try {
      setIsSending(true);
      await api.post(`/api/v1/erp/orders/${order.orderId}/notifications/send`, values);
      toast.success(`${values.type.toUpperCase()} SENT SUCCESSFULLY`);
      setIsModalOpen(false);
      form.resetFields();
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || \"Failed to send message\");
    } finally {
      setIsSending(false);
    }
  };

  const templates: Record<string, { subject?: string; content: string }> = {
    quick: {
      subject: `Update regarding your order #${order.orderId.toUpperCase()}`,
      content: `Hi ${order.customer?.name?.split(\" \")[0] || \"customer\"}, your order #${order.orderId.toUpperCase()} is currently in ${order.status} status. We will keep you updated on further progress. Thank you!`,
    },
    delay: {
      subject: `Important update: Order #${order.orderId.toUpperCase()} Delay`,
      content: `Hi ${order.customer?.name?.split(\" \")[0] || \"customer\"}, we apologize, but your order #${order.orderId.toUpperCase()} is experiencing a slight delay. We are working hard to ship it as soon as possible. Thank you for your patience.`,
    },
    custom: {
      subject: `Update regarding your order #${order.orderId.toUpperCase()}`,
      content: \"\",
    },
  };

  const handleTemplateChange = (e: any) => {
    const val = e.target.value;
    setSelectedTemplate(val);
    if (val !== \"custom\") {
      form.setFieldsValue({
        content: templates[val].content,
        subject: templates[val].subject,
      });
    } else {
      form.setFieldsValue({ content: \"\", subject: templates[\"custom\"].subject });
    }
  };

  const columns = [
    {
      title: \"Date\",
      dataIndex: \"createdAt\",
      key: \"createdAt\",
      width: 180,
      render: (date: any) => dayjs(date).format(\"DD MMM YYYY, hh:mm A\"),
    },
    {
      title: \"Type\",
      dataIndex: \"type\",
      key: \"type\",
      width: 140,
      render: (type: string) => {
        const isSms = type.toLowerCase().includes(\"sms\");
        const isEmail = type.toLowerCase().includes(\"email\");
        const isManual = type.toLowerCase().includes(\"manual\");
        
        return (
          <Space>
            {isSms ? <IconMessage size={14} className=\"text-blue-500\" /> : <IconMail size={14} className=\"text-emerald-500\" />}
            <Text className=\"text-xs font-bold uppercase tracking-tighter\">
              {isManual ? \"Manual\" : \"Auto\"} {isSms ? \"SMS\" : \"Email\"}
            </Text>
          </Space>
        );
      },
    },
    {
      title: \"Recipient\",
      dataIndex: \"to\",
      key: \"to\",
      width: 180,
      render: (to: string) => <Text className=\"text-xs text-gray-500\">{to}</Text>,
    },
    {
      title: \"Message Content\",
      dataIndex: \"content\",
      key: \"content\",
      render: (content: string, record: any) => {
         if (!content && record.type.includes(\"status\")) {
            return <i className=\"text-gray-400 text-xs\">Automated {record.status} update notification</i>;
         }
         return (
           <Tooltip title={content}>
             <Text className=\"text-xs line-clamp-1 truncate max-w-[400px]\">{content || \"-\"}</Text>
           </Tooltip>
         );
      }
    },
  ];

  return (
    <Card
      title={
        <div className=\"flex items-center gap-2\">
          <IconHistory size={18} className=\"text-emerald-600\" />
          <span className=\"text-emerald-900 text-[10px] font-black uppercase tracking-widest\">
            Customer Communication Hub
          </span>
        </div>
      }
      extra={
        <Button
          type=\"primary\"
          icon={<IconPlus size={16} />}
          onClick={() => setIsModalOpen(true)}
          style={{ background: \"#16a34a\", borderColor: \"#16a34a\" }}
          className=\"font-bold text-xs\"
        >
          SEND UPDATE
        </Button>
      }
      className=\"shadow-xl shadow-gray-200/50 border-gray-100\"
    >
      <Table
        columns={columns}
        dataSource={history}
        rowKey=\"id\"
        loading={isLoading}
        pagination={{ pageSize: 5 }}
        size=\"small\"
        locale={{ emptyText: <Empty description=\"No communication history yet\" /> }}
      />

      <Modal
        title={
          <div className=\"flex flex-col gap-1 mb-6\">
            <Text className=\"text-[10px] font-black uppercase tracking-widest text-emerald-600\">New Message</Text>
            <Title level={4} className=\"!m-0 tracking-tight\">Direct Customer Notification</Title>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout=\"vertical\"
          onFinish={handleSendManual}
          initialValues={{ type: \"sms\", template: \"custom\", subject: templates[\"custom\"].subject }}
        >
          <div className=\"grid grid-cols-2 gap-6 mb-6\">
             <Form.Item label=\"Delivery Channel\" name=\"type\" rules={[{ required: true }]}>
                <Radio.Group className=\"w-full\">
                   <Radio.Button value=\"sms\" className=\"w-1/2 text-center h-12 flex items-center justify-center font-bold\">
                      <IconMessage size={18} className=\"mr-2\" /> SMS
                   </Radio.Button>
                   <Radio.Button value=\"email\" className=\"w-1/2 text-center h-12 flex items-center justify-center font-bold\">
                      <IconMail size={18} className=\"mr-2\" /> EMAIL
                   </Radio.Button>
                </Radio.Group>
             </Form.Item>

             <Form.Item label=\"Template Option\">
                <Radio.Group onChange={handleTemplateChange} value={selectedTemplate} className=\"w-full flex flex-col gap-2\">
                   <Radio value=\"quick\" className=\"text-xs\">Quick Status Update</Radio>
                   <Radio value=\"delay\" className=\"text-xs\">Order Delay / Wait</Radio>
                   <Radio value=\"custom\" className=\"text-xs\">Custom Message</Radio>
                </Radio.Group>
             </Form.Item>
          </div>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
             {({ getFieldValue }) => getFieldValue('type') === 'email' && (
                <Form.Item label=\"Email Subject\" name=\"subject\" rules={[{ required: true }]}>
                   <Input size=\"large\" prefix={<IconInfoCircle size={16} className=\"text-gray-300\" />} />
                </Form.Item>
             )}
          </Form.Item>

          <Form.Item 
            label=\"Message Content\" 
            name=\"content\" 
            rules={[{ required: true, message: 'Please enter message content' }]}
            help={<Text type=\"secondary\" className=\"text-[10px]\">Keep SMS content under 160 characters if possible for best delivery.</Text>}
          >
            <Input.TextArea rows={5} className=\"rounded-xl p-4 bg-gray-50 border-gray-100\" placeholder=\"Type your message here...\" />
          </Form.Item>

          <Divider />

          <Space className=\"w-full justify-end\">
             <Button onClick={() => setIsModalOpen(false)} className=\"font-bold h-11 px-6\">CANCEL</Button>
             <Button 
                type=\"primary\" 
                htmlType=\"submit\" 
                icon={<IconSend size={18} />} 
                loading={isSending}
                className=\"h-11 px-8 font-bold shadow-lg shadow-emerald-500/20\"
                style={{ background: \"#16a34a\", borderColor: \"#16a34a\" }}
             >
                SEND NOTIFICATION
             </Button>
          </Space>
        </Form>
      </Modal>
    </Card>
  );
};

export default CommunicationHub;
