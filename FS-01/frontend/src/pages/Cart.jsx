import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage, rupees } from '../api/client.js';
import { payForOrder } from '../api/razorpay.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState('');
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [busy, setBusy] = useState(false);

  const say = (text, ok = false) => setMsg({ text, ok });

  useEffect(() => {
    api
      .get('/cart')
      .then((r) => setCart(r.data))
      .catch((e) => say(errorMessage(e)));
  }, []);

  // any cart change makes an applied coupon preview stale
  async function change(request) {
    try {
      const res = await request();
      setCart(res.data);
      setCoupon(null);
      say('');
    } catch (err) {
      say(errorMessage(err));
    }
  }

  const setQty = (productId, quantity) =>
    change(() => api.patch(`/cart/items/${productId}`, { quantity }));
  const removeItem = (productId) =>
    change(() => api.delete(`/cart/items/${productId}`));

  async function applyCoupon() {
    try {
      const res = await api.post('/coupons/preview', { code });
      setCoupon(res.data);
      say(`Coupon "${res.data.code}" applied successfully!`, true);
    } catch (err) {
      setCoupon(null);
      say(errorMessage(err));
    }
  }

  async function checkout() {
    setBusy(true);
    say('');
    let order;
    try {
      const body = { address };
      if (coupon) body.couponCode = coupon.code;
      order = (await api.post('/orders/checkout', body)).data;
    } catch (err) {
      say(errorMessage(err));
      setBusy(false);
      return;
    }

    // the order exists now, so whatever happens next we land on My orders
    let notice;
    try {
      const result = await payForOrder(order.id, user);
      notice =
        result === 'PAID'
          ? 'Payment successful!'
          : 'Order created but not paid yet. You can pay or cancel it below.';
    } catch (err) {
      notice = `Payment problem: ${errorMessage(err)}. You can retry from here.`;
    }
    navigate('/orders', { state: { notice } });
  }

  /* Skeleton Loading State */
  if (!cart) {
    return (
      <div className="min-h-screen bg-zinc-50/50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-40 bg-zinc-200 rounded animate-pulse mb-6" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex gap-4 items-center animate-pulse"
                >
                  <div className="h-20 w-20 bg-zinc-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-100 rounded w-2/3" />
                    <div className="h-3 bg-zinc-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  /* Empty Cart State */
  if (cart.items.length === 0) {
    return (
      <div className="min-h-[80vh] bg-zinc-50/50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-zinc-200/80 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Your cart is empty</h2>
          <p className="text-sm text-zinc-500 mt-1 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all active:scale-[0.99]"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const discount = coupon?.discountPaise ?? 0;
  const total = cart.subtotalPaise - discount;

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Shopping Cart
          </h1>
          <span className="text-xs font-semibold text-zinc-500">
            {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="md:col-span-2 space-y-4">
            {cart.items.map((i) => (
              <div
                key={i.productId}
                className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-xs hover:border-zinc-300 transition-all flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Product Thumbnail */}
                <div className="h-20 w-20 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-zinc-100">
                  {i.imageUrl ? (
                    <img
                      src={i.imageUrl}
                      alt={i.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-6 h-6 text-zinc-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    {i.storeName}
                  </span>
                  <p className="font-semibold text-zinc-900 truncate">
                    {i.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {rupees(i.unitPricePaise)} each
                  </p>
                </div>

                {/* Actions & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                  {/* Stepper Input */}
                  <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50/50">
                    <button
                      type="button"
                      disabled={i.quantity <= 1}
                      onClick={() => setQty(i.productId, i.quantity - 1)}
                      className="px-2 py-1 text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={i.quantity}
                      onChange={(e) =>
                        setQty(
                          i.productId,
                          Math.min(10, Math.max(1, Number(e.target.value) || 1))
                        )
                      }
                      className="w-10 text-center text-xs font-bold text-zinc-800 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      disabled={i.quantity >= 10}
                      onClick={() => setQty(i.productId, i.quantity + 1)}
                      className="px-2 py-1 text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[5.5rem]">
                    <p className="font-bold text-zinc-900 text-sm">
                      {rupees(i.linePaise)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(i.productId)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove item"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout & Summary Sidebar */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-5 sticky top-20">
            <h2 className="text-base font-bold text-zinc-900">
              Order Summary
            </h2>

            {/* Coupon Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-600">
                Have a coupon code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SAVE10"
                  className="uppercase flex-1 min-w-0 px-3 py-2 text-xs bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium placeholder:text-zinc-400"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  onClick={applyCoupon}
                  disabled={!code.trim()}
                  className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="text-sm space-y-2.5 pt-2 border-t border-zinc-100">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900">
                  {rupees(cart.subtotalPaise)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1">
                    Discount
                    {coupon?.discountPercent && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                        {coupon.discountPercent}% OFF
                      </span>
                    )}
                  </span>
                  <span>-{rupees(discount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-base text-zinc-900 pt-3 border-t border-zinc-100">
                <span>Total Amount</span>
                <span className="text-indigo-600">{rupees(total)}</span>
              </div>
            </div>

            {/* Shipping Address Input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-zinc-600 flex items-center justify-between">
                <span>Delivery Address</span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  Min. 10 chars
                </span>
              </label>
              <textarea
                placeholder="Enter house details, street address, city, and pincode..."
                rows={3}
                className="w-full px-3 py-2 text-xs bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-zinc-800 placeholder:text-zinc-400"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Feedback Message */}
            {msg.text && (
              <div
                className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  msg.ok
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {msg.ok ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
                {msg.text}
              </div>
            )}

            {/* Checkout Action Button */}
            <button
              onClick={checkout}
              disabled={busy || address.trim().length < 10}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
            >
              {busy ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                `Proceed to Pay ${rupees(total)}`
              )}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}