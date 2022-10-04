importScripts('/promises.js')
importScripts('/background/sorting.js')
importScripts('/background/flagging.js')
importScripts('/background/tabGroupFlagger.js')
importScripts('/background/tab_recall.js')

/**
 * The controller of the background operations.
*/
 class BackgroundController {
  // messages

  /**
   * Executes the message string's command 
   * @param {string|object} input string:the message to execute.  object:{message:'', arg1:{}}
   * @param {object} callback? the callback method to pass back values.  Optional
  */
  static async executeMessage(input, callback) {
    let message = undefined
    if(typeof input === "string") {
      message = input
    } else if(typeof input === "object") {
      message = input['message']
    } else {
      return
    }

    console.log(`BackgroundController.execute\n\texecuting: %c${message}`, "color:green")
    let returnedValue = undefined
    switch(message) {
    // tabs
      case "new_tab_in_selected_group":
        returnedValue = await BackgroundController.newTabInActiveGroup()
        break
      case "new_tab_in_new_group":
        returnedValue = await BackgroundController.newTabInNewGroup()
        break

    // sort
      case "sort_highlighted_tabs":
        returnedValue = await BackgroundController.sortHighlightedTabs()
        break
      case "sort_all_tabs_in_window":
        returnedValue = await BackgroundController.sortAllTabsInWindow()
        break
      case "sort_all_tabs":
        returnedValue = await BackgroundController.sortAllTabs()
        break

    // remove
      case "remove_highlighted_dup_tabs":
        returnedValue = await BackgroundController.removeHighlightedDuplicateTabs()
        break
      case "remove_dup_tabs_in_window":
        returnedValue = await BackgroundController.removeDuplicateTabsInWindow()
        break
      case "remove_dup_tabs" :
        returnedValue = await BackgroundController.removeDuplicateTabs()
        break;

    // collapse
      case "collapse_all_groups_in_window":
        returnedValue = await BackgroundController.collapseAllGroupsInWindow()
        break
      case "collapse_all_groups":
        returnedValue = await BackgroundController.collapseAllGroups()
        break

    // auto collapse
      case "auto_collapse_groups_status":
        returnedValue = await BackgroundController.getAutoCollapseStatus()
        break  
      case "auto_collapse_groups_toggle":
        returnedValue = await BackgroundController.toggleAutoCollapseStatus()
        break
      case "auto_collapse_groups_callback":
        returnedValue = await BackgroundController.callbackAutoCollapseStatus()        
        break

    // sweep
      case "sweep_groups_to_beginning":
        returnedValue = await BackgroundController.sweepGroupsToBeginning()
        break
      case "sweep_groups_to_end":
        returnedValue = await BackgroundController.sweepGroupsToEnd()
        break
      case "sweep_ungrouped_tabs":
        returnedValue = await BackgroundController.sweepAllUnGroupedTabs()
        break

    // auto sweep into dust pile
      case "auto_sweep_ungrouped_tabs_status":
        returnedValue = await BackgroundController.getAutoSweepTabStatus()  
        break
      case "auto_sweep_ungrouped_tabs_toggle":
        returnedValue = await BackgroundController.toggleAutoSweepTabStatus()
        break
      case "auto_sweep_ungrouped_tabs_callback":
        returnedValue = await BackgroundController.callbackAutoSweepTabStatus()
        break

    // sorting
      case "set_sorting_rules" :
        returnedValue = await Sorting.setRules(input['arg1'])
        break
      case "get_sorting_rules" :
        returnedValue = await Sorting.getRules()
        break
      case "get_group_properties_keys":
        returnedValue = Sorting.getGroupPropertyKeys()
        break

    // flagging
      case "apply_flag":
        returnedValue = await BackgroundController.applyFlag(input['arg1'])
        break
      case "go_to_flag":
        returnedValue = await BackgroundController.goToFlag(input['arg1'])
        break

    // recall
      case "recall_tab":
        returnedValue = await TabRecall.activatePreviousTab()
        break
    // tab shortcuts
      case "last_tab":
        returnedValue = await BackgroundController.goToLastTab()
        break
      case "first_tab":
        returnedValue = await BackgroundController.goToFirstTab()
        break
      default:
        console.error(`unknown command: %c${message}`, "color:red")
    }

    if(callback) {
      console.log(`\treturned value: %c${JSON.stringify(returnedValue)}\n`, "color:green")
      callback(returnedValue)
    }
    return true
  }

  // tabs
  /**
   * Opens a new tab in the active group
   * Called from background_listeners.js
  */
  static async newTabInActiveGroup() {
    const currentTab = await BackgroundController.getActiveTab()
    const {id, groupId} = currentTab

    const createProperties = {
      active: true,
      openerTabId: id
    }
    const newTab = await Promises.chrome.tabs.create(createProperties)
    if(groupId > 0) {
      await Promises.chrome.tabs.group({groupId: groupId, tabIds: newTab.id})
    }
  }

  /**
   * Opens a new tab in a new group
  */
  static async newTabInNewGroup() {
    const createProperties = {active: true}
    const newTab = await Promises.chrome.tabs.create(createProperties)
    
    const groupOptions = {tabIds: newTab.id}
    await Promises.chrome.tabs.group(groupOptions)
  }

  /**
   * Sorts the highlighted tabs by running each through all sorting rules
  */
  static async sortHighlightedTabs() {
    const highlightedTabs = await BackgroundController.getHighlightedTabs()
    await BackgroundController.#sortTabsFrom(highlightedTabs)
  }

  /**
   * Sorts all tabs in the current window by running each through all sorting rules
  */
  static async sortAllTabsInWindow() {
    // get all tabs in window
    const tabs = await Promises.chrome.tabs.query({currentWindow: true})
    await BackgroundController.#sortTabsFrom(tabs)
  }

  /**
   * Sorts all tabs in all windows
   * Each tab is run through all sorting rules
  */
  static async sortAllTabs() {
    const allTabs = await Promises.chrome.tabs.query({})
    await BackgroundController.#sortTabsFrom(allTabs)
  }

  static async #sortTabsFrom(tabs) {
    const preSortActiveTab = await BackgroundController.getActiveTab()
    await Sorting.execute(tabs)
    
    const autoCollapseGroupEnabled = await BackgroundController.getAutoCollapseStatus()
    if(autoCollapseGroupEnabled) {
      const activeTab = await BackgroundController.getActiveTabFrom(preSortActiveTab.windowId)
      await BackgroundController.collapseOtherGroupsInWindow(activeTab)
    }
  }

  /**
   * Removes duplicate tabs (same url) from the group of highlighted tabs.
  */
  static async removeHighlightedDuplicateTabs() {
    const tabs = await BackgroundController.getHighlightedTabs()
    await BackgroundController.#removeDuplicateTabsFrom(tabs)
    return true;
  }
  
  /**
   * Removes duplicate tabs (same url) from the current window.
  */
  static async removeDuplicateTabsInWindow() {
    // get all tabs in window
    const tabs = await Promises.chrome.tabs.query({currentWindow: true})
    await BackgroundController.#removeDuplicateTabsFrom(tabs)
    
    return true;
  }
  
  /**
   * Removes duplicate tabs (same url) from all windows.
   *
  */
  static async removeDuplicateTabs() {
    const tabs = await Promises.chrome.tabs.query({})
    await BackgroundController.#removeDuplicateTabsFrom(tabs)
    return true;
  }

  static async #removeDuplicateTabsFrom(tabs) {
    let seenURLs = []  //  [{url: "http://www.x.com", id: 5, active: false}]
    for(const tab of tabs) {
      const searchResult = seenURLs.find(seenTab => seenTab.url === tab.url);
      if(searchResult) {
        // BUG - should respect focussed window when: multiple windows, each with duplicate active tab
        if(tab.active) {
          seenURLs = seenURLs.filter(seenTab => seenTab.url !== searchResult.url)
          seenURLs.push({url: tab.url, id: tab.id, active: tab.active})
          await Promises.chrome.tabs.remove(searchResult.id)
        } else {
          await Promises.chrome.tabs.remove(tab.id)
        }
      } 
      else {
        seenURLs.push({url: tab.url, id: tab.id, active: tab.active})
      }
    }
  }

  static async getActiveTab() {
    let queryOptions = { active: true, currentWindow: true }
    let tab = await Promises.chrome.tabs.query(queryOptions)
    return tab[0]
  }

  static async getActiveTabFrom(windowId) {
    let queryOptions = { active: true, windowId: windowId }
    let tab = await Promises.chrome.tabs.query(queryOptions)
    return tab[0]
  }

  static async getHighlightedTabs() {
    let queryOptions = { highlighted: true, currentWindow: true }
    let tabs = await Promises.chrome.tabs.query(queryOptions)
    return tabs
  }

  static async getFirstUnpinnedTabIndex() {
    let queryOptions = { pinned: false, currentWindow: true }
    let tabs = await Promises.chrome.tabs.query(queryOptions)
    if (tabs.length) {
      return tabs[0].index
    }
    return 0
  }
  
  static async stringifyAllTabs() {
    const tabs = await Promises.chrome.tabs.query({})
    console.log("%cAll Tabs:", "color:green")
    tabs.forEach(element => {
      console.log(JSON.stringify(element))
    })
  }

  // tabGroups
  /**
   * collapses all groups in the current window except the activeTab's
   * @param {Tab} activeTab see: https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab
  */
  static async collapseOtherGroupsInWindow(activeTab) {
    // get all non-collapsed groups in windowId
    const allGroups = await Promises.chrome.tabGroups.query({collapsed: false, windowId: activeTab.windowId})

    //filter groupId out of allGroups
    const filteredGroups = allGroups.filter(group => {
      return group.id != activeTab.groupId
    })

    // collapse filterGroups
    await BackgroundController.#collapseGroups(filteredGroups)
  }

  /**
   * Collapses all tabs groups in the current window
  */
  static async collapseAllGroupsInWindow() {
    // query for all non-collapsed groups in current window
    const {id} = await Promises.chrome.windows.getCurrent({})
    const queryInfo = {collapsed: false, windowId: id}
    const groups = await Promises.chrome.tabGroups.query(queryInfo)
    
    await BackgroundController.#collapseGroups(groups)
  }

  /**
   * Collapses all tabs groups in all windows
  */
  static async collapseAllGroups() {
    // query for all non-collapsed groups
    const queryInfo = {collapsed: false}
    const groups = await Promises.chrome.tabGroups.query(queryInfo)

    await BackgroundController.#collapseGroups(groups)
  }

  static async #collapseGroups(groups) {
    // for each group: update to collapsed: true
    const updateProperties = {collapsed: true}
    for(const group of groups) {
      await Promises.chrome.tabGroups.update(group.id, updateProperties)
    }
  }
  
  /**
   * Sweeps all groups to the first un-tabbed indexes while maintaining order.
  */
  static async sweepGroupsToBeginning() {
    const groupIndexes = await BackgroundController.getTabGroupIndexesInCurrentWindow()
    groupIndexes.sort( (a,b)=> {
      //we want ordered by index: greatest -> least
      if(a.index > b.index) {return -1} 
      if(a.index < b.index) {return 1}
      return 0
    })
    //determine which index to move tabs to
    const index = await BackgroundController.getFirstUnpinnedTabIndex()

    for(const groupIndex of groupIndexes) {
      await Promises.chrome.tabGroups.move(groupIndex.groupId, {index})
    }
  }
  
  /**
   * Sweeps all groups to the last indexes while maintaining order.
  */
  static async sweepGroupsToEnd() {
    const groupIndexes = await BackgroundController.getTabGroupIndexesInCurrentWindow()
    for(const groupIndex of groupIndexes) {
      await Promises.chrome.tabGroups.move(groupIndex.groupId, {index: -1})
    }
  }

  /**
   * Sweeps all ungrouped tabs into the dust group 
   */
   static async sweepAllUnGroupedTabs() {
    // get all ungrouped tabs
    const ungroupedTabs = await Promises.chrome.tabs.query({groupId: chrome.tabGroups.TAB_GROUP_ID_NONE})
    return await Sorting.moveToDustPile(ungroupedTabs)
  }

  /**
   * Get a tabGroupIndex for each tabGroup in the current window
   * @returns {Array.<Object>} array of tabGroupIndexes: {groupId, index}
   * 
  */
  static async getTabGroupIndexesInCurrentWindow() {
    const groupPositions = []
    const tabs = await Promises.chrome.tabs.query({})
    let currentGroupId = -1
    
    for(const tab of tabs) {
      if(tab.groupId != currentGroupId && tab.groupId != -1) {
        currentGroupId = tab.groupId
        groupPositions.push({groupId: tab.groupId, index: tab.index})
      }
    }
    return groupPositions
  }

  // auto sweep
  static async getAutoSweepTabStatus() {
    const KEY = "auto_sweep_ungrouped_tabs_status"
    const data = await Promises.chrome.storage.sync.get(KEY)
    console.log(`\tFetch: %c${JSON.stringify(data)}`, "color:green")

    if(Object.keys(data).length === 0) {
      return false
    }

    return data[KEY]
  }

  static async toggleAutoSweepTabStatus() {
    const KEY = "auto_sweep_ungrouped_tabs_status"
    const status = await BackgroundController.getAutoSweepTabStatus()
    const payload = {[KEY] : !status}
    console.log(`\tsetting to: %c${JSON.stringify(payload)}`, "color:green")
    return await Promises.chrome.storage.sync.set({[KEY] : !status})
  }

  static async callbackAutoSweepTabStatus() {
    const status = await BackgroundController.getAutoSweepTabStatus()
    
    if(status) {
      return await BackgroundController.sweepAllUnGroupedTabs()
    }
  }

  // autoCollapse
  static async getAutoCollapseStatus() {
    const KEY = "auto_collapse_groups_status"
    const data = await Promises.chrome.storage.sync.get(KEY)
    console.log(`\tFetch: %c${JSON.stringify(data)}`, "color:green")

    if(Object.keys(data).length === 0) {
      return false
    }

    return data[KEY]
  }

  static async toggleAutoCollapseStatus() {
    const key = "auto_collapse_groups_status"
    const status = await BackgroundController.getAutoCollapseStatus()
    const payload = {[key] : !status}
    console.log(`\tsetting to: %c${JSON.stringify(payload)}`, "color:green")
    return await Promises.chrome.storage.sync.set({[key] : !status})
  }

  static async callbackAutoCollapseStatus() {
    const status = await BackgroundController.getAutoCollapseStatus()
    
    if(status) {
      const activeTab = await BackgroundController.getActiveTab()
      return await BackgroundController.collapseOtherGroupsInWindow(activeTab)
    }
  }

  // flagging
  static async applyFlag(flagNumber) {
    const activeTab = await BackgroundController.getActiveTab()
    
    const flagTabResponse = await Flagging.flagTab(flagNumber, {tabId: activeTab.id})

    const tabGroupFlaggerResponce = await TabGroupFlagger.addTo(flagNumber, activeTab.groupId)
    return tabGroupFlaggerResponce
  }

  static async goToFlag(flagNumber) {
    return await Flagging.activateFlag(flagNumber) 
   }

   // tab shortcuts

   static async goToLastTab() {
    // query for all tabs in current window.
    const {tabs} = await Promises.chrome.windows.getCurrent({populate: true})
    const lastTab = tabs[tabs.length -1]
    const tabUpdate = await Promises.chrome.tabs.update(lastTab.id, {active: true})
    return true
   }

   static async goToFirstTab() {
    // query for all tabs in current window.
    const {tabs} = await Promises.chrome.windows.getCurrent({populate: true})
    const firstTab = tabs[0]
    const tabUpdate = await Promises.chrome.tabs.update(firstTab.id, {active: true})
    return true
   }
}