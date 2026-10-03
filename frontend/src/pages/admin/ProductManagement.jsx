import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { errorMessage, productApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';
import ProductImage from '../../components/ProductImage';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

export default function ProductManagement() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => productApi.list({ size: 100, sort: 'newest' }), []);

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await productApi.remove(product.id);
      toast.success('Product deleted');
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <>
      <div className="section-head">
        <h2>Products</h2>
        <Link className="btn btn-primary" to="/admin/products/new">
          Add product
        </Link>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : data.content.length === 0 ? (
        <EmptyState title="No products yet" text="Add your first product to start selling." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((p) => (
                <tr key={p.id}>
                  <td>
                    <ProductImage className="thumb" src={p.imageUrl} alt={p.name} />
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{formatCurrency(p.price)}</td>
                  <td className={p.stock <= 10 ? 'danger-text' : ''}>{p.stock}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn btn-ghost btn-sm" to={`/admin/products/${p.id}/edit`}>
                        Edit
                      </Link>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
