import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Recycle,
} from "lucide-react";

import Button from "../../components/common/Button";
import { login as loginRequest } from "../../core/services/auth.service";
import { useAuth } from "../../core/hooks/useAuth";
import {
  ROLE_HOME_ROUTE,
  default as RoutePath,
} from "../../core/constants/routes.constant";

const inputStyle =
  "h-12 w-full rounded-xl border border-border bg-surface-muted px-4 text-sm outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-blue-100";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, token } = await loginRequest(form);
      loginUser({ user, token });
      navigate(ROLE_HOME_ROUTE[user.role]);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid lg:grid-cols-2">

        {/* Left */}
        <div className="relative hidden min-h-[600px] bg-brand p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-3 text-brand">
              <Recycle size={25} />
            </div>
            <div>
              <h1 className="text-xl font-bold">SmartScrap AI</h1>
              <p className="text-xs text-blue-100">
                Industrial Scrap Marketplace
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs">
              SMART INDUSTRIAL SCRAP PLATFORM
            </span>

            <h2 className="mt-6 text-5xl font-bold leading-tight">
              Connect.
              <br />
              Trade.
              <br />
              Grow.
            </h2>

            <p className="mt-5 leading-7 text-blue-100">
              A smarter marketplace connecting industries,
              dealers and buyers for efficient scrap trading.
            </p>
          </div>

          <p className="text-xs text-blue-200">
            © 2026 SmartScrap AI. All rights reserved.
          </p>
        </div>

        {/* Right */}
        <div className="flex min-h-[600px] items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <p className="text-sm font-bold text-brand">
                WELCOME BACK
              </p>
              <h2 className="mt-2 text-3xl font-bold text-foreground">
                Login to your account
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Enter your credentials to access SmartScrap.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={`${inputStyle} pl-11`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex justify-between">
                  <label className="text-sm font-semibold">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate(RoutePath.FORGOT_PASSWORD)}
                    className="text-xs font-semibold text-brand"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className={`${inputStyle} pl-11 pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="!flex !h-12 !w-full !items-center !justify-center !rounded-xl !bg-brand-accent !font-bold !text-foreground"
              >
                {loading ? "Logging in..." : "Login"}
                {!loading && <ArrowRight size={18} className="ml-2" />}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate(RoutePath.SIGNUP)}
                  className="font-bold text-brand"
                >
                  Create Account
                </button>
              </p>

            </form>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Login;