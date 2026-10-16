/*  ============================================================
 *  ЕДИНЫЙ ИСТОЧНИК ПРАВДЫ
 *  ============================================================
 *  Это обычный JS-файл, а не JSON, — чтобы сайт открывался и
 *  по http (GitHub Pages), и просто двойным кликом по index.html.
 *
 *  Схема одной игры описана в docs/ADDING-GAMES.md
 *  Статусы: completed | in-progress | on-hold | planned | dropped
 *
 *  КАРТИНКИ. Три независимых пути, см. core.js → art():
 *    steam: <appId>  — Steam сам отдаёт баннер, hero и логотип
 *    art: { ... }    — любые свои ссылки или локальные файлы
 *    ничего          — рисуется процедурный арт из accent-цветов
 *  ============================================================ */

window.COMPLETIONIST_DATA = {
  /* Профиль владельца коллекции — показывается в шапке хаба. */
  profile: {
    name: 'Oleg',
    tagline: 'Коллекция пройденного и непройденного',
  },

  games: [
    /* ---------------------------------------------------------
     *  ПРИМЕР 1 — пройдено. Тёмное фэнтези, золото и угли.
     * --------------------------------------------------------- */
    {
      slug: 'elden-ring',
      title: 'Elden Ring',
      status: 'completed',
      platform: 'PC',
      year: 2022,
      developer: 'FromSoftware',
      steam: 1245620,

      /* Официальный ключевой арт с вики — он сильнее, чем широкий
         баннер из Steam. Коробочные обложки на сайте не
         используются: они не работают в длинной полосе. */
      art: {
        hero: 'https://static.wikia.nocookie.net/eldenring/images/5/58/' +
              'ER_KEY_ART.jpg/revision/latest/scale-to-width-down/1600',
      },

      accent: '#d4a44c',
      accentAlt: '#ff7b3d',
      hours: 143,
      rating: 10,
      started: '2025-11-02',
      finished: '2026-01-18',
      tags: ['Souls-like', 'Открытый мир', 'Dark Fantasy'],
      verdict:
        'Закрыто на 100%: все концовки, все боссы, полная платина. ' +
        'Лучший открытый мир, который я видел.',

      links: [
        { kind: 'wiki', label: 'Fextralife', url: 'https://eldenring.wiki.fextralife.com/Elden+Ring+Wiki' },
      ],

      goals: [
        { id: 'er-main',      group: 'Сюжет',    title: 'Пройти основной сюжет',                  done: true },
        { id: 'er-endings',   group: 'Сюжет',    title: 'Открыть все 6 концовок',                 done: true, note: 'Через NG+ и NG++',
          link: 'https://eldenring.wiki.fextralife.com/Endings',
          art: 'https://static.wikia.nocookie.net/eldenring/images/f/f0/Promised_Consort_Radahn_CloseUp.jpg' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'er-remem',     group: 'Боссы',    title: 'Победить всех боссов воспоминаний',       done: true,
          link: 'https://eldenring.wiki.fextralife.com/Bosses',
          art: 'https://static.wikia.nocookie.net/eldenring/images/4/43/ER_Godrick_the_Grafted.jpg' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'er-optional',  group: 'Боссы',    title: 'Закрыть всех опциональных боссов',        done: true, note: 'Включая Малению',
          link: 'https://eldenring.wiki.fextralife.com/Malenia+Blade+of+Miquella',
          art: 'https://static.wikia.nocookie.net/eldenring/images/5/54/Elden_Ring_Screenshot_07.jpg' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'er-legacy',    group: 'Карта',    title: 'Зачистить все Legacy Dungeon',            done: true,
          link: 'https://eldenring.wiki.fextralife.com/Legacy+Dungeons' },
        { id: 'er-map',       group: 'Карта',    title: 'Собрать все фрагменты карты',             done: true },
        { id: 'er-graces',    group: 'Карта',    title: 'Найти 100% мест благодати',               done: true,
          link: 'https://eldenring.wiki.fextralife.com/Sites+of+Grace' },
        { id: 'er-ashes',     group: 'Сбор',     title: 'Собрать все Spirit Ashes',                done: true,
          link: 'https://eldenring.wiki.fextralife.com/Spirit+Ashes',
          art: 'https://static.wikia.nocookie.net/eldenring/images/a/ae/ER_Inventory_Menu_Icon_Ashes.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'er-spells',    group: 'Сбор',     title: 'Собрать все заклинания и молитвы',        done: true,
          link: 'https://eldenring.wiki.fextralife.com/Sorceries' },
        { id: 'er-talismans', group: 'Сбор',     title: 'Собрать все талисманы',                   done: true,
          link: 'https://eldenring.wiki.fextralife.com/Talismans',
          art: 'https://static.wikia.nocookie.net/eldenring/images/3/34/ER_Inventory_Menu_Icon_Talismans.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'er-weapons',   group: 'Сбор',     title: 'Собрать все уникальные оружия',           done: true,
          link: 'https://eldenring.wiki.fextralife.com/Weapons' },
        { id: 'er-quests',    group: 'NPC',      title: 'Довести до конца все линейки NPC',        done: true, note: 'Самое муторное — Ранни и Нефели',
          link: 'https://eldenring.wiki.fextralife.com/Ranni+the+Witch',
          art: 'https://static.wikia.nocookie.net/eldenring/images/7/77/ER_snow_witch.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'er-plat',      group: 'Мета',     title: 'Платина / 100% ачивок',                   done: true,
          art: 'https://static.wikia.nocookie.net/eldenring/images/8/8d/Radagon-of-the-golden-order-boss-elden-ring-wiki-guide.jpg' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'er-nodeath',   group: 'Челлендж', title: 'Пройти без смертей',                      done: false, optional: true, note: 'Отдельный ран на будущее' },
      ],
    },

    /* ---------------------------------------------------------
     *  ПРИМЕР 2 — в процессе. Неон, глитч, сканлайны.
     * --------------------------------------------------------- */
    {
      slug: 'cyberpunk-2077',
      title: 'Cyberpunk 2077',
      status: 'in-progress',
      platform: 'PC',
      year: 2020,
      developer: 'CD Projekt Red',
      steam: 1091500,

      accent: '#fcee0a',
      accentAlt: '#00f0ff',
      hours: 61,
      rating: 9,
      started: '2026-09-04',
      finished: null,
      tags: ['RPG', 'Открытый мир', 'Киберпанк'],
      verdict: 'Идёт второй акт. Phantom Liberty ещё не трогал.',

      links: [
        { kind: 'wiki', label: 'Fandom', url: 'https://cyberpunk.fandom.com/wiki/Cyberpunk_2077' },
      ],

      /* tier: must — без этого игра не закрыта, worth — заметно
         улучшает прохождение, grind — душнина, можно пропустить. */
      goals: [
        { id: 'cp-main',     group: 'Сюжет', tier: 'must',  title: 'Пройти основной сюжет', done: false },
        { id: 'cp-endings',  group: 'Сюжет', tier: 'must',  title: 'Открыть все концовки',  done: false,
          note: 'Панам, Ханако, Роуг, одиночка и секретная',
          link: 'https://cyberpunk.fandom.com/wiki/Endings_(Cyberpunk_2077)' },
        { id: 'cp-pl',       group: 'DLC',   tier: 'must',  title: 'Пройти Phantom Liberty', done: false,
          link: 'https://cyberpunk.fandom.com/wiki/Phantom_Liberty' },
        { id: 'cp-pl-end',   group: 'DLC',   tier: 'must',  title: 'Обе концовки Phantom Liberty', done: false,
          link: 'https://cyberpunk.fandom.com/wiki/Phantom_Liberty' },

        { id: 'cp-johnny',   group: 'Линии', tier: 'must',  title: 'Максимум отношений с Джонни', done: true,
          note: 'Без этого секретная концовка не откроется',
          link: 'https://cyberpunk.fandom.com/wiki/Johnny_Silverhand',
          art: 'https://static.wikia.nocookie.net/cyberpunk/images/6/63/Char_profile_placide.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'cp-judy',     group: 'Линии', tier: 'must',  title: 'Закрыть линию Джуди', done: true,
          note: 'Только в акте 2 — после точки невозврата недоступна' },
        { id: 'cp-panam',    group: 'Линии', tier: 'must',  title: 'Закрыть линию Панам', done: false,
          note: 'Открывает одну из концовок' },
        { id: 'cp-river',    group: 'Линии', tier: 'worth', title: 'Закрыть линию Ривера', done: false },
        { id: 'cp-kerry',    group: 'Линии', tier: 'worth', title: 'Закрыть линию Керри',  done: false },

        { id: 'cp-bosses',   group: 'Боссы', tier: 'must',  title: 'Победить Адама Смэшера', done: false,
          link: 'https://cyberpunk.fandom.com/wiki/Adam_Smasher',
          art: 'https://static.wikia.nocookie.net/cyberpunk/images/7/78/Adam_Smasher_Database_CP2077.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'cp-chimera',  group: 'Боссы', tier: 'must',  title: 'Победить Химеру в Phantom Liberty', done: false,
          link: 'https://cyberpunk.fandom.com/wiki/Militech_Chimera',
          art: 'https://static.wikia.nocookie.net/cyberpunk/images/5/54/Screenshot_008_CP2077PL.jpeg' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'cp-hansen',   group: 'Боссы', tier: 'must',  title: 'Победить Курта Хансена', done: false,
          link: 'https://cyberpunk.fandom.com/wiki/Kurt_Hansen',
          art: 'https://static.wikia.nocookie.net/cyberpunk/images/1/11/Screenshot_005_CP2077PL.jpeg' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'cp-optboss',  group: 'Боссы', tier: 'worth', title: 'Встретить всех опциональных боссов', done: false,
          note: 'Ройс, Вудман, Пласид — зависят от диалогов',
          art: 'https://static.wikia.nocookie.net/cyberpunk/images/c/c3/Royce_Database_CP2077.png' +
               '/revision/latest/scale-to-width-down/600' },

        { id: 'cp-tarot',    group: 'Сбор',  tier: 'worth', title: 'Найти все граффити Таро', done: true,
          link: 'https://cyberpunk.fandom.com/wiki/Fool_on_the_Hill' },
        { id: 'cp-iconic',   group: 'Сбор',  tier: 'worth', title: 'Собрать иконическое оружие', done: false },
        { id: 'cp-cyber',    group: 'Сбор',  tier: 'worth', title: 'Собрать билд на максимум', done: false,
          note: 'Сейчас 43 уровень из 60' },

        { id: 'cp-fixers',   group: 'Душнина', tier: 'grind', title: 'Закрыть все заказы фиксеров', done: false,
          note: '38 из 86, задания повторяются',
          link: 'https://cyberpunk.fandom.com/wiki/Fixer' },
        { id: 'cp-ncpd',     group: 'Душнина', tier: 'grind', title: 'Зачистить все точки NCPD', done: false,
          note: 'Больше сотни одинаковых точек' },
        { id: 'cp-vehicles', group: 'Душнина', tier: 'grind', title: 'Купить все машины у Autofixer', done: false,
          note: 'Чистый гринд денег' },
        { id: 'cp-plat',     group: 'Душнина', tier: 'grind', title: '100% достижений', done: false },
        { id: 'cp-vhard',    group: 'Душнина', tier: 'grind', title: 'Пройти на Very Hard', done: false,
          note: 'Каноничная сложность — Hard' },
      ],
    },

    /* ---------------------------------------------------------
     *  ПРИМЕР 3 — в планах. Биолюминесцент, глубина, споры.
     * --------------------------------------------------------- */
    {
      slug: 'hollow-knight',
      title: 'Hollow Knight',
      status: 'planned',
      platform: 'PC',
      year: 2017,
      developer: 'Team Cherry',
      steam: 367520,

      accent: '#7fd4e8',
      accentAlt: '#c9a0ff',
      hours: 0,
      rating: null,
      started: null,
      finished: null,
      tags: ['Metroidvania', '2D', 'Соулслайк'],
      verdict: 'Стоит в библиотеке третий год. Пора.',

      links: [
        { kind: 'wiki', label: 'Fandom', url: 'https://hollowknight.fandom.com/wiki/Hollow_Knight_Wiki' },
      ],

      goals: [
        { id: 'hk-main',     tier: 'must', group: 'Сюжет',    title: 'Пройти игру (любая концовка)',            done: false,
          art: 'https://static.wikia.nocookie.net/hollowknight/images/0/05/Forgotten_Crossroads_Hot_Spring.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'hk-endings',  tier: 'must', group: 'Сюжет',    title: 'Открыть все 5 концовок',                  done: false,
          art: 'https://static.wikia.nocookie.net/hollowknight/images/5/52/Ending_H.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'hk-112',      tier: 'must', group: 'Мета',     title: 'Довести завершение до 112%',              done: false, note: 'Главная цель комплишениста',
          art: 'https://static.wikia.nocookie.net/hollowknight/images/b/ba/Screenshot_HK_Godhome_01.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'hk-charms',   tier: 'must', group: 'Сбор',     title: 'Собрать все 45 амулетов',                 done: false,
          link: 'https://hollowknight.fandom.com/wiki/Charms',
          art: 'https://static.wikia.nocookie.net/hollowknight/images/9/9e/Charms_Set_1.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'hk-nail',     tier: 'must', group: 'Сбор',     title: 'Полностью улучшить гвоздь',               done: false,
          link: 'https://hollowknight.fandom.com/wiki/Nail' },
        { id: 'hk-mask',     tier: 'worth', group: 'Сбор',     title: 'Собрать все осколки маски и души',        done: false,
          link: 'https://hollowknight.fandom.com/wiki/Mask_Shard' },
        { id: 'hk-journal',  tier: 'worth', group: 'Сбор',     title: 'Заполнить журнал охотника на 100%',       done: false,
          link: 'https://hollowknight.fandom.com/wiki/Hunter%27s_Journal' },
        { id: 'hk-grimm',    tier: 'worth', group: 'DLC',      title: 'Закрыть линию Grimm Troupe',              done: false,
          link: 'https://hollowknight.fandom.com/wiki/The_Grimm_Troupe',
          art: 'https://static.wikia.nocookie.net/hollowknight/images/1/18/Screenshot_HK_Grimm_01.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'hk-pantheon', tier: 'must', group: 'DLC',      title: 'Пройти все 5 Пантеонов Hallownest',       done: false, note: 'Godhome',
          link: 'https://hollowknight.fandom.com/wiki/Godhome',
          art: 'https://static.wikia.nocookie.net/hollowknight/images/b/ba/Screenshot_HK_Godhome_01.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'hk-pure',     tier: 'grind', group: 'Челлендж', title: 'Получить Pure Completion (Steel Soul)',   done: false,
          link: 'https://hollowknight.fandom.com/wiki/Steel_Soul_Mode',
          art: 'https://static.wikia.nocookie.net/hollowknight/images/c/cb/Beta_hk_promo.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'hk-radiance', tier: 'must', group: 'Челлендж', title: 'Победить Absolute Radiance',              done: false,
          link: 'https://hollowknight.fandom.com/wiki/Absolute_Radiance',
          art: 'https://static.wikia.nocookie.net/hollowknight/images/5/52/B_Radiance.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'hk-p5',       tier: 'grind', group: 'Челлендж', title: 'Pantheon of Hallownest без привязок',     done: false, optional: true,
          link: 'https://hollowknight.fandom.com/wiki/Godhome',
          art: 'https://static.wikia.nocookie.net/hollowknight/images/9/98/Screenshot_HK_Nightmare_King_Grimm_01.png' +
               '/revision/latest/scale-to-width-down/600' },
      ],
    },

    /* ---------------------------------------------------------
     *  ПРИМЕР 4 — дропнуто. Холодный NASA-punk интерфейс.
     * --------------------------------------------------------- */
    {
      slug: 'starfield',
      title: 'Starfield',
      status: 'dropped',
      platform: 'PC',
      year: 2023,
      developer: 'Bethesda',
      steam: 1716740,

      accent: '#ff7a3d',
      accentAlt: '#9fb4c7',
      hours: 27,
      rating: 5,
      started: '2026-03-11',
      finished: null,
      droppedAt: '2026-04-02',
      droppedReason:
        'Загрузочные экраны между загрузочными экранами. Исследование оказалось ' +
        'процедурной пустотой — через 27 часов понял, что мне просто скучно.',
      tags: ['RPG', 'Космос', 'Открытый мир'],
      verdict: 'Снято с дистанции. Возможно, вернусь после пары крупных патчей.',

      links: [
        { kind: 'wiki', label: 'Fandom', url: 'https://starfield.fandom.com/wiki/Starfield_Wiki' },
      ],

      goals: [
        { id: 'sf-main',      group: 'Сюжет',   title: 'Пройти основной сюжет',                   done: false },
        { id: 'sf-ng',        group: 'Сюжет',   title: 'Дойти до NG+ и Unity',                    done: false,
          link: 'https://starfield.fandom.com/wiki/Unity' },
        { id: 'sf-factions',  group: 'Фракции', title: 'Закрыть все 4 фракционные линии',         done: false, note: 'Сделан только Constellation' },
        { id: 'sf-crimson',   group: 'Фракции', title: 'Crimson Fleet до конца',                  done: false,
          link: 'https://starfield.fandom.com/wiki/Crimson_Fleet' },
        { id: 'sf-temples',   group: 'Сбор',    title: 'Найти все храмы и силы',                  done: false,
          link: 'https://starfield.fandom.com/wiki/Temple' },
        { id: 'sf-systems',   group: 'Карта',   title: 'Просканировать все системы на 100%',      done: false },
        { id: 'sf-outpost',   group: 'База',    title: 'Построить автономный аутпост',            done: true,
          link: 'https://starfield.fandom.com/wiki/Outpost' },
        { id: 'sf-ship',      group: 'База',    title: 'Собрать корабль класса C с нуля',         done: true },
        { id: 'sf-plat',      group: 'Мета',    title: '100% достижений',                         done: false },
      ],
    },

    /* ---------------------------------------------------------
     *  ПРИМЕР 5 — игра НЕ из Steam.
     *
     *  Здесь нет ни `steam`, ни `art` — и сайт всё равно
     *  выглядит нормально: карточка и шапка рисуют процедурный
     *  арт из accent-цветов. Так будет с любой консольной
     *  эксклюзивкой, пока не появятся картинки.
     *
     *  Чтобы добавить арт вручную:
     *    art: {
     *      hero:   'assets/img/games/fire-emblem/hero.jpg',
     *      banner: 'assets/img/games/fire-emblem/banner.jpg',
     *      logo:   'assets/img/games/fire-emblem/logo.png',
     *    }
     *  Локальные пути пишутся от корня сайта, внешние ссылки —
     *  как есть. Подробности в docs/ADDING-GAMES.md.
     *
     *  Цели ниже — заглушка. Настоящий список появится, когда
     *  будут присланы правила прохождения.
     * --------------------------------------------------------- */
    {
      slug: 'fire-emblem-fortunes-weave',
      title: "Fire Emblem: Fortune's Weave",
      status: 'planned',
      platform: 'Nintendo Switch 2',
      year: 2026,
      developer: 'Intelligent Systems',
      release: '2026-09-17',

      /* Игры нет в Steam. Арт взят с вики серии — обложка и кадр.
         Fandom отдаёт 403 на оригиналы, поэтому URL обязательно
         с /scale-to-width-down/. */
      art: {
        capsule: 'https://static.wikia.nocookie.net/fireemblem/images/b/be/' +
                 "Fire_Emblem_Fortune%27s_Weave_Box_Art.png" +
                 '/revision/latest/scale-to-width-down/600',
        hero: 'https://static.wikia.nocookie.net/fireemblem/images/4/46/' +
              "Fire_Emblem_Fortune%27s_Weave_1.jpg" +
              '/revision/latest/scale-to-width-down/1280',
      },

      accent: '#8f6fd6',
      accentAlt: '#e0b457',
      hours: 0,
      rating: null,
      started: null,
      finished: null,
      tags: ['Тактика', 'JRPG', 'Пошаговая'],
      verdict:
        'Вышла 17 сентября 2026. Четыре пути по двенадцать глав, которые ' +
        'сходятся в общей войне, — за один ран всю игру не закрыть.',

      links: [
        { kind: 'wiki', label: 'Fire Emblem Wiki',
          url: "https://fireemblem.fandom.com/wiki/Fire_Emblem:_Fortune%27s_Weave" },
      ],

      goals: [
        { id: 'fe-prologue', group: 'Пролог', tier: 'must',
          title: 'Пройти пролог «Нисхождение»',
          note: 'Две главы: «Белая птица» и «Разорённая земля»',
          art: 'https://static.wikia.nocookie.net/fireemblem/images/4/46/Fire_Emblem_Fortune%27s_Weave_1.jpg' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'fe-cai', group: 'Четыре пути', tier: 'must',
          title: 'Путь Кая — Обелиск Лисы',
          note: '12 глав, финал «Всего одно желание»',
          art: 'https://static.wikia.nocookie.net/fireemblem/images/1/1c/Artwork_Cai.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'fe-dietrich', group: 'Четыре пути', tier: 'must',
          title: 'Путь Дитриха — Обелиск Льва',
          note: '12 глав, финал «Марс, Вестник Войны»',
          art: 'https://static.wikia.nocookie.net/fireemblem/images/5/5c/Artwork_Dietrich.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'fe-theodora', group: 'Четыре пути', tier: 'must',
          title: 'Путь Теодоры — Обелиск Волка',
          note: '12 глав, финал «Война Занбара»',
          art: 'https://static.wikia.nocookie.net/fireemblem/images/7/7e/Artwork_Theodora.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'fe-leda', group: 'Четыре пути', tier: 'must',
          title: 'Путь Леды — Обелиск Орла',
          note: '12 глав, финал «Конец мести»',
          art: 'https://static.wikia.nocookie.net/fireemblem/images/b/b0/Artwork_Leda.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'fe-part2', group: 'Война и спасение', tier: 'must',
          title: 'Часть II: Война — Обелиск Раздора',
          note: 'Шесть глав от Равнин Клитиуса до Воплощения Преисподней',
          art: 'https://static.wikia.nocookie.net/fireemblem/images/a/af/Dagda_map.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'fe-part3', group: 'Война и спасение', tier: 'must',
          title: 'Часть III: Спасение — Врата Судьбы',
          note: 'Шесть глав, финал «К краю сумерек»',
          art: 'https://static.wikia.nocookie.net/fireemblem/images/6/63/Eshmel_Artwork.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'fe-cetus', group: 'Боссы', tier: 'worth',
          title: 'Цетус, Морской Тиран',
          note: 'Глава 8 на пути Дитриха',
          art: 'https://static.wikia.nocookie.net/fireemblem/images/d/d4/CetusFE18Portrait.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'fe-dagda', group: 'Боссы', tier: 'must',
          title: 'Божественный Император Дагда',
          note: 'Часть II, глава 5' },
        { id: 'fe-under', group: 'Боссы', tier: 'must',
          title: 'Воплощение Преисподней',
          note: 'Часть II, глава 6 — конец войны' },
        { id: 'fe-para-orchel', group: 'Паралоги', tier: 'worth',
          title: 'Паралог «Сожаление Орхель»',
          note: 'Единственный, доступный на всех путях',
          art: 'https://static.wikia.nocookie.net/fireemblem/images/c/c1/Artwork_Orchel.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'fe-para-rest', group: 'Паралоги', tier: 'worth',
          title: 'Закрыть остальные восемь паралогов',
          note: 'Часть привязана к конкретным обелискам — за один ран все не собрать',
          art: 'https://static.wikia.nocookie.net/fireemblem/images/7/79/Artwork_Talimun.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'fe-recruit', group: 'Отряд', tier: 'worth',
          title: 'Завербовать всех доступных персонажей',
          art: 'https://static.wikia.nocookie.net/fireemblem/images/4/49/Artwork_Bertrand.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'fe-classes', group: 'Отряд', tier: 'worth',
          title: 'Открыть все классы',
          art: 'https://static.wikia.nocookie.net/fireemblem/images/f/fc/Artwork_Anatolia.png' +
               '/revision/latest/scale-to-width-down/600' },
        { id: 'fe-supports', group: 'Душнина', tier: 'grind',
          title: 'Открыть все support-диалоги',
          note: 'Классический гринд серии: требует нескольких прохождений' },
        { id: 'fe-weapons', group: 'Душнина', tier: 'grind',
          title: 'Собрать все оружие' },
      ],
    },
  ],
};
