import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { categoryApi, productApi } from '../services/api';
import ProductGrid from '../components/ProductGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const featured = useFetch(() => productApi.list({ sort: 'rating', size: 8 }), []);
  const categories = useFetch(() => categoryApi.list(), []);

  const search = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/products?search=${encodeURIComponent(query.trim())}` : '/products');
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1>Everyday things, well made and easy to order.</h1>
          <p>Phones, shoes, jackets and lamps in one place. Add to your cart and track every order from your account.</p>
          <form className="hero-search" onSubmit={search}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for headphones, sneakers, lamps..." aria-label="Search products" />
            <button className="btn btn-accent" type="submit">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Shop by category</h2>
        </div>
        {categories.error && <ErrorMessage message={categories.error} onRetry={categories.reload} />}
        <div className="category-row">
          {(categories.data || []).map((c) => (
            <Link key={c.id} to={`/products?category=${encodeURIComponent(c.name)}`} className="category-tile">
              <strong>{c.name}</strong>
              <span className="muted small">{c.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Top rated right now</h2>
          <Link to="/products" className="link-btn">
            View all products
          </Link>
        </div>
        {featured.loading ? (
          <LoadingSpinner />
        ) : featured.error ? (
          <ErrorMessage message={featured.error} onRetry={featured.reload} />
        ) : (
          <ProductGrid products={featured.data?.content} />
        )}
      </section>
    </>
  );
}
