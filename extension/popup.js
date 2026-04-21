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

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  loadBookmarks();
  setDate();
});

function setDate() {
  const now = new Date();
  todayDate.textContent = now.toLocaleDateString();
}

addTaskBtn.addEventListener("click", async () => {
  const text = taskInput.value.trim();
  if (!text) return;

  let tasks = await getStorage("tasks") || [];

  tasks.push({
    id: Date.now(),
    text,
    section: sectionSelect.value,
    done: false
  });

  await setStorage("tasks", tasks);

  taskInput.value = "";

  loadTasks();
});

async function loadTasks() {
  let tasks = await getStorage("tasks") || [];

  morningList.innerHTML = "";
  dayList.innerHTML = "";
  eveningList.innerHTML = "";
  doneList.innerHTML = "";

  let doneCount = 0;

  tasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span class="task-text">${task.text}</span>
      <div class="actions">
        <button data-id="${task.id}" class="doneBtn">✔</button>
        <button data-id="${task.id}" class="delBtn">✖</button>
      </div>
    `;

    if (task.done) {
      li.classList.add("done");
      doneList.appendChild(li);
      doneCount++;
    } else {
      if (task.section === "morning") morningList.appendChild(li);
      if (task.section === "day") dayList.appendChild(li);
      if (task.section === "evening") eveningList.appendChild(li);
    }
  });

  progressBadge.textContent = `${doneCount} Done`;

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
}

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
      <button data-id="${item.id}" class="delBookmark">✖</button>
    `;

    bookmarkList.appendChild(li);
  });

  document.querySelectorAll(".delBookmark").forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);

      data = data.filter(x => x.id !== id);

      await setStorage("bookmarks", data);

      loadBookmarks();
    };
  });
}

function getStorage(key) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], result => {
      resolve(result[key]);
    });
  });
}

function setStorage(key, value) {
  return new Promise(resolve => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
}