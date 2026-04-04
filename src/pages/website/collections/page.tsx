import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Switch,
  Space,
  Typography,
  Image,
  Upload,
  message,
  Card,
  Tooltip,
} from "antd";
import {
  IconStar,
  IconStarOff,
  IconUpload,
  IconDeviceFloppy,
  IconRefresh,
} from "@tabler/icons-react";
import type { ColumnsType } from "antd/es/table";
import api from "@/lib/api";
import PageContainer from "../../components/container/PageContainer";
import { Category } from "@/model/Category";
import { useAppSelector } from "@/lib/hooks";

const { Text, Title } = Typography;

const CollectionsPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const { currentUser, loading: authLoading } = useAppSelector((state) => state.authSlice);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/erp/master/categories", {
        params: { size: 100, status: "active" }, // Get all active categories
      });
      setCategories(data.dataList || []);
    } catch (e) {
      console.error(e);
      message.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && !authLoading) fetchCategories();
  }, [currentUser, authLoading]);

  const handleToggleFeatured = async (category: Category) => {
    try {
      setUpdating(category.id!);
      const newStatus = !category.isFeatured;
      
      const formData = new FormData();
      formData.append("data", JSON.stringify({ 
        ...category,
        isFeatured: newStatus 
      }));

      await api.put(`/api/v1/erp/master/categories/${category.id}`, formData);
      
      setCategories(prev => prev.map(c => 
        c.id === category.id ? { ...c, isFeatured: newStatus } : c
      ));
      
      message.success(newStatus ? "Added to Featured" : "Removed from Featured");
    } catch (e) {
      message.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const handleImageUpload = async (category: Category, file: File) => {
    try {
      setUpdating(category.id!);
      
      // Basic validation for 4:5 aspect ratio (optional client side check)
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG/WEBP files!');
        return false;
      }

      const formData = new FormData();
      // Current category data
      formData.append("data", JSON.stringify(category));
      // The file
      formData.append("file", file);

      const { data: updatedCategory } = await api.put(`/api/v1/erp/master/categories/${category.id}`, formData);
      
      setCategories(prev => prev.map(c => 
        c.id === category.id ? { ...c, imageUrl: updatedCategory.imageUrl } : c
      ));
      
      message.success("Image uploaded successfully");
    } catch (e) {
      message.error("Image upload failed");
    } finally {
      setUpdating(null);
    }
    return false; // Prevent default upload
  };

  const columns: ColumnsType<Category> = [
    {
      title: "Category",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" className="text-xs">{record.description || "No description"}</Text>
        </Space>
      ),
    },
    {
      title: "Featured Status",
      dataIndex: "isFeatured",
      key: "isFeatured",
      width: 150,
      align: "center",
      render: (isFeatured, record) => (
        <Tooltip title={isFeatured ? "Currently Featured" : "Not Featured"}>
          <Switch
            checked={isFeatured}
            loading={updating === record.id}
            onChange={() => handleToggleFeatured(record)}
            checkedChildren={<IconStar size={16} fill="currentColor" />}
            unCheckedChildren={<IconStarOff size={16} />}
            className={isFeatured ? "bg-accent!" : ""}
          />
        </Tooltip>
      ),
    },
    {
      title: "Website Card Image (4:5)",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 250,
      render: (imageUrl, record) => (
        <Space align="center" size="middle">
          <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={record.name} 
                width={64} 
                height={80} 
                className="object-cover"
              />
            ) : (
              <Text type="secondary" className="text-[10px] text-center px-1">NO IMAGE</Text>
            )}
          </div>
          <Upload
            beforeUpload={(file) => handleImageUpload(record, file)}
            showUploadList={false}
            accept="image/*"
          >
            <Button 
              size="small" 
              icon={<IconUpload size={14} />}
              loading={updating === record.id}
            >
              Change
            </Button>
          </Upload>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer 
      title="Featured Collections | Website Manager" 
      description="Manage which categories appear on your homepage featured section."
    >
      <div className="space-y-6">
        <Card className="shadow-sm border-none bg-white font-sans rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-10 bg-accent rounded-full" />
              <div>
                <Title level={4} className="m-0! font-black tracking-tight uppercase">Featured Categories</Title>
                <Text type="secondary">Tick the star to make a category appear as a collection card on the website.</Text>
              </div>
            </div>
            <Button 
              icon={<IconRefresh size={18} />} 
              onClick={fetchCategories} 
              loading={loading}
              className="flex items-center gap-2"
            >
              Refresh
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={categories}
            loading={loading}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
            bordered
            className="custom-table"
          />
        </Card>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
          <div className="bg-blue-100 p-2 rounded-full h-fit">
            <IconStar size={20} className="text-blue-600" />
          </div>
          <div>
            <Text strong className="text-blue-800">Pro Tip:</Text>
            <p className="text-blue-700 text-sm m-0">
              For best results, use images with a 4:5 aspect ratio (e.g., 800x1000px). 
              Featured categories appear in the "Shop by Category" section on your homepage.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default CollectionsPage;
