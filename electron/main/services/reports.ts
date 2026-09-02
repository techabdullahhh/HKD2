import type Database from "better-sqlite3";
import type { ReportRange, SalesSummary } from "../../../shared/types";

function range(filter: Partial<ReportRange>): { from: string; to: string } {
  return { from: filter.from ?? "0000-01-01", to: filter.to ?? "9999-12-31" };
}

export function salesSummary(db: Database.Database, filter: Partial<ReportRange>): SalesSummary {
  const { from, to } = range(filter);
  const row = db
    .prepare(
      `SELECT COUNT(*) AS invoiceCount,
              COALESCE(SUM(subtotal), 0) AS subtotal,
              COALESCE(SUM(service_charge), 0) AS serviceCharge,
              COALESCE(SUM(grand_total), 0) AS grandTotal
       FROM orders
       WHERE status = 'completed' AND business_date BETWEEN ? AND ?`
    )
    .get(from, to) as SalesSummary;
  return row;
}

export function salesByBusinessDate(db: Database.Database, filter: Partial<ReportRange>) {
  const { from, to } = range(filter);
  return db
    .prepare(
      `SELECT business_date AS businessDate,
              COUNT(*) AS invoiceCount,
              COALESCE(SUM(subtotal), 0) AS subtotal,
              COALESCE(SUM(service_charge), 0) AS serviceCharge,
              COALESCE(SUM(grand_total), 0) AS grandTotal
       FROM orders
       WHERE status = 'completed' AND business_date BETWEEN ? AND ?
       GROUP BY business_date
       ORDER BY business_date DESC`
    )
    .all(from, to);
}

export function salesByEmployee(db: Database.Database, filter: Partial<ReportRange>) {
  const { from, to } = range(filter);
  return db
    .prepare(
      `SELECT u.id AS userId, u.full_name AS employeeName,
              COUNT(*) AS invoiceCount,
              COALESCE(SUM(o.grand_total), 0) AS grandTotal
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.status = 'completed' AND o.business_date BETWEEN ? AND ?
       GROUP BY u.id
       ORDER BY grandTotal DESC`
    )
    .all(from, to);
}

export function productSales(db: Database.Database, filter: Partial<ReportRange>) {
  const { from, to } = range(filter);
  return db
    .prepare(
      `SELECT oi.name_snapshot AS productName, oi.variant_snapshot AS variantName,
              SUM(oi.quantity) AS quantitySold,
              SUM(oi.line_total) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status = 'completed' AND oi.item_type = 'product' AND o.business_date BETWEEN ? AND ?
       GROUP BY oi.name_snapshot, oi.variant_snapshot
       ORDER BY revenue DESC`
    )
    .all(from, to);
}

export function categorySales(db: Database.Database, filter: Partial<ReportRange>) {
  const { from, to } = range(filter);
  return db
    .prepare(
      `SELECT c.name AS categoryName,
              SUM(oi.quantity) AS quantitySold,
              SUM(oi.line_total) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       JOIN categories c ON c.id = p.category_id
       WHERE o.status = 'completed' AND oi.item_type = 'product' AND o.business_date BETWEEN ? AND ?
       GROUP BY c.id
       ORDER BY revenue DESC`
    )
    .all(from, to);
}

export function pizzaSizeSales(db: Database.Database, filter: Partial<ReportRange>) {
  const { from, to } = range(filter);
  return db
    .prepare(
      `SELECT oi.variant_snapshot AS size,
              SUM(oi.quantity) AS quantitySold,
              SUM(oi.line_total) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       WHERE o.status = 'completed' AND oi.item_type = 'product' AND p.is_pizza = 1 AND o.business_date BETWEEN ? AND ?
       GROUP BY oi.variant_snapshot
       ORDER BY revenue DESC`
    )
    .all(from, to);
}

export function dealSales(db: Database.Database, filter: Partial<ReportRange>) {
  const { from, to } = range(filter);
  return db
    .prepare(
      `SELECT oi.name_snapshot AS dealName,
              SUM(oi.quantity) AS quantitySold,
              SUM(oi.line_total) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status = 'completed' AND oi.item_type = 'deal' AND o.business_date BETWEEN ? AND ?
       GROUP BY oi.name_snapshot
       ORDER BY revenue DESC`
    )
    .all(from, to);
}

export function paymentMethodTotals(db: Database.Database, filter: Partial<ReportRange>) {
  const { from, to } = range(filter);
  return db
    .prepare(
      `SELECT payment_method AS paymentMethod,
              COUNT(*) AS invoiceCount,
              COALESCE(SUM(grand_total), 0) AS grandTotal
       FROM orders
       WHERE status = 'completed' AND business_date BETWEEN ? AND ?
       GROUP BY payment_method`
    )
    .all(from, to);
}

export function cancellationsReport(db: Database.Database, filter: Partial<ReportRange>) {
  const { from, to } = range(filter);
  return db
    .prepare(
      `SELECT o.id, o.order_number AS orderNumber, o.business_date AS businessDate,
              u.full_name AS employeeName, o.subtotal, o.grand_total AS grandTotal,
              o.cancelled_reason AS reason, o.created_at AS createdAt
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.status = 'cancelled' AND o.business_date BETWEEN ? AND ?
       ORDER BY o.id DESC`
    )
    .all(from, to);
}
