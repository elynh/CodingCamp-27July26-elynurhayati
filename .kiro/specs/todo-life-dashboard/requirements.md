# Requirements Document

## Introduction

The To-Do List Life Dashboard is a client-side web application built with HTML, CSS, and Vanilla JavaScript. It provides users with a personal productivity hub in a single web page, featuring a greeting with live clock, a focus timer, a to-do list, and a quick links manager. All user data is persisted exclusively via the browser's Local Storage API. The application requires no backend server and no build toolchain.

## Glossary

- **Dashboard**: The single-page web application delivered as one HTML file.
- **Greeting_Widget**: The UI component that displays the current time, date, and a time-based greeting message.
- **Focus_Timer**: The UI component that runs a 25-minute countdown timer.
- **Todo_List**: The UI component that manages a collection of tasks.
- **Task**: A single to-do item that has a text description and a completion state.
- **Quick_Links**: The UI component that displays user-saved shortcut buttons to external URLs.
- **Link**: A single quick-link entry with a label and a URL.
- **Storage**: The browser's Local Storage API used for all client-side persistence.
- **User**: A person interacting with the Dashboard in a modern web browser.

---

## Requirements

### Requirement 1: Project Structure

**User Story:** As a developer, I want a clean, single-file-per-type project layout, so that the codebase is easy to read and maintain.

#### Acceptance Criteria

1. THE Dashboard SHALL be structured with exactly one HTML file at the root level, exactly one CSS file located inside a `css/` directory, and exactly one JavaScript file located inside a `js/` directory.
2. WHEN the User opens the HTML file using the `file://` protocol in the latest stable version of Chrome, Firefox, Edge, or Safari, THE Dashboard SHALL render all UI elements without errors in the browser console, without requiring a backend server or build step.
3. THE Dashboard SHALL function as a standalone web application using only relative file paths, requiring no web server, no build tool, and no internet connection.

---

### Requirement 2: Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a personalised greeting, so that I always know when I am working.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM:SS format (zero-padded), updating every second.
2. THE Greeting_Widget SHALL display the current date including the full weekday name, day, month name, and four-digit year (e.g., "Monday, 28 July 2025").
3. WHEN the current local hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the message "Good Morning".
4. WHEN the current local hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display the message "Good Afternoon".
5. WHEN the current local hour is between 18:00 and 21:59, THE Greeting_Widget SHALL display the message "Good Evening".
6. WHEN the current local hour is between 22:00 and 04:59, THE Greeting_Widget SHALL display the message "Good Night".
7. IF the system clock API is unavailable or returns an invalid value, THEN THE Greeting_Widget SHALL display an error message in place of the time and suppress the greeting.

---

### Requirement 3: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with Start, Stop, and Reset controls, so that I can work in focused sessions.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Focus_Timer SHALL display a countdown of 25:00, where minutes and seconds are each zero-padded to two digits.
2. WHEN the User activates the Start control, THE Focus_Timer SHALL begin counting down one second at a time from the currently displayed time.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time by exactly one second per update interval.
4. WHEN the User activates the Stop control, THE Focus_Timer SHALL pause the countdown and retain the current remaining time; a subsequent Start SHALL resume from that retained time.
5. WHEN the User activates the Reset control, THE Focus_Timer SHALL immediately stop the countdown and reset the displayed time to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display a visual indicator that is visually distinguishable from the normal timer display to signal session completion.
7. IF the User activates the Start control while the Focus_Timer is already counting down, THEN THE Focus_Timer SHALL ignore the activation and continue counting.
8. IF the User activates the Stop control while the Focus_Timer is already paused or stopped, THEN THE Focus_Timer SHALL take no action.
9. WHEN the User activates the Reset control while the Focus_Timer is counting down, THE Focus_Timer SHALL immediately stop and reset to 25:00 without completing the current second.

---

### Requirement 4: To-Do List — Add and Display Tasks

