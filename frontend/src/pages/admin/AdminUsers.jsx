import { useEffect, useState } from "react";
import { getAllUsers, updateUser, deleteUser } from "../../api/auth";
import { statusBadge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import Avatar from "../../components/ui/Avatar";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delTarget, setDelTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(res.data.data.users || res.data.data.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      const res = await updateUser(id, { role });
      const updated = res.data.data.user || res.data.data.data;
      setUsers((us) =>
        us.map((u) =>
          u._id === id ? { ...u, role: updated?.role || role } : u,
        ),
      );
    } catch {}
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(delTarget._id);
      setUsers((us) => us.filter((u) => u._id !== delTarget._id));
    } catch {}
    setDeleting(false);
    setDelTarget(null);
  };

  if (loading)
    return (
      <div className="loading-page">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Users</h1>
        <p>{users.length} registered users on the platform.</p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                          {u.name}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ink-4)" }}>
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      className="form-input"
                      style={{
                        padding: "4px 8px",
                        fontSize: 12,
                        width: "auto",
                      }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    >
                      <option value="attendee">attendee</option>
                      <option value="organizer">organizer</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="muted">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => setDelTarget(u)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {delTarget && (
        <Modal onClose={() => setDelTarget(null)}>
          <div slot="head">Delete User</div>
          <div slot="body">
            <p>
              Are you sure you want to delete <strong>{delTarget.name}</strong>?
              This cannot be undone.
            </p>
          </div>
          <div
            slot="foot"
            style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
          >
            <button
              className="btn btn--ghost"
              onClick={() => setDelTarget(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn--danger"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? <Spinner size="sm" /> : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
