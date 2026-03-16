import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

type UserType = "hq" | "outlet";

type Identity = { author: "HQ" | "Outlet"; outlet_id?: number };

const LOGIN_ERRORS = {
  missingRole: "Please choose HQ or Outlet Operator.",
  invalidCode: "Please enter a 6 digit pass code.",
  incorrectCode: "Please provide correct pass code",
  generic: "Unable to login. Please try again.",
} as const;

function InitEnrollment() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelect = (type: UserType) => {
    setUserType(type);
    if (error) setError("");
  };

  const handleCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setCode(digitsOnly);
    if (error) setError("");
  };

  const handleSubmit = async () => {
    if (!userType) {
      setError(LOGIN_ERRORS.missingRole);
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError(LOGIN_ERRORS.invalidCode);
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(userType, code);

    if (!result.success) {
      setError(
        result.error === "INVALID_CREDENTIALS"
          ? LOGIN_ERRORS.incorrectCode
          : LOGIN_ERRORS.generic,
      );
      setLoading(false);
      return;
    }

    const identity: Identity =
      result.session.role === "hq"
        ? { author: "HQ" }
        : { author: "Outlet", outlet_id: result.session.outletId };

    localStorage.setItem("identity", JSON.stringify(identity));
    window.dispatchEvent(new Event("identity:changed"));
    navigate(identity.author === "HQ" ? "/hq" : "/outlet", {
      replace: true,
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/70 p-8">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-xl mb-4">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
              <polyline
                strokeLinecap="round"
                strokeLinejoin="round"
                points="9 22 9 12 15 12 15 22"
              />
            </svg>
          </div>
          <h1 className="text-lg font-medium text-slate-900 mb-1">
            HQ Outlet POS
          </h1>
          <p className="text-sm text-slate-500">Sign in to continue</p>
        </div>

        <div className="mb-5">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2.5">
            Select your role
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelect("hq")}
              className={`text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                userType === "hq"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
              }`}
            >
              <span
                className={`block text-xs mb-0.5 ${userType === "hq" ? "text-white/60" : "text-slate-400"}`}
              >
                Headquarters
              </span>
              HQ
            </button>
            <button
              type="button"
              onClick={() => handleSelect("outlet")}
              className={`text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                userType === "outlet"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
              }`}
            >
              <span
                className={`block text-xs mb-0.5 ${userType === "outlet" ? "text-white/60" : "text-slate-400"}`}
              >
                Branch access
              </span>
              Outlet
            </button>
          </div>
        </div>

        {userType && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                6-digit code
              </label>
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-base tracking-widest text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {code.length}/6
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || code.length < 6}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default InitEnrollment;
