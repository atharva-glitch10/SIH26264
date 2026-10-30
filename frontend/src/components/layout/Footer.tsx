import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <footer className={`border-t border-border bg-surface px-6 py-3 text-xs text-muted print:hidden ${className}`}>
    <span>© 2026 All India Council for Technical Education</span>
    <span className="mx-2">·</span>
    <Link to="/terms" className="hover:underline">Terms of Use</Link>
    <span className="mx-2">·</span>
    <Link to="/privacy" className="hover:underline">Privacy Notice</Link>
    <span className="mx-2">·</span>
    <Link to="/terms" className="hover:underline">Accessibility</Link>
  </footer>
);
