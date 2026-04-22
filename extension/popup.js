// popup.js - режим "Testnet Runner" (100+ задач в день)
let dailyTemplate = [];   // шаблон задач
let todayTasks = [];      // задачи на сегодня с отметками
let currentDate = getDateKey();

document.addEventListener("DOMContentLoaded", async () => {
  await init();
  await loadToday();
  renderTasks();
  updateCounter();
  bindEvents();
  setDate();
  
  // Проверка смены дня каждую минуту
  setInterval(async () => {
    const today = getDateKey();
    if (currentDate !== today) {
      currentDate = today;
      await init();
      await loadToday();
      renderTasks();
      updateCounter();
    }
  }, 60000);
});

// -------------------- ДАТА --------------------
function getDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function setDate() {
  const now = new Date();
  const dateEl = document.getElementById("todayDate");
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric"
    });
  }
}

// -------------------- ИНИЦИАЛИЗАЦИЯ --------------------
async function init() {
  // Загружаем шаблон задач
  let template = await getStorage("dailyTemplate");
  
  if (!template || template.length === 0) {
    // Пример задач (ты заменишь своими через импорт)
    template = [
      { id: 1, text: "Galxe: Daily Check-in", category: "testnet" },
      { id: 2, text: "LayerZero: Send tx", category: "bridge" },
      { id: 3, text: "Zora: Mint NFT", category: "nft" },
      { id: 4, text: "Arbitrum: Claim", category: "drop" },
      { id: 5, text: "Optimism: Quest", category: "testnet" },
      { id: 6, text: "Starknet: Deploy", category: "testnet" },
      { id: 7, text: "zkSync: Bridge", category: "bridge" }
    ];
    await setStorage("dailyTemplate", template);
  }
  dailyTemplate = template;
  
  // Загружаем историю
  const history = await getStorage("history") || {};
  todayTasks = history[currentDate] || [];
  
  // Если сегодня нет задач — создаём из шаблона (все невыполненные)
  if (todayTasks.length === 0) {
    todayTasks = dailyTemplate.map(t => ({
      id: t.id,
      text: t.text,
      category: t.category,
      completed: false,
      completedAt: null
    }));
    await saveToday();
  }
}

async function loadToday() {
  const history = await getStorage("history") || {};
  todayTasks = history[currentDate] || [];
  if (todayTasks.length === 0) {
    await init();
  }
}

async function saveToday() {
  const history = await getStorage("history") || {};
  history[currentDate] = todayTasks;
  await setStorage("history", history);
}

// -------------------- ОТРИСОВКА ЗАДАЧ --------------------
function renderTasks() {
  const container = document.getElementById("taskList");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Группировка по категориям
  const grouped = {};
  todayTasks.forEach(task => {
    const cat = task.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(task);
  });
  
  // Порядок категорий (можно настроить)
  const categoryOrder = ["testnet", "bridge", "nft", "drop", "custom", "other"];
  
  for (const category of categoryOrder) {
    if (grouped[category] && grouped[category].length > 0) {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "task-category";
      
      const categoryTitle = document.createElement("div");
      categoryTitle.className = "category-title";
      categoryTitle.textContent = `📁 ${category.toUpperCase()}`;
      categoryDiv.appendChild(categoryTitle);
      
      grouped[category].forEach(task => {
        const li = document.createElement("li");
        li.className = task.completed ? "task completed" : "task";
        li.innerHTML = `
          <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? "checked" : ""}>
          <span class="task-text">${escapeHtml(task.text)}</span>
        `;
        categoryDiv.appendChild(li);
      });
      
      container.appendChild(categoryDiv);
    }
  }
  
  // Остальные категории, которых нет в order
  for (const [category, tasks] of Object.entries(grouped)) {
    if (!categoryOrder.includes(category)) {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "task-category";
      
      const categoryTitle = document.createElement("div");
      categoryTitle.className = "category-title";
      categoryTitle.textContent = `📁 ${category.toUpperCase()}`;
      categoryDiv.appendChild(categoryTitle);
      
      tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = task.completed ? "task completed" : "task";
        li.innerHTML = `
          <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? "checked" : ""}>
          <span class="task-text">${escapeHtml(task.text)}</span>
        `;
        categoryDiv.appendChild(li);
      });
      
      container.appendChild(categoryDiv);
    }
  }
  
  bindCheckboxes();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function bindCheckboxes() {
  document.querySelectorAll(".task-checkbox").forEach(cb => {
    cb.onchange = async (e) => {
      const id = parseInt(e.target.dataset.id);
      const task = todayTasks.find(t => t.id === id);
      if (task) {
        task.completed = e.target.checked;
        task.completedAt = e.target.checked ? Date.now() : null;
        await saveToday();
        
        // Обновляем UI без полной перерисовки (оптимизация)
        const li = e.target.closest('.task');
        if (task.completed) {
          li.classList.add('completed');
          e.target.checked = true;
        } else {
          li.classList.remove('completed');
          e.target.checked = false;
        }
        
        updateCounter();
      }
    };
  });
}

