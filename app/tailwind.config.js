/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Y2K 다이어리 팔레트
        pink: { 400: '#FF69B4', 500: '#FF1493' },
        lime: { 400: '#CCFF00', 500: '#AAEE00' },
        sky: { 400: '#00CFFF', 500: '#00AADD' },
      },
      borderRadius: {
        // 시맨틱 radius 계층 — rounded-{token} 으로 사용
        // card:  결혼식 목록 카드, 설정 메뉴 행, 사진 썸네일 (rounded-2xl = 16px)
        // input: 텍스트 입력, 버튼, 탭 바 내부 아이템   (rounded-xl  = 12px)
        // tab:   탭 바 외부 컨테이너 아이템              (rounded-lg  = 8px)
        // pill:  참석 뱃지, 감정 태그 칩                 (rounded-full)
        card: '16px',
        input: '12px',
        tab: '8px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};


