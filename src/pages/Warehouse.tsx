import { useState, useMemo } from 'react';
import {
  Package,
  Sparkles,
  ShoppingBag,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  GripVertical,
  User,
  Plus,
  Search,
  QrCode,
  FileText,
  Camera,
  Upload,
  CheckCircle2,
  Circle,
  Printer,
  Handshake,
  Edit2,
  MapPin,
  Clock,
  Building2,
  Sofa,
  Bed,
  Armchair,
  Lamp,
  ChevronRight,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import mockWarehouse, { InventoryItem, QualityGrade } from '@/data/mockWarehouse';
import mockBuildingRules, { BuildingRule } from '@/data/mockBuildingRules';
import { getInitials } from '@/utils/formatters';
import clsx from 'clsx';

type WarehouseTab = 'KANBAN' | 'INBOUND' | 'OUTBOUND' | 'RULES';
type KanbanColumn = 'QC_PENDING' | 'CLEANING' | 'REPAIRING' | 'PAINTING' | 'RECHECK' | 'FOR_SALE';

const KANBAN_COLUMNS: { key: KanbanColumn; title: string; color: string; bg: string; border: string }[] = [
  { key: 'QC_PENDING', title: '待质检', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'CLEANING', title: '清洗中', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  { key: 'REPAIRING', title: '修补中', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  { key: 'PAINTING', title: '上漆中', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  { key: 'RECHECK', title: '待复检', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'FOR_SALE', title: '可售', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
];

const QUALITY_GRADE_CONFIG: Record<QualityGrade, { label: string; bg: string; text: string }> = {
  A_PLUS: { label: 'A+', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  A: { label: 'A', bg: 'bg-green-100', text: 'text-green-700' },
  B: { label: 'B', bg: 'bg-blue-100', text: 'text-blue-700' },
  C: { label: 'C', bg: 'bg-amber-100', text: 'text-amber-700' },
  D: { label: 'D', bg: 'bg-rose-100', text: 'text-rose-700' },
};

const CATEGORY_ICONS: Record<string, typeof Sofa> = {
  三人沙发: Sofa,
  双人沙发: Sofa,
  单人沙发: Armchair,
  茶几: Lamp,
  大衣柜: Package,
  双人床: Bed,
  床垫: Bed,
  老板桌: Package,
  办公椅: Armchair,
  书柜: Package,
  梳妆台: Package,
  穿衣镜: Package,
  斗柜: Package,
};

const ASSIGNEES = [
  { id: '1', name: '张伟', avatar: '#F26B3A' },
  { id: '2', name: '李娜', avatar: '#4CC9F0' },
  { id: '3', name: '王强', avatar: '#E63946' },
  { id: '4', name: '刘芳', avatar: '#2D6A4F' },
  { id: '5', name: '陈明', avatar: '#FFBA08' },
];

const REFURBISH_PLANS = [
  { value: 'STANDARD', label: '标准翻新', desc: '清洁 + 基础修补', price: 120 },
  { value: 'DEEP', label: '深度翻新', desc: '全面清洁 + 修补 + 上漆', price: 280 },
  { value: 'CLEAN_ONLY', label: '仅清洁', desc: '深度清洁消毒', price: 60 },
];

interface KanbanItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  qualityGrade: QualityGrade;
  location: string;
  estimatedComplete: string;
  assignee: typeof ASSIGNEES[number];
  column: KanbanColumn;
}

function createKanbanData(): KanbanItem[] {
  const columns: KanbanColumn[] = ['QC_PENDING', 'CLEANING', 'REPAIRING', 'PAINTING', 'RECHECK', 'FOR_SALE'];
  return mockWarehouse.slice(0, 18).map((item, idx) => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    category: item.category,
    qualityGrade: item.qualityGrade,
    location: item.location.positionCode,
    estimatedComplete: `6月${18 + (idx % 12)}日 ${9 + (idx % 8)}:${idx % 2 ? '30' : '00'}`,
    assignee: ASSIGNEES[idx % ASSIGNEES.length],
    column: columns[idx % columns.length],
  }));
}

interface InboundFormData {
  recycleOrderNo: string;
  category: string;
  name: string;
  quantity: number;
  volume: number;
  weight: number;
  defectRecord: string;
  missingParts: string[];
  refurbishPlan: string;
  estimatedCost: number;
}

const MISSING_PARTS_OPTIONS = ['螺丝', '脚垫', '拉手', '抽屉导轨', '门板', '靠枕', '坐垫', '层板'];

interface OutboundItem {
  id: string;
  name: string;
  quantity: number;
  location: string;
  checked: boolean;
}

interface OutboundOrder {
  id: string;
  orderNo: string;
  customerName: string;
  address: string;
  items: OutboundItem[];
  qcStatus: 'CHECKED' | 'PENDING';
  workerName: string;
  plateNo: string;
}

const mockOutboundOrders: OutboundOrder[] = [
  {
    id: 'OUT001',
    orderNo: 'XS20260618001',
    customerName: '郑先生',
    address: '上海市浦东新区张江高科技园区博云路2号',
    items: [
      { id: '1', name: '意大利进口整体衣柜', quantity: 1, location: 'B-05-01-01', checked: true },
      { id: '2', name: '真皮软包大床', quantity: 1, location: 'C-05-02-02', checked: true },
      { id: '3', name: '记忆棉独立弹簧床垫', quantity: 1, location: 'D-05-05-02', checked: false },
    ],
    qcStatus: 'PENDING',
    workerName: '王师傅',
    plateNo: '沪A·88888',
  },
  {
    id: 'OUT002',
    orderNo: 'XS20260618002',
    customerName: '许女士',
    address: '北京市朝阳区四惠大厦B座1205',
    items: [
      { id: '4', name: '人体工学办公椅', quantity: 4, location: 'E-01-02-02', checked: true },
    ],
    qcStatus: 'CHECKED',
    workerName: '李师傅',
    plateNo: '京B·66666',
  },
];

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] || Package;
}

export default function Warehouse() {
  const [activeTab, setActiveTab] = useState<WarehouseTab>('KANBAN');
  const kanbanData = useMemo(() => createKanbanData(), []);
  const [buildingRuleSearch, setBuildingRuleSearch] = useState('');
  const [inboundForm, setInboundForm] = useState<InboundFormData>({
    recycleOrderNo: '',
    category: '',
    name: '',
    quantity: 1,
    volume: 0,
    weight: 0,
    defectRecord: '',
    missingParts: [],
    refurbishPlan: 'STANDARD',
    estimatedCost: 120,
  });
  const [outboundSearch, setOutboundSearch] = useState('');
  const [outboundOrders, setOutboundOrders] = useState(mockOutboundOrders);

  const filteredBuildingRules = useMemo(() => {
    if (!buildingRuleSearch) return mockBuildingRules;
    const kw = buildingRuleSearch.toLowerCase();
    return mockBuildingRules.filter(
      (r) =>
        r.buildingName.toLowerCase().includes(kw) ||
        r.district.includes(kw) ||
        r.address.includes(kw)
    );
  }, [buildingRuleSearch]);

  const filteredOutboundOrders = useMemo(() => {
    if (!outboundSearch) return outboundOrders;
    const kw = outboundSearch.toLowerCase();
    return outboundOrders.filter(
      (o) =>
        o.orderNo.toLowerCase().includes(kw) ||
        o.customerName.includes(kw)
    );
  }, [outboundSearch, outboundOrders]);

  const toggleMissingPart = (part: string) => {
    setInboundForm((prev) => ({
      ...prev,
      missingParts: prev.missingParts.includes(part)
        ? prev.missingParts.filter((p) => p !== part)
        : [...prev.missingParts, part],
    }));
  };

  const toggleOutboundItem = (orderId: string, itemId: string) => {
    setOutboundOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              items: o.items.map((it) =>
                it.id === itemId ? { ...it, checked: !it.checked } : it
              ),
            }
          : o
      )
    );
  };

  const handleRefurbishPlanChange = (plan: string) => {
    const selected = REFURBISH_PLANS.find((p) => p.value === plan);
    setInboundForm((prev) => ({
      ...prev,
      refurbishPlan: plan,
      estimatedCost: selected?.price || 0,
    }));
  };

  return (
    <div className="space-y-5 p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="库存总数" value={mockWarehouse.length} icon={Package} colorScheme="blue" trend={{ value: 5.2 }} />
        <StatCard title="待翻新" value={mockWarehouse.filter((i) => i.status === 'INSPECTING' || i.status === 'RESTORING').length} icon={RefreshCw} colorScheme="purple" trend={{ value: 2.1 }} />
        <StatCard title="可售" value={mockWarehouse.filter((i) => i.status === 'IN_STOCK').length} icon={ShoppingBag} colorScheme="green" trend={{ value: 8.7 }} />
        <StatCard title="今日入库" value={12} icon={ArrowDownToLine} colorScheme="cyan" trend={{ value: 15.3 }} suffix="件" />
        <StatCard title="今日出库" value={8} icon={ArrowUpFromLine} colorScheme="amber" trend={{ value: -3.2 }} suffix="件" />
        <StatCard title="翻新中" value={mockWarehouse.filter((i) => i.status === 'RESTORING').length + 6} icon={Sparkles} colorScheme="orange" trend={{ value: 1.8 }} suffix="件" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex border-b border-neutral-100">
          {(
            [
              { key: 'KANBAN', label: '翻新看板', icon: Sparkles },
              { key: 'INBOUND', label: '入库登记', icon: ArrowDownToLine },
              { key: 'OUTBOUND', label: '出库交接', icon: ArrowUpFromLine },
              { key: 'RULES', label: '上楼规则库', icon: Building2 },
            ] as { key: WarehouseTab; label: string; icon: typeof Sparkles }[]
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={clsx(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all',
                activeTab === key
                  ? 'border-brand-orange text-brand-orange-dark bg-brand-orange/5'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'KANBAN' && (
            <KanbanBoard data={kanbanData} />
          )}
          {activeTab === 'INBOUND' && (
            <InboundSection
              formData={inboundForm}
              setFormData={setInboundForm}
              toggleMissingPart={toggleMissingPart}
              handleRefurbishPlanChange={handleRefurbishPlanChange}
            />
          )}
          {activeTab === 'OUTBOUND' && (
            <OutboundSection
              searchValue={outboundSearch}
              setSearchValue={setOutboundSearch}
              orders={filteredOutboundOrders}
              toggleItem={toggleOutboundItem}
            />
          )}
          {activeTab === 'RULES' && (
            <RulesSection
              searchValue={buildingRuleSearch}
              setSearchValue={setBuildingRuleSearch}
              rules={filteredBuildingRules}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanBoard({ data }: { data: KanbanItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {KANBAN_COLUMNS.map((col) => {
        const items = data.filter((d) => d.column === col.key);
        return (
          <div key={col.key} className={`kanban-col ${col.bg} border ${col.border}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${col.color}`}>{col.title}</span>
                <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', col.bg, col.color)}>
                  {items.length}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {items.map((item) => (
                <KanbanCard key={item.id} item={item} />
              ))}
              <button className="flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-neutral-300 rounded-lg text-xs font-medium text-neutral-500 hover:border-brand-orange hover:text-brand-orange hover:bg-white/60 transition-all">
                <Plus className="w-3.5 h-3.5" />
                添加任务
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ item }: { item: KanbanItem }) {
  const IconComp = getCategoryIcon(item.category);
  const gradeConfig = QUALITY_GRADE_CONFIG[item.qualityGrade];
  const colorClasses = [
    'from-rose-100 to-rose-50',
    'from-blue-100 to-blue-50',
    'from-amber-100 to-amber-50',
    'from-emerald-100 to-emerald-50',
    'from-violet-100 to-violet-50',
  ];
  const colorIdx = Math.abs(item.id.charCodeAt(item.id.length - 1)) % colorClasses.length;

  return (
    <div className="bg-white rounded-lg p-3 shadow-card border border-neutral-100 cursor-move hover:shadow-card-hover transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[colorIdx]} flex items-center justify-center shrink-0`}>
          <IconComp className="w-5 h-5 text-neutral-600" />
        </div>
        <div className="flex items-center gap-1">
          <GripVertical className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
        </div>
      </div>
      <div className="mb-2">
        <p className="font-medium text-sm text-neutral-800 truncate" title={item.name}>{item.name}</p>
        <p className="text-xs text-neutral-500 font-mono">{item.sku}</p>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={clsx('px-1.5 py-0.5 rounded text-xs font-bold', gradeConfig.bg, gradeConfig.text)}>
          {gradeConfig.label}
        </span>
        <span className="text-xs text-neutral-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {item.location}
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs text-neutral-500 mb-2.5">
        <Clock className="w-3 h-3" />
        <span>{item.estimatedComplete}</span>
      </div>
      <div className="flex items-center justify-between">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
          style={{ backgroundColor: item.assignee.avatar }}
          title={item.assignee.name}
        >
          {getInitials(item.assignee.name)}
        </div>
        <div className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-neutral-300" />
          <span className="w-1 h-1 rounded-full bg-neutral-300" />
          <span className="w-1 h-1 rounded-full bg-neutral-300" />
        </div>
      </div>
    </div>
  );
}

function InboundSection({
  formData,
  setFormData,
  toggleMissingPart,
  handleRefurbishPlanChange,
}: {
  formData: InboundFormData;
  setFormData: React.Dispatch<React.SetStateAction<InboundFormData>>;
  toggleMissingPart: (part: string) => void;
  handleRefurbishPlanChange: (plan: string) => void;
}) {
  const selectedPlan = REFURBISH_PLANS.find((p) => p.value === formData.refurbishPlan);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">关联回收单号</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="输入或选择回收单号..."
              value={formData.recycleOrderNo}
              onChange={(e) => setFormData((p) => ({ ...p, recycleOrderNo: e.target.value }))}
              className="input pl-9"
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1.5">支持输入联想，例如 HX20260618001</p>
        </div>

        <div className="card p-4 border border-neutral-100">
          <h4 className="font-semibold text-sm text-neutral-800 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-orange" />
            家具信息录入
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">品类</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                className="input"
              >
                <option value="">选择品类</option>
                <option>三人沙发</option>
                <option>双人沙发</option>
                <option>大衣柜</option>
                <option>双人床</option>
                <option>床垫</option>
                <option>茶几</option>
                <option>老板桌</option>
                <option>办公椅</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">数量(件)</label>
              <input
                type="number"
                min={1}
                value={formData.quantity}
                onChange={(e) => setFormData((p) => ({ ...p, quantity: Number(e.target.value) }))}
                className="input"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-1">名称</label>
              <input
                type="text"
                placeholder="家具具体名称"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">体积(m³)</label>
              <input
                type="number"
                step={0.1}
                value={formData.volume}
                onChange={(e) => setFormData((p) => ({ ...p, volume: Number(e.target.value) }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">重量(kg)</label>
              <input
                type="number"
                step={1}
                value={formData.weight}
                onChange={(e) => setFormData((p) => ({ ...p, weight: Number(e.target.value) }))}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card p-4 border border-neutral-100">
          <h4 className="font-semibold text-sm text-neutral-800 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-orange" />
            拆前瑕疵记录
          </h4>
          <textarea
            rows={3}
            placeholder="请详细描述外观瑕疵、破损情况..."
            value={formData.defectRecord}
            onChange={(e) => setFormData((p) => ({ ...p, defectRecord: e.target.value }))}
            className="input resize-none"
          />
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                className="aspect-square border-2 border-dashed border-neutral-200 rounded-lg flex flex-col items-center justify-center text-neutral-400 hover:border-brand-orange hover:text-brand-orange transition-all"
              >
                <Camera className="w-5 h-5 mb-1" />
                <span className="text-xs">上传照片</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4 border border-neutral-100">
          <h4 className="font-semibold text-sm text-neutral-800 mb-3">缺件登记</h4>
          <div className="flex flex-wrap gap-2">
            {MISSING_PARTS_OPTIONS.map((opt) => (
              <label key={opt} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all hover:bg-neutral-50"
                style={{
                  borderColor: formData.missingParts.includes(opt) ? '#F26B3A' : '#E9ECEF',
                  backgroundColor: formData.missingParts.includes(opt) ? 'rgba(242,107,58,0.08)' : undefined,
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.missingParts.includes(opt)}
                  onChange={() => toggleMissingPart(opt)}
                  className="w-3.5 h-3.5 accent-brand-orange"
                />
                <span className="text-xs text-neutral-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="card p-4 border border-neutral-100">
          <h4 className="font-semibold text-sm text-neutral-800 mb-3">翻新方案选择</h4>
          <div className="grid grid-cols-3 gap-3">
            {REFURBISH_PLANS.map((plan) => (
              <button
                key={plan.value}
                onClick={() => handleRefurbishPlanChange(plan.value)}
                className={clsx(
                  'p-3 rounded-lg border-2 text-left transition-all',
                  formData.refurbishPlan === plan.value
                    ? 'border-brand-orange bg-brand-orange/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                )}
              >
                <p className="font-medium text-sm text-neutral-800 mb-0.5">{plan.label}</p>
                <p className="text-xs text-neutral-500 mb-2">{plan.desc}</p>
                <p className="text-sm font-bold text-brand-orange">¥{plan.price}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-neutral-50 flex items-center justify-between">
            <span className="text-sm text-neutral-600">预估入库成本</span>
            <span className="text-lg font-bold text-neutral-900">¥{formData.estimatedCost}</span>
          </div>
        </div>

        <button className="w-full btn-primary py-3 text-base">
          <Upload className="w-4 h-4" />
          提交入库
        </button>
      </div>

      <div className="lg:col-span-2">
        <div className="card border-2 border-dashed border-brand-orange/30 sticky top-5">
          <div className="p-4 border-b border-neutral-100 bg-brand-orange/5">
            <h4 className="font-semibold text-sm text-neutral-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-orange" />
              入库单预览
            </h4>
          </div>
          <div className="p-4 space-y-3">
            <PreviewRow label="回收单号" value={formData.recycleOrderNo || '—'} highlight />
            <div className="h-px bg-neutral-100" />
            <PreviewRow label="品类" value={formData.category || '—'} />
            <PreviewRow label="名称" value={formData.name || '—'} />
            <PreviewRow label="数量" value={formData.quantity ? `${formData.quantity} 件` : '—'} />
            <PreviewRow label="体积" value={formData.volume ? `${formData.volume} m³` : '—'} />
            <PreviewRow label="重量" value={formData.weight ? `${formData.weight} kg` : '—'} />
            <div className="h-px bg-neutral-100" />
            <PreviewRow label="瑕疵记录" value={formData.defectRecord || '无'} />
            <PreviewRow label="缺件" value={formData.missingParts.length ? formData.missingParts.join('、') : '无'} />
            <div className="h-px bg-neutral-100" />
            <PreviewRow label="翻新方案" value={selectedPlan?.label || '—'} />
            <PreviewRow label="翻新费用" value={`¥${selectedPlan?.price || 0}`} />
            <div className="pt-2 mt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700">预估总成本</span>
                <span className="text-xl font-bold text-brand-orange">¥{formData.estimatedCost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-neutral-500 shrink-0 w-20">{label}</span>
      <span className={clsx('text-xs text-right flex-1 truncate', highlight ? 'font-semibold text-brand-orange-dark font-mono' : 'text-neutral-700')} title={value}>
        {value}
      </span>
    </div>
  );
}

function OutboundSection({
  searchValue,
  setSearchValue,
  orders,
  toggleItem,
}: {
  searchValue: string;
  setSearchValue: (v: string) => void;
  orders: OutboundOrder[];
  toggleItem: (orderId: string, itemId: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索售出单号、客户名..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button className="btn-secondary">
          <QrCode className="w-4 h-4" />
          扫码
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const allChecked = order.items.every((i) => i.checked);
          const checkedCount = order.items.filter((i) => i.checked).length;
          return (
            <div key={order.id} className="card border border-neutral-100 overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-neutral-800 font-mono text-sm">{order.orderNo}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      <span className="font-medium">{order.customerName}</span>
                      <span className="mx-1.5">·</span>
                      {order.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    'chip',
                    allChecked ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {allChecked ? '✓ 已核对' : `核对中 ${checkedCount}/${order.items.length}`}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-medium text-neutral-500 mb-2">家具明细</p>
                <div className="border border-neutral-200 rounded-lg overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-xs text-neutral-500">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium w-10"></th>
                        <th className="text-left px-3 py-2 font-medium">名称</th>
                        <th className="text-left px-3 py-2 font-medium w-20">数量</th>
                        <th className="text-left px-3 py-2 font-medium w-32">货位</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-t border-neutral-100 hover:bg-neutral-50/50">
                          <td className="px-3 py-2.5">
                            <button onClick={() => toggleItem(order.id, item.id)}>
                              {item.checked ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-neutral-300" />
                              )}
                            </button>
                          </td>
                          <td className="px-3 py-2.5 text-neutral-800">{item.name}</td>
                          <td className="px-3 py-2.5 text-neutral-600">{item.quantity}</td>
                          <td className="px-3 py-2.5 font-mono text-neutral-600">{item.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-neutral-50">
                    <p className="text-xs text-neutral-500 mb-1">提货师傅</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange-dark text-xs font-bold">
                        {getInitials(order.workerName)}
                      </div>
                      <span className="font-medium text-sm text-neutral-800">{order.workerName}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50">
                    <p className="text-xs text-neutral-500 mb-1">车牌号码</p>
                    <p className="font-mono font-semibold text-neutral-800">{order.plateNo}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50">
                    <p className="text-xs text-neutral-500 mb-1">签字确认</p>
                    <div className="h-16 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-400 text-xs cursor-pointer hover:border-brand-orange hover:text-brand-orange transition-all">
                      点击签字区域
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-neutral-100">
                  <button className="btn-secondary">
                    <Printer className="w-4 h-4" />
                    打印出库单
                  </button>
                  <button className={clsx('btn-primary', !allChecked && 'opacity-50 cursor-not-allowed')} disabled={!allChecked}>
                    <Handshake className="w-4 h-4" />
                    完成交接
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RulesSection({
  searchValue,
  setSearchValue,
  rules,
}: {
  searchValue: string;
  setSearchValue: (v: string) => void;
  rules: BuildingRule[];
}) {
  const FEE_RULE_LABELS: Record<string, string> = {
    BY_FLOOR: '按楼层计费',
    BY_WEIGHT: '按重量计费',
    BY_VOLUME: '按体积计费',
    FREE: '免费',
    FLAT_RATE: '固定费用',
  };
  const BUILDING_TYPE_LABELS: Record<string, string> = {
    RESIDENTIAL: '住宅',
    OFFICE: '写字楼',
    APARTMENT: '公寓',
    VILLA: '别墅',
    COMMERCIAL: '商住',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索小区名称、区域、地址..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          新增规则
        </button>
      </div>

      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">小区名称</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">区域</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">电梯尺寸(W×D×H)</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">无电梯最高楼层</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">禁运时段</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">计费规则</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">准入要求</th>
                <th className="text-center px-4 py-3 font-medium whitespace-nowrap w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-t border-neutral-100 hover:bg-neutral-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-brand-orange/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4.5 h-4.5 text-brand-orange" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">{rule.buildingName}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          <span className="chip bg-neutral-100 text-neutral-600 !px-1.5 !py-0">
                            {BUILDING_TYPE_LABELS[rule.buildingType] || rule.buildingType}
                          </span>
                          <span className="ml-2">{rule.propertyName}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-neutral-700">
                    {rule.city} {rule.district}
                  </td>
                  <td className="px-4 py-3.5">
                    {rule.hasElevator && rule.elevatorSize ? (
                      <span className="font-mono text-xs text-neutral-700 bg-cyan-50 text-cyan-700 px-2 py-1 rounded">
                        {rule.elevatorSize.width}×{rule.elevatorSize.depth}×{rule.elevatorSize.height}m
                      </span>
                    ) : (
                      <span className="chip bg-rose-50 text-rose-600">无电梯</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-neutral-700">
                    {rule.hasElevator ? (
                      <span className="text-neutral-400">—</span>
                    ) : (
                      <span className="font-semibold text-amber-600">{rule.floorCount}层</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {rule.timeRestrictions?.length ? (
                      <div className="space-y-1">
                        {rule.timeRestrictions.slice(0, 2).map((tr, i) => (
                          <p key={i} className="text-xs text-neutral-600">
                            <Clock className="w-3 h-3 inline mr-1 -mt-0.5 text-amber-500" />
                            {tr.startHour}:00-{tr.endHour}:00
                            {tr.note && <span className="text-neutral-400 ml-1">({tr.note})</span>}
                          </p>
                        ))}
                        {rule.timeRestrictions.length > 2 && (
                          <p className="text-xs text-brand-orange">+{rule.timeRestrictions.length - 2}条更多</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        无限制
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="chip bg-blue-50 text-blue-700">
                      {FEE_RULE_LABELS[rule.feeRule] || rule.feeRule}
                    </span>
                    <div className="text-xs text-neutral-500 mt-1">
                      {rule.feeRule === 'FLAT_RATE' && `¥${rule.flatFeeAmount}`}
                      {rule.feeRule === 'BY_WEIGHT' && `¥${rule.weightFeePerKg}/kg`}
                      {rule.feeRule === 'BY_VOLUME' && `¥${rule.volumeFeePerCbm}/m³`}
                      {rule.feeRule === 'FREE' && '免费上楼'}
                      {rule.feeRule === 'BY_FLOOR' && `¥${rule.floorFees[0]?.feePerFloor || '--'}/层起`}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {rule.accessRule.requireIdCard && (
                        <span className="chip bg-amber-50 text-amber-700">身份证</span>
                      )}
                      {rule.accessRule.requireReservation && (
                        <span className="chip bg-purple-50 text-purple-700">需预约</span>
                      )}
                      {rule.accessRule.requirePermit && (
                        <span className="chip bg-rose-50 text-rose-700">
                          通行证{rule.accessRule.permitFee ? `¥${rule.accessRule.permitFee}` : ''}
                        </span>
                      )}
                      {!rule.accessRule.requireIdCard && !rule.accessRule.requireReservation && !rule.accessRule.requirePermit && (
                        <span className="text-xs text-green-600">无特殊要求</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-brand-orange hover:bg-brand-orange/10 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 bg-neutral-50/50">
          <p className="text-xs text-neutral-500">
            共 <span className="font-semibold text-neutral-700">{rules.length}</span> 条规则
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-md text-xs font-medium text-neutral-600 hover:bg-neutral-200/50 transition-colors">上一页</button>
            <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-orange text-white">1</button>
            <button className="px-3 py-1.5 rounded-md text-xs font-medium text-neutral-600 hover:bg-neutral-200/50 transition-colors">2</button>
            <button className="px-3 py-1.5 rounded-md text-xs font-medium text-neutral-600 hover:bg-neutral-200/50 transition-colors">
              下一页 <ChevronRight className="w-3 h-3 inline -mt-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
