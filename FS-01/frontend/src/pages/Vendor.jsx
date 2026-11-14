import { useEffect, useState } from 'react';
import api, { errorMessage, rupees } from '../api/client.js';

const CATEGORIES = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Clothing' },
  { id: 3, name: 'Books' },
  { id: 4, name: 'Home' },
  { id: 5, name: 'Beauty' },
];

// same rules as the backend, so we only show buttons that will work
const NEXT = {
  PLACED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
};

function ApplyForm({ onDone }) {
  const [form, setForm] = useState({ storeName: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/vendors/apply', {
        storeName: form.storeName,
        description: form.description || undefined,
      });
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-zinc-50/50 px-4 py-12">
      <div className="w-full max-w-md bg-white border border-zinc-200/80 rounded-2xl shadow-xs p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold text-xl shadow-xs">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Open Your Store
          </h1>
          <p className="text-xs text-zinc-500">
            Submit your storefront details to start selling products
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 block">
              Store Name
            </label>
            <input
              required
              minLength={3}
              maxLength={60}
              placeholder="e.g. Apex Electronics"
              className="w-full px-3.5 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-zinc-800 placeholder:text-zinc-400 font-medium"
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 block">
              Store Description (Optional)
            </label>
            <textarea
              placeholder="Tell customers what your store specializes in..."
              rows={3}
              maxLength={500}
              className="w-full px-3.5 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-zinc-800 placeholder:text-zinc-400 font-medium"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <button
            disabled={submitting}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-xs disabled:opacity-50 transition-all active:scale-[0.99] text-sm"
          >
            {submitting ? 'Submitting Application...' : 'Apply for Store'}
          </button>
        </form>
      </div>
    </div>
  );
}

const EMPTY = { title: '', description: '', price: '', stock: '', categoryId: 1 };

