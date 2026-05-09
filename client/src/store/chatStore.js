import { create } from 'zustand';
import { io } from 'socket.io-client';
import { messagesAPI, BACKEND_HOST } from '../utils/api';

const useChatStore = create((set, get) => ({
  socket: null,
  conversations: [],
  unreadCount: 0,
  onlineUsers: new Set(),

  connect: (token) => {
    const socket = io(BACKEND_HOST || '/', { auth: { token } });
    socket.on('new_message', (msg) => {
      set((s) => ({ unreadCount: s.unreadCount + 1 }));
    });
    socket.on('user_online', ({ userId, online }) => {
      set((s) => {
        const updated = new Set(s.onlineUsers);
        online ? updated.add(userId) : updated.delete(userId);
        return { onlineUsers: updated };
      });
    });
    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) socket.disconnect();
    set({ socket: null });
  },

  fetchConversations: async () => {
    try {
      const res = await messagesAPI.getConversations();
      const total = res.data.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      set({ conversations: res.data, unreadCount: total });
    } catch {}
  },

  markRead: async (userId) => {
    try {
      await messagesAPI.markRead(userId);
      get().fetchConversations();
    } catch {}
  },
}));

export default useChatStore;
