import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.elements = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))


class ComicPagesTest(unittest.TestCase):
    def test_pages_and_social_metadata(self):
        homepage = (ROOT / 'index.html').read_text()
        slugs = re.findall(r'<article[^>]+id="([^"]+)"', homepage)
        self.assertGreater(len(slugs), 0)
        for slug in slugs:
            with self.subTest(slug=slug):
                source = (ROOT / 'komiksy' / slug / 'index.html').read_text()
                doc = Document(source)
                canonical = f'https://muczek.pl/komiksy/{slug}/'
                self.assertIn(('link', {'rel': 'canonical', 'href': canonical}), doc.elements)
                metadata = {a.get('property', a.get('name')): a.get('content')
                            for tag, a in doc.elements if tag == 'meta'}
                self.assertEqual(metadata['og:url'], canonical)
                self.assertEqual(metadata['twitter:card'], 'summary_large_image')
                self.assertTrue(metadata['og:title'])
                self.assertTrue(metadata['description'])
                self.assertEqual(metadata['og:image'], metadata['twitter:image'])
                self.assertTrue((ROOT / urlparse(metadata['og:image']).path.lstrip('/')).is_file())
                self.assertEqual(sum(tag == 'h1' for tag, _ in doc.elements), 1)
                self.assertEqual(sum(tag == 'article' for tag, _ in doc.elements), 1)
                self.assertIn(f'href="/komiksy/{slug}/"', homepage)
                for tag, attrs in doc.elements:
                    value = attrs.get('src') if tag in ('img', 'script') else attrs.get('href')
                    if value and value.startswith('/'):
                        path = ROOT / urlparse(value).path.lstrip('/')
                        self.assertTrue(path.exists(), value)
                        if path.is_dir():
                            self.assertTrue((path / 'index.html').is_file(), value)


if __name__ == '__main__':
    unittest.main()
