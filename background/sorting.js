/*importScripts('/promises.js') <- already included thru parent*/


/**
 * The rules and logic for sorting tabs.
 */
class Sorting {
  static #STORE_KEY = "sorting_rules"
  static #GROUP_PROPERTY_KEYS = ["title", "color", "collapsed"]

  static getSampleRules() {
    return [
      {address: "^https?://www.vai.com", groupProperties: {title: "Guitar", color: "grey", collapsed: true}},
      {address: "^https?://developer.chrome.com", groupProperties: {title: "Chrome API", color: "purple"}},
      {address: "^https?://(git.soma.salesforce.com|github.com)", groupProperties: {title: "Git", color: "green"}},
      {address: "^https?://gus.lightning.force.com", groupProperties: {title: "Gus", color: "blue"}},
      {address: "^chrome://extensions", groupProperties: {title: "🧩", color: "red"}},
      {address: "^https?://swarm.soma.salesforce.com", groupProperties: {title: "swarm", color: "yellow"}},
      {address: "^https?://api.jquery.com", groupProperties: {title: "jQuery"}},
      {address: `^https?://(sfciteam.sfci.buildndeliver-s.aws-esvc1-useast2.aws.sfdc.cl/|a360-qualityci.slb.sfdc.net/)`, groupProperties: {title: "Jenkins", color: "pink"}},
      {address: `^https://confluence.internal.salesforce.com`, groupProperties: {title: "Confluence", color: "cyan"}},
      {address: `^https?://salesforce.quip.com`, groupProperties: {title: "Quip", color: "orange"}},
    ]
  }

  /**
   * Fetches the rules from storage.
   * @async
   * @returns {SortingRule[]} The fetched rule set
   */
  static async getRules() {
    const response = await Promises.chrome.storage.sync.get(Sorting.#STORE_KEY)
    if(Object.keys(response).length <= 0) {
      const emptyRules = []
      return emptyRules
    }
    return response[Sorting.#STORE_KEY]
  }

  /**
   * Stores the argument ruleset
   * @param {SortingRule[]} rules the ruleset to store
   * @returns {boolean} the result of chrome.storage.sync
  */
  static async setRules(rules) {
    const payload = {[Sorting.#STORE_KEY] : rules}
    return await Promises.chrome.storage.sync.set(payload)
  }

  /**
   * Executes the sorting functionality on the array of tabs.
   * @param {Tab[]} tabs see: https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab
  */
  static async execute(tabs) {
    const sortRules = await Sorting.getRules()
    for (const rule of sortRules) {
      //for each rule, determine which tabs match for sorting.
      const ruleAddressRegex = new RegExp(rule.address)
      const regexMatchedTabs = tabs.filter(tab => ruleAddressRegex.test(tab.url))
      if(regexMatchedTabs.length <= 0) {
        continue  //nothing to do if no tabs match this rule
      }

      const matchedTabIds = regexMatchedTabs.map(tab => tab.id)

      //determine if the sorting group already exists or if we have to create.
      const matchedGroups = await Sorting.findGroupByTitle("all", rule.groupProperties.title)
      if(matchedGroups.length > 0) {
        // console.log("Group found")
        const matchedGroupId = matchedGroups[0].id  
        await Promises.chrome.tabs.group({groupId: matchedGroupId, tabIds: matchedTabIds})
      } 
      else {
        // console.log("Group not found. Creating")
        const preSortActiveTab = await BackgroundController.getActiveTab()
        const newGroupId = await Promises.chrome.tabs.group({
          tabIds: matchedTabIds, 
          createProperties: {windowId: preSortActiveTab.windowId}
        })
        const updateProperties = rule.groupProperties
        await Promises.chrome.tabGroups.update(newGroupId, updateProperties)
      }
    }
    
  }

  /**
   * Moves all tabs into "dust pile" group
   * @param {Tab[]} tabs see: https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab
   */
  static async moveToDustPile(tabs) {
    console.log('moveToDustPile executed')
    if(tabs.length <= 0) {
      return false
    }

    let dustGroupIds = []
    
    const windowIds = [...new Set(tabs.map(item => item.windowId))];
    
    for(let i = 0; i < windowIds.length; i++) {
      const tabIds = tabs.filter(tab => {
        if(tab.windowId == windowIds[i]) {
          return tab.id
        }
      }).map(tab => tab.id)
      
      //determine if the dust group already exists or if we have to create.
      const groups = await Sorting.findGroupByTitle(windowIds[i],"💭")
      if(groups.length > 0) {
        // console.log("dustGroup found")
        const dustGroupId = groups[0].id
        await Promises.chrome.tabs.group({groupId: dustGroupId, tabIds: tabIds})
        dustGroupIds.push(dustGroupId)
      }
      else {
        // console.log("dustGroup not found")
        const newGroupId = await Promises.chrome.tabs.group({
          tabIds: tabIds, 
          createProperties: {windowId: windowIds[i]}
        })
        const updateProperties = {title: "💭"}
        await Promises.chrome.tabGroups.update(newGroupId, updateProperties)
        dustGroupIds.push(newGroupId)
      }
    }
    return dustGroupIds
  }

  static async findGroupByTitle(windowId, groupTitle) {
    const FLAGS = "[0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣]*"
    const ruleTitleRegex = new RegExp(`^${FLAGS}${groupTitle}$`, "u")
    
    let allGroups
     if(windowId == "all") {
      allGroups = await Promises.chrome.tabGroups.query({})
     } else {
      allGroups = await Promises.chrome.tabGroups.query({windowId: windowId})
     }
    return allGroups.filter(group => ruleTitleRegex.test(group.title))
  }


  static getGroupPropertyKeys() {
    return Sorting.#GROUP_PROPERTY_KEYS
  }
}

/**
 * A payload containing a regex rule for tab matching, 
 * and a GroupProperties payload for group matching / creation.
 * @typedef {object} SortingRule
 * @property {string} address - the regex to match against a tab's url.
 * @property {GroupProperties} groupProperties - the payload of group info for creation and sorting.
 */

/**
 * A payload of info for group creation / matching during the sorting process.
 * @typedef {object} GroupProperties
 * @property {string} title
 * @property {string} [color]
 * @property {boolean} [collapsed]
 */