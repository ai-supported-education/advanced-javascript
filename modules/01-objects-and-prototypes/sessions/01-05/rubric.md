# Rubric: 01-05 — Когда prototype становится уязвимостью

## Invariants

- [ ] `mergePreferences` принимает только own enumerable `theme` и `pageSize`.
- [ ] JSON key `__proto__`, унаследованный `theme` и посторонние own keys не
  пересекают границу.
- [ ] Prototype результата остаётся `Object.prototype`; input и глобальные
  prototypes не мутируют.
- [ ] `diagnosis.md` различает enumeration inherited key и special assignment
  `__proto__`.

## Valid alternatives

- Допустимы `Object.keys`, `Object.entries` или другой способ получить только own
  enumerable keys вместе с явной allowlist.
- Allowlist может быть `Set`, массивом или явными ветками, если контракт остаётся
  тем же.

## Evidence and safety

- [ ] Использованы только synthetic локальные objects; нет действий против
  внешних приложений.
- [ ] `diagnosis.md` фиксирует Node.js 24 и фактический `true` от runtime
  preflight legacy-accessor до красного baseline.
- [ ] В `diagnosis.md` есть версия Node.js, команды, exit codes и релевантные
  красный/зелёный результаты; наблюдения не выдуманы и tests не менялись.

## Optional improvements

- Отдельная type validation значений возможна позже и не блокирует PASS.

## NEEDS_WORK

Верните `NEEDS_WORK`, если решение полагается только на blacklist, копирует
унаследованные поля, допускает смену prototype либо диагноз смешивает две причины.
