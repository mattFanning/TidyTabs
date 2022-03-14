importScripts('/src/background_controller.js') /*
  -> importScripts('/src/utils.js')
*/

/**
 * Called when the user executes the extension's commands via keyword. 
 * @listens chrome.commands.onCommand
*/
chrome.commands.onCommand.addListener((command) => {
  BackgroundController.executeMessage(command)
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
  }, 100)
})