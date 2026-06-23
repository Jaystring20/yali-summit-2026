# 21st.dev — Next-Generation Web Development
**2025 Cutting-Edge Patterns for Production PWAs**

---

## Philosophy: Build for 2025, Run in 2024

**Core Principles:**
- Use **Web Platform APIs** over third-party libraries when possible
- Progressive Enhancement (works without JS, better with JS)
- Performance is a feature, not an optimization
- Build for global users (low bandwidth, diverse devices)
- AI-ready architecture (prepared for LLM integration)

---

## Modern Web Platform APIs

### 1. View Transitions API (Page Transitions Without JS)

```tsx
// Enable view transitions (Chrome 111+, Safari 18+)
document.startViewTransition(() => {
  // DOM update here
});

// React integration
import { flushSync } from "react-dom";

function navigate(to: string) {
  if (!document.startViewTransition) {
    // Fallback for unsupported browsers
    navigateWithoutTransition(to);
    return;
  }

  document.startViewTransition(() => {
    flushSync(() => {
      setCurrentRoute(to);
    });
  });
}

// CSS for transitions
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}

::view-transition-old(root) {
  animation-name: slide-out;
}

::view-transition-new(root) {
  animation-name: slide-in;
}

@keyframes slide-out {
  to { transform: translateX(-100%); }
}

@keyframes slide-in {
  from { transform: translateX(100%); }
}
```

**Why this matters:**
- Native browser transitions (60fps guaranteed)
- No Framer Motion bundle size (~50KB saved)
- Works across navigation (client-side routing)

---

### 2. Container Queries (Responsive Components, Not Pages)

```css
/* OLD: Media queries (page-level breakpoints) */
@media (max-width: 768px) {
  .card { flex-direction: column; }
}

/* NEW: Container queries (component-level breakpoints) */
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (max-width: 400px) {
  .card { flex-direction: column; }
}
```

```tsx
// React usage
export function ResponsiveCard({ children }) {
  return (
    <div className="container-type-inline-size"> {/* Tailwind utility */}
      <div className="@sm:flex-row @lg:grid-cols-2"> {/* @ prefix = container query */}
        {children}
      </div>
    </div>
  );
}
```

**Why this matters:**
- Cards adapt to their container, not viewport
- Reusable components (same card works in sidebar or main content)
- Better for component libraries

---

### 3. Popover API (Native Modals Without Z-Index Hell)

```html
<!-- OLD: Manual modal with backdrop, portal, z-index management -->
<div class="fixed inset-0 bg-black/50 z-40">
  <div class="fixed inset-0 z-50">
    <dialog>...</dialog>
  </div>
</div>

<!-- NEW: Native popover -->
<button popovertarget="registration-modal">Register</button>

<div id="registration-modal" popover>
  <h2>Registration Form</h2>
  <form>...</form>
  <button popovertarget="registration-modal" popovertargetaction="hide">
    Close
  </button>
</div>
```

```tsx
// React wrapper
export function Popover({ trigger, children }) {
  const id = useId();
  
  return (
    <>
      <button popovertarget={id}>{trigger}</button>
      <div id={id} popover="auto">
        {children}
      </div>
    </>
  );
}
```

**Why this matters:**
- Automatic focus management
- ESC key closes (built-in)
- Backdrop click closes (built-in)
- Top layer (no z-index needed)
- Accessibility (ARIA roles automatic)

---

### 4. Intersection Observer (Lazy Loading, Scroll Triggers)

```tsx
import { useEffect, useRef, useState } from "react";

export function useLazyLoad() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing after first load
        }
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Usage
export function LazyImage({ src, alt }) {
  const { ref, isVisible } = useLazyLoad();
  
  return (
    <div ref={ref}>
      {isVisible ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="w-full h-64 bg-border animate-pulse" />
      )}
    </div>
  );
}
```

---

### 5. Web Share API (Native Share Sheet)

```tsx
export function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const handleShare = async () => {
    if (!navigator.share) {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
      return;
    }

    try {
      await navigator.share({ title, text, url });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  };

  return (
    <button onClick={handleShare} className="min-h-12 px-6 rounded-full bg-accent text-white">
      Share Registration
    </button>
  );
}
```

**Why this matters:**
- Native share sheet (WhatsApp, Twitter, Email, etc.)
- Works on mobile AND desktop (not just mobile)
- No custom share menu needed

---

