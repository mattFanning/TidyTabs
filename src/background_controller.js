importScripts('/src/utils.js')
importScripts('/src/sorting.js') /*
  -> importScripts('/src/wrappers.js')
*/

/**
 * The controller of the background operations.
*/
 class BackgroundController {
  // messages
  /**
   * Executes the message string's command 
   * @param {string} message the command to execute
  */
  static async executeMessage(message) {
    console.log(`executing: %c${message}`, "color:green")
    switch(message) {
      case "new_tab_in_selected_group":
        await BackgroundController.newTabInActiveGroup()
        break
      case "new_tab_in_new_group":
        await BackgroundController.newTabInNewGroup()
        break

      case "sort_highlighted_tabs":
        await BackgroundController.sortHighlightedTabs()
        break
      case "sort_all_tabs":
        await BackgroundController.sortAllTabs()
        break

      case "collapse_all_groups_in_window":
        await BackgroundController.collapseAllGroupsInWindow()
        break
      case "collapse_all_groups":
        await BackgroundController.collapseAllGroups()
        break

      case "sweep_groups_to_beginning":
        await BackgroundController.sweepGroupsToBeginning()
        break
      case "sweep_groups_to_end":
        await BackgroundController.sweepGroupsToEnd()
        break
      
      // case "auto_collapse_groups_status":
      //   return AUTO_COLLAPSE_ENABLED
      // case "auto_collapse_groups_toggle":
      //   AUTO_COLLAPSE_ENABLED = !AUTO_COLLAPSE_ENABLED
      //   return AUTO_COLLAPSE_ENABLED

      default:
        console.error(`unknown command: %c${message}`, "color:red")
    }
  }

  // tabs
  /**
   * Opens a new tab in the active group
   * Called from background_listeners.js
  */
  static async newTabInActiveGroup() {
    const tabGroups = await Promises.chrome.tabGroups.query({})
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
   
    for (const tab of highlightedTabs) {
        await Sorting.executeOn(tab)
    }
  }

  /**
   * Sorts all tabs in all windows
   * Each tab is run through all sorting rules
  */
  static async sortAllTabs() {
    const allTabs = await Promises.chrome.tabs.query({})
    for (const tab of allTabs) {
        await Sorting.executeOn(tab)
    }
  }

  static async getActiveTab() {
    let queryOptions = { active: true, currentWindow: true }
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
    return 0;
  }
  
  static async stringifyAllTabs() {
    const tabs = await Promises.chrome.tabs.query({})
    console.log("%cAll Tabs:", "color:green")
    printArray(tabs)
  }

  // tabGroups
  /**
   * collapses all other groups in the current window than the activeInfo's
   * @param {object} activeInfo see: https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated
  */
  static async collapseOtherGroupsInWindow(activeInfo) {
    const {tabId, windowId} = activeInfo
    // get all non-collapsed groups in windowId
    const allGroups = await Promises.chrome.tabGroups.query({collapsed: false, windowId})

    // get the Tab for tabId and grab it's groupId
    const activeTab = await Promises.chrome.tabs.get(tabId)
    const {groupId} = activeTab
    
    //filter groupId out of allGroups
    const filteredGroups = allGroups.filter(group=>{
      return group.id != groupId
    })

    // collapse filterGroups
    await BackgroundController.collapseGroups(filteredGroups)
  }

  /**
   * Collapses all tabs groups in the current window
  */
  static async collapseAllGroupsInWindow() {
    // query for all non-collapsed groups in current window
    const {id} = await Promises.chrome.windows.getCurrent({})
    const queryInfo = {collapsed: false, windowId: id}
    const groups = await Promises.chrome.tabGroups.query(queryInfo)
    
    await BackgroundController.collapseGroups(groups)
  }

  /**
   * Collapses all tabs groups in all windows
  */
  static async collapseAllGroups() {
    // query for all non-collapsed groups
    const queryInfo = {collapsed: false}
    const groups = await Promises.chrome.tabGroups.query(queryInfo)

    await BackgroundController.collapseGroups(groups)
  }

  static async collapseGroups(groups) {
    // for each group: update to collapsed: true
    const updateProperties = {collapsed: true}
    for(const group of groups) {
      await Promises.chrome.tabGroups.update(group.id, updateProperties)
    }
  }
  
  /**
   * Sweeps all groups to the first untabbed indexes while maintaining order.
  */
  static async sweepGroupsToBeginning() {
    const groupIndexes = await BackgroundController.getTabGroupIndexesInCurrentWindow()
    groupIndexes.sort( (a,b)=> {
      //we want ordered by index: greatest -> least
      if(a.index > b.index) {return -1} 
      if(a.index < b.index) {return 1}
      return 0
    });
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

  static async stringifyAllTabGroups() {
    const tabGroups = await Promises.chrome.tabGroups.query({})
    console.log(`%cAll Tab Groups:`, `color:green`)
    printArray(tabGroups)
  }
}