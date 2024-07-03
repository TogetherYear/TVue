const queue: Array<() => unknown> = []

let isFlushPending = false

const p = Promise.resolve()

export const QueueJobs = (fn: () => unknown) => {
    if (!queue.includes(fn)) {
        queue.push(fn)
    }
    QueueFlush()
}

const QueueFlush = () => {
    if (isFlushPending) {
        return
    }
    isFlushPending = true
    NextTick(FlushJobs)
}

const FlushJobs = () => {
    isFlushPending = false
    let job;
    while (job = queue.shift()) {
        job()
    }
}

export const NextTick = (fn?: () => unknown) => {
    return fn ? p.then(fn) : p
}