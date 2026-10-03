import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { categoryApi, errorMessage, productApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const empty = { name: '', description: '', price: '', category: '', imageUrl: '', stock: '', rating: '' };

// Used for both "Add product" (no id in the URL) and "Edit product".
export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = useFetch(() => categoryApi.list(), []);
  const product = useFetch(() => (isEdit ? productApi.get(id) : Promise.resolve(null)), [id]);

  useEffect(() => {
    if (product.data) {
      const p = product.data;
      setForm({
        name: p.name,
        description: p.description || '',
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl || '',
        stock: p.stock,
        rating: p.rating,
      });
    }
  }, [product.data]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      rating: form.rating === '' ? 0 : Number(form.rating),
    };
    try {
      if (isEdit) await productApi.update(id, body);
      else await productApi.create(body);
      toast.success(isEdit ? 'Product updated' : 'Product created');
      navigate('/admin/products');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (product.loading || categories.loading) return <LoadingSpinner />;

  return (
    <>
      <h2>{isEdit ? 'Edit product' : 'Add product'}</h2>
      <ErrorMessage message={product.error || categories.error} />
      <form className="panel form-grid" onSubmit={submit}>
        <label className="span-2">
          Name
          <input name="name" value={form.name} onChange={change} required />
        </label>
        <label className="span-2">
          Description
          <textarea name="description" rows="4" value={form.description} onChange={change} />
        </label>
        <label>
          Price (INR)
          <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={change} required />
        </label>
        <label>
          Category
          <select name="category" value={form.category} onChange={change} required>
            <option value="">Select a category</option>
            {(categories.data || []).map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Stock
          <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={change} required />
        </label>
        <label>
          Rating (0 to 5)
          <input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={change} />
        </label>
        <label className="span-2">
          Image URL
          <input name="imageUrl" type="url" value={form.imageUrl} onChange={change} placeholder="https://..." />
        </label>
        <div className="span-2">
          <ErrorMessage message={error} />
          <div className="row-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
            </button>
            <Link className="btn btn-ghost" to="/admin/products">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </>
  );
}
