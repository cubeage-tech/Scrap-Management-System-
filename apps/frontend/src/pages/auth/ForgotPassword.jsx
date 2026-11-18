import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Recycle, CheckCircle2 } from "lucide-react";
import RoutePath from "../../core/constants/routes.constant";
import ApiService from "../../core/services/api.service";

const inputStyle =
  "h-12 w-full rounded-xl border border-border bg-surface-muted px-4 text-sm outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-blue-100";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await ApiService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid lg:grid-cols-2">

        {/* Left panel */}
        <div className="relative hidden min-h-[600px] bg-brand p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-3 text-brand">
              <Recycle size={25} />
            </div>
            <div>
              <h1 className="text-xl font-bold">SmartScrap AI</h1>
              <p className="text-xs text-blue-100">Industrial Scrap Marketplace</p>
            </div>
          </div>

          <div className="max-w-md">
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs">
              ACCOUNT RECOVERY
            </span>
            <h2 className="mt-6 text-5xl font-bold leading-tight">
              Forgot<br />your<br />password?
            </h2>
            <p className="mt-5 leading-7 text-blue-100">
              No worries. Enter your registered email and we'll send you a link to reset your password.
            </p>
          </div>

          <p className="text-xs text-blue-200">© 2026 SmartScrap AI. All rights reserved.</p>
        </div>

        {/* Right panel */}
        <div className="flex min-h-[600px] items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">

            {sent ? (
              <div className="text-center space-y-5">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Check your inbox</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    If <strong>{email}</strong> is registered, a password reset link has been sent.
                    The link expires in 1 hour.
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Don't see it? Check your spam folder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(RoutePath.LOGIN)}
                  className="w-full h-12 rounded-xl bg-brand-accent font-bold text-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Back to Login <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="text-sm text-brand font-semibold hover:underline"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <p className="text-sm font-bold text-brand">ACCOUNT RECOVERY</p>
                  <h2 className="mt-2 text-3xl font-bold text-foreground">Reset password</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Enter your registered email address and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`${inputStyle} pl-11`}
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="!flex !h-12 !w-full !items-center !justify-center !rounded-xl !bg-brand-accent !font-bold !text-foreground gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                    {!loading && <ArrowRight size={18} />}
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    Remembered it?{" "}
                    <button
                      type="button"
                      onClick={() => navigate(RoutePath.LOGIN)}
                      className="font-bold text-brand"
                    >
                      Back to Login
                    </button>
                  </p>
                </form>
              </>
            )}

          </div>
        </div>

      </div>
    </main>
  );
};

export default ForgotPassword;
