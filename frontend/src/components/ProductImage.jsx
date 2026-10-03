import { PLACEHOLDER_IMAGE } from '../utils/format';

// Shows a grey placeholder when the image URL is empty or broken.
export default function ProductImage({ src, alt, className }) {
  return (
    <img
      className={className}
      src={src || PLACEHOLDER_IMAGE}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = PLACEHOLDER_IMAGE;
      }}
    />
  );
}
