// 利用者の確認報告を受け取りKVに保存する（設計図§6：確認を資産化する成長ループ）
// POST /api/report  body: { transfer: string, verdict: "ok" | "ng" }
export async function onRequestPost({ request, env }) {
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "content-type": "application/json; charset=utf-8" },
    });

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const transfer = typeof body?.transfer === "string" ? body.transfer.slice(0, 200) : "";
  const verdict = body?.verdict;
  if (!transfer || (verdict !== "ok" && verdict !== "ng")) {
    return json({ error: "bad request" }, 400);
  }

  const at = new Date().toISOString();
  const key = `report:${transfer}:${Date.now()}:${crypto.randomUUID()}`;
  try {
    await env.REPORTS.put(key, JSON.stringify({ transfer, verdict, at }));
  } catch {
    return json({ error: "storage failed" }, 500);
  }
  return json({ ok: true });
}
