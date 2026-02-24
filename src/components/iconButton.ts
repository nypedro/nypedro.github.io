import * as D from "dynein"

const { a, img, div } = D.elements

type IconButtonOptions = {
    icon?: string,
    color?: string,
    text: string,
    href: string
}

export function iconButton({ icon, color, text, href }: IconButtonOptions) {
    a({
        href,
        style: color ? `background-color: ${color};` : "",
        rel: "noopener noreferrer",
        target: "_blank"
    }, () => {
        div(() => {
            if (icon) {
                img({ src: icon })
            }
            D.addText(text)
        })
    })
}