import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import {
  Package,
  CheckSquare,
  Truck,
  AlertCircle,
  MessageSquare,
  Wallet,
  ChevronRight,
  Building2,
  Shield,
  Clock,
  MapPin,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import { formatMoney } from '@/utils/formatters';
import mockBuildingRules from '@/data/mockBuildingRules';
import type { BuildingRule } from '@/data/mockBuildingRules';

const BRAND_ORANGE = '#F26B3A';
const BRAND_GREEN = '#1B4332';
const BRAND_ORANGE_LIGHT = '#FF8A5C';
const BRAND_GREEN_LIGHT = '#2D6A4F';

function formatDateDisplay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekDay = weekDays[date.getDay()];
  return `${year}年${month}月${day}日 ${weekDay}`;
}

const trendOption: EChartsOption = {
  animationDuration: 600,
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#E9ECEF',
    borderWidth: 1,
    textStyle: { color: '#343A40', fontSize: 12 },
    axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
  },
  legend: {
    data: ['回收单', '售出单'],
    top: 0,
    right: 0,
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    textStyle: { color: '#495057', fontSize: 12 },
  },
  grid: { left: '3%', right: '4%', bottom: '3%', top: 40, containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['6/12', '6/13', '6/14', '6/15', '6/16', '6/17', '6/18'],
    axisLine: { lineStyle: { color: '#DEE2E6' } },
    axisLabel: { color: '#868E96', fontSize: 11 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisLabel: { color: '#868E96', fontSize: 11 },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#F1F3F5', type: 'dashed' } },
  },
  series: [
    {
      name: '回收单',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: [58, 62, 49, 71, 65, 78, 82],
      lineStyle: { color: BRAND_ORANGE, width: 3 },
      itemStyle: { color: BRAND_ORANGE, borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: `${BRAND_ORANGE}25` },
            { offset: 1, color: `${BRAND_ORANGE}00` },
          ],
        },
      },
    },
    {
      name: '售出单',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: [42, 48, 55, 58, 62, 69, 75],
      lineStyle: { color: BRAND_GREEN, width: 3 },
      itemStyle: { color: BRAND_GREEN, borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: `${BRAND_GREEN}25` },
            { offset: 1, color: `${BRAND_GREEN}00` },
          ],
        },
      },
    },
  ],
};

const pieOption: EChartsOption = {
  animationDuration: 600,
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#E9ECEF',
    borderWidth: 1,
    textStyle: { color: '#343A40', fontSize: 12 },
    formatter: '{b}: {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    right: 5,
    top: 'center',
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    textStyle: { color: '#495057', fontSize: 12 },
  },
  color: [
    BRAND_ORANGE,
    BRAND_GREEN,
    '#4CC9F0',
    '#FFBA08',
    '#E63946',
    '#9B59B6',
    '#3498DB',
  ],
  series: [
    {
      name: '订单品类',
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 600, color: '#343A40' },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.15)' },
      },
      labelLine: { show: false },
      data: [
        { value: 285, name: '沙发类' },
        { value: 242, name: '床品类' },
        { value: 198, name: '柜类' },
        { value: 156, name: '桌椅类' },
        { value: 124, name: '储物类' },
        { value: 89, name: '办公类' },
        { value: 56, name: '其他' },
      ],
    },
  ],
};

const workerPerfOption: EChartsOption = {
  animationDuration: 600,
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#E9ECEF',
    borderWidth: 1,
    textStyle: { color: '#343A40', fontSize: 12 },
    axisPointer: { type: 'shadow' },
  },
  legend: {
    data: ['完工率', '准时率'],
    top: 0,
    right: 0,
    icon: 'roundRect',
    itemWidth: 12,
    itemHeight: 6,
    textStyle: { color: '#495057', fontSize: 12 },
  },
  grid: { left: '3%', right: '4%', bottom: '3%', top: 40, containLabel: true },
  xAxis: {
    type: 'category',
    data: ['张师傅', '李师傅', '王师傅', '赵师傅', '刘师傅'],
    axisLine: { lineStyle: { color: '#DEE2E6' } },
    axisLabel: { color: '#868E96', fontSize: 11 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    max: 100,
    axisLine: { show: false },
    axisLabel: { color: '#868E96', fontSize: 11, formatter: '{value}%' },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#F1F3F5', type: 'dashed' } },
  },
  series: [
    {
      name: '完工率',
      type: 'bar',
      barWidth: 20,
      data: [96, 94, 92, 89, 87],
      itemStyle: {
        color: BRAND_ORANGE,
        borderRadius: [4, 4, 0, 0],
      },
      barGap: '20%',
    },
    {
      name: '准时率',
      type: 'bar',
      barWidth: 20,
      data: [98, 95, 93, 91, 88],
      itemStyle: {
        color: BRAND_GREEN,
        borderRadius: [4, 4, 0, 0],
      },
    },
  ],
};

const districtHeatOption: EChartsOption = {
  animationDuration: 600,
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#E9ECEF',
    borderWidth: 1,
    textStyle: { color: '#343A40', fontSize: 12 },
    axisPointer: { type: 'shadow' },
    formatter: (params: unknown) => {
      const p = params as { name: string; value: number }[];
      return `${p[0].name}<br/>订单量: <b>${p[0].value}</b> 单`;
    },
  },
  grid: { left: '3%', right: '8%', bottom: '3%', top: 10, containLabel: true },
  xAxis: {
    type: 'value',
    axisLine: { show: false },
    axisLabel: { color: '#868E96', fontSize: 11 },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#F1F3F5', type: 'dashed' } },
  },
  yAxis: {
    type: 'category',
    data: ['石景山区', '通州区', '丰台区', '东城区', '西城区', '宝山区', '杨浦区', '闵行区', '徐汇区', '浦东新区'].reverse(),
    axisLine: { lineStyle: { color: '#DEE2E6' } },
    axisLabel: { color: '#495057', fontSize: 11 },
    axisTick: { show: false },
  },
  series: [
    {
      type: 'bar',
      barWidth: 14,
      data: [42, 55, 63, 72, 81, 89, 94, 108, 125, 168].reverse(),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: BRAND_ORANGE_LIGHT },
            { offset: 1, color: BRAND_ORANGE },
          ],
        },
        borderRadius: [0, 7, 7, 0],
      },
      label: {
        show: true,
        position: 'right',
        color: '#495057',
        fontSize: 11,
        fontWeight: 500,
        formatter: '{c}单',
      },
    },
  ],
};

interface VehicleLoad {
  id: string;
  routeNo: string;
  vehicle: string;
  loadRate: number;
  itemCount: number;
  maxItems: number;
  district: string;
}

const vehicleLoads: VehicleLoad[] = [
  { id: '1', routeNo: 'RT-20260618-01', vehicle: '4.2米厢货（沪A88888）', loadRate: 92, itemCount: 23, maxItems: 25, district: '浦东新区' },
  { id: '2', routeNo: 'RT-20260618-02', vehicle: '4.2米厢货（沪A66666）', loadRate: 85, itemCount: 17, maxItems: 20, district: '徐汇区' },
  { id: '3', routeNo: 'RT-20260618-03', vehicle: '6.8米厢货（沪A99999）', loadRate: 78, itemCount: 31, maxItems: 40, district: '闵行区' },
  { id: '4', routeNo: 'RT-20260618-04', vehicle: '面包车（沪B12345）', loadRate: 65, itemCount: 13, maxItems: 20, district: '静安区' },
  { id: '5', routeNo: 'RT-20260618-05', vehicle: '4.2米厢货（沪B54321）', loadRate: 55, itemCount: 11, maxItems: 20, district: '杨浦区' },
];

const topBuildingRules: BuildingRule[] = mockBuildingRules.slice(0, 5);

const BUILDING_TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL: '住宅',
  OFFICE: '写字楼',
  APARTMENT: '公寓',
  VILLA: '别墅',
  COMMERCIAL: '商业',
};

const FEE_RULE_LABELS: Record<string, string> = {
  BY_FLOOR: '按楼层',
  BY_WEIGHT: '按重量',
  BY_VOLUME: '按体积',
  FREE: '免费',
  FLAT_RATE: '一口价',
};

