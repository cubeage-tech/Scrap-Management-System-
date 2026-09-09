import { useState } from "react";
import {
  ChevronDown,
  Save,
  CheckCircle2,
  Laptop,
  Smartphone
} from "lucide-react";

const INDUSTRY_TYPES = [
  "Automobile",
  "Manufacturing",
  "Steel & Metals",
  "Electronics",
  "Chemical Processing",
  "Construction",
  "Textiles",
  "Rubber & Plastics",
  "Recycling & Waste Management",
  "Others"
];

const Settings = () => {
  // Active Tab state
  const [activeTab, setActiveTab] = useState("company"); // 'company' | 'notifications' | 'security'

  // Toast / Feedback message state
  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data State matching Figma reference
  const [companyProfile, setCompanyProfile] = useState({
    companyName: "Tata Precision Forgings Ltd.",
    gstin: "27AABCT1332L1ZT",
    industryType: "Automobile",
    registeredAddress: "Plot 42, MIDC Chakan Phase II, Pune, Maharashtra 410501",
    fullName: "Priya Nair",
    designation: "Head of Materials",
    email: "priya.nair@tpfl.co.in",
    phone: "+91 98220 41190"
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailBids: true,
    emailAuctions: true,
    emailQuotations: true,
    weeklyDigest: false,
    smsAlerts: true
  });

  // Security Form State
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setToastMessage("Settings updated successfully!");
      setTimeout(() => setToastMessage(null), 4000);
    }, 300);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-emerald-900 text-white px-5 py-3.5 rounded-xl shadow-xl border border-emerald-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <span>SmartScrap AI</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-700 font-semibold">Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organisation profile, users, roles and platform preferences.
          </p>
        </div>

        {/* Save Changes Button (Top Right) */}
        <div>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save changes
          </button>
        </div>
      </div>

      {/* Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === "company"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          Company profile
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === "notifications"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          Notifications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === "security"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          Security
        </button>
      </div>

      {/* TAB 1: Company profile */}
      {activeTab === "company" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Organisation Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Organisation
              </h2>
            </div>

            <div className="space-y-4">
              {/* Company name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={companyProfile.companyName}
                  onChange={handleCompanyChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs"
                  placeholder="Enter organisation name"
                />
              </div>

              {/* GSTIN & Industry type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    name="gstin"
                    value={companyProfile.gstin}
                    onChange={handleCompanyChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs"
                    placeholder="27AABCT1332L1ZT"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Industry type
                  </label>
                  <div className="relative">
                    <select
                      name="industryType"
                      value={companyProfile.industryType}
                      onChange={handleCompanyChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs pr-10 cursor-pointer"
                    >
                      {INDUSTRY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Registered address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registered address
                </label>
                <textarea
                  name="registeredAddress"
                  rows={3}
                  value={companyProfile.registeredAddress}
                  onChange={handleCompanyChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs resize-none"
                  placeholder="Enter full registered office address"
                />
              </div>
            </div>
          </div>

          {/* Primary contact Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Primary contact
              </h2>
            </div>

            <div className="space-y-4">
              {/* Full name & Designation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={companyProfile.fullName}
                    onChange={handleCompanyChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs"
                    placeholder="Primary contact name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={companyProfile.designation}
                    onChange={handleCompanyChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs"
                    placeholder="Job title / Designation"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={companyProfile.email}
                    onChange={handleCompanyChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs"
                    placeholder="email@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={companyProfile.phone}
                    onChange={handleCompanyChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Notifications */}
      {activeTab === "notifications" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 max-w-4xl">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Notification Preferences
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Choose how you want to be notified about bids, auction updates, and sales reports.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Toggle Item 1 */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">New Bid Alerts</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive instant notifications when dealers submit new bids on your scrap lots.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle("emailBids")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.emailBids ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    notifications.emailBids ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle Item 2 */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Auction Activity Updates</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Get notified when live scrap auctions start, receive top-bid alerts, or when auctions close.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle("emailAuctions")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.emailAuctions ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    notifications.emailAuctions ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle Item 3 */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Quotation Requests</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive alerts when verified buyers or dealers request rate quotations for custom lots.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle("emailQuotations")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.emailQuotations ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    notifications.emailQuotations ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle Item 4 */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">SMS Critical Alerts</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  SMS notifications sent to registered mobile number ({companyProfile.phone}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle("smsAlerts")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.smsAlerts ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    notifications.smsAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle Item 5 */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Weekly Performance Digest</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  A weekly summary email detailing total scrap liquidated, revenue earned, and top buyers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle("weeklyDigest")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.weeklyDigest ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    notifications.weeklyDigest ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Security */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Security / Password Form */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Change Password
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ensure your account is using a long, random password to stay secure.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={securityData.currentPassword}
                  onChange={handleSecurityChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs"
                  placeholder="••••••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={securityData.newPassword}
                  onChange={handleSecurityChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm new password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={securityData.confirmPassword}
                  onChange={handleSecurityChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs"
                  placeholder="Re-enter new password"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveChanges}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 rounded-xl transition cursor-pointer shadow-xs"
              >
                Update password
              </button>
            </div>
          </div>

          {/* Active Sessions & Security Badges */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Two-Factor Authentication
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Add an extra layer of security to your account.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                Enabled
              </span>
            </div>

            <div className="pt-2 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active Sessions
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Chrome on Windows 11</h4>
                      <p className="text-xs text-slate-500">Pune, India • Current session</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">SmartScrap Mobile App</h4>
                      <p className="text-xs text-slate-500">Mumbai, India • Active 3 hours ago</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage("Session revoked");
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Settings;
