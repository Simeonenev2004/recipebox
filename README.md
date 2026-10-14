# RecipeBox

RecipeBox is a single page application for sharing and discovering recipes. Visitors can browse, search and filter recipes. Registered users can add their own recipes, like and comment on other people's recipes, and see each user's recipes on a profile page.

## Live Demo

- Deploy link: https://recipebox-ee99f.web.app
- Demo accounts (both already exist and have recipes):

| User | Email | Password | Recipes |
|---|---|---|---|
| Georgi | `georgi@recipebox.com` | `demo12345` | 4: Tarator, Shopska Salad, Banitsa, Moussaka |
| Maria | `maria@recipebox.com` | `demo1234` | 3: Chocolate Lava Cake, Chicken Wrap, Homemade Lemonade |

- Log in as one of them to edit or delete that user's recipes. Log in as the other one to like and comment on those recipes, and to see that Edit and Delete are missing on someone else's recipe.
- You can also create a new account on the Register page.

## Tech Stack

| Technology | Version (from `package.json`) |
|---|---|
| React | ^19.2.8 |
| React Router (`react-router-dom`) | ^7.18.4 |
| Vite | ^8.3.0 |
| Firebase SDK (Authentication, Cloud Firestore) | ^13.0.0 |
| Firebase Hosting | deployed with Firebase CLI 15.33.0 |
| Styling | plain CSS files (no UI library) |

## Installation & Running

The live application works without any local installation. To run the project locally:

