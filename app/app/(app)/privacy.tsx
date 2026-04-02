import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '../../components/ScreenHeader';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <ScreenHeader
        left={
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            className="py-2"
          >
            <Text className="text-white/50 text-base">← 뒤로</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}>
        <Text className="text-pink-400 text-2xl font-gaegu-bold tracking-widest mb-6">개인정보처리방침</Text>

        <Text className="text-white/40 text-xs mb-8">시행일: 2026년 3월 31일</Text>

        <Section title="1. 개인정보 수집 항목 및 목적">
          <Item label="수집 항목" value="이메일 주소 (카카오 계정 연동)" />
          <Item label="수집 목적" value="서비스 로그인 및 사용자 식별, 결혼식 기록 데이터와의 연결" />
          <Item label="보유 기간" value="회원 탈퇴 시까지. 탈퇴 후 즉시 파기." />
        </Section>

        <Section title="2. 개인정보 처리 위탁">
          <Text className="text-white/60 text-sm leading-6">
            회사는 서비스 운영을 위해 아래 업체에 개인정보 처리를 위탁합니다.{'\n\n'}
            • Supabase Inc. (미국) — 데이터베이스 및 인증 서비스{'\n'}
            • Kakao Corp. — OAuth 로그인 서비스
          </Text>
        </Section>

        <Section title="3. 개인정보의 국외 이전">
          <Text className="text-white/60 text-sm leading-6">
            수집된 개인정보는 Supabase Inc.의 서버(미국)에 저장됩니다.{'\n'}
            이전 국가: 미국 / 이전 일시: 회원가입 즉시 / 이전 방법: 네트워크 전송
          </Text>
        </Section>

        <Section title="4. 정보주체의 권리">
          <Text className="text-white/60 text-sm leading-6">
            이용자는 언제든지 아래 권리를 행사할 수 있습니다.{'\n\n'}
            • 개인정보 열람 요청{'\n'}
            • 개인정보 정정·삭제 요청{'\n'}
            • 개인정보 처리 정지 요청{'\n'}
            • 개인정보 이동 요청{'\n\n'}
            앱 내 설정 → 로그아웃 후 탈퇴를 통해 모든 데이터를 삭제할 수 있습니다.
          </Text>
        </Section>

        <Section title="5. 개인정보 보호책임자">
          <Item label="성명" value="김리바" />
          <Item label="이메일" value="lyva.kim@example.com" />
        </Section>

        <Section title="6. 개인정보처리방침 변경">
          <Text className="text-white/60 text-sm leading-6">
            본 방침은 법령·서비스 변경 시 앱 내 공지 또는 이메일로 사전 고지 후 변경됩니다.
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-8">
      <Text className="text-white text-sm font-bold mb-3">{title}</Text>
      {children}
    </View>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row mb-2">
      <Text className="text-white/40 text-sm w-24">{label}</Text>
      <Text className="text-white/70 text-sm flex-1">{value}</Text>
    </View>
  );
}
