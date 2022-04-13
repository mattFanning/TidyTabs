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
    
    if(selectIndex != null) {
      const $rowToReSelect = $(`tr[data-index="${selectIndex}"]`)
      if($rowToReSelect.length !== 0) {
        $rowToReSelect.click()
      }
    }
    
  }

  static async #table() {
    const $table = $("<table>", {id: 'sorting_rules_table', class: 'sorting_table not_editable'})
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
          SortingPanel.#arrowButtonManagement()
        }
      )

    return $tableRow
  }

  static #tableInsertRow() {
    const $tableRow = $('<tr>', {class: "clickable insert_row"})
    
    $('<td>', {class: 'border-right'})
      .attr('contenteditable','true')
      .appendTo($tableRow)

    $('<td>', {class: 'border-right'})
      .attr('contenteditable','true')
      .appendTo($tableRow)

    SortingPanel.#insertRowColorCell()
      .attr('contenteditable','false')
      .appendTo($tableRow)

    $('<td>', {class: ''})
      .attr('contenteditable','true')
      .appendTo($tableRow)
    
    return $tableRow
  }

  static #insertRowColorCell() {
    const removeBackgroundColor = function(index, css) {
      return (css.match(/background_\w+/))
    }

    const $td = $('<td>', {id: 'insert_row_color', class: 'border-right'})
    const $select = $('<select>')
    
    $select.on('change', function(e) {
      var valueSelected = this.value;
     
      $(this).removeClass(removeBackgroundColor)
      $("#insert_row_color").removeClass(removeBackgroundColor)
      $(this).addClass(`background_${valueSelected}`)
      $("#insert_row_color").addClass(`background_${valueSelected}`)
    })

    //fill in color options
    $select.append($(`<option value=""></option>`))

    const colors = Object.values(chrome.tabGroups.Color)
    colors.forEach(color => {
      $select.append($(`<option class="background_${color}" value="${color}">${color}</option>`))
    })

    const initialColor = $select.children().first().text()
    $select.removeClass(removeBackgroundColor)
    $select.addClass(`background_${initialColor}`)
    $td.removeClass(removeBackgroundColor)
    $td.addClass(`background_${initialColor}`)

    $td.append($select)
    return $td
  }

  static #tableFooter() {
    const $tableRow = $('<tr>', {class: "footer_row"})
    const $button_cell = $('<th>', {class: 'footer_button_cell thick_border_top'})
    const $padding_cell = $('<th>', {class: 'thick_border_top'})

    $padding_cell
      .attr('colspan', 3)
    $button_cell
      .append(SortingPanel.#footerButton({
        label: '&#x21BA', message: 'refresh', clickMethod: () => SortingPanel.#refreshTable(null)
      }))
      .append(SortingPanel.#footerButton({
        label: '&#11014', message: 'up', isDisabled: true, clickMethod: () => SortingPanel.#moveSelectedRow('up')
      }))
      .append(SortingPanel.#footerButton({
        label: '&#11015', message: 'down', isDisabled: true, clickMethod: () => SortingPanel.#moveSelectedRow('down')
      }))
      .append(SortingPanel.#footerButton({
        label: '&#43', message: 'add', clickMethod: () => SortingPanel.#addInsertRow()
      }))
      .append(SortingPanel.#footerButton({
        label: '&#x0270E', message: 'edit', clickMethod: () => {}
      }))
      .append(SortingPanel.#footerButton({
        label: '&#10003', message: 'save', clickMethod: () => {SortingPanel.#saveInsertRow()}
      }))
    $tableRow
      .append($button_cell)
      .append($padding_cell)

    return $tableRow
  }

  static #footerButton(buttonOptions) {
    const {label, message, isDisabled, clickMethod} = buttonOptions
    // const hoveringClasses = ``
    const $button = $('<button>', {id: `footer_button_${message}`, class: 'clickable footer_button background_button_grey'})
    $button
      .html(label)
      .attr('title', message)
      .click(() => clickMethod())
    
    if(isDisabled) {
      $button.prop('disabled',true).addClass('disabled')
    }
    
    return $button
  }

  static async #moveSelectedRow(message) {
    if(!["up", "down"].includes(message)) {
      return 
    }

    const result = $('.data_row.selected')
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

  static async #addInsertRow() {
    // determine if we are using selection's data-index or last data-index
    const selectionClass = 'selected'
    const $selection = $(`tr.${selectionClass}`)
    let index

    if($selection.length  > 0) {
      index = parseInt($selection.attr('data-index'))
    } else {
      index = $('tr[data-index]').length -1
    }
    console.log(`index is: ${index}`)

    const $tableRow = SortingPanel.#tableInsertRow() 
    $tableRow.insertAfter($(`tr[data-index="${index}"]`))
    $selection.removeClass(selectionClass)
    
    SortingPanel.#arrowButtonManagement()
    SortingPanel.#addButtonManagement()
  }

  static async #saveInsertRow() {
    const $insertRow = $('tr.insert_row')
    if(SortingPanel.#rowDataIsValid($insertRow)) {
      // get sorting rules
      let sortingRules = await Promises.chrome.runtime.sendMessage('get_sorting_rules')
      // add insertRow
      const index = parseInt($insertRow.prev().attr('data-index')) + 1
      const rowData = SortingPanel.#getRowData($insertRow)
      const newSortingRule = {
        address: rowData.address, 
        groupProperties:{
          title: rowData.title,
          color: rowData.color === '' ? undefined : rowData.color,
          collapsed: rowData.collapsed === '' ? undefined : rowData.collapsed
        }}
      sortingRules.splice(index, 0, newSortingRule)
      console.log('a')
      // send message for save
      await Promises.chrome.runtime.sendMessage({message: 'set_sorting_rules', arg1: sortingRules})
      await SortingPanel.#refreshTable()
    }
  }

  static #GROUP_PROPERTY_KEYS = undefined
  static async #getGroupPropertyKeys() {
    if(SortingPanel.#GROUP_PROPERTY_KEYS == undefined) {
      SortingPanel.#GROUP_PROPERTY_KEYS = await Promises.chrome.runtime.sendMessage("get_group_properties_keys")
    }
    return SortingPanel.#GROUP_PROPERTY_KEYS
  }

  static #arrowButtonManagement() {
    const $up = $('#footer_button_up')
    const $down = $('#footer_button_down')

    const $selectedRow = $('tr.selected')
    if($selectedRow.length <= 0 ||
       $selectedRow.hasClass('insert_row')) {
      // up: disabled, down: disabled
      $up.prop('disabled',true).addClass('disabled')
      $down.prop('disabled',true).addClass('disabled')
      return
    }

    //$selectedRow == data_row
    const currentIndex = parseInt($selectedRow.attr('data-index'))
    const totalIndexes = $('tr[data-index]').length
    
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

  static #addButtonManagement() {
    const $add = $('#footer_button_add')
    const $insertRow = $('.insert_row')
    
    if($insertRow.length > 0) {
      $add.prop('disabled',true).addClass('disabled')
    } else {
      $add.prop('disabled',false).removeClass('disabled')
    }
  }

  static #rowDataIsValid($trSelector) {
    const tds = $trSelector.children('td')
    const data = SortingPanel.#getRowData($trSelector)
    
    if(data.address !== '' && data.title !== '') {
      return true
    }
    return false
  }

  static #getRowData($trSelector) {
    const tds = $trSelector.children('td')
    return {
      address: tds[0].textContent,
      title: tds[1].textContent,
      color: $(tds[2]).find(":selected").text(),
      collapsed: tds[3].textContent
    }
  }
}