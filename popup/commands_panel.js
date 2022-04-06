class CommandPanel {
  static async generate() {
    const $buttonPanel = $("<div>", {id: `commands_panel`, class: `commands_panel`})

    const $newTab = await CommandPanel.#buttonGroup({color:'grey', label:'New Tab', buttons:[
      {label:'In Active Group', message:'new_tab_in_selected_group'},
      {label:'In New Group', message:'new_tab_in_new_group'}] 
    })
    const $sort = await CommandPanel.#buttonGroup({color:'blue', label:'Sort', buttons:[
      {label:'Highlighted Tabs', message:'sort_highlighted_tabs'},
      {label:'Tabs In Current Window', message:'sort_all_tabs_in_window'},
      {label:'All Tabs', message:'sort_all_tabs'}] 
    })
    const $remove = await CommandPanel.#buttonGroup({color:'red', label:'Remove', buttons:[
      {label:'Highlighted Duplicate Tabs', message:'remove_highlighted_dup_tabs'},
      {label:'Duplicate Tabs In Current Window', message:'remove_dup_tabs_in_window'},
      {label:'Duplicate Tabs', message:'remove_dup_tabs'}]
    })
    const $collapse = await CommandPanel.#buttonGroup({color:'yellow', label:'Collapse', buttons:[
      {label:'Groups In Current Window', message:'collapse_all_groups_in_window'},
      {label:'All Groups', message:'collapse_all_groups'},
      {type: 'toggle', label:'Inactive Groups Automatically', messageGroup:'auto_collapse_groups'}] 
    })
    const $sweep = await CommandPanel.#buttonGroup({color:'green', label:'Sweep', buttons:[
      {label:'Groups To Beginning', message:'sweep_groups_to_beginning'},
      {label:'Groups To End', message:'sweep_groups_to_end'}] 
    })
    const $goToFlag = await CommandPanel.#buttonGroup({color:'pink', label:'Go To', buttons:[
      {label:'Flag #1', message:'go_to_flag_1'},
      {label:'Flag #2', message:'go_to_flag_2'},
      {label:'Flag #3', message:'go_to_flag_3'},
      {label:'Flag #4', message:'go_to_flag_4'}]
    })
    const $setFlag = await CommandPanel.#buttonGroup({color:'purple', label:'Flag Tab With', buttons:[
      {label:'Flag #1', message:'apply_flag_1'},
      {label:'Flag #2', message:'apply_flag_2'},
      {label:'Flag #3', message:'apply_flag_3'},
      {label:'Flag #4', message:'apply_flag_4'}] 
    })
    const $cyan = await CommandPanel.#buttonGroup({color:'cyan', label:'Cyan', buttons:[]})
    const $orange = await CommandPanel.#buttonGroup({color:'orange', label:'Orange', buttons:[]})
    
    $buttonPanel.empty()
      .append($newTab)
      .append($sort)
      .append($remove)
      .append($collapse)
      .append($sweep)
      .append($goToFlag)
      .append($setFlag)
      // .append($cyan)
      // .append($orange)
    
    return $buttonPanel
  }

  static async #buttonGroup(buttonGroupOptions) {  
    //{color: string, label: string, buttons:[ {label: string, message: string},{type: 'toggle' label: string, messageGroup: string} ]}
    const {color, label, buttons} = buttonGroupOptions
    
    const $buttonGroup = $("<div>", {class: `button_group border_${color}`})
    $buttonGroup
      .append(CommandPanel.#label(label, color))
    for(const button of buttons) {
      const {type} = button
      switch(type) {
        case 'toggle':
          const $toggleButton = await CommandPanel.#toggleButton({color, label: button.label, messageGroup: button.messageGroup})
          $buttonGroup.append($toggleButton)
          break
        default:
          $buttonGroup.append(CommandPanel.#button({color, label: button.label, message: button.message}))
      }
    }

    return $buttonGroup
  }

  static #button(buttonOptions) {
    const {color, label, message} = buttonOptions
    const hoveringClasses = `button_hover_margins button_hover_${color}`
    const $div = $("<div>", {"class": `clickable button background_button_grey`})
    $div
      .append(`<b>${label}</b>`)
      .click(()=>{Promises.chrome.runtime.sendMessage(message)})
      .hover(
        function () { $(this).addClass(hoveringClasses) }, 
        function () { $(this).removeClass(hoveringClasses) }
      )

    return $div
  }

  static async #toggleButton(buttonOptions) {
    // console.log(JSON.stringify(buttonOptions))
    const {color, label, messageGroup} = buttonOptions
    const hoveringClasses = `button_hover_margins button_hover_${color}`
    const $div = $("<div>", {"class": `clickable button toggle_button background_button_grey`})
    
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
  
  static #label(title, color) {
    let $div = $("<div>", {"class": `group_label background_${color}`})
    $div.append(`<b>${title}</b>`)
    
    return $div
  }
}