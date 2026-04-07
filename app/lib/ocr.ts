import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';

export interface ParsedInvitation {
  groom?: string;
  bride?: string;
  date?: string;
  venue?: string;
}

/** Pick image from camera or gallery and run on-device OCR. */
export async function pickAndOcr(source: 'camera' | 'gallery'): Promise<string | null> {
  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync({ quality: 0.9, copyToCacheDirectory: true })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9, copyToCacheDirectory: true });

  if (result.canceled) return null;
  const { text } = await TextRecognition.recognize(result.assets[0].uri);
  return text;
}

/** Parse raw OCR text into structured wedding fields. */
export function parseOcrText(text: string): ParsedInvitation {
  const result: ParsedInvitation = {};

  // --- Names ---
  // Pattern 1: "신랑 홍길동" / "신부 김영희"
  const groomMatch = text.match(/신랑\s*[:：]?\s*([가-힣]{2,5})/);
  const brideMatch = text.match(/신부\s*[:：]?\s*([가-힣]{2,5})/);
  if (groomMatch) result.groom = groomMatch[1].trim();
  if (brideMatch) result.bride = brideMatch[1].trim();

  // Pattern 2: "장남/차남/아들 홍길동" / "장녀/차녀/딸 이지영" (부모 소개 형식)
  if (!result.groom) {
    const m = text.match(/(?:장남|차남|삼남|아들)\s+([가-힣]{2,5})/);
    if (m) result.groom = m[1].trim();
  }
  if (!result.bride) {
    const m = text.match(/(?:장녀|차녀|삼녀|딸)\s+([가-힣]{2,5})/);
    if (m) result.bride = m[1].trim();
  }

  // Pattern 3: "홍길동 ♡ 김영희" or "홍길동 & 김영희"
  if (!result.groom || !result.bride) {
    const pairMatch = text.match(/([가-힣]{2,5})\s*[♡♥❤&＆]\s*([가-힣]{2,5})/);
    if (pairMatch) {
      if (!result.groom) result.groom = pairMatch[1].trim();
      if (!result.bride) result.bride = pairMatch[2].trim();
    }
  }

  // Pattern 4: English romanization "LEE SEUNGWOOK & LEE JIYEONG" (첫 번째 & 기준)
  if (!result.groom || !result.bride) {
    const engMatch = text.match(/([A-Z]{2,15}(?:\s[A-Z]{2,15})?)\s*&\s*([A-Z]{2,15}(?:\s[A-Z]{2,15})?)/);
    if (engMatch) {
      // 영문 이름은 성+이름에서 이름만 추출 (마지막 단어)
      if (!result.groom) result.groom = engMatch[1].trim().split(' ').pop() || engMatch[1].trim();
      if (!result.bride) result.bride = engMatch[2].trim().split(' ').pop() || engMatch[2].trim();
    }
  }

  // Pattern 5: two consecutive Korean names on adjacent lines (e.g. invitation covers)
  if (!result.groom || !result.bride) {
    const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
    const nameLines = lines.filter((l) => /^[가-힣]{2,5}$/.test(l));
    if (nameLines.length >= 2 && !result.groom) result.groom = nameLines[0];
    if (nameLines.length >= 2 && !result.bride) result.bride = nameLines[1];
  }

  // --- Date ---
  // "2025년 5월 10일" / "2025.05.10" / "2025-05-10"
  const dateMatch =
    text.match(/(\d{4})[년.\-\/\s]+(\d{1,2})[월.\-\/\s]+(\d{1,2})/) ||
    text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const y = dateMatch[1];
    const m = dateMatch[2].padStart(2, '0');
    const d = dateMatch[3].padStart(2, '0');
    result.date = `${y}-${m}-${d}`;
  }

  // --- Venue ---
  // "장소: 그랜드 볼룸" / 키워드 포함 라인 전체
  const venueKeywordMatch = text.match(/(?:장소|예식장|웨딩홀|웨딩 홀)\s*[:：]?\s*([^\n]{4,50})/);
  if (venueKeywordMatch) {
    result.venue = venueKeywordMatch[1].trim();
  } else {
    // 호텔/웨딩 관련 키워드가 포함된 줄 전체를 장소로
    const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
    const venueLine = lines.find((l) =>
      /호텔|웨딩|컨벤션|채플|하우스|가든|클럽|성당|교회|아트홀|뷔페|홀$/.test(l)
    );
    if (venueLine) result.venue = venueLine;
  }

  return result;
}
