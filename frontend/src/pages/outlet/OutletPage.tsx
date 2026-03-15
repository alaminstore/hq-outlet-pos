import { useNavigate } from "react-router-dom";

type OutletPageProps = {
  outletId?: number;
};

function OutletPage({ outletId }: OutletPageProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("identity");
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
          Signed in as Outlet. Outlet ID: {outletId ?? "-"}
        </p>
      </div>
    </div>
  );
}

export default OutletPage;
