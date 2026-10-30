import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <EmptyState
        title="404 — Page not found"
        description="The requested dashboard view or record does not exist or has been archived."
        action={
          <Link
            to="/"
            className="inline-flex items-center h-9 px-4 text-sm font-medium rounded-sm bg-brand text-white hover:bg-brand-hover"
            style={{ color: '#fff' }}
          >
            Return to overview
          </Link>
        }
      />
    </div>
  );
};
