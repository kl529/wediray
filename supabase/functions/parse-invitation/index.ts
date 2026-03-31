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

    let parsed: URL;
    try { parsed = new URL(url); } catch {
      return new Response(JSON.stringify({ error: 'invalid url' }), { status: 400 });
    }
    if (parsed.protocol !== 'https:') {
      return new Response(JSON.stringify({ error: 'https only' }), { status: 400 });
    }
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.|::1$|localhost)/.test(parsed.hostname)) {
      return new Response(JSON.stringify({ error: 'private address not allowed' }), { status: 400 });
    }

    let res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WediaryBot/1.0)' },
    });
    // Some short links (e.g. naver.me) redirect through a bridge page that wraps
    // the real URL in a `url=` query parameter. Follow it one level deeper.
    const finalParsed = new URL(res.url);
    if (finalParsed.searchParams.has('url')) {
      const inner = finalParsed.searchParams.get('url')!;
      try {
        const innerParsed = new URL(inner);
        if (innerParsed.protocol === 'https:') {
          res = await fetch(inner, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WediaryBot/1.0)' },
          });
        }
      } catch { /* not a valid URL, ignore */ }
    }
    const html = await res.text();

    const result: Record<string, string> = {};

    // Extract names from common Korean wedding invitation patterns
    // og:title pattern covers "신랑 ♡ 신부 결혼 합니다" style (barunsoncard, etc.)
    const ogTitleMatch = html.match(/og:title[^>]*content="([^"]+)"/);
    if (!ogTitleMatch) {
      // also try reversed attribute order
      html.match(/content="([^"]+)"[^>]*og:title/);
    }
    const titleStr = ogTitleMatch ? ogTitleMatch[1] : '';
    const titleNames = titleStr.match(/([가-힣]{2,5})\s*[♡♥❤]\s*([가-힣]{2,5})/);

    // Try to find full name (surname + given name) by searching for a 1-char Korean
    // prefix before the short name extracted from og:title.
    function findFullName(shortName: string): RegExp | null {
      if (!shortName) return null;
      // If og:title already has a 3-4 char name, use it directly
      if (shortName.length >= 3) return new RegExp(`(${shortName})`);
      // Otherwise look for surname + shortName (e.g. "이" + "승욱" → "이승욱")
      return new RegExp(`([가-힣]${shortName})(?=[^가-힣]|$)`);
    }

    const groomPatterns = [
      // Full name via surname+given lookup — most accurate
      ...(titleNames ? [findFullName(titleNames[1])].filter(Boolean) as RegExp[] : []),
      /"groom"\s*:\s*"([^"]+)"/,
      /class="groom[^"]*"[^>]*>([가-힣]{2,5})/,
      /신랑\s{0,2}([가-힣]{2,4})(?!\s*측|\s*혼주)/,
    ];
    const bridePatterns = [
      ...(titleNames ? [findFullName(titleNames[2])].filter(Boolean) as RegExp[] : []),
      /"bride"\s*:\s*"([^"]+)"/,
      /class="bride[^"]*"[^>]*>([가-힣]{2,5})/,
      /신부\s{0,2}([가-힣]{2,4})(?!\s*측|\s*혼주)/,
    ];
    const datePatterns = [
      // hidden input id="eventDate" value="YYYY-MM-DD" (barunsoncard, etc.)
      /id="eventDate"\s+value="(\d{4}-\d{2}-\d{2})"/,
      /"date"\s*:\s*"(\d{4}-\d{2}-\d{2})"/,
      // Korean 년월일 format — returns YYYY-MM-DD
      /(\d{4})[년\s]+(\d{1,2})[월\s]+(\d{1,2})/,
    ];
    const venuePatterns = [
      /<div class="text-wrapper-2">([^<]{4,50})</,
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
        if (p.source.includes('년')) {
          // Korean format: capture groups are year, month, day
          const y = m[1], mo = m[2].padStart(2, '0'), d = m[3].padStart(2, '0');
          result.date = `${y}-${mo}-${d}`;
        } else {
          // ISO format: m[1] is the full YYYY-MM-DD string
          result.date = m[1];
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
