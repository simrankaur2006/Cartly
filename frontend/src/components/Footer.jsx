import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong>Cartly</strong>
          <p className="muted small">A demo e-commerce management system built with React, Spring Boot, MongoDB and Clerk.</p>
        </div>
        <div className="footer-links">
          <Link to="/products">Shop all</Link>
          <Link to="/orders">My orders</Link>
          <Link to="/profile">Profile</Link>
        </div>
        <p className="muted small">Payments are a demo only. No real money is charged.</p>
      </div>
    </footer>
  );
}
