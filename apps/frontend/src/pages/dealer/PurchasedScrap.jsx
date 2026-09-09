import React, { useState, useEffect, useMemo } from 'react'
import ApiService from '../../core/services/api.service'

// Custom Resilient Image Component with Styled Fallback Badge
const ScrapImage = ({ src, alt, category, shortCode }) => {
  const [hasError, setHasError] = useState(false)

  const categoryStyles = {
    Steel: 'bg-slate-800 text-slate-100 border-slate-700',
    Copper: 'bg-amber-900 text-amber-100 border-amber-800',
    Aluminium: 'bg-zinc-700 text-zinc-100 border-zinc-600',
    'Electronic Waste': 'bg-teal-900 text-teal-100 border-teal-800',
    Plastic: 'bg-stone-700 text-stone-100 border-stone-600'
  }

  const badgeStyle = categoryStyles[category] || 'bg-amber-900 text-amber-100 border-amber-800'

  if (hasError || !src) {
    return (
      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl border flex flex-col items-center justify-center shrink-0 shadow-xs select-none ${badgeStyle}`}>
        <svg className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span className="text-[9px] sm:text-[10px] font-black tracking-wider">{shortCode || "SC"}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border border-gray-200 shrink-0 shadow-2xs"
    />
  )
}

const PurchasedScrap = () => {
  const [purchases, setPurchases] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCards, setExpandedCards] = useState({})

  useEffect(() => {
    loadPurchases()
  }, [])

  const loadPurchases = async () => {
    setIsLoading(true)
    try {
      const res = await ApiService.getQuotations()
      if (res?.data?.success && res.data.data) {
        const mapped = res.data.data.map((q) => {
          const listing = q.listing || {}
          const scrap = listing.scrapRecord || {}
          const catName = scrap.category?.name || "Steel"
          const totalVal = Number(q.pricePerKg || 0) * Number(q.quantityKg || 0)
          
          let pStatus = "Completed"
          if (q.status === "SUBMITTED" || q.status === "PENDING") pStatus = "Pending"
          else if (q.status === "REJECTED" || q.status === "WITHDRAWN" || q.status === "EXPIRED") pStatus = "Cancelled"

          return {
            id: q.id.slice(0, 8).toUpperCase(),
            rawId: q.id,
            status: pStatus,
            type: listing.sellingMode || "Quotation",
            paymentStatus: q.status === "ACCEPTED" ? "Payment: Paid" : "Payment: Pending",
            title: scrap.description || catName + " Scrap",
            weight: `${(Number(q.quantityKg || 0) / 1000).toFixed(1)} MT`,
            rate: `₹${Number(q.pricePerKg || 0).toLocaleString("en-IN")}/kg`,
            seller: scrap.owner?.companyName || "Industry Supplier",
            location: scrap.locationLabel || "Industrial Area",
            category: catName,
            sellerRating: 4.8,
            date: new Date(q.createdAt).toISOString().slice(0, 10),
            invoice: `INV-${q.id.slice(0, 6).toUpperCase()}`,
            totalPaid: `₹${totalVal.toLocaleString("en-IN")}`,
            totalValNum: totalVal,
            weightNumMT: Number(q.quantityKg || 0) / 1000,
            rating: 5,
            currentStep: q.status === "ACCEPTED" ? 4 : 1,
            transporter: "Express Logistics",
            vehicle: "MH-12-AB-1234",
            handover: q.status === "ACCEPTED" ? "Done" : "Pending",
            notes: q.note || "Order placed via SmartScrap platform.",
            image: (scrap.images && scrap.images[0]) ? scrap.images[0].url : "",
            shortCode: catName.slice(0, 2).toUpperCase()
          }
        })
        setPurchases(mapped)
      }
    } catch (err) {
      console.error("Error loading purchases:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDetails = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const totalCount = purchases.length
  const completedCount = purchases.filter((p) => p.status === 'Completed').length
  const pendingCount = purchases.filter((p) => p.status === 'Pending').length
  const cancelledCount = purchases.filter((p) => p.status === 'Cancelled').length
  
  const totalSpentVal = purchases.reduce((sum, p) => sum + (p.totalValNum || 0), 0)
  const totalVolumeVal = purchases.reduce((sum, p) => sum + (p.weightNumMT || 0), 0)
  const totalSpentFormatted = `₹${totalSpentVal.toLocaleString('en-IN')}`
  const totalVolumeFormatted = `${totalVolumeVal.toFixed(1)} MT`


  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {
      const matchesFilter =
        activeFilter === 'All' || item.status.toLowerCase() === activeFilter.toLowerCase()

      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.seller.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)

      return matchesFilter && matchesSearch
    })
  }, [purchases, activeFilter, searchQuery])

  const handleExport = () => {
    const csvHeader = 'Purchase ID,Status,Title,Weight,Rate,Seller,Location,Date,Invoice,Total Paid\n'
    const csvRows = filteredPurchases
      .map(
        (p) =>
          `"${p.id}","${p.status}","${p.title}","${p.weight}","${p.rate}","${p.seller}","${p.location}","${p.date}","${p.invoice}","${p.totalPaid}"`
      )
      .join('\n')

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Purchase_History_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadInvoice = (invoiceNo, title) => {
    alert(`Downloading invoice ${invoiceNo} for ${title}...`)
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-800 p-3 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header Title Section */}
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Purchase History</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">All purchases with transport and payment details</p>
        </div>

        {/* Stats Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-2xs">
            <div className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900">{totalCount}</div>
            <div className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5">Total Purchases</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-2xs">
            <div className="text-lg sm:text-xl lg:text-2xl font-extrabold text-emerald-600">{completedCount}</div>
            <div className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5">Completed</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-2xs">
            <div className="text-lg sm:text-xl lg:text-2xl font-extrabold text-amber-600">{pendingCount}</div>
            <div className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5">Pending</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-2xs">
            <div className="text-lg sm:text-xl lg:text-2xl font-extrabold text-rose-700">{cancelledCount}</div>
            <div className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5">Cancelled</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-2xs">
            <div className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#78350f]">{totalSpentFormatted}</div>
            <div className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5">Total Spent</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-2xs">
            <div className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900">{totalVolumeFormatted}</div>
            <div className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5">Total Volume</div>
          </div>
        </div>

        {/* Filter, Search & Export Responsive Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72 lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by material, ID, or seller..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Tabs (Horizontal Scrollable on Mobile) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['All', 'Completed', 'Pending', 'Cancelled'].map((tab) => {
                const isActive = activeFilter === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#6c432b] text-white shadow-2xs'
                        : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>

        {/* Purchase Items List */}
        <div className="space-y-3.5 sm:space-y-4">
          {filteredPurchases.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">No purchases found</h3>
              <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or filter options.</p>
            </div>
          ) : (
            filteredPurchases.map((item) => {
              const isExpanded = !!expandedCards[item.id]

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden transition-all"
                >
                  {/* Card Header */}
                  <div className="p-3.5 sm:p-5">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 sm:gap-4">
                      
                      {/* Left Thumbnail & Metadata */}
                      <div className="flex items-start gap-2.5 sm:gap-3.5 w-full md:w-auto">
                        <ScrapImage
                          src={item.image}
                          alt={item.title}
                          category={item.category}
                          shortCode={item.shortCode}
                        />

                        <div className="space-y-1 min-w-0 flex-1">
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                            <span className="text-[10px] sm:text-[11px] font-mono text-gray-500 font-semibold">{item.id}</span>
                            
                            <span
                              className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-medium rounded-full ${
                                item.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {item.status}
                            </span>

                            <span
                              className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-medium rounded-full ${
                                item.type === 'Auction'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                  : item.type === 'Quotation'
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                  : 'bg-purple-50 text-purple-600 border border-purple-100'
                              }`}
                            >
                              {item.type}
                            </span>

                            <span
                              className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-medium rounded-full ${
                                item.paymentStatus.includes('Paid')
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.paymentStatus.includes('Pending')
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.paymentStatus}
                            </span>
                          </div>

                          {/* Title */}
                          <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug truncate">
                            {item.title}
                          </h2>

                          {/* Metadata */}
                          <div className="text-xs text-gray-600 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                            <span>{item.weight}</span>
                            <span>·</span>
                            <span>{item.rate}</span>
                            <span>·</span>
                            <span className="truncate">Seller: <strong className="font-semibold text-gray-800">{item.seller}</strong></span>
                            <span className="hidden sm:inline">·</span>
                            <span className="hidden sm:inline">{item.location}</span>
                          </div>

                          {/* Date & Invoice */}
                          <div className="text-[10px] sm:text-[11px] text-gray-400">
                            Date: {item.date} · Invoice: {item.invoice}
                          </div>
                        </div>
                      </div>

                      {/* Right Amount & Actions */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto border-t md:border-t-0 pt-2.5 md:pt-0 border-gray-100 gap-2 md:gap-1">
                        <div className="text-left md:text-right">
                          <div className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 tracking-tight">
                            {item.totalPaid}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-gray-400 md:-mt-1 font-medium">Total paid</div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Rating Stars on Tablet/Desktop */}
                          {item.rating > 0 && (
                            <div className="flex items-center gap-0.5 md:mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                                    star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                                  }`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          )}

                          {/* Details Button */}
                          <button
                            onClick={() => toggleDetails(item.id)}
                            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-1 transition-colors cursor-pointer select-none"
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                            Details
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Tracker Bar (Scrollable on small mobile) */}
                    <div className="mt-4 pt-3.5 border-t border-gray-100 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                      <div className="flex items-center justify-between min-w-[340px] sm:min-w-0 max-w-xl">
                        {[
                          { step: 1, label: 'Ordered' },
                          { step: 2, label: 'Payment' },
                          { step: 3, label: 'Pickup' },
                          { step: 4, label: 'Received' }
                        ].map((s, idx) => {
                          const isDone = item.currentStep >= s.step
                          const isLast = idx === 3

                          return (
                            <React.Fragment key={s.step}>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {isDone ? (
                                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-100 border border-gray-300 text-gray-500 text-[9px] sm:text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {s.step}
                                  </div>
                                )}
                                <span className={`text-[11px] sm:text-xs font-semibold ${isDone ? 'text-emerald-700' : 'text-gray-400'}`}>
                                  {s.label}
                                </span>
                              </div>

                              {!isLast && (
                                <div className="flex-1 h-0.5 mx-1.5 sm:mx-2 bg-gray-200">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      item.currentStep > s.step ? 'bg-emerald-500' : 'bg-transparent'
                                    }`}
                                  />
                                </div>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details Drawer (Responsive Grid) */}
                  {isExpanded && (
                    <div className="bg-gray-50/70 border-t border-gray-100 p-3.5 sm:p-5 text-xs text-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {/* Column 1: SELLER INFO */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          SELLER INFO
                        </div>
                        <div className="font-bold text-gray-900 text-sm">{item.seller}</div>
                        <div className="text-gray-500">{item.location}</div>
                        <div className="text-gray-600">
                          Category: <span className="font-medium text-gray-800">{item.category}</span>
                        </div>
                        {item.sellerRating && (
                          <div className="text-gray-600 flex items-center gap-1 mt-1">
                            <span>Seller Rating:</span>
                            <span className="font-semibold text-gray-800">⭐ {item.sellerRating}</span>
                          </div>
                        )}
                      </div>

                      {/* Column 2: TRANSPORT */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          TRANSPORT
                        </div>
                        <div className="text-gray-600">
                          Transporter: <span className="font-medium text-gray-800">{item.transporter}</span>
                        </div>
                        <div className="text-gray-600">
                          Vehicle: <span className="font-medium text-gray-800">{item.vehicle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-gray-600">Handover:</span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              item.handover === 'Done'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.handover === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {item.handover}
                          </span>
                        </div>
                      </div>

                      {/* Column 3: YOUR NOTES */}
                      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          YOUR NOTES
                        </div>
                        <p className="text-gray-700 leading-relaxed bg-white p-2.5 rounded-lg border border-gray-200/60 shadow-2xs">
                          {item.notes}
                        </p>
                        
                        {/* Download Invoice Button */}
                        {item.status === 'Completed' && (
                          <button
                            onClick={() => handleDownloadInvoice(item.invoice, item.title)}
                            className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs mt-2"
                          >
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V7.5L14.5 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Download Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}

export default PurchasedScrap