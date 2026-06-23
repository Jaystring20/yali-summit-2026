# PWA UX Patterns
**Mobile-First User Experience Guide for YALI Nigeria Platform**

---

## Core UX Principles

**Context:**
- 70% of Nigerian traffic is mobile (375px–428px screens)
- 3G/4G connections (4–8 second perceived load times)
- Users expect app-like behavior (Instagram, WhatsApp, banking apps)
- Touch-first interaction (no hover states)

**Goals:**
- Zero learning curve (familiar patterns from apps they use daily)
- Instant feedback (optimistic UI, no "dead air" waiting states)
- Offline-graceful (degrades elegantly when connection drops)
- One-hand usable (thumb-zone optimization)

---

## Pattern 1: Thumb Zone Optimization

### The Anatomy of Mobile Reach

```
┌─────────────────────────┐
│  Hard to Reach (Top)    │ ← Avoid CTAs here
│  ──────────────────     │
│                         │
│  Easy to Reach (Middle) │ ← Content, secondary actions
│  ──────────────────     │
│                         │
│  Natural Thumb Zone     │ ← PRIMARY CTAs here
│  (Bottom 25% of screen) │
└─────────────────────────┘
```

### Implementation

**✅ DO:**
- Bottom tab bar (fixed, always accessible)
- Primary CTA buttons in bottom 25% of screen
- FABs in bottom-right corner (right-handed default, 80% of users)

**❌ DON'T:**
- Top nav hamburger menus (requires hand repositioning)
- CTAs above the fold on mobile (users miss them)
- Swipe gestures that require two hands

### Code Example: Safe Area Insets (iOS Notch)

```tsx
// Account for iPhone notch and Android gesture bars
<div className="pb-safe">
  <BottomTabBar />
</div>

// In globals.css
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

---

## Pattern 2: Touch Target Sizing

### Minimum Sizes (WCAG 2.1 AA)

- **Buttons/Links:** 44x44px minimum (iOS guideline)
- **Android Material:** 48x48px minimum
- **Comfortable:** 56x56px (recommended for primary actions)

### Implementation

```tsx
// ❌ BAD: Too small for fat fingers
<button className="px-2 py-1 text-sm">
  Register
</button>

// ✅ GOOD: Accessible touch target
<button className="min-h-12 px-6 py-3 text-base rounded-full">
  Register Free
</button>

// ✅ BETTER: Visual size vs touch target separation
<button className="relative px-4 py-2 text-sm">
  <span className="relative z-10">Register</span>
  {/* Invisible larger touch area */}
  <span className="absolute inset-0 -m-2" aria-hidden="true" />
</button>
```

### Spacing Between Tappable Elements

- Minimum gap: **8px** (prevent mis-taps)
- Comfortable gap: **12–16px**

```tsx
// Bottom tab bar spacing
<nav className="flex justify-around gap-4 px-4">
  {tabs.map((tab) => (
    <button key={tab.id} className="flex-1 min-h-12">
      {/* Tab content */}
    </button>
  ))}
</nav>
```

---

## Pattern 3: Gesture Vocabulary

### Standard Mobile Gestures

| Gesture | Action | Implementation |
|---------|--------|----------------|
| **Tap** | Select, activate | `onClick` |
| **Long press** | Context menu, more options | `onContextMenu` or timer |
| **Swipe horizontal** | Navigate between tabs | Framer Motion `drag="x"` |
| **Swipe vertical** | Scroll, pull-to-refresh | Native scroll + custom handler |
| **Pinch** | Zoom (images only) | Avoid for UI elements |
| **Double tap** | Like, favorite | Avoid (conflicts with zoom) |

### Swipe-to-Dismiss (Bottom Sheet)

```tsx
import { motion, useDragControls } from "framer-motion";

export function SwipeableBottomSheet({ onClose, children }) {
  const dragControls = useDragControls();

  return (
    <motion.div
      drag="y"
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(event, info) => {
        if (info.offset.y > 150) {
          onClose(); // Swipe down >150px = dismiss
        }
      }}
      className="fixed bottom-0 inset-x-0 bg-surface rounded-t-2xl"
    >
      {/* Drag handle */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
      >
        <div className="w-10 h-1 bg-border rounded-full" />
      </div>
      
      {children}
    </motion.div>
  );
}
```

### Pull-to-Refresh (Home Tab)

```tsx
import { useEffect, useState } from "react";

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        const currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 80) {
          setIsPulling(true);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (isPulling) {
        await onRefresh();
        setIsPulling(false);
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [startY, isPulling, onRefresh]);

  return { isPulling };
}
```

---

## Pattern 4: Loading States (Optimistic UI)

### The 3-Tier Loading Hierarchy

1. **Instant feedback** (<100ms): Visual state change, no spinner
2. **Short wait** (100ms–1s): Skeleton loader
3. **Long wait** (>1s): Progress indicator with message

### Implementation

```tsx
// Tier 1: Instant (Button state)
const [isSubmitting, setIsSubmitting] = useState(false);