export default function Dashboard() {
  const today = new Date();

  const getLoadRateColor = (rate: number): string => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 70) return 'bg-brand-orange';
    if (rate >= 50) return 'bg-amber-500';
    return 'bg-neutral-400';
  };

  return (
    <div className="space-y-5">
      <div className="card p-6 bg-gradient-to-r from-brand-orange/5 via-white to-brand-green/5 border border-brand-orange/10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              欢迎回来，管理员 👋
            </h1>
            <p className="text-sm text-neutral-500">
              今天是 <span className="font-medium text-neutral-700">{formatDateDisplay(today)}</span>，祝您工作顺利！
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-neutral-500 mb-1">今日派单进度</p>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-orange to-brand-green rounded-full" style={{ width: '68%' }} />
                </div>
                <span className="text-sm font-bold text-neutral-800 tabular-nums">68%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="今日订单"
          value={157}
          trend={{ value: 12.5, label: '较昨日' }}
          icon={Package}
          colorScheme="orange"
          suffix="单"
        />
        <StatCard
          title="今日完工"
          value={118}
          trend={{ value: 8.3, label: '较昨日' }}
          icon={CheckSquare}
          colorScheme="green"
          suffix="单"
        />
        <StatCard
          title="在途数"
          value={39}
          trend={{ value: -2.1, label: '较昨日' }}
          icon={Truck}
          colorScheme="blue"
          suffix="单"
        />
        <StatCard
          title="超时预警"
          value={7}
          trend={{ value: -15.4, label: '较昨日' }}
          icon={AlertCircle}
          colorScheme="rose"
          suffix="单"
        />
        <StatCard
          title="今日投诉"
          value={2}
          trend={{ value: -33.3, label: '较昨日' }}
          icon={MessageSquare}
          colorScheme="purple"
          suffix="单"
        />
        <StatCard
          title="今日营收"
          value="128.6K"
          trend={{ value: 18.7, label: '较昨日' }}
          icon={Wallet}
          colorScheme="amber"
          suffix="元"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">近7日订单量趋势</h3>
              <p className="text-xs text-neutral-500 mt-0.5">回收单 vs 售出单双维度对比</p>
            </div>
          </div>
          <ReactECharts
            option={trendOption}
            style={{ height: 280 }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">订单品类分布</h3>
              <p className="text-xs text-neutral-500 mt-0.5">按家具品类统计占比</p>
            </div>
          </div>
          <ReactECharts
            option={pieOption}
            style={{ height: 280 }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">师傅绩效 Top5</h3>
              <p className="text-xs text-neutral-500 mt-0.5">完工率与准时率双指标排名</p>
            </div>
          </div>
          <ReactECharts
            option={workerPerfOption}
            style={{ height: 280 }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">区域订单热力排行</h3>
              <p className="text-xs text-neutral-500 mt-0.5">各区域订单数量 Top10</p>
            </div>
          </div>
          <ReactECharts
            option={districtHeatOption}
            style={{ height: 280 }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">今日车次装载率</h3>
              <p className="text-xs text-neutral-500 mt-0.5">实时监控各车次装载情况</p>
            </div>
            <button className="btn-ghost text-xs">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {vehicleLoads.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-orange/10 text-brand-orange-dark text-xs font-medium">
                      {v.routeNo}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                      <MapPin className="w-3 h-3" />
                      {v.district}
                    </span>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${
                    v.loadRate >= 90 ? 'text-green-600' :
                    v.loadRate >= 70 ? 'text-brand-orange-dark' :
                    v.loadRate >= 50 ? 'text-amber-600' : 'text-neutral-500'
                  }`}>
                    {v.loadRate}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 progress-bar">
                    <div
                      className={`h-full rounded-full transition-all ${getLoadRateColor(v.loadRate)}`}
                      style={{ width: `${v.loadRate}%` }}
                    />
                  </div>
                  <div className="text-xs text-neutral-600 tabular-nums shrink-0">
                    <span className="font-medium text-neutral-800">{v.itemCount}</span>
                    <span className="mx-0.5">/</span>
                    <span>{v.maxItems}件</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2 truncate">
                  <Truck className="w-3 h-3 inline mr-1 -mt-0.5" />
                  {v.vehicle}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">上楼规则库</h3>
              <p className="text-xs text-neutral-500 mt-0.5">典型小区/写字楼搬运规则</p>
            </div>
            <button className="btn-ghost text-xs">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {topBuildingRules.map((rule) => {
              const hasTimeRestriction = rule.timeRestrictions && rule.timeRestrictions.length > 0;
              const hasProtectionRule = rule.protectionRule.requireFloorProtection || rule.protectionRule.requireElevatorProtection;

              return (
                <div
                  key={rule.id}
                  className="p-4 rounded-xl border border-neutral-100 hover:border-brand-orange/20 hover:bg-brand-orange/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-brand-green-light" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">{rule.buildingName}</p>
                        <p className="text-xs text-neutral-500 mt-0.5 truncate">{rule.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="chip bg-neutral-100 text-neutral-600">
                        {BUILDING_TYPE_LABELS[rule.buildingType]}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 ml-10">
                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      <Shield className="w-3 h-3 text-brand-orange-dark" />
                      计费: {FEE_RULE_LABELS[rule.feeRule]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      {rule.hasElevator ? '🛗 有电梯' : '🪜 无电梯'}
                    </span>
                    {hasTimeRestriction && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3" />
                        时段限制
                      </span>
                    )}
                    {hasProtectionRule && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        需成品保护
                      </span>
                    )}
                    {rule.accessRule.requireReservation && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        需预约
                      </span>
                    )}
                  </div>
                  {rule.notes && (
                    <p className="text-[11px] text-neutral-500 ml-10 mt-2 pt-2 border-t border-neutral-100 line-clamp-1">
                      💡 {rule.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hidden">
        {formatMoney(0)}
      </div>
    </div>
  );
}
