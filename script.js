const fileInput = document.getElementById('fileInput');
const openBtn = document.getElementById('openBtn');
const saveBtn = document.getElementById('saveBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newBtn = document.getElementById('newBtn');
const codeEl = document.getElementById('code');
const tablist = document.getElementById('tablist');
const status = document.getElementById('status');
const dropArea = document.getElementById('dropArea');
const filenameInput = document.getElementById('filenameInput');
const infoPanel = document.getElementById('infoPanel');
const toggleInfoBtn = document.getElementById('toggleInfoBtn');

const fontsize = document.getElementById('fontsize');
const fontfamily = document.getElementById('fontfamily');
const themeToggle = document.getElementById('themeToggle');

const settingBtn = document.getElementById('settingBtn');
const settingPanel = document.getElementById('settingPanel');
const closeSettingBtn = document.getElementById('closeSettingBtn');

const bgColor = document.getElementById('bgColor');
const panelColor = document.getElementById('panelColor');
const accentColor = document.getElementById('accentColor');
const highlightColor = document.getElementById('highlightColor');
const textColor = document.getElementById('textColor');
const saveThemeBtn = document.getElementById('saveThemeBtn');
const loadThemeBtn = document.getElementById('loadThemeBtn');

const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeHelpBtn = document.getElementById('closeHelpBtn');

let tabs = [];
let activeId = null;

function uid() { return 'f' + Math.random().toString(36).slice(2, 9); }
function setStatus(s) { status.textContent = s; }

function renderTabs() {
  tablist.innerHTML = '';
  tabs.forEach(t => {
    const el = document.createElement('div');
    el.className = 'tab' + (t.id === activeId ? ' active' : '');

    const span = document.createElement('span');
    span.textContent = t.name;
    span.contentEditable = true;
    span.onblur = () => {
      t.name = span.textContent || t.name;
      if (t.id === activeId) filenameInput.value = t.name;
      updateFileInfo();
    };
    el.appendChild(span);

    const close = document.createElement('span');
    close.textContent = '×';
    close.className = 'closeTab';
    close.onclick = e => { e.stopPropagation(); closeTab(t.id); };
    el.appendChild(close);

    el.onclick = () => activateTab(t.id);
    tablist.appendChild(el);
  });
}

function newTab(name = 'untitled.txt', text = '') {
  const t = { id: uid(), name, text, savedText: text };
  tabs.unshift(t);
  activeId = t.id;
  renderTabs();
  loadActive();
}

function activateTab(id) {
  activeId = id;
  renderTabs();
  loadActive();
}

function closeTab(id) {
  tabs = tabs.filter(t => t.id !== id);
  if (activeId === id) activeId = tabs[0] ? tabs[0].id : null;
  renderTabs();
  loadActive();
}

function loadActive() {
  const t = tabs.find(x => x.id === activeId);
  if (!t) {
    codeEl.value = '';
    filenameInput.value = '';
    setStatus('ファイルなし');
    updateFileInfo();
    updateLineNumbers();
    return;
  }
  codeEl.value = t.text;
  filenameInput.value = t.name;
  setStatus(t.text === t.savedText ? '保存済み' : '未保存');
  updateFileInfo();
  updateLineNumbers();
}

function updateLineNumbers() {
  const lines = codeEl.value.split('\n').length;
  const linenums = document.getElementById('linenums');
  if (!linenums) return;
  linenums.innerHTML = '';
  for (let i = 1; i <= lines; i++) linenums.innerHTML += i + '<br>';
}

function updateFileInfo() {
  const t = tabs.find(x => x.id === activeId);
  const info = document.getElementById('fileInfo');
  if (!t) {
    info.textContent = 'ファイルなし';
    return;
  }
  const lines = t.text.split('\n').length;
  info.textContent = `${t.name} | ${lines}行`;
}

function saveCurrentTab() {
  const t = tabs.find(x => x.id === activeId);
  if (!t) return;
  t.text = codeEl.value;
  t.savedText = t.text;
  t.name = filenameInput.value || t.name;
  setStatus('保存済み');
  renderTabs();
  updateFileInfo();
}

openBtn.onclick = () => fileInput.click();
fileInput.onchange = async e => {
  const files = [...e.target.files];
  for (const f of files) {
    if (f.type.startsWith('image') || f.type.startsWith('video')) continue;
    const text = await f.text();
    newTab(f.name, text);
  }
  fileInput.value = '';
};

saveBtn.onclick = saveCurrentTab;

downloadBtn.onclick = () => {
  const t = tabs.find(x => x.id === activeId);
  if (!t) return;
  const blob = new Blob([t.text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = t.name;
  a.click();
  URL.revokeObjectURL(a.href);
};

newBtn.onclick = () => newTab();

codeEl.oninput = () => {
  const t = tabs.find(x => x.id === activeId);
  if (!t) return;
  t.text = codeEl.value;
  setStatus(t.text === t.savedText ? '保存済み' : '未保存');
  updateLineNumbers();
  updateFileInfo();
};

filenameInput.addEventListener('input', () => {
  const t = tabs.find(x => x.id === activeId);
  if (!t) return;
  t.name = filenameInput.value || t.name;
  renderTabs();
  updateFileInfo();
});

codeEl.addEventListener('scroll', () => {
  const ln = document.getElementById('linenums');
  if (ln) ln.scrollTop = codeEl.scrollTop;
});

fontsize.onchange = e => { codeEl.style.fontSize = `${e.target.value}px`; };
fontfamily.onchange = e => { codeEl.style.fontFamily = e.target.value; };

themeToggle.onclick = () => {
  document.body.dataset.theme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
};

function togglePanel(panel, show) {
  panel.style.display = show ? 'block' : 'none';
  panel.setAttribute('aria-hidden', show ? 'false' : 'true');
}

settingBtn.onclick = () => togglePanel(settingPanel, settingPanel.style.display === 'none');
closeSettingBtn.onclick = () => togglePanel(settingPanel, false);

helpBtn.onclick = () => togglePanel(helpModal, true);
closeHelpBtn.onclick = () => togglePanel(helpModal, false);

if (toggleInfoBtn) {
  toggleInfoBtn.onclick = () => infoPanel.classList.toggle('open');
}

dropArea.addEventListener('dragover', e => e.preventDefault());
dropArea.addEventListener('drop', async e => {
  e.preventDefault();
  const files = [...e.dataTransfer.files];
  for (const f of files) {
    if (f.type.startsWith('image') || f.type.startsWith('video')) continue;
    const text = await f.text();
    newTab(f.name, text);
  }
});
dropArea.addEventListener('click', () => fileInput.click());

function applyTheme() {
  const root = document.documentElement;
  root.style.setProperty('--bg', bgColor.value);
  root.style.setProperty('--panel', `${panelColor.value}cc`);
  root.style.setProperty('--accent', accentColor.value);
  root.style.setProperty('--highlight', highlightColor.value);
  root.style.setProperty('--text', textColor.value);
}

bgColor.oninput = applyTheme;
panelColor.oninput = applyTheme;
accentColor.oninput = applyTheme;
highlightColor.oninput = applyTheme;
textColor.oninput = applyTheme;

saveThemeBtn.onclick = () => {
  const theme = {
    bg: bgColor.value,
    panel: panelColor.value,
    accent: accentColor.value,
    highlight: highlightColor.value,
    text: textColor.value,
    fontSize: fontsize.value,
    fontFamily: fontfamily.value,
    themeMode: document.body.dataset.theme
  };
  const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const now = new Date();
  a.download = `fileeditor_THEME_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.json`;
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
};

loadThemeBtn.onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    const data = JSON.parse(await f.text());
    bgColor.value = data.bg;
    panelColor.value = data.panel;
    accentColor.value = data.accent;
    highlightColor.value = data.highlight;
    textColor.value = data.text;
    fontsize.value = data.fontSize;
    fontfamily.value = data.fontFamily;
    document.body.dataset.theme = data.themeMode || 'light';
    codeEl.style.fontSize = `${fontsize.value}px`;
    codeEl.style.fontFamily = fontfamily.value;
    applyTheme();
  };
  input.click();
};

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    saveCurrentTab();
  }
  if (e.key === 'Escape') {
    togglePanel(helpModal, false);
    togglePanel(settingPanel, false);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  newTab();
  applyTheme();
  codeEl.style.fontSize = `${fontsize.value}px`;
  codeEl.style.fontFamily = fontfamily.value;
});
