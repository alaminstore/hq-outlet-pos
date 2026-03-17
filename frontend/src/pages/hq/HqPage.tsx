import { useNavigate, useLocation } from "react-router-dom";
import MasterMenuSection from "../../component/hq/MasterMenuSection";
import OutletAssignmentSection from "../../component/hq/OutletAssignmentSection";

function HqPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const section: "master" | "outlet" =
    location.pathname === "/hq/outlet-assignment" ? "outlet" : "master";

  const handleLogout = () => {
    localStorage.removeItem("identity");
    window.dispatchEvent(new Event("identity:changed"));
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                HQ Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-600">Signed in as HQ.</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Logout
            </button>
          </div>
        </div>

        {section === "master" ? (
          <MasterMenuSection
            onGoToOutletAssignment={() => navigate("/hq/outlet-assignment")}
          />
        ) : (
          <OutletAssignmentSection onBackToMasterMenu={() => navigate("/hq")} />
        )}
      </div>
    </div>
  );
}

export default HqPage;
