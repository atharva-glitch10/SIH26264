import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import { TERMS_LAST_UPDATED } from './TermsOfUse';

const SECTIONS: LegalSection[] = [
  {
    id: 'data-processed',
    title: 'What data is processed',
    body: (
      <>
        <p>The System processes:</p>
        <ul>
          <li>complainant details: name and contact details, where the complainant has provided them;</li>
          <li>complaint content: the complaint text and related case records, such as status, actions and remarks;</li>
          <li>officer activity logs: which officer did what, and when.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'purpose-limitation',
    title: 'Purpose limitation',
    body: (
      <p>
        Data is used only to receive, route, monitor and resolve complaints about technical institutions, to detect
        duplicate or overlapping complaints across Bureaus, to track service-level deadlines, and to keep an audit trail.
        It is not used for unrelated purposes.
      </p>
    ),
  },
  {
    id: 'legal-basis',
    title: 'Legal basis and alignment with the DPDP Act, 2023',
    body: (
      <p>
        Processing is intended to align with the Digital Personal Data Protection Act, 2023, including its principles of
        lawful and limited use, accuracy, storage limitation and security safeguards. The specific legal basis for each
        processing activity is to be confirmed by AICTE's legal team.
      </p>
    ),
  },
  {
    id: 'retention',
    title: 'Retention',
    body: (
      <p>
        Complaint records and audit logs are kept for as long as needed for the purposes above and for any period AICTE
        is required to keep official records. The exact retention periods will be set by AICTE before this text is adopted.
      </p>
    ),
  },
  {
    id: 'access-sharing',
    title: 'Access and sharing',
    body: (
      <p>
        Data is available only to authorised AICTE officers and Bureaus, according to their role. It is not shared with
        third parties. People who submit a complaint can check its status using their reference number, which shows
        progress only and no personal data.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Security measures',
    body: (
      <ul>
        <li>Passwords are stored as salted hashes, never in plain text.</li>
        <li>Sessions use signed, time-limited tokens.</li>
        <li>Access is role-based, and every action is recorded in an audit trail.</li>
      </ul>
    ),
  },
  {
    id: 'rights',
    title: 'Rights of data principals and grievance contact',
    body: (
      <>
        <p>
          Under the DPDP Act, 2023, individuals whose data is processed may ask to access, correct or erase it, may
          nominate another person to exercise their rights, and may raise a grievance about how their data is handled.
        </p>
        <p>Requests and grievances should go to AICTE's designated contact. These details will be added before adoption.</p>
      </>
    ),
  },
  {
    id: 'synthetic-data',
    title: 'Synthetic data notice for this prototype',
    body: (
      <p>
        This prototype runs on synthetic (made-up) data. It is not connected to AICTE's live databases and holds no real
        complainant information.
      </p>
    ),
  },
];

export const PrivacyNotice: React.FC = () => (
  <LegalLayout title="Privacy Notice" lastUpdated={TERMS_LAST_UPDATED} sections={SECTIONS} />
);
