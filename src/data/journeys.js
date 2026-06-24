/* 層A：構造データ（駅レイアウト / EV・ES位置 / EV最寄り車両・ドア）
   ── デモ用サンプル。実データは人力＋利用者報告で育てる前提（設計図 §6）。
   各データに source と verifiedAt を必ず付ける。 */

// 入力候補の駅（MVPは主要乗換駅から。実データの拡充に合わせて増やす）
export const STATIONS = ["渋谷", "新宿", "池袋", "上野", "東京", "新橋", "品川"];

// ルートは "出発→到着" をキーに引く。収録が無いペアは⚪フォールバック（設計図 §4）。
export const JOURNEYS = {
  "渋谷→東京": {
    from: "渋谷", to: "東京",
    legs: [
      {
        type: "ride", line: "東京メトロ銀座線", color: "#F39700", dir: "表参道方面",
        cars: 6, recommendedCar: 5, doorNo: 2, side: "進行方向 右",
        evPlace: "降車ホーム 渋谷寄りの中央付近", evIndex: 4.5,
        arriveAt: "新橋", confidence: "confirmed",
        route: ["降車後、右手のEVでコンコースへ", "改札を出て直進", "JR連絡口は左手"],
        source: ["らくらくおでかけネット", "東京メトロ のりかえ出口案内"],
        verifiedAt: "2026-05", toGate: 35,
      },
      {
        type: "ride", line: "JR山手線", color: "#9ACD32", dir: "東京・上野方面",
        cars: 11, recommendedCar: 8, doorNo: null, side: "進行方向 左",
        evPlace: "中央付近（号車は推定）", evIndex: 7.2,
        arriveAt: "東京", confidence: "estimated",
        route: ["降車後 左手のEVで改札階へ", "丸の内側改札へ"],
        source: ["ODPT 駅施設データ（自動推定）"],
        verifiedAt: "2026-03", toGate: 60,
      },
    ],
  },

  "新宿→上野": {
    from: "新宿", to: "上野",
    legs: [
      {
        type: "ride", line: "JR山手線", color: "#9ACD32", dir: "池袋・上野方面（外回り）",
        cars: 11, recommendedCar: 8, doorNo: null, side: "進行方向 右",
        evPlace: "上野駅 中央付近（要再確認）", evIndex: 6.8,
        arriveAt: "上野", confidence: "needs_check",
        route: ["降車後 右手のEVで改札階へ", "公園口またはしのばず口へ"],
        source: ["ODPT 駅施設データ（未確認・要再確認）"],
        verifiedAt: "2024-11", toGate: 55,
      },
    ],
  },
};

export function findJourney(from, to) {
  if (from === to) return null;
  return JOURNEYS[`${from}→${to}`] || null;
}

export const PROFILES = [
  { id: "wheel", label: "車椅子",
    note: "乗降は駅員のスロープ対応が確実にできる改札で。→番線まで介助すると伝えれば当日でも可。早めに余裕を持って。" },
  { id: "baby", label: "ベビーカー",
    note: "EVのみ経路を優先表示。混雑時はEV待ちが出るため+5分を見込んでください。" },
  { id: "slow", label: "ゆっくり歩行",
    note: "段差・急ぎを避けた導線で。エスカレーターは時間帯で上下が変わる点に特に注意。" },
];
