export const CH = {
  authLogin: "auth:login",
  authLogout: "auth:logout",
  authCurrentUser: "auth:currentUser",

  sessionsEndMine: "sessions:endMine",
  sessionsList: "sessions:list",
  sessionsEndById: "sessions:endById",

  catalogCategories: "catalog:categories",
  catalogProducts: "catalog:products",
  catalogDeals: "catalog:deals",

  ordersHold: "orders:hold",
  ordersCheckout: "orders:checkout",
  ordersCancel: "orders:cancel",
  ordersGet: "orders:get",
  ordersListHeld: "orders:listHeld",
  ordersList: "orders:list",

  myOrdersList: "myorders:list",

  myStatsDashboard: "mystats:dashboard",
  myStatsPaymentBreakdown: "mystats:paymentBreakdown",
  myStatsTopItems: "mystats:topItems",
  myStatsSessionSummary: "mystats:sessionSummary",

  reportsSummary: "reports:summary",
  reportsByBusinessDate: "reports:byBusinessDate",
  reportsByEmployee: "reports:byEmployee",
  reportsProducts: "reports:products",
  reportsCategories: "reports:categories",
  reportsPizzaSizes: "reports:pizzaSizes",
  reportsDeals: "reports:deals",
  reportsPaymentMethods: "reports:paymentMethods",
  reportsCancellations: "reports:cancellations",

  settingsGet: "settings:get",
  settingsUpdate: "settings:update",

  employeesList: "employees:list",
  employeesCreate: "employees:create",
  employeesSetActive: "employees:setActive",
  employeesResetPassword: "employees:resetPassword",
  employeesUpdate: "employees:update",

  menuCreateCategory: "menu:createCategory",
  menuRenameCategory: "menu:renameCategory",
  menuSetCategoryActive: "menu:setCategoryActive",
  menuCreateProduct: "menu:createProduct",
  menuUpdateProduct: "menu:updateProduct",
  menuSetProductActive: "menu:setProductActive",
  menuUpsertVariant: "menu:upsertVariant",
  menuSetVariantActive: "menu:setVariantActive",
  menuSetProductImage: "menu:setProductImage",
  menuCreateDeal: "menu:createDeal",
  menuUpdateDealPrice: "menu:updateDealPrice",
  menuSetDealActive: "menu:setDealActive",
  menuReplaceDealSlots: "menu:replaceDealSlots",
  menuSetDealImage: "menu:setDealImage",

  printerList: "printer:list",
  printerPrint: "printer:print",
  printReady: "print:ready",

  auditList: "audit:list",

  backupExport: "backup:export",
  backupImport: "backup:import"
} as const;
