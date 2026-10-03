# План добавления вариантов Oxlint

## Задача

Добавить в `@st1ggy/linter-config` шесть самостоятельных вариантов: `common-ox`, `react-ox`, `solid-ox`, `next-ox`, `svelte-ox`, `astro-ox`. Опубликовать одноимённые subpath exports, добавить соответствующие флаги CLI и генерацию `oxlint.config.ts`. Использовать Oxlint с нативным TypeScript 7 через `oxlint-tsgolint`; сохранить существующие Prettier- и Stylelint-пресеты для соответствующих стеков.

Выполнять новые проверки только через Oxlint: переносить все доступные нативные правила и совместимые JS-правила с сохранением severity, опций и области применения. По согласованному решению не запускать ESLint-остаток. Каждую непереносимую проверку и каждое частичное соответствие зафиксировать в проверяемом реестре с причиной и воспроизводимым примером. Существующие шесть ESLint-вариантов продолжат работать параллельно; их TS6 API может оставаться зависимостью пакета и JS-плагинов, но типовую информацию для Oxlint должен предоставлять только нативный TS7.

## Структура плана

Выполнить группы последовательно: инфраструктура и исходный inventory; общие правила; фреймворки; публичные экспорты; CLI; аудит покрытия; документация и CI. После каждого этапа реализации выполнить следующий этап тестирования. Вести прогресс в `vibe/oxlint-variants-plan-track.md`.

## План выполнения

### Этап 1: Подготовить инструменты TS7 и полный исходный inventory

**Что добавить/реализовать:**

- Зафиксировать исходные версии инструментов: `oxlint@1.86.0`, `oxlint-tsgolint@7.0.2003`, нативный `typescript@7.0.2`. Добавить первые два пакета в devDependencies и optional peerDependencies; добавить `@typescript/native: npm:typescript@7.0.2` только в devDependencies для явного запуска компилятора проекта.
- Сохранить `typescript: ~6.0.3` для существующего ESLint API. Добавить `typecheck:ox` со значением `node ./node_modules/@typescript/native/bin/tsc --noEmit`; не выбирать компилятор через неоднозначный общий bin `tsc`.
- В текущем CI и обеих проверяющих ветках Release заменить `npx tsc --noEmit` на `node ./node_modules/typescript/bin/tsc --noEmit`, чтобы прежняя проверка гарантированно оставалась на TS6 после установки native alias.
- Удалить `baseUrl` и `ignoreDeprecations` из корневого `tsconfig.json`; проверить исходные импорты обоими компиляторами.
- Добавить `scripts/oxlint-inventory.mjs` с режимом `--source-only`. Через `ESLint.calculateConfigForFile()` собирать effective rules, settings и области применения из всех шести исходных пресетов.
- Вывести матрицу file scopes из реальных glob-ограничений и overrides пресетов. Обязательно включить JS/JSX/TS/TSX, MJS/CJS/MTS/CTS, декларации, `.vue` из `constants.js`, `.svelte`, `.svelte.js`, `.svelte.ts`, `.astro` и виртуальные script-файлы существующих процессоров. Использовать репрезентативные имена внутри и вне `src/`; сохранить исходные glob-ограничения и порядок overrides.
- В каждой записи хранить preset, file scope, source rule ID, severity, полный массив опций, версию плагина и `requiresTypeChecking`. Отдельно учитывать выключенные правила. Не ограничивать исходный набор текущим inventory, в котором на пресет приходится один sample-файл.
- Проверить исходный parser на корректном fixture каждого scope и сохранить `baselineStatus`: `lintable`, `config-only`, `ignored` или `parse-error`. Исходные ограничения, включая `.vue` без специализированного парсера, не скрывать; отличать сконфигурированные правила от реально исполняемых. Новый Vue-стек не добавлять.
- Добавить режим `--source-only --check`, сравнивающий снимок с текущими исходными конфигами. Сериализовать результат детерминированно, без абсолютных путей рабочей машины и текущего времени.
- Добавить `scripts/oxlint-tools.mjs` для разрешения установленного Oxlint CLI и запуска его через `process.execPath`, без загрузки глобальных executables и без обращения к приватному CLI API.

**Файлы для изменения/создания:**

