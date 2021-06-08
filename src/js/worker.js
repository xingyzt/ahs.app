self.addEventListener('fetch', event => event.respondWith(response(event.request)))
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

const version = 0

const response = async request => {
	if (request.url.endsWith('.json')) {

		const now = Date.now()
		const minute = 60 * 1000
		const timeout = 10 * minute

		const headerName = 'ahs-app-last-fetched'

		const cache = await caches.open(version)
		const cachedResponse = await cache.match(request)

		if(cachedResponse && parseInt(cachedResponse.headers.get(headerName)) - now < timeout)
			return cachedResponse
		
		const freshResponse = await fetch(request)
		const clonedResponse = freshResponse.clone()
		const headers = new Headers(clonedResponse.headers)
		headers.append(headerName,now)
		const body = await clonedResponse.blob()
		cache.put(request, new Response(body, {
			status: clonedResponse.status,
			statusText: clonedResponse.statusText,
			headers
		}))
		return freshResponse
	}
}
