import { useState } from "react";
import { Check, X, ChevronDown, CircleAlert } from "lucide-react";
import { T, CONF } from "../tokens";
import Badge from "./Badge";
import CarStrip from "./CarStrip";

const rbtn = (c) => ({
  display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer",
  fontSize: 12, fontWeight: 700, color: c, background: "transparent",
  border: `1px solid ${c}55`, borderRadius: 999, padding: "4px 10px",
});

/* 利用者の確認報告（層Aの confidence/verifiedAt を育てる入口） */
function ReportRow({ target }) {
  const [v, setV] = useState(null);
  const send = (verdict) => {
    setV(verdict); // 楽観的に謝意表示（オフライン/失敗でも体験は止めない）
    fetch("/api/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ transfer: target, verdict }),
    }).catch(() => {});
  };
  if (v) return (
    <div style={{ fontSize: 12, color: T.confirmed, fontWeight: 600, marginTop: 10 }}>
      ありがとうございます。確信度の更新に使われます。
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
      <span style={{ fontSize: 12, color: T.soft }}>この案内は合っていましたか？</span>
      <button onClick={() => send("ok")} style={rbtn(T.confirmed)}>
        <Check size={13} strokeWidth={3} aria-hidden="true" />合ってた
      </button>
      <button onClick={() => send("ng")} style={rbtn(T.soft)}>
        <X size={13} strokeWidth={3} aria-hidden="true" />違った
      </button>
    </div>
  );
}

export default function RideCard({ leg, live, profileNote, routeKey }) {
  const [open, setOpen] = useState(false);
  const k = CONF[leg.confidence];
  const evDown = live?.evDownAt === leg.arriveAt;
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.line}`, borderRadius: 16,
      padding: 16, boxShadow: "0 1px 2px rgba(20,36,59,.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
        <span style={{
          width: 10, height: 10, borderRadius: 3, background: leg.color, flexShrink: 0,
        }} />
        <span style={{ fontWeight: 800, fontSize: 15, color: T.ink }}>{leg.line}</span>
        <span style={{ marginLeft: "auto" }}><Badge conf={leg.confidence} /></span>
      </div>
      <div style={{ fontSize: 12.5, color: T.soft, marginLeft: 20 }}>
        {leg.arriveAt} で下車
      </div>

      <CarStrip {...leg} conf={leg.confidence} />

      {/* 到着駅のEV情報 */}
      <div style={{
        display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12,
        fontSize: 13.5, color: T.ink, lineHeight: 1.5,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 800, color: k.c, background: k.c + "14",
          borderRadius: 6, padding: "2px 6px", marginTop: 1, flexShrink: 0,
        }}>EV</span>
        <span>{leg.evPlace}。降車後の歩行 約{leg.toGate}m。</span>
      </div>

      {/* 層C：EV運休のフォールバック */}
      {evDown && (
        <div role="alert" style={{
          marginTop: 12, background: T.alert + "0E", border: `1px solid ${T.alert}40`,
          borderRadius: 10, padding: "10px 12px",
        }}>
          <div style={{ display: "flex", gap: 7, alignItems: "center", color: T.alert, fontWeight: 800, fontSize: 13 }}>
            <CircleAlert size={15} aria-hidden="true" />本日このEVが運休中
          </div>
          <ol style={{ margin: "7px 0 0", paddingLeft: 18, fontSize: 12.5, color: T.ink, lineHeight: 1.65 }}>
            <li>1つ隣のEVへ迂回（+3分）</li>
            <li>EVが使えなければ、車椅子対応エスカレーターの可否を駅係員に確認</li>
            <li>改札で「{leg.arriveAt}でEV介助」と申し出（スロープ対応）</li>
          </ol>
        </div>
      )}

      {/* プロフィール別の注記 */}
      {profileNote && (
        <div style={{
          marginTop: 12, fontSize: 12.5, color: T.ink, background: "#F1F5F4",
          border: `1px solid ${T.line}`, borderRadius: 10, padding: "9px 11px", lineHeight: 1.55,
        }}>
          {profileNote}
        </div>
      )}

      {/* 鮮度＋詳細開示 */}
      <button onClick={() => setOpen(!open)} aria-expanded={open}
        aria-label={`出典と降車後の導線を${open ? "閉じる" : "開く"}（${leg.verifiedAt}確認・出典${leg.source.length}件）`} style={{
        marginTop: 12, display: "flex", alignItems: "center", gap: 6, width: "100%",
        background: "transparent", border: "none", cursor: "pointer",
        fontSize: 11.5, color: T.soft, padding: "4px 0", minHeight: 36,
      }}>
        <span aria-hidden="true">{leg.verifiedAt} 確認 ・ 出典 {leg.source.length}件</span>
        <ChevronDown size={14} aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>
      {open && (
        <div style={{ marginTop: 9, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 12, color: T.soft, fontWeight: 700, marginBottom: 5 }}>降車後の導線</div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: T.ink, lineHeight: 1.7 }}>
            {leg.route.map((r, i) => <li key={i}>{r}</li>)}
          </ol>
          <div style={{ fontSize: 11.5, color: T.soft, marginTop: 9 }}>
            出典：{leg.source.join(" / ")}
          </div>
          <ReportRow target={`${routeKey}:${leg.line}@${leg.arriveAt}`} />
        </div>
      )}
    </div>
  );
}
