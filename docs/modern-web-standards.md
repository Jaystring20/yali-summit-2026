# Modern Web Standards (2025)
**Production-Grade Development Guide for YALI Nigeria Platform**

---

## TypeScript Best Practices

### Type Safety Without Type Gymnastics

**Philosophy:**
- TypeScript should make code MORE readable, not less
- Use inference over explicit typing when possible
- Avoid `any` like the plague
- No `as` casting unless absolutely necessary

### Component Props Pattern

```tsx
// ❌ BAD: Interface for everything
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "secondary";
  disabled?: boolean;
}

export function Button({ children, onClick, variant, disabled }: ButtonProps) {
  // ...
}

// ✅ GOOD: Inline type for simple components
export function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  // ...
}

// ✅ BEST: Extend native elements when possible
import { ComponentProps } from "react";

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      {...props}
      className={cn(
        "min-h-12 px-6 rounded-full",
        variant === "primary" && "bg-accent text-white",
        variant === "secondary" && "border border-accent text-accent",
        className
      )}
    />
  );
}
```

### Supabase Type Generation

```bash
# Generate types from Supabase schema
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

```tsx
import { Database } from "@/types/supabase";

type Registration = Database["public"]["Tables"]["registrations"]["Row"];
type RegistrationInsert = Database["public"]["Tables"]["registrations"]["Insert"];

// Use in queries
const { data } = await supabase
  .from("registrations")
  .select("*")
  .returns<Registration[]>(); // Type-safe!
```

### Discriminated Unions for State

```tsx
// ❌ BAD: Boolean soup
type FormState = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data: Registration | null;
  error: Error | null;
};

// ✅ GOOD: Discriminated union
type FormState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Registration }
  | { status: "error"; error: Error };

const [state, setState] = useState<FormState>({ status: "idle" });

// Type-safe access
if (state.status === "success") {
  console.log(state.data.email); // ✅ TypeScript knows data exists
}
```

---

## React Patterns (2025)

### Server Components vs Client Components (Not applicable to Lovable, but know the difference)

Lovable uses Vite (client-side only), but understanding this helps for future migrations:

```tsx
// Server Component (default in Next.js 13+)
async function SpeakerList() {
  const speakers = await db.speakers.findMany(); // Direct DB access
  return <>{/* Render */}</>;
}

// Client Component (all Lovable components are this)
"use client"; // Would use this in Next.js

import { useState } from "react";

function SpeakerList() {
  const [speakers, setSpeakers] = useState([]);
  // Fetch via API
}
```

### Custom Hooks (Keep Logic Separate)

```tsx
// ❌ BAD: Logic in component
export function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await supabase.from("registrations").insert(formData);
      setStep(step + 1);
    } catch (error) {
      // ...
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 200 lines of form logic...
}

// ✅ GOOD: Logic in custom hook
export function useRegistrationForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    // Logic here
  };
  
  return { step, formData, isSubmitting, handleSubmit, setStep };
}

export function RegistrationForm() {
  const form = useRegistrationForm();
  
  return (
    // Clean JSX only
  );
}
```

### Error Boundaries (User-Friendly Failures)

```tsx
import { Component, ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    // Send to error tracking (Sentry, LogRocket, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <h2 className="text-2xl font-bold text-error mb-4">
              Something went wrong
            </h2>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="min-h-12 px-6 bg-accent text-white rounded-full"
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<FallbackUI />}>
  <RegistrationForm />
</ErrorBoundary>
```

---

## Code Organization

### File Structure (Scalable)

```
src/
├── components/
│   ├── ui/              # Shadcn components (Button, Card, etc.)
│   ├── layout/          # AppShell, BottomTabBar, SideDrawer
│   ├── forms/           # RegistrationForm, SponsorInquiryForm
│   └── features/        # Feature-specific components
│       ├── registration/
│       │   ├── StepOne.tsx
│       │   ├── StepTwo.tsx
│       │   └── useRegistrationForm.ts
│       └── schedule/
│           ├── Timeline.tsx
│           └── SessionCard.tsx
├── lib/
│   ├── supabase.ts      # Supabase client
│   ├── utils.ts         # cn() and other utilities
│   └── constants.ts     # TRACKS, STATES, etc.
├── hooks/
│   ├── useOnlineStatus.ts
│   ├── usePullToRefresh.ts
│   └── useLocalStorage.ts
├── types/
│   ├── supabase.ts      # Generated from Supabase
│   └── index.ts         # App-specific types
├── pages/               # Route components (if using React Router)
│   ├── Home.tsx
│   ├── Summit.tsx
│   └── Schedule.tsx
└── App.tsx              # Root component
```

### Naming Conventions

```tsx
// Components: PascalCase
export function RegistrationForm() {}

