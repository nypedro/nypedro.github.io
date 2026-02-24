import * as D from "dynein"

const { a, img, nav } = D.elements
const $ = D.createSignal

export function header(style?: any) {
    nav({ class: "header", style }, () => {
        a({ href: "index.html" }, () => {
            img({
                class: "header-image",
                src: "assets/headshot.avif"
            })
        })

        a({ class: "header-button", href: "index.html" }, "Home")
        a({ class: "header-button", href: "about.html" }, "About")
        a({ class: "header-button", href: "projects.html" }, "Projects")
        a({ class: "header-button", href: "index.html" }, "Blog")
    })
}