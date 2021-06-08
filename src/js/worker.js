self.addEventListener('fetch', event => event.respondWith(response(event.request)))
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

const version = 2

const response = async request => {

	const cache = await caches.open(version)
	const cached_response = await cache.match(request)

	const now = Date.now()
	const second = 1000
	const minute = 60 * second
	const timeout = 10 * minute
	const header_name = 'ahs-app-last-fetched'

	const forever = !request.url.endsWith('.json')

	if ( cached_response &&
		( forever || (now - parseInt(cached_response.headers.get(header_name)) < timeout) )
	) return cached_response
	
	const fresh_response = await fetch(request)
	const cloned_response = fresh_response.clone()

	if (forever) {
		cache.put(request, cloned_response)
	} else {
		const headers = new Headers(cloned_response.headers)
		headers.append(header_name, now.toString())
		cache.put(request, new Response(cloned_response.body, { headers }))
	}
	return fresh_response

}
