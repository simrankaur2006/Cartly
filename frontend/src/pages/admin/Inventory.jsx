import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { adminApi, errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ProductImage from '../../components/ProductImage';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

function StockRow({ product, onSaved }) {
  const toast = useToast();
  const [value, setValue] = useState(product.stock);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateStock(product.id, Number(value));
      toast.success(`Stock updated for ${product.name}`);
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <td>
        <ProductImage className="thumb" src={product.imageUrl} alt={product.name} />
      </td>
      <td>{product.name}</td>
      <td>{product.category}</td>
      <td className={product.stock === 0 ? 'danger-text' : ''}>{product.stock}</td>
      <td>
        <div className="row-actions">
          <input className="stock-input" type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} aria-label={`New stock for ${product.name}`} />
          <button className="btn btn-primary btn-sm" disabled={saving || value === '' || Number(value) === product.stock} onClick={save}>
            Update
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Inventory() {
  const [threshold, setThreshold] = useState(10);
  const { data, loading, error, reload } = useFetch(() => adminApi.lowStock(threshold), [threshold]);

  return (
    <>
      <div className="section-head">
        <h2>Inventory</h2>
        <label className="inline-label">
          Show products with stock at or below
          <input className="stock-input" type="number" min="0" value={threshold} onChange={(e) => setThreshold(Math.max(0, Number(e.target.value) || 0))} />
        </label>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState title="Nothing is running low" text="Raise the threshold to see more products." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>In stock</th>
                <th>Set new stock</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <StockRow key={`${p.id}-${p.stock}`} product={p} onSaved={reload} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
