# Motion & Animation Patterns for PWA
**Framer Motion Implementation Guide for YALI Nigeria Platform**

---

## Core Animation Philosophy

**Goals:**
- Enhance perceived performance (make the app feel faster than it is)
- Provide haptic-style feedback (visual bounce = tactile feel)
- Guide attention (animate what matters, static for everything else)
- Respect user preferences (honor prefers-reduced-motion)

**Constraints:**
- No animations >300ms (feels sluggish on mobile)
- Spring physics only (no linear/ease-in-out, feels robotic)
- GPU-accelerated properties only (transform, opacity — NO width/height/color animations)

---

## Installation

```bash
npm install framer-motion
```

---

## Pattern 1: Bottom Tab Transitions

```tsx
import { motion } from "framer-motion";

const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

// Usage in tab content
export function HomeTab() {
  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Tab content here */}
    </motion.div>
  );
}
```

**Why this works:**
- Entry from below (y: 20 → 0) = natural "push up" feeling
- Exit upward (y: 0 → -20) = content sliding away
- Spring physics = organic, not robotic

---

## Pattern 2: Button Tap Scale Effect

```tsx
import { motion } from "framer-motion";

export function CTAButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="bg-accent text-white rounded-full px-6 py-3"
    >
      {children}
    </motion.button>
  );
}
```

**Why this works:**
- `whileTap` = instant feedback (brain registers action in <100ms)
- 0.95 scale = subtle "press down" effect
- Spring bounce back = satisfying release

**Mobile-specific note:**
On touch devices, combine with `active:` Tailwind state for double feedback:
```tsx
className="... active:brightness-90"
```

---

## Pattern 3: Card Entrance Stagger

```tsx
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

// Usage for speaker grid or track cards
export function TrackCardsGrid({ tracks }: { tracks: Track[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {tracks.map((track) => (
        <motion.div
          key={track.id}
          variants={cardVariants}
          className="bg-surface rounded-xl p-6 shadow-lg"
        >
          {/* Track card content */}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

**Why this works:**
- Stagger (0.1s delay between cards) = choreographed, polished feel
- Cards enter from slightly below + scaled down = "popping into place"
- Parent controls timing (containerVariants) = single source of truth

---

## Pattern 4: Pull-to-Refresh Animation

```tsx
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";

export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<void>; children: React.ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 100], [0, 1]);
  const rotate = useTransform(y, [0, 100], [0, 360]);

  const handleDragEnd = async () => {
    if (y.get() > 80) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    y.set(0);
  };

  return (
    <div className="relative overflow-hidden">
      <motion.div
        style={{ opacity }}
        className="absolute top-0 left-0 right-0 flex justify-center py-4"
      >
        <motion.div style={{ rotate }} className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
      </motion.div>
      
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        {children}
      </motion.div>
    </div>
  );
}
```

**Why this works:**
- `dragElastic` = rubber-band effect (native app feeling)
- Spinner opacity tied to drag distance (visual feedback)
- Only triggers refresh if pulled >80px (prevents accidental triggers)

---

## Pattern 5: Bottom Sheet Slide-Up

```tsx
import { motion, AnimatePresence } from "framer-motion";

const sheetVariants = {
  hidden: { y: "100%" },
  visible: { 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    y: "100%",
    transition: {
      duration: 0.25
    }
  }
};

