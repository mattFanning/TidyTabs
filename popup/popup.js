class Popup {

  static async renderBody() {
    const $viewController = await Popup.controller()
    const $buttonPanel = await Popup.buttonPanel()
    $("body").empty()
      .append($viewController)
      .append($buttonPanel)
  }

  static async controller() {
    const color = 'purple'
    const $controllerPanel = $("<div>", {class: `controller_panel`})
    const $controllerGroup = $("<div>", {class: `controller_group border_${color}`})
    $controllerGroup.empty()
      .append(await Popup.controllerButton({color, label: 'Commands'}))
      .append(await Popup.controllerButton({color, label: 'Other Stuff'}))
    
    $controllerPanel.empty()
      .append($controllerGroup)

    return $controllerPanel
  }

  static async controllerButton(buttonOptions) {
    const {color, label, message} = buttonOptions
    const hoveringClasses = `hover_background_${color}`
    const $div = $("<div>", {"class": `controller_button background_button_grey`})
    $div
      .append(`<b>${label}</b>`)
      .click(()=>{/*Promises.chrome.runtime.sendMessage(message)*/})
      .hover(
        function () { $(this).addClass(hoveringClasses) }, 
        function () { $(this).removeClass(hoveringClasses) }
      )

    return $div
  }

  static async buttonPanel() {
    const $buttonPanel = $("<div>", {class: `button_panel`})

    const $newTab = await Popup.buttonGroup({color:'grey', label:'New Tab', buttons:[
      {label:'In Active Group', message:'new_tab_in_selected_group'},
      {label:'In New Group', message:'new_tab_in_new_group'}] 
    })
    const $sort = await Popup.buttonGroup({color:'blue', label:'Sort', buttons:[
      {label:'Highlighted Tabs', message:'sort_highlighted_tabs'},
      {label:'Tabs In Current Window', message:'sort_all_tabs_in_window'},
      {label:'All Tabs', message:'sort_all_tabs'}] 
    })
    const $remove = await Popup.buttonGroup({color:'red', label:'Remove', buttons:[
      {label:'Highlighted Duplicate Tabs', message:'remove_highlighted_dup_tabs'},
      {label:'Duplicate Tabs In Current Window', message:'remove_dup_tabs_in_window'},
      {label:'Duplicate Tabs', message:'remove_dup_tabs'}]
    })
    const $collapse = await Popup.buttonGroup({color:'yellow', label:'Collapse', buttons:[
      {label:'Groups In Current Window', message:'collapse_all_groups_in_window'},
      {label:'All Groups', message:'collapse_all_groups'},
      {type: 'toggle', label:'Inactive Groups Automatically', messageGroup:'auto_collapse_groups'}] 
    })
    const $sweep = await Popup.buttonGroup({color:'green', label:'Sweep', buttons:[
      {label:'Groups To Beginning', message:'sweep_groups_to_beginning'},
      {label:'Groups To End', message:'sweep_groups_to_end'}] 
    })

    $buttonPanel.empty()
      .append($newTab)
      .append($sort)
      .append($remove)
      .append($collapse)
      .append($sweep)
    
    return $buttonPanel
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
    const {color, label, message} = buttonOptions
    const hoveringClasses = `button_hover_margins button_hover_${color}`
    const $div = $("<div>", {"class": `button background_button_grey`})
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
    const $div = $("<div>", {"class": `button toggle_button background_button_grey`})
    
    // determine led color
    const status = await Promises.chrome.runtime.sendMessage(`${messageGroup}_status`)
    const ledColor = status ? 'green' : 'red'
    const $led = $("<div>", {"id": `${messageGroup}_led`, "class": `toggle_led background_${ledColor}`})

    $div
      .append($led)  
      .append(`<b>${label}</b>`)
      .click(async () => {
        const previousStatus = await Promises.chrome.runtime.sendMessage(`${messageGroup}_status`)
        const previousColor = previousStatus ? 'green' : 'red'

        await Promises.chrome.runtime.sendMessage(`${messageGroup}_toggle`)
        const newStatus = await Promises.chrome.runtime.sendMessage(`${messageGroup}_status`)
    
        const newColor = newStatus ? 'green' : 'red'
        $(`#${messageGroup}_led`)
          .removeClass(`background_${previousColor}`)
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