1. **Requirements:** Node.js 22.12 or newer (Vite 8 needs it; the project was tested with Node 24.20.0) and npm.
2. **Clone the repository:**
   ```bash
   git clone https://github.com/Simeonenev2004/recipebox.git
   cd recipebox
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Add the Firebase keys.** Copy `.env.example` to `.env` and fill in the six `VITE_FIREBASE_*` values. They are in Firebase Console, then Project settings, then Your apps, then SDK setup and configuration. The web config values are not secrets. Data is protected by the rules in `firestore.rules`.
5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app opens at http://localhost:5173.
6. **Production build:**
   ```bash
   npm run build
   npm run preview
   ```
   `npm run build` writes the result to `dist/`. `npm run preview` serves it locally.
7. **Deploy** (needs the Firebase CLI and `firebase login`):
   ```bash
   firebase deploy --only hosting,firestore:rules
   ```

## Functional Guide

### 1. Project Overview

- **Application Name:** RecipeBox
- **Application Category / Topic:** Food and cooking, a recipe sharing community
- **Main Purpose:** RecipeBox lets people publish their own recipes and find recipes from others in one place. Every recipe has ingredients, instructions, a category, preparation time and an optional photo. Users can like and comment on recipes, and each author has a profile with all of their recipes.

### 2. User Access & Permissions

**Guest (not authenticated)**
- Available pages: Home (`/`), Catalog (`/catalog`), Recipe details (`/catalog/:id`), Profile (`/profile/:userId`), Login, Register and the 404 page.
- Public data shown: all recipes, like counts, comments and user profiles. Guests cannot create, like or comment. The like button is replaced by a "Login to like" link and the comment form by "Login to leave a comment".
- Guests who open `/create` or `/catalog/:id/edit` are redirected to `/login`.

**Authenticated user**
- Main sections: Home, Catalog, Create, My Profile (`/profile/<uid>`). The header shows "Hello, <username>" and a Logout button. Login and Register are not available (redirect to `/`).
- Details pages: show the full recipe, a like button and the comments.
- Create / Edit / Delete:
  - Any logged in user can create a recipe.
  - Only the author of a recipe sees Edit and Delete and can use them. Opening the edit URL of someone else's recipe redirects back to the details page.
  - A user cannot like their own recipe (the author sees only the like count). Other users can like and unlike.
  - Any logged in user can post comments. A comment can be deleted by its author and by the author of the recipe it belongs to.

### 3. Authentication & Session Handling

**Authentication flow**
1. **App start.** `src/main.jsx` wraps the app in `AuthProvider` (`src/contexts/AuthContext.jsx`). The context starts with `user = null` and `authLoading = true`.
2. **Status check.** In a `useEffect`, `AuthContext` subscribes with `onAuthStateChanged`. Firebase calls it once with the stored user or with `null`. The callback sets `user` (`uid`, `email`, `username`) and sets `authLoading` to `false`. While `authLoading` is true, the route guards show a `Loader` and `Header` shows only Home and Catalog, so the login or user links do not flicker after a refresh.
3. **Login.** The Login page validates the form and calls `login` from the context, which calls `signInWithEmailAndPassword` in `src/services/authService.js`. `onAuthStateChanged` then updates `user`, and the page navigates to `/catalog`.
4. **Register.** `authService.register` calls `createUserWithEmailAndPassword`, then `updateProfile` to store the username as `displayName`, then `createUserProfile` (`src/services/userService.js`) to create the document `users/{uid}`. `AuthContext.register` then sets `user` itself, because `onAuthStateChanged` can fire before `updateProfile` has finished and would give a user without a username. The page then navigates to `/catalog`.
5. **Logout.** The Logout button in `Header.jsx` calls `logout` (`signOut`). The listener sets `user` to `null` and the header navigates to `/`. If signing out fails, the header shows an alert ("Logout failed. Please try again.") and does not navigate.

**Session persistence**
Firebase Authentication keeps the session in the browser (its default persistence). `AuthContext` only holds an in-memory copy of it. After a page refresh, `onAuthStateChanged` runs again, finds the stored session and sets `user`, so the user stays logged in. The guards wait for `authLoading` to become `false`, so a logged in user is not sent to the login page during a refresh.

### 4. Routing Structure

**Route guards logic**
- `src/guards/PrivateRoute.jsx`: if there is no user, it redirects to `/login` (`<Navigate replace />`), otherwise it renders `<Outlet />`. It guards `/create` and `/catalog/:id/edit`.
- `src/guards/GuestRoute.jsx`: if there is a user, it redirects to `/`, otherwise it renders `<Outlet />`. It guards `/login` and `/register`.
- While `authLoading` is `true`, both guards render `<Loader />` and make no redirect decision.

**Main routes** (defined in `src/App.jsx`)

| Route | Page | Access |
|---|---|---|
| `/` | Home | public |
| `/catalog` | Catalog | public |
| `/catalog/:id` | Details | public |
| `/profile/:userId` | Profile | public |
| `/create` | Create | private |
| `/catalog/:id/edit` | Edit | private |
| `/login` | Login | guest-only |
| `/register` | Register | guest-only |
| `*` | NotFound (404) | public |

**Nested and parameterized routes**
- `Layout` (`src/components/layout/Layout.jsx`) is a layout route. It renders `Header`, `<Outlet />` and `Footer`, and every page is its child.
- The guards are layout routes inside `Layout`. They wrap the private and guest-only routes and render `<Outlet />`.
- Parameterized routes: `/catalog/:id` and `/catalog/:id/edit` read `id` with `useParams()`. `/profile/:userId` reads `userId`.
- The Catalog keeps its search, category and sort in the query string, for example `/catalog?search=soup&category=Soup&sort=quickest`, using `useSearchParams`.

### 5. List → Details Flow

**Catalog / list page** (`src/pages/Catalog/Catalog.jsx`)
- Loads all recipes once with `getAllRecipes()` and shows them as `RecipeCard` components (photo, title, category, preparation time, author).
- Search (by title, case-insensitive), category filter and sorting (Newest, Oldest, Quickest first, Title A-Z) are applied in JavaScript to the loaded list. The three values are stored in the URL with `useSearchParams`, so a refresh or a shared link keeps the filters. Empty values and the default sort are not written to the URL.
- It shows the number of results and a "Clear filters" button when nothing matches.

**Details page** (`src/pages/Details/Details.jsx`)
- The user gets there through the `Link` in `RecipeCard` (`/catalog/<id>`), or through `useNavigate` after creating a recipe.
- The page reads `id` from `useParams()` and loads the recipe with `getRecipeById(id)`. It then shows the photo, title, category, time, servings, author link, ingredients, instructions, the like button and the comments.

### 6. Data Source & Backend

**Backend type:** Firebase (backend as a service): Firebase Authentication and Cloud Firestore. There is no separate server, so nothing "sleeps" and the data is always online. The app is hosted on Firebase Hosting.

**Collections**

| Collection | Fields |
|---|---|
| `recipes/{id}` | `title`, `category`, `imageUrl`, `prepTime`, `servings`, `ingredients` (array of strings), `instructions`, `ownerId`, `ownerName`, `createdAt` |
| `recipes/{id}/likes/{uid}` | `createdAt`. The document id is the user id, so one user can like a recipe only once. |
| `recipes/{id}/comments/{commentId}` | `text`, `authorId`, `authorName`, `createdAt` |
| `users/{uid}` | `username`, `createdAt` |

**Security rules** (`firestore.rules`): recipes, likes, comments and users can be read by everyone. Writes need a logged in user. Recipes can only be created with your own `ownerId` and a valid set of fields (title 3 to 80 characters, a known category, a string `imageUrl`, `prepTime` 1 to 1440, `servings` 1 to 50, at least one ingredient, instructions of at least 10 characters). Only the owner can update or delete them, an update must keep the fields valid, and `ownerId`, `ownerName`, `createdAt` cannot change. Likes can only be created for your own `uid` and not on your own recipe. Comments need your own `authorId`, a string `authorName` and 1 to 500 characters of text, and can be deleted by the comment author or the recipe owner. Users documents can only be created for your own `uid` and never changed. Everything else is denied. See `ARCHITECTURE.md` for details.

### 7. Data Operations (CRUD)

All Firestore calls are in `src/services/`. Pages call these functions and do not use Firestore directly.

- **Create:** the Create page (`src/pages/Create/Create.jsx`) shows `RecipeForm`. On submit it calls `createRecipe(data, user)`, which adds `ownerId`, `ownerName` and `createdAt` (`serverTimestamp()`) and returns the new id. The user is then redirected to `/catalog/<new id>`.
- **Read:**
  - Catalog: `getAllRecipes()`
  - Home: `getLatestRecipes(3)`
  - Details and Edit: `getRecipeById(id)`
  - Profile: `getRecipesByOwner(userId)` together with `getUserProfile(userId)`
- **Update:** the author opens `/catalog/:id/edit`. `Edit.jsx` loads the recipe and fills `RecipeForm`. On submit it calls `updateRecipe(id, data)`, which sends only the editable fields. The user is then redirected to the details page, which loads the fresh data.
- **Delete:** the Delete button on the details page (author only) asks `window.confirm("Delete this recipe?")`. Then `deleteRecipe(id)` reads the `likes` and `comments` documents and deletes them together with the recipe in one `writeBatch` (Firestore does not delete subcollections automatically), so everything is deleted or nothing is. After that the user is redirected to `/catalog`, which loads the list again. If it fails, an error message is shown.
- **Likes and comments** work on other people's records. `LikeButton` adds or removes the user's like document and updates its local list without reloading. `Comments` adds a comment (shown at the end of the list immediately) or deletes one (removed from the list). Both use `likeService.js` and `commentService.js`.

### 8. Forms & Validation

**Forms used:** Login (`Login.jsx`), Register (`Register.jsx`), Create and Edit recipe (one shared `RecipeForm.jsx`) and the Comment form (`Comments.jsx`). All use controlled inputs and `onSubmit` with `preventDefault()`.

**Validation rules**

| Form | Field | Rules |
|---|---|---|
| Register | username | required; 3 to 20 characters (after trim) |
| Register | email | required; simple email format check (after trim) |
| Register | password | required; at least 6 characters |
| Register | repeat password | must equal the password |
| Login | email | required; simple email format check (after trim) |
| Login | password | required; at least 6 characters |
| Recipe | title | 3 to 80 characters (after trim) |
| Recipe | category | must be one of the seven categories |
| Recipe | image URL | optional; if filled, must start with `http://` or `https://` |
| Recipe | preparation time | whole number from 1 to 1440 minutes |
| Recipe | servings | whole number from 1 to 50 |
| Recipe | ingredients | at least one non-empty line (one ingredient per line) |
| Recipe | instructions | at least 10 characters (after trim) |
| Comment | text | not empty after trim; at most 500 characters; a counter shows `N/500` |

