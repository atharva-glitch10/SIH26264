import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';

export const TERMS_LAST_UPDATED = '29 October 2026';

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'purpose',
    title: 'Purpose and scope',
    body: (
      <>
        <p>
          The Complaint Monitoring System (the "System") gives the All India Council for Technical Education (AICTE) a single
          view of complaints about technical institutions, whichever Bureau or Cell received them.
        </p>
        <p>
          The System is for authorised AICTE officers only. By signing in you confirm that you have been given access in
          your official capacity and that you accept these Terms.
        </p>
      </>
    ),
  },
  {
    id: 'account',
    title: 'Account responsibility and credential confidentiality',
    body: (
      <>
        <p>You are responsible for everything done under your account. You must:</p>
        <ul>
          <li>keep your password confidential and not share it, even with colleagues;</li>
          <li>sign out when you leave a shared or public device;</li>
          <li>report a suspected compromise of your credentials to the System administrator immediately.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <ul>
        <li>Use the System for official AICTE purposes only.</li>
        <li>Do not share complainant data with anyone who is not authorised to receive it.</li>
        <li>Do not carry out bulk extraction, scraping or copying of records beyond the exports your role permits.</li>
        <li>Do not attempt to access data or functions outside your role, or to bypass any control in the System.</li>
      </ul>
    ),
  },
  {
    id: 'access-and-audit',
    title: 'Role-based access and audit logging',
    body: (
      <>
        <p>
          What you can change depends on your role and Bureau. Every action in the System is recorded with the user and the
          time, and these records may be reviewed to check compliance with these Terms.
        </p>
      </>
    ),
  },
  {
    id: 'decision-support',
    title: 'Decision support disclaimer',
    body: (
      <p>
        Overlap alerts, duplicate flags, suggested categories, priority hints and risk scores are advisory. They are
        produced by automated rules and statistical methods and can be wrong. Officers remain responsible for their
        decisions and should check the underlying records before acting.
      </p>
    ),
  },
  {
    id: 'data-accuracy',
    title: 'Data accuracy and corrections',
    body: (
      <p>
        Records reflect what was entered or imported. If you find an error, correct it through the System where your role
        allows it, or tell the administrator. Do not rely on the System as the only record for a legal or disciplinary
        decision without checking the source documents.
      </p>
    ),
  },
  {
    id: 'availability',
    title: 'Availability and changes',
    body: (
      <p>
        The System may be unavailable for maintenance or for reasons outside AICTE's control. Features, rules and these
        Terms may change. The date at the top of this page shows the latest version, and you may be asked to accept
        updated Terms.
      </p>
    ),
  },
  {
    id: 'suspension',
    title: 'Suspension of access',
    body: (
      <p>
        AICTE may suspend or withdraw access at any time, including where these Terms are breached, where an officer
        changes role or leaves, or where security requires it.
      </p>
    ),
  },
  {
    id: 'governing-framework',
    title: 'Governing framework',
    body: (
      <p>
        Use of the System is governed by the Information Technology Act, 2000 and applicable Government of India policies
        and guidelines. Misuse may lead to disciplinary action and other action under those laws.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about these Terms or about your access should be sent to the System administrator at AICTE. Contact
        details will be added before this text is adopted.
      </p>
    ),
  },
];

export const TermsOfUse: React.FC = () => (
  <LegalLayout title="Terms of Use" lastUpdated={TERMS_LAST_UPDATED} sections={TERMS_SECTIONS} />
);
