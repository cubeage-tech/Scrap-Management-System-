import { useState, useEffect } from "react";
import {
  Check,
  X,
  Clock,
  Package,
  Building2,
  IndianRupee,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import ApiService from "../../core/services/api.service";
import { useNavigate } from "react-router-dom";

const DealerQuotation = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, SUBMITTED, ACCEPTED, REJECTED, WITHDRAWN
  const [isWithdrawing, setIsWithdrawing] = useState(false);

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

  const handleWithdraw = async (quotationId) => {
    if (!window.confirm("Withdraw this quotation? This action cannot be undone.")) {
      return;
    }

    setIsWithdrawing(true);
    try {
      const response = await ApiService.patch(`/marketplace/quotations/${quotationId}/withdraw`);

      if (response?.data?.success) {
        alert("Quotation withdrawn successfully");
        loadQuotations(); // Reload list
      }
    } catch (error) {
      console.error("Failed to withdraw quotation:", error);
      alert(error.response?.data?.message || "Failed to withdraw quotation");
    } finally {
      setIsWithdrawing(false);
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
      SUBMITTED: { bg: "bg-yellow-50", text: "text-yellow-600", label: "Pending", icon: Clock },
      ACCEPTED: { bg: "bg-green-50", text: "text-green-600", label: "Accepted", icon: Check },
      REJECTED: { bg: "bg-red-50", text: "text-red-600", label: "Rejected", icon: X },
      EXPIRED: { bg: "bg-gray-50", text: "text-gray-600", label: "Expired", icon: Clock },
      WITHDRAWN: { bg: "bg-gray-50", text: "text-gray-600", label: "Withdrawn", icon: X },
    };
    const badge = badges[status] || badges.SUBMITTED;
    const Icon = badge.icon;
    return (
      <span className={`${badge.bg} ${badge.text} px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const filteredQuotations = quotations.filter((q) => {
    if (filter === "all") return true;
    return q.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading your quotations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Quotations</h1>
        <p className="text-gray-600 text-sm">
          Track all quotations you've submitted to sellers
        </p>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dealer/marketplace")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
        >
          Browse Marketplace
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All Quotations" },
            { value: "SUBMITTED", label: "Pending" },
            { value: "ACCEPTED", label: "Accepted" },
            { value: "REJECTED", label: "Rejected" },
            { value: "WITHDRAWN", label: "Withdrawn" },
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
              <p className="text-xs text-gray-600">Pending</p>
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
              <p className="text-2xl font-bold text-gray-900">{quotations.length}</p>
              <p className="text-xs text-gray-600">Total Submitted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quotations List */}
      {filteredQuotations.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotations found</h3>
          <p className="text-gray-600 text-sm mb-4">
            {filter === "all"
              ? "You haven't submitted any quotations yet"
              : `No ${filter.toLowerCase()} quotations`}
          </p>
          <button
            onClick={() => navigate("/dealer/marketplace")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotations.map((quotation) => (
            <div
              key={quotation.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  {/* Left: Material Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">
                          {quotation.listing?.scrapRecord?.category?.name || "Scrap Material"}
                        </h3>
                        {quotation.listing?.scrapRecord?.description && (
                          <p className="text-xs text-gray-500">
                            {quotation.listing.scrapRecord.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status */}
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(quotation.status)}
                    <p className="text-xs text-gray-500">
                      Submitted {new Date(quotation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Quotation Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Your Offer</p>
                    <p className="font-semibold text-gray-900">{formatPrice(quotation.pricePerKg)}/kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Quantity</p>
                    <p className="font-semibold text-gray-900">{quotation.quantityKg} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Value</p>
                    <p className="font-semibold text-green-600">{formatPrice(quotation.totalValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Terms</p>
                    <p className="font-semibold text-gray-900">
                      {quotation.paymentTerms?.replace("_", " ") || "N/A"}
                    </p>
                  </div>
                  {quotation.validUntil && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Valid Until</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(quotation.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Note */}
                {quotation.note && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Your Note:</p>
                    <p className="text-sm text-gray-700">{quotation.note}</p>
                  </div>
                )}

                {/* Seller Info & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Seller: {quotation.listing?.scrapRecord?.owner?.companyName || "Unknown"}
                    </span>
                  </div>

                  {quotation.status === "SUBMITTED" && (
                    <button
                      onClick={() => handleWithdraw(quotation.id)}
                      disabled={isWithdrawing}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Withdraw
                    </button>
                  )}

                  {quotation.status === "ACCEPTED" && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      Offer Accepted!
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DealerQuotation;
