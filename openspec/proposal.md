## Why

We need a central place to collect, standardise, and browse family/personal recipes. Right now recipes live in photos, notes, and memory — they're hard to find, inconsistent in format, and impossible to search. A lightweight web app with a clean frontend and simple CMS backend solves this by making it trivially easy to add recipes (from photos, ingredients, and instructions) and fast to look one up or explore what's available.

## What Changes

- Stand up a web application with a frontend for browsing/searching recipes and a CMS-style backend for managing them.
- Provide a streamlined "add recipe" flow for contributors — upload photos, enter ingredients and instructions, and the system standardises the format.
- Implement recipe lookup by title and search by ingredients.
- Support browsing recipes via scrollable listing and a "recently viewed" section.
- Store recipes with a consistent schema: title, photos, ingredients (with quantities/units), instructions (ordered steps), tags, and metadata.

## Capabilities

### New Capabilities
- `recipe-management`: CRUD operations for recipes — create, read, update, delete. Covers the standardised recipe data model (title, photos, ingredients, instructions, tags) and the contributor "add recipe" flow.
- `recipe-browsing`: Frontend views for exploring recipes — full listing with scroll, recipe detail page, and recently viewed tracking.
- `recipe-search`: Search and lookup by recipe title and by available ingredients. Basic filtering to find what you can cook with what you have.

### Modified Capabilities
<!-- No existing capabilities to modify — greenfield project. -->

## Impact

- **New codebase**: Frontend app, backend API, and database — all net-new.
- **Dependencies**: Web framework, database, image storage/handling, and a search mechanism (can start simple with database queries).
- **Deployment**: Will need hosting for the frontend, API server, and database.