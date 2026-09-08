# Контракт versioned evidence

Этот документ не является ответом учащегося и не заменяет запуск карточек. Он
фиксирует, какими независимыми наблюдениями автор проверяет version-sensitive
части roadmap и что именно каждое наблюдение способно доказать.

## TypeScript-cell для 12-03

Author probe выполнен 2026-09-07 на `Darwin arm64` с lockfile курса. Команда
`pnpm exec tsc --version` фактически вернула `Version 7.0.2`.

Положительный probe использует
[`curriculum/probes/uint8array-types.ts`](probes/uint8array-types.ts):

```ts
const encoded: string = new Uint8Array([0x4a, 0x53]).toBase64();
const decoded: Uint8Array = Uint8Array.fromBase64(encoded);

void decoded;
```

```bash
pnpm exec tsc --noEmit --strict --target ES2025 --module NodeNext \
  --moduleResolution NodeNext --lib ES2025,ESNext.TypedArrays \
  curriculum/probes/uint8array-types.ts
```

Наблюдение: exit code `0`, diagnostics отсутствуют. Отрицательный контроль с тем
же source и `--lib ES2025` вернул `TS2339` для `toBase64` и `TS2550` для
`fromBase64`. Поэтому этот результат подтверждает только следующее: compiler,
разрешённый lockfile как `typescript@7.0.2`, предоставляет эти declarations при
явном выборе `ESNext.TypedArrays`. Он не доказывает наличие методов в Node.js или
Chromium.

Локальный файл declarations
`lib.esnext.typedarrays.d.ts` из platform package
`@typescript/typescript-darwin-arm64@7.0.2` имел SHA-256
`83a730b125d477dd264df8ba479afab27a3dae7152b005c214ab94dc7ee44fd3`.
Lockfile отдельно фиксирует integrity и верхнего `typescript@7.0.2`, и platform
package. Учащийся повторяет probe в своей среде и сохраняет собственные версии и
diagnostics; этот author output нельзя копировать как learner observation.

## Runtime- и build-cells для 12-03

Runtime availability не выводится из edition стандарта или TypeScript types.
Карточка должна запускать один behaviour fixture отдельно в Node.js 24.x,
Node.js 26.x и Chromium, установленном pinned Playwright, и записывать точные
`process.version` либо browser version рядом с результатом.

Rollup-cell использует тот же двухшаговый контракт, что и будущая 11-02: `tsc`
из lockfile через CLI выпускает промежуточный ESM `.js`, declarations и карты,
после чего локальный Rollup `load` hook читает `.js` и соседнюю `.js.map` и
возвращает `SourceDescription` с `{ code, map }`. Репозиторный probe находится в
`curriculum/probes/rollup-sourcemap`: verifier через trace mapping требует, чтобы
строка final bundle указывала на `entry.ts:2` и сохраняла TypeScript source
content. Карточка 11-03 отдельно проверит Node stack trace и browser DevTools
fixture, а 11-05 — состав tarball; прямой TypeScript plugin не подразумевается.
Успешная сборка означает
только, что этот toolchain принял source и сохранил нужное обращение к API; она не
превращается в доказательство runtime support. Ошибка любого probe — валидная
красная клетка матрицы и вход для решения о fallback, а не повод подменить
наблюдение таблицей ожиданий.

Для browser-cell одного `pnpm install` недостаточно. До старта карточки setup
выполняет `pnpm exec playwright install chromium`, затем запускает
`node curriculum/probes/playwright-smoke.mjs`. Smoke открывает локальную
`data:`-страницу и записывает фактический `browser.version()`; ошибка launch или
OS dependency является stop-condition. Linux `install-deps --dry-run` остаётся
read-only проверкой, а установка system packages требует явного разрешения.

Sourcemap bridge проверен 2026-09-08 в чистых containers
`node:24.20.0-bookworm` и `node:26.8.1-bookworm`. После frozen install в каждом
container выполнены одинаковые команды:

```bash
pnpm exec tsc -p curriculum/probes/rollup-sourcemap/tsconfig.json
pnpm exec rollup --config curriculum/probes/rollup-sourcemap/rollup.config.mjs
node curriculum/probes/rollup-sourcemap/verify.mjs
```

