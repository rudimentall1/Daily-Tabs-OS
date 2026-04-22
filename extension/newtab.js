document.addEventListener("DOMContentLoaded", async () => {
  setDate();
  await loadTasks(); // Загружаем задачи
  await loadRecurringTasks();
  loadWorkspace();
  loadStreak();
  checkProStatus();
  bindUpgradeButton(); // кнопка Upgrade
  bindAddTaskButton(); // кнопка добавления задачи
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
// MONETIZATION CHECK
// --------------------

async function checkProStatus() {
  const isPro = await getStorage("isPro");

  const upgradeBtn = document.getElementById("upgradeBtn");

  if (isPro) {
    upgradeBtn.textContent = "You have PRO access!";
    upgradeBtn.disabled = true;
  } else {
    upgradeBtn.textContent = "Upgrade to Pro";
  }
}

// --------------------
// BIND UPGRADE BUTTON
// --------------------

function bindUpgradeButton() {
  const upgradeBtn = document.getElementById("upgradeBtn");

  upgradeBtn.addEventListener("click", async () => {
    // Симуляция покупки подписки
    alert("Redirecting to Pro version purchase...");
    await setStorage("isPro", true); // Симуляция того, что пользователь получил Pro

    // Обновить UI после покупки
    checkProStatus();
  });
}

// --------------------
// STREAK SYSTEM
// --------------------

async function loadStreak() {
  const streak = await getStorage("streak") || 0;

  const streakEl = document.getElementById("streakCount");
  streakEl.textContent = `${streak} productive days`;
}

// --------------------
// TASKS
// --------------------

async function loadTasks() {
  const tasks = await getStorage("tasks") || [];

  const taskList = document.getElementById("taskList");

  taskList.innerHTML = ""; // Очистить список перед добавлением новых задач

  tasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${task.text}</span>
      <div class="actions">
        <button class="doneBtn" data-id="${task.id}">✔</button>
        <button class="delBtn" data-id="${task.id}">✖</button>
      </div>
    `;

    taskList.appendChild(li); // Добавить задачу в список
  });

  bindTaskActions(tasks); // Привязать события к кнопкам
}

// --------------------
// BIND TASK ACTIONS
// --------------------

function bindTaskActions(tasks) {
  document.querySelectorAll(".doneBtn").forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);

      tasks = tasks.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      );

      await setStorage("tasks", tasks);
      loadTasks(); // Перезагружаем задачи с обновленным состоянием
    };
  });

  document.querySelectorAll(".delBtn").forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);

      tasks = tasks.filter(t => t.id !== id);

      await setStorage("tasks", tasks);
      loadTasks(); // Перезагружаем задачи с обновленным списком
    };
  });
}

// --------------------
// ADD TASK BUTTON
// --------------------

function bindAddTaskButton() {
  const addBtn = document.getElementById("addTaskBtn");
  const taskInput = document.getElementById("taskInput");

  addBtn.addEventListener("click", async () => {
    const text = taskInput.value.trim();

    if (text) {
      const newTask = {
        id: Date.now(),
        text,
        done: false,
        section: "morning", // Default section
      };

      const tasks = await getStorage("tasks") || [];
      tasks.push(newTask);

      await setStorage("tasks", tasks);
      taskInput.value = ""; // Очистить поле ввода

      loadTasks(); // Перезагружаем задачи с новым элементом
    }
  });
}

// --------------------
// RECURRING TASKS
// --------------------

async function loadRecurringTasks() {
  const tasks = await getStorage("tasks") || [];
  const recurringList = document.getElementById("recurringList");

  recurringList.innerHTML = "";

  const recurringTasks = tasks.filter(task => task.recurring);

  recurringTasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task.text;
    recurringList.appendChild(li);
  });
}

// --------------------
// WORKSPACE LINKS
// --------------------

function loadWorkspace() {
  const workspaceGrid = document.getElementById("workspaceGrid");

  // Здесь можно динамически добавлять больше пользовательских ссылок
  const links = [
    { name: "Mail Calendar", url: "https://calendar.mail.ru/" },
    { name: "Mail.ru", url: "https://mail.ru/" },
    { name: "GitHub", url: "https://github.com/" },
    { name: "Telegram", url: "https://web.telegram.org/" }
  ];

  links.forEach(link => {
    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.textContent = link.name;
    workspaceGrid.appendChild(anchor);
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

function setStorage(key, value) {
  return new Promise(resolve => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}