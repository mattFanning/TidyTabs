importScripts('/src/utils.js')
importScripts('/src/sorting.js') /*
  -> importScripts('/src/wrappers.js')
*/

/**
 * The controller of the background operations.
*/
 class BackgroundController {
  /**
   * Opens a new tab in the active group
   * Called from background_listeners.js
  */
  static async newTabInActiveGroup() {
    const tabGroups = await Wrappers.chromeTabGroupsQuery({})
    const currentTab = await BackgroundController.getActiveTab()
    const {id, groupId} = currentTab

    const createProperties = {
      active: true,
      openerTabId: id
    }
    const newTab = await Wrappers.chromeTabsCreate(createProperties)
    if(groupId > 0) {
      await Wrappers.chromeTabsGroup({groupId: groupId, tabIds: newTab.id})
    }
  }

  /**
   * Opens a new tab in a new group
   * Called from background_listeners.js
  */
  static async newTabInNewGroup() {
    const createProperties = {
      active: true
    }
    const newTab = await Wrappers.chromeTabsCreate(createProperties)
    
    const groupOptions = {
      tabIds: newTab.id
    }
    await Wrappers.chromeTabsGroup(groupOptions)
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
    const allTabs = await Wrappers.chromeTabsQuery({})
    for (const tab of allTabs) {
        await Sorting.executeOn(tab)
    }
  }

  /**
   * Collapses all tabs groups in the current window
  */
  static async collapseAllGroupsInWindow() {
    // query for all non-collapsed groups in current window
    const {id} = await Wrappers.chromeWindowsGetCurrent({})
    const queryInfo = {collapsed: false, windowId: id}
    const groups = await Wrappers.chromeTabGroupsQuery(queryInfo)
    
    await BackgroundController.collapseGroups(groups)
  }

  /**
   * Collapses all tabs groups in all windows
  */
  static async collapseAllGroups() {
    // query for all non-collapsed groups
    const queryInfo = {collapsed: false}
    const groups = await Wrappers.chromeTabGroupsQuery(queryInfo)

    await BackgroundController.collapseGroups(groups)
  }

  static async collapseGroups(groups) {
    // for each group: update to collapsed: true
    const updateProperties = {collapsed: true}
    for(const group of groups) {
      await Wrappers.chromeTabGroupsUpdate(group.id, updateProperties)
    }
  }
  
  static async getActiveTab() {
    let queryOptions = { active: true, currentWindow: true }
    let tab = await Wrappers.chromeTabsQuery(queryOptions)
    return tab[0]
  }

  static async getHighlightedTabs() {
    let queryOptions = { highlighted: true, currentWindow: true }
    let tabs = await Wrappers.chromeTabsQuery(queryOptions)
    return tabs
  }

  static async stringifyAllTabGroups() {
    const tabGroups = await Wrappers.chromeTabGroupsQuery({})
    console.log(`%cAll Tab Groups:`, `color: ${GREEN}`)
    printArray(tabGroups)
  }
  
  static async stringifyAllTabs() {
    const tabs = await Wrappers.chromeTabsQuery({})
    console.log(`%cAll Tabs:`, `color: ${GREEN}`)
    printArray(tabs)
  }
}