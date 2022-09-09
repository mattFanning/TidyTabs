/*importScripts('/wrappers.js') <- already included thru parent*/

// TODO: setup TabRecall with previousTab[] so if the tab we are switching to doesn't exist (closed), we can switch to the 1 before
/**
 * The rules for storing and recalling previously active tab
 */
class TabRecall {  
  static #STORE_KEY = "tab_recall"
  
  /**
   * Adds ActiveInfo for a tab to the TabRecall 
   * @param {ActiveInfo} tabInfo see: https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated
   * @returns response from writing to local storage.
   */
  static async addTabInfo(tabInfo) {
    console.log(`addTabInfo: ${JSON.stringify(tabInfo)}`)
    // build/fetch a payload from storage
    let recallPayload = await TabRecall.getRecallTabInfo()
    if(Object.keys(recallPayload).length <= 0) {
      recallPayload = {currentTab: tabInfo, previousTabs: [tabInfo]}
    }

    if('previousTab' in recallPayload) {
      recallPayload.previousTabs = []
      recallPayload.previousTabs.unshift(recallPayload.previousTab)
      delete recallPayload.previousTab
    }

    // adjust payload for incoming tabInfo
    recallPayload.previousTabs.unshift(recallPayload.currentTab)
    if(recallPayload.previousTabs.length > 5) {
      recallPayload.previousTabs = recallPayload.previousTabs.slice(0, 5)
    }
    recallPayload.currentTab = tabInfo
    return await TabRecall.#write(recallPayload)
  }

  static async activatePreviousTab() {
    const tabRecallInfo = await TabRecall.getRecallTabInfo()
    if(Object.keys(tabRecallInfo).length <=0) {
      return false
    }
    const {previousTabs} = tabRecallInfo
    for(const p in previousTabs) {
      const tab = await Promises.chrome.tabs.get(previousTabs[p].tabId)
      if(tab === undefined) {
        continue
      }
      const windowUpdate = await Promises.chrome.windows.update(tab.windowId, {focused: true})
      const tabUpdate = await Promises.chrome.tabs.update(tab.id, {active: true})
      break
    }
    return true
  }

  /**
   * fetches the RecallTabInfo from local storage.
   * @returns RecallTabInfo if found, else {}
   */
  static async getRecallTabInfo() {
    const response = await Promises.chrome.storage.local.get(TabRecall.#STORE_KEY)
    if(Object.keys(response).length <= 0) {
      return {}
    }
    return response[TabRecall.#STORE_KEY]
  }

  /**
   * writes the RecallTabInfo to local storage.
   * @param {RecallTabInfo} recallTabInfo 
   * @returns response of chrome.storage.local.set()
   */
  static async #write(recallTabInfo) {
    const payload = {[TabRecall.#STORE_KEY]: recallTabInfo}
    return await Promises.chrome.storage.local.set(payload)
  }
}

/**
 * see: https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated
 * @typedef {object} ActiveInfo
 */

/**
 * A payload containing current and previously active tabs.
 * @typedef {object} RecallTabInfo
 * @property {ActiveInfo} currentTab - the current tab activated.
 * @property {ActiveInfo[]} previousTabs - an array containing the previously activated tab as well as ones prior.
 */