# Preflight публичной части capstone

Карточки курса рассчитаны на 30–60 минут, но регистрация аккаунта, восстановление
2FA и ожидание внешнего сервиса в этот срок не укладываются предсказуемо. Поэтому
публикационные карточки начинаются только после отдельного preflight. Это не
«хвост» предыдущей карточки и не часть её таймера.

## Перед 15-09

Не начинайте карточку, пока одновременно не выполнены условия:

- email npm-аккаунта подтверждён, вход в `npmjs.com` работает;
- для публикаций включена 2FA, а recovery codes сохранены вне repository;
- создана собственная публичная npm organization; зафиксированы её точный scope
  и полное имя будущего package;
- из 15-08 сохранены точный путь к единственному `.tgz`, его package version и
  SHA-256; повторный `pack` перед публикацией не планируется;
- команда первой публикации заранее зафиксирована как
  `npm publish ./<package.tgz> --access public`; placeholder заменяется только на
  проверенный путь из 15-08, а access level не оставляется неявным;
- `npm whoami` работает в отдельном безопасном терминале, но token и содержимое
  `.npmrc` не копируются в course branch, evidence или agent packets;
- status page npm не сообщает об инциденте с publish/registry.

Если условие не выполнено, остановитесь до `session:start`: завершённая часть
курса остаётся зелёной, а внешняя поддержка аккаунта не превращается в
незакрытую учебную карточку.

## Перед 15-10

После первой публикации и до запуска таймера следующей карточки проверьте:

- версия из 15-09 доступна через публичный registry;
- GitHub source repository, из commit которого release job собирает package,
  публичен; npm package также публичен, GitHub Actions в repository разрешены;
- `repository.url` в `package.json` в точности, включая регистр, указывает на этот
  source repository; если package находится внутри monorepo, корректно заполнен и
  `repository.directory`;
- release job использует GitHub-hosted runner, а не self-hosted runner;
- release workflow из starter находится по зафиксированному пути и проходит
  локальный dry run без credentials; его точное имя файла известно для настройки
  trusted publisher, а permissions включают `id-token: write` и `contents: read`;
- workflow создаёт tarball один раз, записывает его SHA-256, прогоняет matrix над
  этим файлом и передаёт тот же путь в `npm publish`; независимая повторная build
  между проверкой и publish не допускается;
- команды `node --version` и `npm --version` записаны в preflight evidence:
  Node.js не ниже 22.14.0, npm CLI не ниже 11.5.1;
- есть доступ к настройкам package в npm для создания trusted publisher;
- package version подготовлена к одному patch bump, а повторная публикация той
  же версии не используется как стратегия retry.

В 15-10 настраивается именно GitHub Actions trusted publisher для этого workflow
и ему явно разрешается `npm publish`. Другой provider не является альтернативным
путём карточки: CircleCI, например, может быть trusted publisher, но npm не
создаёт для него provenance attestation. Preflight лишь проверяет, что нужные
аккаунты, версии, права и файлы доступны до запуска таймера.

## Stop/retry conditions

При outage npm или GitHub, private visibility source repository/package,
несовпадении `repository.url`/`repository.directory`, запросе дополнительной
account verification либо неожиданном отказе 2FA остановите внешние команды.
Сохраните только безопасные данные: UTC-время, имя операции, публичный status и
текст ошибки без token.
Возвращайтесь к той же карточке после восстановления внешнего состояния; не
меняйте package name, version или authentication policy наугад.

DONE для 15-09 и 15-10 требует фактической публичной проверки. Для 15-10 отдельно
проверяются patch version в registry и provenance attestation, связанная с
публичным commit/workflow. Для обеих карточек evidence сохраняет имя и SHA-256
проверенного tarball; 15-09 публикует именно файл из 15-08, а 15-10 проверяет и
публикует один artifact внутри workflow. Первая карточка дополнительно проверяет
public metadata и анонимную установку exact name/version. Local dry run не
выдаётся за publication evidence, а ожидаемый вывод из README — за наблюдавшийся.
