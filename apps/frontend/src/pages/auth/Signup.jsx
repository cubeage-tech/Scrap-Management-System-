import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Recycle,
  UserRound,
} from "lucide-react";

import Button from "../../components/common/Button";
import { signup as signupRequest } from "../../core/services/auth.service";
import RoutePath from "../../core/constants/routes.constant";
import { USER_ROLES } from "../../core/constants/app.constant";

const INITIAL_FORM = {
  role: USER_ROLES.INDUSTRY,
  companyName: "",
  gstNumber: "",
  contactName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const inputStyle =
  "h-11 w-full rounded-lg border border-border bg-surface-muted px-4 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-blue-100";

/* Reusable input field */
const Field = ({
  label,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  className = "",
  value,
  onChange,
  required = true,
}) => (
  <div className={className}>
    {label && (
      <label className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}
      </label>
    )}

    <div className="relative">
      {Icon && (
        <Icon
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
      )}

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`${inputStyle} ${Icon ? "pl-10" : ""}`}
      />
    </div>
  </div>
);

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await signupRequest(form);
      navigate(RoutePath.LOGIN);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-7">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl">

        {/* Header */}
        <header className="border-b border-gray-100 px-6 py-4 sm:px-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand/10 p-2.5 text-brand">
              <Recycle size={24} />
            </div>

            <div>
              <h1 className="font-bold text-brand">
                SmartScrap AI
              </h1>

              <p className="text-xs text-gray-500">
                Industrial Scrap Marketplace
              </p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[0.75fr_1.25fr]">

          {/* Left Section */}
          <section className="hidden bg-brand p-10 text-white lg:flex lg:flex-col lg:justify-center">

            <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-xs font-semibold">
              JOIN SMARTSCRAP AI
            </span>

            <h2 className="mt-6 text-4xl font-bold leading-tight">
              Grow your business with smarter scrap trading.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-6 text-blue-100">
              Connect with industries, dealers and buyers through one trusted
              industrial scrap marketplace.
            </p>

            <div className="mt-9 space-y-5">

              <div className="flex gap-3">
                <Building2 size={20} />

                <div>
                  <p className="font-semibold">
                    Business Marketplace
                  </p>

                  <p className="text-xs text-blue-100">
                    Buy and sell industrial scrap.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Recycle size={20} />

                <div>
                  <p className="font-semibold">
                    Smart Scrap Trading
                  </p>

                  <p className="text-xs text-blue-100">
                    Manage your scrap transactions.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <UserRound size={20} />

                <div>
                  <p className="font-semibold">
                    Trusted Connections
                  </p>

                  <p className="text-xs text-blue-100">
                    Connect with relevant businesses.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* Form Section */}
          <section className="p-6 sm:p-9">
            <div className="mx-auto max-w-2xl">

              <div className="mb-6">
                <p className="text-sm font-bold text-brand">
                  GET STARTED
                </p>

                <h2 className="mt-1 text-3xl font-bold text-foreground">
                  Create your account
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter your business details to get started.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Business Type */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">
                    Business Type
                  </label>

                  <div className="relative">
                    <Building2
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className={`${inputStyle} cursor-pointer appearance-none pl-10 pr-10`}
                    >
                      <option value={USER_ROLES.INDUSTRY}>
                        Industry
                      </option>

                      <option value={USER_ROLES.DEALER}>
                        Dealer
                      </option>

                      <option value={USER_ROLES.BUYER}>
                        Buyer
                      </option>
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h3 className="mb-3 font-bold text-foreground">
                    Business Information
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <Field
                      label="Company Name"
                      name="companyName"
                      placeholder="Company name"
                      icon={Building2}
                      className="sm:col-span-2"
                      value={form.companyName}
                      onChange={handleChange}
                    />

                    <Field
                      label="GST Number"
                      name="gstNumber"
                      placeholder="GST number"
                      value={form.gstNumber}
                      onChange={handleChange}
                      required={false}
                    />

                    <Field
                      label="Contact Person"
                      name="contactName"
                      placeholder="Contact person"
                      icon={UserRound}
                      value={form.contactName}
                      onChange={handleChange}
                    />

                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="mb-3 font-bold text-foreground">
                    Contact Information
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <Field
                      label="Mobile Number"
                      name="phone"
                      type="tel"
                      placeholder="Mobile number"
                      icon={Phone}
                      value={form.phone}
                      onChange={handleChange}
                    />

                    <Field
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="Email address"
                      icon={Mail}
                      value={form.email}
                      onChange={handleChange}
                    />

                  </div>
                </div>

                {/* Account Security */}
                <div>
                  <h3 className="mb-3 font-bold text-foreground">
                    Account Security
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">

                    {/* Password */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold">
                        Password
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={17}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Create password"
                          value={form.password}
                          onChange={handleChange}
                          required
                          className={`${inputStyle} pl-10 pr-10`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold">
                        Confirm Password
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={17}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type={showConfirm ? "text" : "password"}
                          name="confirmPassword"
                          placeholder="Confirm password"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          required
                          className={`${inputStyle} pl-10 pr-10`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirm((prev) => !prev)
                          }
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showConfirm ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Business Location */}
                <div>
                  <h3 className="mb-3 font-bold text-foreground">
                    Business Location
                  </h3>

                  <div className="space-y-4">

                    <div className="relative">
                      <MapPin
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-4 text-gray-400"
                      />

                      <textarea
                        name="address"
                        placeholder="Complete business address"
                        rows="2"
                        value={form.address}
                        onChange={handleChange}
                        className={`${inputStyle} h-auto resize-none py-3 pl-10`}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">

                      <Field
                        name="city"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                        required={false}
                      />

                      <Field
                        name="state"
                        placeholder="State"
                        value={form.state}
                        onChange={handleChange}
                        required={false}
                      />

                      <Field
                        name="pincode"
                        placeholder="Pincode"
                        value={form.pincode}
                        onChange={handleChange}
                        required={false}
                      />

                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="!flex !h-12 !w-full !items-center !justify-center !rounded-xl !bg-brand-accent !font-bold !text-foreground hover:!bg-brand-accent/90"
                >
                  {loading ? "Creating Account..." : "Create Account"}

                  {!loading && (
                    <ArrowRight size={18} className="ml-2" />
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}

                  <button
                    type="button"
                    onClick={() => navigate(RoutePath.LOGIN)}
                    className="font-bold text-brand"
                  >
                    Login
                  </button>
                </p>

              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Signup;