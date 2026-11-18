import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Clock, Loader2, RefreshCw, AlertCircle,
  CreditCard, Truck, Package, Tag, ChevronDown, ChevronUp,
} from 'lucide-react'
import ApiService from '../../core/services/api.service'
import RoutePath from '../../core/constants/routes.constant'

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCcy = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—'
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

// ── Pipeline step config ──────────────────────────────────────────────────────

const STEPS = [
  { key: 'payment',   label: 'Payment',           icon: CreditCard },
  { key: 'transfer',  label: 'Scrap Transfer',     icon: Truck      },
  { key: 'inventory', label: 'Inventory Import',   icon: Package    },
  { key: 'listing',   label: 'Create Listing',     icon: Tag        },
]

const stepStatus = (award) => ({
  payment:   award.paymentStatus === 'SUCCESS' ? 'done' : award.paymentStatus === 'PROCESSING' ? 'active' : 'pending',
  transfer:  award.transferStatus === 'COMPLETED' ? 'done' : award.paymentStatus === 'SUCCESS' ? 'active' : 'locked',
  inventory: award.inventoryRecord ? 'done' : award.transferStatus === 'COMPLETED' ? 'active' : 'locked',
  listing:   award.inventoryRecord ? 'active' : 'locked',
})

const StepDot = ({ status }) => {
  if (status === 'done')    return <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-white" /></div>
  if (status === 'active')  return <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0"><div className="w-2.5 h-2.5 rounded-full bg-white" /></div>
  return <div className="w-7 h-7 rounded-full border-2 border-gray-200 bg-gray-50 shrink-0" />
}

// ── Transfer confirm dialog ───────────────────────────────────────────────────

