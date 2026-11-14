import { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import api, { errorMessage, rupees } from '../api/client.js';

// --- Reusable Metric Card ---
function MetricCard({ label, value, hint, icon }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
        {icon && <div className="text-zinc-400 p-2 bg-zinc-50 rounded-lg">{icon}</div>}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-zinc-900">{value}</p>
        {hint && <p className="text-xs font-medium text-zinc-400 mt-1">{hint}</p>}
      </div>
    </div>
  );
}

// --- Custom Modal for Changing Commission ---
function CommissionModal({ vendor, onClose, onSave }) {
  const [percent, setPercent] = useState(vendor.commissionPercent);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = Number(percent);
    if (!Number.isInteger(n) || n < 0 || n > 50) {
      return setError('Commission must be a whole number between 0 and 50%');
    }
    onSave(vendor.id, n);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm w-full p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Set Commission Rate</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Update rate for <span className="font-semibold text-zinc-800">{vendor.storeName}</span></p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-600 block mb-1">Commission Percentage (%)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                autoFocus
              />
              <span className="absolute right-3 top-2 text-sm text-zinc-400 font-bold">%</span>
            </div>
            {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              Save Rate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Analytics Tab ---
function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/analytics')
      .then((r) => setData(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium">{error}</div>;

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-white border border-zinc-200/80 rounded-xl animate-pulse p-4" />
          ))}
        </div>
        <div className="h-72 bg-white border border-zinc-200/80 rounded-xl animate-pulse" />
      </div>
    );
  }

  const daily = data.daily.map((d) => ({
    day: d.day.slice(5),
    revenue: d.revenuePaise / 100,
    orders: d.orders,
  }));

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Paid Orders" value={data.paidOrders} />
        <MetricCard label="Gross Revenue" value={rupees(data.revenuePaise)} />
        <MetricCard label="Commission Earned" value={rupees(data.commissionPaise)} />
        <MetricCard label="Platform Net" value={rupees(data.platformNetPaise)} hint="Commission minus coupons" />
        <MetricCard label="Vendor Earnings" value={rupees(data.vendorEarningsPaise)} />
        <MetricCard label="Coupons Paid" value={rupees(data.discountPaise)} />
        <MetricCard label="Registered Customers" value={data.users.CUSTOMER ?? 0} />
        <MetricCard label="Approved Vendors" value={data.vendors.APPROVED ?? 0} hint={`${data.vendors.PENDING ?? 0} pending review`} />
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900">Revenue Performance</h2>
          <p className="text-xs text-zinc-500">Daily revenue trends over the last 30 days</p>
        </div>
        {daily.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-400">No paid orders in the last 30 days.</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(val) => [`₹${val}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Breakdown Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-zinc-900">Top Selling Products</h2>
          {data.topProducts.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">No sales recorded yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="title" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="unitsSold" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Vendors */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-zinc-900">Top Performing Vendors</h2>
          {data.topVendors.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">No sales recorded yet.</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {data.topVendors.map((v) => (
                <div key={v.vendorId} className="py-3 flex items-center justify-between">
                  <span className="font-semibold text-sm text-zinc-800">{v.storeName}</span>
                  <span className="font-bold text-sm text-emerald-600">{rupees(v.earnedPaise)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Vendors Tab ---
function VendorsTab() {
  const [vendors, setVendors] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [activeVendorModal, setActiveVendorModal] = useState(null);

  const load = () =>
    api.get('/admin/vendors', { params: filter ? { status: filter } : {} })
      .then((r) => setVendors(r.data))
      .catch((e) => setError(errorMessage(e)));

  useEffect(() => { load(); }, [filter]);

  async function update(id, body) {
    setError('');
    try {
      await api.patch(`/admin/vendors/${id}`, body);
      setActiveVendorModal(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
      SUSPENDED: 'bg-zinc-100 text-zinc-600 border-zinc-300',
    };
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[status] || styles.SUSPENDED}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <select
          className="px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-zinc-700 shadow-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{error}</div>}

      {!vendors && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white border border-zinc-200/80 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {vendors?.length === 0 && (
        <div className="bg-white rounded-xl border border-zinc-200/80 p-8 text-center text-sm text-zinc-400">
          No vendors found matching criteria.
        </div>
      )}

      {/* Vendors List */}
      <div className="space-y-3">
        {vendors?.map((v) => (
          <div key={v.id} className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-xs flex flex-wrap gap-4 items-center justify-between hover:border-zinc-300 transition-all">
            
            {/* Left Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 text-base">{v.storeName}</span>
                <span className="text-xs font-mono text-zinc-400">#{v.id}</span>
                {getStatusBadge(v.status)}
              </div>
              <p className="text-xs text-zinc-500">
                {v.user.name} &bull; <span className="text-zinc-700 font-medium">{v.user.email}</span>
              </p>
              <p className="text-xs font-medium text-indigo-600">
                Commission Rate: {v.commissionPercent}%
              </p>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {v.status !== 'APPROVED' && (
                <button
                  onClick={() => update(v.id, { status: 'APPROVED' })}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  Approve
                </button>
              )}
              {v.status === 'PENDING' && (
                <button
                  onClick={() => update(v.id, { status: 'REJECTED' })}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Reject
                </button>
              )}
              {v.status === 'APPROVED' && (
                <button
                  onClick={() => update(v.id, { status: 'SUSPENDED' })}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Suspend
                </button>
              )}
              <button
                onClick={() => setActiveVendorModal(v)}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
              >
                Set Rate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Render */}
      {activeVendorModal && (
        <CommissionModal
          vendor={activeVendorModal}
          onClose={() => setActiveVendorModal(null)}
          onSave={(id, rate) => update(id, { commissionPercent: rate })}
        />
      )}
    </div>
  );
}

// --- Coupons Tab ---
function CouponsTab() {
  const [coupons, setCoupons] = useState(null);
  const [form, setForm] = useState({ code: '', discountPercent: 10, maxUses: 100, expiresAt: '' });
  const [msg, setMsg] = useState({ text: '', ok: true });

  const load = () => api.get('/coupons').then((r) => setCoupons(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function create(e) {
    e.preventDefault();
    const body = {
      code: form.code,
      discountPercent: Number(form.discountPercent),
      maxUses: Number(form.maxUses),
    };
    if (form.expiresAt) body.expiresAt = form.expiresAt;
    try {
      await api.post('/coupons', body);
      setMsg({ text: 'Coupon created successfully!', ok: true });
      setForm({ code: '', discountPercent: 10, maxUses: 100, expiresAt: '' });
      load();
    } catch (err) {
      setMsg({ text: errorMessage(err), ok: false });
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-zinc-900">Create New Coupon</h2>
        <form onSubmit={create} className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-xs font-semibold text-zinc-600 block mb-1">Coupon Code</label>
            <input
              required
              placeholder="e.g. FESTIVE20"
              minLength={3}
              maxLength={20}
              className="w-full px-3 py-2 text-xs uppercase bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold tracking-wider placeholder:normal-case placeholder:font-normal"
              value={form.code}
              onChange={set('code')}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600 block mb-1">Discount (%)</label>
            <input
              required
              type="number"
              min="1"
              max="90"
              placeholder="10"
              className="w-full px-3 py-2 text-xs bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              value={form.discountPercent}
              onChange={set('discountPercent')}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600 block mb-1">Max Redemptions</label>
            <input
              required
              type="number"
              min="1"
              placeholder="100"
              className="w-full px-3 py-2 text-xs bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              value={form.maxUses}
              onChange={set('maxUses')}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600 block mb-1">Expiry Date (Optional)</label>
            <input
              type="date"
              className="w-full px-3 py-2 text-xs bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-zinc-700"
              value={form.expiresAt}
              onChange={set('expiresAt')}
            />
          </div>
          
          <div className="md:col-span-4 flex items-center justify-between pt-2">
            {msg.text ? (
              <p className={`text-xs font-semibold ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>
            ) : <span />}
            <button className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors">
              Create Coupon
            </button>
          </div>
        </form>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-xs divide-y divide-zinc-100">
        {coupons?.length === 0 && <p className="p-6 text-center text-zinc-400 text-sm">No active coupons created yet.</p>}
        {coupons?.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-indigo-600 tracking-wider font-mono bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                {c.code}
              </span>
              <span className="text-xs font-semibold text-zinc-700">{c.discountPercent}% OFF</span>
            </div>
            <div className="text-xs text-zinc-500 flex items-center gap-4">
              <span>Redeemed: <strong className="text-zinc-800">{c.usedCount}</strong> / {c.maxUses}</span>
              {c.expiresAt && (
                <span className="bg-zinc-100 px-2 py-0.5 rounded text-[11px] font-medium text-zinc-600">
                  Expires: {new Date(c.expiresAt).toLocaleDateString('en-IN')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main Admin Layout ---
export default function Admin() {
  const [tab, setTab] = useState('analytics');
  
  const tabNames = [
    { key: 'analytics', label: 'Analytics' },
    { key: 'vendors', label: 'Vendors Directory' },
    { key: 'coupons', label: 'Coupons Management' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Admin Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-1">Manage vendor permissions, track metrics, and generate promotional codes.</p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="border-b border-zinc-200 flex gap-6">
          {tabNames.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-semibold transition-all relative ${
                tab === t.key ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Active Tab Component */}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'vendors' && <VendorsTab />}
        {tab === 'coupons' && <CouponsTab />}
      </div>
    </div>
  );
}