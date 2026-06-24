import React, { useState, useEffect } from "react";
import { ArrowDownUp, MoveRight, Accessibility, Baby, Footprints, Check, CircleHelp, ExternalLink, WifiOff } from "lucide-react";
import { T } from "./tokens";
import { STATIONS, findJourney, PROFILES } from "./data/journeys";
import RideCard from "./components/RideCard";

const PROFILE_ICONS = { wheel: Accessibility, baby: Baby, slow: Footprints };

const selStyle = {
  width: "100%", fontSize: 16, fontWeight: 800, color: T.ink,
  padding: "9px 10px", borderRadius: 10, border: `1px solid ${T.line}`,
  background: T.card, appearance: "none", cursor: "pointer",
};

export default function App() {
  const [profile, setProfile] = useState("wheel");
  const [from, setFrom] = useState("渋谷");
  const [to, setTo] = useState("東京");
  const [live, setLive] = useState({ state: "loading" });
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);

  // オンライン/オフラインの監視（PWA・地下/電波弱を想定）
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);

  // 層C：層A（即時描画）の上に非同期でライブ情報をパッチする想定のシミュレーション
  // オフライン時は取得しない（層Aは保存済みデータでそのまま動く）
  useEffect(() => {
    if (!online) return;
    setLive({ state: "loading" });
    const t = setTimeout(() => {
      setLive({ state: "ready", trains: "平常運転", evDownAt: "東京" });
    }, 850);
    return () => clearTimeout(t);
  }, [online]);

  const pNote = PROFILES.find((p) => p.id === profile)?.note;
  const journey = findJourney(from, to);
  const swap = () => { setFrom(to); setTo(from); };
  const evWarn = online && live.state === "ready" && journey?.legs.some((l) => l.arriveAt === live.evDownAt);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.ink }}>
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        @media (prefers-reduced-motion: no-preference) {
          .stand-here { animation: ph 1.8s ease-in-out infinite; }
          @keyframes ph { 0%,100%{ box-shadow:0 0 0 0 ${T.confirmed}00 } 50%{ box-shadow:0 0 0 4px ${T.confirmed}22 } }
          .shimmer { background-size:200% 100%; animation: sh 1.2s linear infinite; }
          @keyframes sh { 0%{ background-position:200% 0 } 100%{ background-position:-200% 0 } }
        }
        button:focus-visible, a:focus-visible, select:focus-visible { outline: 3px solid ${T.estimated}; outline-offset: 2px; border-radius: 8px; }
        .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 56px" }}>
        {/* ヘッダー */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: "-.01em" }}>
            バリアフリー乗換
          </h1>
          <div style={{
            display: "inline-block", marginTop: 7, fontSize: 11, fontWeight: 700,
            color: T.check, background: T.check + "12", border: `1px solid ${T.check}33`,
            borderRadius: 999, padding: "3px 9px",
          }}>
            デモ用サンプルデータ（号車等は実データ未確認）
          </div>
        </div>

        {/* 入力 */}
        <div style={{
          background: T.card, border: `1px solid ${T.line}`, borderRadius: 16,
          padding: 14, marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <label style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: T.soft, fontWeight: 700, marginBottom: 4 }}>出発</div>
              <select value={from} onChange={(e) => setFrom(e.target.value)} style={selStyle}>
                {STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <button onClick={swap} aria-label="出発と到着を入れ替え" style={{
              flexShrink: 0, width: 44, height: 44, borderRadius: 10, cursor: "pointer",
              background: "#FBFCFD", border: `1px solid ${T.line}`, color: T.soft,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ArrowDownUp size={18} aria-hidden="true" style={{ transform: "rotate(90deg)" }} />
            </button>
            <label style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: T.soft, fontWeight: 700, marginBottom: 4 }}>到着</div>
              <select value={to} onChange={(e) => setTo(e.target.value)} style={selStyle}>
                {STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
          {/* プロフィールチップ */}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {PROFILES.map((p) => {
              const on = profile === p.id; const Icon = PROFILE_ICONS[p.id];
              return (
                <button key={p.id} onClick={() => setProfile(p.id)} aria-pressed={on}
                  aria-label={`対象：${p.label}`} style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  padding: "9px 4px", cursor: "pointer", minHeight: 44,
                  borderRadius: 12, fontSize: 12, fontWeight: 700,
                  color: on ? T.confirmed : T.soft,
                  background: on ? T.confirmed + "10" : "#FBFCFD",
                  border: `1.5px solid ${on ? T.confirmed : T.line}`,
                }}>
                  <Icon size={18} aria-hidden="true" /> {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ライブ状況バナー（層C）。動的更新を読み上げるライブ領域 */}
        <div role="status" aria-live="polite" style={{ marginBottom: 14 }}>
          {!online ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: T.unknown + "12", border: `1px solid ${T.unknown}40`, borderRadius: 12,
              padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: T.soft,
            }}>
              <WifiOff size={15} />
              オフライン：保存済みデータ（層A）を表示中・運行/EVの最新状況は未取得
            </div>
          ) : live.state === "loading" ? (
            <div className="shimmer" style={{
              height: 40, borderRadius: 12,
              background: `linear-gradient(90deg, ${T.line}55, ${T.line}AA, ${T.line}55)`,
            }} />
          ) : live.state === "error" ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: T.check + "0E", border: `1px solid ${T.check}40`, borderRadius: 12,
              padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: T.check,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: T.check }} />
              最新の運行・EV情報を取得できませんでした（当日要確認）
              <a href="https://www.tokyometro.jp/safety/barrierfree/index.html" target="_blank" rel="noreferrer" style={{
                marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4,
                color: T.estimated, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
              }}>
                本日朝の案内 <ExternalLink size={13} />
              </a>
            </div>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: T.card, border: `1px solid ${T.line}`, borderRadius: 12,
              padding: "10px 12px", fontSize: 13, fontWeight: 600,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: T.confirmed }} />
              運行：{live.trains}
              {evWarn && (
                <span style={{ color: T.alert, marginLeft: "auto", fontWeight: 700, fontSize: 12.5 }}>
                  {live.evDownAt}駅 EV一部運休
                </span>
              )}
            </div>
          )}
        </div>

        {/* 行程タイムライン（未収録ペアは⚪フォールバック：設計図 §4） */}
        {journey ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.soft, fontSize: 12.5, fontWeight: 700, paddingLeft: 2 }}>
              <Footprints size={15} /> {journey.from}駅 入場 → EVでホームへ
            </div>
            {journey.legs.map((leg, i) => (
              <React.Fragment key={i}>
                <RideCard leg={leg} live={online && live.state === "ready" ? live : null} profileNote={pNote} routeKey={`${from}→${to}`} />
                {i < journey.legs.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.soft, fontSize: 12.5, fontWeight: 700, paddingLeft: 2 }}>
                    <MoveRight size={15} /> {leg.arriveAt}駅で乗換
                  </div>
                )}
              </React.Fragment>
            ))}
            <div style={{
              background: "#F1F5F4", border: `1px solid ${T.line}`, borderRadius: 14,
              padding: "12px 14px", fontSize: 13, fontWeight: 700, color: T.ink,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Check size={16} color={T.confirmed} strokeWidth={3} /> {journey.to}駅 到着・段差なし経路
            </div>
          </div>
        ) : (
          <div style={{
            background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, padding: 18,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.soft, fontWeight: 800, fontSize: 14 }}>
              <CircleHelp size={18} aria-hidden="true" /> {from === to ? "同じ駅が選ばれています" : "この区間はまだ収録できていません"}
            </div>
            <div style={{ fontSize: 13, color: T.ink, marginTop: 9, lineHeight: 1.6 }}>
              {from === to
                ? "出発と到着に別の駅を選んでください。"
                : <>正確な号車・EV位置が確認できていないため、<b>このアプリでは案内しません</b>。下記の公式経路検索をご利用ください。利用者の確認報告でこの区間も育てていきます。</>}
            </div>
            {from !== to && (
              <a href="https://www.ecomo-rakuraku.jp/ja" target="_blank" rel="noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12,
                fontSize: 13, fontWeight: 700, color: T.estimated, textDecoration: "none",
                background: T.estimated + "10", border: `1px solid ${T.estimated}33`,
                borderRadius: 999, padding: "8px 14px",
              }}>
                らくらくおでかけネットで調べる <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}

        {/* 出典フッター */}
        <div style={{ marginTop: 22, fontSize: 11, color: T.soft, lineHeight: 1.7 }}>
          確認用：らくらくおでかけネット ／ 東京メトロ・都営 バリアフリー情報 ／ ODPT 駅施設データ。
          当日のEV運休は各社「本日朝」案内で要確認。
        </div>
      </div>
    </div>
  );
}
