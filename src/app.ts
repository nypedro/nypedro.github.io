import * as D from "dynein"
import * as router from "./router"
import * as pages from "./pages"
import * as cookies from "./cookies"

const { p } = D.elements

D.createRoot(() => {
    D.mountBody(() => {
        const seenWarning = cookies.get("seenWarning", "false") === "true"
        if (!seenWarning && !router.pageIs("warning")()) {
            router.replace("warning") // Show warning if the user hasn't seen it already
        } else if (seenWarning && router.pageIs("warning")()) {
            router.replace("") // Otherwise prevent seening the warning page
        }

        D.addIf(router.pageIs(""), () => {
            pages.index()
        }).elseif(router.pageIs("about"), () => {
            pages.about()
        }).elseif(router.pageIs("warning"), () => {
            pages.warning()
        }).else(() => {
            p("Unknown Page")
        })
    })
})