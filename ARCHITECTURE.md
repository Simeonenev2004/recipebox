# RecipeBox Architecture

## 1. Overview

RecipeBox is a single page application built with React and Vite. React Router handles navigation in the browser. Firebase is the backend: Firebase Authentication for accounts and Cloud Firestore for data. There is no custom server. The built files in `dist/` are deployed to Firebase Hosting, which rewrites every path to `index.html` so direct links and refreshes work (`firebase.json`).

## 2. Folder structure

| Folder (in `src/`) | Purpose |
|---|---|
| `pages/` | One folder per route: Home, Catalog, Details, Create, Edit, Profile, Login, Register, NotFound. A page loads its data and puts components together. |
| `components/` | Reusable pieces: `RecipeCard`, `RecipeImage`, `RecipeForm`, `LikeButton`, `Comments`, `Loader`, `ErrorMessage`. `components/layout/` has `Layout`, `Header` and `Footer`. |
| `services/` | All Firebase code: `firebase.js` (setup), `authService.js`, `userService.js`, `recipeService.js`, `likeService.js`, `commentService.js`. |
| `contexts/` | `AuthContext.jsx`: the logged in user, the loading flag and the `register`, `login`, `logout` functions. |
| `guards/` | `PrivateRoute.jsx` and `GuestRoute.jsx`, used as layout routes. |
| `hooks/` | `useDocumentTitle.js`, sets the browser tab title. |
| `constants/` | `categories.js`: the category names and their icons, defined once. |
| `styles/` | `global.css`: variables, headings, buttons, forms, recipe grid. |

Other files: `public/images/recipes/` (demo photos), `firestore.rules`, `firebase.json`, `.firebaserc`, `.env` (local, not in git) and `.env.example`.

## 3. Component hierarchy

```
main.jsx
└─ StrictMode
   └─ BrowserRouter
      └─ AuthProvider            (contexts/AuthContext.jsx)
         └─ App                  (Routes, src/App.jsx)
            └─ Layout            (route with <Outlet />)
               ├─ Header
               ├─ <Outlet />  →  one of:
               │    Home        → RecipeCard (RecipeImage), Loader, ErrorMessage
               │    Catalog     → RecipeCard (RecipeImage), Loader, ErrorMessage
               │    Details     → RecipeImage, LikeButton, Comments, Loader, ErrorMessage
               │    Profile     → RecipeCard (RecipeImage), Loader, ErrorMessage
               │    Login, Register, NotFound
               │    PrivateRoute → Create (RecipeForm), Edit (RecipeForm, Loader, ErrorMessage)
               │    GuestRoute   → Login, Register
               └─ Footer
```

`Login` and `Register` are only reachable through `GuestRoute`, and `Create` and `Edit` only through `PrivateRoute`.

## 4. Data flow

```
page or component  →  service function  →  Firestore  →  state  →  render
```

1. A page calls a function from `src/services/`, for example `getAllRecipes()` in a `useEffect` or `createRecipe()` in a submit handler.
2. The service talks to Firestore and returns plain objects (`{ id, ...data }`) or throws an error.
3. The page stores the result in `useState` and renders it, together with loading and error states.

Components do not call Firestore directly. This keeps the Firebase details (collection names, queries, timestamps, deleting subcollections) in one place, keeps components short, and makes it possible to change the backend without rewriting the pages.

Small interactions (a like, a new comment) update local state after the request succeeds instead of reloading the whole page.

## 5. Authentication & routing

- `AuthProvider` subscribes to `onAuthStateChanged` once. It keeps `user` and `authLoading` in state and gives them to the app through context (`useAuth()`).
- `authLoading` is `true` until Firebase has checked the stored session. `PrivateRoute` and `GuestRoute` show `Loader` during this time, so a logged in user is not sent to `/login` on refresh.
- After loading: `PrivateRoute` redirects guests to `/login`, and `GuestRoute` redirects logged in users to `/`. Both render `<Outlet />` otherwise.
- On register, `authService.register` also writes `users/{uid}`, and `AuthContext.register` sets the user from the result because `onAuthStateChanged` may run before the username is saved.
- `Header` reads the same context to show the right links.

## 6. Data model

| Collection | Field | Type / notes |
|---|---|---|
| `recipes/{id}` | `title` | string, 3 to 80 characters |
| | `category` | string, one of the seven categories |
| | `imageUrl` | string, may be empty |
| | `prepTime` | number, minutes |
| | `servings` | number |
| | `ingredients` | array of strings |
| | `instructions` | string |
| | `ownerId`, `ownerName` | author uid and username |
| | `createdAt` | server timestamp |
| `recipes/{id}/likes/{uid}` | `createdAt` | timestamp. The document id is the uid of the user who liked. |
| `recipes/{id}/comments/{commentId}` | `text` | string, 1 to 500 characters |
| | `authorId`, `authorName` | commenter uid and username |
| | `createdAt` | server timestamp |
| `users/{uid}` | `username` | string, 3 to 20 characters |
| | `createdAt` | server timestamp |

## 7. Security

`firestore.rules` is the real protection. It uses the helpers `isSignedIn()`, `isOwner()` and `recipeOwner(recipeId)`.

- **recipes:** anyone can read. Create needs a signed in user, `ownerId` equal to their uid, a string title of 3 to 80 characters, numeric `prepTime` and `servings`, and a list `ingredients`. Update and delete are allowed only for the owner, and an update cannot change `ownerId`, `ownerName` or `createdAt`.
- **likes:** anyone can read. A user can create only their own like document and not on their own recipe. Delete is allowed for the user who liked and for the recipe owner (needed when the recipe is deleted). Update is not allowed.
- **comments:** anyone can read. Create needs `authorId` equal to the user's uid and text of 1 to 500 characters. Delete is allowed for the comment author and for the recipe owner. Update is not allowed.
- **users:** anyone can read. A user can create only their own document with a 3 to 20 character username. Update and delete are not allowed.
- Everything else is denied.

Hiding buttons in the interface (for example Edit and Delete for non-authors) only improves the user experience. Anyone can call the Firebase API directly with their own token and skip the interface, so every rule that matters must also be enforced by the server. That is why the same permissions are checked in the rules.

## 8. Styling approach

- Plain CSS, no UI library. Each component and page has its own `.css` file next to it.
- `src/styles/global.css` is imported first in `main.jsx`. It defines all colors, shadows, corner radius and font as CSS variables in `:root`, a spacing scale (`--space-xs` to `--space-xl`), one heading scale, form styles and the shared classes `.btn` (with `.btn-primary`, `.btn-secondary`, `.btn-danger`), `.field-error`, `.form-error` and `.recipe-grid`.
- Component CSS files use only these variables, so there are no hard-coded colors outside `global.css`.
- Responsive layout uses flexbox and CSS grid: the recipe grid is `repeat(auto-fill, minmax(280px, 1fr))`, the header and filters wrap on small screens, and a few `@media` rules adjust forms and images. Keyboard focus, hover and disabled states are defined globally.