function ProductsTab() {
  const [products, setProducts] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [saving, setSaving] = useState(false);

  const say = (text, ok = false) => setMsg({ text, ok });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const load = () =>
    api
      .get('/products/mine/list')
      .then((r) => setProducts(r.data.filter((p) => p.isActive)))
      .catch((e) => say(errorMessage(e)));

  useEffect(() => {
    load();
  }, []);

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      price: String(p.pricePaise / 100),
      stock: String(p.stock),
      categoryId: p.categoryId ?? 1,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const body = {
      title: form.title,
      description: form.description,
      pricePaise: Math.round(Number(form.price) * 100),
      stock: Number(form.stock),
      categoryId: Number(form.categoryId),
    };
    try {
      if (editingId) await api.put(`/products/${editingId}`, body);
      else await api.post('/products', body);
      say(editingId ? 'Product updated successfully' : 'Product added successfully', true);
      reset();
      load();
    } catch (err) {
      say(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Remove this product from the store?')) return;
    try {
      await api.delete(`/products/${id}`);
      say('Product removed successfully', true);
      load();
    } catch (err) {
      say(errorMessage(err));
    }
  }

  async function upload(id, files) {
    if (!files.length) return;
    const data = new FormData();
    for (const f of files) data.append('images', f);
    try {
      await api.post(`/products/${id}/images`, data);
      say('Images uploaded successfully', true);
      load();
    } catch (err) {
      say(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      {/* Product Form Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-zinc-900">
          {editingId ? `Edit Product #${editingId}` : 'Add New Product'}
        </h2>

        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-zinc-700 block">Product Title</label>
            <input
              required
              minLength={3}
              placeholder="e.g. Wireless Bluetooth Headphones"
              className="w-full px-3.5 py-2 text-xs bg-zinc-50/50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              value={form.title}
              onChange={set('title')}
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-zinc-700 block">Description</label>
            <textarea
              required
              minLength={10}
              placeholder="Detailed description of features, materials, or specifications (min 10 characters)"
              rows={3}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50/50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              value={form.description}
              onChange={set('description')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 block">Price (₹)</label>
            <input
              required
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3.5 py-2 text-xs bg-zinc-50/50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              value={form.price}
              onChange={set('price')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 block">Inventory Stock</label>
            <input
              required
              type="number"
              min="0"
              step="1"
              placeholder="Quantity available"
              className="w-full px-3.5 py-2 text-xs bg-zinc-50/50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              value={form.stock}
              onChange={set('stock')}
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-zinc-700 block">Category</label>
            <select
              className="w-full px-3.5 py-2 text-xs bg-zinc-50/50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-zinc-800"
              value={form.categoryId}
              onChange={set('categoryId')}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-2">
            {msg.text ? (
              <span
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                  msg.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {msg.text}
              </span>
            ) : <span />}

            <div className="flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading Skeletons */}
      {!products && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-white border border-zinc-200/80 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty Product List */}
      {products?.length === 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 text-center text-xs text-zinc-400">
          No active products listed in your store yet.
        </div>
      )}

      {/* Product Items List */}
      <div className="space-y-3">
        {products?.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 hover:border-zinc-300 transition-all"
          >
            <div className="flex items-center gap-3.5 min-w-[200px] flex-1">
              <div className="h-14 w-14 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-zinc-100">
                {p.images[0] ? (
                  <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              <div className="space-y-0.5">
                <p className="font-semibold text-zinc-900 text-sm">{p.title}</p>
                <p className="text-xs text-zinc-500 font-medium">
                  {rupees(p.pricePaise)} &bull; Stock: <span className="text-zinc-800 font-bold">{p.stock}</span> &bull; {p.images.length} image(s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Images
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={(e) => {
                    upload(p.id, e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>

              <button
                onClick={() => startEdit(p)}
                className="px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg transition-colors"
              >
                Edit
              </button>

              <button
                onClick={() => remove(p.id)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/orders/vendor/items')
      .then((r) => setItems(r.data))
      .catch((e) => setError(errorMessage(e)));

  useEffect(() => {
    load();
  }, []);

  async function move(id, status) {
    setError('');
    try {
      await api.patch(`/orders/items/${id}/status`, { status });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (error) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">{error}</div>;
  }

  if (!items) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-white border border-zinc-200/80 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const map = {
      DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
      PACKED: 'bg-amber-50 text-amber-700 border-amber-200',
      PLACED: 'bg-sky-50 text-sky-700 border-sky-200',
      CANCELLED: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    };
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${map[status] || map.CANCELLED}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 text-center text-xs text-zinc-400">
          No paid orders received for your store yet.
        </div>
      )}

      {items.map((i) => (
        <div
          key={i.id}
          className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-3 hover:border-zinc-300 transition-all"
        >
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 text-sm">
                {i.product.title}
              </span>
              <span className="text-xs font-semibold text-zinc-400">× {i.quantity}</span>
            </div>
            {getStatusBadge(i.status)}
          </div>

          <div className="space-y-1">
            <p className="text-xs text-zinc-500">
              Order <span className="font-semibold text-zinc-700">#{i.orderId}</span> &bull; Delivery Address:{' '}
              <span className="text-zinc-700">{i.order.address}</span>
            </p>
            <p className="text-xs font-medium text-emerald-700">
              Net Vendor Earnings: <strong className="text-zinc-900">{rupees(i.vendorEarnPaise)}</strong>
              <span className="text-zinc-400 font-normal"> (Platform commission: {rupees(i.commissionPaise)})</span>
            </p>
          </div>

          {(NEXT[i.status] || []).length > 0 && (
            <div className="flex gap-2 pt-2 border-t border-zinc-100">
              {(NEXT[i.status] || []).map((s) => (
                <button
                  key={s}
                  onClick={() => move(i.id, s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    s === 'CANCELLED'
                      ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  Mark {s.toLowerCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Vendor() {
  const [vendor, setVendor] = useState(undefined);
  const [tab, setTab] = useState('products');

  const load = () =>
    api
      .get('/vendors/me')
      .then((r) => setVendor(r.data))
      .catch((err) => setVendor(err.response?.status === 404 ? null : undefined));

  useEffect(() => {
    load();
  }, []);

  if (vendor === undefined) {
    return (
      <div className="min-h-screen bg-zinc-50/50 py-10">
        <div className="max-w-4xl mx-auto px-4 space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-zinc-200 rounded-lg" />
          <div className="h-4 w-32 bg-zinc-100 rounded" />
          <div className="h-64 bg-white border border-zinc-200/80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (vendor === null) return <ApplyForm onDone={load} />;

  if (vendor.status !== 'APPROVED') {
    return (
      <div className="min-h-[80vh] bg-zinc-50/50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-zinc-200/80 rounded-2xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 font-bold text-xl">
            ⏳
          </div>
          <h1 className="text-xl font-bold text-zinc-900">{vendor.storeName}</h1>
          <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
            Status: {vendor.status}
          </div>
          <p className="text-xs text-zinc-500 pt-2">
            {vendor.status === 'PENDING'
              ? 'Your store application is under review. An administrator will review and approve it shortly.'
              : `Your store status is currently ${vendor.status.toLowerCase()}. Please contact support for details.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Store Info Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-200/80 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{vendor.storeName}</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Platform Commission Rate: <span className="font-semibold text-zinc-800">{vendor.commissionPercent}%</span>
            </p>
          </div>
          <span className="self-start sm:self-auto text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Approved Vendor
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-zinc-200 flex gap-6">
          {['products', 'orders'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-semibold capitalize transition-all relative ${
                tab === t ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {t}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'products' ? <ProductsTab /> : <OrdersTab />}
      </div>
    </div>
  );
}