import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Recycle, CheckCircle2, AlertCircle } from "lucide-react";
import RoutePath from "../../core/constants/routes.constant";
import ApiService from "../../core/services/api.service";

const inputStyle =
  "h-12 w-full rounded-xl border border-border bg-surface-muted px-4 text-sm outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-blue-100";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 text-center space-y-5">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Invalid Link</h2>
          <p className="text-sm text-gray-500">
            This password reset link is missing a token. Please request a new one.
          </p>
          <button
            type="button"
            onClick={() => navigate(RoutePath.FORGOT_PASSWORD)}
            className="w-full h-12 rounded-xl bg-brand-accent font-bold text-foreground flex items-center justify-center gap-2"
          >
            Request new link <ArrowRight size={18} />
          </button>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await ApiService.resetPassword(token, password);
      setDone(true);
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
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs">ACCOUNT RECOVERY</span>
            <h2 className="mt-6 text-5xl font-bold leading-tight">
              Choose<br />a new<br />password.
            </h2>
            <p className="mt-5 leading-7 text-blue-100">
              Your new password must be at least 6 characters. All existing sessions will be signed out.
            </p>
          </div>

          <p className="text-xs text-blue-200">© 2026 SmartScrap AI. All rights reserved.</p>
        </div>

        {/* Right panel */}
        <div className="flex min-h-[600px] items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">

            {done ? (
              <div className="text-center space-y-5">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Password updated!</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Your password has been reset. You can now log in with your new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(RoutePath.LOGIN)}
                  className="w-full h-12 rounded-xl bg-brand-accent font-bold text-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Go to Login <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <p className="text-sm font-bold text-brand">ACCOUNT RECOVERY</p>
                  <h2 className="mt-2 text-3xl font-bold text-foreground">Set new password</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Enter and confirm your new password below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New password */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold">New Password</label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPw ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`${inputStyle} pl-11 pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Confirm Password</label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showCf ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        className={`${inputStyle} pl-11 pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCf(!showCf)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showCf ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
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
                    {loading ? "Updating..." : "Reset Password"}
                    {!loading && <ArrowRight size={18} />}
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    <button
                      type="button"
                      onClick={() => navigate(RoutePath.FORGOT_PASSWORD)}
                      className="font-bold text-brand"
                    >
                      Request a new link
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

export default ResetPassword;
