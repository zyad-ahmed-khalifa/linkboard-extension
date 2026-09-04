const linkBoardUrl = chrome.runtime.getURL('newtab.html');

chrome.action.onClicked.addListener(() => {
  chrome.tabs.query({ url: linkBoardUrl }, (tabs) => {
    const existingTab = tabs[0];

    if (existingTab?.id !== undefined) {
      chrome.tabs.update(existingTab.id, { active: true });
      if (existingTab.windowId !== undefined) {
        chrome.windows.update(existingTab.windowId, { focused: true });
      }
      return;
    }

    chrome.tabs.create({ url: linkBoardUrl });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'load-favicon' || typeof message.url !== 'string') return;

  getFaviconDataUrl(message.url).then((dataUrl) => sendResponse({ dataUrl })).catch(() => sendResponse({ dataUrl: null }));
  return true;
});

async function getFaviconDataUrl(pageUrl) {
  let faviconUrl;
  try {
    const page = new URL(pageUrl);
    if (!['http:', 'https:'].includes(page.protocol) || !page.hostname) return null;
    faviconUrl = `${page.origin}/favicon.ico`;
  } catch {
    return null;
  }

  try {
    const response = await fetch(faviconUrl, { credentials: 'omit', redirect: 'follow' });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/') && !['application/octet-stream', 'application/x-icon'].includes(contentType.split(';')[0].trim())) return null;
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > 1024 * 1024) return null;
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    const mimeType = contentType.split(';')[0] || 'application/octet-stream';
    const imageMimeType = mimeType.startsWith('image/') ? mimeType : 'image/x-icon';
    return `data:${imageMimeType};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}
