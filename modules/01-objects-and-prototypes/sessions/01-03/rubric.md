# Rubric: 01-03 — Что именно делает `new`

## Invariants

- [ ] `manualNew` сохраняет уже реализованные prototype link, передачу аргументов
  и ровно один вызов `Constructor` с receiver как `this`.
- [ ] Explicit object возвращается по identity, без копирования в receiver.
- [ ] Explicit function также становится результатом.
- [ ] Любой primitive, включая truthy-значения и `null`, не заменяет receiver.
- [ ] Внутри решения не используются `new` и `Reflect.construct`.

## Valid alternatives

- Допустима отдельная функция-предикат или явное условие рядом с `return`.
- Допустимы условный оператор и обычный `if`, если они различают тот же набор
  значений.

## Evidence and safety

- [ ] Acceptance test не изменён и проверяет observable identity, prototype и
  вызов результата, а не текст реализации.
- [ ] В `evidence.md` есть версия Node.js, команды, exit codes и релевантные
  красный/зелёный результаты фактических запусков.

## Optional improvements

- Собственный пример с constructor, возвращающим array, не блокирует PASS.
- Проверка не-constructable функций относится к полной модели `[[Construct]]` и
  не требуется в этой карточке.

## NEEDS_WORK

Верните `NEEDS_WORK`, если выбор основан на truthiness, если потеряны `null` или
function cases, если constructor вызывается повторно, если object копируется
вместо возврата по identity либо готовый construction API обходит цель
упражнения.
