const LANG = {
  en: {
    add: "Add Task",
    focus: "Focus",
    tasks: "Tasks",
    done: "Done",
    bookmarks: "Bookmarks",
    empty: "No tasks available",
    focus_title: "TODAY FOCUS 🎯",
    streak_title: "STREAK 🔥",
    pro_version: "PRO VERSION",
    upgrade: "Upgrade",
    morning: "Morning ☀️",
    day: "Day 💼",
    evening: "Evening 🌙",
    done_tasks: "Done ✅",
  },
  ru: {
    add: "Добавить задачу",
    focus: "Фокус",
    tasks: "Задачи",
    done: "Готово",
    bookmarks: "Закладки",
    empty: "Задачи отсутствуют",
    focus_title: "ФОКУС НА СЕГОДНЯ 🎯",
    streak_title: "СТРИК 🔥",
    pro_version: "ПРО ВЕРСИЯ",
    upgrade: "Обновить",
    morning: "Утро ☀️",
    day: "День 💼",
    evening: "Вечер 🌙",
    done_tasks: "Готово ✅",
  }
};

function t(key) {
  return LANG[lang][key] || key;
}