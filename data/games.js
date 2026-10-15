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
          link: 'https://eldenring.wiki.fextralife.com/Endings' },
        { id: 'er-remem',     group: 'Боссы',    title: 'Победить всех боссов воспоминаний',       done: true,
          link: 'https://eldenring.wiki.fextralife.com/Bosses' },
        { id: 'er-optional',  group: 'Боссы',    title: 'Закрыть всех опциональных боссов',        done: true, note: 'Включая Малению',
          link: 'https://eldenring.wiki.fextralife.com/Malenia+Blade+of+Miquella' },
        { id: 'er-legacy',    group: 'Карта',    title: 'Зачистить все Legacy Dungeon',            done: true,
          link: 'https://eldenring.wiki.fextralife.com/Legacy+Dungeons' },
        { id: 'er-map',       group: 'Карта',    title: 'Собрать все фрагменты карты',             done: true },
        { id: 'er-graces',    group: 'Карта',    title: 'Найти 100% мест благодати',               done: true,
          link: 'https://eldenring.wiki.fextralife.com/Sites+of+Grace' },
        { id: 'er-ashes',     group: 'Сбор',     title: 'Собрать все Spirit Ashes',                done: true,
          link: 'https://eldenring.wiki.fextralife.com/Spirit+Ashes' },
        { id: 'er-spells',    group: 'Сбор',     title: 'Собрать все заклинания и молитвы',        done: true,
          link: 'https://eldenring.wiki.fextralife.com/Sorceries' },
        { id: 'er-talismans', group: 'Сбор',     title: 'Собрать все талисманы',                   done: true,
          link: 'https://eldenring.wiki.fextralife.com/Talismans' },
        { id: 'er-weapons',   group: 'Сбор',     title: 'Собрать все уникальные оружия',           done: true,
          link: 'https://eldenring.wiki.fextralife.com/Weapons' },
        { id: 'er-quests',    group: 'NPC',      title: 'Довести до конца все линейки NPC',        done: true, note: 'Самое муторное — Ранни и Нефели',
          link: 'https://eldenring.wiki.fextralife.com/Ranni+the+Witch' },
        { id: 'er-plat',      group: 'Мета',     title: 'Платина / 100% ачивок',                   done: true },
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

      goals: [
        { id: 'cp-main',     group: 'Сюжет',    title: 'Пройти основной сюжет',                   done: false },
        { id: 'cp-endings',  group: 'Сюжет',    title: 'Открыть все концовки',                    done: false,
          link: 'https://cyberpunk.fandom.com/wiki/Endings_(Cyberpunk_2077)' },
        { id: 'cp-pl',       group: 'DLC',      title: 'Пройти Phantom Liberty',                  done: false,
          link: 'https://cyberpunk.fandom.com/wiki/Phantom_Liberty' },
        { id: 'cp-pl-end',   group: 'DLC',      title: 'Обе концовки Phantom Liberty',            done: false,
          link: 'https://cyberpunk.fandom.com/wiki/Phantom_Liberty' },
        { id: 'cp-johnny',   group: 'NPC',      title: 'Максимум отношений с Джонни',             done: true,  note: 'Нужно для секретной концовки',
          link: 'https://cyberpunk.fandom.com/wiki/Johnny_Silverhand' },
        { id: 'cp-romance',  group: 'NPC',      title: 'Завершить романтическую линию',           done: true },
        { id: 'cp-fixers',   group: 'Город',    title: 'Закрыть все заказы фиксеров',             done: false, note: '38 из 86',
          link: 'https://cyberpunk.fandom.com/wiki/Fixer' },
        { id: 'cp-ncpd',     group: 'Город',    title: 'Зачистить все точки NCPD',                done: false },
        { id: 'cp-tarot',    group: 'Сбор',     title: 'Найти все граффити Таро',                 done: true,
          link: 'https://cyberpunk.fandom.com/wiki/Fool_on_the_Hill' },
        { id: 'cp-iconic',   group: 'Сбор',     title: 'Собрать всё иконическое оружие',          done: false },
        { id: 'cp-vehicles', group: 'Сбор',     title: 'Купить все машины у Autofixer',           done: false },
        { id: 'cp-cyber',    group: 'Прокачка', title: 'Прокачать все ветки навыков',             done: false },
        { id: 'cp-maxlvl',   group: 'Прокачка', title: 'Достичь 60 уровня',                       done: false, note: 'Сейчас 43' },
        { id: 'cp-plat',     group: 'Мета',     title: '100% достижений',                         done: false },
        { id: 'cp-vhard',    group: 'Челлендж', title: 'Пройти на Very Hard',                     done: false, optional: true },
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
        { id: 'hk-main',     group: 'Сюжет',    title: 'Пройти игру (любая концовка)',            done: false },
        { id: 'hk-endings',  group: 'Сюжет',    title: 'Открыть все 5 концовок',                  done: false },
        { id: 'hk-112',      group: 'Мета',     title: 'Довести завершение до 112%',              done: false, note: 'Главная цель комплишениста' },
        { id: 'hk-charms',   group: 'Сбор',     title: 'Собрать все 45 амулетов',                 done: false,
          link: 'https://hollowknight.fandom.com/wiki/Charms' },
        { id: 'hk-nail',     group: 'Сбор',     title: 'Полностью улучшить гвоздь',               done: false,
          link: 'https://hollowknight.fandom.com/wiki/Nail' },
        { id: 'hk-mask',     group: 'Сбор',     title: 'Собрать все осколки маски и души',        done: false,
          link: 'https://hollowknight.fandom.com/wiki/Mask_Shard' },
        { id: 'hk-journal',  group: 'Сбор',     title: 'Заполнить журнал охотника на 100%',       done: false,
          link: 'https://hollowknight.fandom.com/wiki/Hunter%27s_Journal' },
        { id: 'hk-grimm',    group: 'DLC',      title: 'Закрыть линию Grimm Troupe',              done: false,
          link: 'https://hollowknight.fandom.com/wiki/The_Grimm_Troupe' },
        { id: 'hk-pantheon', group: 'DLC',      title: 'Пройти все 5 Пантеонов Hallownest',       done: false, note: 'Godhome',
          link: 'https://hollowknight.fandom.com/wiki/Godhome' },
        { id: 'hk-pure',     group: 'Челлендж', title: 'Получить Pure Completion (Steel Soul)',   done: false,
          link: 'https://hollowknight.fandom.com/wiki/Steel_Soul_Mode' },
        { id: 'hk-radiance', group: 'Челлендж', title: 'Победить Absolute Radiance',              done: false,
          link: 'https://hollowknight.fandom.com/wiki/Absolute_Radiance' },
        { id: 'hk-p5',       group: 'Челлендж', title: 'Pantheon of Hallownest без привязок',     done: false, optional: true,
          link: 'https://hollowknight.fandom.com/wiki/Godhome' },
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
      platform: 'Nintendo Switch',
      year: null,
      developer: 'Intelligent Systems',

      accent: '#8f6fd6',
      accentAlt: '#e0b457',
      hours: 0,
      rating: null,
      started: null,
      finished: null,
      tags: ['Тактика', 'JRPG', 'Пошаговая'],
      verdict:
        'Не в Steam — арт и ссылки добавим вручную. Цели пока заглушка, ' +
        'жду правила прохождения.',

      goals: [
        { id: 'fe-main',    group: 'Сюжет', title: 'Пройти основной сюжет', done: false },
        { id: 'fe-support', group: 'NPC',   title: 'Открыть все support-диалоги',   done: false },
        { id: 'fe-recruit', group: 'NPC',   title: 'Завербовать всех персонажей',   done: false },
      ],
    },
  ],
};
