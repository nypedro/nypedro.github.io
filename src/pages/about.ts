import * as D from "dynein"

import { header, iconButton } from "src/components"

const { div, main, img, p, a, span } = D.elements

export function about(): void {
    div({ class: "about-column" }, () => {
        header({ season: "winter" })

        main({ class: "content" }, () => {
            img({ class: "about-banner", src: "assets/about/banner.avif" })

            p({ class: "title" }, () => {
                D.addText("Hello, I'm ")
                split("Pedro")
                D.addText("!")
            })

            p(() => {
                D.addText("I am a senior Computer Science major and Music minor at Lafayette College. Although I have experience with full-stack development, I love working with back-end systems the most. I also really enjoy teaching myself new tools and technologies. For example, I recently taught myself how to use ")
                a({ class: "link", href: "https://www.docker.com/", }, "Docker")
                D.addText(" (+more) by setting up my own self-hosted media server!")
            })

            p(() => {
                D.addText("Over the last two summers, I've had the opportunity to intern with ")
                a({ class: "link", href: "https://www.newspapersystems.com/", }, "Software Consulting Services")
                D.addText(" / ")
                a({ class: "link", href: "https://www.sn1.live/" }, "SN1")
                D.addText(" as a software developer. It was a blast getting to work both on real legacy systems and on their startup's new data visualization tools! My favorite project was implementing real-time group video calls for their latest (and yet-to-be-announced) application!")
            })

            div({ class: "buttons" }, () => {
                iconButton({
                    text: "GitHub",
                    href: "https://github.com/nypedro",
                    color: "#121613",
                    icon: "assets/icons/github.svg"
                })
                iconButton({
                    text: "LinkedIn",
                    href: "https://www.linkedin.com/in/pedro-ds",
                    color: "#007ebb",
                    icon: "assets/icons/linkedin.svg"
                })
                iconButton({
                    text: "Transcript",
                    href: "assets/about/transcript.pdf",
                    color: "#771b0f",
                    icon: "assets/icons/transcript.svg"
                })
                iconButton({
                    text: "Resume",
                    href: "assets/about/resume.pdf",
                    color: "#837c19",
                    icon: "assets/icons/resume.svg"
                })
            })
        })
    })
}

function split(str: string) {
    for (const char of str) {
        span({ class: "waving" }, char)
    }
}