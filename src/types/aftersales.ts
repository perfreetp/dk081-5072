export type AfterSalesType = 'RESCHEDULE' | 'ADD_ITEM' | 'COMPLAINT' | 'RETURN';
export type ComplaintLevel = 'MINOR' | 'MAJOR' | 'CRITICAL';
export type ComplaintCategory = 'DAMAGE' | 'MISSING' | 'ATTITUDE' | 'TIMEOUT' | 'INSTALLATION' | 'OTHER';
export type Responsibility = 'WORKER' | 'WAREHOUSE' | 'CUSTOMER' | 'FORCE_MAJEURE' | 'UNDETERMINED';
export type AfterSalesStatus = 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'CLOSED';

export interface AfterSalesOrder {
  id: string;
  asNo: string;
  type: AfterSalesType;
  sourceOrderId: string;
  sourceOrderNo: string;
  customerName: string;
  customerPhone: string;
  status: AfterSalesStatus;
  createdAt: string;
  deadline: string;
  handlerId?: string;
  handlerName?: string;
  description: string;
  photos?: string[];
  history: {
    id: string;
    action: string;
    operatorName: string;
    operatorRole: string;
    remark?: string;
    timestamp: string;
  }[];

  complaintLevel?: ComplaintLevel;
  complaintCategory?: ComplaintCategory;
  responsibility?: Responsibility;
  involvedWorkerId?: string;
  involvedWorkerName?: string;
  compensationAmount?: number;
  appeasementPlan?: string;

  originalAppointment?: string;
  newAppointment?: string;
  rescheduleReason?: string;
  rescheduleFee?: number;

  addedItems?: {
    category: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  addItemTotalFee?: number;

  returnReason?: string;
  returnOrderId?: string;
  returnInspectionResult?: string;
  returnRefundAmount?: number;
  secondLifeStatus?: 'REFURBISH' | 'SCRAP' | 'RELIST';
}
