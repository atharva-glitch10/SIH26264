# CLAUDE.md

## Frontend map

- Public legal pages /terms and /privacy: pages/legal (LegalLayout); Footer in components/layout; TermsAcceptanceModal (components/legal) blocks the app until accepted
- UI kit in components/ui — use it for all new UI; follow design spec in CLAUDE.md

## Backend map

- User.terms_accepted_at; POST /api/v1/auth/accept-terms sets it and /auth/me returns it (test_terms_acceptance_is_recorded_per_user)

Style: use components/ui only. Palette brand #1F3A5F, page #F5F6F8, borders #D9DEE5. No gradients, no emoji, no sparkle/robot icons, no animate-pulse, no pill-shaped badges, no 'AI' wording in UI. Radius 4/6px. Borders instead of shadows.
