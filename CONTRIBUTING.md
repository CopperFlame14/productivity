# Contributing

Thanks for your interest in contributing to Gamified Productivity Tracker! Contributions of all kinds are welcome, including bug fixes, new features, improvements, and documentation updates.

## Before You Start

- Check existing issues and pull requests to avoid working on something that is already being handled.
- For major changes, open an issue first so we can discuss the idea.
- If you're new to the project, look for issues labelled `good first issue`.

## Getting Started

### Requirements

Make sure you have the following installed:

- Node.js 18 or later
- npm
- Git
- MongoDB Atlas or a local MongoDB replica set

### Clone the Repository

1. Fork this repository on GitHub.
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/productivity.git
   cd productivity
   ```

3. Add the original repository as a remote:

   ```bash
   git remote add upstream https://github.com/CopperFlame14/productivity.git
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

## Environment Setup

The project uses environment variables for database configuration and authentication.

Create your local `.env` file from the example:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**

```bash
cp .env.example .env
```

Open `.env` and configure the required values:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used for authentication tokens |
| `JWT_EXPIRE` | Token expiration time |
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | Application environment |
| `CLIENT_URL` | Allowed frontend origin |

Use your own local values. Never commit `.env` or share database credentials, passwords, or JWT secrets.

## MongoDB Setup

The application uses MongoDB for storing user accounts, daily records, goals, and other productivity data.

**Important:** Daily save and reset operations use MongoDB transactions. Transactions require a replica set. A standalone MongoDB server is not sufficient.

### Option 1: MongoDB Atlas

1. Visit [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Create an account and a cluster.
3. Create a database user.
4. Configure Network Access to allow your development machine to connect.
5. Open your cluster and select Connect.
6. Choose the application connection option and copy the connection string.
7. Add it to your `.env` file as `MONGODB_URI`.

The connection string generally looks like this:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/productivity-tracker?retryWrites=true&w=majority
```

Replace the placeholders with your own details. If your password contains special characters, URL-encode them.

### Option 2: Local MongoDB Replica Set

You can also run MongoDB locally using Docker.

Start a MongoDB container:

```bash
docker run -d --name productivity-mongo -p 27017:27017 mongo:7 mongod --replSet rs0 --bind_ip_all
```

Initialize the replica set:

```bash
docker exec productivity-mongo mongosh --eval "rs.initiate()"
```

Then update your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/productivity-tracker?replicaSet=rs0
```

Make sure the MongoDB container is running before starting the application.

## Running the Application

Start the application:

```bash
npm start
```

For development with automatic server restarts:

```bash
npm run dev
```

Open the following address in your browser:

```text
http://localhost:3000
```

You can create an account and start exploring the application.

## Project Structure

Here is a quick overview of the main folders:

```text
productivity/
├── config/          # Database configuration
├── middleware/      # Authentication middleware
├── models/          # MongoDB data models
├── public/          # Frontend HTML, CSS and JavaScript
├── routes/          # Backend API routes
├── utils/           # Shared utilities and calculations
├── docs/            # Additional documentation
├── server.js        # Express application entry point
├── package.json     # Dependencies and npm scripts
└── .env.example     # Environment variable template
```

The application uses Express for the backend, MongoDB with Mongoose for data storage, and plain HTML, CSS, and JavaScript for the frontend.

The frontend communicates with backend API routes. Authentication middleware protects routes that require a logged-in user.

## API Testing

You can test API endpoints using tools such as Postman or curl.

The server runs locally at `http://localhost:3000`.

### Create an Account

**POST** `/api/auth/signup`

Example request:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "example-password"
}
```

### Login

**POST** `/api/auth/login`

```json
{
  "email": "test@example.com",
  "password": "example-password"
}
```

Use the JWT returned by the login response when calling protected endpoints.

### Get Daily Records

**GET** `/api/daily`

Include the token in the request:

```bash
curl http://localhost:3000/api/daily \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Productivity Analytics

**GET** `/api/analytics/productivity`

```bash
curl http://localhost:3000/api/analytics/productivity \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Replace `YOUR_JWT_TOKEN` with a token obtained from your local login request. Do not use real user credentials or tokens in documentation or commits.

## Troubleshooting

Here are a few common problems you might encounter.

**MongoDB connection failed**

- Check that MongoDB is running.
- Verify the `MONGODB_URI` value in `.env`.
- For Atlas, check your database user and Network Access settings.
- Make sure your MongoDB deployment supports replica sets.

**Transaction or replica-set errors**

- Daily save and reset operations require a replica set.
- Check that your local replica set has been initialized.
- A standalone MongoDB instance will not support these transactions.

**Port already in use**

- Another application may already be using port 3000.
- Stop that application or configure a different port in `.env`.

**Dependencies or modules missing**

Run:

```bash
npm install
```

**Environment variables not loading**

- Make sure the file is named `.env`.
- Check that it is in the project root.
- Compare its variable names with `.env.example`.
- Restart the server after changing environment variables.

## Testing Your Changes

Before submitting a pull request:

- Start the application and check that it works.
- Test the functionality you changed.
- Check the browser console and server terminal for errors.
- Review your changes to make sure unrelated files are not included.

Check `package.json` for the scripts available on your current branch. Run the project's test command when it is available.

## Working on Changes

Create a separate branch for your contribution:

```bash
git switch -c your-branch-name
```

A few things to keep in mind:

- Keep changes focused on the issue you're working on.
- Follow the existing code style and naming conventions.
- Avoid modifying unrelated files.
- Add or update tests when introducing new functionality.
- Update documentation when necessary.

## Submitting a Pull Request

When your changes are ready:

1. Review your changes using `git status` and `git diff`.
2. Run the relevant checks.
3. Commit your changes with a clear message:

   ```bash
   git add .
   git commit -m "Describe your changes"
   ```

4. Push your branch:

   ```bash
   git push origin your-branch-name
   ```

5. Open a pull request against the original repository's `main` branch.

In your pull request, briefly explain what you changed, why it was needed, and how you tested it. Link the related issue if applicable.

## A Few Reminders

- Never commit `.env` files, passwords, API keys, or database credentials.
- Do not include personal machine paths or private information.
- Keep pull requests focused and easy to review.
- Be respectful and constructive when discussing changes.
- If you're unsure about something, ask in the relevant issue.

Thanks for helping improve Gamified Productivity Tracker!