- `package.json`, `package-lock.json`, `tsconfig.json`.
- `.github/workflows/ci.yml`, `.github/workflows/release.yml` — явный путь к TS6.
- `scripts/oxlint-inventory.mjs`, `scripts/oxlint-tools.mjs`.
- `data/oxlint-source-inventory.json`.

**Документация:**

- <https://oxc.rs/docs/guide/usage/linter/type-aware.html> — нативный движок, `typeAware`, `typeCheck`, автоматический поиск tsconfig.
- <https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0> — совместная установка TS6/TS7.

**Примеры в проекте:** `scripts/inventory.mjs`, `src/eslint/configs/config.typescript.js`, `scripts/package-smoke.mjs`.

**Команды проверки:**

```bash
npm ci
node ./node_modules/typescript/bin/tsc --noEmit
npm run typecheck:ox
node scripts/oxlint-inventory.mjs --source-only
node scripts/oxlint-inventory.mjs --source-only --check
npm run lint
```

### Этап 2: Проверить инфраструктуру и исходные области действия

**Что добавить/реализовать:**

- Добавить тесты `node:test`, создающие временные consumer-проекты с собственным tsconfig и очисткой через `context.after()`.
- Проверить фактическую версию нативного компилятора `7.0.2`, успешную проверку корректного TS и диагностику намеренной ошибки типов.
- Запустить Oxlint с минимальным конфигом, `typeAware: true` и `typescript/switch-exhaustiveness-check`; проверить пропущенный вариант union-типа, объявленного в соседнем модуле. Включить `--type-check` в отдельном сценарии.
- Проверить полноту source inventory по шести пресетам, различие JS/TS/SFC-областей, сохранение опций и выключенных правил. Проверить, что изменение исходного правила приводит к ошибке режима `--check` на временной копии снимка.
- Все намеренно некорректные исходники хранить строками в fixture-модуле и материализовать во временных каталогах; не включать ошибочные TS-файлы в корневой tsconfig.

**Файлы для создания:** `scripts/oxlint-toolchain.test.mjs`, `scripts/oxlint-source-inventory.test.mjs`, `scripts/fixtures/oxlint-cases.mjs`.

**Примеры в проекте:** `scripts/solid-config.test.mjs` — временный проект, проверка diagnostics, cleanup.

**Команды проверки:**

```bash
node --test scripts/oxlint-toolchain.test.mjs scripts/oxlint-source-inventory.test.mjs
node --test scripts/solid-config.test.mjs
npm run lint
```

### Этап 3: Реализовать полный перенос общего слоя

**Что добавить/реализовать:**

- Создать `data/oxlint-rule-map.json`: для каждой исходной записи общего слоя указать один итоговый статус `native`, `js-plugin`, `partial`, `unsupported` или `disabled`. Для `partial`/`unsupported` добавить конкретное ограничение, ссылку на документацию/issue и fixture, демонстрирующий пробел. `disabled` использовать только для исходно выключенных правил.
- Выбирать реализацию в строгом порядке: подтверждённый нативный эквивалент с поддержкой всех исходных опций; совместимое исходное JS-правило; явно задокументированный частичный перенос; неподдерживаемая проверка. Совпадение имени правила не считать доказательством эквивалентности.
- Использовать `oxlint --rules --format json` как каталог нативных правил. Для SonarJS искать семантические эквиваленты также в других namespace; отсутствие нативного namespace `sonarjs` не считать отсутствием всех эквивалентов.
- Перенести все общие семейства: ESLint core, 36 активных TypeScript-правил текущего TS-sample, Stylistic, import-x, Prettier, Unicorn и 217 активных SonarJS-правил текущего sample. Проверить расширенный набор из source inventory, а не использовать эти числа как ограничение.
- Реализовать JS-адаптеры для core через `builtinRules` из `eslint/use-at-your-own-risk`, а также для Stylistic, import-x, Prettier, Unicorn, SonarJS и синтаксических TypeScript-правил. Для последнего получать `plugin` из уже установленного `typescript-eslint` и включать только правила, проверенные без parser services. Использовать отдельные alias namespace для конфликтующих с нативными именами плагинов, например `eslint-js`, `import-x-js`, `unicorn-js`, `typescript-js`; регистрировать только реально используемые adapters.
- Типозависимые JS-правила без нативного эквивалента не объявлять работающими по одному факту загрузки: проверить диагностику на нарушающем примере и описать недоступную часть. Не создавать TS6 Program и не вызывать ESLint/Linter как скрытый исполнитель.
- Сохранить пользовательские настройки `no-restricted-syntax`, запрет enum, стиль `type`, `consistent-type-imports`, import ordering, исключения Unicorn и JSX/Prettier-совместимость. При коллизии `no-unused-vars: off` и `@typescript-eslint/no-unused-vars: error` сохранить включённую TS-проверку в целевом правиле.
- Добавить `scripts/oxlint-generate.mjs --stacks common`, который создаёт явный набор правил из source inventory и rule map. Сгенерированные конфиги не должны импортировать исходные ESLint-пресеты или рассчитывать ESLint config при запуске потребителя.
- В `createOxlintConfig()` явно отключить категории правил по умолчанию и включить только перенесённые проверки. В корневом результате выставить `options.typeAware: true`; type-check diagnostics включать отдельно флагом `--type-check`. Для consumer-композиции через `extends` требовать `options.typeAware: true` непосредственно в consumer root config: root-only options не считать наследуемыми.
- Формировать specifier локальных адаптеров относительно `import.meta.url`. Сам конфиг не должен импортировать optional framework plugins при загрузке; их загружает Oxlint через локальные adapter-модули.
- Добавить `scripts/oxlint-smoke.mjs --stacks common`: запускать созданный конфиг на временном корректном проекте и на ограниченном наборе заведомых нарушений.

