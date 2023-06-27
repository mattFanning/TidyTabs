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
  const autoFlag = /auto_flag/
  const recallTab = /recall_tab/
  const firstTab = /window_first_tab/
  const lastTab = /window_last_tab/
  const groupFirstTab = /group_first_tab/
  const groupLastTab = /group_last_tab/
  const sortHighlighted = /sort_highlighted/

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
    case autoFlag.test(command):
      BackgroundController.executeMessage({message: "auto_flag"})
      break
    case recallTab.test(command):
      BackgroundController.executeMessage({message: "recall_tab"})
      break
    case firstTab.test(command):
      BackgroundController.executeMessage({message: "window_first_tab"})
      break
    case lastTab.test(command):
      BackgroundController.executeMessage({message: "window_last_tab"})
      break
    case sortHighlighted.test(command):
      BackgroundController.executeMessage({message: "sort_highlighted_tabs"})
      break
    case groupFirstTab.test(command):
      BackgroundController.executeMessage({message: "group_first_tab"})
      break
    case groupLastTab.test(command):
      BackgroundController.executeMessage({message: "group_last_tab"})
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
  TabGroupFlagger.updateAllTabGroupFlags()
})

chrome.tabs.onRemoved.addListener(async (tab) => {
  TabGroupFlagger.updateAllTabGroupFlags()
})