**User Story:** As a user, I want to add tasks to my to-do list and see them displayed, so that I can track what I need to do.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a text input field (maximum 200 characters) and an Add button for entering new tasks.
2. WHEN the User submits a non-empty task description via the Add button or by pressing the Enter key, THE Todo_List SHALL append the new Task to the bottom of the list and clear the input field.
3. IF the User attempts to submit an empty or whitespace-only task description, THEN THE Todo_List SHALL not create a Task and SHALL retain the current input field content.
4. THE Todo_List SHALL display each Task with its description text, a completion toggle control, an edit control, and a delete control.
5. WHEN the Todo_List contains zero tasks, THE Todo_List SHALL display an empty state message visible to the User.
6. IF the User attempts to enter more than 200 characters into the task input field, THEN THE Todo_List SHALL not accept characters beyond the 200-character limit.

---

### Requirement 5: To-Do List — Edit Tasks

**User Story:** As a user, I want to edit existing task descriptions, so that I can correct or refine my tasks.

#### Acceptance Criteria

1. WHEN the User activates the edit control on a Task, THE Todo_List SHALL replace the Task's display text with an editable input field pre-filled with the current description and SHALL position the cursor at the end of the text.
2. WHEN the User confirms the edit (by pressing Enter or activating a save control), THE Todo_List SHALL trim leading and trailing whitespace from the input, update the Task's description to the trimmed non-empty value (maximum 500 characters), and return to display mode.
3. IF the User confirms an edit with an empty or whitespace-only value, THEN THE Todo_List SHALL retain the original Task description, display an error indication, and return to display mode.
4. WHEN the User cancels the edit (by pressing Escape), THE Todo_List SHALL discard the change and return to display mode with the original description.
5. IF the User attempts to enter more than 500 characters into the edit input field, THEN THE Todo_List SHALL not accept characters beyond the 500-character limit and SHALL display an error indication.
6. WHEN the User activates the edit control on a Task while another Task is already in edit mode, THE Todo_List SHALL save or discard the previous edit (per criteria 2–3) before entering edit mode on the newly activated Task, ensuring only one Task is in edit mode at a time.

---

### Requirement 6: To-Do List — Complete and Delete Tasks

**User Story:** As a user, I want to mark tasks as done and delete tasks I no longer need, so that I can manage my list effectively.

#### Acceptance Criteria

1. WHEN the User activates the completion toggle on a Task, THE Todo_List SHALL mark that Task as completed and apply strikethrough text style to the Task label.
2. WHEN the User activates the completion toggle on an already-completed Task, THE Todo_List SHALL remove the completed state and restore the Task label without strikethrough.
3. WHEN the User activates the delete control on a Task, THE Todo_List SHALL permanently remove that Task from the list without requiring additional confirmation.
4. WHEN the last Task is deleted from the Todo_List, THE Todo_List SHALL display the empty state message as specified in Requirement 4, Criterion 5.

---

### Requirement 7: To-Do List — Persistence

**User Story:** As a user, I want my tasks to be saved automatically, so that they are still there when I reload or reopen the page.

#### Acceptance Criteria

1. WHEN a Task is added, edited, completed, or deleted, THE Todo_List SHALL write the updated task collection to Storage under the key `"todo_tasks"` before the triggering operation is considered complete.
2. WHEN the Dashboard loads, THE Todo_List SHALL read from Storage under the key `"todo_tasks"` and render all previously saved Tasks within 300ms.
3. IF no task data exists in Storage on load, THEN THE Todo_List SHALL display zero tasks with no error indication visible.
4. IF the data in Storage under `"todo_tasks"` is corrupted or cannot be parsed, THEN THE Todo_List SHALL discard the corrupted data, display an empty list, and log a warning without crashing.
5. THE Storage SHALL persist each Task's description (up to 500 characters) and completion state (complete or incomplete) across browser sessions for the same origin.

---

### Requirement 8: Quick Links — Display and Open

**User Story:** As a user, I want to see my saved shortcut buttons and open them with a single click, so that I can reach my favourite websites quickly.

#### Acceptance Criteria

