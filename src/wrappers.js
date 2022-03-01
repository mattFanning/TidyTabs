/**
 * This class wraps various chrome api methods into promises.
 */
class Wrappers {
  // chrome.tabGroups

  /**
   * A Promise wrapper for chrome.tabs.query()
   * see: https://developer.chrome.com/docs/extensions/reference/tabs/#method-query
   * @param {object} queryInfo a query info object
   * @returns {Promise<object>} a Tab array.
  */
  static async chromeTabsQuery(queryInfo) {
    return new Promise((resolve, reject)=> {
      try {
        chrome.tabs.query(queryInfo, tabs=> resolve(tabs));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * A Promise wrapper for chrome.tabs.group()
   * see: https://developer.chrome.com/docs/extensions/reference/tabs/#method-group
   * @param {object} options a payload for selecting/creating a group to add tabs to
   * @returns {Promise<object>} the groupId that the tabs were added to 
  */
  static async chromeTabsGroup(options) {
    return new Promise((resolve, reject)=> {
      try {
        chrome.tabs.group(options, groupId=> resolve(groupId));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * A Promise wrapper for chrome.tabs.create()
   * see: https://developer.chrome.com/docs/extensions/reference/tabs/#method-create
   * @param {object} createProperties a properties object for tab creation
   * @returns {Promise<object>} the created Tab.
  */
  static async chromeTabsCreate(createProperties) {
    return new Promise((resolve, reject)=> {
      try {
        chrome.tabs.create(createProperties, tab=> resolve(tab));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * A Promise wrapper for chrome.tabs.update()
   * see: https://developer.chrome.com/docs/extensions/reference/tabs/#method-update
   * @param {number} tabId? the specifc tab to update.  Optional.  Defaults to selected tab of current window.
   * @param {object} updateProperties a properties object for updating tabs.
   * @returns {Promise<object>} the updated Tab.
  */
   static async chromeTabsUpdate(tabId, updateProperties) {
    return new Promise((resolve, reject)=> {
      try {
        chrome.tabs.update(tabId, updateProperties, tab=> resolve(tab));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * A Promise wrapper for chrome.tabs.sendMessage()
   * @param {number} tabId 
   * @param {*} message a JSON-ifiable object to send to the content scripts.
   * @param {*} options 
   * @returns {Promise<object>} a JSON-ifiable object send back from the scripts.
  */
  static async chromeTabsSendMessage(tabId, message, options) {
    return new Promise((resolve,reject)=> {
      try {
        chrome.tabs.sendMessage(tabId, message, options, response=> {
          if(chrome.runtime.lastError) //This eats the error so it doesn't show up in logs.
            console.debug(chrome.runtime.lastError.message);
          resolve(response);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

// chrome.tabGroups

  /**
   * A Promise wrapper for chrome.tabGroups.query()
   * see: https://developer.chrome.com/docs/extensions/reference/tabGroups/#method-query
   * @param {object} queryInfo a query info object
   * @returns {Promise<object>} a TabGroups array
  */
  static async chromeTabsGroupsQuery(queryInfo) {
    return new Promise((resolve, reject)=> {
      try {
        chrome.tabGroups.query(queryInfo, tabGroups=> resolve(tabGroups));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * A Promise wrapper for chrome.tabGroups.update()
   * see: https://developer.chrome.com/docs/extensions/reference/tabGroups/#method-update
   * @param {number} groupId the group to update.
   * @param {object} updateProperties a query info object
   * @returns {Promise<object>} the TabGroup updated
  */
   static async chromeTabsGroupsUpdate(groupId, updateProperties) {
    return new Promise((resolve, reject)=> {
      try {
        chrome.tabGroups.update(groupId, updateProperties, tabGroup=> resolve(tabGroup));
      } catch (e) {
        reject(e);
      }
    });
  }
  
// unused  

  static async chromeRuntimeSendMessage(message, options) {
    return new Promise ((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, options, response => {
          if(chrome.runtime.lastError) //This eats the error so it doesn't show up in logs.
            console.debug(chrome.runtime.lastError.message);
          resolve(response);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  
  /**
   * A Promise wrapper for chrome.scripting.executeScript.
   * @param {object} injection a ScriptInjection object; see chrome.scripting.executeScript.
   * @returns {Promise<object[]>} an InjectionResults object array; see chrome.scripting.executeScript.
  */
  static async chromeScriptingExecuteScript(injection) {
    return new Promise((resolve, reject)=> {
      try {
        chrome.scripting.executeScript(injection, response=> resolve(response));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * A Promise wrapper for chrome.scripting.insertCSS().
   * @param {object} injection a ScriptInjection object; see chrome.scripting.executeScript.
   * @returns {Promise<object[]>} an InjectionResults object array; see chrome.scripting.executeScript.
  */
  static async chromeScriptingInsertCSS(injection) {
    return new Promise((resolve, reject)=> {
      try{
        chrome.scripting.insertCSS(injection, response=> resolve(response));
      } catch (e) {
        reject(e);
      }
    });
  }
}