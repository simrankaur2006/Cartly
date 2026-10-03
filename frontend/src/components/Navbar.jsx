import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useAppAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAppAuth();
  const { count } = useCart();
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={close}>
          <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#0f766e" />
            <path d="M16 20h6l5 20h19l4-14H26" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="29" cy="48" r="3.5" fill="#fff" />
            <circle cx="44" cy="48" r="3.5" fill="#fff" />
          </svg>
          Cartly
        </Link>

        <button className="menu-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>
            Home
          </NavLink>
          <NavLink to="/products" onClick={close}>
            Products
          </NavLink>
          <SignedIn>
            <NavLink to="/orders" onClick={close}>
              My orders
            </NavLink>
            <NavLink to="/profile" onClick={close}>
              Profile
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" onClick={close}>
                Admin
              </NavLink>
            )}
          </SignedIn>
          <NavLink to="/cart" className="cart-link" onClick={close}>
            Cart
            {count > 0 && <span className="cart-count">{count}</span>}
          </NavLink>
          <SignedOut>
            <Link to="/sign-in" className="btn btn-ghost btn-sm" onClick={close}>
              Sign in
            </Link>
            <Link to="/sign-up" className="btn btn-primary btn-sm" onClick={close}>
              Sign up
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
