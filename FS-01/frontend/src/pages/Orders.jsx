import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api, { errorMessage, rupees } from '../api/client.js';
import { payForOrder } from '../api/razorpay.js';
import { useAuth } from '../context/AuthContext.jsx';

const BADGE = {
  PLACED: 'bg-sky-50 text-sky-700 border-sky-200',
  PACKED: 'bg-amber-50 text-amber-700 border-amber-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

function ReviewForm({ productId }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      await api.post(`/products/${productId}/reviews`, {
        rating,
        comment: comment.trim() || undefined,
      });
      setMsg({ text: 'Review submitted. Thank you!', ok: true });
      setOpen(false);
    } catch (err) {
      setMsg({ text: errorMessage(err), ok: false });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-2 pt-2 border-t border-zinc-100">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Write a review
        </button>
      ) : (
        <div className="bg-zinc-50/80 p-3 rounded-xl border border-zinc-200/80 space-y-2 mt-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-600">Rating:</label>
            <div className="flex gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-base transition-transform active:scale-110 ${star <= rating ? 'text-amber-400' : 'text-zinc-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              placeholder="Write your feedback (optional)"
              maxLength={500}
              className="px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 flex-1"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex gap-1.5">
              <button
                disabled={submitting}
                onClick={submit}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200/60 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {msg.text && (
        <p className={`text-xs font-medium mt-1.5 ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState(null);
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [busyId, setBusyId] = useState(null);

  const load = () =>
    api
      .get('/orders')
      .then((r) => setOrders(r.data))
      .catch((e) => setNotice(errorMessage(e)));

  useEffect(() => {
    load();
  }, []);

  async function payNow(orderId) {
    setBusyId(orderId);
    try {
      const result = await payForOrder(orderId, user);
      setNotice(result === 'PAID' ? 'Payment successful!' : 'Payment was not completed.');
    } catch (err) {
      setNotice(errorMessage(err));
    }
    setBusyId(null);
    load();
  }

  async function cancel(orderId) {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setBusyId(orderId);
    try {
      await api.post('/payments/cancel', { orderId });
      setNotice('Order cancelled successfully.');
    } catch (err) {
      setNotice(errorMessage(err));
    }
    setBusyId(null);
    load();
  }

  async function downloadInvoice(orderId) {
    try {
      const res = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setNotice('Could not download the invoice. Please try again later.');
    }
  }

  /* Skeleton Loading State */
  if (!orders) {
    return (
      <div className="min-h-screen bg-zinc-50/50 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="h-8 w-36 bg-zinc-200 rounded-lg animate-pulse mb-6" />
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-zinc-200/80 rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-zinc-100 rounded w-1/3" />
                <div className="h-4 bg-zinc-100 rounded w-1/5" />
              </div>
              <div className="h-12 bg-zinc-50 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Page Title */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            My Orders
          </h1>
          <span className="text-xs font-semibold text-zinc-500">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </span>
        </div>

        {/* Global Notice Banner */}
        {notice && (
          <div className="p-4 bg-indigo-50/80 border border-indigo-100 text-indigo-900 text-sm font-medium rounded-xl flex items-start gap-2.5 shadow-xs">
            <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1">{notice}</span>
            <button onClick={() => setNotice('')} className="text-indigo-400 hover:text-indigo-700">
              ×
            </button>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-zinc-900">No orders placed yet</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              When you purchase items on the store, your purchase history and order tracking will appear here.
            </p>
          </div>
        )}

        {/* Orders Card List */}
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-xs hover:border-zinc-300 transition-all"
            >
              {/* Order Header Summary */}
              <div className="bg-zinc-50/60 px-5 py-3.5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 text-sm">
                      Order #{o.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        o.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {o.paymentStatus === 'CREATED' ? 'Payment Pending' : o.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Placed on {new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-base font-bold text-zinc-900">
                    {rupees(o.totalPaise)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-5 divide-y divide-zinc-100">
                {o.items.map((i) => (
                  <div key={i.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-sm text-zinc-800 truncate">
                          {i.product.title}
                        </span>
                        <span className="text-xs font-semibold text-zinc-400 flex-shrink-0">
                          × {i.quantity}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${BADGE[i.status]}`}>
                        {i.status}
                      </span>
                    </div>

                    {/* Show rating trigger if item is delivered */}
                    {i.status === 'DELIVERED' && (
                      <ReviewForm productId={i.productId} />
                    )}
                  </div>
                ))}
              </div>

              {/* Footer Action Buttons */}
              <div className="bg-white px-5 py-3 border-t border-zinc-100 flex items-center justify-end gap-3">
                {o.paymentStatus === 'CREATED' && (
                  <>
                    <button
                      disabled={busyId === o.id}
                      onClick={() => cancel(o.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                    <button
                      disabled={busyId === o.id}
                      onClick={() => payNow(o.id)}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {busyId === o.id ? 'Processing...' : 'Complete Payment'}
                    </button>
                  </>
                )}

                {o.paymentStatus === 'PAID' && (
                  <button
                    onClick={() => downloadInvoice(o.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Invoice
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}