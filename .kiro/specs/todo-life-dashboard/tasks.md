rite File

tasks.md
# Implementation Plan: To-Do List Life Dashboard
 
## Overview
 
Build a three-file static web application (index.html, css/style.css, js/app.js) with four independent widgets: Greeting Widget, Focus Timer, To-Do List, and Quick Links. All logic is in a single IIFE-wrapped app.js using the Revealing Module pattern. State is persisted to localStorage on every mutation. Property-based tests are written with fast-check.
 
---
 
## Tasks
 
- [x] 1. Set up project structure and static HTML skeleton
  - Create `index.html` at the project root with the four widget `<section>` elements, correct `id` attributes, all ARIA labels, and a `<script defer src="js/app.js">` tag
  - Create `css/style.css` with the `link` tag wired in `index.html`
  - Create `js/app.js` as an empty IIFE skeleton with a `DOMContentLoaded` listener calling `init()`
  - Create `css/` and `js/` directories as required by the file layout
  - _Requirements: 1.1, 1.2, 1.3_
 
- [x] 2. Implement CSS layout and design system
  - [x] 2.1 Define CSS custom properties and base styles
    - Declare all custom properties (`--color-primary`, `--color-success`, `--color-danger`, `--color-text`, `--color-bg`, `--color-surface`, `--space-sm`, `--space-md`, `--space-lg`, `--radius`) on `:root`
    - Set `box-sizing: border-box`, base `font-size: 16px`, and `background-color: var(--color-bg)` on `body`
    - _Requirements: 11.1, 11.2_
 
  - [x] 2.2 Implement responsive dashboard grid and widget shell styles
    - Add `.dashboard-grid` CSS Grid rule with `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` and `gap: 1.5rem`
    - Add `@media (max-width: 767px)` rule to force single-column layout
    - Style each widget `<section>` as a card (background `var(--color-surface)`, `border-radius: var(--radius)`, padding, box-shadow)
    - _Requirements: 11.3, 11.5_
 
  - [x] 2.3 Implement typography scale and interactive state styles
    - Set `h2` to at least `body + 4px` (e.g., `1.25rem`), `#timer-display` to `3rem`, `#clock` to `2.25rem`
    - Add hover/focus transitions: `transition: background-color 80ms ease, color 80ms ease` on all interactive controls
    - Use `:focus-visible` for keyboard focus rings; add `cursor: pointer` to all buttons and links
    - Style `.task-item--complete .task-text` with `text-decoration: line-through`
    - Style `.timer--completed` with a visually distinct background or colour using `--color-success`
    - Style `.task-item--error` with a visual error indication using `--color-danger`
    - _Requirements: 11.2, 11.4, 6.1, 3.6_
 
- [x] 3. Implement the shared `storage` helper inside app.js
  - [x] 3.1 Implement `storage.get`, `storage.set`, and `storage.remove`
    - `get(key)`: wraps `JSON.parse(localStorage.getItem(key))` in `try/catch`; returns `[]` if null, non-array, or parse error; logs `console.warn` on error
    - `set(key, data)`: wraps `localStorage.setItem(key, JSON.stringify(data))` in `try/catch`; logs `console.error` on `QuotaExceededError` or other `DOMException`
    - `remove(key)`: calls `localStorage.removeItem(key)` in `try/catch`
    - _Requirements: 7.4, 8.5, 10.1, 10.2_
 
- [x] 4. Implement Greeting Widget
  - [x] 4.1 Implement `greetingWidget.getGreeting(hour)` and `greetingWidget.formatTime(date)` and `greetingWidget.formatDate(date)`
    - `getGreeting(hour)`: returns "Good Morning" (05–11), "Good Afternoon" (12–17), "Good Evening" (18–21), "Good Night" (22–23, 0–4)
    - `formatTime(date)`: returns zero-padded `"HH:MM:SS"` string
    - `formatDate(date)`: returns full weekday, day, month name, and four-digit year string
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
 
 
  - [x] 4.4 Implement `greetingWidget.tick()` and `greetingWidget.init()`
    - `tick()`: reads `new Date()`, calls the pure helpers, writes to `#greeting-text`, `#clock`, and `#date-text` text content; wraps in `try/catch` — on error sets `#clock` to `"Time unavailable"` and hides `#greeting-text`
    - `init()`: calls `tick()` once immediately, then starts `setInterval(tick, 1000)`
    - Confirm no other widget's DOM subtree is touched during a tick
    - _Requirements: 2.1, 2.2, 2.7, 12.1, 12.3_
 
