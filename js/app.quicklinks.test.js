// Feature: todo-life-dashboard, Property 9: Invalid URL protocol is always rejected
// Feature: todo-life-dashboard, Property 12: Storage get/set round trip
//
// This file contains property-based tests and unit tests for the quickLinks module.
// It is loaded by tests/quicklinks.test.html which provides fast-check via CDN.
//
// Validates: Requirements 9.4, 10.1, 10.2, 10.3, 10.5

/* global fc, storage, quickLinks */

(function runQuickLinksTests() {
  'use strict';

  var RESULTS = [];

  function pass(name) {
    RESULTS.push({ name: name, ok: true });
  }

  function fail(name, err) {
    RESULTS.push({ name: name, ok: false, error: String(err) });
  }

  // ---------------------------------------------------------------------------
  // Property 9 – Invalid URL protocol is always rejected
  //
  // For any URL string that does NOT begin with "http://" or "https://",
  // quickLinks.validateUrl(url) SHALL return false.
  //
  // Validates: Requirements 9.4
  // ---------------------------------------------------------------------------
  try {
    fc.assert(
      fc.property(
        // Generator: any string that does not start with "http://" or "https://"
        fc.string().filter(function (s) {
          return s.indexOf('http://') !== 0 && s.indexOf('https://') !== 0;
        }),
        function (url) {
          return quickLinks.validateUrl(url) === false;
        }
      ),
      { numRuns: 100 }
    );
    pass('Property 9: Invalid URL protocol is always rejected');
  } catch (e) {
    fail('Property 9: Invalid URL protocol is always rejected', e);
  }

  // ---------------------------------------------------------------------------
  // Property 12 – Storage get/set round trip (quickLinks context)
  //
  // For any JSON-serialisable array, writing it with storage.set(key, data)
  // and immediately reading it back with storage.get(key) SHALL return a
  // deeply equal value.
  //
  // Validates: Requirements 10.1, 10.3
  // ---------------------------------------------------------------------------
  try {
    var TEST_KEY = '__ql_pbt_test__';
    fc.assert(
      fc.property(
        fc.array(fc.jsonValue()),
        function (data) {
          storage.set(TEST_KEY, data);
          var result = storage.get(TEST_KEY);
          return JSON.stringify(result) === JSON.stringify(data);
        }
      ),
      { numRuns: 100 }
    );
    pass('Property 12: Storage get/set round trip');
  } catch (e) {
    fail('Property 12: Storage get/set round trip', e);
  } finally {
    storage.remove('__ql_pbt_test__');
  }

  // ---------------------------------------------------------------------------
  // Unit tests – validateUrl
  // ---------------------------------------------------------------------------

  var urlCases = [
    // Valid
    { url: 'http://example.com',   expected: true,  label: 'validateUrl accepts http://' },
    { url: 'https://example.com',  expected: true,  label: 'validateUrl accepts https://' },
    { url: 'https://a.b/c?d=e#f', expected: true,  label: 'validateUrl accepts https:// with path/query/hash' },
    // Invalid
    { url: '',                     expected: false, label: 'validateUrl rejects empty string' },
    { url: 'ftp://example.com',    expected: false, label: 'validateUrl rejects ftp://' },
    { url: '//example.com',        expected: false, label: 'validateUrl rejects protocol-relative URL' },
    { url: 'HTTP://example.com',   expected: false, label: 'validateUrl rejects uppercase HTTP (case-sensitive)' },
    { url: 'HTTPS://example.com',  expected: false, label: 'validateUrl rejects uppercase HTTPS (case-sensitive)' },
    { url: 'javascript:alert(1)',  expected: false, label: 'validateUrl rejects javascript: URI' },
    { url: 'example.com',          expected: false, label: 'validateUrl rejects scheme-less URL' },
    { url: null,                   expected: false, label: 'validateUrl rejects null' },
    { url: 42,                     expected: false, label: 'validateUrl rejects non-string input' }
  ];

  urlCases.forEach(function (tc) {
    try {
      var result = quickLinks.validateUrl(tc.url);
      if (result !== tc.expected) {
        throw new Error(
          'validateUrl(' + JSON.stringify(tc.url) + '): expected ' + tc.expected + ', got ' + result
        );
      }
      pass('Unit: ' + tc.label);
    } catch (e) {
      fail('Unit: ' + tc.label, e);
    }
  });

  // ---------------------------------------------------------------------------
  // Unit tests – load() and save()
  // ---------------------------------------------------------------------------

  // load() sets in-memory links from localStorage
  try {
    var sampleLinks = [
      { id: 'a1', label: 'GitHub', url: 'https://github.com' },
      { id: 'b2', label: 'MDN',    url: 'https://developer.mozilla.org' }
    ];
    localStorage.setItem('quickLinks', JSON.stringify(sampleLinks));
    quickLinks.setLinks([]);   // clear in-memory first
    quickLinks.load();

    var loaded = quickLinks.getLinks();
    if (!Array.isArray(loaded) || loaded.length !== 2) {
      throw new Error('Expected 2 links after load(), got ' + (loaded && loaded.length));
    }
    if (loaded[0].label !== 'GitHub' || loaded[1].label !== 'MDN') {
      throw new Error('Loaded link labels do not match. Got: ' + JSON.stringify(loaded));
    }
    pass('Unit: load() sets in-memory links from storage');
  } catch (e) {
    fail('Unit: load() sets in-memory links from storage', e);
  } finally {
    localStorage.removeItem('quickLinks');
  }

  // load() on missing key results in empty array
  try {
    localStorage.removeItem('quickLinks');
    quickLinks.setLinks([{ id: 'stale', label: 'Old', url: 'https://old.example' }]);
    quickLinks.load();

    var afterEmpty = quickLinks.getLinks();
    if (!Array.isArray(afterEmpty) || afterEmpty.length !== 0) {
      throw new Error('Expected [] when no data in storage, got ' + JSON.stringify(afterEmpty));
    }
    pass('Unit: load() returns [] when no data in storage');
  } catch (e) {
    fail('Unit: load() returns [] when no data in storage', e);
  }

  // save() persists links to localStorage
  try {
    var link = { id: 'c3', label: 'Example', url: 'https://example.com' };
    quickLinks.setLinks([link]);
    quickLinks.save();

    var raw = localStorage.getItem('quickLinks');
    var parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 1) {
      throw new Error('Expected 1 link in localStorage after save(), got: ' + raw);
    }
    if (parsed[0].id !== link.id || parsed[0].url !== link.url) {
      throw new Error('Saved link does not match expected. Got: ' + JSON.stringify(parsed[0]));
    }
    pass('Unit: save() writes in-memory links to localStorage');
  } catch (e) {
    fail('Unit: save() writes in-memory links to localStorage', e);
  } finally {
    localStorage.removeItem('quickLinks');
  }

  // save() + load() round trip
  try {
    var links = [
      { id: 'd4', label: 'Google', url: 'http://google.com' },
      { id: 'e5', label: 'Bing',   url: 'https://bing.com' }
    ];
    quickLinks.setLinks(links);
    quickLinks.save();
    quickLinks.setLinks([]);   // clear in-memory
    quickLinks.load();

    var rt = quickLinks.getLinks();
    if (rt.length !== 2) {
      throw new Error('Expected 2 links after save+load, got ' + rt.length);
    }
    if (rt[0].id !== 'd4' || rt[1].id !== 'e5') {
      throw new Error('Round-trip links do not match. Got: ' + JSON.stringify(rt));
    }
    pass('Unit: save() + load() round trip preserves link data');
  } catch (e) {
    fail('Unit: save() + load() round trip preserves link data', e);
  } finally {
    localStorage.removeItem('quickLinks');
  }

  // ---------------------------------------------------------------------------
  // Report results to the HTML harness
  // ---------------------------------------------------------------------------
  return RESULTS;
})();