**Файлы для изменения/создания:**

- `data/oxlint-rule-map.json`, `scripts/oxlint-generate.mjs`, `scripts/oxlint-smoke.mjs`.
- `src/oxlint/create-config.js`, `src/oxlint/configs/config.common.js`, `src/oxlint/oxlint.config.common.js`.
- `src/oxlint/plugins/eslint-core.js`, `src/oxlint/plugins/stylistic.js`, `src/oxlint/plugins/import-x.js`, `src/oxlint/plugins/prettier.js`, `src/oxlint/plugins/unicorn.js`, `src/oxlint/plugins/sonarjs.js`, `src/oxlint/plugins/typescript.js`.

**Документация:**

- <https://oxc.rs/docs/guide/usage/linter/js-plugins.html> — alias namespace, ограничения parser services и plugin API.
- <https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint.html> — мигратор использовать как вспомогательный источник кандидатов, не как доказательство полного переноса.
- <https://oxc.rs/docs/guide/usage/linter/config.html> — overrides, категории и композиция конфигов.

**Примеры в проекте:** `src/eslint/configs/config.common.js`, `config.typescript.js`, `config.import.js`, `config.prettier.js`, `config.unicorn.js`, `config.sonarjs.js` в том же каталоге.

**Команды проверки:**

```bash
node scripts/oxlint-generate.mjs --stacks common
node scripts/oxlint-smoke.mjs --stacks common
npm run typecheck:ox
npm run lint
```

### Этап 4: Проверить эквивалентность общих правил

**Что добавить/реализовать:**

- Добавить публичные CLI-тесты общего Oxlint-пресета: положительные примеры и нарушения из каждой переносимой группы правил, сообщения, severity, file scopes и exit codes.
- Для каждой записи `native`/`js-plugin` добавить evidence: ID корректного и нарушающего fixture, ожидаемые source/target rule IDs, severity, scope и исходные опции. Общий fixture разрешить использовать для нескольких правил/scopes, но проверять диагностику каждого заявленного правила отдельно. Загрузка конфига, наличие rule ID и отсутствие crash не заменяют срабатывание на нарушении.
- Проверить все явно заданные в исходниках нестандартные опции; отдельно покрыть TS/core-коллизии, enum selector, type imports, import aliases, правила Unicorn, несколько синтаксических SonarJS-правил и Prettier diagnostics/fixes.
- Сравнить исходный ESLint и Oxlint на одном corpus. ESLint запускать только как тестовый эталон. Нормализовать rule IDs через rule map; различия сообщений отделить от различий обнаружения ошибки.
- Для каждого `partial`/`unsupported` сохранить воспроизводимый fixture и причину; проверка должна падать при появлении необъяснённой потери диагностики.
- Проверить `.gitignore`, локальные ignores, запуск из consumer cwd, отсутствие сторонних recommended/default rules и отсутствие вызова ESLint в consumer-команде Oxlint.