### 6. Web Animations API (Performant JS Animations)

```tsx
// Better than CSS transitions for complex animations
export function animateElement(element: HTMLElement) {
  element.animate(
    [
      { transform: "translateY(0)", opacity: 1 },
      { transform: "translateY(-20px)", opacity: 0 }
    ],
    {
      duration: 300,
      easing: "ease-out",
      fill: "forwards"
    }
  );
}

// React hook
export function useWebAnimation(
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      const animation = ref.current.animate(keyframes, options);
      return () => animation.cancel();
    }
  }, [keyframes, options]);

  return ref;
}
```

---

## Performance Patterns

### 1. Resource Hints (Preload, Prefetch, Preconnect)

```html
<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://YOUR_PROJECT.supabase.co">

<!-- Preload critical assets -->
<link rel="preload" href="/fonts/space-grotesk.woff2" as="font" type="font/woff2" crossorigin>

<!-- Prefetch next page (register page from homepage) -->
<link rel="prefetch" href="/register">

<!-- DNS prefetch (lower priority) -->
<link rel="dns-prefetch" href="https://analytics.example.com">
```

```tsx
// Dynamic prefetch on hover
export function PrefetchLink({ to, children }) {
  const handleMouseEnter = () => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = to;
    document.head.appendChild(link);
  };

  return (
    <Link to={to} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

---

### 2. Content Visibility (Virtual Scrolling Without Libraries)

```css
/* Browser-native virtualization */
.speaker-card {
  content-visibility: auto; /* Only render when in viewport */
  contain-intrinsic-size: 0 300px; /* Placeholder size */
}
```

**Performance gain:**
- 50–70% faster initial render for long lists
- No React Virtualized library needed
- Works with native scroll

---

### 3. Priority Hints (fetchpriority)

```html
<!-- Hero image = high priority -->
<img src="/hero.jpg" fetchpriority="high" alt="YALI Summit">

<!-- Below-fold image = low priority -->
<img src="/partner-logo.png" fetchpriority="low" loading="lazy">

<!-- Critical API call -->
<script>
  fetch("/api/stats", { priority: "high" });
</script>
```

---

### 4. Speculation Rules API (Instant Navigation)

```html
<script type="speculationrules">
{
  "prerender": [
    {
      "source": "list",
      "urls": ["/register", "/summit", "/schedule"]
    }
  ],
  "prefetch": [
    {
      "source": "document",
      "where": {
        "href_matches": "/speakers/*"
      }
    }
  ]
}
</script>
```

**Result:**
- Instant page loads (0ms perceived load time)
- Prerender = full page in background
- Prefetch = only fetch HTML/assets

---

## Modern CSS Patterns

### 1. CSS Nesting (No Preprocessor Needed)

```css
/* OLD: Separate selectors */
.card { }
.card:hover { }
.card .title { }

/* NEW: Nested (native in 2024+) */
.card {
  &:hover {
    background: var(--accent);
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
}
```

---

### 2. CSS Layers (Manage Specificity Hell)

```css
/* Define layers (order = specificity order) */
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; padding: 0; }
}

@layer components {
  .button { /* component styles */ }
}

@layer utilities {
  .mt-4 { margin-top: 1rem; } /* Always wins */
}
```

---

### 3. :has() Selector (Parent Selector!)

```css
/* OLD: Can't style parent based on child */

/* NEW: Parent selector */
.form:has(input:invalid) {
  border: 2px solid red;
}

.card:has(img) {
  display: grid;
  grid-template-columns: 200px 1fr;
}

/* No submit button? Hide footer */
form:not(:has(button[type="submit"])) footer {
  display: none;
}
```

---

### 4. Color Spaces (Wide Gamut Colors)

```css
/* OLD: RGB/HEX (sRGB color space, limited) */
color: #00D9FF;

/* NEW: Display P3 (30% more colors, HDR screens) */
color: color(display-p3 0 0.85 1);

/* With fallback */
color: #00D9FF;
color: color(display-p3 0 0.85 1);

