/*importScripts('/wrappers.js') <- already included thru parent*/

/**
 * Maintains bookmarks for tab groups.
 */
class Bookmarking {

    static getAllBookmarks() {
        const bookmarks = [
            {name: "authenticator", groupProperties: {title: "😎", collapsed: true}}
        ]

        return bookmarks
    }

    static openBookmark(name) {
        const allBookmarks = Bookmarking.getAllBookmarks()
        const foundBookmarks = allBookmarks.filter(b => {return b.name === name})
        if(foundBookmarks.length <= 0) {
            console.log(`bookmark: "${name}" was undefined`)
        } else {
            console.log(`You're opening bookmark: "${foundBookmarks[0].name}"`)
        }
    }
}




/**
 * A payload containing a name for the bookmark
 * and a GroupProperties payload for group matching / creation.
 * @typedef {object} GroupBookmark
 * @property {string} name - the name for this bookmark
 * @property {GroupProperties} groupProperties - the payload of group info for creation and sorting.
 */