**Файлы для создания/изменения:** `scripts/oxlint-common.test.mjs`, `scripts/oxlint-parity.test.mjs`, `scripts/fixtures/oxlint-cases.mjs`, `data/oxlint-rule-map.json`.

**Примеры в проекте:** `scripts/solid-config.test.mjs`, `src/eslint/configs/config.gitignore.js`.

**Команды проверки:**

```bash
node --test scripts/oxlint-common.test.mjs scripts/oxlint-parity.test.mjs
node scripts/oxlint-smoke.mjs --stacks common
npm run lint
```

### Этап 5: Реализовать остальные пять Oxlint-пресетов

**Что добавить/реализовать:**

- Добавить `react-ox` и `next-ox`, сохранив порядок common → React → Next. Сопоставить правила React, hooks и Next со встроенными реализациями; для неполных нативных соответствий подключить исходные JS-правила под alias `react-js`, `react-hooks-js`, `next-js`.
- Добавить `solid-ox` с отдельными JS/JSX и TS/TSX scopes исходных Solid-пресетов, правилами реактивности и исходными JSX overrides. Не подключать React-правила к Solid-варианту.
- Добавить `svelte-ox` и `astro-ox` с native script-block linting и общими правилами для обычных JS/TS-файлов проектов. Отдельно настроить `.svelte.js` и `.svelte.ts`, которые являются обычными JS/TS-модулями.
- Проверить все исходные Svelte/Astro-правила на возможность работы с доступным AST. Поддерживаемые script-only проверки подключить через адаптеры, используемые в scopes их реальной поддержки. Template/processor-only проверки записать как неподдерживаемые в соответствующих scopes.
- Для встроенных script-блоков отдельно проверить область действия type-aware rules, распознавание переменных, используемых в шаблонах, и работу fixes. Правило, пропускаемое движком на SFC, не учитывать как перенесённое для SFC даже при наличии в конфиге.
- Перенести resolver-настройки и aliases Svelte в доступные механизмы native/JS import rules. Проверить `$lib`, `$app`, `@sveltejs/kit` и пользовательские tsconfig paths. Неподдерживаемую часть фиксировать отдельно от обычных TS/JS-импортов.
- Расширить rule map, генератор и smoke runner на все шесть стеков. Сохранить origin, severity и options каждой рамочной проверки и каждой JSX-настройки.

**Файлы для создания/изменения:**

- `src/oxlint/configs/config.react.js`, `config.next.js`, `config.solid.js`, `config.svelte.js`, `config.astro.js`.
- `src/oxlint/oxlint.config.react.js`, `oxlint.config.next.js`, `oxlint.config.solid.js`, `oxlint.config.svelte.js`, `oxlint.config.astro.js`.
- `src/oxlint/plugins/react.js`, `react-hooks.js`, `next.js`, `solid.js`, `svelte.js`, `astro.js` — экспортировать проверенные JS-правила; регистрировать адаптер только в scopes с подтверждёнными работающими правилами.
- `data/oxlint-rule-map.json`, `scripts/oxlint-generate.mjs`, `scripts/oxlint-smoke.mjs`.

**Документация:**

- <https://oxc.rs/compatibility.html> — script-block support и отсутствие template linting.
- <https://oxc.rs/docs/guide/usage/linter/rules/typescript/consistent-type-imports.html> — исключения для `.svelte`/`.astro`.
- <https://oxc.rs/docs/guide/usage/linter/plugins.html> — namespace `react`, `nextjs`, `typescript`, `import`.

**Примеры в проекте:** `src/eslint/configs/config.react.js`, `config.next.js`, `config.solid.js`, `svelte-stack.js`, `astro-stack.js`; соответствующие `src/eslint/eslint*.js`.

**Команды проверки:**

```bash
node scripts/oxlint-generate.mjs --stacks common,react,solid,next,svelte,astro
node scripts/oxlint-smoke.mjs --stacks common,react,solid,next,svelte,astro
npm run typecheck:ox
npm run lint
```

