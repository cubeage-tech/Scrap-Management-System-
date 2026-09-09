import { useState, useEffect } from "react";
import {
  Check,
  X,
  Clock,
  Package,
  Building2,
  IndianRupee,
  Star,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import ApiService from "../../core/services/api.service";

const Quotation = () => {
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, SUBMITTED, ACCEPTED, REJECTED
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.getQuotations();


      if (response?.data?.success) {
        setQuotations(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load quotations:", error);
      setQuotations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (quotationId) => {
    if (!window.confirm("Accept this quotation? This will reject all other offers for this listing.")) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await ApiService.patch(`/marketplace/quotations/${quotationId}/accept`);

      if (response?.data?.success) {
        alert("Quotation accepted successfully!");
        loadQuotations(); // Reload to see updated status
      }
    } catch (error) {
      console.error("Failed to accept quotation:", error);
      alert(error.response?.data?.message || "Failed to accept quotation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (quotationId) => {
    if (!window.confirm("Reject this quotation?")) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await ApiService.patch(`/marketplace/quotations/${quotationId}/reject`);

      if (response?.data?.success) {
        alert("Quotation rejected");
        loadQuotations();
      }
    } catch (error) {
      console.error("Failed to reject quotation:", error);
      alert(error.response?.data?.message || "Failed to reject quotation");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const badges = {
      SUBMITTED: { bg: "bg-yellow-50", text: "text-yellow-600", label: "Pending" },
      ACCEPTED: { bg: "bg-green-50", text: "text-green-600", label: "Accepted" },
      REJECTED: { bg: "bg-red-50", text: "text-red-600", label: "Rejected" },
      EXPIRED: { bg: "bg-gray-50", text: "text-gray-600", label: "Expired" },
      WITHDRAWN: { bg: "bg-gray-50", text: "text-gray-600", label: "Withdrawn" },
    };
    const badge = badges[status] || badges.SUBMITTED;
    return (
      <span className={`${badge.bg} ${badge.text} px-2.5 py-1 rounded-full text-xs font-medium`}>
        {badge.label}
      </span>
    );
  };

  const filteredQuotations = quotations.filter((q) => {
    if (filter === "all") return true;
    return q.status === filter;
  });

  // Group quotations by listing
  const quotationsByListing = filteredQuotations.reduce((acc, q) => {
    const listingId = q.listingId;
    if (!acc[listingId]) {
      acc[listingId] = {
        listing: q.listing,
        quotations: [],
      };
    }
    acc[listingId].quotations.push(q);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading quotations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Quotations Received
        </h1>
        <p className="text-gray-600 text-sm">
          Review and manage quotations from buyers and dealers
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All Quotations" },
            { value: "SUBMITTED", label: "Pending" },
            { value: "ACCEPTED", label: "Accepted" },
            { value: "REJECTED", label: "Rejected" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
              <span className="ml-2 text-xs opacity-75">
                ({quotations.filter((q) => f.value === "all" || q.status === f.value).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {quotations.filter((q) => q.status === "SUBMITTED").length}
              </p>
              <p className="text-xs text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {quotations.filter((q) => q.status === "ACCEPTED").length}
              </p>
              <p className="text-xs text-gray-600">Accepted</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {quotations.filter((q) => q.status === "REJECTED").length}
              </p>
              <p className="text-xs text-gray-600">Rejected</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(quotationsByListing).length}
              </p>
              <p className="text-xs text-gray-600">Active Listings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quotations List */}
      {Object.keys(quotationsByListing).length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No quotations found
          </h3>
          <p className="text-gray-600 text-sm">
            {filter === "all"
              ? "You haven't received any quotations yet"
              : `No ${filter.toLowerCase()} quotations`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(quotationsByListing).map(([listingId, data]) => (
            <div key={listingId} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Listing Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {data.listing?.scrapRecord?.category?.name || "Scrap Material"}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {data.listing?.quantityKg} kg
                      </span>
                      {data.listing?.expectedPricePerKg && (
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {formatPrice(data.listing.expectedPricePerKg)}/kg
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {data.quotations.length} offer{data.quotations.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Quotations for this listing */}
              <div className="divide-y divide-gray-100">
                {data.quotations
                  .sort((a, b) => b.pricePerKg - a.pricePerKg) // Highest price first
                  .map((quotation, index) => (
                    <div key={quotation.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Buyer Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {quotation.buyer?.companyName || "Unknown Buyer"}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {quotation.buyer?.contactName} • {quotation.buyer?.contactPhone}
                              </p>
                            </div>
                            {index === 0 && quotation.status === "SUBMITTED" && (
                              <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-medium rounded-full">
                                Highest Offer
                              </span>
                            )}
                          </div>

                          {/* Quotation Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Offered Price/kg</p>
                              <p className="font-semibold text-gray-900">
                                {formatPrice(quotation.pricePerKg)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Quantity</p>
                              <p className="font-semibold text-gray-900">{quotation.quantityKg} kg</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Total Value</p>
                              <p className="font-semibold text-green-600">
                                {formatPrice(quotation.totalValue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Payment Terms</p>
                              <p className="font-semibold text-gray-900">
                                {quotation.paymentTerms || "N/A"}
                              </p>
                            </div>
                          </div>

                          {quotation.note && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Note from buyer:</p>
                              <p className="text-sm text-gray-700">{quotation.note}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>
                              Submitted: {new Date(quotation.createdAt).toLocaleDateString()}
                            </span>
                            {quotation.validUntil && (
                              <span>
                                Valid until: {new Date(quotation.validUntil).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Status & Actions */}
                        <div className="flex flex-col items-end gap-3">
                          {getStatusBadge(quotation.status)}

                          {quotation.status === "SUBMITTED" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAccept(quotation.id)}
                                disabled={isProcessing}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleReject(quotation.id)}
                                disabled={isProcessing}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quotation;
