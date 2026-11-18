import { useState } from "react";
import {
  Mail, Phone, MapPin, Clock, ArrowRight, CheckCircle2,
  MessageSquare, Building2, Factory, Users, ShoppingCart, Send,
} from "lucide-react";

const contactDetails = [
  {
    icon: Mail,
    label: "Email Us",
    value: "support@smartscrap.ai",
    sub: "Replies within 24 hours",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 98765 43210",
    sub: "Mon–Sat, 9 AM – 6 PM IST",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "Mumbai, Maharashtra",
    sub: "400 001, India",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Clock,
    label: "Business Hours",
    value: "Mon – Sat",
    sub: "9:00 AM – 6:00 PM IST",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const roles = [
  { value: "industry", label: "Industry / Manufacturer", icon: Factory },
  { value: "dealer",   label: "Scrap Dealer",            icon: Users },
  { value: "buyer",    label: "Buyer / Recycler",        icon: ShoppingCart },
  { value: "other",    label: "Other",                   icon: Building2 },
];

const Contact = () => {
  const [form, setForm] = useState({
    name: "", email: "", company: "", role: "", subject: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  };

  return (
    <div className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--brand-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--brand-foreground) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-accent text-sm font-semibold mb-6">
            <MessageSquare className="w-4 h-4" /> Get In Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How can we help?
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Whether you're an industry looking to sell scrap, a dealer sourcing
            material, or a buyer finding competitive prices — our team is ready
            to support you.
          </p>
        </div>
      </section>

      {/* ── Contact detail cards ─────────────────────────────────────────── */}
      <section className="bg-slate-50 py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactDetails.map(({ icon: Icon, label, value, sub, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-slate-800">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + sidebar ───────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12">

            {/* Left sidebar */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <p className="text-xs font-bold text-brand uppercase tracking-wider mb-2">Contact</p>
                <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
                  Send us a message
                </h2>
                <p className="text-slate-500 leading-relaxed">
                  Tell us about your business and what you're looking to
                  achieve. Our team will get back to you within one business
                  day.
                </p>
              </div>

              {/* Role selector info */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Which best describes you?</p>
                {roles.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange("role", value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      form.role === value
                        ? "border-brand bg-blue-50 text-brand"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Trust signals */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
                {[
                  "All enquiries answered within 24 hours",
                  "Your data is protected and never sold",
                  "Dedicated account manager for enterprise",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message received!</h3>
                  <p className="text-slate-600 max-w-sm">
                    Thank you for reaching out. Our team will review your message and
                    respond within one business day.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", company: "", role: "", subject: "", message: "" }); }}
                    className="mt-6 px-5 py-2.5 text-sm font-semibold text-brand border border-brand rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6"
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Rajesh Mehta"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors ${
                          errors.name ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                        }`}
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Work Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="rajesh@company.com"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors ${
                          errors.email ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                        }`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        placeholder="Acme Industries Pvt Ltd"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        placeholder="e.g. Tender module enquiry"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Describe your requirement, how much scrap you're managing, your current process, and anything else that helps us help you faster…"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-none ${
                        errors.message ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                      }`}
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand hover:bg-brand/90 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 shadow-md"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>

                  <p className="text-xs text-center text-slate-400">
                    By submitting this form you agree to our privacy policy. We will never share your data.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="bg-brand py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Already know you want to get started?
          </h2>
          <p className="text-blue-200 mb-8">
            Create your free account and access the platform immediately.
            No credit card required.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-accent hover:bg-brand-accent/90 text-foreground font-bold rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Contact;
