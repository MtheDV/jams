const worker = new ComlinkSharedWorker<typeof import('./worker-data')>(
	new URL('./worker-data', import.meta.url)
)

export default worker
