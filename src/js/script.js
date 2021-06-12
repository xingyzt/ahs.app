'use strict'


main()

async function main() {
	show_article()

	document.body
		.querySelectorAll('a[href^="/"]')
		.forEach(link=>link.addEventListener('click', internal_link))
	
	window.addEventListener('popstate', show_article)
	window.addEventListener('resize', safe_center)

	highlight_schedule()

	if('serviceWorker' in navigator)
		navigator.serviceWorker.register('/worker.js')
}
async function reset_title() {
	document.title = 'ahs.app'
}
async function show_article() {
	const $main = document.body.querySelector('main')

	const $article = clone_template('article')
	$main.replaceChild($article,$main.firstChild)
	window.scrollTo(0,0)

	$main.hidden = window.location.pathname==='/'
	if($main.hidden) return reset_title()

	const id = rot13(window.location.pathname.split('/').pop()) // Last portion of the path is the ciphered ID

	const article = await db('articles/'+id)
	if (!article) return reset_title()

	document.title = article.title
	$article.querySelector('h2').focus({ preventScroll: true })
	for (const property in article) {
		const element = $article.querySelector('.' + property)
		if (element) element.innerHTML = article[property]
	}
	
	const $media = $article.querySelector('.media')
	$media.style.alignContent = 'safe center'
	$media.append(
		...await Promise.all(( article.videoIDs || [] ).map( async id => {
			const $embed = clone_template('youtube')
			$embed.src = $embed.src.replace('[URL]',id)
			$embed.addEventListener('load',safe_center)
			return $embed
		}).concat(( article.imageURLs || [] ).map( async url => {
			const $image = clone_template('image')
			$image.src = url
			$image.addEventListener('load',safe_center)
			return $image
		}))),
	)
	/*
	const $related = $article.querySelector('.related')
	$related.append(
		...await Promise.all(( article.relatedArticleIDs || [] ).map( async id => {
			const snippet = await db('snippets',id)
			const $snippet = clone_template('snippet')

			$snippet.href = '/' + 
}