/* Or use oklch (perceptually uniform) */
color: oklch(70% 0.2 200); /* Lightness, Chroma, Hue */
```

---

## AI-Ready Architecture

### 1. Structured Data for LLMs

```tsx
// Make your app LLM-readable
export function SpeakerCard({ speaker }) {
  return (
    <article itemScope itemType="https://schema.org/Person">
      <h2 itemProp="name">{speaker.name}</h2>
      <p itemProp="jobTitle">{speaker.title}</p>
      <p itemProp="worksFor" itemScope itemType="https://schema.org/Organization">
        <span itemProp="name">{speaker.company}</span>
      </p>
      <meta itemProp="image" content={speaker.photo} />
    </article>
  );
}
```

**Why this matters:**
- LLMs can extract structured data
- Better SEO (Google understands your content)
- Voice assistants can read your content accurately

---

### 2. AI-Generated Content Watermarking

```tsx
// Mark AI-generated content (upcoming standard)
export function AIGeneratedContent({ content, model, timestamp }) {
  return (
    <div data-ai-generated="true" data-model={model} data-timestamp={timestamp}>
      <meta name="generator" content={`AI:${model}`} />
      {content}
    </div>
  );
}
```

---

### 3. Embeddings for Semantic Search

```tsx
import { OpenAI } from "openai";

// Generate embeddings for search
export async function generateEmbedding(text: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });
  
  return response.data[0].embedding; // Array of 1536 floats
}

// Store in Supabase with pgvector
const { data } = await supabase
  .from("speakers")
  .insert({
    name: "Dr. Amara Nwosu",
    bio: "AI researcher...",
    embedding: await generateEmbedding("AI researcher...")
  });

// Semantic search
const { data } = await supabase.rpc("match_speakers", {
  query_embedding: await generateEmbedding("machine learning expert"),
  match_threshold: 0.8,
  match_count: 10
});
```

---

## Progressive Web App Advanced Features

### 1. Background Sync (Offline-First Submissions)

```tsx
// Register sync on form submit
export async function submitRegistration(data: FormData) {
  if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
    // Queue for background sync
    await navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register("sync-registrations");
    });
    
    // Store data locally
    await saveToIndexedDB("pending_registrations", data);
  } else {
    // Fallback: immediate submit
    await fetch("/api/register", { method: "POST", body: data });
  }
}

// In service worker
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-registrations") {
    event.waitUntil(syncRegistrations());
  }
});

async function syncRegistrations() {
  const pending = await getFromIndexedDB("pending_registrations");
  
  for (const data of pending) {
    await fetch("/api/register", { method: "POST", body: data });
  }
  
  await clearIndexedDB("pending_registrations");
}
```

---

### 2. Periodic Background Sync (Update Schedule)

```tsx
// Request periodic sync permission
navigator.serviceWorker.ready.then(async (registration) => {
  const status = await navigator.permissions.query({
    name: "periodic-background-sync"
  });
  
  if (status.state === "granted") {
    await registration.periodicSync.register("update-schedule", {
      minInterval: 60 * 60 * 1000 // 1 hour
    });
  }
});

// In service worker
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "update-schedule") {
    event.waitUntil(updateSchedule());
  }
});

async function updateSchedule() {
  const response = await fetch("/api/schedule");
  const schedule = await response.json();
  
  const cache = await caches.open("schedule-v1");
  await cache.put("/api/schedule", new Response(JSON.stringify(schedule)));
}
```

---

### 3. Web Push Notifications (Native)

```tsx
// Request permission
export async function subscribeToNotifications() {
  const permission = await Notification.requestPermission();
  
  if (permission === "granted") {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
    });
    
    // Send to backend
    await fetch("/api/push-subscribe", {
      method: "POST",
      body: JSON.stringify(subscription)
    });
  }
}

