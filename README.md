# Bpicius - Full Stack (Backend + Frontend)

This is the **real full-stack version** of the Bpicius Vendor/Customer Portal & Marketplace you described (originally built in Softr).

## Current Status

**Backend** — ✅ Fully working
- Node + Express + SQLite (better-sqlite3)
- All major endpoints: auth, vendors, menu items, orders, issues, favorites, documents, tasks
- Seed data included

**Frontend** — 🚧 Basic React skeleton (Vite + Tailwind + React Router)
- Login screen that talks to the real backend
- Role-aware navigation
- Placeholder pages for Marketplace, Orders, Favorites, Support, Documents
- Ready to be expanded with the beautiful UI from the original HTML prototype

## How to Run

### 1. Backend (Required First)

```bash
cd backend
npm install
npm start
```

Backend runs on **http://localhost:3001**

Demo accounts:
- `luis@bpicius.com` → Admin
- `elena@lacocina.com` → Vendor  
- `maria@example.com` → Customer

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173** (it proxies API calls to the backend).

## Recommended Deployment (Render - Backend + Frontend)

This monorepo requires **two separate services** on Render (one Web Service for the Node backend, one Static Site for the Vite React frontend). Using a single service or relying on Blueprint/render.yaml with `type: static` has caused "unknown type static", "no package.json", and "publish directory build does not exist" errors.

**Use the manual steps below** (most reliable). The `render.yaml` at root is **backend-only** for reference — do not use New + Blueprint if it tries to create a static service (it will fail with the exact errors you reported).

### 1. Backend → Render Web Service (Free)

1. Push latest code (including this README and render.yaml) to GitHub.
   - **Easiest**: In the project folder run `.\fix-git-push.ps1` (the script I added). It handles status, pull, conflict auto-resolution (keeps our fixes), and push.
   - If you get "running scripts is disabled on this system", first run:
     Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
     Then run the .ps1 again.
   - Or open `GIT_PUSH_REJECTED_FIX.txt` first and follow it.
   - Do **not** use --force.
