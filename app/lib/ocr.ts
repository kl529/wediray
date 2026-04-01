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
    ? await ImagePicker.launchCameraAsync({ quality: 0.9 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });

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

  // Pattern 2: "홍길동 ♡ 김영희" or "홍길동 & 김영희"
  if (!result.groom || !result.bride) {
    const pairMatch = text.match(/([가-힣]{2,5})\s*[♡♥❤&＆]\s*([가-힣]{2,5})/);
    if (pairMatch) {
      if (!result.groom) result.groom = pairMatch[1].trim();
      if (!result.bride) result.bride = pairMatch[2].trim();
    }
  }

  // Pattern 3: two consecutive Korean names on adjacent lines (e.g. invitation covers)
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
  // "장소: 그랜드 볼룸" / line after "예식장" keyword
  const venueMatch =
    text.match(/(?:장소|예식장|웨딩홀|웨딩 홀)\s*[:：]?\s*([^\n]{4,40})/) ||
    text.match(/([^\n]{4,40}(?:웨딩|홀|호텔|컨벤션|채플|하우스|가든|클럽))/i);
  if (venueMatch) result.venue = venueMatch[1].trim();

  return result;
}
