// Feature: todo-life-dashboard, Property 12: Storage get/set round trip
//
// This file contains the property-based test for the storage helper.
// It is loaded by tests/storage.test.html which provides fast-check via CDN.
//
// Validates: Requirements 7.1, 7.2, 10.1, 10.3

/* global fc, storage */

(function runStorageTests() {
  'use strict';

  var RESULTS = [];
  var TEST_KEY = '__pbt_test_key__';

  function pass(name) {
    RESULTS.push({ name: name, ok: true });
  }

  function fail(name, err) {
    RESULTS.push({ name: name, ok: false, error: String(err) });
  }

  // ---------------------------------------------------------------------------
  // Property 12 – Storage get/set round trip
  //
  // For any JSON-serialisable array, writing it with storage.set(key, data)
  // and immediately reading it back with storage.get(key) SHALL return a value
  // deeply equal to the original array.
  // ---------------------------------------------------------------------------
  try {
    fc.assert(
      fc.property(
        // Generator: arrays of JSON-serialisable primitives and nested objects.
        // fc.jsonValue() produces any JSON-safe value; we wrap in an array so the
        // storage helper always receives an array (its contract).
        fc.array(fc.jsonValue()),
        function (data) {
          storage.set(TEST_KEY, data);
          var result = storage.get(TEST_KEY);

          // Deep equality check via JSON serialisation (sufficient for JSON-safe values)
          return JSON.stringify(result) === JSON.stringify(data);
        }
      ),
      { numRuns: 100 }
    );
    pass('Property 12: Storage get/set round trip');
  } catch (e) {
    fail('Property 12: Storage get/set round trip', e);
  } finally {
    // Clean up test key regardless of outcome
    storage.remove(TEST_KEY);
  }

  // ---------------------------------------------------------------------------
  // Bonus unit-level examples (not PBT — fast sanity checks)
  // ---------------------------------------------------------------------------

  // get() on a missing key returns []
  try {
    storage.remove('__missing__');
    var empty = storage.get('__missing__');
    if (!Array.isArray(empty) || empty.length !== 0) {
      throw new Error('Expected [] for missing key, got: ' + JSON.stringify(empty));
    }
    pass('get() returns [] for missing key');
  } catch (e) {
    fail('get() returns [] for missing key', e);
  }

  // get() on corrupted data returns [] and does not throw
  try {
    localStorage.setItem('__corrupted__', 'NOT_VALID_JSON{{{');
    var corrupted = storage.get('__corrupted__');
    if (!Array.isArray(corrupted) || corrupted.length !== 0) {
      throw new Error('Expected [] for corrupted data, got: ' + JSON.stringify(corrupted));
    }
    pass('get() returns [] for corrupted JSON');
  } catch (e) {
    fail('get() returns [] for corrupted JSON', e);
  } finally {
    storage.remove('__corrupted__');
  }

  // get() on a non-array JSON value returns []
  try {
    localStorage.setItem('__nonarray__', JSON.stringify({ not: 'an array' }));
    var nonArray = storage.get('__nonarray__');
    if (!Array.isArray(nonArray) || nonArray.length !== 0) {
      throw new Error('Expected [] for non-array value, got: ' + JSON.stringify(nonArray));
    }
    pass('get() returns [] for non-array JSON value');
  } catch (e) {
    fail('get() returns [] for non-array JSON value', e);
  } finally {
    storage.remove('__nonarray__');
  }

  // remove() deletes the key
  try {
    storage.set('__remove_test__', [1, 2, 3]);
    storage.remove('__remove_test__');
    var afterRemove = storage.get('__remove_test__');
    if (!Array.isArray(afterRemove) || afterRemove.length !== 0) {
      throw new Error('Expected [] after remove, got: ' + JSON.stringify(afterRemove));
    }
    pass('remove() deletes the key');
  } catch (e) {
    fail('remove() deletes the key', e);
  }

  // ---------------------------------------------------------------------------
  // Report results to the HTML harness
  // ---------------------------------------------------------------------------
  return RESULTS;
})();