1. THE Quick_Links SHALL display each saved Link as a labelled button, truncating labels longer than 50 characters with an ellipsis.
2. WHEN the User activates a Link button, THE Quick_Links SHALL open the associated URL in a new browser tab without navigating the Dashboard tab away from the application.
3. WHEN the Dashboard loads, THE Quick_Links SHALL read the link collection from Storage and render all previously saved Links within 500ms.
4. IF no link data exists in Storage on load, THEN THE Quick_Links SHALL display an empty state message without leaving the section blank.
5. IF Storage is unavailable when loading link data, THEN THE Quick_Links SHALL display an error message and render an empty link list without crashing.

---

### Requirement 9: Quick Links — Add and Delete

**User Story:** As a user, I want to add new shortcut links and remove ones I no longer need, so that my quick-access list stays relevant.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide a label input field (maximum 100 characters), a URL input field (maximum 2048 characters), and an Add button.
2. WHEN the User submits a non-empty label and a valid URL via the Add button, THE Quick_Links SHALL append the new Link to the collection and clear both input fields.
3. IF the User attempts to submit a Link with an empty label or an empty URL, THEN THE Quick_Links SHALL not create the Link and SHALL display an error message indicating which field is missing.
4. IF the User attempts to submit a URL that does not begin with `http://` or `https://`, THEN THE Quick_Links SHALL not create the Link and SHALL display an error message indicating an invalid URL format.
5. THE Quick_Links SHALL display a delete control for each Link.
6. WHEN the User activates the delete control on a Link, THE Quick_Links SHALL permanently remove that Link from the collection immediately without requiring additional confirmation.

---

### Requirement 10: Quick Links — Persistence

**User Story:** As a user, I want my quick links to be saved automatically, so that they are still there when I reload or reopen the page.

#### Acceptance Criteria

1. WHEN a Link is added, THE Quick_Links SHALL write the updated link collection to Storage under the key `"quickLinks"` within 100ms.
2. WHEN a Link is deleted, THE Quick_Links SHALL write the updated link collection to Storage under the key `"quickLinks"` within 100ms.
3. WHEN the Dashboard loads, THE Quick_Links SHALL read the link collection from Storage under the key `"quickLinks"` and render all previously saved Links before the first user interaction is possible.
4. IF no link data exists in Storage under `"quickLinks"` on load, THEN THE Quick_Links SHALL render an empty link list with no error indication.
5. THE Storage SHALL persist each Link's label (1–100 characters) and URL (1–2048 characters) across browser sessions for the same origin.

---

### Requirement 11: Visual Design and Responsiveness

**User Story:** As a user, I want a clean, readable, and visually consistent interface, so that the Dashboard is pleasant and easy to use.

#### Acceptance Criteria

1. THE Dashboard SHALL apply all visual styles — including colour, spacing, layout, and typography — exclusively through the single CSS file; no inline styles shall be used.
2. THE Dashboard SHALL establish a clear visual hierarchy where widget headings are at least 4px larger than body text and all text meets WCAG 2.1 AA colour contrast ratio of 4.5:1 against its background.
3. THE Dashboard SHALL render all content legibly on viewport widths from 320px to 1920px without horizontal scrollbars, clipping, overlapping, or unreachable controls.
4. WHILE the User hovers over any interactive control (button, link), THE Dashboard SHALL apply a colour change or pointer cursor change within 100ms.
5. WHEN the viewport width is below 768px, THE Dashboard SHALL reflow widget layout to a single-column arrangement to prevent horizontal overflow.

---

### Requirement 12: Performance

**User Story:** As a user, I want the Dashboard to load and respond quickly, so that it never interrupts my workflow.

#### Acceptance Criteria

1. THE Dashboard SHALL complete initial render — defined as all widgets visible and interactive — in under 2 seconds when opened via `file://` in Chrome, Firefox, or Edge (current major version).
2. WHEN the User interacts with any control (add, delete, toggle, timer button) via click or keypress, THE Dashboard SHALL reflect the updated state in the UI within 100ms of the input event.
3. THE Dashboard SHALL update the Greeting_Widget clock at most once per second and SHALL not change the position or size of any other widget during a clock update cycle.
4. IF the Dashboard fails to complete initial render within 5 seconds, THEN THE Dashboard SHALL display an error message and preserve any previously stored data without data loss.
