export function Badge({ variant = "gray", children }) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

export function statusBadge(status) {
  const map = {
    pending: { label: "Pending", variant: "warn" },
    confirmed: { label: "Confirmed", variant: "accent" },
    cancelled: { label: "Cancelled", variant: "danger" },
    approved: { label: "Approved", variant: "accent" },
    active: { label: "Active", variant: "accent" },
    general: { label: "General", variant: "gray" },
    vip: { label: "VIP", variant: "gold" },
    premium: { label: "Premium", variant: "info" },
  };
  const v = map[status] || { label: status, variant: "gray" };
  return <Badge variant={v.variant}>{v.label}</Badge>;
}

export function categoryBadge(category) {
  const map = {
    conference: "info",
    seminar: "info",
    workshop: "warn",
    concert: "gold",
    exhibition: "gold",
    meetup: "accent",
    wedding: "danger",
    other: "gray",
  };
  return <Badge variant={map[category] || "gray"}>{category}</Badge>;
}
