importScripts('/background/background_controller.js') /*
  -> importScripts('/background/tab_recall.js')
  -> importScripts('/promises.js')
*/

/**
 * Called when the user executes the extension's commands via keyword. 
 * @listens chrome.commands.onCommand
*/
chrome.commands.onCommand.addListener((command) => {
  //all of this is required simply so I can arrange the order of commmands in the extension shortcuts view.
  const goToFlag = /go_to_flag_\d/
  const applyFlag = /apply_flag_\d/
  const recallTab = /recall_tab/
  const firstTab = /first_tab/
  const lastTab = /last_tab/

  let specificFlagNumber;
  switch(true) {
    case goToFlag.test(command):
      specificFlagNumber = command.slice(command.length -1, command.length)
      BackgroundController.executeMessage({message: "go_to_flag", arg1: specificFlagNumber})
      break
    case applyFlag.test(command):
      specificFlagNumber = command.slice(command.length -1, command.length)
      BackgroundController.executeMessage({message: "apply_flag", arg1: specificFlagNumber})
      break
    case recallTab.test(command):
      BackgroundController.executeMessage({message: "recall_tab"})
      break
    case firstTab.test(command):
      BackgroundController.executeMessage({message: "first_tab"})
      break
    case lastTab.test(command):
      BackgroundController.executeMessage({message: "last_tab"})
      break
    default:
      BackgroundController.executeMessage(command)
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    BackgroundController.executeMessage(message, sendResponse)
    return true
})

chrome.runtime.onInstalled.addListener(() => {
  console.log('Tidy Tabs! %cinstalled', "color:green")
})

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Unchecked runtime.lastError: Tabs cannot be edited right now (user may be dragging a tab).
  setTimeout(async () => {
    await TabRecall.addTabInfo(activeInfo)
    if(await BackgroundController.getAutoCollapseStatus()) {
      const tab = await Promises.chrome.tabs.get(activeInfo.tabId)
      await BackgroundController.collapseOtherGroupsInWindow(tab)
    }
  }, 500)
})

chrome.tabs.onCreated.addListener(async (tab) => {
  setTimeout(async () => {
    if(await BackgroundController.getAutoSweepTabStatus() && 
       tab.groupId == chrome.tabGroups.TAB_GROUP_ID_NONE) {
      await BackgroundController.sweepAllUnGroupedTabs()
    }
  }, 500)
})

chrome.tabs.onRemoved.addListener(async (tab) => {
  TabGroupFlagger.updateAllTabGroupFlags()
})