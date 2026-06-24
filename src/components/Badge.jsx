import { CONF } from "../tokens";

export default function Badge({ conf }) {
  const k = CONF[conf];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, fontWeight: 700, color: k.c,
      background: k.c + "14", border: `1px solid ${k.c}33`,
      borderRadius: 999, padding: "3px 9px", lineHeight: 1, whiteSpace: "nowrap",
    }}>
      <span aria-hidden="true" style={{ fontSize: 10 }}>{k.dot}</span>
      <span className="sr-only">確信度：</span>{k.label}
    </span>
  );
}
