const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const sectionSelect = document.getElementById("sectionSelect");

const morningList = document.getElementById("morningList");
const dayList = document.getElementById("dayList");
const eveningList = document.getElementById("eveningList");
const doneList = document.getElementById("doneList");

const saveTabBtn = document.getElementById("saveTabBtn");
const bookmarkList = document.getElementById("bookmarkList");

const progressBadge = document.getElementById("progressBadge");
const todayDate = document.getElementById("todayDate");

// NEW UI (Focus)
let currentDateKey = getDateKey();

// --------------------
// INIT
// --------------------

document.addEventListener("DOMContentLoaded", async () => {
  setDate();
  await runDailyReset();
  await loadTasks();
  await loadBookmarks();

  taskInput.focus();
});

// --------------------
// DATE
// --------------------

function getDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function setDate() {
  const now = new Date();
  todayDate.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

// --------------------
// DAILY RESET SYSTEM
// --------------------

async function runDailyReset() {
  const lastKey = await getStorage("lastDateKey");

  if (lastKey === currentDateKey) return;

  let tasks = await getStorage("tasks") || [];

  // move completed to archive
  let archive = await getStorage("archive") || [];
  archive.push({
    date: lastKey,
    tasks
  });

  // extract recurring tasks
  const recurring = tasks.filter(t => t.recurring);

  // reset day tasks
  const resetTasks = recurring.map(t => ({
    ...t,
    done: false
  }));

  await setStorage("archive", archive);
  await setStorage("tasks", resetTasks);
  await setStorage("lastDateKey", currentDateKey);
}

// --------------------
// ADD TASK
// --------------------

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

async function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  let tasks = await getStorage("tasks") || [];

  tasks.push({
    id: Date.now(),
    text,
    section: sectionSelect.value,
    done: false,
    recurring: false,
    focus: false
  });

  await setStorage("tasks", tasks);

  taskInput.value = "";
  taskInput.focus();

  loadTasks();
}

// --------------------
// LOAD TASKS
// --------------------

async function loadTasks() {
  let tasks = await getStorage("tasks") || [];

  morningList.innerHTML = "";
  dayList.innerHTML = "";
  eveningList.innerHTML = "";
  doneList.innerHTML = "";

  let doneCount = 0;
  let total = tasks.length;

  tasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span class="task-text">${task.text}</span>
      <div class="actions">
        <button class="focusBtn" data-id="${task.id}">★</button>
        <button class="doneBtn" data-id="${task.id}">✔</button>
        <button class="delBtn" data-id="${task.id}">✖</button>
      </div>
    `;

    if (task.done) {
      doneList.appendChild(li);
      doneCount++;
    } else {
      if (task.section === "morning") morningList.appendChild(li);
      if (task.section === "day") dayList.appendChild(li);
      if (task.section === "evening") eveningList.appendChild(li);
    }
  });

  progressBadge.textContent = total === 0
    ? "0 Tasks"
    : `${doneCount}/${total} Done`;

  bindTaskActions(tasks);
}

// --------------------
// TASK ACTIONS
// --------------------

function bindTaskActions(tasks) {

  document.querySelectorAll(".doneBtn").forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);

      tasks = tasks.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      );

      await setStorage("tasks", tasks);
      loadTasks();
    };
  });

  document.querySelectorAll(".delBtn").forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);

      tasks = tasks.filter(t => t.id !== id);

      await setStorage("tasks", tasks);
      loadTasks();
    };
  });

  // ⭐ FOCUS TASK
  document.querySelectorAll(".focusBtn").forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);

      tasks = tasks.map(t => ({
        ...t,
        focus: t.id === id
      }));

      await setStorage("tasks", tasks);
      loadTasks();
    };
  });
}

// --------------------
// BOOKMARKS
// --------------------

saveTabBtn.addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
    const tab = tabs[0];

    let data = await getStorage("bookmarks") || [];

    data.push({
      id: Date.now(),
      title: tab.title,
      url: tab.url
    });

    await setStorage("bookmarks", data);

    loadBookmarks();
  });
});

async function loadBookmarks() {
  let data = await getStorage("bookmarks") || [];

  bookmarkList.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");

    li.innerHTML = `
      <a href="${item.url}" target="_blank">${item.title}</a>
    `;

    bookmarkList.appendChild(li);
  });
}

// --------------------
// STORAGE
// --------------------

function getStorage(key) {
  return new Promise(res => {
    chrome.storage.local.get([key], r => res(r[key]));
  });
}

function setStorage(key, value) {
  return new Promise(res => {
    chrome.storage.local.set({ [key]: value }, res);
  });
}