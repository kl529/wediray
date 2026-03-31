import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { url } = await req.json();
    if (!url) return new Response(JSON.stringify({ error: 'url required' }), { status: 400 });

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WediaryBot/1.0)' },
    });
    const html = await res.text();

    const result: Record<string, string> = {};

    // Extract names from common Korean wedding invitation patterns
    const groomPatterns = [
      /신랑[^\S\n]*[:：]?\s*([가-힣]{2,5})/,
      /"groom"\s*:\s*"([^"]+)"/,
      /class="groom[^"]*"[^>]*>([가-힣]{2,5})/,
    ];
    const bridePatterns = [
      /신부[^\S\n]*[:：]?\s*([가-힣]{2,5})/,
      /"bride"\s*:\s*"([^"]+)"/,
      /class="bride[^"]*"[^>]*>([가-힣]{2,5})/,
    ];
    const datePatterns = [
      /(\d{4})[년.\s-]+(\d{1,2})[월.\s-]+(\d{1,2})/,
      /"date"\s*:\s*"(\d{4}-\d{2}-\d{2})"/,
    ];
    const venuePatterns = [
      /장소[^\S\n]*[:：]?\s*([^\n<]{4,40})/,
      /웨딩홀[^\S\n]*[:：]?\s*([^\n<]{4,40})/,
      /"venue"\s*:\s*"([^"]+)"/,
    ];

    for (const p of groomPatterns) {
      const m = html.match(p);
      if (m) { result.groom = m[1].trim(); break; }
    }
    for (const p of bridePatterns) {
      const m = html.match(p);
      if (m) { result.bride = m[1].trim(); break; }
    }
    for (const p of datePatterns) {
      const m = html.match(p);
      if (m) {
        if (m[0].includes('-')) {
          result.date = m[1];
        } else {
          const y = m[1], mo = m[2].padStart(2, '0'), d = m[3].padStart(2, '0');
          result.date = `${y}-${mo}-${d}`;
        }
        break;
      }
    }
    for (const p of venuePatterns) {
      const m = html.match(p);
      if (m) { result.venue = m[1].trim(); break; }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
