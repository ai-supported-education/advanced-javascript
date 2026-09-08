# Profile: advanced-javascript

Этот профиль применяется только к курсу углублённого JavaScript. Он дополняет
`software`, но не переносит правила какого-либо framework или его архитектуры.

## JavaScript semantics first

- Новое поведение сначала показывается в исполняемом `.js`/`.mjs` примере.
- Каждый вывод помечает слой: ECMAScript, browser host, Node.js runtime или
  toolchain.
- Implementation detail двигателя разрешён только как отдельно названное
  наблюдение и не превращается в переносимую гарантию языка.
- Старый, но редко используемый API не называется «новым»: дата стандартизации и
  текущая доступность рассматриваются отдельно.

## TypeScript без смены механизма

- TypeScript используется для erasable syntax и проверки типов package contract.
- `erasableSyntaxOnly` и `verbatimModuleSyntax` обязательны.
- Если синтаксис требует emit-трансформации или меняет module graph, основной
  пример остаётся на JavaScript, а отличие TypeScript разбирается отдельно.
- Acceptance test проверяет runtime behavior, а не факт использования конкретного
  синтаксиса или API.
- Для публикуемой библиотеки `.ts` является authoring source: runtime entry
  поставляется как `.js`, а типовой контракт — как `.d.ts`. Native type stripping
  установленного package не считается build pipeline.
- При TypeScript 7 Rollup не получает `.ts` напрямую: `tsc` CLI сначала выпускает
  промежуточный ESM `.js`, declarations и карты, Rollup читает `.js`, а
  локальный `load` hook явно возвращает `{ code, map }` из `.js` и соседней
  `.js.map`. Acceptance трассирует строку final bundle к исходному `.ts`,
  проверяет stack/DevTools fixtures и отсутствие staging-каталога в tarball.
  Необъявленный TS plugin или TypeScript programmatic API не подразумевается.

## Runtime evidence

- Node.js 24 LTS — обязательный baseline, Node.js 26 — compatibility target.
- Browser evidence содержит Playwright/Chromium version.
- Перед первой browser-сессией выполняется отдельный
  `pnpm exec playwright install chromium`, затем read-only headless smoke из
  `curriculum/probes/playwright-smoke.mjs`. На Linux список OS dependencies можно
  получить через `playwright install-deps chromium --dry-run`, а изменяющая host
  установка требует отдельного разрешения. Неудачный launch является
  stop-condition до старта карточки, а не незавершённым хвостом её DONE.
- Cross-runtime fixture хранит browser и Node traces отдельно; совпадающий API не
  превращает DOM, WHATWG и Node host contracts в один слой.
- Для порядка событий сохраняется наблюдавшаяся последовательность, а не только
  ожидаемая диаграмма.
- Для памяти не обещается момент GC или вызова finalizer; проверяются достижимость,
  удерживающие ссылки и повторяемая диагностическая процедура.

## Публикация библиотеки

До public release package проверяется из упакованного tarball минимум двумя
consumer fixtures. В capstone первая публикация идёт с интерактивной 2FA в личную
публичную npm organization учащегося; следующий patch release — через GitHub
Actions trusted publishing на GitHub-hosted runner с provenance из его публичного
fork. Минимальные версии Node.js/npm, точное соответствие `repository.url` и
workflow, public visibility и OIDC permissions проверяет отдельный preflight.
Credentials никогда не входят в repository, packets или evidence.

Между проверкой и публикацией сохраняется identity artifact. Для первой версии
`npm publish ./<package.tgz> --access public` получает тот же именованный tarball
и SHA-256, который прошёл consumer matrix; затем проверяется анонимная установка.
Для CI patch один workflow сначала создаёт tarball, затем
проверяет и публикует этот же файл; повторная неидентифицированная сборка перед
publish не считается эквивалентным evidence.
