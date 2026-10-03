# Трекер выполнения oxlint-variants-plan.md

План: [oxlint-variants-plan.md](oxlint-variants-plan.md).

Формат статусов: [ ] — не выполнено; [X] — выполнено и проверено.

## Этапы выполнения

[X] Этап 1: Подготовить инструменты TS7 и полный исходный inventory.

[X] Этап 2: Проверить инфраструктуру и исходные области действия.

[X] Этап 3: Реализовать полный перенос общего слоя.

[X] Этап 4: Проверить эквивалентность общих правил.

[X] Этап 5: Реализовать остальные пять Oxlint-пресетов.

[X] Этап 6: Проверить фреймворки и ограничения SFC.

[X] Этап 7: Опубликовать интерфейс шести вариантов.

[X] Этап 8: Проверить публичные импорты и типы.

[X] Этап 9: Добавить варианты -ox в CLI и shell shortcuts.

[X] Этап 10: Проверить генерацию и миграцию всех стеков.

[X] Этап 11: Завершить машиночитаемый аудит покрытия.

[X] Этап 12: Проверить guardrails покрытия и установку tarball.

[X] Этап 13: Описать использование и подключить проверки CI.

[X] Этап 14: Выполнить окончательную проверку реализации.

## Зафиксированные решения

- 2026-10-03: пользователь выбрал только Oxlint для новых вариантов, без ESLint-остатка.
- Новые стеки и subpaths: `common-ox`, `react-ox`, `solid-ox`, `next-ox`, `svelte-ox`, `astro-ox`.
- Исходные версии: Oxlint `1.86.0`, tsgolint `7.0.2003`, нативный TypeScript `7.0.2`.
- Consumer wrapper: `oxlint.config.ts`; Prettier и Stylelint используют существующие пресеты соответствующего стека.
- Нативный TS7 предоставляет типовую информацию Oxlint. TS6 API сохраняется для существующих ESLint-пресетов и зависимостей JS-плагинов.
- Непереносимые проверки и частичные соответствия документируются по правилам и file scopes; проверки шаблонов Svelte/Astro не выдаются за поддерживаемые.

## Результаты и блокеры

- Этап 1: установлены фиксированные версии движков; TS6/TS7, source inventory/check и полный lint прошли.
- Этап 2: проверены cross-module union, ошибка TS2322, версия TS7, scopes и отклонение повреждённого source inventory; прежние 11 Solid-тестов и lint проходят.
- Этапы 3–4: общий preset проходит smoke, TS7 и lint; сохранён и выполнен corpus из 593 пар source/target fixtures с проверкой severity. Отдельно проверены selectors, inline type imports, rest siblings, naming exceptions, fixes, ignores и фактические ограничения JS API. Несовместимые нативные варианты заменены исходными JS-правилами; ограничения отмечены `partial`/`unsupported`.
- Этапы 5–6: все шесть presets проходят smoke. Corpus расширен до 700 записей (695 с отрицательными примерами и 5 с явно отмеченными configuration-dependent guards). Проверены React/Next/Solid, Svelte script-only rules и aliases, Astro frontmatter/browser scripts, физические offsets и fixes после Unicode. Source inventory получает виртуальные файлы от реальных preprocessors; различия fragment scopes отражены отдельно. Lint, TS7 и прежние Solid-тесты проходят.
- Этапы 7–8: опубликованы локальные subpath exports и отдельные declarations. Проверены direct/extends-подключение с TS7, типы без `any`, отсутствие обязательных framework peers при импорте Oxlint-конфигов и работа старого common без Oxlint peers.
- Этапы 9–10: CLI поддерживает 12 стеков, engine-specific wrappers и legacy migration. Проверены init/create/reinit, сохранение противоположного конфига, skip-install, shell shortcuts и установка/синхронизация pinned engines для npm/pnpm/yarn/bun через изолированные fake executables.
- Этап 11: полный audit связывает каждый source rule/scope/options с mapping и corpus/capability evidence, проверяет движки и adapters. Generated config и inventory check проходят; полный набор из 41 Oxlint-теста и lint проходит. Реестр ограничений отформатирован детерминированно.
- Этап 12: guardrail-тесты выявляют потерю mapping/options/severity/evidence, новый upstream rule, устаревший generated config, ложную SFC-equivalence и потерю source/target diagnostics. Все шесть Oxlint-стеков и шесть прежних ESLint exports проверены из tarball через npm и изолированный pnpm. Добавлены шесть доступных script-only Astro-правил через frontmatter adapter, с source/target fixtures; разметка не парсится. Полный набор из 48 Oxlint-тестов проходит; dev fixtures и тестовые scripts исключены из tarball.
- Этап 13: обновлены README, CLI-документация и матрица слоёв. CI содержит Node 24.16.0/latest, TS6/TS7, 50 Oxlint-тестов, audit/generation checks и npm/pnpm tarball smoke; обе ветки Release используют те же проверки. Все локальные команды этапа проходят; workflows ещё не запускались на GitHub.
- Этап 14: после `npm ci` прошли полный lint, прежние 11 Solid-тестов, 50 Oxlint-тестов, явные TS6/TS7 compiler checks, generation/source/coverage checks и полный npm tarball smoke. На Node 24.16.0 отдельно прошли все 50 Oxlint-тестов, TS7 и полный tarball smoke; на Node 24.19.0 также пройдена изолированная pnpm-установка всех стеков. Проверены YAML workflows, состав tarball и `git diff --check`. Корпус содержит 708 записей: 702 positive/negative pairs и 6 conditional controls; дополнительные Astro frontmatter cases проверены отдельными parity-тестами. Все этапы завершены локально; GitHub workflows не запускались, коммиты и публикация в рамках этого плана не выполнялись.
- При подготовке плана в отдельной временной копии проверены TS7 type-aware diagnostics, Solid JS-plugin rules, синтаксическое SonarJS-правило, Prettier, core-rule adapter и автоматическая загрузка `oxlint.config.ts`. Эти эксперименты не заменяют проверки этапов реализации.