// Hooks: camelCase with "use" prefix
export function useRegistrationForm() {}

// Utilities: camelCase
export function formatDate() {}

// Constants: SCREAMING_SNAKE_CASE
export const NIGERIAN_STATES = [...];

// Types: PascalCase
export type Registration = {...};

// Enums: PascalCase (avoid, use const objects instead)
// ❌ enum Track { HealthTech, AgriTech }
// ✅ const TRACKS = { HEALTH_TECH: "healthtech", AGRI_TECH: "agritech" } as const;
```

---

## Performance Optimization

### Code Splitting (Route-Based)

```tsx
import { lazy, Suspense } from "react";

// ❌ BAD: All components loaded upfront
import Home from "./pages/Home";
import Summit from "./pages/Summit";
import Schedule from "./pages/Schedule";

// ✅ GOOD: Lazy load routes
const Home = lazy(() => import("./pages/Home"));
const Summit = lazy(() => import("./pages/Summit"));
const Schedule = lazy(() => import("./pages/Schedule"));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/summit" element={<Summit />} />
        <Route path="/schedule" element={<Schedule />} />
      </Routes>
    </Suspense>
  );
}
```

### Memoization (When to Use)

```tsx
import { memo, useMemo, useCallback } from "react";

// ❌ BAD: Memoize everything
const MemoizedButton = memo(Button);
const memoizedValue = useMemo(() => value, [value]);
const memoizedCallback = useCallback(() => {}, []);

// ✅ GOOD: Memoize only when necessary
// 1. memo() for expensive components that receive same props
const ExpensiveChart = memo(function Chart({ data }) {
  // Heavy D3 rendering
});

// 2. useMemo() for expensive computations
const sortedSpeakers = useMemo(() => {
  return speakers
    .filter(/* complex filter */)
    .sort(/* complex sort */);
}, [speakers]);

// 3. useCallback() when passing to memoized children
const handleClick = useCallback(() => {
  // Logic
}, [dependencies]);

<MemoizedChild onClick={handleClick} />
```

### Image Optimization

```tsx
// Use next-gen formats
<picture>
  <source srcSet="/hero.avif" type="image/avif" />
  <source srcSet="/hero.webp" type="image/webp" />
  <img src="/hero.jpg" alt="YALI Summit" loading="lazy" />
</picture>

// Responsive images
<img
  src="/speaker-small.jpg"
  srcSet="/speaker-small.jpg 400w, /speaker-medium.jpg 800w, /speaker-large.jpg 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Speaker name"
