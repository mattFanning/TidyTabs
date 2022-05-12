/*importScripts('/wrappers.js') <- already included thru parent*/

// TODO: setup TabRecall with previousTab[] so if the tab we are switching to doesn't exist (closed), we can switch to the 1 before
class TabRecall {  
  static #STORE_KEY = "tab_recall"
  
  // tabInfo: { tabId, windowId }
  static async addTabInfo(tabInfo) {
    console.log(`addTabInfo: ${JSON.stringify(tabInfo)}`)
    // build/fetch a payload from storage;  Must include (currentTab: activeInfo, previousTab: activeInfo)
    let previousInfo = await TabRecall.getRecallTabInfo()
    if(Object.keys(previousInfo).length <=0) {
      previousInfo = {currentTab: tabInfo, previousTab: tabInfo}
    }
    // adjust payload for incoming tabInfo
    const currentInfo = {currentTab: tabInfo, previousTab: previousInfo.currentTab}
    return await TabRecall.#write(currentInfo)
  }

  static async activatePreviousTab() {
    const tabRecallInfo = await TabRecall.getRecallTabInfo()
    if(Object.keys(tabRecallInfo).length <=0) {
      return false
    }
    const {previousTab} = tabRecallInfo
    const tab = await Promises.chrome.tabs.get(previousTab.tabId)
    if(tab === undefined) {
      return false
    }
    const windowUpdate = await Promises.chrome.windows.update(tab.windowId, {focused: true})
    const tabUpdate = await Promises.chrome.tabs.update(tab.id, {active: true})
    return true
  }

  static async getRecallTabInfo() {
    const response = await Promises.chrome.storage.local.get(TabRecall.#STORE_KEY)
    if(Object.keys(response).length <= 0) {
      const emptyRecallInfo = {}
      return emptyRecallInfo
    }
    return response[TabRecall.#STORE_KEY]
  }

  static async #write(recallTabInfo) {
    const payload = {[TabRecall.#STORE_KEY]: recallTabInfo}
    return await Promises.chrome.storage.local.set(payload)
  }
}