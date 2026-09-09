import React, { useState } from "react";
import {
  FileText,
  Trophy,
  CheckCircle2,
  Package,
  Clock,
  IndianRupee,
  UserCheck,
  Check,
  CheckCheck,
  X,
  Bell,
} from "lucide-react";

// Mock Notifications data matching Figma reference
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    category: "Quotation",
    title: "New Quotation Received",
    description:
      "Sanjay Metals submitted a quotation of ₹37,800/MT for MS Steel Scrap (45 MT)",
    time: "10 minutes ago",
    isRead: false,
    icon: FileText,
    iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
  },
  {
    id: 2,
    category: "Auction",
    title: "Auction Won",
    description:
      "Metro Recyclers won the auction for Mixed E-Waste batch at ₹91,000/MT",
    time: "2 hours ago",
    isRead: false,
    icon: Trophy,
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
  },
  {
    id: 3,
    category: "Tender",
    title: "Tender Closed",
    description:
      "Tender TND-003 for Brass Turning Scrap has been closed. 11 offers received.",
    time: "1 day ago",
    isRead: true,
    icon: CheckCircle2,
    iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
  },
  {
    id: 4,
    category: "Inventory",
    title: "Inventory Updated",
    description:
      "Stock deducted for SAL-001 — 45 MT MS Steel HMS cleared from Warehouse A Bay 3",
    time: "1 day ago",
    isRead: true,
    icon: Package,
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    id: 5,
    category: "Listing",
    title: "Listing Expiring Soon",
    description:
      "LST-001 MS Steel HMS expires in 7 days. Renew or extend the listing.",
    time: "2 days ago",
    isRead: true,
    icon: Clock,
    iconBg: "bg-orange-50 text-orange-600 border border-orange-100",
  },
  {
    id: 6,
    category: "Commission",
    title: "Commission Added",
    description:
      "Commission of ₹28,050 credited for Sale SAL-002 (Copper Cable Scrap)",
    time: "3 days ago",
    isRead: true,
    icon: IndianRupee,
    iconBg: "bg-teal-50 text-teal-600 border border-teal-100",
  },
  {
    id: 7,
    category: "Account",
    title: "Account Approved",
    description:
      'New dealer account for "Apex Scrap Dealers" has been approved by admin',
    time: "3 days ago",
    isRead: true,
    icon: UserCheck,
    iconBg: "bg-sky-50 text-sky-600 border border-sky-100",
  },
];

const TABS = [
  "All",
  "Unread",
  "Quotation",
  "Auction",
  "Tender",
  "Inventory",
  "Listing",
  "Commission",
  "Account",
];

const Notification = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState("All");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "All") return true;
    if (activeTab === "Unread") return !notification.isRead;
    return notification.category === activeTab;
  });

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        {/* Top Header */}
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
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-xs transition hover:bg-stone-50 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <CheckCheck className="h-3.5 w-3.5 text-stone-500" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Navigation Filter Tabs Bar */}
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
                    <span
                      className={`ml-0.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isActive
                          ? "bg-red-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className={`group relative flex items-start justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs transition-all hover:border-stone-300 hover:shadow-xs ${
                    !item.isRead ? "bg-white" : "bg-white/90"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Category Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform ${item.iconBg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Notification Content */}
                    <div>
                      <h3 className="text-sm font-semibold text-stone-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-stone-600 leading-relaxed max-w-2xl">
                        {item.description}
                      </p>
                      <span className="mt-1.5 block text-[11px] font-medium text-stone-400">
                        {item.time}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex shrink-0 items-center gap-2 pt-0.5">
                    {!item.isRead && (
                      <>
                        {/* Blue unread dot */}
                        <span className="h-2 w-2 rounded-full bg-blue-600" title="Unread" />

                        {/* Mark single as read button */}
                        <button
                          onClick={() => markAsRead(item.id)}
                          className="rounded p-1 text-stone-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    {/* Dismiss / Delete button */}
                    <button
                      onClick={() => dismissNotification(item.id)}
                      className="rounded p-1 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white px-4 py-16 text-center shadow-2xs">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-stone-800">
                No notifications found
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                There are no notifications in the "{activeTab}" category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