<button 
  onClick={async () => {
    setIsSubmitting(true); // Instant visual feedback
    await submitForm();
    setIsSubmitting(false);
  }}
  disabled={isSubmitting}
  className={cn(
    "min-h-12 px-6 rounded-full",
    isSubmitting && "opacity-50 cursor-not-allowed"
  )}
>
  {isSubmitting ? "Submitting..." : "Register Free"}
</button>

// Tier 2: Skeleton (Content loading)
{isLoading ? (
  <SkeletonCard />
) : (
  <SpeakerCard data={speaker} />
)}

// Tier 3: Progress (Large data fetch)
{isFetchingSchedule && (
  <div className="flex flex-col items-center gap-4 py-12">
    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    <p className="text-sm text-secondary">Loading 4-day schedule...</p>
  </div>
)}
```

### Optimistic UI Example (Registration)

```tsx
const [registrations, setRegistrations] = useState<Registration[]>([]);

const handleRegister = async (formData: FormData) => {
  // 1. Optimistically add to UI (instant feedback)
  const optimisticRegistration = {
    id: crypto.randomUUID(),
    ...formData,
    status: "pending"
  };
  setRegistrations((prev) => [...prev, optimisticRegistration]);

  try {
    // 2. Actual API call
    const result = await supabase
      .from("registrations")
      .insert(formData)
      .select()
      .single();

    // 3. Replace optimistic with real data
    setRegistrations((prev) =>
      prev.map((r) => (r.id === optimisticRegistration.id ? result.data : r))
    );
  } catch (error) {
    // 4. Rollback on error
    setRegistrations((prev) =>
      prev.filter((r) => r.id !== optimisticRegistration.id)
    );
    toast.error("Registration failed. Please try again.");
  }
};
```

---

## Pattern 5: Form Interactions (Mobile-First)

### Input Field Best Practices

```tsx
// ✅ GOOD: Mobile-optimized input
<label className="block space-y-2">
  <span className="text-sm font-medium text-secondary">Email</span>
  <input
    type="email"
    inputMode="email" // Shows email keyboard on mobile
    autoComplete="email"
    className="w-full min-h-12 px-4 rounded-lg border border-border bg-surface text-base" // text-base = 16px, prevents iOS zoom
    placeholder="you@example.com"
  />
</label>

// ❌ BAD: Desktop-centric input
<input
  type="text" // Wrong type
  className="px-2 py-1 text-sm" // Too small, iOS will zoom on focus
/>
```

### Input Types & Mobile Keyboards

| Input Type | `inputMode` | Keyboard Shown |
|------------|-------------|----------------|
| Email | `email` | @ and .com keys |
| Phone | `tel` | Number pad |
| Number | `numeric` | Number pad with symbols |
| URL | `url` | / and .com keys |
| Search | `search` | Search button instead of Enter |

### Multi-Step Form Navigation

```tsx
<div className="space-y-6">
  {/* Progress indicator */}
  <div className="flex items-center gap-2">
    {steps.map((step, index) => (
      <div
        key={step.id}
        className={cn(
          "flex-1 h-1 rounded-full",
          index <= currentStep ? "bg-accent" : "bg-border"
        )}
      />
    ))}
  </div>

  {/* Step content */}
  <AnimatePresence mode="wait">
    <motion.div key={currentStep} {...stepTransition}>
      {steps[currentStep].component}
    </motion.div>
  </AnimatePresence>

  {/* Navigation */}
  <div className="flex gap-4">
    {currentStep > 0 && (
      <button
        onClick={() => setCurrentStep(currentStep - 1)}
        className="flex-1 min-h-12 border border-border rounded-full"
      >
        Back
      </button>
    )}
    <button
      onClick={() => setCurrentStep(currentStep + 1)}
      className="flex-1 min-h-12 bg-accent text-white rounded-full"
    >
      {currentStep === steps.length - 1 ? "Complete" : "Next"}
    </button>
  </div>
