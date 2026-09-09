// Buyer quotation submission - same as dealer but for buyers
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Package, IndianRupee, Calendar, FileText, Loader2, ArrowLeft } from "lucide-react";
import ApiService from "../../core/services/api.service";

const SubmitQuotation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("listingId");

  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    pricePerKg: "",
    quantityKg: "",
    paymentTerms: "DAYS_7",
    note: "",
    validUntil: "",
  });

  useEffect(() => {
    if (listingId) {
      loadListing();
    } else {
      alert("No listing ID provided");
      navigate("/buyer/marketplace");
    }
  }, [listingId]);

  const loadListing = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.getListingById(listingId);

      if (response?.data?.success) {
        const listingData = response.data.data;
        setListing(listingData);
        setFormData((prev) => ({
          ...prev,
          quantityKg: listingData.quantityKg,
          pricePerKg: listingData.expectedPricePerKg || "",
        }));
      }
    } catch (error) {
      console.error("Failed to load listing:", error);
      alert("Failed to load listing details");
      navigate("/buyer/marketplace");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotal = () => {
    const price = parseFloat(formData.pricePerKg) || 0;
    const quantity = parseFloat(formData.quantityKg) || 0;
    return price * quantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pricePerKg || !formData.quantityKg) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        listingId: listingId,
        pricePerKg: parseFloat(formData.pricePerKg),
        quantityKg: parseFloat(formData.quantityKg),
        paymentTerms: formData.paymentTerms,
        note: formData.note || null,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
      };

      const response = await ApiService.createQuotation(payload);


      if (response?.data?.success) {
        alert("Quotation submitted successfully!");
        navigate("/buyer/quotations");
      }
    } catch (error) {
      console.error("Failed to submit quotation:", error);
      alert(error.response?.data?.message || "Failed to submit quotation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading listing details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600">Listing not found</p>
        <button
          onClick={() => navigate("/buyer/marketplace")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/buyer/marketplace")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Quotation</h1>
        <p className="text-gray-600 text-sm">Make your offer for this scrap from dealer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Listing Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Listing Details</h3>

            {/* Material */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Material</p>
              <p className="font-semibold text-gray-900">
                {listing.scrapRecord?.category?.name || "Scrap Material"}
              </p>
              {listing.scrapRecord?.description && (
                <p className="text-sm text-gray-600 mt-1">{listing.scrapRecord.description}</p>
              )}
            </div>

            {/* Seller */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Seller</p>
              <span className="inline-block px-2 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-md">
                Dealer
              </span>
            </div>

            {/* Available Quantity */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Available Quantity</p>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <p className="font-semibold text-gray-900">{listing.quantityKg} kg</p>
              </div>
            </div>

            {/* Expected Price */}
            {listing.expectedPricePerKg && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Expected Price</p>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-gray-400" />
                  <p className="font-semibold text-gray-900">
                    {formatPrice(listing.expectedPricePerKg)}/kg
                  </p>
                </div>
              </div>
            )}

            {/* Selling Mode */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Selling Mode</p>
              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-md">
                {listing.sellingMode}
              </span>
            </div>

            {/* Closes At */}
            {listing.closesAt && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Closes On</p>
                <p className="text-sm text-gray-700">
                  {new Date(listing.closesAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quotation Form - Same as dealer */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Your Quotation</h3>

            <div className="space-y-6">
              {/* Price Per Kg */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Offered Price per kg <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="pricePerKg"
                    value={formData.pricePerKg}
                    onChange={handleChange}
                    required
                    min="1"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your offered price per kg"
                  />
                </div>
                {listing.expectedPricePerKg && formData.pricePerKg && (
                  <p
                    className={`text-xs mt-1 ${
                      parseFloat(formData.pricePerKg) >= listing.expectedPricePerKg
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {parseFloat(formData.pricePerKg) >= listing.expectedPricePerKg
                      ? "✓ Above expected price"
                      : "⚠ Below expected price"}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Required (kg) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="quantityKg"
                    value={formData.quantityKg}
                    onChange={handleChange}
                    required
                    min="1"
                    max={listing.quantityKg}
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quantity"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum available: {listing.quantityKg} kg
                </p>
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <select
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADVANCE">Advance Payment</option>
                  <option value="ON_PICKUP">Payment on Pickup</option>
                  <option value="DAYS_7">7 Days Credit</option>
                  <option value="DAYS_15">15 Days Credit</option>
                  <option value="DAYS_30">30 Days Credit</option>
                  <option value="DAYS_45">45 Days Credit</option>
                </select>
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note to Seller (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any additional information (pickup arrangements, special requirements, etc.)"
                  />
                </div>
              </div>

              {/* Total Calculation */}
              {formData.pricePerKg && formData.quantityKg && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Quotation Value</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPrice(calculateTotal())}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{formData.pricePerKg}/kg × {formData.quantityKg} kg</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/buyer/marketplace")}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quotation"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitQuotation;
