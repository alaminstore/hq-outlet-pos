import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import InitEnrollment from "../component/InitEnrollment";
import HqPage from "./hq/HqPage";
import OutletPage from "./outlet/OutletPage";

export type Identity = {
  author: "HQ" | "Outlet";
  outlet_id?: number;
};

function readIdentity(): Identity | null {
  const stored = localStorage.getItem("identity");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Identity;
    if (parsed?.author === "HQ" || parsed?.author === "Outlet") {
      return parsed;
    }
  } catch {
    localStorage.removeItem("identity");
  }

  return null;
}

function RequireIdentity({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const identity = readIdentity();

  if (!identity) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const identity = readIdentity();

  return (
    <Routes>
      <Route path="/" element={<InitEnrollment />} />
      <Route
        path="/hq"
        element={
          <RequireIdentity>
            {identity?.author === "HQ" ? <HqPage /> : <Navigate to="/outlet" replace />}
          </RequireIdentity>
        }
      />
      <Route
        path="/outlet"
        element={
          <RequireIdentity>
            {identity?.author === "Outlet" ? (
              <OutletPage outletId={identity.outlet_id} />
            ) : (
              <Navigate to="/hq" replace />
            )}
          </RequireIdentity>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
