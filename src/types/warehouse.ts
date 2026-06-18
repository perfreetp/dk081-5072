export type WarehouseStatus = 'INBOUND' | 'CLEANING' | 'REPAIRING' | 'PAINTING' | 'QC_CHECK' | 'FOR_SALE' | 'SOLD' | 'RETURNED' | 'SCRAPPED';

export interface RefurbishStep {
  id: string;
  warehouseItemId: string;
  stepName: string;
  stepOrder: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  assigneeId?: string;
  assigneeName?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface WarehouseItem {
  id: string;
  whItemNo: string;
  sourceOrderId: string;
  sourceOrderItemId: string;
  sourceOrderNo: string;
  category: string;
  name: string;
  quantity: number;
  volume: number;
  location: string;
  status: WarehouseStatus;
  condition: 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  estimatedPrice: number;
  inboundTime: string;
  inboundWorker: string;
  defectRecord: string;
  missingParts: string;
  inboundPhotos: string[];
  qcPhotos?: string[];
  refurbishSteps: RefurbishStep[];
  refurbishPlan: string;
  refurbishedPrice?: number;
  listedAt?: string;
  soldAt?: string;
  soldPrice?: number;
  buyerId?: string;
}

export interface WarehouseCheckRecord {
  id: string;
  type: 'INBOUND' | 'OUTBOUND';
  orderId: string;
  orderNo: string;
  items: {
    warehouseItemId: string;
    name: string;
    quantity: number;
    checked: boolean;
  }[];
  handlerId: string;
  handlerName: string;
  workerId?: string;
  workerName?: string;
  signatureImg?: string;
  notes?: string;
  createdAt: string;
}
