async function getStorage(key) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], result => resolve(result[key]));
  });
}

async function setStorage(key, value) {
  return new Promise(resolve => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

async function getCurrentLanguage() {
  let lang = await getStorage("app_lang");
  if (!lang) {
    lang = "en";
    await setStorage("app_lang", "en");
  }
  return lang;
}

async function setLanguage(lang) {
  await setStorage("app_lang", lang);
}