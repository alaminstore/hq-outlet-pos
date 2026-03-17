import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Outlet } from "../../api/outlets";
import OutletMenuSection from "../../component/outlet/OutletMenuSection";

type OutletPageProps = {
  outlet?: Outlet;
};

const notifyIdentityChange = () => {
  window.dispatchEvent(new Event("identity:changed"));
};

const readOutletIdFromStorage = () => {
  const stored = localStorage.getItem("identity");
  if (!stored) return undefined;

  try {
    const parsed = JSON.parse(stored) as {
      author?: string;
      outlet_id?: number;
    };
    if (parsed?.author === "Outlet" && Number.isFinite(parsed.outlet_id)) {
      return parsed.outlet_id;
    }
  } catch {
    return undefined;
  }

  return undefined;
};

function OutletPage({ outlet }: OutletPageProps) {
  const navigate = useNavigate();
  const resolvedOutletId = useMemo(
    () => outlet?.id ?? readOutletIdFromStorage(),
    [outlet?.id],
  );
  const resolvedOutletName = outlet?.name ?? "-";

  const handleLogout = () => {
    localStorage.removeItem("identity");
    notifyIdentityChange();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              Outlet Dashboard
            </h1>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Logout
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Outlet: {resolvedOutletName}
          </p>
        </div>

        <OutletMenuSection outletId={resolvedOutletId} />
      </div>
    </div>
  );
}

export default OutletPage;
