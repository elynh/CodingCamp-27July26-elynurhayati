(function () {
  "use strict";

  // ============================================================
  // Storage Helper
  // ============================================================

  var storage = {
    get: function (key) {
      try {
        var raw = localStorage.getItem(key);

        if (raw === null) {
          return [];
        }

        var data = JSON.parse(raw);

        if (!Array.isArray(data)) {
          console.warn(
            '[storage.get] Value for key "' +
              key +
              '" is not an array. Returning [].',
          );

          return [];
        }

        return data;
      } catch (e) {
        console.warn(
          '[storage.get] Failed to read key "' + key + '". Returning [].',
          e,
        );

        return [];
      }
    },

    set: function (key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        if (e instanceof DOMException) {
          console.error(
            '[storage.set] Failed to write key "' + key + '".',
            e.name,
            e.message,
          );

          return;
        }

        throw e;
      }
    },

    remove: function (key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Non-fatal
      }
    },
  };

  // ============================================================
  // Greeting Widget
  // ============================================================

  var greetingWidget = (function () {
    "use strict";

    var intervalId = null;

    function getGreeting(hour) {
      if (hour >= 5 && hour <= 11) {
        return "Good Morning";
      }

      if (hour >= 12 && hour <= 17) {
        return "Good Afternoon";
      }

      if (hour >= 18 && hour <= 21) {
        return "Good Evening";
      }

      return "Good Night";
    }

    function formatTime(date) {
      var hours = String(date.getHours()).padStart(2, "0");

      var minutes = String(date.getMinutes()).padStart(2, "0");

      var seconds = String(date.getSeconds()).padStart(2, "0");

      return hours + ":" + minutes + ":" + seconds;
    }

    function formatDate(date) {
      var weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      return (
        weekdays[date.getDay()] +
        ", " +
        date.getDate() +
        " " +
        months[date.getMonth()] +
        " " +
        date.getFullYear()
      );
    }

    function tick() {
      try {
        var now = new Date();

        if (isNaN(now.getTime())) {
          throw new Error("Invalid Date");
        }

        var greetingEl = document.getElementById("greeting-text");

        var clockEl = document.getElementById("clock");

        var dateEl = document.getElementById("date-text");

        if (greetingEl) {
          greetingEl.textContent = getGreeting(now.getHours());

          greetingEl.hidden = false;
        }

        if (clockEl) {
          clockEl.textContent = formatTime(now);
        }

        if (dateEl) {
          dateEl.textContent = formatDate(now);
        }
      } catch (e) {
        var errorClockEl = document.getElementById("clock");

        var errorGreetingEl = document.getElementById("greeting-text");

        if (errorClockEl) {
          errorClockEl.textContent = "Time unavailable";
        }

        if (errorGreetingEl) {
          errorGreetingEl.hidden = true;
        }

        console.error("[greetingWidget.tick] Error:", e);
      }
    }

    function init() {
      if (intervalId !== null) {
        return;
      }

      tick();

      intervalId = setInterval(tick, 1000);
    }

    return {
      init: init,
      tick: tick,
      getGreeting: getGreeting,
      formatTime: formatTime,
      formatDate: formatDate,
    };
  })();

  // ============================================================
  // Focus Timer
  // ============================================================

  var focusTimer = (function () {
    "use strict";

    var DEFAULT_SECONDS = 1500;

    var remainingSeconds = DEFAULT_SECONDS;

    var state = "idle";

    var intervalId = null;

    var initialized = false;

    function render() {
      var minutes = Math.floor(remainingSeconds / 60);

      var seconds = remainingSeconds % 60;

      var display =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

      var timerDisplay = document.getElementById("timer-display");

      if (timerDisplay) {
        timerDisplay.textContent = display;
      }
    }

    function clearTimerInterval() {
      if (intervalId !== null) {
        clearInterval(intervalId);

        intervalId = null;
      }
    }

    function setCompleted() {
      clearTimerInterval();

      remainingSeconds = 0;

      state = "completed";

      render();

      var timerEl = document.getElementById("focus-timer");

      if (timerEl) {
        timerEl.classList.add("timer--completed");
      }
    }

    function tick() {
      if (state !== "running") {
        return;
      }

      if (remainingSeconds <= 0) {
        setCompleted();
        return;
      }

      remainingSeconds -= 1;

      if (remainingSeconds <= 0) {
        remainingSeconds = 0;

        render();

        setCompleted();

        return;
      }

      render();
    }

    function start() {
      if (state !== "idle" && state !== "paused") {
        return;
      }

      if (remainingSeconds <= 0) {
        return;
      }

      clearTimerInterval();

      state = "running";

      intervalId = setInterval(tick, 1000);
    }

    function stop() {
      if (state !== "running") {
        return;
      }

      clearTimerInterval();

      state = "paused";
    }

    function reset() {
      clearTimerInterval();

      remainingSeconds = DEFAULT_SECONDS;

      state = "idle";

      var timerEl = document.getElementById("focus-timer");

      if (timerEl) {
        timerEl.classList.remove("timer--completed");
      }

      render();
    }

    function init() {
      if (initialized) {
        return;
      }

      initialized = true;

      render();

      var startBtn = document.getElementById("timer-start");

      var stopBtn = document.getElementById("timer-stop");

      var resetBtn = document.getElementById("timer-reset");

      if (startBtn) {
        startBtn.addEventListener("click", start);
      }

      if (stopBtn) {
        stopBtn.addEventListener("click", stop);
      }

      if (resetBtn) {
        resetBtn.addEventListener("click", reset);
      }
    }

    return {
      init: init,
      start: start,
      stop: stop,
      reset: reset,
      tick: tick,
      render: render,
      setCompleted: setCompleted,

      getState: function () {
        return state;
      },

      getRemainingSeconds: function () {
        return remainingSeconds;
      },
    };
  })();

  // ============================================================
  // To-Do List
  // ============================================================

  var todoList = (function () {
    "use strict";

    var MAX_TASK_LENGTH = 200;

    var tasks = [];

    var editingId = null;

    var initialized = false;

    function generateId() {
      if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
      ) {
        return crypto.randomUUID();
      }

      return Date.now().toString() + Math.random().toString(36).slice(2);
    }

    function isValidTask(obj) {
      return (
        obj !== null &&
        typeof obj === "object" &&
        typeof obj.id === "string" &&
        typeof obj.description === "string" &&
        typeof obj.completed === "boolean" &&
        typeof obj.createdAt === "number"
      );
    }

    function getTaskById(id) {
      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
          return tasks[i];
        }
      }

      return null;
    }

    function getTaskElement(id) {
      return document.querySelector('#task-list [data-id="' + id + '"]');
    }

    function load() {
      var raw = storage.get("todo_tasks");

      tasks = raw.filter(isValidTask);
    }

    function save() {
      storage.set("todo_tasks", tasks);
    }

    function render() {
      var listEl = document.getElementById("task-list");

      var emptyEl = document.getElementById("todo-empty");

      if (!listEl) {
        return;
      }

      listEl.innerHTML = "";

      tasks.forEach(function (task) {
        var li = document.createElement("li");

        li.className =
          "task-item" + (task.completed ? " task-item--complete" : "");

        li.setAttribute("data-id", task.id);

        var toggleBtn = document.createElement("button");

        toggleBtn.type = "button";

        toggleBtn.className = "task-toggle";

        toggleBtn.setAttribute("aria-label", "Toggle complete");

        toggleBtn.setAttribute(
          "aria-pressed",
          task.completed ? "true" : "false",
        );

        toggleBtn.textContent = "✓";

        (function (taskId) {
          toggleBtn.addEventListener("click", function () {
            toggleTask(taskId);
          });
        })(task.id);

        var textSpan = document.createElement("span");

        textSpan.className = "task-text";

        textSpan.textContent = task.description;

        var editBtn = document.createElement("button");

        editBtn.type = "button";

        editBtn.className = "task-edit";

        editBtn.textContent = "Edit";

        (function (taskId) {
          editBtn.addEventListener("click", function () {
            beginEdit(taskId);
          });
        })(task.id);

        var deleteBtn = document.createElement("button");

        deleteBtn.type = "button";

        deleteBtn.className = "task-delete";

        deleteBtn.textContent = "Delete";

        (function (taskId) {
          deleteBtn.addEventListener("click", function () {
            deleteTask(taskId);
          });
        })(task.id);

        li.appendChild(toggleBtn);

        li.appendChild(textSpan);

        li.appendChild(editBtn);

        li.appendChild(deleteBtn);

        listEl.appendChild(li);
      });

      if (emptyEl) {
        emptyEl.hidden = tasks.length > 0;
      }
    }

    function toggleTask(id) {
      var task = getTaskById(id);

      if (!task) {
        return;
      }

      task.completed = !task.completed;

      save();

      render();
    }

    function deleteTask(id) {
      tasks = tasks.filter(function (task) {
        return task.id !== id;
      });

      if (editingId === id) {
        editingId = null;
      }

      save();

      render();
    }

    function addTask(description) {
      if (typeof description !== "string") {
        return;
      }

      var trimmed = description.trim();

      if (trimmed.length === 0) {
        return;
      }

      if (trimmed.length > MAX_TASK_LENGTH) {
        trimmed = trimmed.slice(0, MAX_TASK_LENGTH);
      }

      tasks.push({
        id: generateId(),

        description: trimmed,

        completed: false,

        createdAt: Date.now(),
      });

      save();

      render();

      var inputEl = document.getElementById("todo-input");

      if (inputEl) {
        inputEl.value = "";
      }
    }

    function beginEdit(id) {
      var task = getTaskById(id);

      if (!task) {
        return;
      }

      if (editingId !== null && editingId !== id) {
        cancelEdit(editingId);
      }

      var li = getTaskElement(id);

      if (!li) {
        return;
      }

      var textSpan = li.querySelector(".task-text");

      if (!textSpan) {
        return;
      }

      editingId = id;

      var input = document.createElement("input");

      input.className = "task-edit-input";

      input.type = "text";

      input.maxLength = MAX_TASK_LENGTH;

      input.value = task.description;

      (function (taskId) {
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();

            saveEdit(taskId, input.value);

            return;
          }

          if (e.key === "Escape") {
            e.preventDefault();

            cancelEdit(taskId);
          }
        });
      })(id);

      li.replaceChild(input, textSpan);

      input.focus();

      var length = input.value.length;

      input.setSelectionRange(length, length);
    }

    function saveEdit(id, newText) {
      var task = getTaskById(id);

      if (!task) {
        editingId = null;

        return;
      }

      var trimmed = typeof newText === "string" ? newText.trim() : "";

      if (trimmed.length === 0) {
        editingId = null;

        render();

        var errorLi = getTaskElement(id);

        if (errorLi) {
          errorLi.classList.add("task-item--error");
        }

        return;
      }

      if (trimmed.length > MAX_TASK_LENGTH) {
        return;
      }

      task.description = trimmed;

      editingId = null;

      save();

      render();
    }

    function cancelEdit(id) {
      if (editingId === id) {
        editingId = null;
      }

      render();
    }

    function init() {
      if (initialized) {
        return;
      }

      initialized = true;

      load();

      render();

      var inputEl = document.getElementById("todo-input");

      var addBtn = document.getElementById("todo-add");

      if (addBtn) {
        addBtn.addEventListener("click", function () {
          addTask(inputEl ? inputEl.value : "");
        });
      }

      if (inputEl) {
        inputEl.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();

            addTask(inputEl.value);
          }
        });
      }
    }

    return {
      init: init,
      load: load,
      save: save,
      addTask: addTask,
      toggleTask: toggleTask,
      deleteTask: deleteTask,
      beginEdit: beginEdit,
      saveEdit: saveEdit,
      cancelEdit: cancelEdit,
      render: render,
      generateId: generateId,

      getTasks: function () {
        return tasks;
      },

      setTasks: function (arr) {
        tasks = Array.isArray(arr) ? arr : [];
      },

      getEditingId: function () {
        return editingId;
      },

      setEditingId: function (id) {
        editingId = id;
      },
    };
  })();

  // ============================================================
  // Quick Links
  // ============================================================

  var quickLinks = (function () {
    "use strict";

    var MAX_LABEL_LENGTH = 100;

    var MAX_URL_LENGTH = 2048;

    var links = [];

    var initialized = false;

    function generateId() {
      if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
      ) {
        return crypto.randomUUID();
      }

      return Date.now().toString() + Math.random().toString(36).slice(2);
    }

    function validateUrl(url) {
      if (typeof url !== "string") {
        return false;
      }

      return url.indexOf("http://") === 0 || url.indexOf("https://") === 0;
    }

    function isValidLink(obj) {
      return (
        obj !== null &&
        typeof obj === "object" &&
        typeof obj.id === "string" &&
        typeof obj.label === "string" &&
        typeof obj.url === "string" &&
        obj.label.trim().length > 0 &&
        obj.label.length <= MAX_LABEL_LENGTH &&
        obj.url.length <= MAX_URL_LENGTH &&
        validateUrl(obj.url)
      );
    }

    function load() {
      var raw = storage.get("quickLinks");

      links = raw.filter(isValidLink);
    }

    function save() {
      storage.set("quickLinks", links);
    }

    function render() {
      var gridEl = document.getElementById("links-grid");

      var emptyEl = document.getElementById("links-empty");

      if (!gridEl) {
        return;
      }

      gridEl.innerHTML = "";

      links.forEach(function (link) {
        var item = document.createElement("div");

        item.className = "link-item";

        var anchor = document.createElement("a");

        anchor.href = link.url;

        anchor.target = "_blank";

        anchor.rel = "noopener noreferrer";

        anchor.className = "link-btn";

        var displayLabel =
          link.label.length > 50 ? link.label.slice(0, 50) + "…" : link.label;

        var labelSpan = document.createElement("span");

        labelSpan.className = "link-label";

        labelSpan.textContent = displayLabel;

        anchor.appendChild(labelSpan);

        var deleteBtn = document.createElement("button");

        deleteBtn.type = "button";

        deleteBtn.className = "link-delete";

        deleteBtn.setAttribute("aria-label", "Delete link");

        deleteBtn.textContent = "×";

        (function (linkId) {
          deleteBtn.addEventListener("click", function () {
            deleteLink(linkId);
          });
        })(link.id);

        item.appendChild(anchor);

        item.appendChild(deleteBtn);

        gridEl.appendChild(item);
      });

      if (emptyEl) {
        emptyEl.hidden = links.length > 0;
      }
    }

    function showError(message) {
      var errorEl = document.getElementById("link-error");

      if (!errorEl) {
        return;
      }

      errorEl.textContent = message;

      errorEl.hidden = false;
    }

    function clearError() {
      var errorEl = document.getElementById("link-error");

      if (!errorEl) {
        return;
      }

      errorEl.textContent = "";

      errorEl.hidden = true;
    }

    function addLink(label, url) {
      var trimmedLabel = typeof label === "string" ? label.trim() : "";

      var trimmedUrl = typeof url === "string" ? url.trim() : "";

      if (trimmedLabel.length === 0) {
        showError("Please enter a label.");

        return;
      }

      if (trimmedLabel.length > MAX_LABEL_LENGTH) {
        showError("Label must be 100 characters or fewer.");

        return;
      }

      if (trimmedUrl.length === 0) {
        showError("Please enter a URL.");

        return;
      }

      if (trimmedUrl.length > MAX_URL_LENGTH) {
        showError("URL must be 2048 characters or fewer.");

        return;
      }

      if (!validateUrl(trimmedUrl)) {
        showError("URL must start with http:// or https://");

        return;
      }

      clearError();

      links.push({
        id: generateId(),

        label: trimmedLabel,

        url: trimmedUrl,
      });

      save();

      render();

      var labelInput = document.getElementById("link-label");

      var urlInput = document.getElementById("link-url");

      if (labelInput) {
        labelInput.value = "";
      }

      if (urlInput) {
        urlInput.value = "";
      }
    }

    function deleteLink(id) {
      links = links.filter(function (link) {
        return link.id !== id;
      });

      save();

      render();
    }

    function init() {
      if (initialized) {
        return;
      }

      initialized = true;

      load();

      render();

      var addBtn = document.getElementById("link-add");

      var labelInput = document.getElementById("link-label");

      var urlInput = document.getElementById("link-url");

      function submit() {
        addLink(
          labelInput ? labelInput.value : "",

          urlInput ? urlInput.value : "",
        );
      }

      if (addBtn) {
        addBtn.addEventListener("click", submit);
      }

      function handleEnter(e) {
        if (e.key === "Enter") {
          e.preventDefault();

          submit();
        }
      }

      if (labelInput) {
        labelInput.addEventListener("keydown", handleEnter);
      }

      if (urlInput) {
        urlInput.addEventListener("keydown", handleEnter);
      }
    }

    return {
      init: init,
      load: load,
      save: save,
      render: render,
      addLink: addLink,
      deleteLink: deleteLink,
      validateUrl: validateUrl,
      generateId: generateId,

      getLinks: function () {
        return links;
      },

      setLinks: function (arr) {
        links = Array.isArray(arr) ? arr : [];
      },
    };
  })();

  // ============================================================
  // Application Entry Point
  // ============================================================

  var appInitialized = false;

  function init() {
    if (appInitialized) {
      return;
    }

    appInitialized = true;

    greetingWidget.init();

    focusTimer.init();

    todoList.init();

    quickLinks.init();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
