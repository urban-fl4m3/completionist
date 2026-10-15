#!/usr/bin/env python3
"""
Исследование вики для страниц игр.

Зачем: страницам нужен не только официальный баннер из магазина, но и
портреты боссов, скриншоты локаций, иконки предметов. Всё это лежит на
вики и достаётся через MediaWiki API — у Fandom, Fextralife и прочих
он одинаковый.

Использование:

  # все картинки со страницы, от крупных к мелким
  python tools/wiki.py images cyberpunk.fandom.com "Adam Smasher"

  # главная картинка сразу для списка страниц
  python tools/wiki.py main cyberpunk.fandom.com "Royce" "Placide" "Oda"

  # текст страницы (чтобы разобраться в содержимом игры)
  python tools/wiki.py text cyberpunk.fandom.com "Adam Smasher"

  # поиск страниц по запросу
  python tools/wiki.py search cyberpunk.fandom.com "boss"

Fandom отдаёт 403 на пустой User-Agent, поэтому он задан явно.
"""

import json
import sys
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0 Safari/537.36")

# Служебная графика, которая никогда не нужна на странице игры.
JUNK = ('site-logo', 'wiki-wordmark', 'favicon', 'placeholder',
        'site-background', 'wordmark', '-icon', 'Icon_')


def api(host, params):
    params.update({'format': 'json', 'formatversion': '2'})
    url = 'https://%s/api.php?%s' % (host, urllib.parse.urlencode(params))
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def clean(url):
    """Убираем хвост ?cb=... и /revision/latest — остаётся прямая ссылка."""
    return url.split('/revision')[0].split('?')[0]


def main_images(host, titles):
    """Главная картинка каждой страницы. Дёшево и обычно достаточно."""
    data = api(host, {
        'action': 'query',
        'prop': 'pageimages',
        'piprop': 'original',
        'redirects': '1',
        'titles': '|'.join(titles),
    })
    out = []
    for page in data.get('query', {}).get('pages', []):
        src = (page.get('original') or {}).get('source')
        out.append((page.get('title', '?'), clean(src) if src else None))
    return out


def page_images(host, title, limit=40):
    """Все картинки страницы с размерами, отсортированы по площади."""
    listing = api(host, {
        'action': 'query',
        'prop': 'images',
        'imlimit': str(limit),
        'redirects': '1',
        'titles': title,
    })

    pages = listing.get('query', {}).get('pages', [])
    if not pages:
        return []

    files = [i['title'] for i in (pages[0].get('images') or [])]
    files = [f for f in files if not any(j.lower() in f.lower() for j in JUNK)]
    if not files:
        return []

    out = []
    # API принимает до 50 заголовков за раз.
    for i in range(0, len(files), 50):
        info = api(host, {
            'action': 'query',
            'prop': 'imageinfo',
            'iiprop': 'url|size',
            'titles': '|'.join(files[i:i + 50]),
        })
        for page in info.get('query', {}).get('pages', []):
            for ii in (page.get('imageinfo') or []):
                out.append({
                    'file': page.get('title'),
                    'url': clean(ii.get('url', '')),
                    'w': ii.get('width', 0),
                    'h': ii.get('height', 0),
                })

    # Мелочь вроде иконок статусов отбрасываем.
    out = [o for o in out if o['w'] >= 200 and o['h'] >= 200]
    out.sort(key=lambda o: o['w'] * o['h'], reverse=True)
    return out


def page_text(host, title):
    data = api(host, {
        'action': 'query',
        'prop': 'extracts',
        'explaintext': '1',
        'redirects': '1',
        'titles': title,
    })
    pages = data.get('query', {}).get('pages', [])
    return pages[0].get('extract', '') if pages else ''


def search(host, query, limit=15):
    data = api(host, {
        'action': 'query',
        'list': 'search',
        'srsearch': query,
        'srlimit': str(limit),
    })
    return [r['title'] for r in data.get('query', {}).get('search', [])]


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        return 1

    cmd, host, args = sys.argv[1], sys.argv[2], sys.argv[3:]

    if cmd == 'main':
        for title, url in main_images(host, args):
            print('%-28s %s' % (title, url or 'НЕТ'))

    elif cmd == 'images':
        for img in page_images(host, args[0]):
            print('%5dx%-5d %s' % (img['w'], img['h'], img['url']))

    elif cmd == 'text':
        print(page_text(host, args[0])[:6000])

    elif cmd == 'search':
        for title in search(host, ' '.join(args)):
            print(title)

    else:
        print('Неизвестная команда:', cmd)
        return 1

    return 0


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.exit(main())
