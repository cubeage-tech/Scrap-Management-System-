import { useEffect, useState } from "react";

import MaterialTable from "../../components/common/MaterialTable";
import Loader from "../../components/common/Loader";
import { listingTableConfig } from "../../configs/tables/listingTable.config";
import { getListings, cancelListing } from "../../core/services/listing.service";
import CreateListingModal from "../../components/industry/listing/CreateListingModal";
import ViewListingModal from "../../components/industry/listing/ViewListingModal";

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [activeListing, setActiveListing] = useState(null);

  const [viewListingId, setViewListingId] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const body = await getListings({ mine: true });
      setListings(body.data || []);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setError(err.response?.data?.message || "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchListings);
  }, []);

  const openCreateModal = () => {
    setFormMode("create");
    setActiveListing(null);
    setIsFormOpen(true);
  };

  const openEditModal = (listing) => {
    setFormMode("edit");
    setActiveListing(listing);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    notify(formMode === "edit" ? "Listing updated successfully!" : "Listing created successfully!");
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-3 sm:p-5 lg:p-8 space-y-5 font-sans">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs shadow-xl flex items-center gap-2 border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400">
            SmartScrap AI &gt; <span className="text-slate-600 font-semibold">My Listings</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Listings</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Turn scrap from your inventory into marketplace listings.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs cursor-pointer"
        >
          + Create Listing
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold text-sm">Error loading listings</p>
          <p className="text-xs mt-1">{error}</p>
          <button
            type="button"
            onClick={fetchListings}
            className="mt-3 px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <MaterialTable
          config={listingTableConfig}
          data={listings}
          onView={(listing) => setViewListingId(listing.id)}
          onEdit={openEditModal}
          deleteData={(id) => cancelListing(id)}
          onDelete={() => {
            notify("Listing cancelled successfully!");
            fetchListings();
          }}
        />
      )}

      <CreateListingModal
        isOpen={isFormOpen}
        mode={formMode}
        listing={activeListing}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <ViewListingModal
        isOpen={viewListingId != null}
        listingId={viewListingId}
        onClose={() => setViewListingId(null)}
        onChanged={fetchListings}
      />
    </div>
  );
};

export default MyListings;
