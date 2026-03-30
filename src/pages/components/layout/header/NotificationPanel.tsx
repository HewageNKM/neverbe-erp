import { Drawer, List, Badge, Button, Space, Typography, Tag, Empty, Tooltip } from "antd";
import { IconBell, IconCheck, IconExternalLink, IconTrash } from "@tabler/icons-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import toast from "react-hot-toast";

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ open, onClose }: Props) {
  const { notifications, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch("/api/v1/erp/notifications", { id });
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/api/v1/erp/notifications", { all: true });
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleNotificationClick = (n: Notification) => {
    handleMarkAsRead(n.id);
    onClose();
    
    if (n.metadata?.orderId) {
      navigate(`/orders/${n.metadata.orderId}`);
    } else if (n.type === "STOCK") {
      navigate("/inventory");
    }
  };

  const getTypeTag = (type: string) => {
    switch (type) {
      case "ORDER": return <Tag color="blue">Order</Tag>;
      case "STOCK": return <Tag color="orange">Inventory</Tag>;
      case "AI": return <Tag color="purple">AI Engine</Tag>;
      default: return <Tag color="gray">System</Tag>;
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between w-full">
          <Space>
            <IconBell size={20} />
            <Title level={5} style={{ margin: 0 }}>Notifications</Title>
          </Space>
          {unreadCount > 0 && (
            <Button 
              type="link" 
              size="small" 
              icon={<IconCheck size={14} />} 
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={400}
    >
      {notifications.length === 0 ? (
        <Empty description="No notifications found" className="mt-20" />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 border-l-4 ${item.read ? 'border-transparent' : 'border-blue-500 bg-blue-50/20'}`}
              onClick={() => handleNotificationClick(item)}
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-start">
                  {getTypeTag(item.type)}
                  <Text type="secondary" className="text-[10px]">
                    {dayjs(item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt).fromNow()}
                  </Text>
                </div>
                <Text strong className="text-sm">{item.title}</Text>
                <Text className="text-xs text-gray-500 line-clamp-2">{item.message}</Text>
                
                {item.metadata?.orderId && (
                  <div className="mt-2 flex items-center text-blue-600 font-bold text-[10px] uppercase">
                    <IconExternalLink size={12} className="mr-1" /> View Order
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
}
