import { useState, useMemo } from 'react'
import { X, Package, IndianRupee, Calendar } from 'lucide-react'
import ApiService from '../../core/services/api.service'

const MODES = [
  {
    value: 'QUOTATION',
    label: 'Quotation',
    icon: '📋',
    desc: 'Buyers send price offers; you accept the best one.',
  },
  {
    value: 'AUCTION',
    label: 'Live Auction',
    icon: '🔨',
    desc: 'Real-time competitive bidding — highest bid wins.',
  },
  {
    value: 'TENDER',
    label: 'Sealed Tender',
    icon: '📁',
    desc: 'Sealed bids submitted by a deadline; you choose the winner.',
  },
]

const CreateListingModal = ({ scrap, onClose, onSuccess }) => {
  const [sellingMode, setSellingMode] = useState('QUOTATION')
  const [quantityKg, setQuantityKg] = useState(
    scrap?.availableQty ? String(scrap.availableQty) : ''
  )
  const [pricePerKg, setPricePerKg] = useState('')
  const [closesAt, setClosesAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // eslint-disable-next-line react-hooks/purity
  const minDate = useMemo(() => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16), [])

  if (!scrap) return null

  const maxQty = scrap.availableQty || 0
  const rawScrapId = scrap.rawRecord?.id || scrap.rawId

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const qty = parseFloat(quantityKg)
    if (!qty || qty <= 0) return setError('Enter a valid quantity.')
    if (qty > maxQty) return setError(`Quantity cannot exceed ${maxQty} kg available.`)
    if (!rawScrapId) return setError('Scrap record ID not found. Try refreshing.')

    const payload = {
      scrapRecordId: rawScrapId,
      sellingMode,
      quantityKg: qty,
    }
    if (pricePerKg) payload.expectedPricePerKg = parseFloat(pricePerKg)
    if (closesAt) payload.closesAt = new Date(closesAt).toISOString()

    setIsSubmitting(true)
    try {
      const createRes = await ApiService.createListing(payload)
      const listingId = createRes?.data?.data?.id
      if (!listingId) throw new Error('Listing created but ID not returned.')
      await ApiService.publishListing(listingId)
      onSuccess?.(`"${scrap.material}" listed as ${MODES.find(m => m.value === sellingMode)?.label}. Buyers can see it now.`)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create listing.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Create Listing to Sell</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{scrap.material} · {scrap.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrap Summary */}
        <div className="mx-6 mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-black text-sm">
            {scrap.material?.slice(0, 2).toUpperCase() || 'SC'}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">{scrap.material}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
              <span>Available: <strong className="text-gray-800">{maxQty.toLocaleString('en-IN')} kg</strong></span>
              <span>·</span>
              <span>Condition: <strong className="text-gray-800">{scrap.condition || 'N/A'}</strong></span>
              {scrap.location && <><span>·</span><span>{scrap.location}</span></>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">

          {/* Selling Mode */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Selling Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setSellingMode(mode.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    sellingMode === mode.value
                      ? 'border-amber-500 bg-amber-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-xl mb-1">{mode.icon}</div>
                  <div className={`text-xs font-bold ${sellingMode === mode.value ? 'text-amber-700' : 'text-gray-700'}`}>
                    {mode.label}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {MODES.find(m => m.value === sellingMode)?.desc}
            </p>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Quantity (kg)
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                min="1"
                max={maxQty}
                step="0.01"
                required
                placeholder={`Max ${maxQty.toLocaleString('en-IN')} kg`}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-gray-50"
              />
            </div>
          </div>

          {/* Expected Price */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              {sellingMode === 'AUCTION' ? 'Starting Bid' : 'Expected Price'} (₹/kg)
              <span className="font-normal text-gray-400 ml-1 normal-case">(optional)</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                min="0"
                step="0.01"
                placeholder="e.g. 45.00"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-gray-50"
              />
            </div>
          </div>

          {/* Closes At */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              {sellingMode === 'TENDER' ? 'Submission Deadline' : 'Listing Closes At'}
              <span className="font-normal text-gray-400 ml-1 normal-case">(optional)</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="datetime-local"
                value={closesAt}
                onChange={(e) => setClosesAt(e.target.value)}
                min={minDate}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-gray-50"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Publishing…
                </>
              ) : (
                'Create & Publish Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateListingModal
