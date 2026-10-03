export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);

export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

export const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

export const shortId = (id) => (id ? id.slice(-8).toUpperCase() : '');

export const ORDER_STATUSES = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export const PAYMENT_LABELS = {
  CASH_ON_DELIVERY: 'Cash on Delivery',
  DEMO_CARD: 'Demo Card Payment',
};

export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#e6ebef"/><path d="M200 380l70-90 60 70 40-50 70 70z" fill="#c3ced7"/><circle cx="240" cy="230" r="28" fill="#c3ced7"/></svg>'
  );