/>
```

---

## Security Best Practices

### Environment Variables

```tsx
// ❌ BAD: Hardcoded secrets
const supabase = createClient(
  "https://xxx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);

// ✅ GOOD: Environment variables
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// .env file
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

// .env.example (commit this)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Input Sanitization

```tsx
import DOMPurify from "isomorphic-dompurify";

// User-generated content
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// Form validation (client + server)
import { z } from "zod";

const registrationSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+234\d{10}$/),
  fullName: z.string().min(2).max(100)
});

const result = registrationSchema.safeParse(formData);
if (!result.success) {
  // Handle errors
}
```

### Supabase Row Level Security (RLS)

```sql
-- Enable RLS on registrations table
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Users can only read their own registration
CREATE POLICY "Users can read own registration"
  ON registrations
  FOR SELECT
  USING (email = auth.jwt() ->> 'email');

-- Anyone can insert (public registration)
CREATE POLICY "Anyone can register"
  ON registrations
  FOR INSERT
  WITH CHECK (true);
```

---

## Testing Strategy

### Unit Tests (Vitest)

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByText("Click me").click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### E2E Tests (Playwright)

```tsx
import { test, expect } from "@playwright/test";

test("user can register for summit", async ({ page }) => {
  await page.goto("http://localhost:5173");
  
  // Click Register button
  await page.click('text=Register Free');
  
  // Fill form
  await page.fill('input[name="fullName"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="phone"]', '+2348012345678');
  
  // Select track
  await page.click('text=FinTech');
  
  // Submit
  await page.click('text=Complete Registration');
  
  // Verify success
  await expect(page.locator('text=You\'re Registered!')).toBeVisible();
});
```

---

## Git Workflow

### Commit Messages (Conventional Commits)

```bash
# Format: <type>(<scope>): <subject>

feat(registration): add multi-step form
fix(schedule): correct timezone display
docs(readme): update setup instructions
style(button): adjust padding for mobile
refactor(hooks): extract useRegistration logic
perf(images): add lazy loading
test(forms): add validation tests
chore(deps): upgrade Supabase client
```

### Branch Naming

```bash
feature/registration-form
fix/mobile-nav-overflow
chore/update-dependencies
hotfix/payment-webhook
```

### Pre-commit Hooks (Husky)

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## Deployment Checklist

### Pre-Launch

- [ ] Environment variables set in production
- [ ] Supabase RLS policies enabled
- [ ] Service worker registered and caching correctly
- [ ] PWA manifest.json linked
- [ ] Icons generated (72px–512px)
- [ ] Lighthouse score: Performance >90, Accessibility >95
- [ ] Mobile tested on real devices (iOS Safari, Android Chrome)
- [ ] Offline mode tested
- [ ] Forms validated (client + server)
- [ ] Error boundaries in place
- [ ] Analytics configured (Plausible, GA4, etc.)
- [ ] GDPR/Privacy policy linked
- [ ] Social meta tags (og:image, twitter:card)

### Post-Launch Monitoring

```tsx
// Error tracking (Sentry)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1, // 10% of transactions
});

// Performance monitoring (Web Vitals)
import { onCLS, onFID, onLCP } from "web-vitals";

onCLS(console.log);
onFID(console.log);
onLCP(console.log);
```

---

## Dependency Management

### Essential Dependencies (Lovable Default)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@supabase/supabase-js": "^2.39.0",
    "framer-motion": "^10.16.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.294.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "vite": "^5.0.0"
  }
}
```

### Keep Dependencies Minimal

❌ **Avoid:**
- Lodash (use native methods)
- Moment.js (use date-fns or native Intl)
- jQuery (you don't need it)
- Axios (use native fetch)

✅ **Use:**
- Native JavaScript APIs
- Small, focused libraries
- Tree-shakeable packages

---

## Quick Reference: Modern JavaScript

### Array Methods (No Loops)

```tsx
// Filter
const delegates = registrations.filter(r => r.attendee_type === "delegate");

// Map
const emails = registrations.map(r => r.email);

// Reduce
const totalByTrack = registrations.reduce((acc, r) => {
  acc[r.track_selection] = (acc[r.track_selection] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

// Find
const user = registrations.find(r => r.email === "test@example.com");

// Some/Every
const hasDelegate = registrations.some(r => r.attendee_type === "delegate");
const allConfirmed = registrations.every(r => r.email_confirmed);
```

### Optional Chaining & Nullish Coalescing

```tsx
// ❌ OLD
const name = user && user.profile && user.profile.name;
const count = data.count !== null && data.count !== undefined ? data.count : 0;

// ✅ NEW
const name = user?.profile?.name;
const count = data.count ?? 0;
```

### Destructuring

```tsx
// Objects
const { fullName, email, track_selection: track } = registration;

// Arrays
const [first, second, ...rest] = registrations;

// Function parameters
function Component({ title, description, ...props }: Props) {
  return <div {...props}>{title}</div>;
}
```

---

**End of Modern Web Standards Guide**

For TypeScript docs: https://www.typescriptlang.org/docs/
For React best practices: https://react.dev/learn
