importScripts('/src/background_controller.js'); /*
  -> importScripts('/src/utils.js')
*/

/**
 * Called when the user executes the browser actions via keyword commands. 
 * @listens chrome.commands.onCommand
 */
 chrome.commands.onCommand.addListener(function (command) {
  switch(command) {
    case 'new_tab_in_selected_group':
      console.log("executing %cnew_tab_in_selected_group", "color:green")
      BackgroundController.newTabInActiveGroup()
      break
    case 'new_tab_in_new_group':
      console.log("executing %cnew_tab_in_new_group", "color:green")
      BackgroundController.newTabInNewGroup()
      break
    case 'sort_highlighted_tabs':
      console.log("executing %csort_highlighted_tabs", "color:green")
      BackgroundController.sortHighlightedTabs()
      break
    case 'sort_all_tabs':
      console.log("executing %csort_all_tabs", "color:green")
      BackgroundController.sortAllTabs()
      break
    case 'collapse_all_groups_in_window':
      console.log("executing %ccollapse_all_groups_in_window", "color:green")
      BackgroundController.collapseAllGroupsInWindow()
      break
    case 'collapse_all_groups':
      console.log("executing %ccollapse_all_groups", "color:green")
      BackgroundController.collapseAllGroups()
      break
    default:
      console.error(`unknown command: %c${command}`, "color:red")
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Tidy Tabs! %cinstalled', "color:green")
  // console.log("Test\n\n%cTest\n\n%cTest", "color:red;", "color:blue;");
});