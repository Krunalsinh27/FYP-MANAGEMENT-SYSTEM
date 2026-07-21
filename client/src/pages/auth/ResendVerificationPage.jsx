import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { Mail, Loader, ArrowLeft, CheckCircle2 } from "lucide-react";

const ResendVerificationPage = () => {
  const location = useLocation();
  const initialEmail = location.state?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/resend-verification", { email });
      toast.success(data.message || "Verification email sent successfully!");
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 text-slate-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-indigo-600/10">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Resend Verification Email</h1>
          <p className="text-slate-400 text-sm mt-1">
            Enter your registered email address and we will send you a new verification link.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-300 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Verification email sent! Please check your inbox (and spam folder) for the link.
              </span>
            </div>
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/30"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Sending Email...
                </>
              ) : (
                "Send Verification Email"
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-slate-400 hover:text-slate-200 transition-colors gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResendVerificationPage;
