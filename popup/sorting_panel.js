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
    for(const rule of sortingRules) {
      const $tableRow = await SortingPanel.tableRow(rule)
      $table.append($tableRow)
    }
    const $tableFooter = SortingPanel.tableFooter()
    $table.append($tableFooter)
    return $table
  }

  static tableHeader() {
    const $tableRow = $('<tr>')
    $tableRow.html(`<th rowspan=2 class='first_column'>Address</th>
                    <th colspan=3>Group Properties</th>`)

    return $tableRow
  }
  static tableSubHeader() {
    const $tableRow = $('<tr>', {class: "header_row"})
    $tableRow.html(`<th class=title_column_width>Title</th>
                    <th class=color_column_width>Color</th>
                    <th class=collapsed_column_width>Collapsed</th>`)

    return $tableRow
  }

  static async tableRow(sortingRule) {
    const {address, groupProperties} = sortingRule
    const keys = await Promises.chrome.runtime.sendMessage("get_group_properties_keys")

    for(const key of keys) {
      if(groupProperties[key] === undefined) {
        groupProperties[key] = ""
      }
    }

    const hoveringClass = `hover`
    const selectionClass = 'selected'
    const $tableRow = $('<tr>', {class: "data_row"})
    $tableRow
      .html(`<td class='table_data'>${address}</td>
             <td class='table_data'>${groupProperties.title}</td>
             <td class='table_data background_${groupProperties.color}'>${groupProperties.color}</td>
             <td class='table_data'>${groupProperties.collapsed}</td>`
      )
      .hover(
        function () { $(this).addClass(hoveringClass) }, 
        function () { $(this).removeClass(hoveringClass) }
      )
      .click(
        function () {
          // Remove selection from all tr's
          $(`tr.${selectionClass}`).removeClass(selectionClass)
          // all selection to this one.
          $(this).addClass(selectionClass)
        }
      )

    return $tableRow
  }

  static tableFooter() {
    const $tableRow = $('<tr>', {class: "footer_row"})
    $tableRow.html(`
      <th class='footer_header'>
        <div class="footer_button background_button_grey">&#11014</div>
        <div class="footer_button background_button_grey">&#11015</div>
      </th>
      <th colspan=3></th>
    `)
    
    return $tableRow
  }
}