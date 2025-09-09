## Development Setup

This Next.js application can be run in two modes: **Live API Mode** for full end-to-end testing, and **Mocked Mode** for rapid, standalone UI development.

### Running in Live API Mode (Connected to Backend)

Use this mode for testing features that require a real database, verifying security rules, and ensuring the frontend and backend are correctly integrated.

#### Step 1: Backend Setup

This mode requires a running instance of the `satop-platform` Python backend.

1.  Navigate to your local `satop-platform` repository.
2.  Ensure your `docker-compose.yaml` has the test authentication mode enabled for creating initial users.
    ```yaml
    # in satop-platform/docker-compose.yaml
    services:
      dev:
        # ... other settings
        environment:
          - SATOP_ENABLE_TEST_AUTH=1
    ```
3.  Start the backend server:
    ```bash
    docker compose up dev
    ```
    The backend API will now be available at `http://localhost:7889`.

#### Step 2: Seed the Backend with Test Users

Since the login is connected to the live backend, you must create user accounts before you can log in. Use the backend's API documentation (Swagger UI) to seed the database.

1.  **Open the Backend API Docs:** Navigate to [http://localhost:7889/docs](http://localhost:7889/docs).

2.  **Authorize as an Admin:**

    - Click the **Authorize** button.
    - Enter the special test token: `Bearer admin-setup;*`
    - Click "Authorize" and then "Close".

3.  **Create User Roles (`POST /api/auth/roles`):**

    - **`admin` Role:**

    ```json
    {
      "name": "admin",
      "scopes": ["*"]
    }
    ```

    - **`flight-operator` Role:**

    ```json
    {
      "name": "flight-operator",
      "scopes": [
        "scheduling.flightplan.create",
        "scheduling.flightplan.read",
        "scheduling.flightplan.update"
      ]
    }
    ```

4.  **Create the User "Admin Alice" (`admin`):**
    Follow these three API calls in order, using the `id` from the first response in the second call.

    1.  **Create Entity (`POST /api/auth/entities`):** `{ "name": "Admin Alice", "type": "person", "roles": "admin" }`
    2.  **Connect Provider (`POST /api/auth/entities/{uuid}/providers`):** `{ "provider": "email_password", "identity": "alice@discosat.dk" }`
    3.  **Create Password (`POST /api/plugins/login/user`):** `{ "email": "alice@discosat.dk", "password": "password123" }`

5.  **Create the User "Operator Ollie" (`flight-operator`):**
    Repeat the three steps for the operator user.
    1.  **Create Entity (`POST /api/auth/entities`):** `{ "name": "Operator Ollie", "type": "person", "roles": "flight-operator" }`
    2.  **Connect Provider (`POST /api/auth/entities/{uuid}/providers`):** `{ "provider": "email_password", "identity": "ollie@discosat.dk" }`
    3.  **Create Password (`POST /api/plugins/login/user`):** `{ "email": "ollie@discosat.dk", "password": "password123" }`

Your backend is now seeded with the necessary test accounts.

#### Step 3: Run the Frontend

You are now ready to run the frontend in live mode.

```bash
npm run dev
```

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

### Login Credentials (for Live API Mode)

| Role                | Email               | Password      | Key Permissions              |
| ------------------- | ------------------- | ------------- | ---------------------------- |
| **Admin**           | `alice@discosat.dk` | `password123` | All (`*`)                    |
| **Flight Operator** | `ollie@discosat.dk` | `password123` | Create, Read, & Update Plans |

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