- [x] 5. Checkpoint — Greeting Widget
  - Ensure all tests pass, ask the user if questions arise.
 
- [x] 6. Implement Focus Timer
  - [x] 6.1 Implement Focus Timer state variables and `render()`, `tick()`, `setCompleted()`
    - Declare `remainingSeconds = 1500`, `state = "idle"`, `intervalId = null` inside the `focusTimer` module
    - `render()`: formats `remainingSeconds` as `MM:SS` and writes to `#timer-display`
    - `tick()`: decrements `remainingSeconds` by 1; calls `render()`; if `remainingSeconds === 0` calls `setCompleted()`
    - `setCompleted()`: clears `intervalId`, sets `state = "completed"`, adds CSS class `timer--completed` to `#focus-timer`
    - _Requirements: 3.1, 3.3, 3.6_
 
 
  - [x] 6.3 Implement `focusTimer.start()`, `stop()`, `reset()`, and `init()`
    - `start()`: no-op if `state === "running"`; transitions IDLE/PAUSED → RUNNING; starts `setInterval(tick, 1000)`; updates `state`
    - `stop()`: no-op if `state !== "running"`; transitions RUNNING → PAUSED; clears `intervalId`; updates `state`
    - `reset()`: clears `intervalId`; sets `remainingSeconds = 1500`, `state = "idle"`; removes `timer--completed` class; calls `render()`
    - `init()`: calls `render()` to show 25:00, binds click handlers on `#timer-start`, `#timer-stop`, `#timer-reset`
    - _Requirements: 3.2, 3.4, 3.5, 3.7, 3.8, 3.9_
 
 
- [x] 7. Checkpoint — Focus Timer
  - Ensure all tests pass, ask the user if questions arise.
 
- [x] 8. Implement To-Do List — core data helpers and storage
  - [x] 8.1 Implement `todoList.load()`, `todoList.save()`, and the task ID generator
    - `load()`: calls `storage.get("todo_tasks")`; validates each element has `id`, `description`, `completed`, `createdAt` fields; sets in-memory `tasks` array
    - `save()`: calls `storage.set("todo_tasks", tasks)`
    - ID generator: uses `crypto.randomUUID()` with `Date.now().toString() + Math.random()` fallback
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
 
 
- [x] 9. Implement To-Do List — CRUD operations and rendering
  - [x] 9.1 Implement `todoList.addTask(description)` and `todoList.render()`
    - `addTask(description)`: rejects empty/whitespace-only strings; trims; creates Task object `{ id, description, completed: false, createdAt: Date.now() }`; pushes to array; calls `save()` then `render()`
    - `render()`: clears `<ul id="task-list">`; for each task creates `<li class="task-item [task-item--complete]" data-id="...">` with toggle button, task text span, edit button, delete button; shows/hides `#todo-empty`
    - Bind `#todo-add` click and `#todo-input` keydown Enter to `addTask`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
 
 
  - [x] 9.3 Implement `todoList.toggleTask(id)` and `todoList.deleteTask(id)`
    - `toggleTask(id)`: finds task by id; flips `completed`; calls `save()` then `render()`; updates `aria-pressed` attribute
    - `deleteTask(id)`: filters task from array; calls `save()` then `render()`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
 
 
- [x] 10. Implement To-Do List — edit mode
  - [x] 10.1 Implement `todoList.beginEdit(id)`, `saveEdit(id, newText)`, and `cancelEdit(id)`
    - Track `editingId` (string or null) in module scope
    - `beginEdit(id)`: if `editingId` is set, call `cancelEdit` on the previous id first; replace task text `<span>` with `<input class="task-edit-input">` pre-filled with current description; set cursor at end; update `editingId`
    - `saveEdit(id, newText)`: trims `newText`; if empty, restores original description, applies `task-item--error` class, exits edit mode; if valid, updates description (max 500 chars), calls `save()`, calls `render()`
    - `cancelEdit(id)`: restores original text from in-memory array; calls `render()`
    - Bind Enter key on edit input to `saveEdit`; bind Escape key to `cancelEdit`; bind edit button click to `beginEdit`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [-] 11. Checkpoint — To-Do List
  - Ensure all tests pass, ask the user if questions arise.
 
