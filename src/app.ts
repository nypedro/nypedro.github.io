import * as D from "dynein"
import * as router from "./utils/router"
import * as pages from "./pages"
import * as cookies from "./utils/cookies"

const { p } = D.elements

D.createRoot(() => {
    D.mountBody(() => {
        if (router.pageIs(/^(index|home)?$/)) {
            pages.home()
        } else if (router.pageIs("about")) {
            pages.about()
        } else if (router.pageIs("projects")) {
            pages.projects()
        } else {
            p("Unknown page")
        }
    })
})