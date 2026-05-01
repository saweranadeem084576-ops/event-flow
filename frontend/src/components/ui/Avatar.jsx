export default function Avatar({ name = "", size = "", color = "" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const cls = ["avatar", size && `avatar--${size}`, color && `avatar--${color}`]
    .filter(Boolean)
    .join(" ");
  return <span className={cls}>{initials}</span>;
}
