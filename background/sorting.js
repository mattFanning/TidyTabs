/*importScripts('/wrappers.js') <- already included thru parent*/


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
   * Executes the sorting functionality on the given tab.
   * @param {object} Tab see: https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab
  */
  static async executeOn(tab) {
    const {id, url, groupId, windowId} = tab
    const sortRules = await Sorting.getRules()

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