2. On [render.com](https://render.com): New + > Web Service
3. Connect your GitHub repo (bpicius2)
4. **Critical settings**:
   - Name: `bpicius-backend`
   - Environment: Node
   - **Node Version**: `20.x`   <--- CRITICAL (Node 24 causes better-sqlite3 native compile to fail with C++20 errors)
   - Root Directory: `backend`   <--- MUST be set (fixes "Couldn't find a package.json")
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: free
5. Advanced → Add env var:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (leave blank for now)
6. Create Web Service and wait for it to go live.
7. Copy the live backend URL (e.g. `https://bpicius-backend-xxxx.onrender.com`)

See also: `FIX_RENDER_STATIC_ERROR.txt` and `RENDER_DEPLOY_STEPS.txt` in the repo root for copy-paste versions.

### 2. Frontend → Render Static Site (Free)

1. New + > Static Site
2. Connect the **same** GitHub repo
3. **Critical settings**:
   - Name: `bpicius-frontend`
   - Environment: Static Site
   - Root Directory: `frontend`   <--- MUST be set
   - Build Command: `npm install && npm run build`   <--- Must include "npm install" (not just "install")
   - Publish Directory: `dist`   <--- MUST be `dist` (Vite), NOT `build`
   - Plan: free
4. Advanced → Add env var (use the two separate boxes):
   - Key box: VITE_API_URL
   - Value box: https://bpicius-backend-xxxx.onrender.com/api  (your exact backend URL + /api at the end — critical so /vendors etc. resolve to backend /api/vendors)
   If you get "Environment variable keys must consist of..." open the file ADD_ENV_VARS_RENDER.txt in your project.
5. Create Static Site and wait for live frontend URL (e.g. `https://bpicius-frontend-yyyy.onrender.com`)

### 3. Final Connection (CORS)

1. Go back to the `bpicius-backend` Web Service → Environment tab.
2. Set FRONTEND_URL on the backend:
   - Key box: FRONTEND_URL
   - Value box: your live frontend URL (e.g. https://bpicius-frontend-yyyy.onrender.com)
3. Save — this triggers a redeploy of the backend with correct CORS.

Now open the frontend URL, log in with a demo account, and test real data (orders, tasks, invoices, etc.).

**Vercel alternative**: If you prefer Vercel for the frontend, use Root Directory = `frontend`, Framework = Vite, and set the same `VITE_API_URL`. Then set `FRONTEND_URL` on the Render backend afterward. The manual two-service approach on Render alone is simplest for avoiding config mismatches.

---

**For the exact errors you reported ("unknown type static", package.json not found, publish dir issues):**  
Delete the failing Render service(s), push the latest code (this README + the clean backend-only `render.yaml`), then follow the **manual Web Service + Static Site** creation steps in the "Recommended Deployment" section above (or the copy-paste version in `FIX_RENDER_STATIC_ERROR.txt` / `RENDER_DEPLOY_STEPS.txt`).  

**Never use New + > Blueprint** right now — that path was causing the render.yaml static parser error mentioned in your report. The `render.yaml` here is intentionally backend-only.

---

## Important: Native module build error on Render (better-sqlite3)

If after the service is created you see a build failure like:

```
npm error path /opt/render/project/src/backend/node_modules/better-sqlite3
npm error command failed
...
#error "C++20 or later required."
... (hundreds of v8, requires, concept, std::ranges, cppgc errors)
gyp ERR! build error
make: *** [...] Error 1
```

**This is the error you are seeing right now.**

**Cause**: Render is building the backend with Node 24. `better-sqlite3` (the fast SQLite driver the entire app uses) does not have prebuilt binaries for Node 24 on Linux yet. The fallback `node-gyp` compile fails because of C++ standard requirements in Node 24's V8 headers.

**Fix (one-time in the dashboard)**:

For the `bpicius-backend` Web Service:
1. Go to the service page → click the **Settings** gear (top right).
2. Look for **Node Version** (sometimes listed under Build or Runtime).
3. Set it to **`20.x`** (or a specific 20.x like 20.19.0).
4. Scroll down and click **Save Changes**.
5. Back on the service page, choose **Manual Deploy** → **Clear build cache & deploy**.

The `backend/package.json` now includes:
```json
"engines": { "node": "20.x" }
```
This helps Render pick a compatible version.

After the redeploy finishes, the backend should install using a prebuilt better-sqlite3 binary and start successfully.

If you are creating the service for the first time, choose Node Version = 20.x on the creation form itself.

Once the backend is live (green), continue with the frontend Static Site + setting `FRONTEND_URL` on the backend (see steps above).

---

## Other common Render issues
- Still seeing the old static / root directory errors? Delete the service completely and recreate using the exact manual fields listed in the Recommended Deployment section.
- Data loss on restarts (SQLite on free tier)? This is expected — the filesystem is ephemeral. For production you would migrate to Render Postgres + the `pg` driver.

---

## Next Development Priorities (Recommended Order)

1. Flesh out the React pages to match the original beautiful HTML prototype (especially Marketplace grid, Vendor cards, Dashboard with charts, Kanban Tasks, Customer Order History + Tracking).
2. Add real cart + place order flow that creates orders in the backend.
3. Add heart/favorites functionality connected to the API.
4. Improve role-based UI (hide/show sections based on role).

## Database Backup & Restore (SQL)

We provide both binary (`.db`) and text (`.sql`) backups for safety and sharing.

### Create a fresh SQL backup
```bash
cd backend
npm run backup
```

This generates `backup.sql` containing the full schema + all current data.

### Restore from SQL backup
```bash
cd backend
npm run restore
```

**Safety feature**: The restore script automatically creates a timestamped backup of your current database before making changes.

You can also restore manually with the SQLite CLI:
```bash
sqlite3 bpicius.db < backup.sql
```

A ready-made `backup.sql` file is already included in this repository.

## Quick reference for the exact error you reported

The lines you highlighted (the `**Fix:** Use the \`render.yaml\` at the root (I added it for Blueprint)` text and any `type: static` blocks) have been removed from this README.

**Always use the manual two-service steps** in the Recommended Deployment section at the top of this file (or the dedicated `FIX_RENDER_STATIC_ERROR.txt`).

Do not follow any old instructions that tell you to push render.yaml and then click Blueprint for the full stack — that was the source of the "unknown type static" error.

See `RENDER_DEPLOY_STEPS.txt` for the cleanest step-by-step. After you push these docs fixes, delete any broken service and create the two Render services manually with the exact Root Directory / Publish Directory values shown above.

 
 # #   H o s t i n g   R e c o m m e n d a t i o n s   ( F r e e   +   B e s t   B a n g   f o r   B u c k   +   S e c u r e   +   S E O   +   U s a b i l i t y ) 
 
 * * P r i m a r y   r e c o m m e n d a t i o n   ( 2 0 2 6   b e s t   f r e e ) : * * 
 -   * * F r o n t e n d   ( V i t e   R e a c t ) * * :   D e p l o y   t o   * * V e r c e l * *   ( f r e e   t i e r   u n l i m i t e d ) .   
     -   A u t o   G i t H u b   d e p l o y s ,   e d g e   n e t w o r k   ( f a s t   g l o b a l ) ,   b u i l t - i n   a n a l y t i c s ,   f r e e   c u s t o m   d o m a i n ,   e x c e l l e n t   S E O   ( S S G / I S R   p o s s i b l e   l a t e r ,   i n s t a n t   p r e v i e w s ) . 
     -   A d d   e n v   V I T E _ A P I _ U R L = h t t p s : / / y o u r - b a c k e n d . o n r e n d e r . c o m 
 
 -   * * B a c k e n d   +   D B * * :   * * R e n d e r . c o m * *   f r e e   w e b   s e r v i c e   ( m a t c h e s   y o u r   e x i s t i n g   r e n d e r . y a m l ) . 
     -   U s e   p e r s i s t e n t   d i s k   f o r   S Q L i t e   ( a d d   i n   R e n d e r   d a s h b o a r d :   a d d   d i s k   1 G B +   t o   / o p t / r e n d e r / p r o j e c t / s r c / b a c k e n d   o r   a d j u s t   d b   p a t h ) . 
     -   O r   b e t t e r   l o n g - t e r m :   m i g r a t e   D B   t o   * * R e n d e r   P o s t g r e s   f r e e * *   o r   * * S u p a b a s e   ( f r e e   t i e r   P o s t g r e s   +   A u t h   +   S t o r a g e ) * * . 
     -   S u p a b a s e   i s   * o u t s t a n d i n g *   b a n g - f o r - b u c k :   f r e e   g e n e r o u s   P o s t g r e s ,   b u i l t - i n   T O T P   2 F A   +   e m a i l   a u t h   ( r e p l a c e   o u r   s t u b   i n s t a n t l y ) ,   f r e e   S t o r a g e   f o r   r e v i e w   p h o t o s ,   r e a l t i m e   f o r   c h a t / n o t i f s ,   R o w   L e v e l   S e c u r i t y   f o r   b u l l e t p r o o f   a u t h ,   f r e e   b a n d w i d t h .   C a l l   S u p a b a s e   d i r e c t l y   f r o m   f r o n t e n d   o r   k e e p   t h i n   E x p r e s s   p r o x y   f o r   r a t e   l i m i t i n g . 
 
 * * R u n n e r - u p   f u l l - f r e e   s t a c k : * * 
 -   F r o n t e n d :   V e r c e l   o r   N e t l i f y 
 -   E v e r y t h i n g   e l s e   ( a u t h / D B / s t o r a g e / r e a l t i m e ) :   * * S u p a b a s e * *   ( f r e e )      b e s t   s e c u r i t y / 2 F A / s c a l a b i l i t y   f o r   z e r o   $ . 
 -   Y o u   c a n   e v e n   d r o p   t h e   E x p r e s s   s e r v e r   l a t e r   a n d   u s e   S u p a b a s e   E d g e   F u n c t i o n s   +   d i r e c t   c l i e n t   c a l l s   ( h u g e   s i m p l i f i c a t i o n ) . 
 
 * * O t h e r   f r e e   o p t i o n s : * * 
 -   F l y . i o   f r e e   V M s   ( h o b b y ) ,   R a i l w a y   ( h o b b y   f r e e ) ,   N e o n   P o s t g r e s   ( f r e e ) . 
 
 * * F o r   t h i s   S Q L i t e   s e t u p   o n   R e n d e r   f r e e : * * 
 A d d   t o   r e n d e r . y a m l   u n d e r   w e b   s e r v i c e : 
     d i s k : 
         n a m e :   b p i c i u s - d a t a 
         m o u n t P a t h :   / d a t a 
 T h e n   c h a n g e   d b P a t h   t o   p r o c e s s . e n v . R E N D E R   | |   ' / d a t a / b p i c i u s . d b ' 
 
 * * S E O   d o n e : * * 
 -   R i c h   m e t a ,   O G   t a g s ,   d e s c r i p t i o n ,   m a n i f e s t   P W A   i n   i n d e x . h t m l   +   p u b l i c . 
 -   F a s t   T a i l w i n d ,   i m a g e   o p t i m i z a t i o n   ( p i c s u m   o k   f o r   d e m o ;   s w a p   t o   o p t i m i z e d   i n   p r o d ) . 
 -   A d d   a   p u b l i c / s i t e m a p . x m l   o n   d e p l o y   +   s u b m i t   t o   G o o g l e   S e a r c h   C o n s o l e . 
 -   T i t l e   &   s t r u c t u r e   g o o d   f o r    
 l o c a l  
 f a r m e r s  
 m a r k e t  
 +  
 v e n d o r  
 m a r k e t p l a c e . 
 
 * * S e c u r i t y   &   B o t s   ( i m p l e m e n t e d ) : * * 
 -   h e l m e t   ( s e c u r e   h e a d e r s ) 
 -   e x p r e s s - r a t e - l i m i t   o n   l o g i n   ( 1 2 / 1 5 m ) ,   w r i t e s ,   r e v i e w s   ( 8 / 1 0 m ) ,   2 F A ,   B 2 B 
 -   C O R S   l o c k e d   t o   F R O N T E N D _ U R L   i n   p r o d 
 -   P a y l o a d   s i z e   l i m i t 
 -   2 F A   e n f o r c e d   o n   l o g i n   f o r   * a l l *   a c c o u n t s   ( s e t u p   i n   A c c o u n t   S e t t i n g s ) 
 -   R e c o m m e n d   i n   p r o d :   p r o p e r   J W T   ( h t t p O n l y   c o o k i e ) ,   r a t e   l i m i t   b y   I P   +   u s e r ,   C l o u d f l a r e   f r e e   t i e r   i n   f r o n t   f o r   e x t r a   b o t   D D o S ,   h C a p t c h a   o n   s i g n u p / l o g i n . 
 
 * * U s a b i l i t y   p o l i s h   a p p l i e d : * *   N a t u r a l   n a v   ( o n l y   c a r t / h o m e / m a r k e t / f a r m e r s   f o r   g u e s t s   +   c a t e g o r i z e d   d r o p d o w n s ) ,   u n h i n g e d   c l e a n   h e r o ,   B 2 B   w i t h   b a d g e   o p t i o n ,   p h o t o   r e v i e w s ,   v e n d o r   b i o / h i g h l i g h t   +   t o p   r e v i e w s   o n   p u b l i c   p a g e ,   e t c . 
 
 # #   R u n   l o c a l l y 
 1 .   T e r m i n a l   1 :   c d   b a c k e n d   ;   n p m   i n s t a l l   ;   n p m   s t a r t 
 2 .   T e r m i n a l   2 :   c d   f r o n t e n d   ;   n p m   i n s t a l l   ;   n p m   r u n   d e v 
 O p e n   h t t p : / / l o c a l h o s t : 5 1 7 3   ( V i t e   d e f a u l t ) 
 L o g i n   w i t h   2 f a @ d e m o . c o m   t o   t e s t   f u l l   2 F A . 
 
 P u s h   t o   G i t H u b   t h e n   c o n n e c t   V e r c e l   ( f r o n t )   +   R e n d e r   ( b a c k   +   d i s k ) . 
  
 # #   D e p l o y m e n t   t o   V e r c e l   +   S u p a b a s e 
 
 S e e   p r e v i o u s   c o n v e r s a t i o n   o r   c r e a t e   S u p a b a s e   p r o j e c t   a n d   u s e   t h e   s u p a b a s e C l i e n t . j s   f i l e s . 
 
 A d d   v e r c e l . j s o n   i s   p r e s e n t . 
 
 N e w   f e a t u r e s :   A d m i n   f u l l   c o n t r o l   +   a n a l y t i c s   i n   U s e r s M a n a g e m e n t ,   V e n d o r   S t r i p e / P a y P a l   c o n n e c t   i n   V e n d o r D a s h b o a r d ,   m u l t i - s t e p   f l u i d   c h e c k o u t   w i t h   l o y a l t y ,   a d d r e s s ,   p a y m e n t   r o u t i n g   t o   v e n d o r   a c c o u n t s ,   D o o r D a s h / U b e r E a t s   c o n n e c t   +   e s t i m a t e s / t r a c k i n g   i n   O r d e r s   p a g e . 
 
 A l l   p u s h e d .  
 #   a p o t h e c a r y  
 