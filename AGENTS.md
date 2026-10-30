# CLAUDE.md

## Frontend map

- Public legal pages /terms and /privacy: pages/legal (LegalLayout); Footer in components/layout; TermsAcceptanceModal (components/legal) blocks the app until accepted
- UI kit in components/ui — use it for all new UI; follow design spec in CLAUDE.md

## Backend map

- User.terms_accepted_at; POST /api/v1/auth/accept-terms sets it and /auth/me returns it (test_terms_acceptance_is_recorded_per_user)

Style (design system v2, light mode; preview at /design-system): colours are CSS variables in src/index.css (RGB triplets, Tailwind names unchanged) so dark mode = redefine them.
Primary deep navy `brand` #1B2A6B; saffron `accent` #F5A524 for fills/badges/icons/CTA only, always dark text on it, never as text on white; links #2547C4; page #F3F5FA. All text pairs meet WCAG AA.
Fonts: Plus Jakarta Sans (headings, `font-display`) + Inter (body). Scale 12/14/16/20/24/32/48 via text-xs/sm/base/xl/2xl/3xl/5xl. 8px grid; radius sm 8px (controls), md 12px (cards/modals); cards use border + shadow-card.
One `cta` Button per screen; others primary/secondary/ghost. Use ui/Field (Input/Select/Textarea), Badge (Tag is an alias), Toast (useToast), Skeleton, EmptyState/ErrorState, Modal (framer-motion, 150-250ms, no bounce). Lucide icons only.