### Этап 6: Проверить фреймворки и ограничения SFC

**Что добавить/реализовать:**

- Добавить тесты React/hooks и Next на корректные компоненты и характерные нарушения, включая явные опции исходного пресета.
- Перенести в Oxlint-тесты все поведенческие сценарии Solid: реактивные props, деструктуризация, потеря реактивности, JSX usage, JSX и TSX.
- Добавить Svelte/Astro-сценарии с несколькими script-блоками/frontmatter, TS, template-used bindings, framework aliases и framework script-модулями.
- Проверить реальные номера строк diagnostics и fixes внутри встроенных скриптов. Зафиксировать отсутствие изменений шаблона при исправлении скрипта.
- Добавить отрицательные capability-тесты: известное template-only нарушение не объявляется обнаруженным Oxlint и присутствует в реестре исключений. Проверить, что ограничения SFC не выключают те же правила в обычных `.ts`/`.tsx`.
- Расширить parity corpus на все шесть стеков; включить случаи подавления диагностики комментариями и документировать несовместимости директив.
- Применить per-rule evidence из этапа 4 к каждой новой framework-записи `native`/`js-plugin`. Для `partial` проверять как реально перенесённую диагностику, так и документированное ограничение.

**Файлы для создания/изменения:** `scripts/oxlint-frameworks.test.mjs`, `scripts/oxlint-sfc.test.mjs`, `scripts/oxlint-parity.test.mjs`, `scripts/fixtures/oxlint-cases.mjs`, `data/oxlint-rule-map.json`.

**Примеры в проекте:** `scripts/solid-config.test.mjs`, `src/examples/example.solid.tsx`, `example.svelte`, `example.astro`.

**Команды проверки:**

```bash
node --test scripts/oxlint-frameworks.test.mjs scripts/oxlint-sfc.test.mjs scripts/oxlint-parity.test.mjs
node --test scripts/solid-config.test.mjs
npm run lint
```

### Этап 7: Опубликовать интерфейс шести вариантов

**Что добавить/реализовать:**

- Добавить subpath exports `./common-ox`, `./react-ox`, `./solid-ox`, `./next-ox`, `./svelte-ox`, `./astro-ox`, каждый с default export одного `OxlintConfig`, а не массива ESLint flat config.
- Для каждого subpath указать соответствующий `src/oxlint/oxlint.config.<stack>.js` и отдельный `src/oxlint/index.d.ts`.
- В новом declaration-файле сохранить принятый в проекте script/ambient-module формат и использовать `import type { OxlintConfig } from 'oxlint'` внутри соответствующих модулей.
- Новые типы, требующие optional Oxlint peer, подключать через новые subpaths. Не добавлять обязательную загрузку Oxlint или его типов при использовании старых exports.
- Проверить, что все runtime-зависимости JS-адаптеров присутствуют в dependencies/optional peers и что optional framework plugins загружаются только при запуске выбранного framework-пресета.

**Файлы для изменения/создания:** `package.json`, `package-lock.json`, `src/oxlint/index.d.ts`.

**Примеры в проекте:** `package.json#exports`, `index.d.ts` — типизация существующих subpaths.

**Команды проверки:**

```bash
npm run typecheck:ox
node scripts/oxlint-smoke.mjs --stacks common,react,solid,next,svelte,astro
npm pack --dry-run
npm run lint
```

### Этап 8: Проверить публичные импорты и типы

**Что добавить/реализовать:**

- Проверить default import каждого нового subpath и использование импортированного объекта в `defineConfig({ extends: [config], options: { typeAware: true } })`.
- Создавать consumer `oxlint.config.ts` с прямым re-export нового subpath; запускать `oxlint` без `--config` и проверять, что preset действительно применён по уникальной ожидаемой диагностике.
- Проверить пропущенный вариант union-типа из соседнего модуля в обоих способах подключения: прямой re-export и композиция через `extends` с root options. Эти сценарии должны подтверждать запуск tsgolint, а не только обычных правил.
- Проверить типы через TS7 на положительном fixture и намеренно несовместимом использовании объекта как массива ESLint Config; исключить ложноположительный результат из-за `any`.
- Проверить загрузку нового общего пресета при отсутствии React/Solid/Svelte/Astro optional plugins и прежнего общего пресета при отсутствии Oxlint optional peers.
- Проверить разрешение локальных adapter-модулей из потребительского проекта, а не только из корня исходного репозитория.

