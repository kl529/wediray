import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRIVATE_IP = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.|::1$|localhost)/;

/** 연도 없는 월/일로 연도 추론 — 3개월 이전이면 내년으로 간주 */
function inferYear(month: number, day: number): number {
  const today = new Date();
  const thisYear = today.getFullYear();
  const testDate = new Date(thisYear, month - 1, day);
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return testDate < threeMonthsAgo ? thisYear + 1 : thisYear;
}

/** HH:MM 포맷으로 변환 (12h 입력, isAfternoon=true 이면 +12h) */
function toHHMM(hour: number, min: number, isAfternoon?: boolean): string {
  let h = hour;
  if (isAfternoon && h < 12) h += 12;
  if (!isAfternoon && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/** input 태그에서 id로 value 추출: <input id="Foo" value="bar"> */
function inputVal(html: string, id: string): string {
  const m =
    html.match(new RegExp(`<input[^>]+id="${id}"[^>]+value="([^"]*)"`, 'i')) ??
    html.match(new RegExp(`<input[^>]+value="([^"]*)"[^>]+id="${id}"`, 'i'));
  return m ? m[1].trim() : '';
}

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
    if (PRIVATE_IP.test(parsed.hostname)) {
      return new Response(JSON.stringify({ error: 'private address not allowed' }), { status: 400 });
    }

    const BOT_UA = { 'User-Agent': 'Mozilla/5.0 (compatible; WediaryBot/1.0)' };

    let res = await fetch(url, { headers: BOT_UA });
    // Some short links redirect through a bridge page with `url=` query param
    const finalUrl = new URL(res.url);
    if (finalUrl.searchParams.has('url')) {
      const inner = finalUrl.searchParams.get('url')!;
      try {
        const innerParsed = new URL(inner);
        if (innerParsed.protocol === 'https:' && !PRIVATE_IP.test(innerParsed.hostname)) {
          res = await fetch(inner, { headers: BOT_UA });
        }
      } catch { /* not a valid URL */ }
    }

    const hostname = new URL(res.url).hostname;
    const html = await res.text();
    const result: Record<string, string> = {};

    // ════════════════════════════════════════════════════════════
    // SERVICE-SPECIFIC PARSERS (run first, may return early)
    // ════════════════════════════════════════════════════════════

    // ── 모이티 (moiitee.com) ──────────────────────────────────
    // Public JSON API: GET /api/invitation-data/{id}
    // URL patterns: /invite/{id} or /api_GetInvitation/{id}
    if (hostname.includes('moiitee.com')) {
      const pathId = new URL(res.url).pathname.match(/\/[^/]+\/([^/?]+)/)?.[1];
      if (pathId) {
        try {
          const apiRes = await fetch(`https://moiitee.com/api/invitation-data/${pathId}`, { headers: BOT_UA });
          if (apiRes.ok) {
            const json = await apiRes.json();
            const d = json?.Templatedata?.data;
            if (d) {
              // Names: groom_first_name=성, groom_last_name=이름
              const gSurname = (d.groom_first_name ?? '').trim();
              const gName = (d.groom_last_name ?? '').trim();
              if (gName) result.groom = gSurname + gName;

              const bSurname = (d.bride_firstname ?? '').trim();
              const bName = (d.bride_lastname ?? '').trim();
              if (bName) result.bride = bSurname + bName;

              // Date: "2025년 4월 13일 일요일"
              if (d.wedding_date) {
                const dm = d.wedding_date.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
                if (dm) result.date = `${dm[1]}-${dm[2].padStart(2,'0')}-${dm[3].padStart(2,'0')}`;
              }

              // Time: wedding_time="2시", wedding_minute="00분"
              // 모이티는 12h 포맷으로 저장. 한국 결혼식은 10~17시 사이이므로
              // 1~6시는 오후(PM)로 간주하여 +12 처리
              if (d.wedding_time) {
                const hm = d.wedding_time.match(/(\d{1,2})/);
                const mm = String(d.wedding_minute ?? '').match(/(\d{1,2})/);
                if (hm) {
                  let h = parseInt(hm[1]);
                  const min = mm ? parseInt(mm[1]) : 0;
                  if (h >= 1 && h <= 6) h += 12;
                  result.time = `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
                }
              }

              if (d.wedding_location) result.venue = String(d.wedding_location).trim();
            }
          }
        } catch { /* fall through to generic */ }
      }
      return new Response(JSON.stringify(result), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // ── 바른손M카드 (mcard.barunsoncard.com) ──────────────────
    // 구형: hidden inputs (Groom_Name, WeddingDate, ...)
    // 신형: eventDate/eventDateTime inputs + "신랑 이름 & 신부 이름" text
    if (hostname.includes('barunsoncard.com')) {
      // 구형 필드 시도
      const groomOld = inputVal(html, 'Groom_Name');
      const brideOld = inputVal(html, 'Bride_Name');
      const weddingDate = inputVal(html, 'WeddingDate');
      const weddingHour = inputVal(html, 'WeddingHour');
      const weddingMin = inputVal(html, 'WeddingMin');
      const hallName = inputVal(html, 'Weddinghall_Name');

      if (groomOld) result.groom = groomOld.replace(/\s+/g, '');
      if (brideOld) result.bride = brideOld.replace(/\s+/g, '');

      // 신형: "신랑 인준 & 신부 선하" 텍스트 패턴
      if (!result.groom || !result.bride) {
        const nameM = html.match(/신랑\s+([가-힣]{2,4})\s*&amp;\s*신부\s+([가-힣]{2,4})/) ??
                      html.match(/신랑\s+([가-힣]{2,4})\s*&\s*신부\s+([가-힣]{2,4})/);
        if (nameM) {
          if (!result.groom) result.groom = nameM[1].trim();
          if (!result.bride) result.bride = nameM[2].trim();
        }
      }

      // 날짜: 구형 WeddingDate 또는 신형 eventDate
      if (weddingDate) {
        result.date = weddingDate;
      } else {
        const eventDate = inputVal(html, 'eventDate');
        if (eventDate) result.date = eventDate;
      }

      // 시간: 구형 WeddingHour/WeddingMin 또는 신형 eventDateTime "오후 5시"
      if (weddingHour && weddingMin) {
        result.time = `${weddingHour.padStart(2,'0')}:${weddingMin.padStart(2,'0')}`;
      } else {
        const eventDT = inputVal(html, 'eventDateTime');
        if (eventDT) {
          const korTimeM = eventDT.match(/오(전|후)\s*(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/);
          if (korTimeM) {
            result.time = toHHMM(
              parseInt(korTimeM[2]),
              korTimeM[3] ? parseInt(korTimeM[3]) : 0,
              korTimeM[1] === '후',
            );
          }
        }
      }

      // 장소
      if (hallName) {
        result.venue = hallName;
      } else {
        const venuePatterns: RegExp[] = [
          /장소\s*[:：]\s*([^\n<]{4,40})/,         // 콜론 필수 (장소에... 오탐 방지)
          /웨딩홀\s*[:：]\s*([^\n<]{4,40})/,
          /"venue"\s*:\s*"([^"]+)"/,
          /([가-힣][\가-힣\d\s]{1,20}(?:홀|웨딩|호텔|컨벤션|빌딩|타워|플라자|가든))/,  // "더청담 2층 노블레스홀"
        ];
        for (const p of venuePatterns) {
          const m = html.match(p);
          if (m) { result.venue = m[1].trim(); break; }
        }
      }

      return new Response(JSON.stringify(result), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // ── 필카드 (feelcard.co.kr) ───────────────────────────────
    // PHP SSR — data stored in data-* attributes and specific input/span elements
    if (hostname.includes('feelcard.co.kr')) {
      // data-name="groom_name" or class/id patterns
      const groomM =
        html.match(/data-name="groom_name"[^>]*>([가-힣]{2,5})/) ??
        html.match(/id="groom_name"[^>]*value="([가-힣]{2,5})"/) ??
        html.match(/class="[^"]*groom[^"]*"[^>]*>\s*([가-힣]{2,5})/);
      const brideM =
        html.match(/data-name="bride_name"[^>]*>([가-힣]{2,5})/) ??
        html.match(/id="bride_name"[^>]*value="([가-힣]{2,5})"/) ??
        html.match(/class="[^"]*bride[^"]*"[^>]*>\s*([가-힣]{2,5})/);
      const hallM =
        html.match(/data-name="card_hall"[^>]*>([^<]{2,50})/) ??
        html.match(/id="card_hall"[^>]*value="([^"]{2,50})"/);

      if (groomM) result.groom = groomM[1].trim();
      if (brideM) result.bride = brideM[1].trim();
      if (hallM) result.venue = hallM[1].trim();

      // Date falls through to generic parser below (Korean 년월일 in body)
    }

    // ════════════════════════════════════════════════════════════
    // GENERIC PARSER (og tags + HTML body patterns)
    // ════════════════════════════════════════════════════════════

    // ── meta / title tags ─────────────────────────────────────
    const ogTitleMatch =
      html.match(/og:title[^>]*content="([^"]+)"/) ??
      html.match(/content="([^"]+)"[^>]*og:title/);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1] : '';

    const ogDescMatch =
      html.match(/og:description[^>]*content="([^"]+)"/) ??
      html.match(/content="([^"]+)"[^>]*og:description/);
    const ogDesc = ogDescMatch ? ogDescMatch[1] : '';

    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const titleTag = titleTagMatch ? titleTagMatch[1].trim() : '';

    // ── names ─────────────────────────────────────────────────
    if (!result.groom || !result.bride) {
      // "신랑 ♡/♥/❤/❤️ 신부 결혼합니다" in og:title or <title>
      const namePattern = /([가-힣]{2,5})\s*[♡♥❤]\uFE0F?\s*([가-힣]{2,5})/;
      // "이름와/과 이름 결혼합니다" (와/과 접속조사 패턴)
      const andNamePattern = /([가-힣]{2,5})[와과]\s+([가-힣]{2,5})\s+결혼/;
      const titleSource = ogTitle || titleTag;
      const titleNames = titleSource.match(namePattern) ?? titleSource.match(andNamePattern);

      if (titleNames) {
        if (!result.groom && titleNames[1].length >= 2) result.groom = titleNames[1];
        if (!result.bride && titleNames[2].length >= 2) result.bride = titleNames[2];
      }

      // Strip trailing possessive particle "의" (e.g. "김은재의 모바일 청첩장")
      if (result.groom?.endsWith('의') && result.groom.length > 2) result.groom = result.groom.slice(0, -1);
      if (result.bride?.endsWith('의') && result.bride.length > 2) result.bride = result.bride.slice(0, -1);

      // If only 2-char name, look for surname+name in body (e.g. "승욱" → "이승욱")
      if (!result.groom || !result.bride) {
        function findFullName(shortName: string): RegExp | null {
          if (!shortName || shortName.length >= 3) return null;
          return new RegExp(`([가-힣]${shortName})(?=[^가-힣]|$)`);
        }
        const groomBodyPatterns: RegExp[] = [
          ...(titleNames?.[1] ? [findFullName(titleNames[1])].filter(Boolean) as RegExp[] : []),
          /"groom"\s*:\s*"([^"]+)"/,
          /class="groom[^"]*"[^>]*>([가-힣]{2,5})/,
          /신랑\s{0,2}([가-힣]{2,4})(?!\s*측|\s*혼주)/,
        ];
        const brideBodyPatterns: RegExp[] = [
          ...(titleNames?.[2] ? [findFullName(titleNames[2])].filter(Boolean) as RegExp[] : []),
          /"bride"\s*:\s*"([^"]+)"/,
          /class="bride[^"]*"[^>]*>([가-힣]{2,5})/,
          /신부\s{0,2}([가-힣]{2,4})(?!\s*측|\s*혼주)/,
        ];
        if (!result.groom) for (const p of groomBodyPatterns) {
          const m = html.match(p); if (m) { result.groom = m[1].trim(); break; }
        }
        if (!result.bride) for (const p of brideBodyPatterns) {
          const m = html.match(p); if (m) { result.bride = m[1].trim(); break; }
        }
      }
    }

    // ── og:title에서 날짜 추출 (og:desc가 없을 때 fallback) ──────
    if (!result.date && ogTitle) {
      const titleYearDateM = ogTitle.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
      const titleNoYearDateM = !titleYearDateM ? ogTitle.match(/(\d{1,2})월\s*(\d{1,2})일/) : null;
      if (titleYearDateM) {
        result.date = `${titleYearDateM[1]}-${titleYearDateM[2].padStart(2,'0')}-${titleYearDateM[3].padStart(2,'0')}`;
      } else if (titleNoYearDateM) {
        const year = inferYear(parseInt(titleNoYearDateM[1]), parseInt(titleNoYearDateM[2]));
        result.date = `${year}-${titleNoYearDateM[1].padStart(2,'0')}-${titleNoYearDateM[2].padStart(2,'0')}`;
      }
    }

    // ── og:description → date + time + venue ─────────────────
    if (ogDesc) {
      const yearDateM = ogDesc.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
      const noYearDateM = !yearDateM ? ogDesc.match(/(\d{1,2})월\s*(\d{1,2})일/) : null;

      if (!result.date) {
        if (yearDateM) {
          result.date = `${yearDateM[1]}-${yearDateM[2].padStart(2,'0')}-${yearDateM[3].padStart(2,'0')}`;
        } else if (noYearDateM) {
          const year = inferYear(parseInt(noYearDateM[1]), parseInt(noYearDateM[2]));
          result.date = `${year}-${noYearDateM[1].padStart(2,'0')}-${noYearDateM[2].padStart(2,'0')}`;
        }
      }

      if (!result.time) {
        const hhmmM = ogDesc.match(/\b(\d{1,2}):(\d{2})\b/);
        const korTimeM = ogDesc.match(/오(전|후)\s*(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/);
        if (hhmmM) {
          result.time = `${hhmmM[1].padStart(2,'0')}:${hhmmM[2]}`;
        } else if (korTimeM) {
          result.time = toHHMM(
            parseInt(korTimeM[2]),
            korTimeM[3] ? parseInt(korTimeM[3]) : 0,
            korTimeM[1] === '후',
          );
        }
      }

      if (!result.venue) {
        let venueCandidate = ogDesc
          .replace(/\d{4}년\s*\d{1,2}월\s*\d{1,2}일/, '')
          .replace(/\d{1,2}월\s*\d{1,2}일/, '')
          .replace(/[（(][가-힣a-zA-Z]{1,5}[)）]/, '')      // (토), (SAT) 등
          .replace(/[월화수목금토일]요일/, '')
          .replace(/오(전|후)\s*\d{1,2}\s*시(?:\s*\d{1,2}\s*분)?/, '')
          .replace(/\b\d{1,2}:\d{2}\b/, '')
          .replace(/^[\s,·\-]+|[\s,·\-]+$/g, '')
          .trim();
        if (venueCandidate.length >= 2) result.venue = venueCandidate;
      }
    }

    // ── date fallbacks (HTML body) ────────────────────────────
    if (!result.date) {
      const eventDateM = html.match(/id="eventDate"\s+value="(\d{4}-\d{2}-\d{2})"/);
      if (eventDateM) result.date = eventDateM[1];
    }
    if (!result.date) {
      const jsonDateM = html.match(/"date"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
      if (jsonDateM) result.date = jsonDateM[1];
    }
    if (!result.date) {
      const kCalM = html.match(/[Cc]alendar[^'"]*['"](\d{4}-\d{2}-\d{2})['"]/);
      if (kCalM) result.date = kCalM[1];
    }
    if (!result.date) {
      const korDateM = html.match(/(\d{4})[년\s]+(\d{1,2})[월\s]+(\d{1,2})/);
      if (korDateM) result.date = `${korDateM[1]}-${korDateM[2].padStart(2,'0')}-${korDateM[3].padStart(2,'0')}`;
    }
    if (!result.date) {
      const dotDateM = html.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\./);
      if (dotDateM) result.date = `${dotDateM[1]}-${dotDateM[2].padStart(2,'0')}-${dotDateM[3].padStart(2,'0')}`;
    }

    // ── time fallbacks (HTML body) ────────────────────────────
    if (!result.time) {
      const korTimeM = html.match(/오(전|후)\s*(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/);
      if (korTimeM) {
        result.time = toHHMM(parseInt(korTimeM[2]), korTimeM[3] ? parseInt(korTimeM[3]) : 0, korTimeM[1] === '후');
      }
    }
    if (!result.time) {
      const engTimeM =
        html.match(/(AM|PM)\s*(\d{1,2}):(\d{2})/i) ??
        html.match(/(AM|PM)\s*(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/i);
      if (engTimeM) {
        result.time = toHHMM(parseInt(engTimeM[2]), engTimeM[3] ? parseInt(engTimeM[3]) : 0, engTimeM[1].toUpperCase() === 'PM');
      }
    }

    // ── venue fallbacks (HTML body) ───────────────────────────
    if (!result.venue) {
      const venuePatterns: RegExp[] = [
        /<div class="text-wrapper-2">([^<]{4,50})</,
        /장소[^\S\n]*[:：]?\s*([^\n<]{4,40})/,
        /웨딩홀[^\S\n]*[:：]?\s*([^\n<]{4,40})/,
        /"venue"\s*:\s*"([^"]+)"/,
        /"place"\s*:\s*"([^"]+)"/,
        /"weddingHall"\s*:\s*"([^"]+)"/,
        /"hall"\s*:\s*"([^"]+)"/,
        /"location"\s*:\s*"([^"]+)"/,
      ];
      for (const p of venuePatterns) {
        const m = html.match(p);
        if (m) { result.venue = m[1].trim(); break; }
      }
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
