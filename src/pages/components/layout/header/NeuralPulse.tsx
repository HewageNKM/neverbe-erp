import { useNavigate } from "react-router-dom";
import { Tooltip, Progress } from "antd";
import { IconBrain } from "@tabler/icons-react";
import { useNeural } from "@/contexts/NeuralContext";

const NeuralPulse = ({ collapsed = false }: { collapsed?: boolean }) => {
  const { data } = useNeural();
  const health = data?.healthScore || null;
  const navigate = useNavigate();

  if (health === null) return null;

  const getStatusColor = () => {
    if (health > 80) return "#10b981"; // Emerald
    if (health > 40) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  return (
    <Tooltip title={`Neural Health: ${health}% (Click for Hub)`} placement="right">
      <div 
        onClick={() => navigate('/dashboard')}
        className={`cursor-pointer transition-all hover:scale-110 flex items-center justify-center ${collapsed ? 'w-full' : 'gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 shadow-sm'}`}
      >
        <div className="relative flex items-center justify-center">
           <Progress 
             type="circle" 
             percent={health} 
             size={collapsed ? 28 : 20} 
             strokeColor={getStatusColor()} 
             showInfo={false}
             strokeWidth={15}
           />
           <IconBrain 
             size={collapsed ? 14 : 10} 
             className="absolute" 
             style={{ color: getStatusColor() }} 
           />
           <div 
             className="absolute w-full h-full rounded-full animate-ping opacity-20"
             style={{ backgroundColor: getStatusColor() }}
           />
        </div>
        {!collapsed && (
          <span className="text-[10px] font-black text-gray-700 tracking-tighter">
            {health}%
          </span>
        )}
      </div>
    </Tooltip>
  );
};

export default NeuralPulse;
