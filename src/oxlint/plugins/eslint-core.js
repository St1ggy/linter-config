/* eslint-disable sonarjs/deprecation -- Only rule definitions are reused; Oxlint executes them without ESLint. */

import { builtinRules } from 'eslint/use-at-your-own-risk'

export default { rules: Object.fromEntries(builtinRules) }