Обе среды использовали TypeScript `7.0.2` и Rollup `4.63.1`, завершились с exit
code `0` и напечатали одно и то же наблюдение:

```json
{"generated":"2:4","original":{"source":"../../../../curriculum/probes/rollup-sourcemap/entry.ts","line":2,"column":2,"name":null},"sourcesContent":true}
```

Результат подтверждает именно объявленный bridge и одну mapping boundary; он не
заменяет будущие stack/DevTools acceptance checks карточки 11-03 или tarball
checks карточки 11-05.

## Compatibility gate опубликованной главы

Авторский gate выполнен 2026-09-08 в чистых Linux arm64 containers из образов
`node:24.20.0-bookworm` и `node:26.8.1-bookworm`. В обоих случаях repository
копировался в пустой `/work`, зависимости устанавливались из текущего lockfile
командой `pnpm install --frozen-lockfile --force`, после чего последовательно
выполнялись:

```bash
node --version
pnpm session:validate
pnpm test
pnpm typecheck
```

Для Node.js 24 использован `corepack prepare pnpm@10.5.0 --activate`. В образе
Node.js 26 команда `corepack` отсутствовала и первый bootstrap завершился с exit
code `127`; успешный повтор установил ту же версию командой
`npm install --global pnpm@10.5.0`. Это различие относится к составу container
image, а не к семантике JavaScript или результату тестов.

Наблюдения успешных запусков:

| Runtime | Validate | Tests | Typecheck | Exit |
| --- | --- | --- | --- | ---: |
| `v24.20.0` | 75 карточек, published materials 5/5 | 16 файлов, 73 теста | без diagnostics | 0 |
| `v26.8.1` | 75 карточек, published materials 5/5 | 16 файлов, 73 теста | без diagnostics | 0 |

Gate подтверждает совместимость текущего manifest, runner и опубликованной главы
с этими двумя точными runtime и lockfile. Он не заменяет author proofs: red/green
и counterexample карточек 01-02—01-05 отдельно записаны на baseline Node.js
`v24.20.0`. Он также не доказывает поддержку будущих browser API или всех
возможных конфигураций Node.js; например, карточка 01-05 сама проверяет наличие
legacy-accessor `__proto__` перед упражнением.

Установленный `@types/node@26` описывает статическую поверхность типов и сам по
себе не доказывает совместимость с Node.js 24. Нижняя граница подтверждается
именно отдельным runtime gate в `node:24.20.0-bookworm`; для будущего runner-кода,
который начнёт использовать новые Node API, этого gate недостаточно без
поведенческой проверки затронутого API.

На том же snapshot в `node:26.8.1-bookworm` отдельно выполнены команды

```bash
pnpm author:proof 01-02
pnpm author:proof 01-03
pnpm author:proof 01-04
pnpm author:proof 01-05
```

Все четыре завершились с exit code `0`: starter каждой карточки упал по
ожидаемой причине, минимальный solution прошёл тот же acceptance test, а все
перечисленные plausible-wrong patches были отвергнуты. Полученные в этом
compatibility run JSON не публикуются вместо baseline-записей Node.js 24; запуск
подтверждает только повторяемость тех же поведенческих ворот на точной версии
Node.js `v26.8.1`.

Preflight 01-05 отдельно проверен 2026-09-08 следующими командами:

```bash
docker run --rm node:24.20.0-bookworm \
  node -e 'const p = {}; const o = {}; o["__proto__"] = p; console.log(Object.getPrototypeOf(o) === p)'
docker run --rm node:24.20.0-bookworm \
  node --disable-proto=delete -e 'const p = {}; const o = {}; o["__proto__"] = p; console.log(Object.getPrototypeOf(o) === p)'
```

В обычной конфигурации первая команда напечатала `true` и завершилась с exit
code `0`; при `--disable-proto=delete` вторая напечатала `false` и также
завершилась с exit code `0`. Поэтому stop-condition различает как раз ту
runtime-возможность, от которой зависит демонстрация; это наблюдение не
превращает исторический accessor в универсальную часть каждой среды ECMAScript.

## Правило currentness

При изменении lockfile, Node baseline/target, Playwright или Rollup author probe
становится устаревшим. Перед публикацией соответствующей карточки его запускают
заново и обновляют дату, версии, команды и фактические результаты.