// In service worker
self.addEventListener("push", (event) => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      data: { url: data.url }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

---

## Modern Testing Patterns

### 1. Visual Regression Testing

```tsx
import { test, expect } from "@playwright/test";

test("registration form matches snapshot", async ({ page }) => {
  await page.goto("/register");
  
  // Take screenshot
  await expect(page).toHaveScreenshot("registration-form.png", {
    maxDiffPixels: 100 // Allow 100px difference
  });
});
```

---

### 2. Component Testing (Storybook + Playwright)

```tsx
// Button.stories.tsx
export default {
  title: "Components/Button",
  component: Button
};

export const Primary = {
  args: {
    variant: "primary",
    children: "Register Free"
  }
};

// Button.spec.tsx
import { test, expect } from "@playwright/experimental-ct-react";
import { Primary } from "./Button.stories";

test("renders primary button", async ({ mount }) => {
  const component = await mount(<Primary.component {...Primary.args} />);
  await expect(component).toContainText("Register Free");
});
```

---

## Deployment & Monitoring

### 1. Edge Functions (Vercel/Netlify/Cloudflare)

```tsx
// /api/register.ts (runs at the edge, <50ms latency)
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  const data = await req.json();
  
  // Validate
  const result = registrationSchema.safeParse(data);
  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 400
    });
  }
  
  // Insert to Supabase
  const { error } = await supabase.from("registrations").insert(data);
  
  return new Response(JSON.stringify({ success: !error }), {
    status: error ? 500 : 200
  });
}
```

---

### 2. Real User Monitoring (RUM)

```tsx
import { onCLS, onFID, onLCP, onINP, onTTFB } from "web-vitals";

function sendToAnalytics(metric) {
  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify(metric),
    keepalive: true // Send even if user closes tab
  });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics); // Deprecated, use INP
onINP(sendToAnalytics); // New: Interaction to Next Paint
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

**Target Metrics:**
- **LCP** (Largest Contentful Paint): <2.5s
- **INP** (Interaction to Next Paint): <200ms
- **CLS** (Cumulative Layout Shift): <0.1
- **TTFB** (Time to First Byte): <800ms

---

### 3. Feature Flags (Progressive Rollout)

```tsx
// /lib/features.ts
export function useFeatureFlag(flag: string) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    fetch(`/api/features/${flag}`)
      .then((res) => res.json())
      .then((data) => setIsEnabled(data.enabled));
  }, [flag]);

  return isEnabled;
}

// Usage
export function RegistrationForm() {
  const hasAIAutoFill = useFeatureFlag("ai_autofill");
  
  return (
    <form>
      {hasAIAutoFill && <AIAutoFillButton />}
      {/* ... */}
    </form>
  );
}
```

---

## Future-Forward Patterns

### 1. Web Components (Framework-Agnostic)

```tsx
// Define custom element (works in React, Vue, Svelte, vanilla JS)
class RegistrationButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <button class="min-h-12 px-6 bg-accent text-white rounded-full">
        ${this.getAttribute("label") || "Register"}
      </button>
    `;
    
    this.querySelector("button")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("register", {
        bubbles: true,
        detail: { timestamp: Date.now() }
      }));
    });
  }
}

customElements.define("registration-button", RegistrationButton);

// Usage in React
<registration-button 
  label="Register Free" 
  onRegister={(e) => console.log(e.detail)}
/>
```

---

### 2. WebAssembly (Performance-Critical Code)

```rust
// Heavy computation in Rust (compiles to WASM)
#[wasm_bindgen]
pub fn process_attendance(data: &[u8]) -> Vec<u8> {
    // Process 10,000+ registrations in <10ms
    // (would take 500ms+ in JS)
}
```

```tsx
import init, { process_attendance } from "./wasm/attendance.js";

await init(); // Load WASM module

const result = process_attendance(attendanceData);
```

---

### 3. Web GPU (Advanced Graphics)

```tsx
// For data visualization (schedule heatmaps, attendance graphs)
export async function initWebGPU() {
  if (!navigator.gpu) {
    throw new Error("WebGPU not supported");
  }

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter?.requestDevice();
  
  return device;
}

// Use for 60fps+ complex visualizations
```

---

## Quick Reference: 2025 Browser Support

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| View Transitions | 111+ | 18+ | ❌ | 111+ |
| Container Queries | 105+ | 16+ | 110+ | 105+ |
| Popover API | 114+ | 17+ | ❌ | 114+ |
| :has() selector | 105+ | 15.4+ | 103+ | 105+ |
| Color spaces (P3) | 111+ | 15+ | 113+ | 111+ |
| CSS Nesting | 112+ | 16.5+ | ❌ | 112+ |

**Strategy:** Use with fallbacks for older browsers.

---

## Performance Budget

```json
// budget.json (Lighthouse CI)
{
  "resourceSizes": [
    { "resourceType": "script", "budget": 250 },
    { "resourceType": "total", "budget": 500 }
  ],
  "timings": [
    { "metric": "interactive", "budget": 3000 },
    { "metric": "first-contentful-paint", "budget": 1500 }
  ]
}
```

**Enforcement:**
```bash
# Fail build if budget exceeded
npm run build && lighthouse-ci assert --budgets-file=budget.json
```

---

**End of 21st.dev Patterns Guide**

Stay updated: https://web.dev/blog
Browser support: https://caniuse.com
