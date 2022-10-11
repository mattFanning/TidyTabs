
class TabGroupFlagger{
  static #ALL_FLAGS = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"]
  static #EMPTY_FLAG_MAP = {
    "0️⃣": false, "1️⃣": false, "2️⃣": false, "3️⃣": false, "4️⃣": false,
    "5️⃣": false, "6️⃣": false, "7️⃣": false, "8️⃣": false, "9️⃣": false
  }

  static getFlagForIndex(flagIndex) {
    return TabGroupFlagger.#ALL_FLAGS[flagIndex]
  }

  static async updateAllTabGroupFlags() {
    // clear all tabGroup flags
    const groupPromises = new Array()
    const allGroups = await Promises.chrome.tabGroups.query({})
    for(const group of allGroups) {
      const titleComponents = TabGroupFlagger.getTitleComponents(group.title)
      groupPromises.push(Promises.chrome.tabGroups.update(group.id, {title: titleComponents.title}))
    }
    await Promise.all(groupPromises)
    
    // apply the flags to the appropriate groups.
    const allFlaggingTabInfo = await Flagging.getFlags()
    let index = -1
    for(const info of allFlaggingTabInfo) {
      index++
      if(Object.keys(info).length === 0) { 
        continue 
      }

      const tab = await Promises.chrome.tabs.get(info.tabId)
      if(tab === undefined) {
        //remove dead flag from Flagging
        Flagging.clearFlag(index)
        continue
      }
      const tabGroup = await Promises.chrome.tabGroups.get(tab.groupId)

      const updatedTitle = TabGroupFlagger.addFlagToTitleByIndex(index, tabGroup.title)
      await Promises.chrome.tabGroups.update(tabGroup.id, {title: updatedTitle})  
    }
    return true
  }

  static getTitleComponents(title) {
    const components = {flags: undefined, title: undefined}
    const results = TabGroupFlagger.#splitFlagsFromTitle(title)
    if(results) {
      components.flags = results[1]
      components.title = results[2]
    }
    else {
      components.title = title
    }
    return components
  }

  static #splitFlagsFromTitle(title) {
    const titleSplittingRegex = new RegExp("^([0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣]+)(.*)$","u")
    return title.match(titleSplittingRegex)
  }

  static addFlagToTitleByIndex(flagIndex, title) {
    const titleComponents = TabGroupFlagger.getTitleComponents(title)
    const updatedFlags = TabGroupFlagger.addToFlagChainByIndex(flagIndex, titleComponents.flags)
    return `${updatedFlags}${titleComponents.title}`
  }

  static addToFlagChainByIndex(flagIndex, flagChain) {
    const flagMap = TabGroupFlagger.flagChainToMap(flagChain)
    const flag = TabGroupFlagger.getFlagForIndex(flagIndex)
    flagMap[flag] = true
    return TabGroupFlagger.flagMapToChain(flagMap)
  }

  static flagChainToMap(flagChainString) {
    const flagMap = Object.assign({},TabGroupFlagger.#EMPTY_FLAG_MAP)
    TabGroupFlagger.#ALL_FLAGS.forEach(flag => {
      const isflagPresent = new RegExp(flag, "u")
      if(isflagPresent.test(flagChainString)) {
        flagMap[flag] = true
      }
    })
    return flagMap
  }

  static flagMapToChain(flagMap) {
    let flagString = ""
    if(flagMap['0️⃣']) flagString += '0️⃣'
    if(flagMap['1️⃣']) flagString += '1️⃣'
    if(flagMap['2️⃣']) flagString += '2️⃣'
    if(flagMap['3️⃣']) flagString += '3️⃣'
    if(flagMap['4️⃣']) flagString += '4️⃣'
    if(flagMap['5️⃣']) flagString += '5️⃣'
    if(flagMap['6️⃣']) flagString += '6️⃣'
    if(flagMap['7️⃣']) flagString += '7️⃣'
    if(flagMap['8️⃣']) flagString += '8️⃣'
    if(flagMap['9️⃣']) flagString += '9️⃣'
    return flagString
  }
}
