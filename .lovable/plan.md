# Add "Sign in" link to header

Edit `src/components/TopNav.tsx` only.

## Desktop (lg breakpoint)
In the right-side action cluster (around line 188–202), insert a `<Link to="/login">Sign in</Link>` before the "Register" button. Style as a ghost/text link so "Register" remains the primary CTA:

- text: "Sign in"
- classes: `px-4 py-2 rounded-full text-sm font-semibold text-brand-navy/80 hover:text-accent-cyan dark:text-white/80 dark:hover:text-[#00D9FF] transition-colors`

## Mobile (sheet drawer)
In the action stack inside the Sheet (around line 246–261), insert a `<Link to="/login">Sign in</Link>` above "Register". Use an outlined style so the cyan-filled Register stays the primary CTA:

- text: "Sign in"
- closes the sheet on click (`onClick={() => setOpen(false)}`)
- classes: `px-5 py-3 rounded-full text-sm font-semibold text-center border border-brand-navy/20 dark:border-white/20 text-brand-navy dark:text-white active:scale-95`

No other files change. The `/login` route already exists.
