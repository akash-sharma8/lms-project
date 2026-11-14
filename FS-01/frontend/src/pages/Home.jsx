import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { rupees } from '../api/client.js';

const CATEGORIES = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Clothing' },
  { id: 3, name: 'Books' },
  { id: 4, name: 'Home' },
  { id: 5, name: 'Beauty' },
];

const INITIAL_FILTERS = {
  q: '',
  categoryId: '',
  minPrice: '',
  maxPrice: '',
  sort: '',
};

export default function Home() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleFilterChange = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((val) => val !== '');

  useEffect(() => {
    const params = { page, limit: 12 };
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '') params[key] = value;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get('/search', { params })
        .then((res) => {
          setData(res.data);
          setError('');
        })
        .catch(() => setError('Could not load products. Please check your connection.'))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, page]);

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Explore Products
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Find curated gear, clothing, electronics, and home essentials.
            </p>
          </div>
          {data.total > 0 && !loading && (
            <span className="text-xs font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200/80 px-3 py-1.5 rounded-full self-start md:self-auto">
              {data.total} {data.total === 1 ? 'item' : 'items'} available
            </span>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-sm mb-8 space-y-3">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
            
            {/* Search Input */}
            <div className="relative lg:col-span-4">
              <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products by title..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-zinc-400"
                value={filters.q}
                onChange={handleFilterChange('q')}
              />
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-3">
              <select
                className="w-full px-3 py-2 text-sm bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-zinc-700 font-medium"
                value={filters.categoryId}
                onChange={handleFilterChange('categoryId')}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-3">
              <select
                className="w-full px-3 py-2 text-sm bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-zinc-700 font-medium"
                value={filters.sort}
                onChange={handleFilterChange('sort')}
              >
                <option value="">Sort: Best Match</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            {/* Min / Max Price inputs */}
            <div className="flex gap-2 lg:col-span-2">
              <input
                type="number"
                min="0"
                placeholder="Min ₹"
                className="w-1/2 px-3 py-2 text-sm bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-zinc-700 placeholder:text-zinc-400"
                value={filters.minPrice}
                onChange={handleFilterChange('minPrice')}
              />
              <input
                type="number"
                min="0"
                placeholder="Max ₹"
                className="w-1/2 px-3 py-2 text-sm bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-zinc-700 placeholder:text-zinc-400"
                value={filters.maxPrice}
                onChange={handleFilterChange('maxPrice')}
              />
            </div>

          </div>

          {/* Active Filter Clear Action */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-1">
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading Skeleton State */}
        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-zinc-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-zinc-100 rounded w-3/4" />
                  <div className="h-4 bg-zinc-100 rounded w-1/3" />
                  <div className="h-3 bg-zinc-100 rounded w-1/2 pt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && data.items.length === 0 && (
          <div className="text-center py-16 bg-white border border-zinc-200/80 rounded-xl px-4">
            <div className="w-12 h-12 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-zinc-900">No products found</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
              We couldn't find anything matching your current filters. Try refining your search parameters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && data.items.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.items.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="group bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col"
              >
                {/* Product Image Container */}
                <div className="h-48 w-full bg-zinc-100 relative overflow-hidden flex items-center justify-center">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-zinc-400">
                      <svg className="w-8 h-8 stroke-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium">No preview available</span>
                    </div>
                  )}

                  {p.stock === 0 && (
                    <div className="absolute top-2 right-2 bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                      Sold out
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                      {p.storeName}
                    </span>
                    <h2 className="font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mt-0.5">
                      {p.title}
                    </h2>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <p className="text-lg font-bold text-zinc-900">
                      {rupees(p.pricePaise)}
                    </p>
                    <span className="text-xs font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      View details &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {data.pages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200/80 pt-6 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-1.5"
            >
              &larr; Previous
            </button>
            <span className="text-xs font-semibold text-zinc-500">
              Page <span className="text-zinc-900 font-bold">{page}</span> of {data.pages}
            </span>
            <button
              disabled={page >= data.pages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-1.5"
            >
              Next &rarr;
            </button>
          </div>
        )}

      </div>
    </div>
  );
}