import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { categoryApi, productApi } from '../services/api';
import ProductGrid from '../components/ProductGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PAGE_SIZE = 8;

export default function Products() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page') || 0);
  const [input, setInput] = useState(search);

  useEffect(() => setInput(search), [search]);

  const categories = useFetch(() => categoryApi.list(), []);
  const products = useFetch(
    () => productApi.list({ search: search || undefined, category: category || undefined, sort, page, size: PAGE_SIZE }),
    [search, category, sort, page]
  );

  // Updates one query-string value and goes back to the first page.
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const result = products.data;

  return (
    <div className="container section">
      <div className="section-head">
        <h2>All products</h2>
        {result && <span className="muted">{result.totalElements} found</span>}
      </div>

      <div className="toolbar">
        <form
          className="toolbar-search"
          onSubmit={(e) => {
            e.preventDefault();
            setParam('search', input.trim());
          }}
        >
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search products" aria-label="Search products" />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>
        <select value={category} onChange={(e) => setParam('category', e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {(categories.data || []).map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setParam('sort', e.target.value)} aria-label="Sort products">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Top rated</option>
          <option value="name">Name</option>
        </select>
      </div>

      {products.loading ? (
        <LoadingSpinner />
      ) : products.error ? (
        <ErrorMessage message={products.error} onRetry={products.reload} />
      ) : (
        <>
          <ProductGrid products={result?.content} />
          {result && result.totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-ghost btn-sm" disabled={page <= 0} onClick={() => setParam('page', String(page - 1))}>
                Previous
              </button>
              <span className="muted">
                Page {page + 1} of {result.totalPages}
              </span>
              <button className="btn btn-ghost btn-sm" disabled={page + 1 >= result.totalPages} onClick={() => setParam('page', String(page + 1))}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
