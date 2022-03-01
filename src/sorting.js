importScripts('/src/wrappers.js');

/**
 * The rules and logic for sorting tabs.
 */
class Sorting {
  static getRules() {
    return [
      {address: "https?://www.vai.com/*", groupProperties: {title: "Guitar", color: "grey"}},
      {address: "https?://developer.chrome.com/*", groupProperties: {title: "Chrome API"}}
    ]
  }
  static async executeOn(tab) {
    const {id, url, groupId, windowId} = tab
    const sortRules = Sorting.getRules()

    // run tab against each rule
    for (const rule of sortRules) {
      const regex = new RegExp(rule.address)
      if(regex.test(url)) {
      // current tab's url matches the sorting rule. Find or create group rule.groupName
      const groups = await Wrappers.chromeTabsGroupsQuery({title: rule.groupProperties.title}) 
      
      if(groups.length > 0) {
        // group already exists.  Move currentTab to it.  Re-activate currentTab
        console.log("Group found")
        const foundGroupId = groups[0].id
        
        // if tab is already sorted, don't do the work
        if(groupId !== foundGroupId) {
          await Wrappers.chromeTabsGroup({groupId: foundGroupId, tabIds: id})
          await Wrappers.chromeTabsUpdate(id, {active: true})

          /* NOTE the current window will remain active if not empty after move!!
            If you choose to change this later, 
            https://developer.chrome.com/docs/extensions/reference/windows/#method-update */
        }
      } 
      else {
        //group doesn't exist yet.  Make it.  Move currentTab to it.
        console.log("Group not found")
        const newGroupId = await Wrappers.chromeTabsGroup({
          tabIds: id, 
          createProperties: {windowId: windowId}
        })
        const updateProperties = rule.groupProperties
        await Wrappers.chromeTabsGroupsUpdate(newGroupId, updateProperties)
      }
      }
    }
  }
}