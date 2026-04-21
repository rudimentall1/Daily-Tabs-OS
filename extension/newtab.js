document.addEventListener("DOMContentLoaded", async () => {
  setDate();
  loadTasks();
  loadNotes();
});

function setDate() {
  const el = document.getElementById("todayDate");

  const now = new Date();

  el.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

// --------------------
// TASKS
// --------------------

async function loadTasks() {
  const tasks = await getStorage("tasks") || [];

  const morning = document.getElementById("morningList");
  const day = document.getElementById("dayList");
  const evening = document.getElementById("eveningList");

  morning.innerHTML = "";
  day.innerHTML = "";
  evening.innerHTML = "";

  const morningTasks = tasks.filter(t => t.section === "morning" && !t.done);
  const dayTasks = tasks.filter(t => t.section === "day" && !t.done);
  const eveningTasks = tasks.filter(t => t.section === "evening" && !t.done);

  renderList(morning, morningTasks);
  renderList(day, dayTasks);
  renderList(evening, eveningTasks);
}

function renderList(target, items) {
  if (items.length === 0) {
    target.innerHTML = "<li>No tasks</li>";
    return;
  }

  items.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task.text;
    target.appendChild(li);
  });
}

// --------------------
// NOTES
// --------------------

function loadNotes() {
  const textarea = document.querySelector("textarea");

  chrome.storage.local.get(["notes"], result => {
    textarea.value = result.notes || "";
  });

  textarea.addEventListener("input", () => {
    chrome.storage.local.set({
      notes: textarea.value
    });
  });
}

// --------------------
// STORAGE
// --------------------

function getStorage(key) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], result => {
      resolve(result[key]);
    });
  });
}