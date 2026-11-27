# Contributing

Thank you for considering a contribution to Gamified Productivity Tracker!

## Before you start

1. Read the README and any relevant documentation available in the repository.
2. Search existing issues and pull requests before opening a new one.
3. For a substantial change, open an issue first to discuss the approach.
4. If you are new to the project, look for `good first issue` labels.

## Development setup

1. Install Node.js 18 or later and make a MongoDB database available.
2. Fork the repository and clone your fork.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and configure local values. Never commit `.env`.
5. Run `npm test` before submitting changes.
6. Run the app with `npm start` and manually verify UI/API changes.

## Pull request guidelines

- Keep each pull request focused on one issue.
- Explain the problem and the solution in the pull request description.
- Include tests for bug fixes and new calculation/business logic.
- Update documentation when behaviour, configuration or endpoints change.
- Do not commit secrets, database dumps, personal data or generated dependencies.
- Preserve the existing project style unless the change intentionally improves it.
- Include screenshots for visible UI changes when useful.

## Commit messages

Use clear, imperative messages, for example:

- `Fix duplicate XP awards on daily updates`
- `Add tests for productivity score calculations`
- `Document local MongoDB setup`

## Reporting bugs

Include steps to reproduce, expected behaviour, actual behaviour, relevant logs with secrets removed, and your Node.js version. Never include passwords, tokens or private user data.

## Suggesting features

Describe the user problem, the proposed behaviour and any alternatives considered. Smaller, well-scoped changes are easier to review and merge.

## Code of conduct

Be respectful, constructive and welcoming. Harassment, discrimination and personal attacks are not acceptable.
