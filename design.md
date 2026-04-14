# Recipe Book - UI Design System

**Source**: [Stitch Project "Family Recipe Manager"](https://stitch.googleapis.com/projects/6962094648130057330)

## Creative Direction: The Heirloom Editorial

A high-end, digital coffee table book aesthetic. Rejects the clinical "app-like" feel of standard recipe platforms in favour of a sophisticated, editorial experience that honours culinary heritage. Evokes the tactile memory of flipping through a handwritten notebook with the precision of modern UI.

## Navigation Flow

```
Homepage ──[search bar]──→ Search Results
    │                           │
    │──[recipe card]──→ Recipe Detail ──[back]──→ Homepage
    │                       │    │
    │                       │    │──[Edit btn ⓒ]──→ Recipe Form (pre-filled)
    │                       │    │                        │
    │                       │    │──[Delete btn ⓒ]──→ Confirm Dialog → Homepage
    │                       │    │
    │                       │    └──[save]──→ Recipe Detail
    │                       │
    │──[Add Recipe FAB ⓒ]──→ Recipe Form (blank)
    │                              │
    │                              └──[save]──→ Recipe Detail
    │
    │──[recently viewed card]──→ Recipe Detail
    │
    └──[Contributor login]──→ Auth Modal → (enables ⓒ CTAs)
         [Logout ⓒ]──→ (disables ⓒ CTAs, reverts to reader mode)

ⓒ = visible only when authenticated as contributor
```

## Screens

### 1. Home & Recipe Archive
- **Screen ID**: `3ec427251b5242368e7cae0d432dcdd2`
- **Maps to spec**: `recipe-browsing` (List all recipes, Display recently viewed), `recipe-search` (Homepage search bar entry point)
- **Key elements**:
  - **Header**: search bar, "Contributor login" link (reader mode) or "Contributor" indicator + "Logout" (contributor mode)
  - **Search bar** (hero area, above the fold): placeholder "Search recipes by name or ingredient..." → navigates to **Search Results**
  - **"Add Recipe" FAB** (bottom-right, primary #6f331d): visible only in contributor mode → navigates to **Recipe Form**
  - "Recently Viewed" horizontal scroll section (from localStorage): each card → **Recipe Detail**
  - Recipe grid: cards with hero photo, title (Noto Serif), tags as chips, date: each card → **Recipe Detail**
  - Reverse chronological order, infinite scroll pagination
  - Empty state when no recipes exist

### 2. Recipe Detail
- **Screen ID**: `c2e81e0228924a649eed41d2426c55b7` (updated: `a2174fed7ff34a38b1b8a5e8474aead7`)
- **Maps to spec**: `recipe-browsing` (View recipe detail page), `recipe-management` (View, Edit entry point, Delete entry point)
- **Key elements**:
  - **Back arrow** (top-left): → navigates to **Homepage**
  - Full-bleed hero photo(s) at top
  - Title in display-lg Noto Serif
  - Tags as chips below title
  - Ingredient list: structured cards with quantity, unit, name, notes
  - Numbered instruction steps
  - **"Edit" button** (secondary style, #ccead6): visible only in contributor mode → navigates to **Recipe Form** (pre-filled)
  - **"Delete" button** (text-only, error #ba1a1a): visible only in contributor mode → **Confirmation Dialog**, then navigates to **Homepage**

### 3. Recipe Form (Add/Edit)
- **Screen ID**: `8f577ccb9c2344ebbd592dc36855be20` (updated: `1f4501a03b47442b8da93515ab0fbfdf`)
- **Maps to spec**: `recipe-management` (Create/Update a recipe)
- **Key elements**:
  - **Back/Cancel** (top-left): → **Homepage** (if new recipe) or **Recipe Detail** (if editing)
  - Title input field
  - Description textarea
  - Dynamic ingredient rows (name, quantity, unit, notes) with add/remove
  - Dynamic instruction steps with add/remove/reorder
  - Photo upload area with preview thumbnails
  - Tag input with autocomplete
  - **"Save" button**: → navigates to **Recipe Detail** (after successful save)

### 4. Search Results
- **Screen ID**: `ef117a887c174ad89a532c0b1fba26ee` / `09b8ad4fe3cb4899885ee5debc7e37e3`
- **Maps to spec**: `recipe-search` (Unified search, Homepage search bar entry point)
- **Key elements**:
  - **Search bar** (top, pre-filled with query): user can refine in place
  - Result count ("3 recipes found for 'chicken'")
  - Recipe cards with thumbnail, title, tags, match snippet: each card → **Recipe Detail**
  - Title matches ranked above ingredient matches
  - Empty state: "No recipes found" with suggestion text

### 5. Auth Modal
- **Screen ID**: `5ba2aeb019f0413cadc88051959915fb`
- **Maps to spec**: `security` (Write endpoints require authentication), `recipe-management` (Contributor login)
- **Key elements**:
  - Glassmorphism overlay (surface at 80% opacity, backdrop blur)
  - Heading: "Contributor login"
  - Masked password input (soft fill style)
  - **"Login" button** (primary): → authenticates, enables contributor mode (write CTAs become visible)
  - Error state: "Incorrect password" in error colour, re-prompts
  - Triggered only by "Contributor login" link in header
  - Password stored in sessionStorage (cleared on tab close)
  - After login: header shows "Contributor" indicator + "Logout" option

## Colour Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#fef9f2` | Base background (warm cream) |
| `surface-container-low` | `#f8f3ec` | Secondary sections |
| `surface-container` | `#f2ede6` | Card backgrounds |
| `surface-container-lowest` | `#ffffff` | Maximum lift elements |
| `primary` | `#6f331d` | Primary buttons, headline accents |
| `primary-container` | `#8c4a32` | CTA gradients |
| `secondary` | `#496455` | Active chips, secondary actions |
| `secondary-container` | `#ccead6` | Secondary button backgrounds |
| `tertiary` | `#633c00` | Kitchen tips, annotations |
| `on-surface` | `#1d1c18` | Body text (never pure black) |
| `on-surface-variant` | `#53433e` | Metadata, secondary text |
| `outline` | `#86736d` | Subtle borders (sparingly) |
| `error` | `#ba1a1a` | Validation errors, auth errors |

## Typography

| Level | Font | Usage |
|-------|------|-------|
| Display / Headlines | **Noto Serif** | Recipe titles, section headers, page titles |
| Body | **Plus Jakarta Sans** | Descriptions, instructions, ingredient text |
| Labels | **Plus Jakarta Sans** | Metadata (prep time, dates), tag chips, UI controls |

## Key Design Rules

1. **No 1px borders**: Define structure through background colour shifts and negative space, not lines
2. **No pure black**: Always use `on-surface` (#1d1c18) for warm, organic tone
3. **No divider lines**: Use whitespace (16-24px) or alternating backgrounds between list items
4. **Generous padding**: When in doubt, add 8px more
5. **Ambient shadows only**: `Y:8px, Blur:24px, Spread:0, Color:rgba(29,28,24,0.06)` - never pure black shadows
6. **Soft fill inputs**: Background `surface-container-highest` with no border; on focus transition to white with ghost border
7. **Glassmorphism for overlays**: Surface at 80% opacity with 20px backdrop-blur
8. **Roundness**: `0.5rem` (8px) for general elements, `0.75rem` for buttons, `1.5rem` for hero cards, `full` for category chips

## Component Patterns

### Recipe Cards
- `rounded-xl` (1.5rem) corners
- Hero image with subtle 2% opacity film grain overlay
- Title in `headline-md` Noto Serif
- Tags as `rounded-full` chips in `surface-container-high`
- No border - use surface tier contrast for lift

### Ingredient Chips
- `rounded-sm` for editorial label look
- `surface-container-high` background, no border
- Active state: `secondary` background with `on-secondary` text

### Buttons
- **Primary**: `primary` (#6f331d) background, white text, `rounded-md`
- **Secondary**: `secondary-container` (#ccead6) background, `on-secondary-container` text
- **Tertiary**: Text-only with `primary` colour

### Input Fields
- Soft fill: `surface-container-highest` (#e6e2db) background, no border
- Focus: background transitions to white, 1px ghost border using `surface-tint`
