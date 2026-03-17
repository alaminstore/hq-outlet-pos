import { useNavigate } from "react-router-dom";
import type { Outlet } from "../../api/outlets";

type OutletPageProps = {
  outletId?: number;
  outlet?: Outlet;
};

function OutletPage({ outletId, outlet }: OutletPageProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("identity");
    window.dispatchEvent(new Event("identity:changed"));
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
          Signed in as Outlet. Outlet: {outlet?.name ?? "Unknown"}
          {outletId ? ` (ID: ${outletId})` : ""}
        </p>
      </div>
    </div>
  );
}

export default OutletPage;