const TransferDialog = ({ award, onClose, onConfirm, loading }) => {
  const [qty, setQty]     = useState(String(award.quantityKg))
  const [notes, setNotes] = useState('')

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-bold text-lg text-gray-900">Confirm Physical Transfer</h3>
        <p className="text-sm text-gray-500">
          Record the actual quantity of scrap received at your facility.
        </p>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Quantity Received (kg)</label>
          <input
            type="number" value={qty} onChange={(e) => setQty(e.target.value)}
            min="0.01" max={Number(award.quantityKg)} step="0.01"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
          <p className="text-xs text-gray-400 mt-1">Awarded: {Number(award.quantityKg).toLocaleString('en-IN')} kg</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Notes (optional)</label>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            placeholder="e.g. material condition on arrival, transport details..."
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={() => onConfirm({ transferQtyKg: qty, transferNotes: notes })} disabled={loading || !qty}
            className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            Confirm Transfer
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Award Card ────────────────────────────────────────────────────────────────

const AwardCard = ({ award, onRefresh }) => {
  const navigate  = useNavigate()
  const [expanded, setExpanded]       = useState(false)
  const [busy, setBusy]               = useState(null)
  const [transferOpen, setTransferOpen] = useState(false)
  const [toast, setToast]             = useState('')

  const steps = stepStatus(award)
  const tender = award.tender || {}
  const scrap  = tender.scrapRecord || {}
  const cat    = scrap.category?.name || '—'

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000) }

  const act = useCallback(async (key, fn) => {
    setBusy(key)
    try {
      await fn()
      onRefresh()
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Action failed.')
    } finally {
      setBusy(null)
    }
  }, [onRefresh])

  const handlePay = () => act('pay', () => ApiService.initiateAwardPayment(tender.id))
  const handleVerify = () => act('verify', () => ApiService.verifyAwardPayment(tender.id))
  const handleTransfer = (data) => act('transfer', async () => {
    await ApiService.confirmAwardTransfer(tender.id, data)
    setTransferOpen(false)
  })
  const handleImport = () => act('import', () => ApiService.importAwardToInventory(tender.id))
  const handleCreateListing = () => navigate(RoutePath.DEALER_SCRAP_INVENTORY)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400">{tender.ref}</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-700 uppercase">Awarded</span>
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600">{cat}</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 truncate">{tender.title || cat + ' Scrap'}</h3>
          <div className="text-xs text-gray-500 mt-0.5">
            Seller: <strong className="text-gray-700">{tender.owner?.companyName}</strong>
            &nbsp;·&nbsp;{Number(award.quantityKg).toLocaleString('en-IN')} kg
            &nbsp;·&nbsp;Awarded {fmtDate(award.awardedAt)}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xl font-black text-gray-900">{fmtCcy(award.finalTotalValue)}</div>
          <div className="text-xs text-gray-400">{fmtCcy(award.finalPricePerKg)}/kg</div>
        </div>

        <button onClick={() => setExpanded(v => !v)}
          className="shrink-0 p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Pipeline strip */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {STEPS.map((s, i) => {
            const st = steps[s.key]
            return (
              <div key={s.key} className="flex items-center gap-1 shrink-0">
                <div className="flex items-center gap-1.5">
                  <StepDot status={st} />
                  <span className={`text-xs font-semibold whitespace-nowrap ${
                    st === 'done' ? 'text-emerald-700' : st === 'active' ? 'text-amber-700' : 'text-gray-400'
                  }`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className="w-6 h-0.5 bg-gray-200 shrink-0 mx-1" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Expanded detail + actions */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 p-5 space-y-5">

          {/* ── Step 1: Payment ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-bold text-gray-800">Payment</span>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                award.paymentStatus === 'SUCCESS'    ? 'bg-emerald-100 text-emerald-700' :
                award.paymentStatus === 'PROCESSING' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {award.paymentStatus === 'SUCCESS' ? 'Paid' : award.paymentStatus === 'PROCESSING' ? 'Processing' : 'Pending'}
              </span>
            </div>
            <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
              <div><span className="text-gray-400">Amount Due</span><div className="font-semibold text-gray-900 mt-0.5">{fmtCcy(award.finalTotalValue)}</div></div>
              <div><span className="text-gray-400">Deadline</span><div className="font-semibold text-gray-900 mt-0.5">{fmtDate(award.paymentDeadline)}</div></div>
              {award.paidAt && <div><span className="text-gray-400">Paid On</span><div className="font-semibold text-emerald-700 mt-0.5">{fmtDate(award.paidAt)}</div></div>}
            </div>

            {award.paymentStatus === 'PENDING' && (
              <button onClick={handlePay} disabled={!!busy}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                {busy === 'pay' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Pay Now — {fmtCcy(award.finalTotalValue)}
              </button>
            )}
            {award.paymentStatus === 'PROCESSING' && (
              <button onClick={handleVerify} disabled={!!busy}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                {busy === 'verify' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirm Payment
              </button>
            )}
          </div>

          {/* ── Step 2: Transfer ── */}
          <div className={`rounded-xl border bg-white p-4 space-y-3 ${award.paymentStatus !== 'SUCCESS' ? 'opacity-50 pointer-events-none' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-bold text-gray-800">Scrap Transfer</span>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                award.transferStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {award.transferStatus === 'COMPLETED' ? 'Completed' : 'Pending'}
              </span>
            </div>
            {award.transferStatus === 'COMPLETED' ? (
              <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                <div><span className="text-gray-400">Quantity Received</span><div className="font-semibold text-gray-900 mt-0.5">{Number(award.transferQtyKg).toLocaleString('en-IN')} kg</div></div>
                <div><span className="text-gray-400">Transfer Date</span><div className="font-semibold text-gray-900 mt-0.5">{fmtDate(award.transferDate)}</div></div>
                {award.transferNotes && <div className="col-span-2"><span className="text-gray-400">Notes</span><div className="font-medium text-gray-700 mt-0.5">{award.transferNotes}</div></div>}
              </div>
            ) : (
              <button onClick={() => setTransferOpen(true)} disabled={!!busy}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                <Truck className="w-4 h-4" /> Confirm Transfer Received
              </button>
            )}
          </div>

          {/* ── Step 3: Inventory ── */}
          <div className={`rounded-xl border bg-white p-4 space-y-3 ${award.transferStatus !== 'COMPLETED' ? 'opacity-50 pointer-events-none' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-bold text-gray-800">Inventory Import</span>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                award.inventoryRecord ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {award.inventoryRecord ? 'Imported' : 'Not Imported'}
              </span>
            </div>
            {award.inventoryRecord ? (
              <div className="text-xs text-gray-600">
                <span className="text-gray-400">Inventory ID </span>
                <span className="font-mono font-semibold text-gray-800">{award.inventoryRecord.id.slice(0, 8).toUpperCase()}</span>
                &nbsp;·&nbsp;
                <span className="font-semibold text-gray-800">{Number(award.inventoryRecord.availableQuantityKg).toLocaleString('en-IN')} kg available</span>
              </div>
            ) : (
              <button onClick={handleImport} disabled={!!busy}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                {busy === 'import' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                Add to My Inventory
              </button>
            )}
          </div>

          {/* ── Step 4: Create Listing ── */}
          <div className={`rounded-xl border bg-white p-4 space-y-3 ${!award.inventoryRecord ? 'opacity-50 pointer-events-none' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-bold text-gray-800">Resale Listing</span>
            </div>
            <p className="text-xs text-gray-500">
              Scrap is in your inventory. Go to <strong>Scrap Inventory</strong> and use the <em>"Sell / Create Listing"</em> action to list it for buyers.
            </p>
            <button onClick={handleCreateListing} disabled={!award.inventoryRecord}
              className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
              <Tag className="w-4 h-4" /> Go to Scrap Inventory
            </button>
          </div>

          {/* Toast */}
          {toast && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />{toast}
            </div>
          )}
        </div>
      )}

      {/* Transfer dialog */}
      {transferOpen && (
        <TransferDialog
          award={award}
          onClose={() => setTransferOpen(false)}
          onConfirm={handleTransfer}
          loading={busy === 'transfer'}
        />
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DealerTenderAwards() {
  const [awards, setAwards]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await ApiService.getMyTenderAwards()
      setAwards(res?.data?.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load awards.')
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  return (
    <div className="min-h-screen bg-[#faf8f5] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tender Awards</h1>
            <p className="text-sm text-gray-500 mt-0.5">Pay · Receive scrap · Import inventory · Resell</p>
          </div>
          <button onClick={load} disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats */}
        {awards.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Awards',  val: awards.length,                                                       color: 'text-gray-900' },
              { label: 'Pending Pay',   val: awards.filter(a => a.paymentStatus === 'PENDING').length,            color: 'text-amber-600' },
              { label: 'Paid',          val: awards.filter(a => a.paymentStatus === 'SUCCESS').length,            color: 'text-emerald-600' },
              { label: 'In Inventory',  val: awards.filter(a => a.inventoryRecord).length,                        color: 'text-blue-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <div className={`text-xl font-black ${s.color}`}>{s.val}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading awards…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />{error}
          </div>
        )}

        {!loading && !error && awards.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-800">No tender awards yet</h3>
            <p className="text-xs text-gray-500 mt-1">When a tender is awarded to you, it will appear here.</p>
          </div>
        )}

        {!loading && awards.map(award => (
          <AwardCard key={award.id} award={award} onRefresh={load} />
        ))}
      </div>
    </div>
  )
}
