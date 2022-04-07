class SortingPanel {
  static async generate() {
    const $sortingPanel = $("<div>", {id: `sorting_panel`, class: `sorting_panel`})
    const $table = await SortingPanel.#table()
    $sortingPanel.empty()
      .append($table)
    
    return $sortingPanel
  }

  static async #refreshTable(selectIndex) {
    const $refreshedTable = await SortingPanel.#table()
    $('#sorting_rules_table').replaceWith($refreshedTable)
    
    const $rowToReSelect = $(`tr[data-index="${selectIndex}"]`)
    if($rowToReSelect.length !== 0) {
      $rowToReSelect.click()
    }
  }

  static async #table() {
    const $table = $("<table>", {id: 'sorting_rules_table', class: 'sorting_table not_editable background_grey'})
    const $tableHeader = SortingPanel.#tableHeader()
    const $tableSubHeader = SortingPanel.#tableSubHeader()
    
    $table.empty()
      .append($tableHeader)
      .append($tableSubHeader)

    const sortingRules = await Promises.chrome.runtime.sendMessage('get_sorting_rules')
    for(let i = 0; i < sortingRules.length; i++) {
      const rule = sortingRules[i]
      const $tableRow = await SortingPanel.#tableDataRow(rule, i)
      $table.append($tableRow)
    }
    const $tableFooter = SortingPanel.#tableFooter()
    $table.append($tableFooter)
    return $table
  }

  static #tableHeader() {
    const $tableRow = $('<tr>')
    $tableRow.html(`<th rowspan=2 class='border-right thick_border_bottom'>Address</th>
                    <th colspan=3>Group Properties</th>`)

    return $tableRow
  }

  static #tableSubHeader() {
    const $tableRow = $('<tr>')
    $tableRow.html(`<th class='title_column_width thick_border_bottom'>Title</th>
                    <th class='color_column_width thick_border_bottom'>Color</th>
                    <th class='collapsed_column_width thick_border_bottom'>Collapsed</th>`)

    return $tableRow
  }

  static async #tableDataRow(sortingRule, index) {
    const {address, groupProperties} = sortingRule
    const groupPropertyKeys = await SortingPanel.#getGroupPropertyKeys()
    for(const key of groupPropertyKeys) {
      if(groupProperties[key] === undefined) {
        groupProperties[key] = ""
      }
    }

    const hoveringClass = `hover`
    const selectionClass = 'selected'
    const $tableRow = $('<tr>', {class: "clickable data_row"})
    $tableRow
      .html(`<td class='border-right'>${address}</td>
             <td class='border-right'>${groupProperties.title}</td>
             <td class='border-right background_${groupProperties.color}'>${groupProperties.color}</td>
             <td class=''>${groupProperties.collapsed}</td>`
      )
      .attr("data-index", index)
      .hover(
        function () { $(this).addClass(hoveringClass) }, 
        function () { $(this).removeClass(hoveringClass) }
      )
      .click(
        function () {
          $(`tr.${selectionClass}`).removeClass(selectionClass)
          $(this).addClass(selectionClass)
          const currentIndex = parseInt($(this).attr('data-index'))
          const totalIndexes = $('tr[data-index]').length
          SortingPanel.#footerButtonManagement(currentIndex, totalIndexes)
        }
      )

    return $tableRow
  }

  static async #moveSelectedRow(message) {
    if(!["up", "down"].includes(message)) {
      return 
    }

    const result = $('tr.selected')
    if(result.length) {
      // we have selection
      const index = parseInt(result.first().attr('data-index'))
      let sortingRules = await Promises.chrome.runtime.sendMessage('get_sorting_rules')
      const movingRule = sortingRules[index]
      
      const toIndex = message === "up" ? index -1 : index + 1
      sortingRules.splice(index, 1)
      sortingRules.splice(toIndex, 0, movingRule)
      
      await Promises.chrome.runtime.sendMessage({message: 'set_sorting_rules', arg1: sortingRules})
      await SortingPanel.#refreshTable(toIndex)
    }
  }

  static #GROUP_PROPERTY_KEYS = undefined
  static async #getGroupPropertyKeys() {
    if(SortingPanel.#GROUP_PROPERTY_KEYS == undefined) {
      SortingPanel.#GROUP_PROPERTY_KEYS = await Promises.chrome.runtime.sendMessage("get_group_properties_keys")
    }
    return SortingPanel.#GROUP_PROPERTY_KEYS
  }

  static #tableFooter() {
    const $tableRow = $('<tr>', {class: "footer_row"})
    const $button_cell = $('<th>', {class: 'footer_button_cell thick_border_top'})
    const $padding_cell = $('<th>', {class: 'thick_border_top'})

    $padding_cell
      .attr('colspan', 3)
    $button_cell
      .append(SortingPanel.#footerButton({
        label: '&#11014', message: 'up', clickMethod: () => SortingPanel.#moveSelectedRow('up')
      }))
      .append(SortingPanel.#footerButton({
        label: '&#11015', message: 'down', clickMethod: ()=> SortingPanel.#moveSelectedRow('down')
      }))
    $tableRow
      .append($button_cell)
      .append($padding_cell)

    return $tableRow
  }

  static #footerButton(buttonOptions) {
    const {label, message, clickMethod} = buttonOptions
    // const hoveringClasses = ``
    const $button = $('<button>', {id: `footer_button_${message}`, class: 'clickable footer_button background_button_grey'})
    $button
      .html(label)
      .prop('disabled',true).addClass('disabled')
      .click(() => clickMethod())
    return $button
  }

  static #footerButtonManagement(currentIndex, totalIndexes) {
    const $up = $('#footer_button_up')
    const $down = $('#footer_button_down')
    
    if (currentIndex === 0) {
      // up: disabled, down: enabled
      $up.prop('disabled',true).addClass('disabled')
      $down.prop('disabled',false).removeClass('disabled')
    }
    else if(currentIndex === totalIndexes -1) {
      // up: enabled, down: disabled
      $up.prop('disabled',false).removeClass('disabled')
      $down.prop('disabled',true).addClass('disabled')
    }
    else {
      // up: enabled, down: enabled
      $up.prop('disabled',false).removeClass('disabled')
      $down.prop('disabled',false).removeClass('disabled')
    }
  }

}