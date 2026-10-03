export default function Rating({ value = 0 }) {
  const full = Math.round(value);
  return (
    <span className="rating" title={`${value.toFixed(1)} out of 5`}>
      <span className="stars" aria-hidden="true">
        {'★'.repeat(full)}
        <span className="stars-off">{'★'.repeat(5 - full)}</span>
      </span>
      <span className="rating-num">{value.toFixed(1)}</span>
    </span>
  );
}
