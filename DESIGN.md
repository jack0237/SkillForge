---
name: SkillForge
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#424656'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#727687'
  outline-variant: '#c2c6d8'
  surface-tint: '#0054d6'
  primary: '#0050cb'
  on-primary: '#ffffff'
  primary-container: '#0066ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#b3c5ff'
  secondary: '#4f6073'
  on-secondary: '#ffffff'
  secondary-container: '#d2e4fb'
  on-secondary-container: '#556679'
  tertiary: '#a33200'
  on-tertiary: '#ffffff'
  tertiary-container: '#cc4204'
  on-tertiary-container: '#fff6f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#d2e4fb'
  secondary-fixed-dim: '#b7c8de'
  on-secondary-fixed: '#0b1d2d'
  on-secondary-fixed-variant: '#38485a'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59d'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832600'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  margin-mobile: 20px
  gutter-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 40px
---

## Brand & Style
The design system for this mobile e-learning platform is built on the principles of **Modern Minimalism** with a focus on **Professionalism** and **Motivation**. It aims to reduce cognitive load, allowing the learner to focus entirely on the educational content while feeling supported by a high-performance, systematic interface.

The brand personality is authoritative yet encouraging. It uses generous whitespace, crisp typography, and subtle depth to create a sense of digital craftsmanship. The interface should feel "engineered for success," using clear visual hierarchies to guide the user through complex learning paths without friction.

## Colors
The color strategy prioritizes high-energy actions and structural clarity. 

- **Primary Electric Blue:** Used for high-priority actions like "Start Lesson" or "Complete Purchase." It represents progress and energy.
- **Deep Navy:** Used for headers, navigation, and structural elements to provide a grounded, authoritative feel.
- **Soft Gray Background:** A light, cool-toned gray is used for the application background to distinguish it from pure white content cards.
- **Vibrant Accent:** A high-contrast orange is reserved for motivational feedback, such as badges, streak alerts, and critical accessibility highlights.

**Accessibility Note:** All text-on-color combinations must maintain a minimum contrast ratio of 4.5:1. Use "on-container" colors (e.g., Deep Navy text on a light Blue container) for secondary information.

## Typography
Inter is the sole typeface, utilized for its exceptional legibility and modern, neutral tone. 

The type system is built on a tight scale to ensure consistency across dense course information. Headlines use tight letter-spacing and heavy weights to create "visual anchors" on the page. Body text utilizes a slightly increased line height to improve reading endurance during long study sessions. Labels are used for metadata (e.g., "15 mins," "Intermediate") and are styled in semi-bold uppercase to distinguish them from prose.

## Layout & Spacing
This design system utilizes a **Fluid Grid** for mobile devices, based on a 4px base unit. 

The primary layout container uses a **20px side margin** to provide ample breathing room on small screens. Vertical rhythms are established using "stacks":
- **8px (Small):** Between related elements like a label and an input field.
- **16px (Medium):** Between items in a list or content blocks within a card.
- **24px (Large):** Between distinct sections or headers and their content.
- **40px (Extra Large):** Between major content areas or screen transitions.

## Elevation & Depth
Depth is created through **Tonal Layering** rather than heavy shadows. This maintains the clean, modern aesthetic.

1.  **Level 0 (Background):** The soft gray (#F5F7FA) serves as the canvas.
2.  **Level 1 (Cards):** White surfaces (#FFFFFF) appear on top of the background. These cards use a very soft, diffused shadow (0px 4px 12px rgba(0,0,0, 0.05)) to suggest they are liftable.
3.  **Level 2 (Active/Floating):** Primary action buttons and modal sheets use a slightly more pronounced shadow (0px 8px 20px rgba(0, 102, 255, 0.15)) to denote interactivity and dominance.

Semi-transparent overlays (Backdrop Blurs) are used for sticky headers to maintain context of the content scrolling beneath them.

## Shapes
The shape language is friendly and contemporary, moving away from "corporate" sharp corners toward approachable curves.

Following the `rounded-xl` directive, major components like course cards and primary buttons use a **16px (1rem)** radius. Smaller internal elements like chips, lesson icons, and checkboxes use a **8px (0.5rem)** radius. This nesting approach (smaller radius inside a larger radius) ensures visual harmony and structural integrity.

## Components
Consistent component styling reinforces the "SkillForge" identity:

- **Buttons:** Primary buttons are large (56px height for mobile), using the Electric Blue background with centered bold white Inter text. Secondary buttons use a Deep Navy outline.
- **Course Cards:** White background, 16px radius, with a 1px soft gray border. The top section features a thumbnail with a 12px internal radius.
- **Progress Bars:** Thin (4px - 6px) tracks in Soft Gray, with the progress indicator in Electric Blue. For "Completed" states, the bar shifts to the Accent orange or a success green.
- **Chips:** Small, pill-shaped markers for categories (e.g., "Design," "Code"). Use the Secondary Container color with Deep Navy text.
- **Input Fields:** 12px radius, light gray background, shifting to a 2px Electric Blue border on focus.
- **Navigation Bar:** A clean bottom bar with Deep Navy icons. The active state uses an Electric Blue tint for the icon and a small 4px dot indicator underneath.