**Файлы для создания/изменения:** `scripts/oxlint-exports.test.mjs`, `scripts/fixtures/oxlint-cases.mjs`.

**Примеры в проекте:** проверки публичных exports в `scripts/solid-config.test.mjs`, изолированная установка в `scripts/package-smoke.mjs`.

**Команды проверки:**

```bash
node --test scripts/oxlint-exports.test.mjs
node --test scripts/solid-config.test.mjs
npm run typecheck:ox
npm run lint
```

### Этап 9: Добавить варианты -ox в CLI и shell shortcuts

**Что добавить/реализовать:**

- Расширить `STACK_KEYS`, `STACKS`, `STACK_CHOICES` до 12 стеков. Добавить boolean-флаги `--common-ox`, `--react-ox`, `--solid-ox`, `--next-ox`, `--svelte-ox`, `--astro-ox`; брать список stack-флагов из единого `STACK_KEYS` в `parseArgv()` и `argvToValues()`.
- Добавить в описания стека `linterFile` и `linterPreset`. Для старых стеков генерировать `eslint.config.js`; для новых — `oxlint.config.ts`. Prettier/Stylelint-привязки новых стеков взять у их исходных аналогов.
- Обновить `run()`, `wrapperFileNames(stackKey = 'common')`, `existingWrapperFiles(directory, stackKey = 'common')`, `legacyConfigFiles(directory, stackKey = 'common')` и все места их вызова.
- В summary, spinner и help выводить реальные файлы выбранного стека. Добавить `oxlint` в поиск legacy-конфигов; при смене движка использовать существующий интерактивный выбор файлов для удаления.
- Для новых стеков устанавливать Oxlint, tsgolint и только внешние framework plugins, используемые выбранными JS-адаптерами и форматтером. Не устанавливать `eslint-plugin-svelte`/`eslint-plugin-astro` только из-за названия стека, если соответствующие adapters не используются.
- Добавить `stackPackageSpecs(stackKey)` с требуемыми спецификациями `oxlint@1.86.0`, `oxlint-tsgolint@7.0.2003`; расширить `ensureDevDependencies()` опцией спецификаций, сохранив отдельные имена для проверки наличия пакетов. Обнаруживать уже установленную несовместимую версию и синхронизировать её с выбранной спецификацией через существующий dependency-install шаг.
- При `--skip-install` только генерировать wrappers. Не править автоматически tsconfig потребителя и не добавлять ESLint-команду в Oxlint-стек.
- Добавить шесть shell shortcuts и сохранить поведение `init/create`, `migrate/reinit`, защиту корня пакета и существующее подтверждение удаления файлов.

**Файлы для изменения/создания:**

- `scripts/linter-init-core.mjs`, `scripts/linter-init.mjs`.
- `scripts/init-common-ox.sh`, `init-react-ox.sh`, `init-solid-ox.sh`, `init-next-ox.sh`, `init-svelte-ox.sh`, `init-astro-ox.sh`.

**Примеры в проекте:** `STACKS`, `stackPackages()`, `ensureDevDependencies()` в `scripts/linter-init-core.mjs`; `scripts/init-solid.sh`.

**Команды проверки:**

```bash
node scripts/linter-init.mjs --help
for file in scripts/init-*-ox.sh; do bash -n "$file" || exit 1; done
node --test scripts/solid-config.test.mjs
npm run lint
```

### Этап 10: Проверить генерацию и миграцию всех стеков

**Что добавить/реализовать:**

- Проверить все 12 стеков через публичные функции CLI core: имена файлов, точные subpath re-exports, набор зависимостей, default stack, конфликт нескольких stack-флагов и menu choices.
- Проверить `init` с существующими wrappers, повторный `init`, `migrate/reinit`, `create`, `--skip-install`, смену ESLint → Oxlint и обратно.
- Проверить, что противоположный linter config не удаляется при `init`; при `migrate` он только попадает в существующий список подтверждения удаления.
- Проверить наличие всех новых флагов в CLI help и передачу аргументов shell shortcuts. Для каждого shortcut выполнить отдельный `bash -n`.
- Проверить установочные argv для npm/pnpm/yarn/bun, пакеты с уже указанными зависимостями, отсутствующий node_modules, несовместимые версии Oxlint/tsgolint и сохранение прежнего поведения ESLint-стеков. Использовать временные подставные package-manager executables, не запускать сетевые установки в unit-тестах.

