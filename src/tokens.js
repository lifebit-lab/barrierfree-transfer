/* デザイントークン ───────────────────────────── */
export const T = {
  bg: "#F5F7F9", card: "#FFFFFF", ink: "#16243B", soft: "#5A6B82",
  line: "#E4E9EF", confirmed: "#0E8C7F", estimated: "#3E6FB0",
  check: "#C77A14", unknown: "#8A94A3", alert: "#C0392B",
  font: '"Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP",system-ui,sans-serif',
  mono: '"SF Mono","Roboto Mono",ui-monospace,monospace',
};

/* 確信度モデル（すべての出力に付与する） */
export const CONF = {
  confirmed:   { c: T.confirmed, dot: "🟢", label: "確認済" },
  estimated:   { c: T.estimated, dot: "🔵", label: "推定" },
  needs_check: { c: T.check,     dot: "🟡", label: "要確認" },
  unknown:     { c: T.unknown,   dot: "⚪", label: "情報なし" },
};