export function BottomSheet({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          
          {/* Sheet */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Drag handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>
            
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

**Why this works:**
- Slides from bottom (y: 100% → 0) = native sheet behavior
- Backdrop fades in (opacity: 0 → 0.5) = focuses attention
- Drag handle = visual affordance (users know they can swipe down)

**Use for:**
- Registration form (multi-step flow)
- Track details expansion
- Filter menus

---

## Pattern 6: Skeleton Loader (Content Loading State)

```tsx
import { motion } from "framer-motion";

const shimmerVariants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: { 
    backgroundPosition: "200% 0",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear"
    }
  }
};

export function SkeletonCard() {
  return (
    <motion.div
      variants={shimmerVariants}
      initial="initial"
      animate="animate"
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #141B2D 0%, #1E293B 50%, #141B2D 100%)",
        backgroundSize: "200% 100%"
      }}
    >
      <div className="p-6 space-y-4">
        <div className="h-4 bg-border rounded w-3/4" />
        <div className="h-4 bg-border rounded w-1/2" />
        <div className="h-24 bg-border rounded" />
      </div>
    </motion.div>
  );
}
```

**Why this works:**
- Shimmer animation = "content is loading" signal
- Matches card structure = prevents layout shift when real content loads
- Dark gradient = fits YALI dark mode aesthetic

**Use for:**
- Speaker cards before data loads
- Schedule timeline before fetch completes
- Stats counters before Supabase query returns

---

## Pattern 7: Swipe Gesture Handler (Tab Navigation)

```tsx
import { motion, PanInfo } from "framer-motion";
import { useState } from "react";

export function SwipeableTabs({ tabs, currentTab, onTabChange }: { tabs: string[]; currentTab: number; onTabChange: (index: number) => void }) {
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.x > threshold && currentTab > 0) {
      // Swipe right = previous tab
      onTabChange(currentTab - 1);
    } else if (info.offset.x < -threshold && currentTab < tabs.length - 1) {
      // Swipe left = next tab
      onTabChange(currentTab + 1);
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="flex-1"
    >
      {/* Tab content here */}
    </motion.div>
  );
}
```

**Why this works:**
- 50px threshold = prevents accidental swipes
- `dragElastic` = rubber-band when at first/last tab
- Works with touch + mouse (desktop testing)

---

## Pattern 8: Number Counter Animation (Stats)

```tsx
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

// Usage in stats cards
<div className="text-5xl font-bold text-accent">
  <AnimatedCounter value={740} />+
</div>
<p className="text-sm text-secondary">Registrations</p>
```

**Why this works:**
- Spring physics = satisfying count-up
- Rounds to integer = no decimal flickering
- Triggers on mount = "revealing" effect

---

## Performance Optimization

### 1. Respect Reduced Motion Preference

```tsx
import { useReducedMotion } from "framer-motion";

export function ResponsiveAnimation({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  
  const variants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  
  return (
    <motion.div variants={variants} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}
```

### 2. Use `layout` Prop for Auto-Layout Animations

```tsx
<motion.div layout className="grid gap-4">
  {items.map((item) => (
    <motion.div key={item.id} layout>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

**When to use:**
- Filter animations (cards rearrange)
- Accordion expand/collapse
- Dynamic grid layouts

### 3. Avoid Animating Expensive Properties

❌ **NEVER animate:**
- `width`, `height` (triggers layout reflow)
- `background-color` (not GPU-accelerated)
- `box-shadow` (heavy on mobile)

✅ **ALWAYS animate:**
- `transform` (translateX, translateY, scale, rotate)
- `opacity`
- Use Tailwind classes for colors (no animation, instant change)

---

## Common Patterns for YALI Platform

### Registration Form Step Transitions

```tsx
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

<AnimatePresence initial={false} custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={stepVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    {/* Step content */}
  </motion.div>
</AnimatePresence>
```

### Floating Action Button (FAB) Entrance

```tsx
<motion.button
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
  className="fixed bottom-20 right-4 w-14 h-14 bg-accent rounded-full shadow-lg"
>
  <PlusIcon />
</motion.button>
```

### Success Confetti (Registration Confirmation)

```tsx
import confetti from "canvas-confetti";

const handleConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#00D9FF', '#6366F1', '#10B981']
  });
};

// Trigger on registration success
useEffect(() => {
  if (registrationSuccess) {
    handleConfetti();
  }
}, [registrationSuccess]);
```

---

## Testing Animations

### Chrome DevTools

1. Open DevTools → More Tools → Animations
2. Slow down animations to 10% to debug
3. Check for layout thrashing (red bars in Performance tab)

### Mobile Testing

```tsx
// Add FPS counter (dev only)
import { motion, useMotionValue } from "framer-motion";

export function FPSCounter() {
  const fps = useMotionValue(0);
  
  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      if (currentTime >= lastTime + 1000) {
        fps.set(Math.round((frames * 1000) / (currentTime - lastTime)));
        frames = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
  }, []);
  
  return (
    <div className="fixed top-0 right-0 bg-black text-white p-2 text-xs">
      <motion.span>{fps}</motion.span> FPS
    </div>
  );
}
```

Target: **60 FPS** on mobile (1000ms / 60 = ~16.67ms per frame)

---

## Quick Reference

| Pattern | Use Case | Transition Time |
|---------|----------|-----------------|
| Tab switch | Bottom nav tap | 200–300ms |
| Button tap | All CTAs | 100–150ms |
| Card entrance | Grid loads | 300–400ms (staggered) |
| Bottom sheet | Modals/forms | 250–300ms |
| Pull-to-refresh | Home tab | 400–500ms |
| Skeleton | Loading states | 1500ms loop |
| Number counter | Stats reveal | 800–1200ms |

---

**End of Motion Patterns Guide**

For implementation questions, reference Framer Motion docs: https://www.framer.com/motion/
