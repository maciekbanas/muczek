import { readFile, mkdir, copyFile, cp, rm, access } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = 'https://muczek.pl';
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export function preview(comic) {
  const title = `${comic.title} — Muczek i Przyjaciele`;
  const url = `${site}/share/${comic.id}/`;
  const target = `${site}/#${comic.id}`;
  const image = `${site}/${comic.image}`;
  return `<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(comic.alt)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pl_PL" />
  <meta property="og:site_name" content="Muczek i Przyjaciele" />
  <meta property="og:title" content="${escape(title)}" />
  <meta property="og:description" content="${escape(comic.alt)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${escape(image)}" />
  <meta property="og:image:alt" content="${escape(comic.alt)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escape(title)}" />
  <meta name="twitter:description" content="${escape(comic.alt)}" />
  <meta name="twitter:image" content="${escape(image)}" />
  <meta name="twitter:image:alt" content="${escape(comic.alt)}" />
  <script>location.replace(${JSON.stringify(target)});</script>
</head>
<body>
  <h1>${escape(comic.title)}</h1>
  <p><a href="${target}">Zobacz komiks na muczek.pl</a></p>
  <a href="${target}"><img src="${escape(image)}" alt="${escape(comic.alt)}" style="max-width:100%;height:auto" /></a>
</body>
</html>
`;
}

export async function build() {
  const comics = vm.runInNewContext(`${await readFile(join(root, 'comics.js'), 'utf8')}\ncomics;`);
  const ids = new Set();
  for (const comic of comics) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(comic.id) || ids.has(comic.id)) {
      throw new Error(`Invalid or duplicate comic id: ${comic.id}`);
    }
    ids.add(comic.id);
    if (!/^assets\/[a-zA-Z0-9_.-]+$/.test(comic.image)) throw new Error('Invalid image path');
    await access(join(root, comic.image));
    if (!comic.title || !comic.alt) throw new Error(`Missing title/alt: ${comic.id}`);
  }
  const output = join(root, 'dist');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const file of ['index.html', 'style.css', 'script.js', 'comics.js', 'CNAME']) {
    await copyFile(join(root, file), join(output, file));
  }
  await cp(join(root, 'assets'), join(output, 'assets'), { recursive: true });
  for (const comic of comics) {
    const directory = join(output, 'share', comic.id);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'index.html'), preview(comic));
  }
  console.log(`Built site with ${comics.length} social previews in dist/`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