Fields with more than one rule (username, email, password, title, preparation time, servings) show one message at a time, for the first rule that fails. Errors appear as text under the field and the field gets a red border (`aria-invalid`). Nothing is sent while there are errors. Submit buttons are disabled while the request is running ("Please wait..." / "Saving..." / "Posting...").

### 9. React-Specific Techniques

**Hooks and component lifecycle**
- `useState`: form values, errors and loading flags in all pages and components.
- `useEffect`: loading data (Catalog, Home, Details, Edit, Profile, `LikeButton`, `Comments`), the Firebase auth listener (`AuthContext`) and the page title (`useDocumentTitle`).
- `useContext`: wrapped in the custom hook `useAuth()` (`AuthContext.jsx`).
- `useParams`: Details, Edit, Profile. `useNavigate`: Login, Register, Create, Edit, Details, Header. `useSearchParams`: Catalog.
- Custom hooks: `useAuth` and `useDocumentTitle` (`src/hooks/useDocumentTitle.js`, sets `"<title> | RecipeBox"`).

**Lifecycle examples from the code**
- **Mount:** `Catalog.jsx` loads the recipes in a `useEffect` with an empty dependency array when the page mounts.
- **Update:** `Profile.jsx` has `useEffect(..., [userId])`. When the `userId` parameter changes (for example from one profile link to another), the effect runs again and loads the new profile and recipes.
- **Unmount:** `AuthContext.jsx` returns `unsubscribe` from its effect, so the `onAuthStateChanged` listener is removed when the provider unmounts. `Details.jsx` and `Profile.jsx` use an `ignore` flag set in the cleanup function, so a slow request cannot update state after the page was left or the parameter changed.

