import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) =>
    `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
      isActive(path)
        ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-indigo-700 transition-colors">
              M
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors">
              Marketplace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {user?.role === 'CUSTOMER' && (
              <>
                <Link to="/cart" className={navLinkStyle('/cart')}>
                  Cart
                </Link>
                <Link to="/orders" className={navLinkStyle('/orders')}>
                  My Orders
                </Link>
              </>
            )}

            {user?.role === 'VENDOR' && (
              <Link to="/vendor" className={navLinkStyle('/vendor')}>
                Vendor Dashboard
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link to="/admin" className={navLinkStyle('/admin')}>
                Admin Panel
              </Link>
            )}
          </div>

          {/* User / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-zinc-200">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium text-zinc-800 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all active:scale-[0.98]"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-zinc-500 hover:text-zinc-800 rounded-lg hover:bg-zinc-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 pt-2 pb-4 space-y-1">
          {user?.role === 'CUSTOMER' && (
            <>
              <Link to="/cart" onClick={() => setMenuOpen(false)} className={`block ${navLinkStyle('/cart')}`}>
                Cart
              </Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className={`block ${navLinkStyle('/orders')}`}>
                My Orders
              </Link>
            </>
          )}

          {user?.role === 'VENDOR' && (
            <Link to="/vendor" onClick={() => setMenuOpen(false)} className={`block ${navLinkStyle('/vendor')}`}>
              Vendor Dashboard
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className={`block ${navLinkStyle('/admin')}`}>
              Admin Panel
            </Link>
          )}

          <div className="pt-3 border-t border-zinc-100 mt-2">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-sm font-medium text-zinc-900">{user.name}</p>
                  <p className="text-xs text-zinc-400 uppercase">{user.role}</p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center px-3 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}