</div>
```

---

## Pattern 6: Offline UX (Network Resilience)

### Online/Offline Indicator

```tsx
import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Usage
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 inset-x-0 bg-warning text-white py-2 px-4 text-center text-sm z-50">
      You're offline. Some features may be limited.
    </div>
  );
}
```

### Offline Queue (Form Submissions)

```tsx
// Store failed submissions in localStorage
const queueSubmission = (data: FormData) => {
  const queue = JSON.parse(localStorage.getItem("offline_queue") || "[]");
  queue.push({ data, timestamp: Date.now() });
  localStorage.setItem("offline_queue", JSON.stringify(queue));
};

// Process queue when back online
useEffect(() => {
  const processQueue = async () => {
    if (!navigator.onLine) return;

    const queue = JSON.parse(localStorage.getItem("offline_queue") || "[]");
    
    for (const item of queue) {
      try {
        await supabase.from("registrations").insert(item.data);
      } catch (error) {
        console.error("Failed to sync:", error);
        return; // Stop processing if one fails
      }
    }

    localStorage.removeItem("offline_queue");
  };

  window.addEventListener("online", processQueue);
  return () => window.removeEventListener("online", processQueue);
}, []);
```

---

## Pattern 7: Accessibility (A11y)

### Keyboard Navigation

```tsx
// Tab order for bottom nav
<nav role="tablist" className="flex">
  {tabs.map((tab, index) => (
    <button
      key={tab.id}
      role="tab"
      aria-selected={currentTab === index}
      tabIndex={currentTab === index ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") setCurrentTab(Math.min(index + 1, tabs.length - 1));
        if (e.key === "ArrowLeft") setCurrentTab(Math.max(index - 1, 0));
      }}
    >
      {tab.label}
    </button>
  ))}
</nav>
```

### Screen Reader Announcements

```tsx
import { useEffect } from "react";

export function announceToScreenReader(message: string) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.className = "sr-only"; // Tailwind: visually hidden
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Usage
const handleRegistration = async () => {
  await submitForm();
  announceToScreenReader("Registration successful! Your ticket has been sent to your email.");
};
```

### Focus Management (Modals)

```tsx
import { useEffect, useRef } from "react";

export function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus modal
      modalRef.current?.focus();
      
      // Trap focus inside modal
      const handleTab = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          // ... focus trap logic
        }
      };
      
      document.addEventListener("keydown", handleTab);
      return () => document.removeEventListener("keydown", handleTab);
    } else {
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

---

## Pattern 8: Performance Perception

### Instant Page Transitions (No White Flash)

```tsx
// App shell stays rendered, only content swaps
const AppShell = () => (
  <div className="flex flex-col h-screen bg-primary">
    {/* Shell persists */}
    <BottomTabBar />
    
    {/* Only this changes */}
    <main className="flex-1 overflow-y-auto">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomeTab />} />
          <Route path="/summit" element={<SummitTab />} />
          {/* ... */}
        </Routes>
      </AnimatePresence>
    </main>
  </div>
);
```

### Image Lazy Loading

```tsx
<img
  src={speaker.photo}
  alt={speaker.name}
  loading="lazy" // Native lazy loading
  decoding="async" // Non-blocking decode
  className="w-24 h-24 rounded-full object-cover"
  onError={(e) => {
    e.currentTarget.src = "/placeholder-avatar.png"; // Fallback
  }}
/>
```

### Virtualized Lists (Large Datasets)

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

export function VirtualizedSpeakerList({ speakers }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: speakers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated item height
    overscan: 5 // Render 5 items outside viewport
  });

  return (
    <div ref={parentRef} className="h-screen overflow-y-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <SpeakerCard speaker={speakers[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Quick Reference: Nigerian Mobile Context

### Connection Speeds
- **3G:** 0.4–2 Mbps (4–10 second page load)
- **4G:** 5–20 Mbps (1–2 second page load)
- **WiFi:** Variable (office: fast, public: slow)

### Optimization Targets
- **Time to Interactive:** <3 seconds on 3G
- **First Contentful Paint:** <1.5 seconds
- **Largest Contentful Paint:** <2.5 seconds

### Device Breakdown (Nigeria)
- **Android:** 75% (Samsung, Tecno, Infinix)
- **iOS:** 20% (iPhone 11–14)
- **Feature phones:** 5% (exclude from PWA)

### Screen Sizes (Most Common)
- **375x667:** iPhone 6/7/8/SE (legacy but still used)
- **390x844:** iPhone 12/13/14 (common)
- **360x800:** Samsung Galaxy A series (most popular Android)
- **414x896:** iPhone 11/XR (still popular)

---

**End of PWA UX Patterns Guide**

For accessibility testing: https://www.a11yproject.com/checklist/
