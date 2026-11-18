import { useState, useEffect } from "react";
import {
  FileText, Trophy, CheckCircle2, Package,
  Gavel, UserCheck, XCircle, CheckCheck, Bell,
} from "lucide-react";
import { useNotificationStore, getTypeMeta, formatRelativeTime } from "../../store/notificationStore";

const ICON_MAP = { FileText, Trophy, CheckCircle2, Package, Gavel, UserCheck, XCircle, Bell };

const TABS = ["All", "Unread", "Quotation", "Auction", "Sale", "Account"];

const Notifications = () => {
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
    <div className="min-h-full w-full bg-[#f8fafc] px-3 py-4 sm:px-5 lg:px-6 lg:py-5">
      {/* Breadcrumb */}
      <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
        <span>SmartScrap AI</span>
        <span>›</span>
        <span className="font-medium text-slate-600">Notifications</span>
      </div>

      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount} {unreadCount === 1 ? "unread notification" : "unread notifications"}
          </p>
        </div>

        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <CheckCheck className="mr-1.5 inline h-3.5 w-3.5" />
          Mark all as read
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const isUnreadTab = tab === "Unread";
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-white font-medium text-slate-800 shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-slate-700"
              }`}
            >
              {tab}
              {isUnreadTab && unreadCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Inbox */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-medium text-slate-800">Inbox</h2>
        </div>

        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-12 text-sm text-slate-400">
            Loading notifications…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center px-4 py-12 text-sm text-red-500">
            {error}
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const meta = getTypeMeta(item.type);
            const Icon = ICON_MAP[meta.iconName] ?? Bell;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 border-b border-slate-200 px-4 py-4 last:border-b-0 sm:items-center"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">{item.message}</p>
                </div>

                <div className="ml-1 flex shrink-0 flex-col items-end gap-2 sm:ml-4 sm:flex-row sm:items-center">
                  <span className="whitespace-nowrap text-xs text-slate-500">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                  {!item.isRead && (
                    <button
                      onClick={() => markRead(item.id)}
                      title="Mark as read"
                      className="h-2 w-2 rounded-full bg-blue-600 hover:bg-blue-700"
                    />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <Bell className="mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No notifications found</p>
            <p className="mt-1 text-xs text-slate-400">
              There are no notifications in this category.
            </p>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <Bell className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <p className="text-sm text-slate-500">
          Configure delivery channels (email, SMS, webhook) in{" "}
          <span className="font-medium text-slate-600">Settings → Notifications.</span>
        </p>
      </div>
    </div>
  );
};

export default Notifications;
