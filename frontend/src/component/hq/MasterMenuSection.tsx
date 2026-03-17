import { useEffect, useState } from "react";
import { createMasterMenuItem, fetchMasterMenu } from "../../api/masterMenu";

interface MenuItem {
  id: number;
  name: string;
  basePrice: number;
  sku: string;
}

const LIMIT = 10;

export default function MasterMenuSection({
  onGoToOutletAssignment,
}: {
  onGoToOutletAssignment: () => void;
}) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: "", price: "" });

  const getMenuData = async (targetPage: number) => {
    setLoading(true);
    try {
      const res = await fetchMasterMenu(targetPage, LIMIT);
      setItems(res.items);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError("Failed to load menu. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMenuData(page);
  }, [page]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); // Real devs use form events
    const { name, price } = formData;

    const parsedPrice = parseFloat(price);
    if (!name.trim() || isNaN(parsedPrice)) return;

    setSubmitting(true);
    setError(null);

    try {
      await createMasterMenuItem(name.trim(), parsedPrice);

      setFormData({ name: "", price: "" });

      if (page !== 1) {
        setPage(1);
      } else {
        getMenuData(1);
      }
    } catch (err) {
      setError("Could not save item. Try a different name?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="p-6 bg-white border rounded-2xl border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Master Menu</h2>
          <p className="text-sm text-slate-500">
            Manage global items and base pricing.
          </p>
        </div>
        <button
          onClick={onGoToOutletAssignment}
          className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-slate-50 transition-colors"
        >
          Outlet Assignment
        </button>
      </div>

      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 md:grid-cols-[1fr,120px,auto] gap-3 mb-8"
      >
        <input
          placeholder="Item name (e.g. Espresso)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-slate-200 outline-none"
        />
        <input
          placeholder="Price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-slate-200 outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-black disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Item"}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 rounded-md border border-red-100">
          {error}
        </div>
      )}

      <div className="overflow-hidden border border-slate-200 rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">SKU</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-10 text-center text-slate-400">
                  Loading items...
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">${item.basePrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                    {item.sku}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-10 text-center text-slate-400">
                  No menu items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <p className="text-xs text-slate-500">
          Showing page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-xs font-medium border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs font-medium border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
