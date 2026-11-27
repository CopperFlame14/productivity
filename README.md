# 🎮 Gamified Productivity Tracker

A full-stack productivity tracker that turns daily routines into quests. Track study, projects, workouts, LeetCode practice and hydration; earn XP and unlock rewards while reviewing your progress.

## Features

- Daily task tracking for workouts, study, projects, LeetCode and water
- XP, levels, ranks and consistency streaks
- Anime episode rewards and achievements
- Custom goals and hobby tracking
- Productivity analytics and wellness indicators
- Optional LeetCode progress integration
- JWT authentication and MongoDB cloud sync

## Tech stack

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT and bcryptjs
- **Frontend:** HTML, CSS and vanilla JavaScript
- **Testing:** Node.js built-in test runner

## Run locally

### Prerequisites

- Node.js 18 or later
- MongoDB running as a replica set (MongoDB Atlas is supported; standalone MongoDB does not support the transactions used by daily saves)

### Setup

```bash
git clone https://github.com/CopperFlame14/productivity.git
cd productivity
npm install
```

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env`.

**Database note:** daily task saves and resets use MongoDB transactions and require a replica-set deployment. Before enabling the unique daily-record index on an existing database, check for duplicate records with `npm run check:daily-duplicates`. This read-only command prints duplicate groups and record IDs; review and resolve any duplicates manually before deploying the unique index. Do not delete records without reviewing which data to retain.\n\nSet at least these values in `.env`:

- `MONGODB_URI`: your MongoDB connection string
- `JWT_SECRET`: a long, random secret (never commit this value)
- `JWT_EXPIRE`: token lifetime, for example `7d`
- `PORT`: server port, default `3000`
- `CLIENT_URL`: comma-separated list of trusted browser origins, for example `http://localhost:3000`

Start the application:

```bash
npm start
```

Open http://localhost:3000 and create an account. For development with automatic restarts, run `npm run dev`.

## Tests

Run the unit tests with:

```bash
npm test
```

The test suite uses Node's built-in test runner and does not require a database.

## Project structure

```text
config/       MongoDB connection
docs/         Deployment and integration guides
middleware/   Authentication middleware
models/       Mongoose data models
public/       HTML, CSS and browser JavaScript
routes/       Express API routes
utils/        Productivity and integration logic
test/         Automated tests
```

## API overview

All endpoints except signup and login require a bearer token.

| Area | Endpoints |
|---|---|
| Authentication | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout` |
| User | `GET/PUT/DELETE /api/user` |
| Daily records | `GET/POST /api/daily`, `GET /api/daily/history`, `POST /api/daily/reset` |
| Goals | `GET/POST /api/goals`, `PUT/DELETE /api/goals/:id`, `POST /api/goals/schedule` |
| Anime rewards | `GET /api/anime/balance`, `POST /api/anime/watch`, `GET /api/anime/history` |
| LeetCode | `POST /api/leetcode/check`, `POST /api/leetcode/validate`, `GET/PUT /api/leetcode/settings` |
| Analytics | `GET /api/analytics/productivity`, `GET /api/analytics/streak`, `GET /api/analytics/achievements` |

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request. Look for issues labelled `good first issue` or `help wanted`.

## Security

Never commit `.env`, credentials, access tokens or personal data. Report suspected vulnerabilities privately to the repository maintainer rather than opening a public issue.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
