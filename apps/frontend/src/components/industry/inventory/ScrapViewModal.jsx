import { useEffect, useState } from "react";
import { X } from "lucide-react";

import StatusBadge from "../../common/StatusBadge";
import Loader from "../../common/Loader";
import { getScrapById } from "../../../core/services/scrap.service";
import { SCRAP_STATUS_VARIANTS, formatScrapDate } from "../../../configs/tables/stockInventoryTable.config";

const Field = ({ label, value }) => (
  <div>
    <span className="text-[11px] text-slate-400 font-semibold block uppercase">{label}</span>
    <span className="font-medium text-slate-800">{value ?? "—"}</span>
  </div>
);

const ScrapViewModal = ({ isOpen, scrapId, onClose }) => {
  const [scrap, setScrap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !scrapId) return;

    Promise.resolve().then(() => {
      setLoading(true);
      setError(null);
    });

    getScrapById(scrapId)
      .then((body) => setScrap(body.data))
      .catch((err) => {
        console.error("Failed to fetch scrap:", err);
        setError(err.response?.data?.message || "Failed to load scrap details.");
      })
      .finally(() => setLoading(false));
  }, [isOpen, scrapId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900">Scrap Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : error ? (
          <div className="py-6 text-sm text-red-600">{error}</div>
        ) : (
          scrap && (
            <div className="py-5 grid grid-cols-2 gap-4 text-sm">
              <Field label="Category" value={scrap.category?.name} />
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                  Status
                </span>
                <div className="mt-0.5">
                  <StatusBadge
                    label={scrap.status}
                    variant={SCRAP_STATUS_VARIANTS[scrap.status] || "neutral"}
                  />
                </div>
              </div>
              <Field label="Description" value={scrap.description} />
              <Field label="Condition" value={scrap.condition} />
              <Field label="Warehouse / Location" value={scrap.locationLabel} />
              <Field
                label="Total Quantity"
                value={scrap.totalQuantityKg != null ? `${scrap.totalQuantityKg} kg` : null}
              />
              <Field
                label="Available Quantity"
                value={scrap.availableQuantityKg != null ? `${scrap.availableQuantityKg} kg` : null}
              />
              <Field
                label="Listed Quantity"
                value={scrap.listedQuantityKg != null ? `${scrap.listedQuantityKg} kg` : null}
              />
              <Field
                label="Sold Quantity"
                value={scrap.soldQuantityKg != null ? `${scrap.soldQuantityKg} kg` : null}
              />
              <Field label="Created" value={formatScrapDate(scrap.createdAt)} />
              <Field label="Last Updated" value={formatScrapDate(scrap.updatedAt)} />
            </div>
          )
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScrapViewModal;
