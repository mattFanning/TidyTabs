class SortingPanel {
  static async generate() {
    const $sortingPanel = $("<div>", {id: `sorting_panel`, class: `sorting_panel`})
    const $table = await SortingPanel.table()
    $sortingPanel.empty()
      .append($table)
    
    return $sortingPanel
  }

  static async table() {
    const $table = $("<table>", {class: 'sorting_table not_editable background_grey'})
    const $tableHeader = SortingPanel.tableHeader()
    const $tableSubHeader = SortingPanel.tableSubHeader()
    
    $table.empty()
      .append($tableHeader)
      .append($tableSubHeader)

    const sortingRules = await Promises.chrome.runtime.sendMessage('get_sorting_rules')
    for(let i = 0; i < sortingRules.length; i++) {
      const rule = sortingRules[i]
      const $tableRow = await SortingPanel.tableDataRow(rule, i)
      $table.append($tableRow)
    }
    const $tableFooter = SortingPanel.tableFooter()
    $table.append($tableFooter)
    return $table
  }

  static tableHeader() {
    const $tableRow = $('<tr>')
    $tableRow.html(`<th rowspan=2 class='border-right thick_border_bottom'>Address</th>
                    <th colspan=3>Group Properties</th>`)

    return $tableRow
  }
  static tableSubHeader() {
    const $tableRow = $('<tr>')
    $tableRow.html(`<th class='title_column_width thick_border_bottom'>Title</th>
                    <th class='color_column_width thick_border_bottom'>Color</th>
                    <th class='collapsed_column_width thick_border_bottom'>Collapsed</th>`)

    return $tableRow
  }

  static async tableDataRow(sortingRule, index) {
    const {address, groupProperties} = sortingRule
    const keys = await Promises.chrome.runtime.sendMessage("get_group_properties_keys")

    for(const key of keys) {
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
        }
      )

    return $tableRow
  }

  static tableFooter() {
    const $tableRow = $('<tr>', {class: "footer_row"})
    const $button_cell = $('<th>', {class: 'footer_button_cell thick_border_top'})
    const $padding_cell = $('<th>', {class: 'thick_border_top'})

    $padding_cell
      .attr('colspan', 3)
    $button_cell
      .append(SortingPanel.footerButton({label: '&#11014', message: 'up'}))
      .append(SortingPanel.footerButton({label: '&#11015', message: 'down'}))
    $tableRow
      .append($button_cell)
      .append($padding_cell)

    return $tableRow
  }

  static footerButton(buttonOptions) {
    const {label, message} = buttonOptions
    // const hoveringClasses = ``
    const $button = $('<div>', {class: 'clickable footer_button background_button_grey'})
    $button
      .html(label)
      .click(()=>{SortingPanel.#moveSelectedRow(message)})
    return $button
  }

  static #moveSelectedRow(message) {
    switch(message) {
      case 'up' :
        const result = $('tr.selected')
        if(result.length) {
          // we have selection
          console.log("Up found selection")

        }
        break
      case 'down' :
        console.log("you clicked down")
        break
      default:
        break
    }
  }
}