class Popup {

  static async renderBody() {
    const $newTab = await Popup.buttonGroup({color:'grey', label:'New Tab', buttons:[
      {label:'In Active Group', message:'new_tab_in_selected_group'},
      {label:'In New Group', message:'new_tab_in_new_group'}] 
    })
    const $sort = await Popup.buttonGroup({color:'blue', label:'Sort', buttons:[
      {label:'Highlighted Tabs', message:'sort_highlighted_tabs'},
      {label:'All Tabs', message:'sort_all_tabs'}] 
    })
    const $collapse = await Popup.buttonGroup({color:'red', label:'Collapse', buttons:[
      {label:'All Groups In Current Window', message:'collapse_all_groups_in_window'},
      {label:'All Groups In All Windows', message:'collapse_all_groups'},
      {type: 'toggle', label:'Inactive Groups Automatically', messageGroup:'auto_collapse_groups'}] 
    })
    const $sweep = await Popup.buttonGroup({color:'yellow', label:'Sweep', buttons:[
      {label:'Groups To Beginning', message:'sweep_groups_to_beginning'},
      {label:'Groups To End', message:'sweep_groups_to_end'}] 
    })
    $("body").empty()
      .append($newTab)
      .append($sort)
      .append($collapse)
      .append($sweep)
  }

  static async buttonGroup(buttonGroupOptions) {  
    //{color: string, label: string, buttons:[ {label: string, message: string},{type: 'toggle' label: string, messageGroup: string} ]}
    const {color, label, buttons} = buttonGroupOptions
    
    const $buttonGroup = $("<div>", {class: `button_group border_${color}`})
    $buttonGroup
      .append(Popup.label(label, color))
    for(const button of buttons) {
      const {type} = button
      switch(type) {
        case 'toggle':
          const $toggleButton = await Popup.toggleButton({color, label: button.label, messageGroup: button.messageGroup})
          $buttonGroup.append($toggleButton)
          break
        default:
          $buttonGroup.append(Popup.button({color, label: button.label, message: button.message}))
      }
    }

    return $buttonGroup
  }

  static button(buttonOptions) {
    // console.log(JSON.stringify(buttonOptions))
    const {color, label, message} = buttonOptions
    const hoveringClasses = `button_hover_margins button_hover_${color}`
    const $div = $("<div>", {"class": `button`})
    $div
      .append(`<b>${label}</b>`)
      .click(()=>{Promises.chrome.runtime.sendMessage(message)})
      .hover(
        function () { $(this).addClass(hoveringClasses) }, 
        function () { $(this).removeClass(hoveringClasses) }
      )

    return $div
  }

  static async toggleButton(buttonOptions) {
    // console.log(JSON.stringify(buttonOptions))
    const {color, label, messageGroup} = buttonOptions
    const hoveringClasses = `button_hover_margins button_hover_${color}`
    const $div = $("<div>", {"class": `button toggle_button`})
    
    // determine led color
    const status = await Promises.chrome.runtime.sendMessage(`${messageGroup}_status`)
    const ledColor = status ? 'green' : 'red'
    const $led = $("<div>", {"id": `${messageGroup}_led`, "class": `toggle_led background_${ledColor}`})

    $div
      .append($led)  
      .append(`<b>${label}</b>`)
      .click(async () => {
        const newStatus = await Promises.chrome.runtime.sendMessage(`${messageGroup}_toggle`)
        const newColor = newStatus ? 'green' : 'red'
        $(`#${messageGroup}_led`)
          .removeClass(`background_${ledColor}`)
          .addClass(`background_${newColor}`)
        await Promises.chrome.runtime.sendMessage(`${messageGroup}_callback`)
      })
      .hover(
        function () { $(this).addClass(hoveringClasses) }, 
        function () { $(this).removeClass(hoveringClasses) }
      )

    return $div
  }
  
  static label(title, color) {
    let $div = $("<div>", {"class": `group_label background_${color}`})
    $div.append(`<b>${title}</b>`)
    
    return $div
  }

}

// script execution
Popup.renderBody()