import DashboardCard from "../shared/DashboardCard";
import { useEffect, useState, lazy } from "react";
import { useAppSelector } from "@/lib/hooks";
import {
  getOrderStatusDistributionAction,
  getPendingOrdersCountAction,
} from "@/actions/reportsActions";
import toast from "react-hot-toast";
import {
  IconChartPie,
  IconRefresh,
  IconClock,
  IconChecklist,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Button, Spin, Tag } from "antd";

const Chart = lazy(() => import("react-apexcharts"));

interface StatusData {
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}

interface PendingData {
  pendingPayment: number;
  pendingFulfillment: number;
  total: number;
}

const OrderStatusPanel = () => {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [pendingData, setPendingData] = useState<PendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAppSelector((state) => state.authSlice);

  useEffect(() => {
    if (currentUser) fetchAll();
  }, [currentUser]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [status, pending] = await Promise.all([
        getOrderStatusDistributionAction(),
        getPendingOrdersCountAction(),
      ]);
      setStatusData(status);
      setPendingData(pending);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to load order status");
    } finally {
      setLoading(false);
    }
  };

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: ["Pending", "Processing", "Completed", "Cancelled"],
    colors: ["#fbbf24", "#3b82f6", "#10b981", "#ef4444"],
    legend: {
      position: "bottom",
      fontFamily: "inherit",
      fontWeight: 700,
      fontSize: "10px",
      labels: { colors: "#71717a" },
      markers: { size: 5 },
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "10px",
              fontFamily: "inherit",
              fontWeight: 700,
              color: "#71717a",
            },
            value: {
              show: true,
              fontSize: "18px",
              fontFamily: "inherit",
              fontWeight: 900,
              color: "#064e3b", // Emerald 900
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "10px",
              fontFamily: "inherit",
              fontWeight: 700,
              color: "#71717a",
              formatter: (w) =>
                w.globals.seriesTotals.reduce(
                  (a: number, b: number) => a + b,
                  0,
                ),
            },
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      y: { formatter: (val: number) => `${val} orders` },
    },
  };

  const series = statusData
    ? [
        statusData.pending,
        statusData.processing,
        statusData.completed,
        statusData.cancelled,
      ]
    : [];

  return (
    <DashboardCard>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <IconChartPie size={18} className="text-purple-500" />
          <h4 className="text-lg font-bold text-black m-0">Order Status</h4>
          <Button
            type="text"
            shape="circle"
            icon={<IconRefresh size={14} />}
            onClick={fetchAll}
            loading={loading}
          />
        </div>
        <Tag className="m-0 text-xs font-bold text-gray-500 bg-gray-100 border-none">
          This Month
        </Tag>
      </div>

      <Spin spinning={loading}>
        {/* Donut Chart */}
        <div className="mb-4">
          {statusData && series.some((v) => v > 0) ? (
            <Chart
              options={chartOptions}
              series={series}
              type="donut"
              height={200}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
              <IconChartPie size={32} className="mb-2 opacity-50" />
              <span className="text-xs font-bold">No orders this month</span>
            </div>
          )}
        </div>

        {/* Needs Attention Section */}
        {pendingData && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <IconAlertCircle size={14} className="text-red-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Needs Attention
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-yellow-100 bg-yellow-50 rounded-2xl hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <IconClock size={13} className="text-yellow-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-700">
                    Awaiting Payment
                  </span>
                </div>
                <p className="text-xl font-bold text-yellow-700 m-0">
                  {pendingData.pendingPayment}
                </p>
              </div>
              <div className="p-3 border border-blue-100 bg-blue-50 rounded-2xl hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <IconChecklist size={13} className="text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    To Fulfill
                  </span>
                </div>
                <p className="text-xl font-bold text-blue-700 m-0">
                  {pendingData.pendingFulfillment}
                </p>
              </div>
            </div>
          </div>
        )}
      </Spin>
    </DashboardCard>
  );
};

export default OrderStatusPanel;
