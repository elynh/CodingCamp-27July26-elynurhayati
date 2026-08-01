// Feature: todo-life-dashboard, Property 3: Whitespace-only task descriptions are rejected
// Feature: todo-life-dashboard, Property 4: Task add/load round trip
// Feature: todo-life-dashboard, Property 7: Edit save trims and enforces length
//
// This file contains property-based tests for the todoList module.
// It is loaded by tests/todo.test.html which provides fast-check via CDN.
//
// Validates: Requirements 7.1, 7.2, 7.5, 4.3, 5.2, 5.5

/* global fc, todoList */

(function runTodoTests() {
  'use strict';

  var RESULTS = [];

  function pass(name) {
    RESULTS.push({ name: name, ok: true });
  }

  function fail(name, err) {
    RESULTS.push({ name: name, ok: false, error: String(err) });
  }

  // ---------------------------------------------------------------------------
  // Property 4 – Task add/load round trip
  //
  // For any valid (non-whitespace) task description, after calling
  // todoList.addTask(description) and then simulating a fresh load via
  // todoList.load(), the resulting task array SHALL contain an entry whose
  // description equals the trimmed input value.
  //
  // Validates: Requirements 7.1, 7.2, 7.5
  // ---------------------------------------------------------------------------
  try {
    fc.assert(
      fc.property(
        // Generator: strings with at least one non-whitespace character, trimmed
        // result length 1–500 characters (matching the Task description constraint)
        fc.string({ minLength: 1, maxLength: 500 }).filter(function (s) {
          return s.trim().length > 0;
        }),
        function (description) {
          // Start clean — clear any previous tasks
          todoList.setTasks([]);

          // Add the task (will trim description internally)
          todoList.addTask(description);

          // Simulate a page reload: load() reads from localStorage
          todoList.load();

          var tasks = todoList.getTasks();
          var trimmed = description.trim();

          // There must be an entry whose description equals the trimmed input
          return tasks.some(function (t) {
            return t.description === trimmed;
          });
        }
      ),
      { numRuns: 100 }
    );
    pass('Property 4: Task add/load round trip');
  } catch (e) {
    fail('Property 4: Task add/load round trip', e);
  }

  // ---------------------------------------------------------------------------
  // Property 3 – Whitespace-only task descriptions are rejected
  //
  // For any string composed entirely of whitespace characters, addTask(str)
  // SHALL not increase the length of the task array.
  //
  // Validates: Requirements 4.3
  // ---------------------------------------------------------------------------
  try {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')),
        function (whitespaceStr) {
          todoList.setTasks([]);
          var before = todoList.getTasks().length; // 0

          todoList.addTask(whitespaceStr);

          var after = todoList.getTasks().length;
          return after === before;
        }
      ),
      { numRuns: 100 }
    );
    pass('Property 3: Whitespace-only task descriptions are rejected');
  } catch (e) {
    fail('Property 3: Whitespace-only task descriptions are rejected', e);
  }

  // ---------------------------------------------------------------------------
  // Property 5 – Task toggle is a true inverse
  //
  // For any task in the list, calling toggleTask(id) twice SHALL leave the
  // task's completed state equal to its original value.
  //
  // Validates: Requirements 6.1, 6.2
  // ---------------------------------------------------------------------------
  try {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 100 }).filter(function (s) {
            return s.trim().length > 0;
          }),
          { minLength: 1, maxLength: 5 }
        ).chain(function (descriptions) {
          return fc.tuple(
            fc.constant(descriptions),
            fc.integer({ min: 0, max: descriptions.length - 1 })
          );
        }),
        function (pair) {
          var descriptions = pair[0];
          var idx          = pair[1];

          var initialTasks = descriptions.map(function (desc, i) {
            return {
              id:          'toggle-test-' + i,
              description: desc.trim(),
              completed:   false,
              createdAt:   Date.now()
            };
          });
          todoList.setTasks(initialTasks);

          var targetId          = initialTasks[idx].id;
          var originalCompleted = initialTasks[idx].completed; // always false

          todoList.toggleTask(targetId);
          var afterFirst  = todoList.getTasks()[idx].completed;

          todoList.toggleTask(targetId);
          var afterSecond = todoList.getTasks()[idx].completed;

          return afterSecond === originalCompleted && afterFirst === !originalCompleted;
        }
      ),
      { numRuns: 100 }
    );
    pass('Property 5: Task toggle is a true inverse (round-trip idempotence)');
  } catch (e) {
    fail('Property 5: Task toggle is a true inverse (round-trip idempotence)', e);
  } finally {
    localStorage.removeItem('todo_tasks');
  }

  // ---------------------------------------------------------------------------
  // Property 6 – Deleted task is absent after delete
  //
  // For any task present in the list, after deleteTask(id) no entry in the
  // in-memory array SHALL have the same id.
  //
  // Validates: Requirements 6.3
  // ---------------------------------------------------------------------------
  try {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 100 }).filter(function (s) {
            return s.trim().length > 0;
          }),
          { minLength: 1, maxLength: 5 }
        ).chain(function (descriptions) {
          return fc.tuple(
            fc.constant(descriptions),
            fc.integer({ min: 0, max: descriptions.length - 1 })
          );
        }),
        function (pair) {
          var descriptions = pair[0];
          var idx          = pair[1];

          var initialTasks = descriptions.map(function (desc, i) {
            return {
              id:          'delete-test-' + i,
              description: desc.trim(),
              completed:   false,
              createdAt:   Date.now()
            };
          });
          todoList.setTasks(initialTasks);

          var targetId = initialTasks[idx].id;
          todoList.deleteTask(targetId);

          var remaining = todoList.getTasks();
          return !remaining.some(function (t) { return t.id === targetId; });
        }
      ),
      { numRuns: 100 }
    );
    pass('Property 6: Deleted task is absent after delete');
  } catch (e) {
    fail('Property 6: Deleted task is absent after delete', e);
  } finally {
    localStorage.removeItem('todo_tasks');
  }

  // ---------------------------------------------------------------------------
  // Property 7 – Edit save trims and enforces length
  //
  // For any description string of 1–500 non-whitespace characters (after trim),
  // saveEdit(id, str) SHALL store the trimmed value exactly and the stored
  // description length SHALL be <= 500.
  //
  // Validates: Requirements 5.2, 5.5
  // ---------------------------------------------------------------------------
  try {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }).filter(function (s) {
          return s.trim().length > 0;
        }),
        function (newText) {
          var taskId = 'edit-test-prop7';
          todoList.setTasks([{
            id:          taskId,
            description: 'original',
            completed:   false,
            createdAt:   Date.now()
          }]);

          todoList.saveEdit(taskId, newText);

          var updated = todoList.getTasks();
          var desc    = updated[0].description;
          var trimmed = newText.trim();

          // stored value must equal trimmed input (or be truncated to 500 chars)
          return desc === trimmed.slice(0, 500) && desc.length <= 500;
        }
      ),
      { numRuns: 100 }
    );
    pass('Property 7: Edit save trims and enforces 500-char length');
  } catch (e) {
    fail('Property 7: Edit save trims and enforces 500-char length', e);
  } finally {
    localStorage.removeItem('todo_tasks');
  }

  // ---------------------------------------------------------------------------
  // Unit tests
  // ---------------------------------------------------------------------------

  // load() filters out malformed entries from localStorage
  try {
    var TEST_KEY = 'todo_tasks';
    var good = { id: 'abc', description: 'Valid task', completed: false, createdAt: 1722000000000 };
    var bad1 = { description: 'Missing id', completed: false, createdAt: 123 };       // no id
    var bad2 = { id: 'xyz', description: 42, completed: false, createdAt: 123 };      // description not string
    var bad3 = { id: 'uvw', description: 'Bad completed', completed: 'yes', createdAt: 123 }; // completed not boolean
    var bad4 = { id: 'rst', description: 'Bad createdAt', completed: false };          // no createdAt
    var bad5 = null;

    localStorage.setItem(TEST_KEY, JSON.stringify([good, bad1, bad2, bad3, bad4, bad5]));
    todoList.load();

    var tasks = todoList.getTasks();
    if (tasks.length !== 1) {
      throw new Error('Expected 1 valid task after filtering, got ' + tasks.length);
    }
    if (tasks[0].description !== 'Valid task') {
      throw new Error('Expected "Valid task", got "' + tasks[0].description + '"');
    }
    pass('Unit: load() filters out malformed entries, keeps only valid tasks');
  } catch (e) {
    fail('Unit: load() filters out malformed entries, keeps only valid tasks', e);
  } finally {
    localStorage.removeItem('todo_tasks');
  }

  // load() on empty storage returns empty array
  try {
    localStorage.removeItem('todo_tasks');
    todoList.setTasks([{ id: 'x', description: 'stale', completed: false, createdAt: 1 }]);
    todoList.load();
    var tasks2 = todoList.getTasks();
    if (tasks2.length !== 0) {
      throw new Error('Expected empty array on fresh load, got ' + tasks2.length);
    }
    pass('Unit: load() returns [] when no data in storage');
  } catch (e) {
    fail('Unit: load() returns [] when no data in storage', e);
  }

  // save() persists to localStorage and load() reads it back
  try {
    var task = {
      id: 'test-id-001',
      description: 'Test persistence',
      completed: false,
      createdAt: Date.now()
    };
    todoList.setTasks([task]);
    todoList.save();
    todoList.setTasks([]); // clear in-memory
    todoList.load();

    var loaded = todoList.getTasks();
    if (loaded.length !== 1) {
      throw new Error('Expected 1 task after save+load, got ' + loaded.length);
    }
    if (loaded[0].id !== task.id || loaded[0].description !== task.description) {
      throw new Error('Loaded task does not match saved task');
    }
    pass('Unit: save() + load() round trip preserves task data');
  } catch (e) {
    fail('Unit: save() + load() round trip preserves task data', e);
  } finally {
    localStorage.removeItem('todo_tasks');
  }

  // generateId() returns a non-empty string
  try {
    var id = todoList.generateId();
    if (typeof id !== 'string' || id.length === 0) {
      throw new Error('Expected non-empty string, got: ' + JSON.stringify(id));
    }
    pass('Unit: generateId() returns a non-empty string');
  } catch (e) {
    fail('Unit: generateId() returns a non-empty string', e);
  }

  // generateId() produces unique values on successive calls
  try {
    var ids = [];
    for (var i = 0; i < 20; i++) {
      ids.push(todoList.generateId());
    }
    var unique = ids.filter(function (id, idx) { return ids.indexOf(id) === idx; });
    if (unique.length !== 20) {
      throw new Error('generateId() produced duplicates among 20 calls');
    }
    pass('Unit: generateId() produces unique values across 20 calls');
  } catch (e) {
    fail('Unit: generateId() produces unique values across 20 calls', e);
  }

  // ---------------------------------------------------------------------------
  // Unit tests — Edit (Task 10.1: beginEdit / saveEdit / cancelEdit)
  // Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
  // ---------------------------------------------------------------------------

  // saveEdit() with a valid description updates the task description
  try {
    todoList.setTasks([
      { id: 'e1', description: 'Original text', completed: false, createdAt: 1 }
    ]);
    todoList.saveEdit('e1', '  Updated text  ');
    var afterSave = todoList.getTasks();
    if (afterSave[0].description !== 'Updated text') {
      throw new Error('Expected "Updated text", got "' + afterSave[0].description + '"');
    }
    pass('Unit: saveEdit() trims and updates description (Req 5.2)');
  } catch (e) {
    fail('Unit: saveEdit() trims and updates description (Req 5.2)', e);
  } finally {
    localStorage.removeItem('todo_tasks');
  }

  // saveEdit() with empty text does NOT update the task description
  try {
    todoList.setTasks([
      { id: 'e2', description: 'Keep this', completed: false, createdAt: 1 }
    ]);
    todoList.saveEdit('e2', '   ');
    var afterEmpty = todoList.getTasks();
    if (afterEmpty[0].description !== 'Keep this') {
      throw new Error('Expected "Keep this" to be preserved, got "' + afterEmpty[0].description + '"');
    }
    pass('Unit: saveEdit() with whitespace-only input preserves original description (Req 5.3)');
  } catch (e) {
    fail('Unit: saveEdit() with whitespace-only input preserves original description (Req 5.3)', e);
  }

  // saveEdit() enforces 500-character maximum
  try {
    var longStr = 'a'.repeat(600);
    todoList.setTasks([
      { id: 'e3', description: 'Short', completed: false, createdAt: 1 }
    ]);
    todoList.saveEdit('e3', longStr);
    var afterLong = todoList.getTasks();
    if (afterLong[0].description.length > 500) {
      throw new Error('Expected description <= 500 chars, got ' + afterLong[0].description.length);
    }
    pass('Unit: saveEdit() enforces 500-character maximum (Req 5.2, 5.5)');
  } catch (e) {
    fail('Unit: saveEdit() enforces 500-character maximum (Req 5.2, 5.5)', e);
  } finally {
    localStorage.removeItem('todo_tasks');
  }

  // cancelEdit() does not change the task description
  try {
    todoList.setTasks([
      { id: 'e4', description: 'Unchanged', completed: false, createdAt: 1 }
    ]);
    todoList.cancelEdit('e4');
    var afterCancel = todoList.getTasks();
    if (afterCancel[0].description !== 'Unchanged') {
      throw new Error('Expected "Unchanged", got "' + afterCancel[0].description + '"');
    }
    pass('Unit: cancelEdit() preserves original description (Req 5.4)');
  } catch (e) {
    fail('Unit: cancelEdit() preserves original description (Req 5.4)', e);
  }

  // saveEdit() clears editingId
  try {
    todoList.setTasks([
      { id: 'e5', description: 'Test', completed: false, createdAt: 1 }
    ]);
    todoList.setEditingId('e5');
    todoList.saveEdit('e5', 'New value');
    if (todoList.getEditingId() !== null) {
      throw new Error('Expected editingId to be null after saveEdit, got ' + todoList.getEditingId());
    }
    pass('Unit: saveEdit() resets editingId to null');
  } catch (e) {
    fail('Unit: saveEdit() resets editingId to null', e);
  } finally {
    localStorage.removeItem('todo_tasks');
  }

  // cancelEdit() clears editingId
  try {
    todoList.setTasks([
      { id: 'e6', description: 'Test', completed: false, createdAt: 1 }
    ]);
    todoList.setEditingId('e6');
    todoList.cancelEdit('e6');
    if (todoList.getEditingId() !== null) {
      throw new Error('Expected editingId to be null after cancelEdit, got ' + todoList.getEditingId());
    }
    pass('Unit: cancelEdit() resets editingId to null');
  } catch (e) {
    fail('Unit: cancelEdit() resets editingId to null', e);
  }

  // ---------------------------------------------------------------------------
  // Report results to the HTML harness
  // ---------------------------------------------------------------------------
  return RESULTS;
})();
