async function write_article(Article,article){
    Article.querySelector('h2').focus()
	for (const property in article) {
		const element = Article.querySelector('.' + property)
		if (!element) continue
		element.innerHTML = article[property]
	}
	
	const Media = Article.querySelector('.media')
	const media_cache = []
	if(article.videoIDs) for (const id of article.videoIDs){
		const embed = clone_template('youtube')
		embed.src = embed.src.replace('[URL]',id)
		media_cache.push(embed)
		embed.addEventListener('load',safe_center)
	}
	if(article.imageURLs) for (const url of article.imageURLs){
		const image = clone_template('image')
		image.src = url
		media_cache.push(image)
		image.addEventListener('load',safe_center)
	}
	Media.style.alignContent = 'safe center'
	Media.replaceChildren(...media_cache)
}