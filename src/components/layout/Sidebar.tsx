import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Route,
  Users,
  Warehouse,
  Headphones,
  Leaf,
  Settings,
  LogOut,
} from 'lucide-react';
import { getInitials } from '@/utils/formatters';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: '经营看板', icon: LayoutDashboard },
  { to: '/orders', label: '订单池', icon: ClipboardList },
  { to: '/routes', label: '线路排班', icon: Route },
  { to: '/workers', label: '师傅管理', icon: Users },
  { to: '/warehouse', label: '仓内任务', icon: Warehouse },
  { to: '/aftersales', label: '售后中心', icon: Headphones },
];

interface UserInfo {
  name: string;
  role: string;
  avatar?: string;
}

const mockUser: UserInfo = {
  name: '张经理',
  role: '运营主管',
};

export default function Sidebar() {
  return (
    <aside className="flex flex-col h-screen w-64 bg-white border-r border-neutral-200 shrink-0">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-neutral-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center shadow-sm">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-neutral-900 leading-tight">CycleHome</span>
          <span className="text-xs text-neutral-500 font-medium">焕新居</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-neutral-100 p-3 space-y-1">
        <button className="sidebar-link sidebar-link-inactive w-full">
          <Settings className="w-5 h-5 shrink-0" />
          <span>系统设置</span>
        </button>

        <div className="mt-3 p-3 rounded-xl bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-green to-brand-green-light flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {mockUser.avatar ? (
                <img
                  src={mockUser.avatar}
                  alt={mockUser.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(mockUser.name)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">{mockUser.name}</p>
              <p className="text-xs text-neutral-500 truncate">{mockUser.role}</p>
            </div>
            <button className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
