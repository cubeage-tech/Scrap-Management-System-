import { create } from "zustand";
import ApiService from "../core/services/api.service";

// Maps backend notification type → display category + icon name + color classes
const TYPE_META = {
  OFFER_RECEIVED:    { category: "Quotation", iconName: "FileText",    iconBg: "bg-blue-50 text-blue-600 border border-blue-100" },
  OFFER_ACCEPTED:    { category: "Quotation", iconName: "CheckCircle2",iconBg: "bg-green-50 text-green-600 border border-green-100" },
  OFFER_REJECTED:    { category: "Quotation", iconName: "XCircle",     iconBg: "bg-red-50 text-red-600 border border-red-100" },
  SALE_COMPLETED:    { category: "Sale",      iconName: "Package",     iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
  OUTBID:            { category: "Auction",   iconName: "Gavel",       iconBg: "bg-orange-50 text-orange-600 border border-orange-100" },
  AUCTION_WON:       { category: "Auction",   iconName: "Trophy",      iconBg: "bg-amber-50 text-amber-600 border border-amber-100" },
  AUCTION_LOST:      { category: "Auction",   iconName: "Gavel",       iconBg: "bg-stone-100 text-stone-500 border border-stone-200" },
  AUCTION_NO_WINNER: { category: "Auction",   iconName: "Gavel",       iconBg: "bg-stone-100 text-stone-500 border border-stone-200" },
  WINNER_SELECTED:   { category: "Auction",   iconName: "Trophy",      iconBg: "bg-amber-50 text-amber-600 border border-amber-100" },
  ACCOUNT_APPROVED:  { category: "Account",   iconName: "UserCheck",   iconBg: "bg-sky-50 text-sky-600 border border-sky-100" },
  ACCOUNT_REJECTED:  { category: "Account",   iconName: "XCircle",     iconBg: "bg-red-50 text-red-600 border border-red-100" },
};

export const getTypeMeta = (type) =>
  TYPE_META[type] ?? { category: "Other", iconName: "Bell", iconBg: "bg-stone-50 text-stone-500 border border-stone-100" };

export const formatRelativeTime = (dateString) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res = await ApiService.getNotifications({ limit: 50 });
      const { notifications, unreadCount } = res.data.data;
      set({ notifications, unreadCount, loading: false });
    } catch (err) {
      set({ loading: false, error: err?.response?.data?.message || err.message });
    }
  },

  markRead: async (id) => {
    const prev = get().notifications.find((n) => n.id === id);
    if (prev?.isRead) return;
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    try {
      await ApiService.markNotificationRead(id);
    } catch (err) {
      // revert optimistic update on failure
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
        unreadCount: state.unreadCount + 1,
      }));
    }
  },

  markAllRead: async () => {
    const hadUnread = get().unreadCount > 0;
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    if (!hadUnread) return;
    try {
      await ApiService.markAllNotificationsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  },
}));
