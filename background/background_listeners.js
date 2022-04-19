importScripts('/background/background_controller.js') /*
*/

/**
 * Called when the user executes the extension's commands via keyword. 
 * @listens chrome.commands.onCommand
*/
chrome.commands.onCommand.addListener((command) => {
  const goToFlag = /go_to_flag_\d/
  const applyFlag = /apply_flag_\d/
  
  if (goToFlag.test(command)) {
    const specificFlagNumber = command.slice(command.length -1, command.length)
    BackgroundController.executeMessage({message: "go_to_flag", arg1: specificFlagNumber})
  }
  else if (applyFlag.test(command)) {
    const specificFlagNumber = command.slice(command.length -1, command.length)
    BackgroundController.executeMessage({message: "apply_flag", arg1: specificFlagNumber})
  }
  else {
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
    if(await BackgroundController.getAutoCollapseStatus()) {
      BackgroundController.collapseOtherGroupsInWindow(activeInfo)
    }
  }, 500)
})