**Файлы для создания/изменения:** `scripts/oxlint-init.test.mjs`, `scripts/solid-config.test.mjs`, `scripts/fixtures/oxlint-cases.mjs`.

**Примеры в проекте:** сценарии `init`/`migrate` в `scripts/solid-config.test.mjs`.

**Команды проверки:**

```bash
node --test scripts/oxlint-init.test.mjs scripts/solid-config.test.mjs
node scripts/linter-init.mjs --help
npm run lint
```

### Этап 11: Завершить машиночитаемый аудит покрытия

**Что добавить/реализовать:**

- Расширить `scripts/oxlint-inventory.mjs` режимами `--write` и `--check`: проверять все scopes шести исходных и шести целевых пресетов, существование target rules, опции, adapters, plugin packages и фактическую доступность type-aware engine.
- Создать `data/oxlint-config-inventory.json` и `docs/OXLINT_RULE_MAPPING.md` из source inventory и rule map. Для каждого пресета и file scope вывести исходное количество активных правил, native, JS, partial и unsupported; выключенные правила и baseline parser limitations считать отдельно.
- Для каждого `partial`/`unsupported` вывести source ID, исходные опции, причину, scope, fixture и проверенные альтернативы. Не учитывать JS-правило без parser services как полноценный перенос типовой проверки.
- Сделать `--check` ошибкой при неизвестном source rule, отсутствии решения, необъяснённом изменении опций/severity, устаревшем артефакте, неожиданной диагностике/её потере и включении лишних default rules. Для каждой записи `native`/`js-plugin` требовать evidence по rule/scope/options; проверять существование fixture и положительное срабатывание заявленной target-диагностики в parity suite.
- Добавить `--check` в генератор: сравнивать сгенерированные конфиги без перезаписи. Новые upstream rules должны потребовать пересмотра mapping, а не автоматически попадать в published presets.
- Добавить npm scripts `inventory:ox`, `inventory:ox:check`, `generate:ox`, `generate:ox:check`, `test:ox` с соответствующими командами. `test:ox` должен запускать все `scripts/oxlint-*.test.mjs`.

**Файлы для изменения/создания:** `scripts/oxlint-inventory.mjs`, `scripts/oxlint-generate.mjs`, `data/oxlint-rule-map.json`, `data/oxlint-config-inventory.json`, `docs/OXLINT_RULE_MAPPING.md`, `package.json`.

**Примеры в проекте:** `scripts/inventory.mjs`, `data/linter-config-inventory.json`, `docs/RULE_MAPPING.md`.

**Команды проверки:**

```bash
npm run generate:ox
npm run inventory:ox
npm run generate:ox:check
npm run inventory:ox:check
npm run test:ox
npm run lint
```

### Этап 12: Проверить guardrails покрытия и установку tarball

**Что добавить/реализовать:**

- Добавить `scripts/oxlint-coverage.test.mjs`: на временных снимках проверить, что удалённая запись mapping, потерянная опция, изменённая severity, новый upstream rule, отсутствующее evidence, отсутствие ожидаемой диагностики, ложный статус supported для SFC и устаревший generated config действительно ломают проверки.
- Расширить `scripts/package-smoke.mjs` матрицей шести Oxlint-стеков. Устанавливать tarball вне workspace со строго выбранными optional framework plugins; не рассчитывать на доступ к node_modules исходного репозитория.
- После генерации wrapper запускать `oxlint` без `--config`, проверять корректный пример и marker-нарушение выбранного пресета; отдельно проверять tsgolint на TS7 и native type-check diagnostics.
- Проверить пакеты из tarball: новые exports, declaration-файл, сгенерированные rule bundles, все используемые JS-адаптеры, shell shortcuts и executable CLI.
- Проверить переносимость plugin specifiers при установке npm и pnpm, включая изолированную структуру node_modules. В тестовой установке сохранить принятую в репозитории политику legacy peer dependencies; отдельно подтвердить требуемые версии движков, не маскировать их отсутствие.
- Сохранить исходную smoke-проверку Solid ESLint и добавить импорт остальных старых пресетов в окружении с их заявленными peers.

