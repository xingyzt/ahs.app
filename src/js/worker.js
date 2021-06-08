self.addEventListener('fetch', event => event.respondWith(response(event.request)))
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

const version = 0

const response = async request => {

	const cache = await caches.open(version)
	const cachedResponse = await cache.match(request)

	let cacheIsValid = true

	const headerName = 'ahs-app-last-fetched'

	if (request.url.endsWith('.json')) {
		const now = Date.now()
		const minute = 60 * 1000
		const timeout = 10 * minute
		cacheIsValid = parseInt(cachedResponse.headers.get(headerName)) - now < timeout)
	}
	
	if (cachedResponse && cacheIsValid) return cachedResponse
	
	const freshResponse = await fetch(request)
	const clonedResponse = freshResponse.clone()
	const headers = new Headers(clonedResponse.headers)
	headers.append(headerName,now)
	const body = await clonedResponse.json()
	cache.put(request, new Response(body, { headers }))
	return freshResponse

}