// -------------------- СЧЁТЧИК И ПРОГРЕСС --------------------
function updateCounter() {
  const total = todayTasks.length;
  const completed = todayTasks.filter(t => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const badgeEl = document.getElementById("progressBadge");
  const percentEl = document.getElementById("progressPercent");
  const fillEl = document.getElementById("progressFill");
  
  if (badgeEl) badgeEl.textContent = `${completed}/${total}`;
  if (percentEl) percentEl.textContent = `${percent}%`;
  if (fillEl) fillEl.style.width = `${percent}%`;
}

// -------------------- ЭКСПОРТ --------------------
async function exportData() {
  const history = await getStorage("history") || {};
  const template = await getStorage("dailyTemplate") || [];
  
  const exportData = {
    exportDate: new Date().toISOString(),
    dailyTemplate: template,
    history: history
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `testnet-runner-backup-${getDateKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// -------------------- ДОБАВЛЕНИЕ ЗАДАЧИ В ШАБЛОН --------------------
async function addTaskToTemplate() {
  const text = prompt("Введите новую задачу:");
  if (!text) return;
  
  let category = prompt("Категория (testnet / bridge / nft / drop / custom):", "testnet");
  if (!category) category = "testnet";
  
  const newTask = {
    id: Date.now(),
    text: text,
    category: category.toLowerCase()
  };
  
  dailyTemplate.push(newTask);
  await setStorage("dailyTemplate", dailyTemplate);
  
  // Обновляем сегодняшние задачи (добавляем новую в конец, невыполненной)
  todayTasks.push({
    id: newTask.id,
    text: newTask.text,
    category: newTask.category,
    completed: false,
    completedAt: null
  });
  await saveToday();
  
  renderTasks();
  updateCounter();
  alert(`✅ Задача "${text}" добавлена в шаблон и в сегодняшний список`);
}

// -------------------- МАССОВЫЙ ИМПОРТ (открыть импортер) --------------------
function openMassImporter() {
  chrome.tabs.create({ url: chrome.runtime.getURL("importer.html") });
}

// -------------------- ОБНОВЛЕНИЕ ЯЗЫКА (упрощённо) --------------------
async function updateUILanguage() {
  const lang = await getCurrentLanguage();
  const toggleBtn = document.getElementById("langToggle");
  if (toggleBtn) {
    toggleBtn.textContent = lang === "en" ? "RU / EN" : "EN / RU";
  }
}

async function toggleLanguage() {
  const currentLang = await getCurrentLanguage();
  const newLang = currentLang === "en" ? "ru" : "en";
  await setLanguage(newLang);
  await updateUILanguage();
}

// -------------------- ПРИВЯЗКА СОБЫТИЙ --------------------
function bindEvents() {
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) exportBtn.onclick = () => exportData();
  
  const addBtn = document.getElementById("addTemplateBtn");
  if (addBtn) addBtn.onclick = () => addTaskToTemplate();
  
  const massImportBtn = document.getElementById("massImportBtn");
  if (massImportBtn) massImportBtn.onclick = () => openMassImporter();
  
  const langToggle = document.getElementById("langToggle");
  if (langToggle) langToggle.onclick = () => toggleLanguage();
}

// -------------------- ОЧИСТКА ВЫПОЛНЕННЫХ (опционально) --------------------
async function clearCompletedTasks() {
  const confirmed = confirm("Очистить все выполненные задачи за сегодня?");
  if (!confirmed) return;
  
  todayTasks = todayTasks.filter(t => !t.completed);
  await saveToday();
  renderTasks();
  updateCounter();
}

// Экспортируем в глобальный объект для вызова из консоли
window.clearCompletedTasks = clearCompletedTasks;