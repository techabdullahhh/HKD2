import { contextBridge, ipcRenderer } from "electron";
import { CH } from "../../shared/channels";
import type { HkdApi } from "../../shared/api";

const api: HkdApi = {
  auth: {
    login: (username, password) => ipcRenderer.invoke(CH.authLogin, username, password),
    logout: () => ipcRenderer.invoke(CH.authLogout),
    currentUser: () => ipcRenderer.invoke(CH.authCurrentUser)
  },
  sessions: {
    endMine: () => ipcRenderer.invoke(CH.sessionsEndMine),
    list: (filter) => ipcRenderer.invoke(CH.sessionsList, filter),
    endById: (sessionId) => ipcRenderer.invoke(CH.sessionsEndById, sessionId)
  },
  catalog: {
    categories: (includeInactive) => ipcRenderer.invoke(CH.catalogCategories, includeInactive),
    products: (includeInactive) => ipcRenderer.invoke(CH.catalogProducts, includeInactive),
    deals: (includeInactive) => ipcRenderer.invoke(CH.catalogDeals, includeInactive)
  },
  orders: {
    hold: (items) => ipcRenderer.invoke(CH.ordersHold, items),
    checkout: (params) => ipcRenderer.invoke(CH.ordersCheckout, params),
    cancel: (orderId, reason) => ipcRenderer.invoke(CH.ordersCancel, orderId, reason),
    get: (orderId) => ipcRenderer.invoke(CH.ordersGet, orderId),
    listHeld: () => ipcRenderer.invoke(CH.ordersListHeld),
    list: (filter) => ipcRenderer.invoke(CH.ordersList, filter)
  },
  myOrders: {
    list: (filter) => ipcRenderer.invoke(CH.myOrdersList, filter)
  },
  myStats: {
    dashboard: () => ipcRenderer.invoke(CH.myStatsDashboard),
    paymentBreakdown: (scope) => ipcRenderer.invoke(CH.myStatsPaymentBreakdown, scope),
    topItems: (scope, limit) => ipcRenderer.invoke(CH.myStatsTopItems, scope, limit),
    sessionSummary: () => ipcRenderer.invoke(CH.myStatsSessionSummary)
  },
  reports: {
    summary: (range) => ipcRenderer.invoke(CH.reportsSummary, range),
    byBusinessDate: (range) => ipcRenderer.invoke(CH.reportsByBusinessDate, range),
    byEmployee: (range) => ipcRenderer.invoke(CH.reportsByEmployee, range),
    products: (range) => ipcRenderer.invoke(CH.reportsProducts, range),
    categories: (range) => ipcRenderer.invoke(CH.reportsCategories, range),
    pizzaSizes: (range) => ipcRenderer.invoke(CH.reportsPizzaSizes, range),
    deals: (range) => ipcRenderer.invoke(CH.reportsDeals, range),
    paymentMethods: (range) => ipcRenderer.invoke(CH.reportsPaymentMethods, range),
    cancellations: (range) => ipcRenderer.invoke(CH.reportsCancellations, range)
  },
  settings: {
    get: () => ipcRenderer.invoke(CH.settingsGet),
    update: (partial) => ipcRenderer.invoke(CH.settingsUpdate, partial)
  },
  employees: {
    list: () => ipcRenderer.invoke(CH.employeesList),
    create: (params) => ipcRenderer.invoke(CH.employeesCreate, params),
    setActive: (userId, active) => ipcRenderer.invoke(CH.employeesSetActive, userId, active),
    resetPassword: (userId, newPassword) => ipcRenderer.invoke(CH.employeesResetPassword, userId, newPassword),
    update: (userId, params) => ipcRenderer.invoke(CH.employeesUpdate, userId, params)
  },
  menu: {
    createCategory: (name, sortOrder) => ipcRenderer.invoke(CH.menuCreateCategory, name, sortOrder),
    renameCategory: (id, name) => ipcRenderer.invoke(CH.menuRenameCategory, id, name),
    setCategoryActive: (id, active) => ipcRenderer.invoke(CH.menuSetCategoryActive, id, active),
    createProduct: (params) => ipcRenderer.invoke(CH.menuCreateProduct, params),
    updateProduct: (productId, params) => ipcRenderer.invoke(CH.menuUpdateProduct, productId, params),
    setProductActive: (productId, active) => ipcRenderer.invoke(CH.menuSetProductActive, productId, active),
    upsertVariant: (productId, variant) => ipcRenderer.invoke(CH.menuUpsertVariant, productId, variant),
    setVariantActive: (variantId, active) => ipcRenderer.invoke(CH.menuSetVariantActive, variantId, active),
    setProductImage: (productId, dataUrl, fileExt) => ipcRenderer.invoke(CH.menuSetProductImage, productId, dataUrl, fileExt),
    createDeal: (params) => ipcRenderer.invoke(CH.menuCreateDeal, params),
    updateDealPrice: (dealId, price) => ipcRenderer.invoke(CH.menuUpdateDealPrice, dealId, price),
    setDealActive: (dealId, active) => ipcRenderer.invoke(CH.menuSetDealActive, dealId, active),
    replaceDealSlots: (dealId, slots) => ipcRenderer.invoke(CH.menuReplaceDealSlots, dealId, slots),
    setDealImage: (dealId, dataUrl, fileExt) => ipcRenderer.invoke(CH.menuSetDealImage, dealId, dataUrl, fileExt)
  },
  printer: {
    list: () => ipcRenderer.invoke(CH.printerList),
    print: (orderId, silent) => ipcRenderer.invoke(CH.printerPrint, orderId, silent)
  },
  audit: {
    list: (filter) => ipcRenderer.invoke(CH.auditList, filter)
  },
  backup: {
    export: () => ipcRenderer.invoke(CH.backupExport),
    import: () => ipcRenderer.invoke(CH.backupImport)
  }
};

contextBridge.exposeInMainWorld("hkd", api);

contextBridge.exposeInMainWorld("hkdPrint", {
  ready: () => ipcRenderer.send(CH.printReady)
});
