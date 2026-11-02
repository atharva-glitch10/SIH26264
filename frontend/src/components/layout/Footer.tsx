import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <footer className={`border-t border-slate-200/80 bg-white/70 px-8 py-4 text-xs text-slate-500 print:hidden flex flex-col sm:flex-row items-center justify-between gap-2 select-none ${className}`}>
    <span>© 2026 All India Council for Technical Education (AICTE) · Ministry of Education, Govt. of India</span>
    <div className="flex items-center gap-3">
      <Link to="/terms" className="hover:text-slate-800 transition-colors">Terms of Use</Link>
      <span>·</span>
      <Link to="/privacy" className="hover:text-slate-800 transition-colors">Privacy Notice</Link>
      <span>·</span>
      <Link to="/terms" className="hover:text-slate-800 transition-colors">Accessibility</Link>
    </div>
  </footer>
);

export default Footer;
