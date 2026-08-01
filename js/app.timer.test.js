// Feature: todo-life-dashboard, Property 10: Timer countdown decrements one second per tick
// Feature: todo-life-dashboard, Property 11: Timer reset always returns to 1500 seconds
//
// This file contains property-based tests for the focusTimer module.
// It is loaded by tests/timer.test.html which provides fast-check via CDN.
//
// Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9

/* global fc, focusTimer */

(function runTimerTests() {
  'use strict';

  var RESULTS = [];

  function pass(name) {
    RESULTS.push({ name: name, ok: true });
  }

  function fail(name, err) {
    RESULTS.push({ name: name, ok: false, error: String(err) });
  }

  // ---------------------------------------------------------------------------
  // Property 10 – Timer countdown decrements one second per tick
  //
  // For any starting value of remainingSeconds in [1, 1500], after one call to
  // focusTimer.tick(), the new remainingSeconds SHALL equal the previous value minus 1.
  //
  // Validates: Requirements 3.3
  // ---------------------------------------------------------------------------
  try {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1500 }),
        function (startSeconds) {
          // Reset to a known baseline before each run
          focusTimer.reset();

          // Inject the desired starting value via a helper that the test harness
          // exposes on the focusTimer object
          focusTimer.setRemainingSeconds(startSeconds);

          var before = focusTimer.getRemainingSeconds();
          focusTimer.tick();
          var after = focusTimer.getRemainingSeconds();

          return after === before - 1;
        }
      ),
      { numRuns: 100 }
    );
    pass('Property 10: Timer countdown decrements one second per tick');
  } catch (e) {
    fail('Property 10: Timer countdown decrements one second per tick', e);
  }

  // ---------------------------------------------------------------------------
  // Property 11 – Timer reset always returns to 1500 seconds and "idle" state
  //
  // For any timer state (idle, running, paused, completed) and any value of
  // remainingSeconds, after focusTimer.reset(), remainingSeconds SHALL equal
  // 1500 and state SHALL equal "idle".
  //
  // Validates: Requirements 3.5, 3.9
  // ---------------------------------------------------------------------------
  try {
    var ALL_STATES = ['idle', 'running', 'paused', 'completed'];

    fc.assert(
      fc.property(
        fc.constantFrom.apply(fc, ALL_STATES),
        fc.integer({ min: 0, max: 1500 }),
        function (timerState, seconds) {
          // Bring the timer into the desired state
          focusTimer.reset();                         // ensure clean slate first
          focusTimer.setRemainingSeconds(seconds);
          focusTimer.setState(timerState);

          focusTimer.reset();

          return (
            focusTimer.getRemainingSeconds() === 1500 &&
            focusTimer.getState() === 'idle'
          );
        }
      ),
      { numRuns: 100 }
    );
    pass('Property 11: Timer reset always returns to 1500 seconds and "idle" state');
  } catch (e) {
    fail('Property 11: Timer reset always returns to 1500 seconds and "idle" state', e);
  }

  // ---------------------------------------------------------------------------
  // Unit tests
  // ---------------------------------------------------------------------------

  // Init renders "25:00"
  try {
    focusTimer.reset();
    var displayEl = document.getElementById('timer-display');
    if (!displayEl) {
      throw new Error('#timer-display element not found in test DOM');
    }
    focusTimer.render();
    if (displayEl.textContent !== '25:00') {
      throw new Error('Expected "25:00" after reset+render, got "' + displayEl.textContent + '"');
    }
    pass('Unit: render() shows "25:00" after reset');
  } catch (e) {
    fail('Unit: render() shows "25:00" after reset', e);
  }

  // tick() reduces remaining seconds by 1
  try {
    focusTimer.reset();
    focusTimer.setRemainingSeconds(60);
    focusTimer.tick();
    if (focusTimer.getRemainingSeconds() !== 59) {
      throw new Error('Expected 59, got ' + focusTimer.getRemainingSeconds());
    }
    pass('Unit: tick() decrements remainingSeconds from 60 to 59');
  } catch (e) {
    fail('Unit: tick() decrements remainingSeconds from 60 to 59', e);
  }

  // setCompleted() at 0 adds timer--completed class and sets state
  try {
    focusTimer.reset();
    focusTimer.setRemainingSeconds(1);
    focusTimer.tick(); // will reach 0 → calls setCompleted()
    var timerEl = document.getElementById('focus-timer');
    if (!timerEl) {
      throw new Error('#focus-timer element not found in test DOM');
    }
    if (!timerEl.classList.contains('timer--completed')) {
      throw new Error('Expected "timer--completed" class after reaching 0');
    }
    if (focusTimer.getState() !== 'completed') {
      throw new Error('Expected state "completed", got "' + focusTimer.getState() + '"');
    }
    if (focusTimer.getRemainingSeconds() !== 0) {
      throw new Error('Expected 0, got ' + focusTimer.getRemainingSeconds());
    }
    pass('Unit: tick() reaching 0 sets state="completed" and adds timer--completed class');
  } catch (e) {
    fail('Unit: tick() reaching 0 sets state="completed" and adds timer--completed class', e);
  }

  // display shows "00:00" when remainingSeconds is 0
  try {
    focusTimer.reset();
    focusTimer.setRemainingSeconds(0);
    focusTimer.render();
    var displayEl2 = document.getElementById('timer-display');
    if (displayEl2.textContent !== '00:00') {
      throw new Error('Expected "00:00", got "' + displayEl2.textContent + '"');
    }
    pass('Unit: render() shows "00:00" when remainingSeconds is 0');
  } catch (e) {
    fail('Unit: render() shows "00:00" when remainingSeconds is 0', e);
  }

  // start() is a no-op when already running (Requirement 3.7)
  try {
    focusTimer.reset();
    focusTimer.start();                         // IDLE → RUNNING
    var id1 = focusTimer.getIntervalId();
    focusTimer.start();                         // should be no-op
    var id2 = focusTimer.getIntervalId();
    focusTimer.stop();                          // clean up
    if (id1 !== id2) {
      throw new Error('start() while running created a new interval (expected no-op)');
    }
    if (focusTimer.getState() !== 'paused') {
      throw new Error('Expected state "paused" after stop(), got "' + focusTimer.getState() + '"');
    }
    pass('Unit: start() is a no-op when timer is already running (Req 3.7)');
  } catch (e) {
    fail('Unit: start() is a no-op when timer is already running (Req 3.7)', e);
  }

  // stop() is a no-op when paused (Requirement 3.8)
  try {
    focusTimer.reset();
    focusTimer.start();
    focusTimer.stop();                          // RUNNING → PAUSED
    var stateBefore = focusTimer.getState();
    focusTimer.stop();                          // should be no-op
    var stateAfter = focusTimer.getState();
    if (stateBefore !== 'paused' || stateAfter !== 'paused') {
      throw new Error('Expected state to stay "paused" after redundant stop(), got before="' +
        stateBefore + '", after="' + stateAfter + '"');
    }
    pass('Unit: stop() is a no-op when timer is already paused (Req 3.8)');
  } catch (e) {
    fail('Unit: stop() is a no-op when timer is already paused (Req 3.8)', e);
  }

  // reset() from any state removes timer--completed class
  try {
    focusTimer.reset();
    focusTimer.setRemainingSeconds(1);
    focusTimer.tick();                          // reaches 0 → COMPLETED
    focusTimer.reset();                         // COMPLETED → IDLE
    var timerEl2 = document.getElementById('focus-timer');
    if (timerEl2.classList.contains('timer--completed')) {
      throw new Error('Expected "timer--completed" class to be removed after reset()');
    }
    if (focusTimer.getState() !== 'idle') {
      throw new Error('Expected state "idle" after reset from completed, got "' + focusTimer.getState() + '"');
    }
    pass('Unit: reset() removes timer--completed class and returns to idle');
  } catch (e) {
    fail('Unit: reset() removes timer--completed class and returns to idle', e);
  }

  // ---------------------------------------------------------------------------
  // Report results to the HTML harness
  // ---------------------------------------------------------------------------
  return RESULTS;
})();
