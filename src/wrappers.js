/**
 * This class wraps various chrome api methods into promises.
 */
class Promises {}
Promises.chrome = class {}

// chrome.tabs
Promises.chrome.tabs = class {
  /**
   * A promise wrapper for chrome.tabs.get()
   * see: https://developer.chrome.com/docs/extensions/reference/tabs/#method-get
   * @param {object} tabId the id of the tab to fetch. 
   * @returns {Promise<object>} a Tab.
  */
  static async get(tabId) {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.get(tabId, tab=> resolve(tab))
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * A promise wrapper for chrome.tabs.query()
   * see: https://developer.chrome.com/docs/extensions/reference/tabs/#method-query
   * @param {object} queryInfo a query info object
   * @returns {Promise<object>} a Tab array.
  */
  static async query(queryInfo) {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.query(queryInfo, tabs => resolve(tabs))
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * A promise wrapper for chrome.tabs.group()
   * see: https://developer.chrome.com/docs/extensions/reference/tabs/#method-group
   * @param {object} options a payload for selecting/creating a group to add tabs to
   * @returns {Promise<object>} the groupId that the tabs were added to 
  */
  static async group(options) {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.group(options, groupId => resolve(groupId))
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * A promise wrapper for chrome.tabs.create()
   * see: https://developer.chrome.com/docs/extensions/reference/tabs/#method-create
   * @param {object} createProperties a properties object for tab creation
   * @returns {Promise<object>} the created Tab.
  */
  static async create(createProperties) {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.create(createProperties, tab => resolve(tab))
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * A promise wrapper for chrome.tabs.update()
   * see: https://developer.chrome.com/docs/extensions/reference/tabs/#method-update
   * @param {number} tabId? the specifc tab to update.  Optional.  Defaults to selected tab of current window.
   * @param {object} updateProperties a properties object for updating tabs.
   * @returns {Promise<object>} the updated Tab.
  */
  static async update(tabId, updateProperties) {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.update(tabId, updateProperties, tab => resolve(tab))
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * A promise wrapper for chrome.tabs.remove()
   * @param {string|string[]} tabIds - the id(s) to remove.
   * @returns {Promise<true|exception>} true if successful, else exception
   * @see: https://developer.chrome.com/docs/extensions/reference/tabs/#method-remove
  */
  static async remove(tabIds) {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.remove(tabIds, () => resolve(true)) 
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * A promise wrapper for chrome.tabs.sendMessage()
   * @param {number} tabId 
   * @param {*} message a JSON-ifiable object to send to the content scripts.
   * @param {*} options 
   * @returns {Promise<object>} a JSON-ifiable object send back from the scripts.
  */
  static async sendMessage(tabId, message, options) {
    return new Promise((resolve,reject) => {
      try {
        chrome.tabs.sendMessage(tabId, message, options, response => {
          if(chrome.runtime.lastError) //This eats the error so it doesn't show up in logs.
            console.debug(chrome.runtime.lastError.message)
          resolve(response)
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}

// chrome.tabsGroups
Promises.chrome.tabGroups = class {
  /**
   * A promise wrapper for chrome.tabGroups.move()
   * see: https://developer.chrome.com/docs/extensions/reference/tabGroups/#method-move
  * @param {object} groupId the id of the group
  * @param {object} moveProperties a move properties object
   * @returns {Promise<object>} a TabGroup
  */
  static async move(groupId, moveProperties) {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabGroups.move(groupId, moveProperties, tabGroup => resolve(tabGroup))
      } catch (e) {
        reject(e)
      }
    })
  }
  
  /**
   * A promise wrapper for chrome.tabGroups.query()
   * see: https://developer.chrome.com/docs/extensions/reference/tabGroups/#method-query
   * @param {object} queryInfo a query info object
   * @returns {Promise<object>} a TabGroups array
  */
  static async query(queryInfo) {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabGroups.query(queryInfo, tabGroups => resolve(tabGroups))
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * A promise wrapper for chrome.tabGroups.update()
   * see: https://developer.chrome.com/docs/extensions/reference/tabGroups/#method-update
   * @param {number} groupId the group to update.
   * @param {object} updateProperties a query info object
   * @returns {Promise<object>} the TabGroup updated
  */
  static async update(groupId, updateProperties) {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabGroups.update(groupId, updateProperties, tabGroup => resolve(tabGroup))
      } catch (e) {
        reject(e)
      }
    })
  }
}

// chrome.windows
Promises.chrome.windows = class {
  /**
   * A promise wrapper for chrome.windows.getCurrent()
   * see: https://developer.chrome.com/docs/extensions/reference/windows/#method-getCurrent
   * @param {object} queryOptions a query options object
   * @returns {Promise<object>} the found Window object
  */
  static async getCurrent(queryOptions) {
    return new Promise((resolve, reject) => {
      try {
        chrome.windows.getCurrent(queryOptions, window => resolve(window))
      } catch (e) {
        reject(e)
      }
    })
  }
}

// chrome.runtime
Promises.chrome.runtime = class {
  static async sendMessage(message, options) {
    return new Promise((resolve, reject) => {
      try {
        const extensionId = undefined // optional my ass!
        chrome.runtime.sendMessage(extensionId, message, options, response => {
          if(chrome.runtime.lastError) //This eats the error so it doesn't show up in logs.
            console.debug(chrome.runtime.lastError.message)
          resolve(response)
        })
      } catch (e) {
        reject(e)
      }
      return true
    })
  }
}

// chrome.storage.sync
Promises.chrome.storage = class {}
Promises.chrome.storage.sync = class {
  /**
   * A promise wrapper for chrome.storage.sync.set.
   * @param {object} items A payload of keys & values to store/update. 
   * @returns {Promise<true|exception>} promise
   * @resolve true if storing was sucessful. 
   * @reject the exception thrown from storage attempt
   * @see https://developer.chrome.com/docs/extensions/reference/storage/#type-StorageArea
  */
  static async set(items) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.set(items, () => resolve(true))
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * A promise wrapper for chrome.storage.sync.get
   * @param {string|string[]} keys The keys to fetch
   * @returns {Promise<object|exception>} promise
   * @resolve the key:value pairs of the requested keys
   * @reject the exception thrown from fetch attempt
   * @see https://developer.chrome.com/docs/extensions/reference/storage/#type-StorageArea
  */
  static async get(keys) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(keys, (items) => resolve(items))
      } catch (e) {
        reject(e)
      }
    })
  }
}


Promises.chrome.unused = class {
  /**
   * A promise wrapper for chrome.scripting.executeScript.
   * @param {object} injection a ScriptInjection object
   * @see chrome.scripting.executeScript.
   * @returns {Promise<object[]>} an InjectionResults object array see chrome.scripting.executeScript.
  */
  static async chromeScriptingExecuteScript(injection) {
    return new Promise((resolve, reject)=> {
      try {
        chrome.scripting.executeScript(injection, response=> resolve(response))
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * A promise wrapper for chrome.scripting.insertCSS().
   * @param {object} injection a ScriptInjection object
   * @returns {Promise<object[]>} an InjectionResults object array 
   * @see chrome.scripting.executeScript.
  */
  static async chromeScriptingInsertCSS(injection) {
    return new Promise((resolve, reject)=> {
      try{
        chrome.scripting.insertCSS(injection, response=> resolve(response))
      } catch (e) {
        reject(e)
      }
    })
  }
}