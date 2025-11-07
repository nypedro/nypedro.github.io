export * from "./about"
export * from "./warning"

import * as D from "dynein"
import * as router from "../router"

const { p, button, img } = D.elements
const $ = D.createSignal

export function index(): void {
    p("Pedro's Really Cool Website")

    const clicks = $(0)
    button({
        onMouseDown: () => {

            clicks(clicks() + 1)
            router.redirect("about")
        }
    }, "Click Me!!")

    D.addDynamic(() => {
        p(clicks())
    })

    img({ src: "assets/favicon.svg", style: "width: 512px; height: 512px" })

    let pos = 0
    let dir = 1
    D.addAsync(async () => {
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 100))

            pos += dir
            if (pos === 0 || pos === 10) {
                dir *= -1
            }

            document.title = "-".repeat(pos) + "|" + "-".repeat(10 - pos)
        }
    })
}