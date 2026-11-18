import { useState, useEffect } from "react";
import {
  FileText, Trophy, CheckCircle2, Package,
  Gavel, UserCheck, XCircle, Check, CheckCheck, Bell,
} from "lucide-react";
import { useNotificationStore, getTypeMeta, formatRelativeTime } from "../../store/notificationStore";

const ICON_MAP = { FileText, Trophy, CheckCircle2, Package, Gavel, UserCheck, XCircle, Bell };

const TABS = ["All", "Unread", "Quotation", "Auction", "Sale", "Account"];

const Notification = () => {
  const [activeTab, setActiveTab] = useState("All");
  const { notifications, unreadCount, loading, error, fetchNotifications, markRead, markAllRead } =
    useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "Unread") return !n.isRead;
    return getTypeMeta(n.type).category === activeTab;
  });

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1817] sm:text-3xl">
              Notification Center
            </h1>
            <p className="mt-1 text-sm font-medium text-stone-500">
              {unreadCount} {unreadCount === 1 ? "unread notification" : "unread notifications"}
            </p>
          </div>

          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-xs transition hover:bg-stone-50 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <CheckCheck className="h-3.5 w-3.5 text-stone-500" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Tab bar */}
        <div className="mb-6 overflow-x-auto rounded-xl border border-stone-200/70 bg-[#F0ECE7]/60 p-1.5">
          <div className="flex min-w-max items-center gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              const isUnreadTab = tab === "Unread";
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs transition-all ${
                    isActive
                      ? "bg-[#593627] text-white shadow-xs font-semibold"
                      : "text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 font-medium"
                  }`}
                >
                  <span>{tab}</span>
                  {isUnreadTab && unreadCount > 0 && (
                    <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-stone-400">
              Loading notifications…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-sm text-red-500">
              {error}
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const meta = getTypeMeta(item.type);
              const Icon = ICON_MAP[meta.iconName] ?? Bell;
              return (
                <div
                  key={item.id}
                  className={`group relative flex items-start justify-between gap-4 rounded-xl border border-stone-200 p-4 shadow-2xs transition-all hover:border-stone-300 hover:shadow-xs ${
                    !item.isRead ? "bg-white" : "bg-white/90"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.iconBg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-stone-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-stone-600 leading-relaxed max-w-2xl">
                        {item.message}
                      </p>
                      <span className="mt-1.5 block text-[11px] font-medium text-stone-400">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 pt-0.5">
                    {!item.isRead && (
                      <>
                        <span className="h-2 w-2 rounded-full bg-blue-600" title="Unread" />
                        <button
                          onClick={() => markRead(item.id)}
                          className="rounded p-1 text-stone-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white px-4 py-16 text-center shadow-2xs">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-stone-800">No notifications found</h3>
              <p className="mt-1 text-xs text-stone-500">
                There are no notifications in the &quot;{activeTab}&quot; category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
