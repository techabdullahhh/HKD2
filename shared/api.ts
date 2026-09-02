import type {
  AuditLogEntry,
  Category,
  Deal,
  EmployeeDashboardStats,
  EmployeeSession,
  EmployeeSessionSummary,
  LoginResult,
  Order,
  OrderItemInput,
  PaymentBreakdownEntry,
  PaymentMethod,
  Product,
  ReportRange,
  Role,
  SafeUser,
  SalesSummary,
  Settings,
  StatsScope,
  TopItemEntry
} from "./types";

export interface DealSlotInputDTO {
  id?: number;
  label: string;
  kind: "fixed" | "choice";
  quantity: number;
  fixedProductId?: number | null;
  fixedVariantId?: number | null;
  choiceCategoryIds?: number[] | null;
  choiceVariantName?: string | null;
}

export interface VariantInputDTO {
  id?: number;
  variantName: string;
  price: number;
  active: boolean;
}

export interface PrinterInfoDTO {
  name: string;
  displayName: string;
  isDefault: boolean;
}

export interface HkdApi {
  auth: {
    login(username: string, password: string): Promise<LoginResult>;
    logout(): Promise<void>;
    currentUser(): Promise<SafeUser | null>;
  };
  sessions: {
    endMine(): Promise<void>;
    list(filter?: { userId?: number; activeOnly?: boolean }): Promise<(EmployeeSession & { userName: string })[]>;
    endById(sessionId: number): Promise<void>;
  };
  catalog: {
    categories(includeInactive?: boolean): Promise<Category[]>;
    products(includeInactive?: boolean): Promise<Product[]>;
    deals(includeInactive?: boolean): Promise<Deal[]>;
  };
  orders: {
    hold(items: OrderItemInput[]): Promise<Order>;
    checkout(params: {
      orderId?: number;
      items?: OrderItemInput[];
      paymentMethod: PaymentMethod;
      amountTendered?: number;
    }): Promise<Order>;
    cancel(orderId: number, reason: string): Promise<Order>;
    get(orderId: number): Promise<Order | null>;
    listHeld(): Promise<Order[]>;
    list(filter?: {
      businessDateFrom?: string;
      businessDateTo?: string;
      employeeSessionId?: number;
      userId?: number;
      status?: string;
      paymentMethod?: string;
    }): Promise<Order[]>;
  };
  // Self-scoped only: the main process ignores any identity the renderer might
  // pass and always resolves to the currently logged-in user/session. An
  // employee can never use these to read another employee's data.
  myOrders: {
    list(filter?: { search?: string; from?: string; to?: string }): Promise<Order[]>;
  };
  myStats: {
    dashboard(): Promise<EmployeeDashboardStats>;
    paymentBreakdown(scope: StatsScope): Promise<PaymentBreakdownEntry[]>;
    topItems(scope: StatsScope, limit?: number): Promise<TopItemEntry[]>;
    sessionSummary(): Promise<EmployeeSessionSummary>;
  };
  reports: {
    summary(range: Partial<ReportRange>): Promise<SalesSummary>;
    byBusinessDate(range: Partial<ReportRange>): Promise<unknown>;
    byEmployee(range: Partial<ReportRange>): Promise<unknown>;
    products(range: Partial<ReportRange>): Promise<unknown>;
    categories(range: Partial<ReportRange>): Promise<unknown>;
    pizzaSizes(range: Partial<ReportRange>): Promise<unknown>;
    deals(range: Partial<ReportRange>): Promise<unknown>;
    paymentMethods(range: Partial<ReportRange>): Promise<unknown>;
    cancellations(range: Partial<ReportRange>): Promise<unknown>;
  };
  settings: {
    get(): Promise<Settings>;
    update(partial: Partial<Settings>): Promise<Settings>;
  };
  employees: {
    list(): Promise<SafeUser[]>;
    create(params: { username: string; password: string; fullName: string; role: Role }): Promise<SafeUser>;
    setActive(userId: number, active: boolean): Promise<SafeUser>;
    resetPassword(userId: number, newPassword: string): Promise<void>;
    update(userId: number, params: { fullName?: string; username?: string }): Promise<SafeUser>;
  };
  menu: {
    createCategory(name: string, sortOrder: number): Promise<number>;
    renameCategory(id: number, name: string): Promise<void>;
    setCategoryActive(id: number, active: boolean): Promise<void>;
    createProduct(params: {
      categoryId: number;
      name: string;
      isPizza: boolean;
      sortOrder: number;
      variants: VariantInputDTO[];
    }): Promise<number>;
    updateProduct(productId: number, params: { name?: string; categoryId?: number; isPizza?: boolean }): Promise<void>;
    setProductActive(productId: number, active: boolean): Promise<void>;
    upsertVariant(productId: number, variant: VariantInputDTO): Promise<number>;
    setVariantActive(variantId: number, active: boolean): Promise<void>;
    setProductImage(productId: number, dataUrl: string | null, fileExt?: string): Promise<string | null>;
    createDeal(params: { name: string; price: number; sortOrder: number; slots: DealSlotInputDTO[] }): Promise<number>;
    updateDealPrice(dealId: number, price: number): Promise<void>;
    setDealActive(dealId: number, active: boolean): Promise<void>;
    replaceDealSlots(dealId: number, slots: DealSlotInputDTO[]): Promise<void>;
    setDealImage(dealId: number, dataUrl: string | null, fileExt?: string): Promise<string | null>;
  };
  printer: {
    list(): Promise<PrinterInfoDTO[]>;
    print(orderId: number, silent: boolean): Promise<void>;
  };
  audit: {
    list(filter?: { from?: string; to?: string; limit?: number }): Promise<AuditLogEntry[]>;
  };
  backup: {
    export(): Promise<{ path: string } | null>;
    import(): Promise<{ path: string } | null>;
  };
}
