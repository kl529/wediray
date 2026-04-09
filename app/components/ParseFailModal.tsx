import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ParseFailType = 'not_found' | 'network_error';

export function ParseFailModal({
  visible,
  type,
  onDismiss,
  onRetry,
}: {
  visible: boolean;
  type: ParseFailType;
  onDismiss: () => void;
  onRetry?: () => void;
}) {
  const isNetworkError = type === 'network_error';

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        onPress={onDismiss}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 32,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-6"
        >
          {/* 아이콘 */}
          <View className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 items-center justify-center mb-4">
            <Ionicons
              name={isNetworkError ? 'wifi-outline' : 'link-outline'}
              size={22}
              color="rgba(255,255,255,0.4)"
            />
          </View>

          {/* 제목 */}
          <Text className="text-white font-bold text-base mb-1">
            {isNetworkError ? '링크를 불러오지 못했어요' : '자동 입력이 어려워요'}
          </Text>

          {/* 설명 */}
          <Text className="text-white/40 text-sm leading-relaxed mb-6">
            {isNetworkError
              ? '네트워크 상태를 확인해주세요.\n문제가 계속되면 직접 입력해주세요.'
              : '이 청첩장 서비스는 자동 파싱을 지원하지 않아요.\n신랑·신부 이름, 날짜, 장소를 직접 입력해주세요.'}
          </Text>

          {/* 버튼 */}
          <View className={isNetworkError ? 'flex-row gap-3' : ''}>
            {isNetworkError && (
              <TouchableOpacity
                onPress={onRetry}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 items-center"
              >
                <Text className="text-white/60 font-semibold text-sm">다시 시도</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onDismiss}
              className={`py-3 rounded-xl items-center bg-pink-500/20 border border-pink-500/30 ${isNetworkError ? 'flex-1' : ''}`}
            >
              <Text className="text-pink-400 font-semibold text-sm">직접 입력할게요</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
