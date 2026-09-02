import { useEffect, useState } from "react";
import type { Role, SafeUser } from "@shared/types";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";

export function EmployeesPage() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<SafeUser | null>(null);
  const [form, setForm] = useState({ username: "", password: "", fullName: "", role: "employee" as Role });
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setUsers(await window.hkd.employees.list());
  }

  useEffect(() => {
    load();
  }, []);

  async function createEmployee() {
    setError(null);
    try {
      await window.hkd.employees.create(form);
      setCreateOpen(false);
      setForm({ username: "", password: "", fullName: "", role: "employee" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee");
    }
  }

  async function toggleActive(user: SafeUser) {
    await window.hkd.employees.setActive(user.id, !user.active);
    load();
  }

  async function doResetPassword() {
    if (!resetTarget) return;
    await window.hkd.employees.resetPassword(resetTarget.id, newPassword);
    setResetTarget(null);
    setNewPassword("");
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h1 className="font-display text-xl tracking-wide text-hkd-cream">Employees</h1>
        <Button onClick={() => setCreateOpen(true)}>+ Add Employee</Button>
      </div>

      <DataTable
        columns={[
          { header: "Name", render: (u: SafeUser) => u.fullName },
          { header: "Username", render: (u: SafeUser) => u.username },
          { header: "Role", render: (u: SafeUser) => <Badge tone={u.role === "admin" ? "pink" : "gray"}>{u.role}</Badge> },
          { header: "Status", render: (u: SafeUser) => <Badge tone={u.active ? "green" : "red"}>{u.active ? "Active" : "Disabled"}</Badge> },
          {
            header: "Actions",
            render: (u: SafeUser) => (
              <div className="flex gap-2">
                <Button size="md" variant="secondary" onClick={() => setResetTarget(u)}>
                  Reset Password
                </Button>
                <Button size="md" variant={u.active ? "danger" : "success"} onClick={() => toggleActive(u)}>
                  {u.active ? "Disable" : "Enable"}
                </Button>
              </div>
            )
          }
        ]}
        rows={users}
        keyFor={(u) => u.id}
      />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Employee">
        <div className="flex flex-col gap-3">
          <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="rounded-xl border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream" />
          <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="rounded-xl border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream" />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-xl border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="rounded-xl border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream">
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
          {error && <div className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-400">{error}</div>}
          <Button onClick={createEmployee}>Create</Button>
        </div>
      </Modal>

      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title={`Reset Password — ${resetTarget?.fullName ?? ""}`}>
        <div className="flex flex-col gap-3">
          <input placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream" />
          <Button onClick={doResetPassword} disabled={newPassword.length < 4}>
            Save New Password
          </Button>
        </div>
      </Modal>
    </div>
  );
}
