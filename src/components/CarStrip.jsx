import { T, CONF } from "../tokens";

/* 号車を断定できない場合の注記（確信度ごとにトーンを変える） */
const CAR_NOTE = {
  estimated: <>号車は<b>推定</b>です。<b>EVに最も近い車両</b>に乗るのが安全です（位置は上記）。</>,
  needs_check: <>この号車情報は<b>古い可能性</b>があります。当日ホームのEV案内も確認のうえ、<b>EV最寄り車両</b>へ。</>,
  unknown: <>号車情報がありません。<b>EVに最も近い車両</b>に乗り、ホームのEV案内に従ってください。</>,
};

/* 看板要素：号車位置ストリップ（EV最寄りを強調） */
export default function CarStrip({ cars, recommendedCar, doorNo, evIndex, conf, side, dir }) {
  const k = CONF[conf];
  const showCar = conf === "confirmed";
  const arr = Array.from({ length: cars }, (_, i) => i + 1);
  return (
    <div style={{ margin: "14px 0 4px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 11, color: T.soft, marginBottom: 7, fontWeight: 600,
      }}>
        <span>{side}</span><span>{dir} ⸺</span>
      </div>

      {/* エレベーター位置マーカー */}
      <div style={{ position: "relative", height: 18 }}>
        <div style={{
          position: "absolute", left: `calc(${(evIndex / cars) * 100}% )`,
          transform: "translateX(-50%)", top: 0,
          fontSize: 10, color: T.soft, fontWeight: 700, whiteSpace: "nowrap",
        }}>
          ⬾ EV
        </div>
      </div>

      {/* 号車 */}
      <div style={{ display: "flex", gap: 4 }}>
        {arr.map((n) => {
          const hit = showCar && n === recommendedCar;
          return (
            <div key={n} className={hit ? "stand-here" : ""} style={{
              flex: 1, height: 38, borderRadius: 6,
              border: hit ? `2px solid ${k.c}` : `1px solid ${T.line}`,
              background: hit ? k.c + "12" : "#FBFCFD",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", position: "relative",
            }}>
              <span style={{
                fontFamily: T.mono, fontSize: 13, fontWeight: hit ? 800 : 500,
                color: hit ? k.c : T.soft,
              }}>{n}</span>
              {hit && (
                <span style={{
                  position: "absolute", top: -22, fontSize: 10, fontWeight: 800,
                  color: k.c, background: T.card, padding: "1px 6px",
                  borderRadius: 999, border: `1px solid ${k.c}55`, whiteSpace: "nowrap",
                }}>
                  ここ{doorNo ? ` ${doorNo}番ドア` : ""}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!showCar && (
        <div style={{
          marginTop: 9, fontSize: 12.5, color: k.c, fontWeight: 600,
          background: k.c + "10", border: `1px solid ${k.c}33`,
          borderRadius: 8, padding: "8px 10px", lineHeight: 1.5,
        }}>
          {CAR_NOTE[conf] || CAR_NOTE.unknown}
        </div>
      )}
    </div>
  );
}
