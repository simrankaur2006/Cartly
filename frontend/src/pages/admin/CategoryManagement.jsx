import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { categoryApi, errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const blank = { name: '', description: '' };

export default function CategoryManagement() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => categoryApi.list(), []);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const reset = () => {
    setForm(blank);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) await categoryApi.update(editingId, form);
      else await categoryApi.create(form);
      toast.success(editingId ? 'Category updated' : 'Category added');
      reset();
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const edit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, description: c.description || '' });
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await categoryApi.remove(c.id);
      toast.success('Category deleted');
      if (editingId === c.id) reset();
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <>
      <h2>Categories</h2>
      <form className="panel inline-form" onSubmit={submit}>
        <label>
          Name
          <input name="name" value={form.name} onChange={change} required />
        </label>
        <label className="grow">
          Description
          <input name="description" value={form.description} onChange={change} />
        </label>
        <div className="row-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {editingId ? 'Save changes' : 'Add category'}
          </button>
          {editingId && (
            <button className="btn btn-ghost" type="button" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState title="No categories yet" text="Add a category above, then assign products to it." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.description}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => edit(c)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(c)}>
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
