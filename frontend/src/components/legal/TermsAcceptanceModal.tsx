import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

/** Blocks the app until the signed-in officer has accepted the Terms of Use and Privacy Notice. */
export const TermsAcceptanceModal: React.FC = () => {
  const { user, acceptTerms, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.terms_accepted_at) return null;

  const accept = async () => {
    setBusy(true);
    setError('');
    try {
      await acceptTerms();
    } catch {
      setError('Could not record your acceptance. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title="Terms of Use and Privacy Notice"
      onClose={() => {}}
      footer={
        <>
          <Button variant="ghost" onClick={logout} disabled={busy}>Sign out</Button>
          <Button onClick={accept} disabled={busy}>{busy ? 'Saving…' : 'Accept and continue'}</Button>
        </>
      }
    >
      <p className="mb-3">Before you continue, please confirm that you understand and accept the following:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Access is for authorised AICTE officers, for official purposes only.</li>
        <li>You are responsible for your account and must keep your credentials confidential.</li>
        <li>Do not share complainant data or extract records in bulk.</li>
        <li>All actions are recorded with your user ID and the time.</li>
        <li>Overlap, duplicate, category and risk outputs are advisory; you remain responsible for decisions.</li>
        <li>Personal data is processed only for handling complaints, in line with the DPDP Act, 2023.</li>
      </ul>
      <p className="mt-3 text-sm">
        Read the full <Link to="/terms" target="_blank" className="underline">Terms of Use</Link> and{' '}
        <Link to="/privacy" target="_blank" className="underline">Privacy Notice</Link>.
      </p>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Modal>
  );
};
