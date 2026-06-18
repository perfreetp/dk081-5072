import type { OutboundOrder } from '@/store/useWarehouseStore';

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
    updatedAt: new Date().toISOString(),
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
    updatedAt: new Date().toISOString(),
  },
];

export default mockOutboundOrders;
