import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react';
import api, { errorMessage, rupees } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState({ average: null, count: 0, reviews: [] });
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [message, setMessage] = useState({ text: '', ok: true });
  const [notFound, setNotFound] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch(() => setNotFound(true));

    api
      .get(`/products/${id}/reviews`)
      .then((r) => setReviews(r.data))
      .catch(() => {});
  }, [id]);

  async function addToCart() {
    if (!user) return navigate('/login');
    setAdding(true);
    try {
      await api.post('/cart/items', { productId: product.id, quantity: qty });
      setMessage({ text: 'Added to cart successfully!', ok: true });
    } catch (err) {
      setMessage({ text: errorMessage(err), ok: false });
    } finally {
      setAdding(false);
    }
  }

  /* Not Found State */
  if (notFound) {
    return (
      <div className="min-h-[75vh] bg-zinc-50/50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-zinc-200/80 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Product Not Found</h2>
          <p className="text-xs text-zinc-500 mt-1 mb-6">
            The item you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  /* Skeleton Loading State */
  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-50/50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="h-96 bg-white border border-zinc-200/80 rounded-2xl animate-pulse" />
            <div className="flex gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 w-20 bg-white border border-zinc-200/80 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 space-y-4 animate-pulse">
            <div className="h-8 bg-zinc-100 rounded w-3/4" />
            <div className="h-4 bg-zinc-100 rounded w-1/4" />
            <div className="h-10 bg-zinc-100 rounded w-1/3 pt-4" />
            <div className="h-24 bg-zinc-100 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  const activeImage = product.images?.[selectedImg]?.url || product.images?.[0]?.url;

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Card Grid */}
        <div className="grid md:grid-cols-2 gap-10 items-start">
          
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs overflow-hidden h-96 flex items-center justify-center">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.title}
                  className="max-h-full w-full object-contain transition-all duration-300"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  <svg className="w-10 h-10 stroke-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">No image preview</span>
                </div>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImg(idx)}
                    className={`h-20 w-20 rounded-xl bg-white border p-1 overflow-hidden transition-all flex-shrink-0 ${
                      selectedImg === idx
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'border-zinc-200/80 hover:border-zinc-300'
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions Card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Header Details */}
            <div className="space-y-2 border-b border-zinc-100 pb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Sold by {product.vendor?.storeName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-2">
                {product.title}
              </h1>

              {/* Rating Summary Pill */}
              {reviews.count > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center gap-1 text-amber-400 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                    <span className="text-xs font-bold text-zinc-900">★ {reviews.average}</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">
                    ({reviews.count} verified {reviews.count === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>

            {/* Price & Stock status */}
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight text-zinc-900">
                {rupees(product.pricePaise)}
              </p>
              <div className="pt-1">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    In stock ({product.stock} units left)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Out of stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Product Description
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {product.description || 'No detailed description available.'}
              </p>
            </div>

            {/* Quantity Stepper & Add to Cart */}
            {(!user || user.role === 'CUSTOMER') && product.stock > 0 && (
              <div className="pt-4 border-t border-zinc-100 space-y-4">
                <div className="flex items-center gap-4">
                  {/* Stepper */}
                  <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50/50 p-1">
                    <button
                      type="button"
                      disabled={qty <= 1}
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-zinc-900">
                      {qty}
                    </span>
                    <button
                      type="button"
                      disabled={qty >= Math.min(10, product.stock)}
                      onClick={() => setQty(Math.min(Math.min(10, product.stock), qty + 1))}
                      className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Button */}
                  <button
                    onClick={addToCart}
                    disabled={adding}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-xs disabled:opacity-50 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
                  >
                    {adding ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>

                {message.text && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      message.ok
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span>{message.text}</span>
                  </div>
                )}
              </div>
            )}

            {/* Customer Reviews Section */}
            <div className="pt-6 border-t border-zinc-100 space-y-4">
              <h2 className="text-base font-bold text-zinc-900">Customer Reviews</h2>
              
              {reviews.reviews.length === 0 ? (
                <p className="text-xs text-zinc-400 py-2">
                  No reviews left for this item yet. Be the first to share your thoughts!
                </p>
              ) : (
                <div className="divide-y divide-zinc-100 space-y-3 pt-1">
                  {reviews.reviews.map((r) => (
                    <div key={r.id} className="pt-3 first:pt-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-800">{r.user.name}</span>
                        <span className="text-xs text-amber-400">{'★'.repeat(r.rating)}</span>
                      </div>
                      {r.comment && (
                        <p className="text-xs text-zinc-600 leading-relaxed">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}