import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronRight,
  Home,
  Calendar,
  Clock,
  User,
  ChevronDown,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

const pageTitleMap: Record<string, { title: string; parent?: string }> = {
  '/dashboard': { title: '经营看板' },
  '/orders': { title: '订单池', parent: '订单管理' },
  '/routes': { title: '线路排班', parent: '调度中心' },
  '/workers': { title: '师傅管理', parent: '人员管理' },
  '/warehouse': { title: '仓内任务', parent: '仓储管理' },
  '/aftersales': { title: '售后中心', parent: '客户服务' },
};

function getBreadcrumbs(pathname: string): Array<{ label: string; to?: string }> {
  const pageInfo = pageTitleMap[pathname];
  const crumbs: Array<{ label: string; to?: string }> = [{ label: '首页', to: '/dashboard' }];

  if (pageInfo) {
    if (pageInfo.parent) {
      crumbs.push({ label: pageInfo.parent });
    }
    crumbs.push({ label: pageInfo.title });
  }

  return crumbs;
}

export default function Topbar() {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const breadcrumbs = getBreadcrumbs(location.pathname);
  const timeStr = currentTime.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center gap-6 shrink-0">
      <nav className="flex items-center gap-1.5 text-sm min-w-0">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />}
            {index === 0 ? (
              <div className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 cursor-pointer transition-colors">
                <Home className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{crumb.label}</span>
              </div>
            ) : index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-neutral-800 truncate">{crumb.label}</span>
            ) : (
              <span className="text-neutral-500 hidden md:inline">{crumb.label}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="flex-1 max-w-md mx-auto hidden lg:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索订单号、客户、师傅..."
            className="input pl-10 bg-neutral-50 border-neutral-200 hover:bg-white focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-50 text-neutral-600">
          <Calendar className="w-4 h-4 text-neutral-500" />
          <span className="text-sm font-medium">{formatDate(currentTime)}</span>
          <span className="w-px h-4 bg-neutral-300" />
          <Clock className="w-4 h-4 text-neutral-500" />
          <span className="text-sm font-medium font-mono tabular-nums">{timeStr}</span>
        </div>

        <button className="relative p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent-rose text-white text-[10px] font-bold flex items-center justify-center leading-none">
            5
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-green to-brand-green-light flex items-center justify-center text-white text-sm font-semibold shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-neutral-800 leading-tight">张经理</p>
              <p className="text-xs text-neutral-500 leading-tight">运营主管</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-2 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-800">张经理</p>
                <p className="text-xs text-neutral-500">zhang@cyclehome.com</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                  <User className="w-4 h-4 text-neutral-500" />
                  个人中心
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                  <Settings className="w-4 h-4 text-neutral-500" />
                  账号设置
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                  <HelpCircle className="w-4 h-4 text-neutral-500" />
                  帮助中心
                </button>
              </div>
              <div className="border-t border-neutral-100 pt-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-accent-rose hover:bg-accent-rose/5 transition-colors">
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
