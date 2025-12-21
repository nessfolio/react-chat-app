import { create } from "zustand";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isGroup: false, // Added global flag
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,

  // We add 'isGroup' as a third argument
  changeChat: (chatId, user, isGroup) => {
    const currentUser = useUserStore.getState().currentUser;

    // 1. Handle Group Chats
    if (isGroup) {
      return set({
        chatId,
        user: null,
        isGroup: true, // Mark active chat as a group
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }

    // 2. Handle Private Chats (Logic stays the same)
    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isGroup: false,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    } else if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user,
        isGroup: false,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      return set({
        chatId,
        user,
        isGroup: false,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },

  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
  resetChat: () => {
    set({
      chatId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },
}));