"""Generate deployable comic pages from the homepage; no dependencies required."""
import re
from html import escape, unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://muczek.pl"


def generate():
    source = (ROOT / "index.html").read_text()
    cards = re.findall(r'<article\b[^>]*\bid="([^"]+)"[^>]*>.*?</article>', source, re.S)
    articles = re.findall(r'<article\b[^>]*\bid="[^"]+"[^>]*>.*?</article>', source, re.S)
    for index, (slug, article) in enumerate(zip(cards, articles)):
        title = unescape(re.search(r'<h3>(.*?)</h3>', article, re.S)[1])
        title = re.sub(r'<[^>]+>', '', title)
        image = re.search(r'<img\s+src="([^"]+)"\s+alt="([^"]*)"', article, re.S)
        image_url = f"{SITE}/{image[1]}"
        description = unescape(image[2]).strip()
        url = f"{SITE}/komiksy/{slug}/"
        page = source.replace('<title>Muczek i Przyjaciele</title>',
                              f'<title>{escape(title)} — Muczek i Przyjaciele</title>')
        page = re.sub(r'<meta\s+name="description"\s+content="[^"]*"\s*/>',
                      lambda _: f'<meta name="description" content="{escape(description, quote=True)}" />', page)
        metadata = f'''    <link rel="canonical" href="{url}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="pl_PL" />
    <meta property="og:site_name" content="Muczek i Przyjaciele" />
    <meta property="og:title" content="{escape(title, quote=True)} — Muczek i Przyjaciele" />
    <meta property="og:description" content="{escape(description, quote=True)}" />
    <meta property="og:url" content="{url}" />
    <meta property="og:image" content="{image_url}" />
    <meta property="og:image:alt" content="{escape(description, quote=True)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{escape(title, quote=True)} — Muczek i Przyjaciele" />
    <meta name="twitter:description" content="{escape(description, quote=True)}" />
    <meta name="twitter:image" content="{image_url}" />
    <meta name="twitter:image:alt" content="{escape(description, quote=True)}" />
'''
        page = page.replace('  </head>', metadata + '  </head>')
        article = re.sub(r'<h3>.*?</h3>', lambda _: f'<h1>{escape(title)}</h1>', article, flags=re.S)
        navigation = []
        if index > 0:
            navigation.append(f'<a href="/komiksy/{cards[index - 1]}/">← Nowszy komiks</a>')
        if index + 1 < len(cards):
            navigation.append(f'<a href="/komiksy/{cards[index + 1]}/">Starszy komiks →</a>')
        main = f'''<main id="top" class="comic-page">
      <a class="comic-back" href="/#komiksy">← Wszystkie komiksy</a>
      {article}
      <nav class="comic-navigation" aria-label="Pozostałe komiksy">{' '.join(navigation)}</nav>
    </main>'''
        page = re.sub(r'<main\b.*?</main>', lambda _: main, page, flags=re.S)
        page = page.replace('href="#top"', 'href="/"').replace('href="#komiksy"', 'href="/#komiksy"').replace('href="#kontakt"', 'href="/#kontakt"')
        page = page.replace('href="style.css"', 'href="/style.css"').replace('src="script.js"', 'src="/script.js"').replace('src="assets/', 'src="/assets/')
        output = ROOT / 'komiksy' / slug / 'index.html'
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(page)
    print(f"Generated {len(cards)} comic pages")


if __name__ == '__main__':
    generate()
