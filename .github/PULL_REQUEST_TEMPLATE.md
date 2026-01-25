## Summary

<!-- Brief description of what this PR does -->

## Changes

<!-- List of changes -->

-

## Checklist

### General

- [ ] Tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Coverage not decreased (`npm run test:coverage`)

### Naming Conventions (if adding/renaming functions)

- [ ] `is*` functions return `boolean` only
- [ ] `has*` functions return `boolean` only
- [ ] `validate*` functions return result object (not void)
- [ ] Functions that throw use `*OrThrow` or `assert*` prefix
- [ ] No `check*` prefix used for pure predicates
- [ ] See [ARCHITECTURE.md](extensions/git-id-switcher/docs/ARCHITECTURE.md#function-naming-conventions)

### Security (if touching validation/security code)

- [ ] No new magic numbers (use constants from `src/core/constants.ts`)
- [ ] No new regex literals (use patterns from `src/validators/common.ts`)
- [ ] Security-critical changes have `// SECURITY:` comments
