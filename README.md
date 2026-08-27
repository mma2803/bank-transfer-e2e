# Bank Transfer E2E Tests (Cypress and Cucumber)

This suite validates the creation of a bank transfer through a web form. It covers the business rules of each field, checks the behaviour at the boundaries of the accepted ranges and verifies that only authorized roles may create a transfer. The scenarios are written in plain Gherkin and the steps are implemented with Cypress and the Cucumber preprocessor.

## Prerequisites

You need Node.js and npm, and the application under test must be running. Its URL is set through `baseUrl` in `cypress.config.js`, which currently points to `http://localhost:3000`.

## Installation

```bash
npm install
```

This installs Cypress together with the Cucumber preprocessor and the esbuild bundler.

## Running the tests

```bash
npm run cy:open   # interactive runner
npm run cy:run    # headless run for CI
```

Every scenario is tagged so you can run a subset rather than the whole suite. The main tags are `@smoke` for a quick sanity check, `@happy_path` and `@unhappy_path` for the valid and invalid submissions, `@boundary` for the edge values, `@positive` and `@negative` for the expected outcome, and `@rbac` for access control. They combine with `and` and `or`.

```bash
npx cypress run --env tags="@smoke"
npx cypress run --env tags="@boundary and @negative"
```

## Project structure

```
cypress/
  e2e/
    bank_transfer.feature      # Gherkin scenarios
    bank_transfer.steps.js     # step definitions
  fixtures/
    transfer_data.json         # test data
    users.json                 # credentials per role
  support/
    commands.js                # cy.loginAs
    utils.js                   # convertDate helper
cypress.config.js
```

The data lives in the fixtures rather than in the steps, which keeps the code free of duplicated values and easy to maintain.

## Assumptions

The application is not provided, so the suite relies on a few assumptions.

- The form is expected at `/transfer`, the login at `/login` and a success redirect to `/home`.
- The elements are reached through stable `data-testid` attributes.
- Login is cached per role with `cy.session`.
- An unauthorized role does not see the create transfer button, so the assertion checks that it does not exist.
- A success shows `Transfer created successfully`, whereas an error is field specific, either `Invalid <field>` for a format issue or `<Field> is required` for a missing value.
- Dates are never hard coded, since the helper resolves `TOMORROW` and `TODAY+N` at runtime.

## Coverage

The coverage follows Equivalence Partitioning and Boundary Value Analysis. For each field the suite defines a valid class and its invalid classes, then it tests the edges of the valid range. The check mark means accepted and the cross means rejected.

| Field | Valid class | Values tested |
|---|---|---|
| Amount | from `0.01` to `100000` | `0` ✗, `0.01` ✓, `100000` ✓, `100000.01` ✗, empty ✗ |
| IBAN | 14 to 34 characters, alphanumeric | `13` ✗, `14` ✓, `34` ✓, `35` ✗, non alphanumeric ✗, empty ✗ |
| Label | alphanumeric, up to 255 | `255` ✓, `256` ✗, special characters ✗, empty ✗ |
| Beneficiary | non empty | valid ✓, empty ✗ |
| Transfer date | from tomorrow to today plus 90 | today ✗, tomorrow ✓, today plus 90 ✓, today plus 91 ✗, empty ✗ |
| Access control | Administrator and Purchase Manager | authorized ✓, Standard User forbidden ✗ |

## Technical choices

- The assertions avoid any arbitrary wait, since Cypress retries `.should` on its own and the happy path waits on the real request through `cy.intercept`.
- The scenarios are organised with the Gherkin `Rule` keyword, where the first rule covers access control and the second covers the submission.
- The `Background` sits inside the second rule so it applies only to the submission scenarios.
- The mode toggle is tested from instant to scheduled only, because that is the direction where an invalid transfer could be silently accepted.
