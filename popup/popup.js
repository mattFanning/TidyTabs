class Popup {
  static COMMANDS_PANEL_ID = "#commands_panel"
  static COMMANDS_BUTTON = "#commands_button"
  static SORTING_PANEL_ID = "#sorting_panel"
  static SORTING_BUTTON = "#sorting_button"

  static async render() {
    const $viewController = await Popup.controller()
    const $buttonPanel = await CommandPanel.generate()
    const $sortingPanel = await SortingPanel.generate()

    $("body").empty()
      .append($viewController)
      .append($buttonPanel)
      .append($sortingPanel)

      Popup.showPanel(Popup.COMMANDS_PANEL_ID)
  }

  static async controller() {
    const color = 'purple'
    const $controllerPanel = $("<div>", {class: `controller_panel`})
    const $controllerGroup = $("<div>", {class: `controller_group border_${color}`})
    $controllerGroup.empty()
      .append(await Popup.controllerButton({id: 'commands_button', color, label: 'Commands', clickId: '#commands_panel'}))
      .append(await Popup.controllerButton({id: 'sorting_button', color, label: 'Sorting', clickId: '#sorting_panel'}))
    
    $controllerPanel.empty()
      .append($controllerGroup)

    return $controllerPanel
  }

  static async controllerButton(buttonOptions) {
    const {id, color, label, clickId} = buttonOptions
    const hoveringClasses = `hover_borders`
    const $div = $("<div>", {"id": id, "class": `clickable controller_button background_button_grey`})
    $div
      .append(`<b>${label}</b>`)
      .click(()=>{Popup.showPanel(clickId)})
      .hover(
        function () { $(this).addClass(hoveringClasses) }, 
        function () { $(this).removeClass(hoveringClasses) }
      )

    return $div
  }

  static showPanel(panelId) {
    switch(panelId) {
      case Popup.COMMANDS_PANEL_ID:
        $(Popup.SORTING_PANEL_ID).hide()
        $(Popup.COMMANDS_PANEL_ID).show()
        $(Popup.COMMANDS_BUTTON).addClass('controller_button_active')
        $(Popup.SORTING_BUTTON).removeClass('controller_button_active')
        break
      case Popup.SORTING_PANEL_ID:
        $(Popup.COMMANDS_PANEL_ID).hide()
        $(Popup.SORTING_PANEL_ID).show()
        $(Popup.COMMANDS_BUTTON).removeClass('controller_button_active')
        $(Popup.SORTING_BUTTON).addClass('controller_button_active')
        break
    }
  }
}

// script execution
Popup.render()