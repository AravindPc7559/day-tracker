# Day Tracker — Developer Reference

## Tech Stack

| Layer  | Tech |
|--------|------|
| Mobile | React Native + Expo, TypeScript, Zustand, TanStack Query, Axios, React Hook Form, Zod, Firebase Auth (client SDK) |
| Server | Node.js + Express, TypeScript, Firebase Admin SDK (Firestore + Auth), Zod, Winston |

---

## Firebase Architecture

- **Auth**: Firebase Authentication — client SDK handles sign-in, server verifies ID tokens via Admin SDK
- **Database**: Cloud Firestore — server-side only via Admin SDK; mobile NEVER writes directly to Firestore
- **Flow**: Mobile gets Firebase ID token → sends in `Authorization: Bearer <token>` header → server verifies → accesses Firestore
- Collections use `snake_case` names; documents use auto-generated IDs unless specified

---

## Folder Structure

```
mobile/src/
├── app/                      # Root components / navigation
├── components/
│   ├── ui/                   # Pure components (Button, Input, Text, Card)
│   └── shared/               # Composed reusable (ErrorBoundary, LoadingOverlay)
├── screens/[Feature]/        # index.tsx + components/ + hooks/
├── features/[feature]/       # .store.ts + .api.ts + .types.ts
├── services/
│   ├── api/                  # client.ts (Axios) + endpoints.ts
│   └── firebase/             # firebase.config.ts + auth.service.ts
├── theme/                    # colors, typography, spacing, index.ts
├── hooks/                    # global hooks
├── utils/                    # pure helpers
└── types/                    # api.types.ts + global types

server/src/
├── modules/[feature]/        # .routes.ts + .controller.ts + .service.ts + .schema.ts
├── middleware/               # auth, error, validate
├── config/
│   ├── env.ts                # Zod-validated env vars — process.exit(1) on invalid
│   └── firebase.ts           # Admin SDK singleton
├── utils/                    # errors, response, asyncHandler, logger
└── types/                    # express.d.ts extensions
```

---

## Firebase Patterns — ENFORCE ALWAYS

### Firestore (Server)

- All Firestore access through the singleton `db` from `config/firebase.ts` — never re-instantiate
- Collection names as constants in `config/constants.ts` — never hardcode strings
- Always use typed converter pattern for every collection:

```typescript
const userConverter: FirestoreDataConverter<UserProfile> = {
  toFirestore: (user) => ({ ...user }),
  fromFirestore: (snapshot) => ({ uid: snapshot.id, ...snapshot.data() } as UserProfile),
};
```

- Firestore writes always include `createdAt`/`updatedAt` as `Timestamp.now()`
- Always check `snapshot.exists` before accessing data — throw `NotFoundError` if missing

### Firebase Auth (Server)

- Auth middleware verifies Firebase ID token from `Authorization: Bearer <idToken>`
- Decoded token attached to `req.user` (`uid`, `email`, `emailVerified`)
- NEVER trust client-sent user IDs — always use `req.user.uid` from the verified token

### Firebase Auth (Mobile)

- Firebase client SDK handles all sign-in flows
- After sign-in: `await user.getIdToken()` to get token
- Axios interceptor attaches fresh ID token to every outbound request automatically
- On 401: interceptor calls `getIdToken(true)` (force refresh) then retries the request once
- Zustand auth store holds the Firebase `User` object — not a custom user object

---

## Mobile Patterns — ENFORCE ALWAYS

### Components

- Props interface at the top of the file
- `StyleSheet` at the bottom of the file
- Zero inline styles — all styles in `StyleSheet.create()`
- Zero hardcoded colors or sizes — always import from `theme/`

### File structure (exact order every time)
```
// Imports (React → RN/Expo → 3rd party → internal)
// Props interface
// Component (hooks → derived values → handlers → return JSX)
// StyleSheet
```

### State rules

| Data type | Where it lives |
|-----------|---------------|
| Server data | TanStack Query only |
| Global UI state | Zustand |
| Local component state | `useState` |

### Screens vs Components

- Screens connect to stores/queries and pass props down
- Components never fetch their own data — receive everything as props

### Query keys

- Defined as typed `const` arrays per feature file — never inline strings

---

## Server Patterns — ENFORCE ALWAYS

### Layer responsibilities

| Layer | Responsibility |
|-------|---------------|
| Routes | Paths + middleware only — zero logic |
| Controllers | req/res only — call service, return response |
| Services | All Firestore logic — no req/res objects ever |

- Every async controller wrapped with `asyncHandler()`
- All request input validated with Zod via `validate` middleware before reaching the controller

### API Response Contract — never deviate

```typescript
// Success
{ success: true, message: string, data: T, meta?: PaginationMeta }

// Error
{ success: false, message: string, error: { code: string, details?: unknown } }
```

### Error Classes

```
AppError(message, statusCode, code)
├── NotFoundError       → 404 NOT_FOUND
├── ValidationError     → 400 VALIDATION_ERROR
├── UnauthorizedError   → 401 UNAUTHORIZED
└── FirebaseError       → 500 FIREBASE_ERROR
```

---

## Naming Conventions

| Thing | Convention |
|-------|-----------|
| Files | `kebab-case` |
| Components | `PascalCase` |
| Functions / variables | `camelCase` |
| Constants | `SCREAMING_SNAKE_CASE` |
| Firestore collections | `snake_case` |

---

## Import Order

```
1. React
2. React Native / Expo
3. 3rd-party libraries
4. Internal: components → hooks → features → services → utils → types
```

---

## Path Aliases (mobile)

```
@/components  →  src/components
@/screens     →  src/screens
@/features    →  src/features
@/services    →  src/services
@/theme       →  src/theme
@/hooks       →  src/hooks
@/utils       →  src/utils
@/types       →  src/types
```

---

## Rules — No Exceptions

- No `any` — use `unknown` and narrow
- No inline styles in components
- No `console.log` — use the Winston `logger`
- No hardcoded Firestore collection strings — use `COLLECTIONS` constants
- One default export per file (components/screens); named exports for utilities
- Types defined once and imported everywhere — never redefined inline
