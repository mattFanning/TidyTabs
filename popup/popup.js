class Popup {
  static COMMANDS_PANEL_ID = "#commands_panel"
  static COMMANDS_BUTTON = "#commands_button"
  static SORTING_PANEL_ID = "#sorting_panel"
  static SORTING_BUTTON = "#sorting_button"

  static async render() {
    const $logo = await Popup.logo()
    const $viewController = await Popup.controller()
    const $buttonPanel = await CommandPanel.generate()
    const $sortingPanel = await SortingPanel.generate()

    $("body").empty()
      .append($logo)
      .append($viewController)
      .append($buttonPanel)
      .append($sortingPanel)

      Popup.showPanel(Popup.COMMANDS_PANEL_ID)
  }

  static async logo() {
    const $logo = $("<div>", {class: `logo`})
    $logo
      .append(`<img src="../icons/bBroom24.png" alt="Tidy Tabs!">`)
      .append(`<b>Tidy Tabs!</b>`)
    return $logo
  }

  static async controller() {
    const color = 'purple'
    const $controllerPanel = $("<div>", {class: `controller_panel`})
    const $controllerGroup = $("<div>", {class: `controller_group border_${color}`})
    $controllerGroup.empty()
      .append(await Popup.controllerButton({id: 'commands_button', color, label: 'Commands', clickId: '#commands_panel'}))
      .append(await Popup.controllerButton({id: 'sorting_button', color, label: 'Sorting Rules', clickId: '#sorting_panel'}))
    
    $controllerPanel.empty()
      .append($controllerGroup)

    return $controllerPanel
  }

  static async controllerButton(buttonOptions) {
    const {id, color, label, clickId} = buttonOptions
    const hoveringClasses = `hover_borders`
    const $div = $("<div>", {"id": id, "class": `clickable controller_button controller_button_inactive`})
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
    const $sortingPanel = $(Popup.SORTING_PANEL_ID)
    const $commandsPanel = $(Popup.COMMANDS_PANEL_ID)
    const $sortingButton = $(Popup.SORTING_BUTTON)
    const $commandsButton = $(Popup.COMMANDS_BUTTON)
    const activeClass = 'controller_button_active'
    const inactiveClass = 'controller_button_inactive'

    switch(panelId) {
      case Popup.COMMANDS_PANEL_ID:
        $sortingPanel.hide()
        $sortingButton.removeClass(activeClass).addClass(inactiveClass)
        $commandsPanel.show()
        $commandsButton.removeClass(inactiveClass).addClass(activeClass)
        break
      case Popup.SORTING_PANEL_ID:
        $commandsPanel.hide()
        $commandsButton.removeClass(activeClass).addClass(inactiveClass)
        $sortingPanel.show()
        $sortingButton.removeClass(inactiveClass).addClass(activeClass)
        break
    }
  }
}

// script execution
Popup.render()