- [ ] 12. Implement To-Do List — init wiring
  - [-] 12.1 Implement `todoList.init()`
    - Calls `load()` to populate in-memory `tasks` array
    - Calls `render()` to display loaded tasks (or empty state)
    - Binds all DOM event listeners (`#todo-add`, `#todo-input` Enter key)
    - _Requirements: 7.2, 7.3, 12.1_
 
- [x] 13. Implement Quick Links — core data helpers and storage
  - [x] 13.1 Implement `quickLinks.load()`, `quickLinks.save()`, and `quickLinks.validateUrl(url)`
    - `load()`: calls `storage.get("quickLinks")`; sets in-memory `links` array
    - `save()`: calls `storage.set("quickLinks", links)`
    - `validateUrl(url)`: returns `true` only if `url` starts with `http://` or `https://`
    - _Requirements: 9.4, 10.1, 10.2, 10.3, 10.5_
 
- [ ] 14. Implement Quick Links — CRUD operations and rendering
  - [-] 14.1 Implement `quickLinks.addLink(label, url)` and `quickLinks.render()`
    - `addLink(label, url)`: validates label is non-empty (max 100 chars) and URL passes `validateUrl`; shows `#link-error` with field-specific message on failure; on success creates Link `{ id, label, url }`, pushes to array, calls `save()` then `render()`; clears input fields
    - `render()`: clears `#links-grid`; for each link creates `.link-item` with `<a href target="_blank" rel="noopener noreferrer">` and a delete button; truncates label to 50 chars with ellipsis; shows/hides `#links-empty`
    - _Requirements: 8.1, 8.2, 8.4, 9.1, 9.2, 9.3, 9.4_
 
  - [~] 14.3 Implement `quickLinks.deleteLink(id)`
    - Filters link from array; calls `save()` then `render()`
    - _Requirements: 9.5, 9.6_
 
- [ ] 15. Implement Quick Links — init wiring
  - [~] 15.1 Implement `quickLinks.init()`
    - Calls `load()` to populate in-memory `links` array
    - Calls `render()` to display loaded links (or empty state)
    - Binds `#link-add` button click to `addLink` with input values from `#link-label` and `#link-url`
    - _Requirements: 8.3, 10.3, 10.4, 12.1_
 
- [~] 16. Checkpoint — Quick Links
  - Ensure all tests pass, ask the user if questions arise.
 
- [ ] 17. Wire everything together via `init()` and handle edge cases
  - [~] 17.1 Implement the top-level `init()` function and 5-second render guard
    - `init()`: called on `DOMContentLoaded`; calls `greetingWidget.init()`, `focusTimer.init()`, `todoList.init()`, `quickLinks.init()` in sequence
    - Add a `setTimeout(5000)` guard in `init()` that checks if render completed; if not, inserts a global error banner (no localStorage data loss)
    - _Requirements: 1.2, 12.1, 12.4_
 
  - [~] 17.2 Verify no widget touches another widget's DOM subtree
    - Confirm each widget only reads/writes elements under its own `<section>` id
    - Confirm clock ticks do not cause reflow in other widgets
    - _Requirements: 12.3_
 
- [~] 18. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
 
---
 
## Notes
 
- Tasks marked with `*` are optional and can be skipped for faster MVP
- All code lives exclusively in three files: `index.html`, `css/style.css`, `js/app.js`
- The entire `js/app.js` is wrapped in an IIFE — no ES module syntax (`import`/`export`) anywhere
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) loaded via CDN in a test harness HTML file, or via Node.js + Vitest for offline use
- Each property test file comment format: `// Feature: todo-life-dashboard, Property N: <property text>`
- No inline styles in HTML — JavaScript state changes use CSS class add/remove only
- `storage.get` is the single corruption-resilience choke point; all widgets rely on it returning `[]` on failure
- Checkpoints ensure incremental validation throughout development
 
## Task Dependency Graph
 
```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "6.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.2", "4.3", "6.2", "8.1"] },
    { "id": 3, "tasks": ["2.3", "4.4", "6.3", "8.2", "9.1", "13.1"] },
    { "id": 4, "tasks": ["6.4", "9.2", "9.3", "10.1", "13.2", "14.1"] },
    { "id": 5, "tasks": ["9.4", "9.5", "10.2", "14.2", "14.3"] },
    { "id": 6, "tasks": ["12.1", "15.1"] },
    { "id": 7, "tasks": ["17.1", "17.2"] }
  ]
}
```
 