**Файлы для создания/изменения:** `scripts/oxlint-coverage.test.mjs`, `scripts/package-smoke.mjs`, `scripts/fixtures/oxlint-cases.mjs`.

**Примеры в проекте:** `scripts/package-smoke.mjs`, `scripts/solid-config.test.mjs`.

**Команды проверки:**

```bash
npm run test:ox
node scripts/package-smoke.mjs
npm run generate:ox:check
npm run inventory:ox:check
npm run lint
```

### Этап 13: Описать использование и подключить проверки CI

**Что добавить/реализовать:**

- Описать в README и CLI-документации все шесть новых import paths и флагов, файл `oxlint.config.ts`, требования к движкам и TS7-совместимому tsconfig, обычный запуск `oxlint` и отдельный `oxlint --type-aware --type-check`.
- Показать прямой re-export и композицию через `defineConfig({ extends: [config], options: { typeAware: true } })`; явно выставлять root-only options в примере композиции.
- Для каждого `*-ox` указать соответствующие Prettier/Stylelint exports. Описать различие между нативными правилами и JS-плагинами и дать ссылку на полный реестр непереносимых проверок.
- Явно описать script-only ограничения Svelte/Astro и отсутствие ESLint-остатка. Не объявлять новые варианты полностью эквивалентными старым при наличии `partial`/`unsupported`.
- Добавить в CI и обе проверяющие ветки Release: `test:ox`, `typecheck:ox`, проверки generated configs/inventory и расширенный package smoke. Сохранить существующие проверки ESLint, Stylelint, Prettier и TS6; TS6 запускать только через явный путь `node ./node_modules/typescript/bin/tsc --noEmit`, заданный на этапе 1.
- Добавить CI-проверку минимально заявленного Node.js `24.16.0` и текущего `latest` для Oxlint JS config/plugins. Проверку изолированной pnpm-установки включить в CI.
- Обновить высокоуровневую матрицу `docs/RULE_MAPPING.md` и таблицу npm scripts.

**Файлы для изменения:** `README.md`, `scripts/README.md`, `docs/RULE_MAPPING.md`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`.

**Документация:** <https://oxc.rs/docs/guide/usage/linter/config.html>, <https://oxc.rs/docs/guide/usage/linter/type-aware.html>, <https://oxc.rs/compatibility.html>.

**Примеры в проекте:** текущие CI/Release workflows и раздел SolidJS в README.

**Команды проверки:**

```bash
npm run lint
npm run test:ox
npm run typecheck:ox
npm run generate:ox:check
npm run inventory:ox:check
node scripts/package-smoke.mjs
```

### Этап 14: Выполнить окончательную проверку реализации

**Что выполнить:**

- Выполнить все команды ниже после чистой установки зависимостей.
- Подтвердить наличие ровно шести новых `*-ox` стеков и сохранение шести прежних стеков; проверить 12 вариантов генератора.
- Подтвердить, что для каждой активной исходной проверки во всех учтённых scopes есть результат переноса; неопределённых и молча пропущенных записей нет.
- Подтвердить, что все записи `partial`/`unsupported` имеют fixture и объяснение, а все заявленные native/JS-проверки действительно исполняются.
- Подтвердить, что новая consumer-команда запускает только Oxlint, типовые проверки выполняет tsgolint/TS7, а шаблонные ограничения SFC отражены в документации.
- Проверить состав npm tarball и отсутствие в нём абсолютных путей, временных fixtures и зависимости на исходный checkout.
- Обновить трекер: отметить только фактически завершённые этапы и записать результаты проверок.

**Файлы для обновления:** `vibe/oxlint-variants-plan-track.md`.

**Команды проверки:**

```bash
npm ci
npm run lint
node --test scripts/solid-config.test.mjs
npm run test:ox
node ./node_modules/typescript/bin/tsc --noEmit
npm run typecheck:ox
npm run generate:ox:check
npm run inventory:ox:check
node scripts/package-smoke.mjs
npm pack --dry-run
git diff --check
git status --short
```
