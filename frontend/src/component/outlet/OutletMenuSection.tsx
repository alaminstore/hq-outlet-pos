import { useEffect, useState, useMemo, useCallback } from "react";
import {
  fetchOutletMenuConfigs,
  type OutletMenuConfigItem,
} from "../../api/outletMenuConfigs";
import { createSale } from "../../api/sales";

interface Props {
  outletId?: number;
}

const ITEMS_PER_PAGE = 10;

function useMenuData(
  outletId: number | undefined,
  page: number,
  triggerRefresh: number,
) {
  const [data, setData] = useState<{
    items: OutletMenuConfigItem[];
    total: number;
  }>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!outletId) return;

    let isMounted = true;
    setIsLoading(true);

    fetchOutletMenuConfigs(outletId, page, ITEMS_PER_PAGE)
      .then((res) => {
        if (isMounted) setData({ items: res.items, total: res.total_pages });
      })
      .catch(() => {
        if (isMounted) setFetchError("Failed to sync menu data.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [outletId, page, triggerRefresh]);

  return { ...data, isLoading, fetchError };
}

export default function OutletMenuSection({ outletId }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [cart, setCart] = useState<Record<number, number>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const { items, total, isLoading, fetchError } = useMenuData(
    outletId,
    currentPage,
    refreshNonce,
  );

  const selectedCount = useMemo(
    () => Object.values(cart).filter((q) => q > 0).length,
    [cart],
  );

  const updateCartQuantity = useCallback(
    (id: number, val: number, stock: number) => {
      const amount = Math.max(0, Math.min(stock, val));
      setCart((prev) => ({ ...prev, [id]: amount }));
      setStatusMsg(null);
    },
    [],
  );

  const handleToggleRow = (id: number, stock: number, isChecked: boolean) => {
    updateCartQuantity(id, isChecked ? 1 : 0, stock);
  };

  const submitOrder = async () => {
    if (!outletId) return;

    const orderPayload = items
      .filter((item) => cart[item.id] > 0)
      .map((item) => ({
        menu_item_id: item.menu_item_id,
        quantity: cart[item.id],
      }));

    if (orderPayload.length === 0) {
      setStatusMsg({ type: "error", text: "Please select at least one item." });
      return;
    }

    setIsSubmitting(true);
    try {
      const sale = await createSale(outletId, orderPayload);
      setStatusMsg({
        type: "success",
        text: `Order has been placed successfully. Your Receipt Number: #${sale.receipt_number}`,
      });

      setCart({});
      setRefreshNonce((prev) => prev + 1);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Connection error. Try again.";
      setStatusMsg({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!outletId)
    return <div className="p-6 text-slate-500">No outlet selected.</div>;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Store Catalog</h2>
          <p className="text-sm text-slate-500">
            Manage inventory and process new sales.
          </p>
        </div>

        <button
          onClick={submitOrder}
          disabled={selectedCount === 0 || isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {isSubmitting ? "Processing..." : `Place Order (${selectedCount})`}
        </button>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="w-12 p-4 text-center">#</th>
              <th className="px-4 py-3 text-left">Item Details</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-center">Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  Loading catalog...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No items available.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const qty = cart[item.id] ?? 0;
                const inStock = item.stock_level > 0;

                return (
                  <tr
                    key={item.id}
                    className={qty > 0 ? "bg-indigo-50/30" : ""}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        disabled={!inStock}
                        checked={qty > 0}
                        onChange={(e) =>
                          handleToggleRow(
                            item.id,
                            item.stock_level,
                            e.target.checked,
                          )
                        }
                        className="rounded border-slate-300 accent-indigo-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        SKU: {item.sku}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {Number(item.outlet_price).toFixed(2)} BDT
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${inStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                      >
                        {item.stock_level} unit(s)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.id,
                              qty - 1,
                              item.stock_level,
                            )
                          }
                          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center border"
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-bold">{qty}</span>
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.id,
                              qty + 1,
                              item.stock_level,
                            )
                          }
                          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center border"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <footer className="mt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 uppercase tracking-wider">
            Page {currentPage} of {total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-1.5 border rounded-md text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Back
            </button>
            <button
              disabled={currentPage >= total || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-1.5 border rounded-md text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {(statusMsg || fetchError) && (
          <div
            className={`p-3 rounded-lg text-sm text-center border ${
              statusMsg?.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-rose-50 border-rose-100 text-rose-800"
            }`}
          >
            {statusMsg?.text || fetchError}
          </div>
        )}
      </footer>
    </section>
  );
}
