
class TabGroupFlagger{
  static #ALL_FLAGS = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"]
  
  static async addTo(flagId, groupId) {
    // get current info for groupId
    const group = await Promises.chrome.tabGroups.get(groupId)
    if(group == undefined) {
      return
    }

    console.log(`TabGroup.title:\t${group.title}`)
    let title = group.title
    const flagMap = TabGroupFlagger.#emptyFlagMap()

    const splitResult = TabGroupFlagger.#splitFlagsFromTitle(group.title)
    if(splitResult) {
      //already had flags;  update flagMap before adding new flag
      const orignalChain = splitResult[1]  //[0]=flags+title; [1]=flags; [2]=title
      console.log(`original emoji chain:\t${orignalChain}`)
      TabGroupFlagger.#updateFlagMapWith(flagMap, orignalChain)
      title = splitResult[2]
    }

    //add new flag
    flagMap[TabGroupFlagger.#ALL_FLAGS[flagId]] = true

    //build the updated emoji chain
    const updatedChain = TabGroupFlagger.#flagMapToString(flagMap)
    console.log(`new emoji chain:     \t${updatedChain}`)

    //attach the new chain to the actual title
    const updatedTitle = `${updatedChain}${title}`
    console.log(`updated title:\t${updatedTitle}`)
    return await Promises.chrome.tabGroups.update(groupId, {title: updatedTitle})
  }

  static async updateAllTabGroupFlags() {
    const allGroups = await Promises.chrome.tabGroups.query({})
    allGroups.forEach(async group => {
      const titleComponents = TabGroupFlagger.getTitleComponents(group.title)
      const flagMap = TabGroupFlagger.#emptyFlagMap()
      const storedFlagArray = await Flagging.getFlags() // [{tabId:x, windowId:y},{},{tabId:x, windowId:y},{},{}]
      const groupTabs = await Promises.chrome.tabs.query({groupId: group.id})
      groupTabs.forEach(tab => {
        const index = storedFlagArray.findIndexOf(flaggingTabInfo => {
          flaggingTabInfo.tabId == tab.id && flaggingTabInfo.windowId == tab.windowId
        })
        if(index > -1) {
          flagMap[index] = true
        }
      })
      // convert flagMap to emoji String
      const flagChain = TabGroupFlagger.#flagMapToString(flagMap)

      // update groups title with emoji chain
      await Promises.chrome.tabGroups.update(group.id, {title: `${flagChain}${titleComponents.title}`})
    })
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

  static #emptyFlagMap() {
    return {
      "0️⃣": false, "1️⃣": false, "2️⃣": false, "3️⃣": false, "4️⃣": false,
      "5️⃣": false, "6️⃣": false, "7️⃣": false, "8️⃣": false, "9️⃣": false
    }
  }

  static #updateFlagMapWith(flagMap, flagChainString) {
    TabGroupFlagger.#ALL_FLAGS.forEach(flag => {
      const flagPresent = new RegExp(flag, "u")
      if(flagPresent.test(flagChainString)) flagMap[flag] = true
    })
  }

  static #flagMapToString(flagMap) {
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
