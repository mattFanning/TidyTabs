/*importScripts('/promises.js') <- already included thru parent*/

/**
 * The rules and logic for sorting tabs.
*/
class Flagging {
  static #STORE_KEY = "tab_flags"
  static TOTAL_FLAGS = 10

  /**
   * Stores the tab information indexed by flagId.
   * @async
   * @param {number} flagId 0 based index to "TOTAL_FLAGS -1"
   * @param {FlaggingTabInfo} tabInfo
  */
  static async flagTab(flagId, tabInfo) {
    let flags = await Flagging.getFlags()
    flags[flagId] = tabInfo
    return Flagging.#write(flags)
  }

  /**
   * Activates the flagged tab.
   * @param {number} flagId 0 based index to "TOTAL_FLAGS -1"
  */
  static async activateFlag(flagId) {
    const flags = await Flagging.getFlags()
    if(Flagging.#isEmptyFlags(flags)) {
      return false
    }
    
    const flaggedTabInfo = flags[flagId]
    if(Object.keys(flaggedTabInfo).length <= 0) {
      return false
    }

    //query for the tab
    const {tabId} = flaggedTabInfo
    const tab = await Promises.chrome.tabs.get(tabId)
    if(tab === undefined) {
      return false
    }
    
    const windowUpdate = await Promises.chrome.windows.update(tab.windowId, {focused: true})
    const tabUpdate = await Promises.chrome.tabs.update(tab.id, {active: true})
    return true
  }

  /**
   * Retrieves the stored flag array or []
   * Flag Array is indexed by flagId
   * @async 
   * @return {Promise<FlaggingTabInfo[]>} 
  */
  static async getFlags() {
    const response = await Promises.chrome.storage.local.get(Flagging.#STORE_KEY)
    if(Object.keys(response).length <= 0) {
      const emptyFlags = Flagging.#generateEmptyFlags()
      return emptyFlags
    }
    return response[Flagging.#STORE_KEY]
  }

  /**
   * Clears the flag array.
   * @async
  */
  static async clearFlags() {
    let flags = Flagging.#generateEmptyFlags()
    return Flagging.#write(flags)
  }

  //private
  static async #write(flags) {
    const payload = {[Flagging.#STORE_KEY]: flags}
    return await Promises.chrome.storage.local.set(payload) 
  }

  static #generateEmptyFlags() {
    const emptyFlags = []
    for(let i = 0; i < Flagging.TOTAL_FLAGS; i++) {
      emptyFlags[i] = {}
    }
    return emptyFlags
  }

  static #isEmptyFlags(input) {
    if(Array.isArray(input)) {
      for(let i = 0; i < input.length; i++) {
        if(input[i] != {}) {
          return false
        }
      }
      return true
    }
    return false
  }
}

/**
 * A payload of tabId and windowId to specify a tab for flagging.
 * @typedef {object} FlaggingTabInfo
 * @property {number} tabId - the id of the tab to flag
 * @property {number} windowId - the id of the window that tabId belongs to
 */