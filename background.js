/* 
 * Check and set a global guard variable.
 * If this content script is injected into the same page again,
 * it will do nothing next time.
 */
() => {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;
};

const contentScript = {
  js: "content.js",
  regex: /^.*news.ycombinator.com\/item\?id=.*/g,
};

/*
 * Loading content scripts dynamically (loading and unloading) is not supported out
 * of the box. I invision the user clicking the browser action to shuffle the
 * comment tree. Subsequent clicks emulate on/off.
 *
 * Sync extension storage is used to state dynamic content script
 * loading/unloading
 *
 * schema like so:
 *   {tab.id: {
 *       loaded: true,
 *       shuffled: false
 *   }}
 *
 * "loaded" indicates content script load status per tab
 * "shuffled" alternates boolean values on click.
 */

let storageGet = async (tabId) => {
  let store;

  try {
    store = await browser.storage.sync.get(tabId);
  } catch (err) {
    new Error(err);
  }

  return Object.keys(store).length == 0 ? undefined : store[tabId];
};

let storageSet = async (tabId, /* database value */ val) => {
  try {
    await browser.storage.sync.set({ [tabId]: val });
  } catch (err) {
    new Error(err);
  }
};

let storageRemove = async (tabId) => {
  let sync = browser.storage.sync;

  try {
    tabId === undefined ? await sync.clear() : await sync.remove(tabId);
  } catch (err) {
    new Error(err);
  }
};

let loadContentScript = async (tab) => {
  try {
    await browser.scripting.executeScript({
      target: {
        tabId: tab.id,
        allFrames: true,
      },
      injectImmediately: true,
      files: [contentScript.js],
    });
  } catch (err) {
    new Error(err);
  }

  await storageSet(tab.id.toString(), {
    loaded: true,
    shuffle: false,
  });
};

let sendMessage = async (tab) => {
  let shuffle, updateBody;

  while (true) {
    try {
      shuffle = await storageGet(tab.id.toString());
    } catch (err) {
      new Error(err);
    }

    updateBody = !shuffle.shuffle
      ? { loaded: true, shuffle: true }
      : { loaded: true, shuffle: false };

    try {
      await browser.tabs.sendMessage(tab.id, {
        command: updateBody.shuffle,
      });
    } catch (err) {
      // sendMessage fails if content script detaches
      // removing the requisite storage key, will allow for reinjection
      // awaiting these function calls works
      await storageRemove(tab.id.toString());
      await loadContentScript(tab);
      continue;
    }

    break;
  }
  await storageSet(tab.id.toString(), updateBody);
};

let clickActions = async (tab) => {
  if (tab.url.match(contentScript.regex)) {
    const loaded = await storageGet(tab.id.toString());

    if (loaded == undefined) {
      await loadContentScript(tab);
      await sendMessage(tab);
    } else {
      await sendMessage(tab);
    }
  } else {
    // remove entry from db if tab url does not match. A user navigating back to
    // the HN landing detaches the content script.
    await storageRemove(tab.id.toString());
  }
};

/* 
 * without a popup, clicking the browser action sends a click event to the
 * background script
 */
browser.action.onClicked.addListener(async (tab) => {
  await clickActions(tab);
});

/* 
 * This block listens for messages from content scripts
 * and clears the calling tab's data if no comments exist.
 * This does not unregister the content script, so reinitialization
 * raises for redefining variables
 */

// browser.runtime.onConnect.addListener((port) => {
//   const portFromCS = port;

//   portFromCS.onMessage.addListener(async (message) => {
//     if (!message.status) {

//       browser.tabs.query({active: true})
//         // .then(tabs => browser.tabs.get(tabs[0].id))
//         .then(async tabs => {
//           await storageRemove(tabs[0].id.toString());
//         });
//     }
//   });
// });
