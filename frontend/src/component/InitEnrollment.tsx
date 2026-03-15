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

    if (!result.ok) {
      setError(
        result.reason === "unauthorized"
          ? LOGIN_ERRORS.incorrectCode
          : LOGIN_ERRORS.generic
      );
      setLoading(false);
      return;
    }

    const identity: Identity =
      result.data.author === "hq"
        ? { author: "HQ" }
        : { author: "Outlet", outlet_id: result.data.outlet_id };

    localStorage.setItem("identity", JSON.stringify(identity));
    navigate(identity.author === "HQ" ? "/hq" : "/outlet", {
      replace: true,
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-balance text-center text-2xl font-semibold tracking-tight">
          Welcome to the HQ outled pos
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Your identity: HQ or Outlet Operator
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSelect("hq")}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              userType === "hq"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            HQ
          </button>
          <button
            type="button"
            onClick={() => handleSelect("outlet")}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              userType === "outlet"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            Outlet Operator
          </button>
        </div>

        {userType && (
          <div className="mt-6 space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              6 digit code
              <input
                type="password"
                inputMode="numeric"
                value={code}
                onChange={(event) => handleCodeChange(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="Enter code"
              />
            </label>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Signing in..." : "Go"}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default InitEnrollment;
