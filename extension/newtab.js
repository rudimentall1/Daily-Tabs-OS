// newtab.js - режим карточек, два ряда, цветовая индикация
let tasks = [];
let currentDate = getDateKey();

document.addEventListener("DOMContentLoaded", async () => {
  await loadTasks();
  renderTasks();
  updateCounter();
  bindEvents();
  setDate();
  await updateUILanguage();
});

function getDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function setDate() {
  const now = new Date();
  const el = document.getElementById("todayDate");
  if (el) {
    el.textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric"
    });
  }
}

async function loadTasks() {
  const stored = await getStorage("tasks");
  if (stored && stored.length > 0) {
    tasks = stored;
  } else {
    // Пример задач
    tasks = [
      { id: 1, title: "Galxe: Daily Check-in", url: "https://galxe.com", category: "testnet", completed: false, completedAt: null },
      { id: 2, title: "LayerZero: Send tx", url: "https://layerzero.network", category: "bridge", completed: false, completedAt: null },
      { id: 3, title: "Zora: Mint NFT", url: "https://zora.co", category: "nft", completed: true, completedAt: Date.now() },
      { id: 4, title: "Arbitrum: Claim", url: "https://arbitrum.foundation", category: "drop", completed: false, completedAt: null },
      { id: 5, title: "Optimism: Quest", url: "https://optimism.io", category: "testnet", completed: false, completedAt: null }
    ];
    await setStorage("tasks", tasks);
  }
}

function renderTasks() {
  const grid = document.getElementById("tasksGrid");
  if (!grid) return;
  
  grid.innerHTML = "";
  
  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = `task-card ${task.completed ? 'completed' : 'new'}`;
    
    // Клик по карточке = переход по ссылке
    card.onclick = (e) => {
      // Если кликнули не на кнопку удаления
      if (!e.target.classList.contains('delete-task')) {
        if (task.url && task.url !== "") {
          window.open(task.url, '_blank');
        }
      }
    };
    
    card.innerHTML = `
      <div class="task-header">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-category">${task.category}</div>
      </div>
      <div class="task-footer">
        <div class="checkbox-icon" data-id="${task.id}">${task.completed ? '✓' : '○'}</div>
        <button class="delete-task" data-id="${task.id}">✖</button>
      </div>
    `;
    
    grid.appendChild(card);
  });
  
  bindCardEvents();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function bindCardEvents() {
  // Обработка клика по иконке чекбокса (отметка о выполнении)
  document.querySelectorAll(".checkbox-icon").forEach(icon => {
    icon.onclick = async (e) => {
      e.stopPropagation();
      const id = parseInt(icon.dataset.id);
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? Date.now() : null;
        await setStorage("tasks", tasks);
        renderTasks();
        updateCounter();
      }
    };
  });
  
  // Обработка удаления задачи
  document.querySelectorAll(".delete-task").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      tasks = tasks.filter(t => t.id !== id);
      await setStorage("tasks", tasks);
      renderTasks();
      updateCounter();
    };
  });
}

function updateCounter() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const counterEl = document.getElementById("taskCounter");
  if (counterEl) {
    counterEl.textContent = `${completed}/${total}`;
  }
}

async function addTask() {
  const title = prompt("Enter task title:");
  if (!title) return;
  
  const url = prompt("Enter URL (optional):", "https://");
  const category = prompt("Category (testnet/bridge/nft/drop):", "testnet");
  
  const newTask = {
    id: Date.now(),
    title: title,
    url: url && url !== "https://" ? url : "",
    category: category || "testnet",
    completed: false,
    completedAt: null
  };
  
  tasks.push(newTask);
  await setStorage("tasks", tasks);
  renderTasks();
  updateCounter();
}

async function exportData() {
  const data = {
    exportDate: new Date().toISOString(),
    tasks: tasks
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tasks-backup-${getDateKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function openMassImporter() {
  // Простой импорт через JSON-файл
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.tasks) {
      tasks = data.tasks;
      await setStorage("tasks", tasks);
      renderTasks();
      updateCounter();
      alert(`Imported ${tasks.length} tasks`);
    } else {
      alert("Invalid file format");
    }
  };
  input.click();
}

// Переключение языка
async function updateUILanguage() {
  const lang = await getCurrentLanguage();
  const appTitle = document.getElementById("appTitle");
  const addBtnText = document.getElementById("addBtnText");
  const importBtnText = document.getElementById("importBtnText");
  const exportBtnText = document.getElementById("exportBtnText");
  const langToggle = document.getElementById("langToggle");
  
  if (lang === "ru") {
    if (appTitle) appTitle.textContent = "🧪 Тестнет Планер";
    if (addBtnText) addBtnText.textContent = "Добавить задачу";
    if (importBtnText) importBtnText.textContent = "Массовый импорт";
    if (exportBtnText) exportBtnText.textContent = "Экспорт";
    if (langToggle) langToggle.textContent = "EN / RU";
  } else {
    if (appTitle) appTitle.textContent = "🧪 Testnet Planner";
    if (addBtnText) addBtnText.textContent = "Add Task";
    if (importBtnText) importBtnText.textContent = "Mass Import";
    if (exportBtnText) exportBtnText.textContent = "Export";
    if (langToggle) langToggle.textContent = "RU / EN";
  }
}

async function toggleLanguage() {
  const current = await getCurrentLanguage();
  const newLang = current === "en" ? "ru" : "en";
  await setLanguage(newLang);
  await updateUILanguage();
}

function bindEvents() {
  document.getElementById("addTaskBtn").onclick = () => addTask();
  document.getElementById("massImportBtn").onclick = () => openMassImporter();
  document.getElementById("exportBtn").onclick = () => exportData();
  document.getElementById("langToggle").onclick = () => toggleLanguage();
}