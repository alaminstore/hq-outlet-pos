import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import InitEnrollment from "../component/InitEnrollment";
import AddOutletItemsPage from "../component/hq/AddOutletItemsPage";
import { fetchOutlets, type Outlet } from "../api/outlets";
import HqPage from "../pages/hq/HqPage";
import OutletPage from "../pages/outlet/OutletPage";

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

function RequireIdentity({
  children,
  identity,
}: {
  children: React.ReactNode;
  identity: Identity | null;
}) {
  const location = useLocation();

  if (!identity) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const [identity, setIdentity] = useState<Identity | null>(() =>
    readIdentity(),
  );
  const [outlet, setOutlet] = useState<Outlet | null>(null);

  useEffect(() => {
    const handleIdentityChange = () => {
      setIdentity(readIdentity());
    };

    window.addEventListener("identity:changed", handleIdentityChange);
    window.addEventListener("storage", handleIdentityChange);

    return () => {
      window.removeEventListener("identity:changed", handleIdentityChange);
      window.removeEventListener("storage", handleIdentityChange);
    };
  }, []);

  useEffect(() => {
    if (identity?.author !== "Outlet" || !identity.outlet_id) {
      setOutlet(null);
      return;
    }

    let isActive = true;
    fetchOutlets()
      .then((items) => {
        if (!isActive) return;
        const match =
          items.find((item) => item.id === identity.outlet_id) ?? null;
        setOutlet(match);
      })
      .catch(() => {
        if (!isActive) return;
        setOutlet(null);
      });

    return () => {
      isActive = false;
    };
  }, [identity?.author, identity?.outlet_id]);
  const defaultPath =
    identity?.author === "HQ"
      ? "/hq"
      : identity?.author === "Outlet"
        ? "/outlet"
        : null;

  return (
    <Routes>
      <Route
        path="/"
        element={
          defaultPath ? (
            <Navigate to={defaultPath} replace />
          ) : (
            <InitEnrollment />
          )
        }
      />
      <Route
        path="/hq"
        element={
          <RequireIdentity identity={identity}>
            {identity?.author === "HQ" ? (
              <HqPage />
            ) : (
              <Navigate to="/outlet" replace />
            )}
          </RequireIdentity>
        }
      />
      <Route
        path="/hq/outlet-assignment"
        element={
          <RequireIdentity identity={identity}>
            {identity?.author === "HQ" ? (
              <HqPage />
            ) : (
              <Navigate to="/outlet" replace />
            )}
          </RequireIdentity>
        }
      />
      <Route
        path="/hq/add-item"
        element={
          <RequireIdentity identity={identity}>
            {identity?.author === "HQ" ? (
              <AddOutletItemsPage />
            ) : (
              <Navigate to="/outlet" replace />
            )}
          </RequireIdentity>
        }
      />
      <Route
        path="/outlet"
        element={
          <RequireIdentity identity={identity}>
            {identity?.author === "Outlet" ? (
              <OutletPage outlet={outlet ?? undefined} />
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
