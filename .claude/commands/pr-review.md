# Production PR Review

Act as a Principal Software Engineer conducting a final production readiness review of all staged git changes.

## Objective

Review the staged changes as if they are being merged into the production branch today.

Do not merely identify issues. Fix issues wherever possible, validate the fixes, and ensure the final code is production-ready.

---

## Code Review Standards

Review for:

### Correctness

* Logic errors
* Runtime errors
* Edge cases
* Race conditions
* Async/await issues
* Error handling gaps
* Null and undefined handling
* Data validation issues
* State management issues
* Breaking changes

### Type Safety

* TypeScript errors
* Unsafe type assertions
* Missing types
* Improper generic usage
* Any unnecessary use of `any`
* Inconsistent type definitions

### Code Quality

* Clean code principles
* SOLID principles
* DRY principles
* Separation of concerns
* Readability
* Maintainability
* Reusability

### React / React Native

* Hook dependency issues
* Stale closures
* Unnecessary re-renders
* Memoization opportunities
* Component organization
* State management issues
* Navigation issues
* Expo best practices
* Accessibility considerations

### Backend

* API validation
* Error handling
* Database query optimization
* Security vulnerabilities
* Authentication and authorization checks
* Logging quality
* Scalability concerns

### Performance

* Expensive renders
* Inefficient loops
* Duplicate requests
* Unnecessary database calls
* Memory leaks
* Bundle size concerns

### Security

* Secrets exposure
* Unsafe user input handling
* Injection vulnerabilities
* Authentication flaws
* Authorization flaws
* Sensitive data leakage

### Project Structure

* Folder organization
* Naming conventions
* Consistency with existing architecture
* Import organization
* Dead code
* Unused files
* Unused imports
* Unused variables

---

## Validation Requirements

After review:

1. Fix all issues discovered.
2. Run linting.
3. Run type checking.
4. Run tests if available.
5. Run build validation if available.
6. Resolve all errors.
7. Resolve all warnings when practical.
8. Remove debug code.
9. Remove console logs not intended for production.
10. Remove commented-out code.
11. Remove temporary workarounds.
12. Verify no regressions were introduced.

---

## Refactoring Guidelines

Refactor when it meaningfully improves:

* Readability
* Maintainability
* Consistency
* Reusability
* Performance

Avoid unnecessary rewrites.

Preserve existing functionality.

---

## Final Verification

Before completing:

* Review the final diff again.
* Ensure code follows repository conventions.
* Ensure all changes are production-ready.
* Ensure no obvious future maintenance issues exist.
* Ensure no lint, type, or build errors remain.

---

## Output Format

Provide:

### Review Summary

* Issues found
* Fixes applied
* Validation steps performed
* Remaining risks (if any)

### Commit

If all validations pass:

1. Create an appropriate Conventional Commit message.
2. Commit the changes.

Commit only when the codebase is in a production-ready state.

Be highly critical and review to senior engineer standards.
