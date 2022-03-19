class SortingPanel {
  static async generate() {
    const $sortingPanel = $("<div>", {id: `sorting_panel`, class: `sorting_panel`})
    const $list = await SortingPanel.list()
    $sortingPanel.empty()
      .append($list)
    
    return $sortingPanel
  }

  static async list() {
    const $list = $("<ul>", {class: 'sorting_list'})
    const $listItem = await SortingPanel.listItem()
    $list.empty()
      .append($listItem)
    
    return $list
  }

  static async listItem() {
    const $listItem = $("<li draggable> TEST </li>")

    return $listItem
  }
}