**Context API:** `AuthContext` shares `user`, `isAuthenticated`, `authLoading`, `register`, `login` and `logout`. It is used by `Header`, `PrivateRoute`, `GuestRoute`, `Home`, `Catalog`, `Details`, `Create`, `Edit`, `Profile`, `Login`, `Register`, `LikeButton` and `Comments`.

**Component styling:** every component or page has its own CSS file next to it. `src/styles/global.css` defines CSS variables (colors, spacing scale, shadows, radius, font), the heading scale, the button classes (`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`), form styles and the recipe grid. No UI library is used.

### 10. Typical User Flow

1. A visitor opens the Home page, sees the latest recipes and categories, and uses the Catalog search and filters. They open a recipe and read it, the likes and the comments.
2. They click Register, fill in username, email and password, and are logged in and sent to the Catalog.
3. They click Create, fill in the recipe form and are taken to the new recipe's details page.
4. They open another user's recipe, press Like and write a comment. The like and the comment appear immediately.
5. On their own recipe they press Edit, change something and save, and they see the updated recipe.
6. They open My Profile and see their recipes, their member-since date and the Add recipe button.

### 11. Error & Edge Case Handling

- **Authentication errors:** `getAuthErrorMessage` in `authService.js` turns Firebase error codes into readable text: email already in use, wrong email or password, too many attempts, network error, and a general fallback. The raw code is never shown. The message appears above the submit button.
- **Network or data errors:** pages that load data show `ErrorMessage`, with a "Try again" button on Catalog and Home. Forms show a message above the button if saving fails, and buttons are disabled while a request runs. Delete errors on the details page are shown below the buttons.
- **Empty or missing data:** "No recipes yet." (Catalog, Profile), "No recipes match your filters." with "Clear filters", "Recipe not found" (Details, Edit), "User not found" (Profile), "No comments yet.", the 🍽️ placeholder when a recipe has no photo or the photo fails to load, and a 404 page for unknown URLs.

## Project Structure

```
src/
  components/
    layout/        Header, Footer, Layout
    RecipeCard/  RecipeImage/  RecipeForm/
    LikeButton/  Comments/  Loader/  ErrorMessage/
  constants/       categories.js
  contexts/        AuthContext.jsx
  guards/          PrivateRoute.jsx, GuestRoute.jsx
  hooks/           useDocumentTitle.js
  pages/           Home, Catalog, Details, Create, Edit, Profile, Login, Register, NotFound
  services/        firebase.js, authService.js, userService.js,
                   recipeService.js, likeService.js, commentService.js
  styles/          global.css
  App.jsx          routes
  main.jsx         BrowserRouter, AuthProvider, global.css
```

More detail is in [ARCHITECTURE.md](ARCHITECTURE.md).

## Image credits

The demo recipe photos are stored in `public/images/recipes/`. They come from Wikimedia Commons and were resized to a width of 960 px. No other changes were made.

| File | Author | License | Source |
|---|---|---|---|
| `shopska-salad.jpg` | Popo le Chien | CC0 | https://commons.wikimedia.org/wiki/File:Chopska.jpg |
| `banitsa.jpg` | borzo | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Banitsa_borzo.jpg |
| `tarator.jpg` | Gillgaramond | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Tarator_(Bulgarian_cold_soup).jpg |
| `moussaka.jpg` | Robert Kindermann (RobertK) | CC BY-SA 2.5 | https://commons.wikimedia.org/wiki/File:MussakasMeMelitsanesKePatates01.JPG |
| `lava-cake.jpg` | FotoosVanRobin | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Chocolate_Fondant.jpg |
| `chicken-wrap.jpg` | Takeaway | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Smoked_chicken_and_avocado_wrap.jpg |
| `lemonade.jpg` | Shisma | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Lemonade_2.jpg |

License texts: [CC0](https://creativecommons.org/publicdomain/zero/1.0/), [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/), [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).