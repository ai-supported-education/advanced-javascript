# Аудитория и границы курса

## На что курс опирается

Учащийся уже разрабатывает веб-приложения на JavaScript или TypeScript и умеет:

- читать функции, объекты, классы, массивы, `Promise` и базовый `async`/`await` в
  прикладном коде;
- пользоваться `npm`/`pnpm`, Git и автоматическими тестами;
- отличать браузерный код от Node.js-кода на уровне доступных API;
- находить ошибку по stack trace и ставить небольшой воспроизводимый эксперимент.

Знать заранее устройство prototype chain, генераторов, ESM resolution, сборщиков,
garbage collector или event loop не требуется. Эти механизмы вводятся в курсе,
а не используются как скрытые prerequisites.

Под «базовым `async`/`await`» понимается умение прочитать `async function`,
дождаться Promise и обработать исключение через `try`/`catch`. Когда именно
продолжится код после `await`, как устроено settlement и чем отличаются очереди
браузера и Node.js, входным знанием не считается: это отдельные главы курса.

## Что именно изучается

Предмет курса — наблюдаемая семантика JavaScript и границы между четырьмя слоями:

1. ECMAScript как стандарт языка;
2. host API браузера или Node.js;
3. конкретная реализация runtime и её диагностические инструменты;
4. toolchain — TypeScript, test runner, bundler и package manager.

Утверждение о поведении всегда относится к названному слою. Особенность V8 не
выдаётся за гарантию ECMAScript, а поведение browser event loop — за правило
Node.js.

## Runtime matrix

Node.js 24 LTS служит baseline: обязательные Node-упражнения должны проходить на
нём. Node.js 26 — второй compatibility target для обнаружения отличий runtime и
предстоящего обновления LTS. Браузерные упражнения запускаются в версии Chromium,
которую фиксирует установленная версия Playwright; evidence записывает версии
Node.js и браузера вместе с результатом.

Перед первой browser-карточкой отдельный setup preflight выполняет
`pnpm exec playwright install chromium`, а затем
`node curriculum/probes/playwright-smoke.mjs`: smoke действительно запускает
pinned headless Chromium, открывает локальную `data:`-страницу, читает title и
закрывает browser. На Linux перед изменением host можно отдельно посмотреть
требуемые system packages через
`pnpm exec playwright install-deps chromium --dry-run`; реальный `install-deps`
или `--with-deps` выполняется только с явным разрешением владельца среды. Загрузка
и smoke не входят в таймер карточки: любая ошибка является stop-condition до
`session:start`, а успешный preflight сохраняет фактический `browser.version()`.

## Граница TypeScript

TypeScript допустим для аннотаций, type-only imports и проверки package types,
если Node.js может стереть синтаксис типов без генерации другого JavaScript.
Корневой `tsconfig.base.json` закрепляет `erasableSyntaxOnly` и
`verbatimModuleSyntax`. `enum`, parameter properties и другие конструкции с
runtime-трансформацией не используются как короткий путь.

Если карточка исследует lookup, descriptors, iteration, ESM или scheduling, её
исполняемый пример остаётся `.js`/`.mjs`. Типы могут дополнять такое наблюдение,
но не подменяют его.

В главе о библиотеке TypeScript compiler и Rollup являются двумя явными CLI-шагами
toolchain. Сначала `tsc` проверяет erasable `.ts` и выпускает промежуточный ESM
`.js`, `.d.ts` и карты; затем Rollup читает только этот `.js`, а не TypeScript
source. Подготовленный локальный `load` hook читает соседнюю `.js.map` и возвращает
Rollup `{ code, map }`; это явный механизм ingestion, а не надежда на
`output.sourcemap`. Acceptance трассирует конкретную строку final bundle к `.ts`,
проверяет stack/DevTools fixtures и удаление промежуточного каталога из tarball.
Это не зависит от TypeScript programmatic API или неподтверждённого TS-плагина
Rollup. Node.js type stripping не используется для запуска `.ts` из
установленного `node_modules`.

## Что не входит в стартовый scope

- lifecycle конкретного framework и его архитектурные соглашения;
- устройство JIT-компилятора на уровне реализации оптимизатора;
- гарантии точного момента garbage collection или finalization;
- production credentials и публикация в заранее заданный npm namespace.

Workers в курсе являются границей исполнения и обмена сообщениями, но не
security sandbox. Capstone исполняет доверенный plugin code; недоверенными
считаются входные сообщения и данные. Настоящий запуск враждебного кода требует
другого threat model и в scope курса не входит.

Structured lifetime, размеры bounded queues, plugin capabilities, lifecycle,
failure contract и redaction policy — проектные выводы курса. Стандарты,
security guidance и runtime docs дают исходные факты, но не доказывают
единственно верный дизайн; в карточках эти решения помечаются как design policy
или inference и проверяются собственным contract/evidence.

В capstone учащийся использует собственный npm-профиль и создаёт собственную
бесплатную публичную organization. Первый release подтверждается интерактивной
2FA; дальнейший patch-release использует GitHub Actions trusted publishing на
GitHub-hosted runner и provenance из публичного fork. Точные минимальные версии
Node.js/npm и остальные внешние условия проверяются отдельным preflight перед
карточкой, а не скрываются в её таймере. Курс не резервирует и не предполагает
общий namespace.
