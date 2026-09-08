# Rubric: 01-04 — Class поверх prototype chain

## Invariants

- [ ] `Counter` сохраняет независимое `value` каждого экземпляра.
- [ ] `increment` находится в `Counter.prototype`, а не создаётся как own property.
- [ ] Одна функция работает с receiver обычного вызова и с receiver из `call`.
- [ ] `notes.md` разделяет property lookup и определение `this`.

## Valid alternatives

- Допустима обычная function expression или эквивалентный concise method,
  установленный в prototype.
- Формулировка объяснения свободна, если причинно связывает receiver с `this`.

## Evidence and safety

- [ ] Test не изменён и проверяет наблюдаемое состояние/identity.
- [ ] В `notes.md` есть версия Node.js, команды, exit codes и релевантные
  red/green результаты; наблюдения не выдуманы.

## Optional improvements

- Дополнительный собственный пример с `call` или `Reflect.apply` не блокирует PASS.

## NEEDS_WORK

Верните `NEEDS_WORK`, если состояние хранится в prototype, метод размножается по
экземплярам, test обойдён либо `notes.md` объясняет `this` местом объявления.
