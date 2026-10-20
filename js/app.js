(() => {
  document.body.classList.add('is-loading');
  const columns = ['0', '1', '2', '3'];
  const defaultDisplaySettings = Object.freeze({ linkIconSize: 16, linkTitleSize: 13, linkDescriptionSize: 11 });
  const boardIcons = ['📁', '⚡', '⚙️', '🔧', '🎨', '📚', '🤖', '🔗', '📋', '🚀', '💡', '🌐', '🔒', '📊', '🧪', '🧩', '💻'];
  const seedLinks = (items) => items.map(([name, domain, description, icon, iconClass], index) => ({ id: `link-${domain}-${index}`, url: `https://${domain}`, name, domain, description, icon, iconClass, favicon: '' }));
  const state = {
    tabs: [{
      id: 'tab-home',
      name: 'Home',
      boards: [
        { id: 'board-development', name: 'Development', icon: '💻', columnId: '0', links: [{ id: 'link-github', url: 'https://github.com/', name: 'GitHub', domain: 'github.com', description: 'Git hosting and collaboration platform', icon: 'G', iconClass: 'github', favicon: '' }, { id: 'link-stackoverflow', url: 'https://stackoverflow.com/', name: 'Stack Overflow', domain: 'stackoverflow.com', description: 'Developer Q&A community', icon: 'S', iconClass: 'stackoverflow', favicon: '' }, { id: 'link-mdn', url: 'https://developer.mozilla.org/', name: 'MDN Web Docs', domain: 'developer.mozilla.org', description: 'Comprehensive web development reference', icon: 'MD', iconClass: 'mdn', favicon: '' }] },
        { id: 'board-learning', name: 'Learning', icon: '📚', columnId: '1', links: [{ id: 'link-youtube', url: 'https://www.youtube.com/', name: 'YouTube', domain: 'youtube.com', description: 'Video sharing and learning platform', icon: 'Y', iconClass: 'youtube', favicon: '' }, { id: 'link-udemy', url: 'https://www.udemy.com/', name: 'Udemy', domain: 'udemy.com', description: 'Online courses and learning', icon: 'U', iconClass: 'udemy', favicon: '' }, { id: 'link-documentation', url: 'https://developer.mozilla.org/', name: 'Documentation', domain: 'developer.mozilla.org', description: 'Web development documentation', icon: 'D', iconClass: 'docs', favicon: '' }] },
        { id: 'board-personal', name: 'Personal', icon: '🌐', columnId: '2', links: [{ id: 'link-google', url: 'https://www.google.com/', name: 'Google', domain: 'google.com', description: 'Search engine', icon: 'G', iconClass: 'google', favicon: '' }, { id: 'link-gmail', url: 'https://mail.google.com/', name: 'Gmail', domain: 'mail.google.com', description: 'Email service by Google', icon: 'M', iconClass: 'gmail', favicon: '' }, { id: 'link-reddit', url: 'https://www.reddit.com/', name: 'Reddit', domain: 'reddit.com', description: 'Social news and discussion', icon: 'R', iconClass: 'reddit', favicon: '' }] }
      ]
    }],
    activeTabId: 'tab-home',
    modalMode: null,
    editingId: null,
    pendingColumnId: null,
    selectedBoardIcon: '📁',
    pendingDelete: null,
    context: null,
    draggedBoardId: null,
    dropTarget: null,
    enteringBoardId: null,
    draggedLinkId: null,
    draggedLinkBoardId: null,
    linkDropTarget: null,
    suppressLinkClick: false,
    linkMode: null,
    linkBoardId: null,
    editingLinkId: null,
    moveLink: null,
    moveBoard: null,
    themeId: 'dark',
    customThemeColor: '#6366f1',
    customThemeMode: 'solid',
    customGradientColor1: '#6366f1',
    customGradientColor2: '#8b5cf6',
    customGradientType: 'linear',
    customGradientDirection: '135deg',
    savedBackground: { backgroundMode: 'theme', imageId: null, imageRemoved: false, opacity: 82, darkness: 35, blur: 0, size: 'cover', position: 'center' },
    backgroundDirty: false,
    savedDisplaySettings: { ...defaultDisplaySettings },
    displayDirty: false
  };
  const faviconRequests = new Map();

  const tabsElement = document.querySelector('.workspace-tabs');
  const workspaceElement = document.querySelector('.workspace');
  const addTabButton = tabsElement.querySelector('.add-tab');
  const tabModal = document.querySelector('#tabModal');
  const tabModalTitle = document.querySelector('#tabModalTitle');
  const tabNameInput = document.querySelector('#tabNameInput');
  const tabError = document.querySelector('#tabError');
  const boardIconField = document.querySelector('#boardIconField');
  const iconPicker = document.querySelector('#iconPicker');
  const contextMenu = document.querySelector('#tabContextMenu');
  const confirmModal = document.querySelector('#confirmModal');
  const confirmTitle = document.querySelector('#confirmTitle');
  const confirmMessage = document.querySelector('#confirmMessage');
  const confirmDeleteButton = document.querySelector('[data-tab-action="confirm-delete"]');
  const linkModal = document.querySelector('#linkModal');
  const linkModalTitle = document.querySelector('#linkModalTitle');
  const linkUrlInput = document.querySelector('#linkUrlInput');
  const linkNameInput = document.querySelector('#linkNameInput');
  const linkDescriptionInput = document.querySelector('#linkDescriptionInput');
  const linkError = document.querySelector('#linkError');
  const moveLinkModal = document.querySelector('#moveLinkModal');
  const moveTabSelect = document.querySelector('#moveTabSelect');
  const moveColumnSelect = document.querySelector('#moveColumnSelect');
  const moveBoardSelect = document.querySelector('#moveBoardSelect');
  const moveLinkError = document.querySelector('#moveLinkError');
  const moveBoardModal = document.querySelector('#moveBoardModal');
  const moveBoardTabSelect = document.querySelector('#moveBoardTabSelect');
  const moveBoardColumnSelect = document.querySelector('#moveBoardColumnSelect');
  const moveBoardError = document.querySelector('#moveBoardError');
  const importModal = document.querySelector('#importModal');
  const importFileInput = document.querySelector('#importFileInput');
  const importError = document.querySelector('#importError');
  const importPreview = document.querySelector('#importPreview');
  const exportOptionsModal = document.querySelector('#exportOptionsModal');
  const exportOptionsError = document.querySelector('#exportOptionsError');
  const searchButton = document.querySelector('#searchButton');
  const searchModal = document.querySelector('#searchModal');
  const searchInput = document.querySelector('#searchInput');
  const searchResults = document.querySelector('#searchResults');
  const settingsButton = document.querySelector('#settingsButton');
  const settingsModal = document.querySelector('#settingsModal');
  let settingsNavItems = document.querySelectorAll('[data-settings-tab]');
  let settingsPanels = document.querySelectorAll('[data-settings-panel]');
  const customThemeColor = document.querySelector('#customThemeColor');
  const exportBackupButton = document.querySelector('#exportBackupButton');
  const importBackupButton = document.querySelector('#importBackupButton');
  const resetDataButton = document.querySelector('#resetDataButton');
  const themeCards = document.querySelectorAll('[data-theme-id]');
  const backgroundLayer = document.querySelector('#customBackgroundLayer');
  const backgroundOverlay = document.querySelector('#customBackgroundOverlay');
  const customBackgroundControls = document.querySelector('#customBackgroundControls');
  document.querySelector('.background-mode')?.remove();
  const backgroundFileInput = document.querySelector('#backgroundFileInput');
  const chooseBackgroundButton = document.querySelector('#chooseBackgroundButton');
  const changeBackgroundButton = document.querySelector('#changeBackgroundButton');
  const backgroundPreview = document.querySelector('#backgroundPreview');
  backgroundPreview.querySelector('#removeBackgroundButton')?.remove();
  const removeBackgroundButtons = document.querySelectorAll('#removeBackgroundButton');
  const backgroundPreviewImage = document.querySelector('.background-preview-image');
  const backgroundPreviewOverlay = document.querySelector('.background-preview-overlay');
  const backgroundUpload = document.querySelector('#backgroundUpload');
  const backgroundError = document.querySelector('#backgroundError');
  const backgroundOpacity = document.querySelector('#backgroundOpacity');
  const backgroundDarkness = document.querySelector('#backgroundDarkness');
  const backgroundBlur = document.querySelector('#backgroundBlur');
  const backgroundSize = document.querySelector('#backgroundSize');
  const backgroundOpacityValue = document.querySelector('#backgroundOpacityValue');
  const backgroundDarknessValue = document.querySelector('#backgroundDarknessValue');
  const backgroundBlurValue = document.querySelector('#backgroundBlurValue');
  const saveBackgroundButton = document.querySelector('#saveBackgroundButton');
  backgroundOpacity.min = '0';
  backgroundOpacity.max = '100';
  backgroundOpacity.step = '1';
  backgroundDarkness.min = '0';
  backgroundDarkness.max = '100';
  backgroundDarkness.step = '1';
  const discardBackgroundButton = document.createElement('button');
  discardBackgroundButton.type = 'button';
  discardBackgroundButton.className = 'discard-background-button';
  discardBackgroundButton.textContent = 'Discard';
  saveBackgroundButton.before(discardBackgroundButton);
  const removeBackgroundButton = document.querySelector('#removeBackgroundButton');
  removeBackgroundButton?.remove();
  const textIconsNavItem = document.createElement('button');
  textIconsNavItem.className = 'settings-nav-item';
  textIconsNavItem.type = 'button';
  textIconsNavItem.dataset.settingsTab = 'text-icons';
  textIconsNavItem.setAttribute('aria-controls', 'settingsTextIconsPanel');
  textIconsNavItem.setAttribute('aria-selected', 'false');
  textIconsNavItem.innerHTML = '🅰️ <span>Text & Icons</span>';
  const dataNavItem = settingsNavItems[0].parentElement.querySelector('[data-settings-tab="data"]');
  settingsNavItems[0].parentElement.insertBefore(textIconsNavItem, dataNavItem);
  const textIconsPanel = document.createElement('section');
  textIconsPanel.className = 'settings-panel';
  textIconsPanel.id = 'settingsTextIconsPanel';
  textIconsPanel.dataset.settingsPanel = 'text-icons';
  textIconsPanel.setAttribute('role', 'tabpanel');
  textIconsPanel.hidden = true;
  textIconsPanel.innerHTML = '<h2>Text & Icons</h2><p>Customize how links appear</p><div class="display-setting"><label for="linkIconSize"><span>Link Icon Size <output id="linkIconSizeValue">16px</output></span><input id="linkIconSize" type="range" min="16" max="40" step="1" value="16"></label></div><div class="display-setting"><label for="linkTitleSize"><span>Link Title Size <output id="linkTitleSizeValue">13px</output></span><input id="linkTitleSize" type="range" min="12" max="24" step="1" value="13"></label></div><div class="display-setting"><label for="linkDescriptionSize"><span>Link Description Size <output id="linkDescriptionSizeValue">11px</output></span><input id="linkDescriptionSize" type="range" min="10" max="20" step="1" value="11"></label></div><div class="display-preview-section"><label>Preview</label><div class="display-link-preview"><span class="display-preview-icon">A</span><span class="display-preview-copy"><strong>OpenAI</strong><em>AI research and development</em><small>https://openai.com</small></span><span class="display-preview-external">↗</span></div><small class="display-preview-note">Changes are previewed before saving.</small></div><button class="display-default-button" type="button">Default</button><div class="background-actions display-actions"><button class="discard-display-button" type="button">Discard</button><button class="save-display-button" type="button">Save Changes</button></div>';
  const panelsContainer = settingsNavItems[0].closest('.settings-layout').querySelector('.settings-panels');
  const dataPanel = panelsContainer.querySelector('[data-settings-panel="data"]');
  panelsContainer.insertBefore(textIconsPanel, dataPanel);
  settingsNavItems = document.querySelectorAll('[data-settings-tab]');
  settingsPanels = document.querySelectorAll('[data-settings-panel]');
  const settingsActions = saveBackgroundButton.parentElement;
  customBackgroundControls.append(settingsActions);
  if (removeBackgroundButton) settingsActions.append(removeBackgroundButton);
  const linkIconSize = textIconsPanel.querySelector('#linkIconSize');
  const linkTitleSize = textIconsPanel.querySelector('#linkTitleSize');
  const linkDescriptionSize = textIconsPanel.querySelector('#linkDescriptionSize');
  const linkIconSizeValue = textIconsPanel.querySelector('#linkIconSizeValue');
  const linkTitleSizeValue = textIconsPanel.querySelector('#linkTitleSizeValue');
  const linkDescriptionSizeValue = textIconsPanel.querySelector('#linkDescriptionSizeValue');
  const displayDefaultButton = textIconsPanel.querySelector('.display-default-button');
  const discardDisplayButton = textIconsPanel.querySelector('.discard-display-button');
  const saveDisplayButton = textIconsPanel.querySelector('.save-display-button');
  const displayPreview = textIconsPanel.querySelector('.display-link-preview');
  const BACKGROUND_DB = 'linkboardBackground';
  const BACKGROUND_STORE = 'images';
  let activeBackgroundObjectUrl = null;
  let pendingBackgroundObjectUrl = null;
  let pendingBackgroundImageId = null;
  let pendingBackground = null;
  let pendingDisplaySettings = null;
  let backgroundApplyToken = 0;

  const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const findTab = (id) => state.tabs.find((tab) => tab.id === id);
  const activeTab = () => findTab(state.activeTabId);
  const tabNameTaken = (name, ignoredId = null) => state.tabs.some((tab) => tab.id !== ignoredId && tab.name.toLowerCase() === name.toLowerCase());
  const boardNameTaken = (name, ignoredId = null) => activeTab().boards.some((board) => board.id !== ignoredId && board.name.toLowerCase() === name.toLowerCase());
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  const validColor = (value) => /^#[0-9a-f]{6}$/i.test(value);
  const clampNumber = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
  const normalizeBackground = (saved = {}) => {
    const source = saved.background && typeof saved.background === 'object' ? saved.background : saved;
    const mode = source.backgroundMode === 'custom' || source.mode === 'custom' ? 'custom' : 'theme';
    const opacity = Number(source.opacity);
    const darkness = Number(source.darkness);
    return { backgroundMode: mode, imageId: mode === 'custom' ? (typeof source.imageId === 'string' ? source.imageId : 'background') : null, imageRemoved: Boolean(source.imageRemoved), opacity: clampNumber(opacity <= 1 ? opacity * 100 : opacity, 0, 100, 82), darkness: clampNumber(darkness <= 1 ? darkness * 100 : darkness, 0, 100, 35), blur: clampNumber(source.blur, 0, 24, 0), size: source.size === 'contain' ? 'contain' : 'cover', position: 'center' };
  };

  function openBackgroundDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('IndexedDB is unavailable')); return; }
      const request = indexedDB.open(BACKGROUND_DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(BACKGROUND_STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB could not be opened'));
    });
  }

  function backgroundDbRequest(mode, action, value, key = 'background') {
    return openBackgroundDb().then((db) => new Promise((resolve, reject) => {
      const transaction = db.transaction(BACKGROUND_STORE, mode);
      const request = action === 'put' ? transaction.objectStore(BACKGROUND_STORE).put(value, key) : action === 'delete' ? transaction.objectStore(BACKGROUND_STORE).delete(key) : transaction.objectStore(BACKGROUND_STORE).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed'));
    }));
  }

  function renderTabs() {
    tabsElement.querySelectorAll('.workspace-tab').forEach((tab) => tab.remove());
    state.tabs.forEach((tab) => {
      const button = document.createElement('button');
      button.className = `workspace-tab${tab.id === state.activeTabId ? ' active' : ''}`;
      button.type = 'button';
      button.dataset.tabId = tab.id;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(tab.id === state.activeTabId));
      button.textContent = tab.name;
      tabsElement.insertBefore(button, addTabButton);
    });
  }

  function renderColumns() {
    workspaceElement.innerHTML = columns.map((columnId) => {
      const boards = activeTab().boards.filter((board) => board.columnId === columnId);
      const emptyState = `<button class="add-board" type="button" data-add-board="${columnId}">+ Add Board</button>`;
      const addButton = `<button class="add-board" type="button" data-add-board="${columnId}">+ Add Board</button>`;
      return `<div class="board-column${boards.length ? '' : ' empty-column'}" data-column-id="${columnId}">${boards.length ? boards.map(renderBoard).join('') + addButton : emptyState}</div>`;
    }).join('');
    const enteringBoardId = state.enteringBoardId;
    state.enteringBoardId = null;
    if (enteringBoardId) {
      requestAnimationFrame(() => {
        const movedBoard = workspaceElement.querySelector(`[data-board-id="${CSS.escape(enteringBoardId)}"]`);
        if (!movedBoard) return;
        movedBoard.classList.add('board-entered');
        window.setTimeout(() => movedBoard.classList.remove('board-entering', 'board-entered'), 300);
      });
    }
    loadFavicons();
  }

  function renderBoard(board) {
    const enteringClass = state.enteringBoardId === board.id ? ' board-entering' : '';
    return `<article class="board-card${enteringClass}" draggable="true" data-board-id="${board.id}">
      <header class="board-header"><span class="board-icon">${escapeHtml(board.icon)}</span><h2>${escapeHtml(board.name)}</h2><span class="link-count">${board.links.length}</span><button class="more-button" type="button" data-board-menu="${board.id}" aria-label="${escapeHtml(board.name)} options">•••</button></header>
      <div class="link-list">${board.links.map((link) => renderLink(link, board.id)).join('')}</div>
      <footer><button class="add-link" type="button" data-add-link="${board.id}">+ &nbsp;Add Link</button></footer>
    </article>`;
  }

  function renderLink(link, boardId) {
    return `<div class="link-row" draggable="true" data-link-id="${escapeHtml(link.id)}" data-board-id="${escapeHtml(boardId)}"><a href="${escapeHtml(link.url)}"><span class="site-icon favicon-slot">${faviconMarkup(link)}</span><span class="link-copy"><strong>${escapeHtml(link.name)}</strong><small>${escapeHtml(link.domain)}</small><em>${escapeHtml(link.description || '')}</em></span><span class="external">↗</span></a><button class="link-menu-button" type="button" data-link-menu="${escapeHtml(link.id)}" data-board-id="${escapeHtml(boardId)}" aria-label="${escapeHtml(link.name)} options">•••</button></div>`;
  }

  function faviconMarkup(link) {
    const favicon = link.favicon && link.favicon.startsWith('data:image/') ? link.favicon : '';
    return `${favicon ? `<img class="link-favicon" src="${escapeHtml(favicon)}" data-favicon alt="">` : ''}<span class="link-fallback${favicon ? ' has-favicon' : ''}">🔗</span>`;
  }

  function openNameModal(mode, id = null, columnId = null) {
    state.modalMode = mode;
    state.editingId = id;
    state.pendingColumnId = columnId;
    const currentName = mode === 'rename-tab' ? findTab(id).name : mode === 'rename-board' ? activeTab().boards.find((board) => board.id === id).name : '';
    tabModalTitle.textContent = mode === 'create-board' ? 'Create Board' : mode === 'rename-board' ? 'Rename Board' : mode === 'rename-tab' ? 'Rename Tab' : 'Create New Tab';
    tabNameInput.value = currentName;
    state.selectedBoardIcon = '📁';
    boardIconField.hidden = mode !== 'create-board';
    iconPicker.innerHTML = boardIcons.map((icon) => `<button class="icon-option${icon === state.selectedBoardIcon ? ' selected' : ''}" type="button" data-board-icon="${escapeHtml(icon)}">${escapeHtml(icon)}</button>`).join('');
    tabError.textContent = '';
    tabModal.hidden = false;
    requestAnimationFrame(() => {
      tabNameInput.focus();
      tabNameInput.select();
    });
  }

  function closeNameModal() {
    tabModal.hidden = true;
    state.modalMode = null;
    state.editingId = null;
    state.pendingColumnId = null;
  }

  function openLinkModal(boardId, linkId = null) {
    const board = activeTab().boards.find((item) => item.id === boardId);
    const link = linkId ? board.links.find((item) => item.id === linkId) : null;
    state.linkMode = linkId ? 'edit' : 'create';
    state.linkBoardId = boardId;
    state.editingLinkId = linkId;
    linkModalTitle.textContent = linkId ? 'Edit Link' : 'Add Link';
    linkUrlInput.value = link?.url || '';
    linkNameInput.value = link?.name || '';
    linkDescriptionInput.value = link?.description || '';
    linkError.textContent = '';
    linkModal.hidden = false;
    requestAnimationFrame(() => {
      linkUrlInput.focus();
      linkUrlInput.select();
    });
  }

  function closeLinkModal() {
    linkModal.hidden = true;
    state.linkMode = null;
    state.linkBoardId = null;
    state.editingLinkId = null;
  }

  function renderMoveBoards() {
    const tab = findTab(state.moveLink.targetTabId);
    const boards = tab.boards.filter((board) => board.columnId === state.moveLink.targetColumnId);
    if (!boards.some((board) => board.id === state.moveLink.targetBoardId)) state.moveLink.targetBoardId = boards[0]?.id || '';
    moveBoardSelect.innerHTML = boards.length ? boards.map((board) => `<option value="${escapeHtml(board.id)}">${escapeHtml(board.name)}</option>`).join('') : '<option value="">No boards in this column</option>';
    moveBoardSelect.value = state.moveLink.targetBoardId;
  }

  function renderMoveTargets() {
    moveTabSelect.innerHTML = state.tabs.map((tab) => `<option value="${escapeHtml(tab.id)}">${escapeHtml(tab.name)}</option>`).join('');
    moveTabSelect.value = state.moveLink.targetTabId;
    moveColumnSelect.innerHTML = columns.map((columnId, index) => `<option value="${columnId}">Column ${index + 1}</option>`).join('');
    moveColumnSelect.value = state.moveLink.targetColumnId;
    renderMoveBoards();
  }

  function openMoveLinkModal(boardId, linkId) {
    const sourceBoard = activeTab().boards.find((board) => board.id === boardId);
    if (!sourceBoard || !sourceBoard.links.some((link) => link.id === linkId)) return;
    state.moveLink = { linkId, sourceTabId: activeTab().id, sourceBoardId: boardId, targetTabId: activeTab().id, targetColumnId: sourceBoard.columnId, targetBoardId: boardId };
    moveLinkError.textContent = '';
    renderMoveTargets();
    moveLinkModal.hidden = false;
    moveTabSelect.focus();
  }

  function closeMoveLinkModal() {
    moveLinkModal.hidden = true;
    state.moveLink = null;
  }

  function renderMoveBoardTargets() {
    moveBoardTabSelect.innerHTML = state.tabs.map((tab) => `<option value="${escapeHtml(tab.id)}">${escapeHtml(tab.name)}</option>`).join('');
    moveBoardTabSelect.value = state.moveBoard.targetTabId;
    moveBoardColumnSelect.innerHTML = columns.map((columnId, index) => `<option value="${columnId}">Column ${index + 1}</option>`).join('');
    moveBoardColumnSelect.value = state.moveBoard.targetColumnId;
  }

  function openMoveBoardModal(boardId) {
    const sourceBoard = activeTab().boards.find((board) => board.id === boardId);
    if (!sourceBoard) return;
    state.moveBoard = { boardId, sourceTabId: activeTab().id, sourceColumnId: sourceBoard.columnId, targetTabId: activeTab().id, targetColumnId: sourceBoard.columnId };
    moveBoardError.textContent = '';
    renderMoveBoardTargets();
    moveBoardModal.hidden = false;
    moveBoardTabSelect.focus();
  }

  function closeMoveBoardModal() {
    moveBoardModal.hidden = true;
    state.moveBoard = null;
  }

  function moveBoardToTab() {
    const move = state.moveBoard;
    const sourceTab = findTab(move.sourceTabId);
    const targetTab = findTab(move.targetTabId);
    const sourceBoard = sourceTab?.boards.find((board) => board.id === move.boardId);
    if (!sourceBoard || !targetTab) { moveBoardError.textContent = 'Select a destination tab.'; return; }
    const boardIndex = sourceTab.boards.findIndex((board) => board.id === move.boardId);
    if (boardIndex < 0) return;
    const [board] = sourceTab.boards.splice(boardIndex, 1);
    board.columnId = move.targetColumnId;
    targetTab.boards.push(board);
    state.activeTabId = targetTab.id;
    renderTabs();
    renderColumns();
    saveData();
    closeMoveBoardModal();
  }

  function moveLink() {
    const move = state.moveLink;
    const sourceTab = findTab(move.sourceTabId);
    const targetTab = findTab(move.targetTabId);
    const sourceBoard = sourceTab?.boards.find((board) => board.id === move.sourceBoardId);
    const targetBoard = targetTab?.boards.find((board) => board.id === move.targetBoardId);
    if (!sourceBoard || !targetBoard) { moveLinkError.textContent = 'Select a destination board.'; return; }
    const sourceLink = sourceBoard.links.find((link) => link.id === move.linkId);
    if (!sourceLink) return;
    if (sourceBoard !== targetBoard && targetBoard.links.some((link) => urlKey(link.url) === urlKey(sourceLink.url))) { moveLinkError.textContent = 'This URL already exists in the destination board.'; return; }
    const linkIndex = sourceBoard.links.findIndex((link) => link.id === move.linkId);
    if (linkIndex < 0) return;
    const [link] = sourceBoard.links.splice(linkIndex, 1);
    if (sourceBoard !== targetBoard) targetBoard.links.push(link); else sourceBoard.links.splice(linkIndex, 0, link);
    state.activeTabId = targetTab.id;
    renderTabs();
    renderColumns();
    saveData();
    closeMoveLinkModal();
  }

  function normalizeUrl(value) {
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  }

  function faviconUrl(url) {
    try {
      return `${new URL(normalizeUrl(url)).origin}/favicon.ico`;
    } catch { return ''; }
  }

  function loadFavicons() {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) return;
    state.tabs.forEach((tab) => tab.boards.forEach((board) => board.links.forEach((link) => {
      if (link.favicon?.startsWith('data:image/') || faviconRequests.has(link.url)) return;
      const requestUrl = faviconUrl(link.url);
      if (!requestUrl) return;
      faviconRequests.set(link.url, true);
      chrome.runtime.sendMessage({ type: 'load-favicon', url: link.url }).then((response) => {
        const dataUrl = response?.dataUrl;
        if (!dataUrl || !dataUrl.startsWith('data:image/')) return;
        link.favicon = dataUrl;
        if (tab.id === state.activeTabId) {
          const row = workspaceElement.querySelector(`[data-link-id="${CSS.escape(link.id)}"]`);
          const slot = row?.querySelector('.favicon-slot');
          const fallback = slot?.querySelector('.link-fallback');
          if (slot && fallback) {
            const image = document.createElement('img');
            image.className = 'link-favicon';
            image.src = dataUrl;
            image.alt = '';
            image.dataset.favicon = '';
            slot.prepend(image);
            fallback.classList.add('has-favicon');
          }
        }
        saveData();
        if (!searchModal.classList.contains('show')) return;
        renderSearchResults();
      }).catch(() => { });
    })));
  }

  function urlKey(url) {
    try {
      const parsed = new URL(normalizeUrl(url));
      const path = parsed.pathname.replace(/\/+$/, '') || '/';
      return `${parsed.protocol}//${parsed.hostname.replace(/^www\./, '').toLowerCase()}${path}${parsed.search}${parsed.hash}`.toLowerCase();
    } catch { return String(url).trim().toLowerCase(); }
  }

  function saveLink() {
    const urlValue = linkUrlInput.value.trim();
    const name = linkNameInput.value.trim();
    if (!urlValue || !name) { linkError.textContent = 'URL and name are required.'; return; }
    const url = normalizeUrl(urlValue);
    let parsedUrl;
    try { parsedUrl = new URL(url); } catch { linkError.textContent = 'Enter a valid URL.'; return; }
    if (!['http:', 'https:'].includes(parsedUrl.protocol) || !parsedUrl.hostname) { linkError.textContent = 'Use a valid HTTP or HTTPS URL.'; return; }
    const board = activeTab().boards.find((item) => item.id === state.linkBoardId);
    const duplicateUrl = board.links.some((item) => item.id !== state.editingLinkId && urlKey(item.url) === urlKey(url));
    if (duplicateUrl) { linkError.textContent = 'This URL already exists in this board.'; return; }
    const link = { id: state.editingLinkId || makeId('link'), url, name, domain: parsedUrl.hostname.replace(/^www\./, ''), description: linkDescriptionInput.value.trim(), icon: '↗', iconClass: 'placeholder', favicon: '' };
    if (state.linkMode === 'edit') {
      const index = board.links.findIndex((item) => item.id === state.editingLinkId);
      board.links[index] = link;
    } else board.links.push(link);
    renderColumns();
    saveData();
    closeLinkModal();
  }

  function findLink(boardId, linkId) {
    return activeTab().boards.find((board) => board.id === boardId)?.links.find((link) => link.id === linkId);
  }

  function deleteLink(boardId, linkId) {
    const board = activeTab().boards.find((item) => item.id === boardId);
    board.links = board.links.filter((link) => link.id !== linkId);
    renderColumns();
    saveData();
  }

  function renderContextMenu(context) {
    const linkActions = context.kind === 'link';
    const boardActions = context.kind === 'board';
    const tabActions = context.kind === 'tab';
    if (linkActions) {
      contextMenu.innerHTML = '<button type="button" data-context-action="open">Open link</button><button type="button" data-context-action="new-tab">Open in new tab</button><button type="button" data-context-action="edit">Edit</button><button type="button" data-context-action="move">Move to board</button><button type="button" data-context-action="copy">Copy URL</button><div class="context-separator"></div><button class="danger-item" type="button" data-context-action="delete">Delete</button>';
    } else if (boardActions) {
      contextMenu.innerHTML = '<button type="button" data-context-action="rename">Rename</button><button type="button" data-context-action="move-board">Move board</button><div class="context-separator"></div><button class="danger-item" type="button" data-context-action="delete">Delete</button>';
    } else {
      contextMenu.innerHTML = '<button type="button" data-context-action="rename">Rename</button><button class="danger-item" type="button" data-context-action="delete">Delete</button>';
    }
  }

  function saveName() {
    const name = tabNameInput.value.trim();
    if (!name) { tabError.textContent = 'Enter a name.'; tabNameInput.focus(); return; }
    const isTab = state.modalMode === 'create-tab' || state.modalMode === 'rename-tab';
    const duplicate = isTab ? tabNameTaken(name, state.editingId) : boardNameTaken(name, state.editingId);
    if (duplicate) { tabError.textContent = `A ${isTab ? 'tab' : 'board'} with this name already exists.`; tabNameInput.focus(); return; }
    if (state.modalMode === 'create-tab') {
      const tab = { id: makeId('tab'), name, boards: [] };
      state.tabs.push(tab); state.activeTabId = tab.id;
    } else if (state.modalMode === 'rename-tab') {
      findTab(state.editingId).name = name;
    } else if (state.modalMode === 'create-board') {
      createBoard(name, state.pendingColumnId, state.selectedBoardIcon);
    } else {
      renameBoard(state.editingId, name);
    }
    renderTabs(); renderColumns(); closeNameModal();
    saveData();
  }

  function switchTab(tabId) { if (findTab(tabId)) { state.activeTabId = tabId; renderTabs(); renderColumns(); saveData(); } }

  function createBoard(name, columnId, icon = '📁') {
    activeTab().boards.push({ id: makeId('board'), name, icon, columnId, links: [] });
  }

  function renameBoard(boardId, name) {
    activeTab().boards.find((board) => board.id === boardId).name = name;
  }

  function openContextMenu(event, context) {
    event.preventDefault();
    state.context = context;
    renderContextMenu(context);
    contextMenu.style.left = `${Math.min(event.clientX, window.innerWidth - 180)}px`;
    contextMenu.style.top = `${Math.min(event.clientY, window.innerHeight - 90)}px`;
    contextMenu.hidden = false;
  }

  function closeContextMenu() { contextMenu.hidden = true; state.context = null; }

  function askDelete(kind, id) {
    const item = kind === 'tab' ? findTab(id) : kind === 'board' ? activeTab().boards.find((board) => board.id === id) : findLink(state.context.boardId, id);
    if (!item) return;
    if (kind === 'tab' && state.tabs.length <= 1) {
      showNotification('You must keep at least one tab.', 'error');
      return;
    }
    state.pendingDelete = { kind, id, boardId: state.context?.boardId };
    confirmTitle.textContent = `Delete "${item.name}"?`;
    confirmMessage.textContent = kind === 'tab' ? 'All boards and links inside this tab will be removed permanently.' : kind === 'board' ? 'All links inside this board will be permanently removed.' : 'This link will be removed from the board.';
    if (confirmDeleteButton) confirmDeleteButton.textContent = `Delete ${kind.charAt(0).toUpperCase() + kind.slice(1)}`;
    confirmModal.hidden = false;
  }

  function deleteBoard(id) { activeTab().boards = activeTab().boards.filter((board) => board.id !== id); renderColumns(); saveData(); }

  function deleteTab(id) {
    if (state.tabs.length <= 1) {
      showNotification('You must keep at least one tab.', 'error');
      return;
    }
    const index = state.tabs.findIndex((tab) => tab.id === id);
    if (index < 0) return;
    state.tabs.splice(index, 1);
    if (state.activeTabId === id) state.activeTabId = state.tabs[Math.max(0, index - 1)].id;
    renderTabs(); renderColumns();
    saveData();
  }

  function confirmDelete() {
    if (!state.pendingDelete) return;
    if (state.pendingDelete.kind === 'tab') deleteTab(state.pendingDelete.id); else if (state.pendingDelete.kind === 'board') deleteBoard(state.pendingDelete.id); else deleteLink(state.pendingDelete.boardId, state.pendingDelete.id);
    state.pendingDelete = null; confirmModal.hidden = true;
  }

  function clearDropIndicator() {
    workspaceElement.querySelectorAll('.board-card').forEach((board) => {
      board.classList.remove('drag-over-before', 'drag-over-after');
    });
    workspaceElement.querySelectorAll('.board-column').forEach((column) => column.classList.remove('drag-over-column'));
    state.dropTarget = null;
  }

  function updateDropIndicator(event) {
    const column = event.target.closest('.board-column');
    if (!column || !state.draggedBoardId) return;
    const board = event.target.closest('.board-card');
    clearDropIndicator();
    if (board && board.dataset.boardId !== state.draggedBoardId) {
      const position = event.clientY < board.getBoundingClientRect().top + board.offsetHeight / 2 ? 'before' : 'after';
      board.classList.add(`drag-over-${position}`);
      state.dropTarget = { columnId: column.dataset.columnId, boardId: board.dataset.boardId, position };
    } else {
      column.classList.add('drag-over-column');
      state.dropTarget = { columnId: column.dataset.columnId, boardId: null, position: 'after' };
    }
  }

  function moveBoard() {
    if (!state.draggedBoardId || !state.dropTarget) return;
    const boards = activeTab().boards;
    const movingIndex = boards.findIndex((board) => board.id === state.draggedBoardId);
    if (movingIndex < 0) return;
    const [movingBoard] = boards.splice(movingIndex, 1);
    movingBoard.columnId = state.dropTarget.columnId;
    const targetIndex = state.dropTarget.boardId ? boards.findIndex((board) => board.id === state.dropTarget.boardId) : -1;
    let insertIndex = targetIndex < 0 ? boards.length : targetIndex + (state.dropTarget.position === 'after' ? 1 : 0);
    boards.splice(insertIndex, 0, movingBoard);
    state.enteringBoardId = movingBoard.id;
    renderColumns();
    saveData();
  }

  function clearLinkDropIndicator() {
    workspaceElement.querySelectorAll('.link-row').forEach((row) => row.classList.remove('drag-over-before', 'drag-over-after'));
    state.linkDropTarget = null;
  }

  function updateLinkDropIndicator(event) {
    const boardEl = event.target.closest('.board-card');
    if (!boardEl || boardEl.dataset.boardId !== state.draggedLinkBoardId) {
      workspaceElement.querySelectorAll('.link-row.drag-over-before,.link-row.drag-over-after').forEach((el) => el.classList.remove('drag-over-before', 'drag-over-after'));
      state.linkDropTarget = null;
      return;
    }
    const linkRow = event.target.closest('.link-row');
    workspaceElement.querySelectorAll('.link-row.drag-over-before,.link-row.drag-over-after').forEach((el) => el.classList.remove('drag-over-before', 'drag-over-after'));
    if (linkRow && linkRow.dataset.linkId !== state.draggedLinkId) {
      const rect = linkRow.getBoundingClientRect();
      const before = event.clientY < rect.top + rect.height / 2;
      linkRow.classList.add(before ? 'drag-over-before' : 'drag-over-after');
      state.linkDropTarget = { boardId: state.draggedLinkBoardId, linkId: linkRow.dataset.linkId, position: before ? 'before' : 'after' };
      return;
    }
    if (linkRow && linkRow.dataset.linkId === state.draggedLinkId) {
      state.linkDropTarget = null;
      return;
    }
    const links = Array.from(boardEl.querySelectorAll('.link-row'));
    if (!links.length) { state.linkDropTarget = null; return; }
    const firstRect = links[0].getBoundingClientRect();
    const lastRect = links[links.length - 1].getBoundingClientRect();
    if (event.clientY < firstRect.top) {
      links[0].classList.add('drag-over-before');
      state.linkDropTarget = { boardId: state.draggedLinkBoardId, linkId: links[0].dataset.linkId, position: 'before' };
      return;
    }
    if (event.clientY > lastRect.bottom) {
      const lastNonDragged = [...links].reverse().find((row) => row.dataset.linkId !== state.draggedLinkId);
      const target = lastNonDragged || links[links.length - 1];
      if (target.dataset.linkId === state.draggedLinkId) { state.linkDropTarget = null; return; }
      target.classList.add('drag-over-after');
      state.linkDropTarget = { boardId: state.draggedLinkBoardId, linkId: target.dataset.linkId, position: 'after' };
      return;
    }
    for (const row of links) {
      if (row.dataset.linkId === state.draggedLinkId) continue;
      const rect = row.getBoundingClientRect();
      if (event.clientY < rect.top + rect.height / 2) {
        row.classList.add('drag-over-before');
        state.linkDropTarget = { boardId: state.draggedLinkBoardId, linkId: row.dataset.linkId, position: 'before' };
        return;
      }
    }
    const nonDragged = links.filter((row) => row.dataset.linkId !== state.draggedLinkId);
    const fallback = nonDragged[nonDragged.length - 1];
    if (fallback) {
      fallback.classList.add('drag-over-after');
      state.linkDropTarget = { boardId: state.draggedLinkBoardId, linkId: fallback.dataset.linkId, position: 'after' };
    }
  }

  function moveLinkOrder() {
    if (!state.draggedLinkId || !state.linkDropTarget) return;
    const board = activeTab().boards.find((item) => item.id === state.draggedLinkBoardId);
    if (!board) return;
    const fromIndex = board.links.findIndex((link) => link.id === state.draggedLinkId);
    if (fromIndex < 0) return;
    let targetIndex = board.links.findIndex((link) => link.id === state.linkDropTarget.linkId);
    if (targetIndex < 0) return;
    if (state.linkDropTarget.position === 'after') targetIndex += 1;
    if (fromIndex < targetIndex) targetIndex -= 1;
    if (targetIndex === fromIndex) return;
    const [moved] = board.links.splice(fromIndex, 1);
    board.links.splice(targetIndex, 0, moved);
    renderColumns();
    saveData();
  }

  const STORAGE_KEY = 'linkboardData';
  const storageArea = typeof chrome !== 'undefined' ? chrome.storage?.local : null;
  let saveQueue = Promise.resolve();

  function saveData(backgroundOverride = state.savedBackground, displayOverride = state.savedDisplaySettings) {
    if (!storageArea) return Promise.resolve(false);
    const payload = { [STORAGE_KEY]: { tabs: state.tabs, activeTabId: state.activeTabId, themeId: state.themeId, customThemeColor: state.customThemeColor, customThemeMode: state.customThemeMode, customGradientColor1: state.customGradientColor1, customGradientColor2: state.customGradientColor2, customGradientType: state.customGradientType, customGradientDirection: state.customGradientDirection, background: backgroundOverride, displaySettings: displayOverride } };
    saveQueue = saveQueue.then(async () => {
      try { await storageArea.set(payload); return true; } catch { return false; }
    });
    return saveQueue;
  }

  async function loadData() {
    if (!storageArea) return false;
    try {
      const result = await storageArea.get(STORAGE_KEY);
      const saved = result[STORAGE_KEY];
      if (!saved || !Array.isArray(saved.tabs)) return false;
      const homeIndex = saved.tabs.findIndex((tab) => tab && tab.id === 'tab-home');
      if (homeIndex < 0) return false;
      const loadedTabs = saved.tabs.filter((tab) => tab && typeof tab.id === 'string' && typeof tab.name === 'string' && tab.name.trim()).map((tab) => ({
        id: tab.id,
        name: tab.name.trim(),
        boards: Array.isArray(tab.boards) ? tab.boards.filter((board) => board && typeof board.id === 'string' && typeof board.name === 'string' && board.name.trim()).map((board) => ({
          id: board.id,
          name: board.name.trim(),
          icon: typeof board.icon === 'string' ? board.icon : '📁',
          columnId: columns.includes(String(board.columnId)) ? String(board.columnId) : '0',
          links: Array.isArray(board.links) ? board.links.map(normalizeStoredLink).filter(Boolean) : []
        })) : []
      }));
      const loadedHome = loadedTabs.find((tab) => tab.id === 'tab-home');
      if (!loadedHome) return false;
      state.tabs = [loadedHome, ...loadedTabs.filter((tab) => tab.id !== 'tab-home')];
      state.activeTabId = findTab(saved.activeTabId)?.id || 'tab-home';
      const validThemeIds = ['dark', 'light', 'custom'];
      const legacyThemeMap = { original: 'dark', aurora: 'dark', cyber: 'dark', liquid: 'dark', cosmic: 'dark' };
      if (validThemeIds.includes(saved.themeId)) state.themeId = saved.themeId;
      else if (legacyThemeMap[saved.themeId]) state.themeId = legacyThemeMap[saved.themeId];
      else if (validColor(saved.themeColor)) { state.themeId = 'custom'; state.customThemeColor = saved.themeColor.toLowerCase(); }
      if (validColor(saved.customThemeColor)) state.customThemeColor = saved.customThemeColor.toLowerCase();
      if (saved.customThemeMode === 'gradient' || saved.customThemeMode === 'solid') state.customThemeMode = saved.customThemeMode;
      if (validColor(saved.customGradientColor1)) state.customGradientColor1 = saved.customGradientColor1.toLowerCase();
      if (validColor(saved.customGradientColor2)) state.customGradientColor2 = saved.customGradientColor2.toLowerCase();
      if (saved.customGradientType === 'radial' || saved.customGradientType === 'linear') state.customGradientType = saved.customGradientType;
      const validDirs = ['0deg','45deg','90deg','135deg','180deg','225deg','270deg','315deg'];
      if (typeof saved.customGradientDirection === 'string' && validDirs.includes(saved.customGradientDirection)) state.customGradientDirection = saved.customGradientDirection;
      else if (typeof saved.customGradientDirection === 'string' && /^to\s.+/.test(saved.customGradientDirection)) { const map = {'to top':'0deg','to top right':'45deg','to right':'90deg','to bottom right':'135deg','to bottom':'180deg','to bottom left':'225deg','to left':'270deg','to top left':'315deg'}; if (map[saved.customGradientDirection]) state.customGradientDirection = map[saved.customGradientDirection]; }
      state.savedBackground = normalizeBackground(saved);
      const display = saved.displaySettings || {};
      state.savedDisplaySettings = { linkIconSize: clampNumber(display.linkIconSize, 16, 40, defaultDisplaySettings.linkIconSize), linkTitleSize: clampNumber(display.linkTitleSize ?? display.linkTextSize, 12, 24, defaultDisplaySettings.linkTitleSize), linkDescriptionSize: clampNumber(display.linkDescriptionSize, 10, 20, defaultDisplaySettings.linkDescriptionSize) };
      return true;
    } catch {
      return false;
    }
  }

  function normalizeStoredLink(link) {
    if (!link || typeof link.id !== 'string' || typeof link.name !== 'string' || !link.name.trim() || typeof link.url !== 'string') return null;
    const url = normalizeUrl(link.url.trim());
    let parsed;
    try { parsed = new URL(url); } catch { return null; }
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) return null;
    return { id: link.id, url, name: link.name.trim(), domain: parsed.hostname.replace(/^www\./, ''), description: typeof link.description === 'string' ? link.description : '', icon: typeof link.icon === 'string' ? link.icon : '↗', iconClass: typeof link.iconClass === 'string' ? link.iconClass : 'placeholder', favicon: typeof link.favicon === 'string' && link.favicon.startsWith('data:image/') ? link.favicon : '' };
  }

  const BACKUP_VERSION = 1;
  const BACKUP_KEY = 'linkboardBackup';

  function createBackupData(includeCustomization = false) {
    const backup = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      tabs: state.tabs.map((tab) => ({
        id: tab.id,
        name: tab.name,
        boards: tab.boards.map((board) => ({
          id: board.id,
          name: board.name,
          icon: board.icon,
          columnId: board.columnId,
          links: board.links.map((link) => ({
            id: link.id,
            url: link.url,
            name: link.name,
            domain: link.domain,
            description: link.description,
            icon: link.icon,
            iconClass: link.iconClass,
            favicon: link.favicon
          }))
        }))
      })),
      activeTabId: state.activeTabId
    };

    if (includeCustomization) {
      backup.themeId = state.themeId;
      backup.customThemeColor = state.customThemeColor;
      backup.customThemeMode = state.customThemeMode;
      backup.customGradientColor1 = state.customGradientColor1;
      backup.customGradientColor2 = state.customGradientColor2;
      backup.customGradientType = state.customGradientType;
      backup.customGradientDirection = state.customGradientDirection;
      backup.background = { ...state.savedBackground };
      backup.displaySettings = { ...state.savedDisplaySettings };
    }

    return backup;
  }

  function openExportOptionsModal() {
    closeSettings();
    exportOptionsError.textContent = '';
    exportOptionsModal.querySelector('input[name="exportOption"][value="data-only"]').checked = true;
    exportOptionsModal.querySelector('.export-option-card.selected').classList.remove('selected');
    exportOptionsModal.querySelector('[data-export-option="data-only"]').classList.add('selected');
    exportOptionsModal.querySelectorAll('.export-option-card').forEach((card) => {
      card.setAttribute('aria-checked', 'false');
      card.tabIndex = -1;
    });
    exportOptionsModal.querySelector('[data-export-option="data-only"]').setAttribute('aria-checked', 'true');
    exportOptionsModal.querySelector('[data-export-option="data-only"]').tabIndex = 0;
    exportOptionsModal.querySelector('.export-options-notice').hidden = true;
    exportOptionsModal.hidden = false;
  }

  function closeExportOptionsModal() {
    exportOptionsModal.hidden = true;
    exportOptionsError.textContent = '';
  }

  async function performExport(includeCustomization) {
    try {
      const backup = createBackupData(includeCustomization);
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const suffix = includeCustomization ? '-full' : '';
      const filename = `linkboard-backup${suffix}-${dateStr}.json`;
      if (typeof chrome !== 'undefined' && chrome.downloads) {
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({ url, filename, saveAs: true }, (downloadId) => {
          URL.revokeObjectURL(url);
          if (chrome.runtime.lastError) {
            showNotification('Export failed: ' + chrome.runtime.lastError.message, 'error');
          } else {
            showNotification('Backup exported successfully', 'success');
          }
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Backup exported successfully', 'success');
      }
    } catch (error) {
      showNotification('Export failed: ' + error.message, 'error');
    }
  }

  function exportBackup() {
    openExportOptionsModal();
  }

  function confirmExportOptions() {
    const includeCustomization = exportOptionsModal.querySelector('input[name="exportOption"]:checked')?.value === 'full';
    closeExportOptionsModal();
    performExport(includeCustomization);
  }

  function validateBackup(data) {
    if (!data || typeof data !== 'object') return { valid: false, error: 'Invalid backup file format.' };
    if (typeof data.version !== 'number') return { valid: false, error: 'Unsupported backup format (missing version).' };
    if (data.version > BACKUP_VERSION) return { valid: false, error: `Backup version ${data.version} is newer than supported (${BACKUP_VERSION}). Please update LinkBoard.` };
    if (!Array.isArray(data.tabs)) return { valid: false, error: 'Backup is missing tabs data.' };
    if (data.tabs.length === 0) return { valid: false, error: 'Backup contains no tabs.' };
    const hasHomeTab = data.tabs.some((tab) => tab && tab.id === 'tab-home');
    if (!hasHomeTab) return { valid: false, error: 'Backup is missing the required Home tab.' };
    for (const tab of data.tabs) {
      if (!tab || typeof tab.id !== 'string' || typeof tab.name !== 'string') return { valid: false, error: 'Invalid tab data in backup.' };
      if (!Array.isArray(tab.boards)) return { valid: false, error: 'Invalid boards data in backup.' };
      for (const board of tab.boards) {
        if (!board || typeof board.id !== 'string' || typeof board.name !== 'string') return { valid: false, error: 'Invalid board data in backup.' };
        if (!columns.includes(String(board.columnId))) return { valid: false, error: 'Invalid column ID in backup.' };
        if (!Array.isArray(board.links)) return { valid: false, error: 'Invalid links data in backup.' };
        for (const link of board.links) {
          if (!link || typeof link.id !== 'string' || typeof link.name !== 'string' || typeof link.url !== 'string') return { valid: false, error: 'Invalid link data in backup.' };
          try { new URL(link.url); } catch { return { valid: false, error: 'Invalid URL in backup.' }; }
        }
      }
    }
    return { valid: true };
  }

  function generateIdMap(items, prefix) {
    const map = new Map();
    for (const item of items) {
      map.set(item.id, makeId(prefix));
    }
    return map;
  }

  function normalizeTabName(name) {
    return String(name).trim().toLowerCase();
  }

  function resolveTabNameConflicts(existingNames, importedTabs) {
    const usedNames = new Set(existingNames);
    const resolvedTabs = [];

    for (const tab of importedTabs) {
      let baseName = tab.name.trim();
      let candidateName = baseName;
      let suffix = 0;

      while (usedNames.has(normalizeTabName(candidateName))) {
        suffix++;
        candidateName = `${baseName} ${suffix}`;
      }

      usedNames.add(normalizeTabName(candidateName));
      resolvedTabs.push({ ...tab, name: candidateName });
    }

    return resolvedTabs;
  }

  async function importBackup(backupData, mode) {
    const validation = validateBackup(backupData);
    if (!validation.valid) throw new Error(validation.error);

    let importedTabs = backupData.tabs.map((tab) => ({
      ...tab,
      boards: tab.boards.map((board) => ({ ...board }))
    }));

    const hasCustomizationData = backupData.themeId !== undefined || backupData.background !== undefined || backupData.displaySettings !== undefined;

    if (mode === 'replace') {
      importedTabs = resolveTabNameConflicts(new Set(), importedTabs);
      const homeTab = importedTabs.find((t) => t.id === 'tab-home');
      if (!homeTab) throw new Error('Backup must contain a Home tab.');
      state.tabs = [homeTab, ...importedTabs.filter((t) => t.id !== 'tab-home')];
      state.activeTabId = findTab(backupData.activeTabId)?.id || 'tab-home';

      if (hasCustomizationData) {
        if (backupData.themeId) state.themeId = backupData.themeId;
        if (backupData.customThemeColor) state.customThemeColor = backupData.customThemeColor;
        if (backupData.customThemeMode) state.customThemeMode = backupData.customThemeMode;
        if (backupData.customGradientColor1) state.customGradientColor1 = backupData.customGradientColor1;
        if (backupData.customGradientColor2) state.customGradientColor2 = backupData.customGradientColor2;
        if (backupData.customGradientType) state.customGradientType = backupData.customGradientType;
        if (backupData.customGradientDirection) state.customGradientDirection = backupData.customGradientDirection;

        if (backupData.background) {
          const bg = { ...backupData.background };
          const hadCustomBackground = state.savedBackground.backgroundMode === 'custom' && state.savedBackground.imageId;
          if (bg.backgroundMode === 'custom' && bg.imageId) {
            delete bg.imageId;
            delete bg.imageData;
          }
          state.savedBackground = normalizeBackground({ background: bg });
          if (hadCustomBackground && bg.backgroundMode !== 'custom') {
            state.savedBackground.backgroundMode = 'custom';
            state.savedBackground.imageId = state.savedBackground.imageId;
          }
        }
        if (backupData.displaySettings) state.savedDisplaySettings = { ...backupData.displaySettings };
      }
    } else {
      const existingNames = new Set(state.tabs.map((t) => normalizeTabName(t.name)));
      importedTabs = resolveTabNameConflicts(existingNames, importedTabs);

      const existingTabIds = new Set(state.tabs.map((t) => t.id));
      const existingBoardIds = new Set(state.tabs.flatMap((t) => t.boards.map((b) => b.id)));
      const existingLinkIds = new Set(state.tabs.flatMap((t) => t.boards.flatMap((b) => b.links.map((l) => l.id))));

      const tabIdMap = new Map();
      for (const tab of importedTabs) {
        let newTabId = tab.id;
        if (existingTabIds.has(tab.id) || tabIdMap.has(tab.id)) {
          newTabId = makeId('tab');
        }
        tabIdMap.set(tab.id, newTabId);
        existingTabIds.add(newTabId);
      }

      for (const tab of importedTabs) {
        const newTabId = tabIdMap.get(tab.id);
        const boardIdMap = new Map();
        for (const board of tab.boards) {
          let newBoardId = board.id;
          if (existingBoardIds.has(board.id) || boardIdMap.has(board.id)) {
            newBoardId = makeId('board');
          }
          boardIdMap.set(board.id, newBoardId);
          existingBoardIds.add(newBoardId);

          const linkIdMap = new Map();
          for (const link of board.links) {
            let newLinkId = link.id;
            if (existingLinkIds.has(link.id) || linkIdMap.has(link.id)) {
              newLinkId = makeId('link');
            }
            linkIdMap.set(link.id, newLinkId);
            existingLinkIds.add(newLinkId);
          }
          board.links = board.links.map((link) => ({ ...link, id: linkIdMap.get(link.id) }));
          board.id = boardIdMap.get(board.id);
        }
        tab.id = newTabId;
        tab.boards = tab.boards.map((board) => ({ ...board }));
      }

      state.tabs.push(...importedTabs);
    }

    if (mode === 'replace' && hasCustomizationData) {
      applyTheme(state.themeId, state.customThemeColor, state.customThemeMode, state.customGradientColor1, state.customGradientColor2);
      applyDisplaySettings(state.savedDisplaySettings);
    }
    renderTabs();
    renderColumns();
    saveData();
  }

  function renderImportPreview(backupData) {
    const tabCount = backupData.tabs.length;
    const boardCount = backupData.tabs.reduce((sum, tab) => sum + tab.boards.length, 0);
    const linkCount = backupData.tabs.reduce((sum, tab) => sum + tab.boards.reduce((s, b) => s + b.links.length, 0), 0);
    const exportDate = backupData.exportedAt ? new Date(backupData.exportedAt).toLocaleString() : 'Unknown';
    const version = backupData.version || 'Unknown';

    importPreview.innerHTML = `
      <h4>Import Preview</h4>
      <div class="import-preview-stats">
        <div><strong>${tabCount}</strong> tab${tabCount !== 1 ? 's' : ''}</div>
        <div><strong>${boardCount}</strong> board${boardCount !== 1 ? 's' : ''}</div>
        <div><strong>${linkCount}</strong> link${linkCount !== 1 ? 's' : ''}</div>
      </div>
      <div class="import-preview-meta">
        <small>Exported: ${escapeHtml(exportDate)}</small>
        <small>Format version: ${escapeHtml(String(version))}</small>
      </div>
      <ul class="import-preview-tabs">
        ${backupData.tabs.map((tab) => `<li>${escapeHtml(tab.name)} (${tab.boards.length} boards)</li>`).join('')}
      </ul>
    `;
    importPreview.hidden = false;
  }

  function openImportModal() {
    closeSettings();
    importFileInput.value = '';
    importError.textContent = '';
    importPreview.hidden = true;
    importPreview.innerHTML = '';
    importModal.querySelector('[data-import-action="confirm"]').disabled = true;
    importModal.querySelector('input[name="importMode"][value="merge"]').checked = true;
    importModal.querySelector('.import-options').hidden = true;
    importModal.hidden = false;
    importFileInput.focus();
  }

  function closeImportModal() {
    importModal.hidden = true;
    importFileInput.value = '';
    importError.textContent = '';
    importPreview.hidden = true;
    importPreview.innerHTML = '';
  }

  function handleImportFile(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      importError.textContent = 'File too large. Maximum size is 10 MB.';
      return;
    }
    if (!file.name.endsWith('.json')) {
      importError.textContent = 'Please select a JSON file.';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const validation = validateBackup(data);
        if (!validation.valid) {
          importError.textContent = validation.error;
          return;
        }
        importError.textContent = '';
        renderImportPreview(data);
        importModal.querySelector('.import-options').hidden = false;
        importModal.querySelector('[data-import-action="confirm"]').disabled = false;
        importModal.dataset.backupData = JSON.stringify(data);
      } catch {
        importError.textContent = 'Invalid JSON file.';
      }
    };
    reader.onerror = () => {
      importError.textContent = 'Failed to read file.';
    };
    reader.readAsText(file);
  }

  async function confirmImport() {
    try {
      const backupData = JSON.parse(importModal.dataset.backupData || '{}');
      const mode = importModal.querySelector('input[name="importMode"]:checked')?.value || 'merge';
      if (mode === 'replace') {
        if (!confirm('This will replace ALL your current tabs, boards, and links with the imported data. This cannot be undone. Continue?')) {
          return;
        }
      }
      await importBackup(backupData, mode);
      showNotification(mode === 'replace' ? 'Workspace replaced with backup' : 'Backup imported and merged', 'success');
      closeImportModal();
    } catch (error) {
      importError.textContent = error.message;
    }
  }

  function resetAllData() {
    if (!confirm('This will permanently delete ALL tabs, boards, and links, and reset settings to defaults. This cannot be undone. Continue?')) {
      return;
    }
    if (!confirm('Are you absolutely sure? All your data will be lost.')) {
      return;
    }
    state.tabs = [{
      id: 'tab-home',
      name: 'Home',
      boards: []
    }];
    state.activeTabId = 'tab-home';
    state.themeId = 'dark';
    state.customThemeColor = '#6366f1';
    state.customThemeMode = 'solid';
    state.customGradientColor1 = '#6366f1';
    state.customGradientColor2 = '#8b5cf6';
    state.customGradientType = 'linear';
    state.customGradientDirection = '135deg';
    state.savedBackground = { backgroundMode: 'theme', imageId: null, imageRemoved: false, opacity: 82, darkness: 35, blur: 0, size: 'cover', position: 'center' };
    state.savedDisplaySettings = { ...defaultDisplaySettings };
    applyTheme(state.themeId, state.customThemeColor, state.customThemeMode, state.customGradientColor1, state.customGradientColor2);
    applyDisplaySettings(state.savedDisplaySettings);
    renderTabs();
    renderColumns();
    saveData();
    showNotification('All data has been reset', 'success');
  }

  function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function searchData(query) {
    const term = query.trim().toLowerCase();
    const results = { links: [], boards: [], tabs: [] };
    if (!term) return results;
    state.tabs.forEach((tab) => {
      if (tab.name.toLowerCase().includes(term)) results.tabs.push(tab);
      tab.boards.forEach((board) => {
        if (board.name.toLowerCase().includes(term)) results.boards.push({ tab, board });
        board.links.forEach((link) => {
          const searchable = [link.name, link.domain, link.url, link.description || ''].join(' ').toLowerCase();
          if (searchable.includes(term)) results.links.push({ tab, board, link });
        });
      });
    });
    return results;
  }

  function renderSearchResults() {
    const query = searchInput.value.trim();
    if (!query) {
      searchResults.innerHTML = '<p class="search-hint">Type to search across all tabs, boards, and links.</p>';
      return;
    }
    const results = searchData(query);
    const total = results.links.length + results.boards.length + results.tabs.length;
    if (!total) { searchResults.innerHTML = `<p class="search-hint">No results for "${escapeHtml(query)}"</p>`; return; }
    const links = results.links.map(({ tab, board, link }) => `<button class="search-result" data-result-type="link" data-tab-id="${tab.id}" data-board-id="${board.id}" data-link-id="${link.id}"><span class="site-icon favicon-slot">${faviconMarkup(link)}</span><span><strong>${escapeHtml(link.name)}</strong><small>${escapeHtml(link.domain)} · ${escapeHtml(board.name)} · ${escapeHtml(tab.name)}</small></span></button>`).join('');
    const boards = results.boards.map(({ tab, board }) => `<button class="search-result" data-result-type="board" data-tab-id="${tab.id}" data-board-id="${board.id}"><span class="board-result-icon">${escapeHtml(board.icon)}</span><span><strong>${escapeHtml(board.name)}</strong><small>${escapeHtml(tab.name)} · ${board.links.length} links</small></span></button>`).join('');
    const tabs = results.tabs.map((tab) => `<button class="search-result" data-result-type="tab" data-tab-id="${tab.id}"><span class="board-result-icon">🗂️</span><span><strong>${escapeHtml(tab.name)}</strong><small>${tab.boards.length} boards</small></span></button>`).join('');
    searchResults.innerHTML = `${links ? `<section class="search-section"><label>Links</label>${links}</section>` : ''}${boards ? `<section class="search-section"><label>Boards</label>${boards}</section>` : ''}${tabs ? `<section class="search-section"><label>Tabs</label>${tabs}</section>` : ''}`;
  }

  function openSearch() {
    searchModal.classList.add('show');
    searchModal.style.display = 'block';
    searchModal.setAttribute('aria-hidden', 'false');
    searchInput.focus();
    renderSearchResults();
  }

  function closeSearch() {
    searchModal.classList.remove('show');
    searchModal.style.display = 'none';
    searchModal.setAttribute('aria-hidden', 'true');
  }

  function openSettings() {
    setSettingsPanel('theme');
    beginBackgroundEdit();
    beginDisplayEdit();
    settingsModal.classList.add('show');
    settingsModal.style.display = 'block';
    settingsModal.setAttribute('aria-hidden', 'false');
  }

  function closeSettings() {
    discardBackgroundChanges();
    discardDisplayChanges();
    settingsModal.classList.remove('show');
    settingsModal.style.display = 'none';
    settingsModal.setAttribute('aria-hidden', 'true');
  }

  function setSettingsPanel(panelId) {
    settingsNavItems.forEach((item) => {
      const active = item.dataset.settingsTab === panelId;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    settingsPanels.forEach((panel) => {
      const active = panel.dataset.settingsPanel === panelId;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  }

  const themePalettes = {
    dark: { bg: '#07080d', surface: '#0d0f16', surface2: '#131620', surface3: '#1a1e2c', surfaceHover: '#1a1f33', borderBase: 'rgba(255,255,255,.065)', borderStrong: 'rgba(255,255,255,.11)', accent: '#6366f1', accentHover: '#818cf8', accentActive: '#4f46e5', accentText: '#ffffff', hover: '#818cf8', light: '#a5b4fc', dark: '#4f46e5', border: 'rgba(99,102,241,.28)', glow: 'rgba(99,102,241,.28)', glow1: '#07080d', glow2: '#07080d', glow3: '#07080d', glow4: '#07080d', text: '#dde1ef', textMuted: '#697188', textSubtle: '#3b4156', shadow: '0 8px 32px rgba(0,0,0,.6)' },
    light: { bg: '#f1f5f9', surface: '#ffffff', surface2: '#f8fafc', surface3: '#e2e8f0', surfaceHover: '#f1f5f9', borderBase: 'rgba(15,23,42,.12)', borderStrong: 'rgba(15,23,42,.18)', accent: '#6366f1', accentHover: '#4f46e5', accentActive: '#4338ca', accentText: '#ffffff', hover: '#4f46e5', light: '#6366f1', dark: '#4338ca', border: 'rgba(99,102,241,.2)', glow: 'rgba(99,102,241,.08)', glow1: '#e0e7ff', glow2: '#ddd6fe', glow3: '#c7d2fe', glow4: '#a5b4fc', text: '#0f172a', textMuted: '#64748b', textSubtle: '#94a3b8', shadow: '0 1px 3px rgba(15,23,42,.08), 0 4px 12px rgba(15,23,42,.06)' },
  };

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }
  function mixHex(hex, mixHexColor, weight) {
    const a = hexToRgb(hex), b = hexToRgb(mixHexColor);
    return rgbToHex(a.r + (b.r - a.r) * weight, a.g + (b.g - a.g) * weight, a.b + (b.b - a.b) * weight);
  }
  function getRelativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const toLinear = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }
  function getContrastRatio(l1, l2) {
    const a = Math.max(l1, l2), b = Math.min(l1, l2);
    return (a + 0.05) / (b + 0.05);
  }
  function getLuminance(hex) {
    return getRelativeLuminance(hex);
  }
  function getContrastText(bgHex) {
    const Lbg = getRelativeLuminance(bgHex);
    const Ld = getRelativeLuminance('#0f172a');
    const Ll = getRelativeLuminance('#ffffff');
    const Cd = getContrastRatio(Lbg, Ld);
    const Cl = getContrastRatio(Lbg, Ll);
    return Cd >= Cl ? '#0f172a' : '#ffffff';
  }
  function getAccentHover(accentHex) {
    const L = getRelativeLuminance(accentHex);
    const Ld = getRelativeLuminance('#0f172a');
    const Ll = getRelativeLuminance('#ffffff');
    const isLight = getContrastRatio(L, Ld) > getContrastRatio(L, Ll);
    return isLight ? mixHex(accentHex, '#000000', 0.10) : mixHex(accentHex, '#ffffff', 0.14);
  }
  function getAccentActive(accentHex) {
    const L = getRelativeLuminance(accentHex);
    const Ld = getRelativeLuminance('#0f172a');
    const Ll = getRelativeLuminance('#ffffff');
    const isLight = getContrastRatio(L, Ld) > getContrastRatio(L, Ll);
    return isLight ? mixHex(accentHex, '#000000', 0.18) : mixHex(accentHex, '#ffffff', 0.08);
  }
  function adjustLight(hex, amount) {
    return amount >= 0 ? mixHex(hex, '#ffffff', amount) : mixHex(hex, '#000000', -amount);
  }

  function solidPalette(color) {
    // CORE RULE: bg is EXACTLY the user's selected color – never modified for contrast.
    // Only foreground/text colors adapt via WCAG relative luminance.
    const accent = color.toLowerCase();
    const bg = accent;
    const Lbg = getRelativeLuminance(bg);
    const Ld = getRelativeLuminance('#0f172a');
    const Ll = getRelativeLuminance('#ffffff');
    const Cd = getContrastRatio(Lbg, Ld);
    const Cl = getContrastRatio(Lbg, Ll);
    const isLight = Cd > Cl;
    // Foreground: choose whichever (dark #0f172a or light #ffffff) gives higher contrast with the EXACT bg
    const text = isLight ? '#0f172a' : '#ffffff';
    const accentText = text;
    // Secondary foregrounds: derive from the chosen text, keep contrast above thresholds
    // Uses contrast-aware mixing with bg only to create hierarchy, never modifies bg itself
    const bestMix = (baseText, bgHex, threshold) => {
      const ratios = [0.15, 0.20, 0.25, 0.30, 0.35, 0.42, 0.48, 0.55];
      let best = baseText;
      for (const w of ratios) {
        const cand = mixHex(baseText, bgHex, w);
        const cr = getContrastRatio(getRelativeLuminance(bgHex), getRelativeLuminance(cand));
        if (cr >= threshold) best = cand;
        else break;
      }
      return best;
    };
    const textMuted = bestMix(text, bg, 3.2);
    const textSubtle = bestMix(text, bg, 2.3);
    // Backgrounds/surfaces/borders/shadows: preserved original design, NOT contrast-corrected
    // They are layered tints of the EXACT bg for visual hierarchy, not a "better" bg
    const surface = isLight ? mixHex(bg, '#ffffff', 0.92) : mixHex(bg, '#ffffff', 0.06);
    const surface2 = isLight ? mixHex(bg, '#ffffff', 0.76) : mixHex(bg, '#ffffff', 0.10);
    const surface3 = isLight ? mixHex(bg, '#ffffff', 0.60) : mixHex(bg, '#ffffff', 0.14);
    const surfaceStrong = isLight ? '#ffffff' : mixHex(bg, '#ffffff', 0.08);
    const surfaceHover = isLight ? mixHex(surface, '#000000', 0.03) : mixHex(surface, '#ffffff', 0.06);
    const borderBase = isLight ? 'rgba(15,23,42,.10)' : 'rgba(255,255,255,.08)';
    const borderStrong = isLight ? 'rgba(15,23,42,.16)' : 'rgba(255,255,255,.14)';
    const shadow = isLight ? '0 1px 3px rgba(15,23,42,.08), 0 4px 12px rgba(15,23,42,.06)' : '0 8px 32px rgba(0,0,0,.45)';
    const light = adjustLight(accent, 0.22);
    const dark = adjustLight(accent, -0.22);
    // Button hover/active keep original subtle shift (design), not a contrast-driven bg correction
    const accentHover = getAccentHover(accent);
    const accentActive = getAccentActive(accent);
    return { bg, surface, surface2, surface3, surfaceStrong, surfaceHover, accent, accentHover, accentActive, accentText, hover: accentHover, light, dark, border: isLight ? 'rgba(15,23,42,.12)' : accent + '3d', borderBase, borderStrong, glow: accent + '26', glow1: bg, glow2: bg, glow3: bg, glow4: bg, text, textMuted, textSubtle, shadow };
  }

  function gradientPalette(color1, color2, type = state.customGradientType, direction = state.customGradientDirection) {
    const c1 = color1.toLowerCase(), c2 = color2.toLowerCase();
    const t = type === 'radial' ? 'radial' : 'linear';
    const dir = /^(\d+deg|to\s.+)$/.test(direction) ? direction : '135deg';
    const accent = c1;
    const accentText = getContrastText(accent);
    const accentHover = getAccentHover(accent);
    const accentActive = getAccentActive(accent);
    const bg = '#07080d';
    const text = '#dde1ef', textMuted = '#9aa0b8', textSubtle = '#5a627a';
    const surface = 'rgba(13,15,22,.88)';
    const surface2 = 'rgba(22,26,40,.92)';
    const surface3 = 'rgba(30,35,55,.95)';
    const surfaceStrong = 'rgba(16,19,30,.94)';
    const surfaceHover = 'rgba(30,38,65,.96)';
    const borderBase = 'rgba(255,255,255,.07)';
    const borderStrong = 'rgba(255,255,255,.13)';
    const shadow = '0 14px 42px rgba(0,0,0,.45)';
    const gradientBg = t === 'radial' ? `radial-gradient(circle at center, ${c1} 0%, ${c2} 100%)` : `linear-gradient(${dir}, ${c1} 0%, ${c2} 100%)`;
    return { bg, surface, surface2, surface3, surfaceStrong, surfaceHover, accent, accentHover, accentActive, accentText, hover: accentHover, light: adjustLight(c1, 0.22), dark: adjustLight(c1, -0.22), border: c1 + '3d', borderBase, borderStrong, glow: c1 + '26', glow1: c1, glow2: c2, glow3: c1, glow4: c2, text, textMuted, textSubtle, shadow, gradientBg };
  }

  function customPalette(color) { return solidPalette(color); }

  function applyTheme(themeId = state.themeId, customColor = state.customThemeColor, mode = state.customThemeMode, g1 = state.customGradientColor1, g2 = state.customGradientColor2, gType = state.customGradientType, gDir = state.customGradientDirection) {
    const legacyMap = { original: 'dark', aurora: 'dark', cyber: 'dark', liquid: 'dark', cosmic: 'dark' };
    if (legacyMap[themeId]) themeId = legacyMap[themeId];
    if (themeId !== 'dark' && themeId !== 'light' && themeId !== 'custom') themeId = 'dark';
    let palette;
    let gradientCss = null;
    if (themeId === 'custom') {
      const m = mode === 'gradient' ? 'gradient' : 'solid';
      state.customThemeMode = m;
      if (m === 'gradient') {
        if (!validColor(g1) || !validColor(g2)) return;
        const nt = gType === 'radial' ? 'radial' : 'linear';
        const nd = /^(\d+deg|to\s.+)$/.test(gDir) ? gDir : '135deg';
        state.customGradientType = nt;
        state.customGradientDirection = nd;
        palette = gradientPalette(g1, g2, nt, nd);
        gradientCss = palette.gradientBg;
        state.customGradientColor1 = g1.toLowerCase();
        state.customGradientColor2 = g2.toLowerCase();
      } else {
        if (!validColor(customColor)) return;
        palette = solidPalette(customColor);
        state.customThemeColor = customColor.toLowerCase();
      }
    } else {
      palette = themePalettes[themeId] || themePalettes.dark;
    }
    const root = document.documentElement;
    const vars = {
      '--theme-bg': palette.bg,
      '--theme-surface': palette.surface,
      '--theme-surface-strong': palette.surfaceStrong || palette.surface,
      '--theme-surface-secondary': palette.surface2,
      '--theme-surface-tertiary': palette.surface3,
      '--theme-surface-hover': palette.surfaceHover || palette.surface2,
      '--theme-text': palette.text,
      '--theme-text-secondary': palette.textMuted,
      '--theme-text-tertiary': palette.textSubtle,
      '--theme-border': palette.borderBase || palette.border,
      '--theme-border-strong': palette.borderStrong || palette.border,
      '--theme-accent': palette.accent,
      '--theme-accent-hover': palette.accentHover || palette.hover,
      '--theme-accent-active': palette.accentActive || palette.dark,
      '--theme-accent-text': palette.accentText || getContrastText(palette.accent),
      '--theme-accent-dim': `${palette.accent}1a`,
      '--theme-accent-border': palette.border,
      '--theme-icon': palette.textMuted,
      '--theme-input-bg': palette.surface2,
      '--theme-input-text': palette.text,
      '--theme-overlay': 'rgba(0,0,0,.7)',
      '--theme-glow-1': palette.glow1,
      '--theme-glow-2': palette.glow2,
      '--theme-glow-3': palette.glow3,
      '--theme-glow-4': palette.glow4,
      '--theme-border': palette.border,
      '--bg': palette.bg,
      '--surface': palette.surface,
      '--surface-2': palette.surface2,
      '--surface-3': palette.surface3,
      '--surface-hover': palette.surfaceHover || palette.surface2,
      '--border': palette.borderBase || palette.border,
      '--border-strong': palette.borderStrong || palette.border,
      '--surface-strong': palette.surfaceStrong || palette.surface,
      '--text': palette.text,
      '--text-muted': palette.textMuted,
      '--text-subtle': palette.textSubtle,
      '--shadow': palette.shadow,
      '--accent': palette.accent,
      '--accent-hover': palette.accentHover || palette.hover,
      '--accent-active': palette.accentActive || palette.dark,
      '--accent-text': palette.accentText || getContrastText(palette.accent),
      '--accent-light': palette.light,
      '--accent-dark': palette.dark,
      '--accent-dim': `${palette.accent}1a`,
      '--accent-border': palette.border,
      '--accent-glow': palette.glow || palette.border
    };
    Object.entries(vars).forEach(([name, value]) => root.style.setProperty(name, value));
    if (themeId === 'custom' && state.customThemeMode === 'gradient' && gradientCss) {
      root.style.setProperty('--custom-gradient', gradientCss);
      document.body.style.backgroundImage = gradientCss;
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundSize = 'cover';
    } else {
      root.style.removeProperty('--custom-gradient');
      document.body.style.backgroundImage = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.backgroundSize = '';
    }
    document.body.dataset.theme = themeId;
    if (themeId === 'custom') document.body.dataset.customMode = state.customThemeMode;
    else delete document.body.dataset.customMode;
    state.themeId = themeId;
    if (customThemeColor) customThemeColor.value = state.customThemeColor;
    const cg1 = document.querySelector('#customGradientColor1');
    const cg2 = document.querySelector('#customGradientColor2');
    if (cg1) cg1.value = state.customGradientColor1;
    if (cg2) cg2.value = state.customGradientColor2;
    const solidRadio = document.querySelector('input[name=\"customThemeMode\"][value=\"solid\"]');
    const gradientRadio = document.querySelector('input[name=\"customThemeMode\"][value=\"gradient\"]');
    if (solidRadio) solidRadio.checked = state.customThemeMode === 'solid';
    if (gradientRadio) gradientRadio.checked = state.customThemeMode === 'gradient';
    document.querySelectorAll('.custom-mode-card').forEach(c => {
      const isSelected = c.dataset.mode === state.customThemeMode;
      c.classList.toggle('selected', isSelected && themeId === 'custom');
      c.setAttribute('aria-checked', String(isSelected));
    });
    const solidControls = document.querySelector('#solidColorControls');
    const gradientControls = document.querySelector('#gradientColorControls');
    if (solidControls) solidControls.hidden = state.customThemeMode !== 'solid' || themeId !== 'custom';
    if (gradientControls) gradientControls.hidden = state.customThemeMode !== 'gradient' || themeId !== 'custom';
    const customRow = document.querySelector('#customThemeRow');
    if (customRow) customRow.hidden = themeId !== 'custom';
    const solidPreview = document.querySelector('#solidPreview');
    const solidHex = document.querySelector('#solidHex');
    if (solidPreview) solidPreview.style.background = state.customThemeColor;
    if (solidHex) solidHex.textContent = state.customThemeColor;
    const gradPreview1 = document.querySelector('#gradPreview1');
    const gradPreview2 = document.querySelector('#gradPreview2');
    const gradHex1 = document.querySelector('#gradHex1');
    const gradHex2 = document.querySelector('#gradHex2');
    const gradLive = document.querySelector('#gradientLivePreview');
    const gradLarge = document.querySelector('#gradientPreviewLarge');
    const effectiveGradient = gradientCss || (state.customGradientType === 'radial' ? `radial-gradient(circle at center, ${state.customGradientColor1} 0%, ${state.customGradientColor2} 100%)` : `linear-gradient(${state.customGradientDirection}, ${state.customGradientColor1} 0%, ${state.customGradientColor2} 100%)`);
    if (gradPreview1) gradPreview1.style.background = state.customGradientColor1;
    if (gradPreview2) gradPreview2.style.background = state.customGradientColor2;
    if (gradHex1) gradHex1.textContent = state.customGradientColor1;
    if (gradHex2) gradHex2.textContent = state.customGradientColor2;
    if (gradLive) gradLive.style.background = effectiveGradient;
    if (gradLarge) gradLarge.style.background = effectiveGradient;
    // sync segmented type
    document.querySelectorAll('[data-gradient-type]').forEach(btn => {
      const sel = btn.dataset.gradientType === state.customGradientType;
      btn.classList.toggle('selected', sel);
      btn.setAttribute('aria-checked', String(sel));
    });
    // sync direction grid
    const dirSection = document.querySelector('#gradientDirectionSection');
    const isRadial = state.customGradientType === 'radial';
    if (dirSection) dirSection.classList.toggle('is-disabled', isRadial);
    document.querySelectorAll('.dir-btn[data-dir]').forEach(btn => {
      if (btn.dataset.dir === 'center') return;
      const sel = !isRadial && btn.dataset.dir === state.customGradientDirection;
      btn.classList.toggle('selected', sel);
      btn.disabled = isRadial;
      btn.setAttribute('aria-checked', String(sel));
    });
    // sync presets selected state (exact match)
    document.querySelectorAll('.preset-btn').forEach(btn => {
      const p = btn.dataset.preset;
      const map = { midnight:['#0a0f1e','#1e3a5f'], ocean:['#0f2b46','#1e9bd3'], aurora:['#4c1d95','#0e7490'], sunset:['#7c2d12','#be185d'], ember:['#7f1d1d','#c2410c'], arctic:['#1e3a5f','#e0f2fe'], violet:['#4c1d95','#86198f'], forest:['#064e3b','#0e7490'] }[p];
      if (map) {
        const match = map[0].toLowerCase()===state.customGradientColor1.toLowerCase() && map[1].toLowerCase()===state.customGradientColor2.toLowerCase();
        btn.classList.toggle('selected', match);
      }
    });
    themeCards.forEach((card) => card.classList.toggle('selected', card.dataset.themeId === state.themeId));
  }

  function setBackgroundError(message = '') {
    backgroundError.textContent = message;
  }

  function updateSettingsActionState() {
    const dirty = state.backgroundDirty || state.displayDirty;
    saveBackgroundButton.disabled = !dirty;
    discardBackgroundButton.disabled = !dirty;
    saveDisplayButton.disabled = !state.displayDirty;
    discardDisplayButton.disabled = !state.displayDirty;
  }

  function applyDisplaySettings(settings) {
    document.documentElement.style.setProperty('--link-icon-size', `${settings.linkIconSize}px`);
    document.documentElement.style.setProperty('--link-title-size', `${settings.linkTitleSize}px`);
    document.documentElement.style.setProperty('--link-description-size', `${settings.linkDescriptionSize}px`);
  }

  function renderDisplayPreview(settings) {
    linkIconSize.value = settings.linkIconSize;
    linkTitleSize.value = settings.linkTitleSize;
    linkDescriptionSize.value = settings.linkDescriptionSize;
    linkIconSizeValue.textContent = `${settings.linkIconSize}px`;
    linkTitleSizeValue.textContent = `${settings.linkTitleSize}px`;
    linkDescriptionSizeValue.textContent = `${settings.linkDescriptionSize}px`;
    displayPreview.style.setProperty('--preview-icon-size', `${settings.linkIconSize}px`);
    displayPreview.style.setProperty('--preview-title-size', `${settings.linkTitleSize}px`);
    displayPreview.style.setProperty('--preview-description-size', `${settings.linkDescriptionSize}px`);
  }

  function beginDisplayEdit() {
    pendingDisplaySettings = { ...state.savedDisplaySettings };
    state.displayDirty = false;
    renderDisplayPreview(pendingDisplaySettings);
    updateSettingsActionState();
  }

  function discardDisplayChanges() {
    pendingDisplaySettings = { ...state.savedDisplaySettings };
    state.displayDirty = false;
    renderDisplayPreview(pendingDisplaySettings);
    applyDisplaySettings(state.savedDisplaySettings);
    updateSettingsActionState();
  }

  function updateBackgroundControls() {
    const settings = pendingBackground || state.savedBackground;
    customBackgroundControls.hidden = false;
    backgroundOpacity.value = settings.opacity;
    backgroundDarkness.value = settings.darkness;
    backgroundBlur.value = settings.blur;
    backgroundSize.value = settings.size;
    backgroundOpacityValue.textContent = `${settings.opacity}%`;
    backgroundDarknessValue.textContent = `${settings.darkness}%`;
    backgroundBlurValue.textContent = `${settings.blur}px`;
    updateSettingsActionState();
    removeBackgroundButtons.forEach((button) => { button.disabled = !pendingBackgroundImageId; });
  }

  function renderBackgroundSurface(surface, overlay, active, settings, objectUrl) {
    surface.style.backgroundImage = active ? `url("${objectUrl}")` : 'none';
    surface.style.backgroundSize = settings.size;
    surface.style.backgroundPosition = settings.position;
    surface.style.opacity = active ? String(settings.opacity / 100) : '0';
    surface.style.filter = `blur(${settings.blur}px)`;
    surface.style.transform = settings.blur ? `scale(${1 + settings.blur / 100})` : 'none';
    overlay.style.opacity = active ? String(settings.darkness / 100) : '0';
  }

  async function loadImageFromIndexedDB(imageId) {
    if (!imageId) return null;
    const blob = await backgroundDbRequest('readonly', 'get', undefined, imageId);
    return blob instanceof Blob && blob.size ? blob : null;
  }

  async function applyBackground(savedBackground) {
    const token = ++backgroundApplyToken;
    document.body.dataset.backgroundMode = savedBackground.backgroundMode;
    if (savedBackground.backgroundMode !== 'custom' || !savedBackground.imageId) {
      if (activeBackgroundObjectUrl) URL.revokeObjectURL(activeBackgroundObjectUrl);
      activeBackgroundObjectUrl = null;
      renderBackgroundSurface(backgroundLayer, backgroundOverlay, false, savedBackground, null);
      return;
    }
    try {
      const blob = await loadImageFromIndexedDB(savedBackground.imageId);
      if (token !== backgroundApplyToken) return;
      if (!blob) { renderBackgroundSurface(backgroundLayer, backgroundOverlay, false, savedBackground, null); return; }
      const url = URL.createObjectURL(blob);
      if (activeBackgroundObjectUrl) URL.revokeObjectURL(activeBackgroundObjectUrl);
      activeBackgroundObjectUrl = url;
      renderBackgroundSurface(backgroundLayer, backgroundOverlay, true, savedBackground, url);
    } catch {
      if (token === backgroundApplyToken) renderBackgroundSurface(backgroundLayer, backgroundOverlay, false, savedBackground, null);
    }
  }

  function renderBackgroundPreview(pending) {
    updateBackgroundControls();
    const hasImage = pending.imageId && pendingBackgroundObjectUrl;
    backgroundPreview.hidden = !hasImage;
    backgroundUpload.hidden = Boolean(hasImage);
    const pageHasCustomImage = pending.backgroundMode === 'custom' && pending.imageId;
    backgroundOverlay.style.opacity = pageHasCustomImage ? String(pending.darkness / 100) : '0';
    if (hasImage) renderBackgroundSurface(backgroundPreviewImage, backgroundPreviewOverlay, true, pending, pendingBackgroundObjectUrl);
  }

  function markBackgroundDirty() {
    state.backgroundDirty = Boolean(pendingBackground && JSON.stringify(pendingBackground) !== JSON.stringify(state.savedBackground));
    saveBackgroundButton.textContent = 'Save Changes';
    updateBackgroundControls();
  }

  async function saveBackgroundChanges() {
    const pending = pendingBackground || { ...state.savedBackground };
    const oldImageId = state.savedBackground.imageId;
    const next = pending.imageRemoved ? { ...pending, backgroundMode: 'theme', imageId: null, imageRemoved: false } : { ...pending, imageRemoved: false };
    try {
      const image = next.backgroundMode === 'custom' ? await loadImageFromIndexedDB(next.imageId) : null;
      if (next.backgroundMode === 'custom' && !image) throw new Error('Choose a valid background image before saving.');
      const saved = await saveData(next);
      if (!saved) throw new Error('Changes could not be saved locally.');
      if (oldImageId && oldImageId !== next.imageId) await backgroundDbRequest('readwrite', 'delete', undefined, oldImageId);
      if (next.imageId !== 'background') await backgroundDbRequest('readwrite', 'delete', undefined, 'background');
      state.savedBackground = next;
      pendingBackgroundImageId = next.imageId;
      pendingBackgroundObjectUrl = null;
      pendingBackground = pending.imageRemoved ? { ...pending, imageId: null } : { ...state.savedBackground };
      state.backgroundDirty = false;
      await applyBackground(state.savedBackground);
      if (pendingBackground.backgroundMode === 'custom' && pendingBackground.imageId) {
        const previewImage = await loadImageFromIndexedDB(pendingBackground.imageId);
        if (previewImage) pendingBackgroundObjectUrl = URL.createObjectURL(previewImage);
      }
      await renderBackgroundPreview(pendingBackground);
      setBackgroundError();
      updateSettingsActionState();
      return true;
    } catch (error) {
      state.backgroundDirty = true;
      setBackgroundError(error.message || 'Changes could not be saved locally.');
      updateSettingsActionState();
      return false;
    }
  }

  async function saveDisplayChanges() {
    const next = { ...pendingDisplaySettings };
    if (!next || !Number.isFinite(next.linkTitleSize) || !Number.isFinite(next.linkDescriptionSize) || !Number.isFinite(next.linkIconSize)) return false;
    const saved = await saveData(state.savedBackground, next);
    if (!saved) return false;
    state.savedDisplaySettings = next;
    pendingDisplaySettings = { ...next };
    state.displayDirty = false;
    applyDisplaySettings(next);
    renderDisplayPreview(next);
    updateSettingsActionState();
    return true;
  }

  async function saveSettingsChanges() {
    let successful = true;
    if (state.backgroundDirty) successful = await saveBackgroundChanges();
    if (successful && state.displayDirty) successful = await saveDisplayChanges();
    if (!successful) return;
    saveBackgroundButton.textContent = 'Saved ✓';
    saveDisplayButton.textContent = 'Saved ✓';
    window.setTimeout(() => { saveBackgroundButton.textContent = 'Save Changes'; saveDisplayButton.textContent = 'Save Changes'; }, 1600);
    updateSettingsActionState();
  }

  function discardSettingsChanges() {
    discardBackgroundChanges();
    discardDisplayChanges();
  }

  function beginBackgroundEdit() {
    pendingBackground = { ...state.savedBackground };
    pendingBackgroundImageId = pendingBackground.imageId;
    pendingBackgroundObjectUrl = null;
    state.backgroundDirty = false;
    if (pendingBackgroundImageId) loadImageFromIndexedDB(pendingBackgroundImageId).then((blob) => { if (blob && pendingBackground?.imageId === pendingBackgroundImageId) { pendingBackgroundObjectUrl = URL.createObjectURL(blob); renderBackgroundPreview(pendingBackground); } }).catch(() => { });
    renderBackgroundPreview(pendingBackground);
  }

  function discardBackgroundChanges() {
    if (pendingBackgroundObjectUrl) URL.revokeObjectURL(pendingBackgroundObjectUrl);
    if (pendingBackgroundImageId && pendingBackgroundImageId !== state.savedBackground.imageId) backgroundDbRequest('readwrite', 'delete', undefined, pendingBackgroundImageId).catch(() => { });
    pendingBackgroundObjectUrl = null;
    pendingBackgroundImageId = state.savedBackground.imageId;
    pendingBackground = { ...state.savedBackground };
    state.backgroundDirty = false;
    if (pendingBackgroundImageId) loadImageFromIndexedDB(pendingBackgroundImageId).then((blob) => { if (blob) { pendingBackgroundObjectUrl = URL.createObjectURL(blob); renderBackgroundPreview(pendingBackground); } }).catch(() => { });
    renderBackgroundPreview(pendingBackground);
    applyBackground(state.savedBackground);
  }

  function validateBackgroundFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!file || !allowedTypes.includes(file.type)) return Promise.reject(new Error('Choose a JPG, PNG, or WEBP image.'));
    if (file.size > 15 * 1024 * 1024) return Promise.reject(new Error('Images must be 15 MB or smaller.'));
    const url = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => { URL.revokeObjectURL(url); resolve(file); };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This image could not be loaded.')); };
      image.src = url;
    });
  }

  async function handleBackgroundFile(file) {
    setBackgroundError();
    try {
      await validateBackgroundFile(file);
      const imageId = makeId('background');
      await backgroundDbRequest('readwrite', 'put', file, imageId);
      if (pendingBackgroundImageId && pendingBackgroundImageId !== state.savedBackground.imageId) backgroundDbRequest('readwrite', 'delete', undefined, pendingBackgroundImageId).catch(() => { });
      if (pendingBackgroundObjectUrl) URL.revokeObjectURL(pendingBackgroundObjectUrl);
      pendingBackgroundImageId = imageId;
      pendingBackgroundObjectUrl = URL.createObjectURL(file);
      pendingBackground = pendingBackground || { ...state.savedBackground };
      pendingBackground.backgroundMode = 'custom';
      pendingBackground.imageId = imageId;
      pendingBackground.imageRemoved = false;
      markBackgroundDirty();
      renderBackgroundPreview(pendingBackground);
    } catch (error) {
      setBackgroundError(error.message || 'The background could not be saved.');
    } finally {
      backgroundFileInput.value = '';
    }
  }

  async function loadStoredBackground() {
    try {
      if (state.savedBackground.backgroundMode === 'custom') {
        const blob = await loadImageFromIndexedDB(state.savedBackground.imageId);
        if (!blob) {
          state.savedBackground = { ...state.savedBackground, backgroundMode: 'theme', imageId: null };
          await saveData(state.savedBackground);
        }
      } else {
        await backgroundDbRequest('readwrite', 'delete', undefined, 'background');
      }
    } catch (error) {
      setBackgroundError('Local background storage is unavailable.');
    }
    await applyBackground(state.savedBackground);
  }

  async function removeBackground() {
    setBackgroundError();
    if (pendingBackgroundObjectUrl) URL.revokeObjectURL(pendingBackgroundObjectUrl);
    if (pendingBackgroundImageId && pendingBackgroundImageId !== state.savedBackground.imageId) backgroundDbRequest('readwrite', 'delete', undefined, pendingBackgroundImageId).catch(() => { });
    pendingBackgroundObjectUrl = null;
    pendingBackgroundImageId = null;
    pendingBackground = pendingBackground || { ...state.savedBackground };
    pendingBackground.backgroundMode = 'custom';
    pendingBackground.imageId = null;
    pendingBackground.imageRemoved = true;
    markBackgroundDirty();
    renderBackgroundPreview(pendingBackground);
  }

  function navigateToResult(result) {
    switchTab(result.dataset.tabId);
    closeSearch();
    if (result.dataset.resultType === 'tab') return;
    requestAnimationFrame(() => {
      const selector = result.dataset.resultType === 'link' ? `[data-link-id="${CSS.escape(result.dataset.linkId)}"]` : `[data-board-id="${CSS.escape(result.dataset.boardId)}"]`;
      const target = document.querySelector(selector);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('search-highlight');
      window.setTimeout(() => target.classList.remove('search-highlight'), 1400);
    });
  }

  tabsElement.addEventListener('click', (event) => {
    const tab = event.target.closest('.workspace-tab');
    if (tab) switchTab(tab.dataset.tabId);
    if (event.target.closest('.add-tab')) openNameModal('create-tab');
  });
  tabsElement.addEventListener('contextmenu', (event) => { const tab = event.target.closest('.workspace-tab'); if (tab) openContextMenu(event, { kind: 'tab', id: tab.dataset.tabId }); });
  workspaceElement.addEventListener('click', (event) => {
    const add = event.target.closest('[data-add-board]');
    const menu = event.target.closest('[data-board-menu]');
    const addLink = event.target.closest('[data-add-link]');
    const linkMenu = event.target.closest('[data-link-menu]');
    if (add) openNameModal('create-board', null, add.dataset.addBoard);
    if (menu) { event.stopPropagation(); const rect = menu.getBoundingClientRect(); openContextMenu({ preventDefault() { }, clientX: rect.right - 160, clientY: rect.bottom }, { kind: 'board', id: menu.dataset.boardMenu }); }
    if (addLink) openLinkModal(addLink.dataset.addLink);
    if (linkMenu) { event.stopPropagation(); const rect = linkMenu.getBoundingClientRect(); openContextMenu({ preventDefault() { }, clientX: rect.right - 160, clientY: rect.bottom }, { kind: 'link', id: linkMenu.dataset.linkMenu, boardId: linkMenu.dataset.boardId }); }
  });
  searchButton.addEventListener('click', openSearch);
  settingsButton.addEventListener('click', openSettings);
  settingsNavItems.forEach((item) => item.addEventListener('click', () => {
    if (item.dataset.settingsTab === 'background' && !pendingBackground) beginBackgroundEdit();
    if (item.dataset.settingsTab === 'text-icons' && !pendingDisplaySettings) beginDisplayEdit();
    setSettingsPanel(item.dataset.settingsTab);
  }));
  themeCards.forEach((card) => card.addEventListener('click', () => {
    if (card.dataset.themeId === 'custom') {
      const mode = state.customThemeMode || 'solid';
      if (mode === 'gradient') applyTheme('custom', state.customThemeColor, 'gradient', state.customGradientColor1, state.customGradientColor2, state.customGradientType, state.customGradientDirection);
      else applyTheme('custom', customThemeColor.value, 'solid');
    } else applyTheme(card.dataset.themeId);
    if (pendingBackground) renderBackgroundPreview(pendingBackground);
    saveData();
  }));
  function updateCustomPreviews() {
    const solidPreview = document.querySelector('#solidPreview');
    const solidHex = document.querySelector('#solidHex');
    if (solidPreview) solidPreview.style.background = state.customThemeColor;
    if (solidHex) solidHex.textContent = state.customThemeColor;
    const gradPreview1 = document.querySelector('#gradPreview1');
    const gradPreview2 = document.querySelector('#gradPreview2');
    const gradHex1 = document.querySelector('#gradHex1');
    const gradHex2 = document.querySelector('#gradHex2');
    const gradLive = document.querySelector('#gradientLivePreview');
    const gradLarge = document.querySelector('#gradientPreviewLarge');
    const eff = state.customGradientType === 'radial' ? `radial-gradient(circle at center, ${state.customGradientColor1} 0%, ${state.customGradientColor2} 100%)` : `linear-gradient(${state.customGradientDirection}, ${state.customGradientColor1} 0%, ${state.customGradientColor2} 100%)`;
    if (gradPreview1) gradPreview1.style.background = state.customGradientColor1;
    if (gradPreview2) gradPreview2.style.background = state.customGradientColor2;
    if (gradHex1) gradHex1.textContent = state.customGradientColor1;
    if (gradHex2) gradHex2.textContent = state.customGradientColor2;
    if (gradLive) gradLive.style.background = eff;
    if (gradLarge) gradLarge.style.background = eff;
  }
  customThemeColor.addEventListener('input', () => { applyTheme('custom', customThemeColor.value, 'solid', state.customGradientColor1, state.customGradientColor2); updateCustomPreviews(); saveData(); });
  const customGradientColor1 = document.querySelector('#customGradientColor1');
  const customGradientColor2 = document.querySelector('#customGradientColor2');
  if (customGradientColor1) customGradientColor1.addEventListener('input', () => { applyTheme('custom', state.customThemeColor, 'gradient', customGradientColor1.value, customGradientColor2.value, state.customGradientType, state.customGradientDirection); updateCustomPreviews(); saveData(); });
  if (customGradientColor2) customGradientColor2.addEventListener('input', () => { applyTheme('custom', state.customThemeColor, 'gradient', customGradientColor1.value, customGradientColor2.value, state.customGradientType, state.customGradientDirection); updateCustomPreviews(); saveData(); });
  document.querySelectorAll('input[name="customThemeMode"]').forEach(radio => radio.addEventListener('change', () => {
    const mode = document.querySelector('input[name="customThemeMode"]:checked')?.value || 'solid';
    if (mode === 'gradient') applyTheme('custom', state.customThemeColor, 'gradient', state.customGradientColor1, state.customGradientColor2, state.customGradientType, state.customGradientDirection);
    else applyTheme('custom', customThemeColor.value, 'solid', state.customGradientColor1, state.customGradientColor2);
    updateCustomPreviews(); saveData();
  }));
  document.querySelectorAll('.custom-mode-card').forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.dataset.mode;
      document.querySelectorAll('input[name="customThemeMode"]').forEach(r => r.checked = r.value === mode);
      if (mode === 'gradient') applyTheme('custom', state.customThemeColor, 'gradient', state.customGradientColor1, state.customGradientColor2, state.customGradientType, state.customGradientDirection);
      else applyTheme('custom', customThemeColor.value, 'solid', state.customGradientColor1, state.customGradientColor2);
      updateCustomPreviews(); saveData();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
  // Premium gradient controls
  document.querySelectorAll('[data-gradient-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nt = btn.dataset.gradientType === 'radial' ? 'radial' : 'linear';
      applyTheme('custom', state.customThemeColor, 'gradient', state.customGradientColor1, state.customGradientColor2, nt, state.customGradientDirection);
      updateCustomPreviews(); saveData();
    });
  });
  document.querySelectorAll('.dir-btn[data-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled || btn.dataset.dir === 'center') return;
      const nd = btn.dataset.dir;
      applyTheme('custom', state.customThemeColor, 'gradient', state.customGradientColor1, state.customGradientColor2, 'linear', nd);
      // also switch to linear if was radial
      updateCustomPreviews(); saveData();
    });
  });
  const gradientPresets = {
    midnight: ['#0a0f1e','#1e3a5f'], ocean: ['#0f2b46','#1e9bd3'], aurora: ['#4c1d95','#0e7490'], sunset: ['#7c2d12','#be185d'], ember: ['#7f1d1d','#c2410c'], arctic: ['#1e3a5f','#e0f2fe'], violet: ['#4c1d95','#86198f'], forest: ['#064e3b','#0e7490']
  };
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = gradientPresets[btn.dataset.preset];
      if (!p) return;
      applyTheme('custom', state.customThemeColor, 'gradient', p[0], p[1], state.customGradientType, state.customGradientDirection);
      updateCustomPreviews(); saveData();
    });
  });
  chooseBackgroundButton.addEventListener('click', () => backgroundFileInput.click());
  changeBackgroundButton.addEventListener('click', () => backgroundFileInput.click());
  backgroundFileInput.addEventListener('change', () => handleBackgroundFile(backgroundFileInput.files[0]));
  removeBackgroundButtons.forEach((button) => button.addEventListener('click', removeBackground));
  saveBackgroundButton.addEventListener('click', saveSettingsChanges);
  saveDisplayButton.addEventListener('click', saveSettingsChanges);
  linkIconSize.addEventListener('input', () => { pendingDisplaySettings.linkIconSize = Number(linkIconSize.value); state.displayDirty = JSON.stringify(pendingDisplaySettings) !== JSON.stringify(state.savedDisplaySettings); renderDisplayPreview(pendingDisplaySettings); updateSettingsActionState(); });
  linkTitleSize.addEventListener('input', () => { pendingDisplaySettings.linkTitleSize = Number(linkTitleSize.value); state.displayDirty = JSON.stringify(pendingDisplaySettings) !== JSON.stringify(state.savedDisplaySettings); renderDisplayPreview(pendingDisplaySettings); updateSettingsActionState(); });
  linkDescriptionSize.addEventListener('input', () => { pendingDisplaySettings.linkDescriptionSize = Number(linkDescriptionSize.value); state.displayDirty = JSON.stringify(pendingDisplaySettings) !== JSON.stringify(state.savedDisplaySettings); renderDisplayPreview(pendingDisplaySettings); updateSettingsActionState(); });
  displayDefaultButton.addEventListener('click', () => { pendingDisplaySettings = { ...defaultDisplaySettings }; state.displayDirty = JSON.stringify(pendingDisplaySettings) !== JSON.stringify(state.savedDisplaySettings); renderDisplayPreview(pendingDisplaySettings); updateSettingsActionState(); });
  backgroundOpacity.addEventListener('input', () => { pendingBackground.opacity = Number(backgroundOpacity.value); markBackgroundDirty(); renderBackgroundPreview(pendingBackground); });
  backgroundDarkness.addEventListener('input', () => { pendingBackground.darkness = Number(backgroundDarkness.value); markBackgroundDirty(); renderBackgroundPreview(pendingBackground); });
  backgroundBlur.addEventListener('input', () => { pendingBackground.blur = Number(backgroundBlur.value); markBackgroundDirty(); renderBackgroundPreview(pendingBackground); });
  backgroundSize.addEventListener('change', () => { pendingBackground.size = backgroundSize.value === 'contain' ? 'contain' : 'cover'; markBackgroundDirty(); renderBackgroundPreview(pendingBackground); });
  discardBackgroundButton.addEventListener('click', discardSettingsChanges);
  discardDisplayButton.addEventListener('click', discardSettingsChanges);
  searchInput.addEventListener('input', renderSearchResults);
  searchResults.addEventListener('click', (event) => { const result = event.target.closest('.search-result'); if (result) navigateToResult(result); });
  searchModal.addEventListener('click', (event) => { if (event.target === searchModal || event.target.closest('[data-search-action="close"]')) closeSearch(); });
  settingsModal.addEventListener('click', (event) => { if (event.target === settingsModal || event.target.closest('[data-bs-dismiss="modal"]')) closeSettings(); });
  document.addEventListener('error', (event) => {
    const image = event.target.closest('[data-favicon]');
    if (!image) return;
    image.hidden = true;
    image.nextElementSibling.classList.remove('has-favicon');
    image.nextElementSibling.hidden = false;
  }, true);
  workspaceElement.addEventListener('click', (event) => {
    if (state.suppressLinkClick) {
      const linkAnchor = event.target.closest('.link-row a');
      if (linkAnchor) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }, true);
  workspaceElement.addEventListener('dragstart', (event) => {
    const linkRow = event.target.closest('.link-row');
    const isLinkDrag = linkRow && linkRow.getAttribute('draggable') === 'true' && !event.target.closest('[data-link-menu]');
    if (isLinkDrag) {
      if (event.target.closest('[data-link-menu]')) { event.preventDefault(); return; }
      state.draggedLinkId = linkRow.dataset.linkId;
      state.draggedLinkBoardId = linkRow.dataset.boardId;
      state.linkDropTarget = null;
      state.suppressLinkClick = false;
      event.dataTransfer.effectAllowed = 'move';
      try { event.dataTransfer.setData('text/plain', state.draggedLinkId); } catch {}
      requestAnimationFrame(() => linkRow.classList.add('is-dragging'));
      if (event.stopPropagation) event.stopPropagation();
      return;
    }
    if (linkRow) return;
    const board = event.target.closest('.board-card');
    if (!board) return;
    state.draggedBoardId = board.dataset.boardId;
    event.dataTransfer.effectAllowed = 'move';
    try { event.dataTransfer.setData('text/plain', state.draggedBoardId); } catch {}
    requestAnimationFrame(() => board.classList.add('is-dragging'));
  });
  workspaceElement.addEventListener('dragover', (event) => {
    if (state.draggedLinkId) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      updateLinkDropIndicator(event);
      return;
    }
    if (!state.draggedBoardId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    updateDropIndicator(event);
  });
  workspaceElement.addEventListener('drop', (event) => {
    if (state.draggedLinkId) {
      event.preventDefault();
      if (event.stopPropagation) event.stopPropagation();
      const draggedId = state.draggedLinkId;
      const shouldMove = Boolean(state.linkDropTarget);
      if (shouldMove) moveLinkOrder();
      const draggedEl = draggedId ? workspaceElement.querySelector(`[data-link-id="${CSS.escape(draggedId)}"]`) : null;
      if (draggedEl) draggedEl.classList.remove('is-dragging');
      clearLinkDropIndicator();
      state.draggedLinkId = null;
      state.draggedLinkBoardId = null;
      state.suppressLinkClick = true;
      window.setTimeout(() => { state.suppressLinkClick = false; }, 350);
      return;
    }
    if (!state.draggedBoardId) return;
    event.preventDefault();
    moveBoard();
    state.draggedBoardId = null;
    clearDropIndicator();
  });
  workspaceElement.addEventListener('dragend', () => {
    if (state.draggedLinkId) {
      const el = workspaceElement.querySelector(`[data-link-id="${CSS.escape(state.draggedLinkId)}"]`);
      if (el) el.classList.remove('is-dragging');
      clearLinkDropIndicator();
      state.draggedLinkId = null;
      state.draggedLinkBoardId = null;
      state.suppressLinkClick = true;
      window.setTimeout(() => { state.suppressLinkClick = false; }, 350);
    }
    if (state.draggedBoardId) {
      workspaceElement.querySelectorAll('.board-card.is-dragging').forEach((el) => el.classList.remove('is-dragging'));
      state.draggedBoardId = null;
      clearDropIndicator();
    }
    workspaceElement.querySelectorAll('.link-row.is-dragging').forEach((el) => el.classList.remove('is-dragging'));
    workspaceElement.querySelectorAll('.board-card.is-dragging').forEach((el) => el.classList.remove('is-dragging'));
    if (!state.draggedBoardId) clearDropIndicator();
    if (!state.draggedLinkId) clearLinkDropIndicator();
  });
  workspaceElement.addEventListener('dragleave', (event) => {
    if (state.draggedLinkId && !event.target.closest('.board-card')) {
      // mouse left board area while dragging link - clear indicator but keep dragging
    }
  });
  contextMenu.addEventListener('click', (event) => {
    const action = event.target.closest('[data-context-action]')?.dataset.contextAction;
    if (!state.context) return;
    const context = state.context;
    if (action === 'rename') { closeContextMenu(); openNameModal(context.kind === 'tab' ? 'rename-tab' : 'rename-board', context.id); }
    if (action === 'edit') { closeContextMenu(); openLinkModal(context.boardId, context.id); }
    if (action === 'move') { closeContextMenu(); openMoveLinkModal(context.boardId, context.id); }
    if (action === 'move-board') { closeContextMenu(); openMoveBoardModal(context.id); }
    if (action === 'open') { closeContextMenu(); window.location.href = findLink(context.boardId, context.id).url; }
    if (action === 'new-tab') { closeContextMenu(); window.open(findLink(context.boardId, context.id).url, '_blank', 'noopener,noreferrer'); }
    if (action === 'copy') { navigator.clipboard?.writeText(findLink(context.boardId, context.id).url).catch(() => { }); closeContextMenu(); }
    if (action === 'delete') { askDelete(context.kind, context.id); closeContextMenu(); }
  });
  document.addEventListener('click', (event) => { if (!event.target.closest('.tab-context-menu')) closeContextMenu(); if (event.target === tabModal) closeNameModal(); if (event.target === confirmModal) confirmModal.hidden = true; if (event.target === moveLinkModal) closeMoveLinkModal(); if (event.target === moveBoardModal) closeMoveBoardModal(); if (event.target === importModal) closeImportModal(); if (event.target === exportOptionsModal) closeExportOptionsModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeContextMenu(); closeNameModal(); closeLinkModal(); closeMoveLinkModal(); closeMoveBoardModal(); closeImportModal(); closeExportOptionsModal(); closeSearch(); closeSettings(); confirmModal.hidden = true; } if (event.key === 'Enter' && !tabModal.hidden) saveName(); if (event.key === 'Enter' && !linkModal.hidden) saveLink(); });
  document.querySelector('[data-tab-action="cancel"]').addEventListener('click', closeNameModal);
  document.querySelector('[data-tab-action="confirm"]').addEventListener('click', saveName);
  iconPicker.addEventListener('click', (event) => {
    const option = event.target.closest('[data-board-icon]');
    if (!option) return;
    state.selectedBoardIcon = option.dataset.boardIcon;
    iconPicker.querySelectorAll('.icon-option').forEach((button) => button.classList.toggle('selected', button === option));
  });
  document.querySelector('[data-tab-action="cancel-delete"]').addEventListener('click', () => { confirmModal.hidden = true; state.pendingDelete = null; });
  document.querySelector('[data-tab-action="confirm-delete"]').addEventListener('click', confirmDelete);
  document.querySelector('[data-link-action="cancel"]').addEventListener('click', closeLinkModal);
  document.querySelector('[data-link-action="confirm"]').addEventListener('click', saveLink);
  linkModal.addEventListener('click', (event) => { if (event.target === linkModal) closeLinkModal(); });
  moveTabSelect.addEventListener('change', () => { state.moveLink.targetTabId = moveTabSelect.value; renderMoveTargets(); });
  moveColumnSelect.addEventListener('change', () => { state.moveLink.targetColumnId = moveColumnSelect.value; renderMoveBoards(); });
  moveBoardSelect.addEventListener('change', () => { state.moveLink.targetBoardId = moveBoardSelect.value; });
  document.querySelector('[data-move-action="cancel"]').addEventListener('click', closeMoveLinkModal);
  document.querySelector('[data-move-action="confirm"]').addEventListener('click', moveLink);
  moveLinkModal.addEventListener('click', (event) => { if (event.target === moveLinkModal) closeMoveLinkModal(); });
  moveBoardTabSelect.addEventListener('change', () => { state.moveBoard.targetTabId = moveBoardTabSelect.value; renderMoveBoardTargets(); });
  moveBoardColumnSelect.addEventListener('change', () => { state.moveBoard.targetColumnId = moveBoardColumnSelect.value; });
  document.querySelector('[data-move-board-action="cancel"]').addEventListener('click', closeMoveBoardModal);
  document.querySelector('[data-move-board-action="confirm"]').addEventListener('click', moveBoardToTab);
  moveBoardModal.addEventListener('click', (event) => { if (event.target === moveBoardModal) closeMoveBoardModal(); });

  importFileInput.addEventListener('change', () => handleImportFile(importFileInput.files[0]));
  document.querySelector('[data-import-action="cancel"]').addEventListener('click', closeImportModal);
  document.querySelector('[data-import-action="confirm"]').addEventListener('click', confirmImport);
  importModal.addEventListener('click', (event) => { if (event.target === importModal) closeImportModal(); });

  document.querySelectorAll('.import-mode-card').forEach((card) => {
    card.addEventListener('click', () => {
      const mode = card.dataset.importMode;
      document.querySelectorAll('input[name="importMode"]').forEach((r) => (r.checked = r.value === mode));
      document.querySelectorAll('.import-mode-card').forEach((c) => {
        const selected = c.dataset.importMode === mode;
        c.classList.toggle('selected', selected);
        c.setAttribute('aria-checked', String(selected));
        c.tabIndex = selected ? 0 : -1;
      });
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  document.querySelector('[data-export-options-action="cancel"]').addEventListener('click', closeExportOptionsModal);
  document.querySelector('[data-export-options-action="confirm"]').addEventListener('click', confirmExportOptions);
  exportOptionsModal.addEventListener('click', (event) => { if (event.target === exportOptionsModal) closeExportOptionsModal(); });

  document.querySelectorAll('.export-option-card').forEach((card) => {
    card.addEventListener('click', () => {
      const option = card.dataset.exportOption;
      document.querySelectorAll('input[name="exportOption"]').forEach((r) => (r.checked = r.value === option));
      document.querySelectorAll('.export-option-card').forEach((c) => {
        const selected = c.dataset.exportOption === option;
        c.classList.toggle('selected', selected);
        c.setAttribute('aria-checked', String(selected));
        c.tabIndex = selected ? 0 : -1;
      });
      exportOptionsModal.querySelector('.export-options-notice').hidden = option !== 'full';
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  exportBackupButton.addEventListener('click', exportBackup);
  importBackupButton.addEventListener('click', openImportModal);
  resetDataButton.addEventListener('click', resetAllData);

  (() => {
    const wrapper = document.querySelector('#devBadgeWrapper');
    const badge = document.querySelector('#devBadge');
    const popover = document.querySelector('#devPopover');
    if (!wrapper || !badge || !popover) return;
    let isOpen = false;
    const setOpen = (open) => {
      isOpen = open;
      wrapper.classList.toggle('is-open', isOpen);
      badge.setAttribute('aria-expanded', String(isOpen));
      popover.hidden = !isOpen;
    };
    badge.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!isOpen); });
    badge.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!isOpen); } });
    document.addEventListener('click', (e) => { if (!wrapper.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) { setOpen(false); badge.focus(); } });
  })();
  loadData().then((loaded) => {
    applyTheme(state.themeId, state.customThemeColor, state.customThemeMode, state.customGradientColor1, state.customGradientColor2);
    applyDisplaySettings(state.savedDisplaySettings);
    loadStoredBackground();
    renderTabs();
    renderColumns();
    document.body.classList.remove('is-loading');
    if (!loaded) saveData();
  });
})();
