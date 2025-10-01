## Development Setup

This Next.js application can be run in two modes: **Live API Mode** for full end-to-end testing, and **Mocked Mode** for rapid, standalone UI development.

### Running in Live API Mode (Connected to Backend)

Use this mode for testing features that require a real database, verifying security rules, and ensuring the frontend and backend are correctly integrated.

#### Step 1: Start the Backend

This mode requires a running instance of the `satop-platform` Python backend.

1.  Navigate to your local `satop-platform` repository.
2.  Start the backend server using Docker:
    ```bash
    docker compose up dev
    ```
3.  The backend API will start on `http://localhost:7890`. The database is **automatically seeded** with default users, so no manual setup is needed.

#### Step 2: Run the Frontend

You are now ready to run the frontend in live mode.

```bash
npm run dev
```

#### Login Credentials

Once the backend and frontend are running, you can log in with the default accounts that were automatically created:

- **Admin User**
  - **Email:** `admin@example.com`
  - **Password:** `adminpassword`
- **Operator User**
  - **Email:** `operator@example.com`
  - **Password:** `operatorpassword`

### Running in Mocked Mode (Standalone Frontend)

Use this mode for rapid UI development, working on components, or when you are offline or do not need the backend. This mode does **not** require the Python backend to be running.

#### Step 1: Run the Frontend

```bash
npm run dev:mocked
```

The application will start on [http://localhost:3000](http://localhost:3000).

#### How it Works:

- **Login:** Any email and password will be accepted.
- **Permissions:** You will be automatically logged in as a superuser with full admin permissions (`*` scope), allowing you to see and interact with all UI elements.
- **Data:** All data is served from local mock files (e.g., `app/api/platform/flight/mock.ts`) and is not persistent.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
