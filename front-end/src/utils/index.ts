// Claims ownership over the tabs of the same origin
// https://greenvitriol.com/posts/browser-leader
export function requestLeadership(id: string, cb: (id: string) => void) {
    let resolve: () => void

    const p = new Promise<void>((res) => {
        resolve = res
    })

    navigator.locks.request(id, () => {
        cb(id)
        return p
    })

    return () => resolve()
}
