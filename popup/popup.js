class Popup {

  static async renderBody() {
    $("body")
      .append(Popup.buttonGroup(
        {color:'grey', label:'New Tab', buttons:[
          {label:'In Active Group', message:'new_tab_in_selected_group'},
          {label:'In New Group', message:'new_tab_in_new_group'}] 
      }))
      .append(Popup.buttonGroup(
        {color:'blue', label:'Sort', buttons:[
          {label:'Highlighted Tabs', message:'sort_highlighted_tabs'},
          {label:'All Tabs', message:'sort_all_tabs'}] 
      }))
      .append(Popup.buttonGroup(
        {color:'red', label:'Collapse', buttons:[
          {label:'All Groups In Current Window', message:'collapse_all_groups_in_window'},
          {label:'All Groups In All Windows', message:'collapse_all_groups'}]
          //@WIP
          // {type: 'toggle', label:'Inactive Groups Automatically', message:'auto_collapse_groups'}] 
      }))
      .append(Popup.buttonGroup(
        {color:'yellow', label:'Sweep', buttons:[
          {label:'Groups To Beginning', message:'sweep_groups_to_beginning'},
          {label:'Groups To End', message:'sweep_groups_to_end'}] 
      }))
  }

  static buttonGroup(buttonGroupOptions) {  
    //{color: string, label: string, buttons:[ {type: string?,label: string, message: string},{label: string, message: string} ]}
    const {type, color, label, buttons} = buttonGroupOptions
    
    const $buttonGroup = $("<div>", {id: "button_group_tabs", class: `button_group border_${color}`})
    $buttonGroup
      .append(Popup.label(label, color))
    for(const button of buttons) {
      switch(type) {
        case 'toggle':
          break
        default:
          $buttonGroup.append(Popup.button({type, color, label: button.label, message: button.message}))
      }
    }

    return $buttonGroup
  }

  static button(buttonOptions) {
    console.log(JSON.stringify(buttonOptions))
    const {color, label, message} = buttonOptions
    const hoveringClasses = `button_hover_margins button_hover_${color}`
    let $div = $("<div>", {"class": `button`})
    $div
      .append(`<b>${label}</b>`)
      .click(()=>{Promises.chrome.runtime.sendMessage(message)})
      .hover(
        function () { $(this).addClass(hoveringClasses) }, 
        function () { $(this).removeClass(hoveringClasses) }
      )

    return $div
  }

  /**
   * @WIP 
  */
  // static toggleButton(buttonOptions) {
  //   console.log(JSON.stringify(buttonOptions))
  //   const {label, sendMessage, hoverClass} = buttonOptions
  //   let $div = $("<div>", {"class": `button`})
  //   $div
  //     .append(`<b>${label}</b>`)
  //     .click(()=>{Promises.chrome.runtime.sendMessage(sendMessage)})
  //     .hover(
  //       function () { 
  //         console.log("you're hovering!")
  //         $(this).addClass(hoverClass) }, 
  //       function () { $(this).removeClass(hoverClass) }
  //     )

  //   return $div
  // }

  static label(title, color) {
    let $div = $("<div>", {"class": `group_label background_${color}`})
    $div.append(`<b>${title}</b>`)
    
    return $div
  }

}

// script execution
Popup.renderBody()