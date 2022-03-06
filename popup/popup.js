class Popup {

  static async renderBody() {
    const $buttonGroupTabs = $("<div>", {id: "button_group_tabs", class: "command_groups border_grey"})
    const $buttonGroupSort = $("<div>", {id: "button_group_sort", class: "command_groups border_blue"})
    const $buttonGroupCollapse = $("<div>", {id: "button_group_collapse", class: "command_groups border_red"})
    const $buttonGroupSweep = $("<div>", {id: "button_group_sweep", class: "command_groups border_yellow"})

    $buttonGroupTabs
      .append(Popup.label('Tabs', 'grey'))
      .append(Popup.button({label:'New Tab In Selected Group', sendMessage:'new_tab_in_selected_group', hoverClass:"button_hover_grey"}))
      .append(Popup.button({label:'New Tab In New Group', sendMessage:'new_tab_in_new_group', hoverClass:"button_hover_grey"}))

    $buttonGroupSort
      .append(Popup.label('Sort', 'blue'))
      .append(Popup.button({label:'Sort Highlighted Tabs', sendMessage:'sort_highlighted_tabs', hoverClass:"button_hover_blue"}))
      .append(Popup.button({label:'Sort All Tabs', sendMessage:'sort_all_tabs', hoverClass:"button_hover_blue"}))

    $buttonGroupCollapse
      .append(Popup.label('Collapse', 'red'))
      .append(Popup.button({label: 'Collapse All Groups In Window', sendMessage:'collapse_all_groups_in_window', hoverClass:"button_hover_red"}))
      .append(Popup.button({label: 'Collapse All Groups', sendMessage:'collapse_all_groups', hoverClass:"button_hover_red"}))

    $buttonGroupSweep
      .append(Popup.label('Sweep', 'yellow'))
      .append(Popup.button({label:'Sweep Groups To Beginning', sendMessage:'sweep_groups_to_beginning', hoverClass:"button_hover_yellow"}))
      .append(Popup.button({label:'Sweep Groups To End', sendMessage:'sweep_groups_to_end', hoverClass:"button_hover_yellow"}))
    
    $("body")
      .append($buttonGroupTabs)
      .append($buttonGroupSort)
      .append($buttonGroupCollapse)
      .append($buttonGroupSweep)
  }

  static button(buttonOptions) {
    console.log(JSON.stringify(buttonOptions))
    const {label, sendMessage, hoverClass} = buttonOptions
    let $div = $("<div>", {"class": `popup_button`})
    $div
      .append(`<b>${label}</b>`)
      .click(()=>{Promises.chrome.runtime.sendMessage(sendMessage)})
      .hover(
        function () { 
          console.log("you're hovering!")
          $(this).addClass(hoverClass) }, 
        function () { $(this).removeClass(hoverClass) }
      )

    return $div
  }

  static label(title, color) {
    let $div = $("<div>", {"class": `popup_label background_${color}`})
    $div.append(`<b>${title}</b>`)
    
    return $div
  }

}

// script execution
Popup.renderBody()