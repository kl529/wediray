import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  destructive = false,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
      >
        <Pressable onPress={(e) => e.stopPropagation()} className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-6">
          <Text className="text-white font-bold text-lg mb-1">{title}</Text>
          {message && <Text className="text-white/50 text-sm mb-6">{message}</Text>}
          {!message && <View className="mb-4" />}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 items-center"
            >
              <Text className="text-white/60 font-semibold text-sm">{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 py-3 rounded-xl items-center ${
                destructive
                  ? 'bg-red-500/20 border border-red-500/30'
                  : 'bg-pink-400/20 border border-pink-400/30'
              }`}
            >
              <Text className={`font-semibold text-sm ${destructive ? 'text-red-400' : 'text-pink-400'}`}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
