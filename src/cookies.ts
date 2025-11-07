const cookies = new Map<string, string>()

document.cookie.split(";").forEach(cookieStr => {
    cookieStr = cookieStr.trim()
    if (cookieStr === "") {
        return
    }

    const [cookie, value] = cookieStr.split("=", 2)
    cookies.set(cookie, value)
})

export function get(cookie: string, defaultValue?: string) {
    if (!cookies.has(cookie) && defaultValue) {
        set(cookie, defaultValue)
    }

    return cookies.get(cookie)
}

export function set(cookie: string, value: string) {
    cookies.set(cookie, value)

    document.cookie = Array.from(cookies.entries().map(([cookie, value]) => {
        return `${cookie}=${value}`
    })).join("; ")
}
