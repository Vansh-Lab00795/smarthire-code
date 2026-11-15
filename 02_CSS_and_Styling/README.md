# 🎨 02 - CSS & Styling (Tailwind Design System)

This folder contains all styling tokens, configurations, and global CSS rules that define SmartHire's luxury dark visual identity.

## Files
- **`index.css`**:
  - Global styles and `@tailwind` directives (`base`, `components`, `utilities`).
  - **Custom Dark Theme Palette**: Deep midnight slate background (`#020617` and `#090d1f`).
  - **Glassmorphism Utilities**:
    - `.glass-card` — semi-transparent glass cards with backdrop-filter blur and subtle border highlights.
    - `.glass-nav` — frosted fixed header styling with 85% opacity.
  - **Custom Scrollbars**: Sleek, slim indigo thumb and dark slate track.
  - **Gradient Utilities**: `.gradient-text`, `.gradient-border`, and `.gradient-bg`.

- **`tailwind.config.js`**:
  - Design token configurations:
    - Primary & Secondary color ramps (Indigo, Violet, Slate, Emerald).
    - Custom font families (`Outfit` for display and `Inter` for sans-serif).
    - Custom animation keyframes (`float`, `pulse-glow`, `blob`, `shimmer`).
    - Extended spacing and border-radius tokens.

- **`postcss.config.js`**:
  - PostCSS pipeline loader configuring `tailwindcss` and `autoprefixer`.
