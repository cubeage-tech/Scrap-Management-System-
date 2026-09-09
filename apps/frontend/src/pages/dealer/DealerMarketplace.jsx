import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, MapPin, IndianRupee, Clock, Loader2, ShoppingCart } from "lucide-react";
import ApiService from "../../core/services/api.service";

const DealerMarketplace = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sellingMode, setSellingMode] = useState("all");

  useEffect(() => {
    loadListings();
  }, [selectedCategory, sellingMode]);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const params = {
        status: "PUBLISHED",
      };

      if (selectedCategory !== "all") {
        params.categoryId = selectedCategory;
      }

      if (sellingMode !== "all") {
        params.sellingMode = sellingMode;
      }

      const response = await ApiService.getListings(params);

      
      if (response?.data?.success) {
        setListings(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load marketplace listings:", error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    const query = searchQuery.toLowerCase();
    return (
      query === "" ||
      listing.scrapRecord?.category?.name?.toLowerCase().includes(query) ||
      listing.scrapRecord?.description?.toLowerCase().includes(query)
    );
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getSellingModeBadge = (mode) => {
    const badges = {
      QUOTATION: { bg: "bg-blue-50", text: "text-blue-600", label: "Quotation" },
      AUCTION: { bg: "bg-red-50", text: "text-red-600", label: "Auction" },
      TENDER: { bg: "bg-purple-50", text: "text-purple-600", label: "Tender" },
    };
    const badge = badges[mode] || badges.QUOTATION;
    return (
      <span className={`${badge.bg} ${badge.text} px-2 py-1 rounded-md text-xs font-medium`}>
        {badge.label}
      </span>
    );
  };

  const handleMakeOffer = (listing) => {
    // Navigate to quotation submission page
    navigate(`/dealer/submit-quotation?listingId=${listing.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Scrap Marketplace
        </h1>
        <p className="text-gray-600 text-sm">
          Browse and purchase scrap from verified industries
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Selling Mode Filter */}
          <div>
            <select
              value={sellingMode}
              onChange={(e) => setSellingMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Modes</option>
              <option value="QUOTATION">Quotation</option>
              <option value="AUCTION">Auction</option>
              <option value="TENDER">Tender</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {/* Add dynamic categories here */}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
              <p className="text-xs text-gray-600">Active Listings</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {listings.filter((l) => l.sellingMode === "QUOTATION").length}
              </p>
              <p className="text-xs text-gray-600">Quotation Ready</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {listings.filter((l) => l.sellingMode === "AUCTION").length}
              </p>
              <p className="text-xs text-gray-600">Live Auctions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No listings found
            </h3>
            <p className="text-gray-600 text-sm">
              Try adjusting your filters or check back later for new listings
            </p>
          </div>
        ) : (
          filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Image Placeholder */}
              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                      {listing.scrapRecord?.category?.name || "Scrap Material"}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {listing.scrapRecord?.description || "No description"}
                    </p>
                  </div>
                  {getSellingModeBadge(listing.sellingMode)}
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold text-gray-900">
                      {listing.quantityKg} kg
                    </span>
                  </div>

                  {listing.expectedPricePerKg && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price/kg:</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(listing.expectedPricePerKg)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs">
                      {listing.scrapRecord?.locationLabel || "Location not specified"}
                    </span>
                  </div>

                  {listing.closesAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">
                        Closes: {new Date(listing.closesAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleMakeOffer(listing)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
                >
                  {listing.sellingMode === "QUOTATION"
                    ? "Submit Quotation"
                    : listing.sellingMode === "AUCTION"
                    ? "Place Bid"
                    : "Submit Tender"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quotation Modal */}
      {isQuotationModalOpen && selectedListing && (
        <QuotationModal
          listing={selectedListing}
          onClose={handleCloseModal}
          onSubmit={handleSubmitQuotation}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

// Quotation Submission Modal Component
const QuotationModal = ({ listing, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    pricePerKg: listing.expectedPricePerKg || "",
    quantityKg: listing.quantityKg || "",
    paymentTerms: "DAYS_7",
    note: "",
    validUntil: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.pricePerKg || formData.pricePerKg <= 0) {
      alert("Please enter a valid price per kg");
      return;
    }
    if (!formData.quantityKg || formData.quantityKg <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    if (parseFloat(formData.quantityKg) > listing.quantityKg) {
      alert(`Quantity cannot exceed available quantity (${listing.quantityKg} kg)`);
      return;
    }

    onSubmit(formData);
  };

  const totalValue = (parseFloat(formData.pricePerKg) || 0) * (parseFloat(formData.quantityKg) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Submit Quotation</h2>
            <p className="text-sm text-gray-600 mt-1">
              {listing.scrapRecord?.category?.name || "Scrap Material"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Listing Details */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Available Quantity</p>
              <p className="font-semibold text-gray-900">{listing.quantityKg} kg</p>
            </div>
            {listing.expectedPricePerKg && (
              <div>
                <p className="text-gray-600 mb-1">Expected Price/kg</p>
                <p className="font-semibold text-gray-900">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(listing.expectedPricePerKg)}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-600 mb-1">Location</p>
              <p className="font-semibold text-gray-900">
                {listing.scrapRecord?.locationLabel || "Not specified"}
              </p>
            </div>
            {listing.closesAt && (
              <div>
                <p className="text-gray-600 mb-1">Closes On</p>
                <p className="font-semibold text-gray-900">
                  {new Date(listing.closesAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Price per kg */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Offer Price (per kg) *
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                name="pricePerKg"
                value={formData.pricePerKg}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your offer price"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Expected: {listing.expectedPricePerKg ? `₹${listing.expectedPricePerKg.toLocaleString()}` : "Not set"}
            </p>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity Required (kg) *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                name="quantityKg"
                value={formData.quantityKg}
                onChange={handleChange}
                required
                min="1"
                max={listing.quantityKg}
                step="0.01"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Available: {listing.quantityKg} kg
            </p>
          </div>

          {/* Total Value (Calculated) */}
          {totalValue > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total Quotation Value</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(totalValue)}
              </p>
            </div>
          )}

          {/* Payment Terms */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Terms *
            </label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ADVANCE">Advance Payment</option>
              <option value="ON_PICKUP">Payment on Pickup</option>
              <option value="DAYS_15">15 Days Credit</option>
              <option value="DAYS_30">30 Days Credit</option>
              <option value="DAYS_45">45 Days Credit</option>
            </select>
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quotation Valid Until (Optional)
            </label>
            <input
              type="date"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Note to Seller */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Note to Seller (Optional)
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add any additional details about payment terms, pickup schedule, transport arrangements, etc."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Quotation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealerMarketplace;
