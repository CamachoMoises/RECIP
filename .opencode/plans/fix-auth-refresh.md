# Fix: cierre de sesión intermitente + error "No token"

## Causa raíz

- El JWT expira a la 1h (`recip_backend/src/controller/authentication.js:31-32`).
- Con token vencido, `authenticateJWT` responde **403** con el error JWT serializado (`authentication.js:60-62`).
- El interceptor de axios (`recip_frontend/src/services/axios.ts:46-52`) hace `logout()` ante **cualquier 403**, sin reintentar.
- El refresh solo corre ante **401** y llama a `POST /auth/refresh`, endpoint **inexistente** en el backend.
- Tras el logout, las peticiones restantes van sin `Authorization` → backend responde **401** → interceptor encuentra token `null` y lanza `new Error('No token')` (`axios.ts:69`) → toast vía `rejectWithValue(error.message)`.

## Cambios

### Backend (`C:\RECIP\recip_backend`)

1. **`src/controller/authentication.js`**
   - Usar `process.env.SECRET_KEY || 'your_secret_key'` (el `.env` ya tiene `SECRET_KEY=Caribay_Tamburini`).
   - Añadir export `Refresh`:
     - Lee token del header `Authorization`.
     - `jwt.verify(token, SECRET_KEY, { ignoreExpiration: true })`.
     - Ventana de refresh: si `payload.exp` es anterior a hace 7 días → rechazar.
     - Verifica `models.User.findByPk(payload.id)` exista y `is_active`.
     - Reemite `{ token }` con `expiresIn: '1h'`.
     - Error → `401 'Invalid token'`.
2. **`src/route/authentication.js`**
   - `router.post('/refresh', upload.none(), convertTypes, Refresh);`
3. **`CONTRACTS.md` y `routes.md`**
   - Documentar `POST /auth/refresh` (`Auth: sí`, `200 → { token }`, `401 'Invalid token'`).

### Frontend (`C:\RECIP\recip_frontend`)

4. **`src/services/axios.ts`** — reescribir interceptor:
   - **403**: solo si el body es error JWT (`jwt expired` / `invalid signature` / `"name":"...Error"`) → intentar refresh y reintentar. Si refresh falla → `logout()`. Un 403 no-JWT se rechaza **sin** desloguear.
   - **401**: refresh de un solo vuelo (`isRefreshing`/`failedQueue`). Si `currentToken` es `null` → **no** re-despachar logout ni lanzar `'No token'`; rechazar con `'Sesión expirada'`.
   - Refresh con `axios.post` crudo (sin interceptor) para evitar loops.
5. **`src/App.tsx`** — guard: si `auth.token` es `null` y la ruta es `/dashboard/*`, redirigir a `/login` (corta cascada de toasts).
6. **`src/CONTRACTS.md`** — documentar `POST /auth/refresh`.

## Verificación

- Backend: arranque (`npm start`) + `npm run lint` (si existe).
- Frontend: `npm run build`.

## Notas

- Ventana de refresh: ≤ 7 días desde la expiración (limita refresh indefinido de token robado).
- `SECRET_KEY` ya está en `.env` (no se cambia el valor).
