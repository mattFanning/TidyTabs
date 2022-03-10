importScripts('/src/wrappers.js');

/**
 * The rules and logic for sorting tabs.
 */
class Sorting {
  static getRules() {
    return [
      {address: "^https?://www.vai.com", groupProperties: {title: "Guitar", color: "grey"}},
      {address: "^https?://developer.chrome.com", groupProperties: {title: "Chrome API"}},
      {address: "^https?://(git.soma.salesforce.com|github.com)", groupProperties: {title: "Git", color: "green"}},
      {address: "^https?://gus.lightning.force.com", groupProperties: {title: "Gus", color: "blue"}},
      {address: "^chrome://extensions", groupProperties: {title: "🧩", color: "red"}},
      {address: "^https?://swarm.soma.salesforce.com", groupProperties: {title: "swarm", color: "yellow"}},
      {address: "^https?://api.jquery.com", groupProperties: {title: "jQuery"}}
    ]
  }
  /**
   * Executes the sorting functionality on the given tab.
   * @param {object} Tab see: https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab
  */
  static async executeOn(tab) {
    const {id, url, groupId, windowId} = tab
    const sortRules = Sorting.getRules()

    // run tab against each rule
    for (const rule of sortRules) {
      const regex = new RegExp(rule.address)
      if(regex.test(url)) {
        // current tab's url matches the sorting rule. Find or create group rule.groupName
        const groups = await Promises.chrome.tabGroups.query({title: rule.groupProperties.title}) 
        
        if(groups.length > 0) {
          // group already exists.  Move currentTab to it.  Re-activate currentTab
          console.log("Group found")
          const foundGroupId = groups[0].id
          
          // if tab is already sorted, don't do the work
          if(groupId !== foundGroupId) {
            await Promises.chrome.tabs.group({groupId: foundGroupId, tabIds: id})
            await Promises.chrome.tabs.update(id, {active: true})

            /* NOTE the current window will remain active if not empty after move!!
              If you choose to change this later, 
              https://developer.chrome.com/docs/extensions/reference/windows/#method-update */
          }
        } 
        else {
          //group doesn't exist yet.  Make it.  Move currentTab to it.
          console.log("Group not found")
          const newGroupId = await Promises.chrome.tabs.group({
            tabIds: id, 
            createProperties: {windowId: windowId}
          })
          const updateProperties = rule.groupProperties
          await Promises.chrome.tabGroups.update(newGroupId, updateProperties)
        }
      } 
    }
  }
}