import { useState } from "react";
import {
  Gavel,
  FileText,
  ShieldCheck,
  Truck,
  CheckCheck,
  Bell,
} from "lucide-react";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [isRead, setIsRead] = useState(false);

  const notifications = [
    {
      id: 1,
      type: "auction",
      title: "You were outbid on AUC-2290",
      description:
        "Copper Scrap (Millberry) — current bid ₹7,61,500.",
      time: "4 min ago",
      unread: true,
      category: "Auctions",
      icon: Gavel,
    },
    {
      id: 2,
      type: "quotation",
      title: "Quotation QTN-8841 received",
      description:
        "Verma Recycling offered ₹7,38,000 for 12.5 MT copper.",
      time: "38 min ago",
      unread: true,
      category: "All",
      icon: FileText,
    },
    {
      id: 3,
      type: "approval",
      title: "KYC approval pending",
      description:
        "Gujarat Brass Industries submitted GST and PAN documents.",
      time: "1 hr ago",
      unread: true,
      category: "Approvals",
      icon: ShieldCheck,
    },
    {
      id: 4,
      type: "order",
      title: "Order ORD-5519 dispatched",
      description:
        "52 MT Kraft Paper Waste left Nagpur Depot, ETA 30 Jul.",
      time: "3 hr ago",
      unread: false,
      category: "All",
      icon: Truck,
    },
    {
      id: 5,
      type: "settled",
      title: "Auction AUC-2288 settled",
      description:
        "₹5,46,000 credited against E-Waste PCB Assorted.",
      time: "Yesterday",
      unread: false,
      category: "Auctions",
      icon: CheckCheck,
    },
  ];

  const tabs = ["All", "Unread (3)", "Auctions", "Approvals"];

  const getFilteredNotifications = () => {
    if (activeTab === "All") return notifications;

    if (activeTab === "Unread (3)") {
      return notifications.filter((notification) => notification.unread);
    }

    return notifications.filter(
      (notification) => notification.category === activeTab
    );
  };

  const filteredNotifications = getFilteredNotifications();

  const markAllAsRead = () => {
    setIsRead(true);
  };

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
          <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Everything happening across your listings, auctions and orders.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
        >
          Mark all as read
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-white font-medium text-slate-800 shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Inbox */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-medium text-slate-800">Inbox</h2>
        </div>

        <div>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              const showUnreadDot = notification.unread && !isRead;

              return (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 border-b border-slate-200 px-4 py-4 last:border-b-0 sm:items-center"
                >
                  {/* Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-500" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-800">
                      {notification.title}
                    </h3>

                    <p className="mt-0.5 text-sm text-slate-500">
                      {notification.description}
                    </p>
                  </div>

                  {/* Time + unread dot */}
                  <div className="ml-1 flex shrink-0 flex-col items-end gap-2 sm:ml-4 sm:flex-row sm:items-center">
                    <span className="whitespace-nowrap text-xs text-slate-500">
                      {notification.time}
                    </span>

                    {showUnreadDot && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <Bell className="mb-3 h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">
                No notifications found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                There are no notifications in this category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom information box */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <Bell className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

        <p className="text-sm text-slate-500">
          Configure delivery channels (email, SMS, webhook) in{" "}
          <span className="font-medium text-slate-600">
            Settings → Notifications.
          </span>
        </p>
      </div>
    </div>
  );
};

export default Notifications;