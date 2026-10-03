import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <div className="container narrow">
      <EmptyState
        title="Page not found"
        text="The page you are looking for does not exist."
        action={
          <Link className="btn btn-primary" to="/">
            Go home
          </Link>
        }
      />
    </div>
  );
}
