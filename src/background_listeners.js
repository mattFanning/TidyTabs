importScripts('/src/background_controller.js') /*
  -> importScripts('/src/utils.js')
*/

/**
 * Called when the user executes the extension's commands via keyword. 
 * @listens chrome.commands.onCommand
*/
chrome.commands.onCommand.addListener((command) => {
  console.log(`chrome.commands.onCommand.addListener\n\tmessage: %c${command}\n\t%csent by: %ckeyboard commands`, 
    "color:green","color:white","color:green")
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