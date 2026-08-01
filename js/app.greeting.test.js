// Feature: todo-life-dashboard, Property 1: Greeting classification covers all hours
// Feature: todo-life-dashboard, Property 2: Clock format is always HH:MM:SS
//
// This file contains property-based tests for the greetingWidget helper functions.
// It is loaded by tests/greeting.test.html which provides fast-check via CDN.
//
// Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6

/* global fc, greetingWidget */

(function runGreetingTests() {
  'use strict';

  var RESULTS = [];

  function pass(name) {
    RESULTS.push({ name: name, ok: true });
  }

  function fail(name, err) {
    RESULTS.push({ name: name, ok: false, error: String(err) });
  }

  var VALID_GREETINGS = ['Good Morning', 'Good Afternoon', 'Good Evening', 'Good Night'];

  // ---------------------------------------------------------------------------
  // Property 1 – Greeting classification covers all hours
  //
  // For any integer hour value in [0, 23], getGreeting(hour) SHALL return
  // exactly one of the four valid greeting strings and the result SHALL be non-empty.
  //
  // Validates: Requirements 2.3, 2.4, 2.5, 2.6
  // ---------------------------------------------------------------------------
  try {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }),
        function (hour) {
          var result = greetingWidget.getGreeting(hour);
          return (
            typeof result === 'string' &&
            result.length > 0 &&
            VALID_GREETINGS.indexOf(result) !== -1
          );
        }
      ),
      { numRuns: 100 }
    );
    pass('Property 1: Greeting classification covers all hours');
  } catch (e) {
    fail('Property 1: Greeting classification covers all hours', e);
  }

  // ---------------------------------------------------------------------------
  // Property 2 – Clock format is always HH:MM:SS
  //
  // For any valid Date object, formatTime(date) SHALL return a string matching
  // the pattern ^\d{2}:\d{2}:\d{2}$ with all components zero-padded.
  //
  // Validates: Requirements 2.1
  // ---------------------------------------------------------------------------
  try {
    fc.assert(
      fc.property(
        fc.date(),
        function (date) {
          var result = greetingWidget.formatTime(date);
          return /^\d{2}:\d{2}:\d{2}$/.test(result);
        }
      ),
      { numRuns: 100 }
    );
    pass('Property 2: Clock format is always HH:MM:SS');
  } catch (e) {
    fail('Property 2: Clock format is always HH:MM:SS', e);
  }

  // ---------------------------------------------------------------------------
  // Bonus unit-level examples (boundary checks and specific hours)
  // ---------------------------------------------------------------------------

  // Hour boundary tests for getGreeting
  var hourExpectations = [
    { hour:  0, expected: 'Good Night' },
    { hour:  4, expected: 'Good Night' },
    { hour:  5, expected: 'Good Morning' },
    { hour: 11, expected: 'Good Morning' },
    { hour: 12, expected: 'Good Afternoon' },
    { hour: 17, expected: 'Good Afternoon' },
    { hour: 18, expected: 'Good Evening' },
    { hour: 21, expected: 'Good Evening' },
    { hour: 22, expected: 'Good Night' },
    { hour: 23, expected: 'Good Night' }
  ];

  hourExpectations.forEach(function (tc) {
    try {
      var result = greetingWidget.getGreeting(tc.hour);
      if (result !== tc.expected) {
        throw new Error('Hour ' + tc.hour + ': expected "' + tc.expected + '", got "' + result + '"');
      }
      pass('getGreeting(' + tc.hour + ') === "' + tc.expected + '"');
    } catch (e) {
      fail('getGreeting(' + tc.hour + ') === "' + tc.expected + '"', e);
    }
  });

  // formatTime: zero-padding for midnight
  try {
    var midnight = new Date(2025, 0, 1, 0, 0, 0); // 00:00:00
    var result = greetingWidget.formatTime(midnight);
    if (result !== '00:00:00') {
      throw new Error('Expected "00:00:00", got "' + result + '"');
    }
    pass('formatTime pads midnight to "00:00:00"');
  } catch (e) {
    fail('formatTime pads midnight to "00:00:00"', e);
  }

  // formatTime: single-digit components are zero-padded
  try {
    var earlyTime = new Date(2025, 0, 1, 1, 2, 3); // 01:02:03
    var result = greetingWidget.formatTime(earlyTime);
    if (result !== '01:02:03') {
      throw new Error('Expected "01:02:03", got "' + result + '"');
    }
    pass('formatTime pads single-digit values to "01:02:03"');
  } catch (e) {
    fail('formatTime pads single-digit values to "01:02:03"', e);
  }

  // formatDate: produces correct format "Monday, 28 July 2025"
  try {
    // July 28 2025 is a Monday
    var knownDate = new Date(2025, 6, 28); // month is 0-indexed
    var result = greetingWidget.formatDate(knownDate);
    if (result !== 'Monday, 28 July 2025') {
      throw new Error('Expected "Monday, 28 July 2025", got "' + result + '"');
    }
    pass('formatDate returns "Monday, 28 July 2025"');
  } catch (e) {
    fail('formatDate returns "Monday, 28 July 2025"', e);
  }

  // ---------------------------------------------------------------------------
  // Report results to the HTML harness
  // ---------------------------------------------------------------------------
  return RESULTS;
})();
