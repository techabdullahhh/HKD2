export type Role = "admin" | "employee";

export interface SafeUser {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  active: boolean;
}

export interface LoginResult {
  user: SafeUser;
  session: EmployeeSession | null;
}

export interface EmployeeSession {
  id: number;
  userId: number;
  startedAt: string;
  endedAt: string | null;
  invoiceCount: number;
  totalSales: number;
}

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
  active: boolean;
}

export interface ProductVariant {
  id: number;
  productId: number;
  variantName: string;
  price: number;
  active: boolean;
  sortOrder: number;
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  isPizza: boolean;
  imagePath: string | null;
  active: boolean;
  sortOrder: number;
  variants: ProductVariant[];
}

export type DealSlotKind = "fixed" | "choice";

export interface DealSlot {
  id: number;
  dealId: number;
  slotOrder: number;
  label: string;
  kind: DealSlotKind;
  quantity: number;
  // fixed slot
  fixedProductId: number | null;
  fixedVariantId: number | null;
  // choice slot
  choiceCategoryIds: number[] | null;
  choiceVariantName: string | null;
}

export interface Deal {
  id: number;
  name: string;
  price: number;
  imagePath: string | null;
  active: boolean;
  sortOrder: number;
  slots: DealSlot[];
}

export interface DealSlotChoice {
  slotId: number;
  productId: number;
  variantId: number;
}

export type PaymentMethod = "cash" | "card" | "other";

export type OrderStatus = "open" | "held" | "completed" | "cancelled";

export interface OrderItemInput {
  itemType: "product" | "deal";
  productId?: number;
  variantId?: number;
  dealId?: number;
  quantity: number;
  notes?: string;
  dealChoices?: DealSlotChoice[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  itemType: "product" | "deal";
  productId: number | null;
  variantId: number | null;
  dealId: number | null;
  nameSnapshot: string;
  variantSnapshot: string | null;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
  notes: string | null;
  dealChoicesSnapshot: DealChoiceSnapshotEntry[] | null;
}

export interface DealChoiceSnapshotEntry {
  label: string;
  productName: string;
  variantName: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  employeeSessionId: number;
  userId: number;
  employeeName: string;
  businessDate: string;
  subtotal: number;
  serviceCharge: number;
  grandTotal: number;
  paymentMethod: PaymentMethod | null;
  amountTendered: number | null;
  status: OrderStatus;
  createdAt: string;
  completedAt: string | null;
  cancelledReason: string | null;
  items: OrderItem[];
}

export interface Settings {
  serviceChargeDefault: number;
  businessDayStartHour: number;
  printerName: string | null;
  printerPaperWidthMm: 58 | 80;
  restaurantNameEn: string;
  restaurantNameUr: string;
  restaurantPhone: string;
}

export interface AuditLogEntry {
  id: number;
  userId: number | null;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: number | null;
  details: string | null;
  createdAt: string;
}

export interface ReportRange {
  from: string;
  to: string;
}

export interface SalesSummary {
  invoiceCount: number;
  subtotal: number;
  serviceCharge: number;
  grandTotal: number;
}

export interface EmployeeDashboardStats {
  businessDate: string;
  businessDay: { invoiceCount: number; sales: number };
  session: { id: number; startedAt: string; invoiceCount: number; sales: number };
}

export interface PaymentBreakdownEntry {
  paymentMethod: PaymentMethod | null;
  invoiceCount: number;
  total: number;
}

export interface TopItemEntry {
  name: string;
  variant: string | null;
  quantity: number;
}

export interface EmployeeSessionSummary {
  sessionId: number;
  startedAt: string;
  endedAt: string | null;
  invoiceCount: number;
  sales: number;
  cancelledCount: number;
  paymentBreakdown: PaymentBreakdownEntry[];
}

export type StatsScope = "session" | "businessDay";
