export interface Env { DB: D1Database; }

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const bad = (error: string, status = 400) => json({ ok: false, error }, status);
const nowISO = () => new Date().toISOString();

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const slug = String(params.slug || "").trim();
  if (!slug) return bad("Missing slug.");

  if (request.method === "GET") {
    const row = await env.DB.prepare(`SELECT * FROM campaigns WHERE slug = ? LIMIT 1`).bind(slug).first();
    if (!row) return json({ ok: false, error: "Not found" }, 404);

    const r: any = row;
    return json({
      ok: true,
      campaign: {
        slug: r.slug,
        title: r.title,
        status: r.status,
        system: r.system,
        day: r.day,
        time: r.time,
        mode: r.mode,
        seatsOpen: r.seats_open ?? 0,
        seatsTotal: r.seats_total ?? 0,
        price: r.price,
        thumb: r.thumb,
        hook: r.hook,
        blurb: r.blurb,
        tags: r.tags_json ? JSON.parse(r.tags_json) : [],
        data: r.data_json ? JSON.parse(r.data_json) : {},
        updatedAt: r.updated_at,
      }
    });
  }

  if (request.method === "DELETE") {
    await env.DB.prepare(`DELETE FROM campaigns WHERE slug = ?`).bind(slug).run();
    return json({ ok: true, deleted: slug });
  }

  if (request.method === "PUT") {
    let body: any;
    try { body = await request.json(); } catch { return bad("Invalid JSON body."); }
    const dataJson = JSON.stringify(body?.data ?? body);
    await env.DB.prepare(`UPDATE campaigns SET data_json = ?, updated_at = ? WHERE slug = ?`)
      .bind(dataJson, nowISO(), slug)
      .run();
    return json({ ok: true, updated: slug });
  }

  return bad("Method not allowed.", 405);
};
