import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateMe, updatePassword } from "../../api/auth";
import Spinner from "../../components/ui/Spinner";

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [info, setInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [pwd, setPwd] = useState({
    passwordCurrent: "",
    password: "",
    passwordConfirm: "",
  });
  const [infoMsg, setInfoMsg] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [infoErr, setInfoErr] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);

  const photoSrc =
    photoPreview ||
    (user?.photo && user.photo !== "default.jpg"
      ? `${BACKEND}/img/users/${user.photo}`
      : null);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??";

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleInfo = async (e) => {
    e.preventDefault();
    setInfoMsg("");
    setInfoErr("");
    setSavingInfo(true);
    try {
      let payload;
      if (photoFile) {
        payload = new FormData();
        payload.append("name", info.name);
        payload.append("email", info.email);
        payload.append("photo", photoFile);
      } else {
        payload = info;
      }
      const res = await updateMe(payload);
      const updated = res.data.data.user || res.data.data.data;
      setUser(updated);
      setPhotoFile(null);
      setInfoMsg("Profile updated.");
    } catch (err) {
      setInfoErr(err.response?.data?.message || "Update failed");
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePwd = async (e) => {
    e.preventDefault();
    setPwdMsg("");
    setPwdErr("");
    setSavingPwd(true);
    try {
      await updatePassword(pwd);
      setPwdMsg("Password changed.");
      setPwd({ passwordCurrent: "", password: "", passwordConfirm: "" });
    } catch (err) {
      setPwdErr(err.response?.data?.message || "Password change failed");
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account information.</p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 32,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 300 }}>
          <div className="profile-section">
            {/* Avatar with upload */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div style={{ position: "relative", display: "inline-block" }}>
                {photoSrc ? (
                  <img
                    src={photoSrc}
                    alt={user?.name}
                    className="avatar avatar--xl avatar--emerald"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <span className="avatar avatar--xl avatar--emerald">
                    {initials}
                  </span>
                )}
                <button
                  type="button"
                  className="photo-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change photo"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
              </div>
              <div>
                <h3 style={{ marginBottom: 2 }}>{user?.name}</h3>
                <p style={{ color: "var(--ink-4)", fontSize: 13 }}>
                  {user?.email}
                </p>
                <span className="badge badge--accent" style={{ marginTop: 6 }}>
                  {user?.role}
                </span>
              </div>
            </div>

            <h3>Personal info</h3>
            {infoMsg && <div className="alert alert--success">{infoMsg}</div>}
            {infoErr && <div className="alert alert--danger">{infoErr}</div>}
            <form onSubmit={handleInfo}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input
                  className="form-input"
                  type="text"
                  value={info.name}
                  onChange={(e) =>
                    setInfo((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={info.email}
                  onChange={(e) =>
                    setInfo((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>
              <button className="btn btn--primary" disabled={savingInfo}>
                {savingInfo ? <Spinner size="sm" /> : "Save changes"}
              </button>
            </form>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <div className="profile-section">
            <h3>Change password</h3>
            {pwdMsg && <div className="alert alert--success">{pwdMsg}</div>}
            {pwdErr && <div className="alert alert--danger">{pwdErr}</div>}
            <form onSubmit={handlePwd}>
              <div className="form-group">
                <label className="form-label">Current password</label>
                <input
                  className="form-input"
                  type="password"
                  value={pwd.passwordCurrent}
                  onChange={(e) =>
                    setPwd((f) => ({ ...f, passwordCurrent: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New password</label>
                <input
                  className="form-input"
                  type="password"
                  value={pwd.password}
                  onChange={(e) =>
                    setPwd((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm new password</label>
                <input
                  className="form-input"
                  type="password"
                  value={pwd.passwordConfirm}
                  onChange={(e) =>
                    setPwd((f) => ({ ...f, passwordConfirm: e.target.value }))
                  }
                  required
                />
              </div>
              <button className="btn btn--primary" disabled={savingPwd}>
                {savingPwd ? <Spinner size="sm" /> : "Update password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
