import { ipcMain } from "electron";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import type { Role } from "../../../shared/types";
import { createUser, listUsers, resetPassword, setUserActive, updateUser } from "../services/employees";
import { logAudit } from "../services/audit";
import { requireAdmin } from "../state";

export function registerEmployeesIpc(db: Database.Database): void {
  ipcMain.handle(CH.employeesList, () => {
    requireAdmin();
    return listUsers(db);
  });

  ipcMain.handle(
    CH.employeesCreate,
    (_e, params: { username: string; password: string; fullName: string; role: Role }) => {
      const admin = requireAdmin();
      const user = createUser(db, params);
      logAudit(db, { userId: admin.id, action: "employee_created", entityType: "user", entityId: user.id, details: { role: params.role } });
      return user;
    }
  );

  ipcMain.handle(CH.employeesSetActive, (_e, userId: number, active: boolean) => {
    const admin = requireAdmin();
    const user = setUserActive(db, userId, active);
    logAudit(db, { userId: admin.id, action: active ? "employee_enabled" : "employee_disabled", entityType: "user", entityId: userId });
    return user;
  });

  ipcMain.handle(CH.employeesResetPassword, (_e, userId: number, newPassword: string) => {
    const admin = requireAdmin();
    resetPassword(db, userId, newPassword);
    logAudit(db, { userId: admin.id, action: "employee_password_reset", entityType: "user", entityId: userId });
  });

  ipcMain.handle(CH.employeesUpdate, (_e, userId: number, params: { fullName?: string; username?: string }) => {
    const admin = requireAdmin();
    const user = updateUser(db, userId, params);
    logAudit(db, { userId: admin.id, action: "employee_updated", entityType: "user", entityId: userId, details: params });
    return user;
  });
}
