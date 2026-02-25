import * as D from "dynein"

const { section, img, div, main, header, p, a } = D.elements

export function home(): void {
    div({ class: "column" }, () => {
        main({ class: "content" }, () => {
            div({ class: "bio" }, () => {
                img({ class: "headshot", src: "assets/headshot.avif" })

                section({ class: "container-vertical" }, () => {
                    header({ class: "title" }, "Hello :)")
                    p({ class: "description" }, "Welcome to my personal website!")
                })
            })

            div({ class: "directory" }, () => {
                addItem({
                    title: "Projects",
                    description: "Some cool projects I've worked on",
                    href: "projects.html"
                })

                addItem({
                    title: "About",
                    description: "Learn all about me!",
                    href: "about.html"
                })

                addItem({
                    title: "Blog",
                    description: "WIP - Come back later!",
                    href: "index.html"
                })
            })
        })
    })
}

type DirectoryItem = {
    title: string,
    description: string,
    href: string,
}

function addItem({ title, description, href }: DirectoryItem) {
    a({ class: "directory-item", href }, () => {
        p({ class: "title" }, title)
        p({ class: "description" }, description)
    })
}