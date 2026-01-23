import * as D from "dynein"

const { div, p, header, a, section } = D.elements

type Linkable = string | (() => HTMLAnchorElement)
type ProjectCardType = {
    title: Linkable,
    img: () => HTMLElement,
    description: string | string[],
    stack?: Linkable[]
    reversed?: boolean
}

export function projectCard({ title, description, img, reversed, stack }: ProjectCardType) {
    div({
        class: "project-card" + (reversed ? " reverse" : "")
    }, () => {
        img()

        section({}, () => {
            header({ class: "title" }, () => addLinkable(title))

            for (const paragraph of listify(description)) {
                p({ class: "description" }, paragraph)
            }

            if (stack) {
                addStack(stack)
            }
        })
    })
}

function addStack(stack: Linkable[]) {
    p({ class: "stack" }, () => {
        D.addText("Stack: ")

        let first = true
        for (const stackElement of stack) {
            if (!first) {
                D.addText(", ")
            }

            addLinkable(stackElement)
            first = false
        }
    })
}

function addLinkable(text: Linkable) {
    if (typeof text === "string") {
        D.addText(text)
    } else {
        text()
    }
}

// If maybelList is a single element, wrap it in an array
function listify<T>(maybeList: T | T[]): T[] {
    return [].concat(maybeList)
}