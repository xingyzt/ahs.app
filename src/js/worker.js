self.addEventListener('fetch', event => event.respondWith(response(event.request)))
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

const version = 0

const response = async request => {

	const cache = await caches.open(version)
	const cachedResponse = await cache.match(request)

	const now = Date.now()
	const second = 1000
	const minute = 60 * second
	const hour = 60 * minute
	const timeout = request.url.endsWith('.json') ? 10 * minute : 24 * hour
	
	const headerName = 'ahs-app-last-fetched'

	if (cachedResponse && now - parseInt(cachedResponse.headers.get(headerName)) < timeout)
		return cachedResponse
	
	const freshResponse = await fetch(request)
	const clonedResponse = freshResponse.clone()
	const headers = new Headers(clonedResponse.headers)
	headers.append(headerName,now.toString())
	cache.put(request, new Response(clonedResponse.body, { headers }))
	return freshResponse

}
