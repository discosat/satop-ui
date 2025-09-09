## Development Setup

This Next.js application requires a running instance of the `satop-platform` Python backend for authentication and data.

### Step 1: Run the Backend

Before starting the frontend, you must have the backend server running. The easiest way is to use Docker Compose from the `satop-platform` repository.

1.  Navigate to the `satop-platform` directory.
2.  Ensure your `docker-compose.yml` has the test authentication mode enabled. This is crucial for easily creating the initial users.
    ```yaml
    # in docker-compose.yml
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
    The backend API should now be available at `http://localhost:7889`.

### Step 2: Configure Frontend Environment

The frontend needs to know the URL of the backend API.

1.  In the root of this `satop-ui` project, create a file named `.env.local` if it doesn't already exist.
2.  Add the following line to it:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:7889
    ```

### Step 3: Create Initial Seed Users

Since the login is now connected to the live backend, you must create user accounts in the backend's database before you can log in. The following steps will guide you through creating two standard test users using the backend's API documentation.

**1. Open the Backend API Docs:**
Navigate to [http://localhost:7889/docs](http://localhost:7889/docs).

**2. Authorize as an Admin:**
To create roles and users, you must first act as a superuser.

- Click the **Authorize** button at the top right.
- In the value field, enter the special test token: `Bearer admin-setup;*`
- Click "Authorize" and then "Close".

**3. Create User Roles:**
Use the `POST /api/auth/roles` endpoint to create the following roles:

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
    "scopes": ["scheduling.flightplan.create", "scheduling.flightplan.read"]
  }
  ```

**4. Create the User "Admin Alice":**
Follow these three API calls in order:

- **A. Create Entity (`POST /api/auth/entities`):**

  ```json
  { "name": "Admin Alice", "type": "person", "roles": "admin" }
  ```

  > **Important:** Copy the `id` (UUID) from the response body.

- **B. Connect Provider (`POST /api/auth/entities/{uuid}/providers`):**

  - Paste Alice's `id` into the `uuid` field.
  - Use this request body:
    ```json
    { "provider": "email_password", "identity": "alice@discosat.dk" }
    ```

- **C. Create Password (`POST /api/plugins/login/user`):**
  ```json
  { "email": "alice@discosat.dk", "password": "password123" }
  ```

**5. Create the User "Operator Ollie":**
Repeat the process for our standard operator user:

- **A. Create Entity (`POST /api/auth/entities`):**

  ```json
  { "name": "Operator Ollie", "type": "person", "roles": "flight-operator" }
  ```

  > **Important:** Copy the `id` (UUID) from the response body.

- **B. Connect Provider (`POST /api/auth/entities/{uuid}/providers`):**

  - Paste Ollie's `id` into the `uuid` field.
  - Use this request body:
    ```json
    { "provider": "email_password", "identity": "ollie@discosat.dk" }
    ```

- **C. Create Password (`POST /api/plugins/login/user`):**
  ```json
  { "email": "ollie@discosat.dk", "password": "password123" }
  ```

Your backend is now seeded with the necessary test accounts.

### Step 4: Run the Frontend

Now you can run the development server for the frontend.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser. You can now log in using the credentials for either Alice or Ollie.

### Login Credentials

| Role                | Email               | Password      | Permissions         |
| ------------------- | ------------------- | ------------- | ------------------- |
| **Admin**           | `alice@discosat.dk` | `password123` | All (`*`)           |
| **Flight Operator** | `ollie@discosat.dk` | `password123` | Create & Read Plans |

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
