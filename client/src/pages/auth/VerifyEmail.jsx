import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { ShieldCheck, Mail, Loader, CheckCircle2, RefreshCw, ArrowRight, KeyRound } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(queryEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Auto focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for 60 seconds resend cooldown
  useEffect(() => {
    let interval;
    if (timer > 0) {
      setCanResend(false);
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle single digit input change
  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input box
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle key down (Backspace and Arrow keys)
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle paste full 6-digit OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setOtp(digits);
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    } else {
      toast.error("Pasted text must be a 6-digit number");
    }
  };

  // Submit OTP Verification
  const handleVerify = async (e) => {
    e?.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      toast.error("Please enter complete 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/verify-otp", {
        email: email.trim(),
        otp: fullOtp,
      });

      toast.success(data.message || "Email verified successfully!");
      setVerifiedSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email address to resend OTP");
      return;
    }

    if (!canResend) return;

    setResendLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/resend-otp", {
        email: email.trim(),
      });

      toast.success(data.message || "A new 6-digit OTP has been sent to your email.");
      setTimer(60); // Reset 60 second timer
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 text-slate-100">
        
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30 ring-8 ring-indigo-600/10">
            {verifiedSuccess ? (
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            ) : (
              <KeyRound className="w-9 h-9 text-indigo-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {verifiedSuccess ? "Account Verified!" : "Enter Verification OTP"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {verifiedSuccess
              ? "Your email has been verified. Redirecting to login..."
              : "Enter the 6-digit verification code sent to your email address."}
          </p>
        </div>

        {verifiedSuccess ? (
          <div className="space-y-6 text-center pt-2">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-300 text-sm flex items-center justify-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Email verified successfully! You can log in immediately.</span>
            </div>
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30"
            >
              Go to Login Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            
            {/* Email Address Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* 6-Digit OTP Boxes */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
                6-Digit Verification OTP
              </label>
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-900 border border-slate-700 rounded-xl text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Verify OTP & Account
                </>
              )}
            </button>

            {/* Resend OTP Section */}
            <div className="text-center pt-2 border-t border-slate-700/60">
              <p className="text-xs text-slate-400 mb-2">Didn't receive the OTP email?</p>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                >
                  {resendLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" /> Resend OTP Code
                    </>
                  )}
                </button>
              ) : (
                <p className="text-xs font-medium text-slate-400">
                  Resend OTP in <span className="text-indigo-400 font-bold">{timer}s</span>
                </p>
              )}
            </div>

            {/* Back to Login link */}
            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
                ← Back to Sign In
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
