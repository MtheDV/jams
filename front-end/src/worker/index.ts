const worker = new ComlinkWorker<typeof import('./worker-data')>(
    new URL('./worker-data', import.meta.url)
)

export default worker
