import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

export default function ProductGrid({ products, emptyTitle = 'No products found', emptyText }) {
  if (!products || products.length === 0) {
    return <EmptyState title={emptyTitle} text={emptyText || 'Try a different search or category.'} />;
  }
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
