import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import useFetch from '../hooks/useFetch';
import { errorMessage, profileApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Profile() {
  const { user } = useUser();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => profileApi.get(), []);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.name || user?.fullName || '',
      email: data.email || user?.primaryEmailAddress?.emailAddress || '',
      phone: data.phone || '',
      address: data.address || '',
    });
  }, [data, user]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileApi.update(form);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container narrow section">
      <h2>Your profile</h2>
      <ErrorMessage message={error} onRetry={reload} />
      <form className="panel form-grid" onSubmit={save}>
        <label className="span-2">
          Name
          <input name="name" value={form.name} onChange={change} />
        </label>
        <label className="span-2">
          Email
          <input name="email" type="email" value={form.email} onChange={change} />
          <span className="muted small">Your sign-in email is managed by Clerk. This one is used for your orders.</span>
        </label>
        <label className="span-2">
          Phone
          <input name="phone" value={form.phone} onChange={change} />
        </label>
        <label className="span-2">
          Address
          <textarea name="address" rows="3" value={form.address} onChange={change} />
        </label>
        <div className="span-2">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
