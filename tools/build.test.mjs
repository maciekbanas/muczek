import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { build, preview } from './build.mjs';

test('build delivers a static preview and existing assets for every comic', async () => {
  await build();
  const comics = vm.runInNewContext(`${await readFile('comics.js', 'utf8')}\ncomics;`);
  assert.ok(comics.length > 0);
  for (const comic of comics) {
    const html = await readFile(`dist/share/${comic.id}/index.html`, 'utf8');
    assert.ok(html.includes(`property="og:url" content="https://muczek.pl/share/${comic.id}/"`));
    assert.ok(html.includes(`property="og:image" content="https://muczek.pl/${comic.image}"`));
    assert.ok(html.includes(`location.replace("https://muczek.pl/#${comic.id}")`));
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
    assert.ok(html.includes(`href="https://muczek.pl/#${comic.id}"`));
    await access(`dist/${comic.image}`);
  }
  assert.equal(await readFile('dist/index.html', 'utf8'), await readFile('index.html', 'utf8'));
  await access('dist/script.js');
  await access('dist/comics.js');
  assert.equal((await readFile('dist/CNAME', 'utf8')).trim(), 'muczek.pl');
});

test('preview escapes comic titles and descriptions in static markup', () => {
  const html = preview({id:'test', title:'<script>"&', alt:'" onload="bad', image:'assets/test.png'});
  assert.ok(html.includes('&lt;script&gt;&quot;&amp;'));
  assert.ok(html.includes('content="&quot; onload=&quot;bad"'));
  assert.ok(!html.includes('<script>"&'));
});
