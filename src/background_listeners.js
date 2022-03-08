importScripts('/src/background_controller.js') /*
  -> importScripts('/src/utils.js')
*/

/**
 * Called when the user executes the extension's commands via keyword. 
 * @listens chrome.commands.onCommand
*/
chrome.commands.onCommand.addListener((command) => {
  console.log(`message: %c${command}\n%csent by: %ckeyboard commands`, 
    "color:green","color:white","color:green")
  BackgroundController.executeMessage(command)
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`message: %c${message}\n%csent by: %c${JSON.stringify(sender)}`, 
    "color:green","color:white","color:green")
    BackgroundController.executeMessage(message)
})

chrome.runtime.onInstalled.addListener(() => {
  console.log('Tidy Tabs! %cinstalled', "color:green")
})

chrome.tabs.onActivated.addListener(activeInfo=> {
  // Unchecked runtime.lastError: Tabs cannot be edited right now (user may be dragging a tab).
  setTimeout(() => {
    if(AUTO_COLLAPSE_ENABLED) {
      BackgroundController.collapseOtherGroupsInWindow(activeInfo)
    }
  }, 100);
})

let AUTO_COLLAPSE_ENABLED = true