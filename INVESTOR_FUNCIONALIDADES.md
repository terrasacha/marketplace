# Funcionalidades del rol Investor

Documento de referencia sobre todo lo que un usuario con rol **`investor`** puede hacer en el marketplace.

> **App de referencia:** `terrasacha-marketplace` (las apps `suan-marketplace` y `suan-cauca-marketplace` comparten la mayoría de funcionalidades con variaciones menores en rutas y UI).

---

## 1. ¿Quién es el Investor?

| Atributo | Valor |
|----------|-------|
| **Cognito** | `custom:role = 'investor'` |
| **Base de datos** | `User.role = 'investor'` |
| **Asignación** | Automática en el registro (único rol disponible en signup) |
| **Archivos clave** | `ui-lib/src/lib/auth/SignUpForm.tsx`, `apps/*/backend/index.ts` |

El investor es el **rol por defecto** de la plataforma. Representa a un inversionista que explora proyectos territoriales tokenizados, gestiona su billetera Cardano y participa en compras y trading P2P.

---

## 2. Requisitos previos para usar la plataforma

Antes de acceder a las funcionalidades protegidas, el investor debe cumplir:

| Requisito | Descripción |
|-----------|-------------|
| **Cuenta Cognito** | Registro, confirmación de email y login exitoso |
| **Billetera Cardano** | Crear, importar o restaurar una wallet vinculada al usuario |
| **Desbloqueo de wallet** | Ingresar contraseña o auto-unlock para rutas con `Layout = Main` |
| **Sesión wallet válida** | Token `access_token` en `localStorage.wallet_session` |
| **KYC (para compras)** | `isValidatedStep1` obligatorio para pagar; `isValidatedStep2` para pagos crypto |

**Acceso a rutas protegidas (`MainLayout`):**

1. Autenticación Cognito activa
2. Wallet del usuario encontrada en base de datos
3. Wallet desbloqueada (modal o auto-unlock)
4. Sesión wallet válida **o** permisos de admin (el investor normal usa la sesión wallet)

> El investor **no** tiene bypass por `marketplace_admin` ni por token NFT autorizador (esos mecanismos existen para admins en otras apps).

---

## 3. Autenticación y cuenta

### 3.1 Registro

| Funcionalidad | Ruta | Descripción |
|---------------|------|-------------|
| Crear cuenta | `/auth/signup`, `/signup` | Registro con email, usuario y contraseña. Rol fijado en `investor` |
| Confirmar email | `/auth/confirm-code` | Código de verificación enviado por Cognito |
| Crear usuario en plataforma | API interna | Tras signup se crea registro en AppSync con `role: investor` |

### 3.2 Inicio de sesión

| Funcionalidad | Ruta | Descripción |
|---------------|------|-------------|
| Login | `/auth/login` | Autenticación con usuario y contraseña |
| MFA / TOTP | `/auth/mfa` | Verificación de segundo factor si está habilitado |
| Nueva contraseña requerida | `/auth/new-password-required` | Flujo cuando Cognito exige cambio de contraseña |
| Recuperar contraseña | `/auth/forgot-password` | Reset de contraseña por email |
| Cerrar sesión | Navbar / Landing | `signOut()` de Amplify |

### 3.3 MFA (opcional para investor)

- El investor **puede** configurar MFA TOTP desde el flujo de auth.
- Los roles `marketplace_admin`, `admin` y `admon` tienen tratamiento especial (secreto enviado a API externa); el **investor no**.

---

## 4. Gestión de billetera Cardano

### 4.1 Onboarding de wallet

| Funcionalidad | Ruta | Descripción |
|---------------|------|-------------|
| Pantalla de bienvenida | `/` (Landing) | `WelcomeCard2`: crear, importar o desbloquear wallet |
| Crear wallet nueva | `/generate-wallet` | Genera mnemonic, contraseña y vincula wallet al usuario |
| Restaurar wallet | `/restore-wallet` | Importar con frase mnemónica existente |
| Listar wallets | `/wallets` | Vista de wallets vinculadas |
| Desbloquear wallet | Modal global | `WalletUnlockModal` en rutas protegidas |
| Cambiar de wallet | Sidebar | `WalletSwitcherCard` para alternar entre wallets vinculadas |

### 4.2 Cuadro de mando de billetera

| Funcionalidad | Ruta | Componente |
|---------------|------|------------|
| Dashboard wallet | `/wallet` | `WalletDashboard` |
| Ver dirección | `/wallet` | Mostrar/ocultar dirección, copiar al portapapeles |
| Ver saldo ADA | Sidebar + Navbar | Total, disponible y bloqueado en lovelace |
| Saldo en USD | Sidebar | Conversión con tasas de `/api/calls/getRates` |
| Sincronización | Sidebar | Indicador de última sincronización con blockchain |

### 4.3 Activos y transacciones

| Funcionalidad | Ruta | Descripción |
|---------------|------|-------------|
| Ver activos (tokens) | `/wallet/assets` | Listado de tokens y ADA en la wallet |
| Historial de transacciones | `/wallet/transactions` | Transacciones on-chain registradas |
| Enviar tokens / ADA | `/wallet/send` | Construir, firmar y enviar transacciones a destinatarios |
| Seleccionar activos | `/wallet/send` | Modal para elegir tokens y cantidades |
| Firmar transacción | `/wallet/send` | `SignTransactionModal` con contraseña de wallet |
| Logros | `/wallet/achievements` | Vista de achievements del usuario |

### 4.4 Claim de tokens pendientes

| Funcionalidad | Ubicación | Descripción |
|---------------|-----------|-------------|
| Ver tokens pendientes | `/wallet` → `ClaimTokens` | Tokens comprados pendientes de reclamar on-chain |
| Reclamar tokens | `/wallet` | Construye y firma transacción `claim-tx` |
| Post-pago Epayco | Flujo automático | Tras pago exitoso, tokens quedan disponibles para claim |

---

## 5. Exploración de proyectos

### 5.1 Listado y navegación (público, sin login)

| Funcionalidad | Ruta | Descripción |
|---------------|------|-------------|
| Listado de proyectos | `/` | `MockupProjectsList` con proyectos listos del marketplace |
| Filtro por marketplace | SSR | Solo proyectos donde `marketplace.name === NEXT_PUBLIC_MARKETPLACE_NAME` |
| Tarjetas de proyecto | `/` | Nombre, ubicación, precio, ROI, tokens vendidos/disponibles, progreso |
| Home con categorías | `/home` | `HomeContainer` con filtros por categoría (requiere `Layout Main`) |
| Mockups de diseño | `/mockups` | Vista de prototipos UI |
| Listar proyecto | `/listproject` | Vista de listado (placeholder/mockup) |

### 5.2 Detalle de proyecto (público)

| Funcionalidad | Ruta | Descripción |
|---------------|------|-------------|
| Detalle completo | `/projects/[projectId]` | Información del proyecto territorial |
| Descripción y categoría | Detalle | Nombre, descripción, municipio, vereda, departamento |
| Estado de tokens | Detalle | Tokens Verdes (certificados) vs Tokens Grises |
| Imagen y certificado | Detalle | Imagen principal; badge si tiene certificado de carbono |
| Detalle de token | Sidebar | Precio, moneda, emisión, indicadores financieros |
| Mapa de ubicación | Sidebar | `MockupLocationMap` con coordenadas del proyecto |
| Impacto sostenible | Sidebar | Agua, biodiversidad, comunidades, aliados |
| Tabla de emisión | Detalle | `MockupTokenEmission` — períodos, precios y cantidades |
| Ir a compra | Detalle | Botón **"Comprar Tokens"** → `/projects/[projectId]/purchase` |

### 5.3 Dashboard por proyecto (autenticado)

| Funcionalidad | Ruta | Descripción |
|---------------|------|-------------|
| Dashboard del proyecto | `/projects/[projectId]/dashboard` | `DashboardProject` con métricas, gráficos y datos on-chain |
| Distribución de tokens | Dashboard | Visualización investor, owner, comunidad, buffer, suan |
| Gráficos | Dashboard | Pie chart, datos de blockchain del proyecto |

---

## 6. Inversión y compra de tokens

### 6.1 Flujo de compra

| Funcionalidad | Ruta | Descripción |
|---------------|------|-------------|
| Página de compra | `/projects/[projectId]/purchase` | `MockupPurchasePage` |
| Ingresar cantidad | Compra | Cantidad de tokens (solo enteros); calcula monto total |
| Preview de compra | Compra | Resumen de tokens, precio unitario y total |
| Stepper de pasos | Compra | Indicador visual del flujo de compra |

### 6.2 Verificación KYC (Persona)

| Paso | Campo DB | Requerido para |
|------|----------|----------------|
| KYC básico | `isValidatedStep1` | Pago FIAT (Epayco) y acceso al botón Pagar |
| KYC avanzado | `isValidatedStep2` | Pago con crypto (compra on-chain) |

| Funcionalidad | Descripción |
|---------------|-------------|
| Banner KYC | Tres estados: no verificado, parcial, verificado |
| Verificarme ahora | Abre modal Persona SDK (`persona-v5.1.2`) |
| Actualización en DB | Callback `onComplete` actualiza `isValidatedStep2` |
| Validación previa al pago | `validateValidUser()` consulta `/api/validations/validUser` |

### 6.3 Métodos de pago

#### Pago FIAT — Epayco

| Funcionalidad | Descripción |
|---------------|-------------|
| Pasarela Epayco | `EpaycoCheckout` tras confirmar compra |
| Crear pago | `POST /api/calls/backend/createPayment` con `orderType: 'epayco'` |
| Monedas | COP / USD según `GLOBAL_TOKEN_CURRENCY` del proyecto |
| Tasa de cambio | ADA rate desde `/api/calls/getRates` |
| Respuesta de pago | `/pay-response` — éxito o rechazo con detalle de transacción |

#### Pago Crypto — On-chain

| Funcionalidad | Descripción |
|---------------|-------------|
| Compra directa | `handleBuildTx()` construye transacción de compra |
| Contrato spend | Usa scripts `mintProjectToken` y `spendProject` activos |
| Claim redeemer | `claim_redeemer: 'Buy'` en payload |
| Firma y envío | `POST /api/transactions/claim-tx` |
| Requisito KYC | `isValidatedStep2` obligatorio para crypto |

### 6.4 Post-compra

| Funcionalidad | Descripción |
|---------------|-------------|
| Registro de pago | `Payment` en DynamoDB vía GraphQL |
| Tokens pendientes | Aparecen en `ClaimTokens` del dashboard wallet |
| Reclamar en blockchain | Investor firma transacción para recibir tokens en su wallet |

---

## 7. Trading P2P (mercado secundario)

| Funcionalidad | Ruta | Descripción |
|---------------|------|-------------|
| Mercado P2P | `/trade` | `TradeCard` — trading secundario de tokens |
| Crear orden de venta | `/trade` | `CreateOrderCard` — publicar tokens a la venta |
| Libro de órdenes | `/trade` | `OrderBookCard` — órdenes con `statusCode: listed` |
| Mis órdenes | `/trade` | Tab de órdenes del usuario actual |
| Historial de órdenes | `/trade` | `OrderHistoryCard` — órdenes completadas/canceladas |
| Comprar orden | `/trade` | Desbloquear orden (`unlock-order`) y swap on-chain |
| Script spendSwap | API | `POST /api/transactions/create-order` con contrato Plutus |
| Selección de activos | `/trade` | Elegir tokens del portfolio para vender |

---

## 8. Dashboard del inversionista

| Funcionalidad | Ruta | Descripción |
|---------------|------|-------------|
| Dashboard general | `/dashboard` | `DashboardInvestor` — portfolio consolidado |
| Resumen de proyectos | Dashboard | Cantidad de tokens y activos por proyecto |
| Gráfico de evolución | Dashboard | `LineChartComponent` — evolución del proyecto |
| Gráfico de tokens | Dashboard | `PieChartComponent` — distribución en wallet |
| Detalle de tokens adquiridos | Dashboard | Listado de transacciones de compra |
| Transacciones recientes | Dashboard | `TransactionShort` — últimas operaciones |

---

## 9. Navegación y utilidades

### 9.1 Sidebar (rutas accesibles al investor)

| Enlace | Ruta | Acceso investor |
|--------|------|-----------------|
| Billetera → Cuadro de mando | `/wallet` | ✅ |
| Billetera → Activos | `/wallet/assets` | ✅ |
| Billetera → Transacciones | `/wallet/transactions` | ✅ |
| Billetera → Nueva transacción | `/wallet/send` | ✅ |
| Proyectos | `/` | ✅ |
| Mercado P2P | `/trade` | ✅ |
| PQR | `/pqr` | ⚠️ Solo en Suan/Suan-Cauca (no existe en Terrasacha) |
| CoreWallet | `/corewallet` | ❌ Requiere `walletRole === 'core'` |
| Ayuda | GitBook externo | ✅ |

### 9.2 Otras utilidades

| Funcionalidad | Descripción |
|---------------|-------------|
| Cambio de wallet | `WalletSwitcherCard` en sidebar |
| Notificaciones toast | Sonner / SweetAlert2 en flujos críticos |
| Sonido de balance | Efecto al detectar incremento de saldo |
| Transacción pendiente | `PendingTransactionFloatingCard` — seguimiento de TX en curso |
| Barra de progreso | `nextjs-progressbar` en navegación |
| Documentación | Enlace a Terrasacha GitBook |

---

## 10. APIs que consume el investor

### GraphQL (vía `data-access` y proxies)

| Operación | Uso |
|-----------|-----|
| `listProducts` / `getProduct` | Listar y ver proyectos |
| `createUser` / `getUser` / `updateUser` | Perfil y KYC |
| `createWallet` / `listWallets` | Gestión de wallets |
| `createPayment` / `updatePayment` | Pagos Epayco |
| `listOrders` / `createOrder` | Trading P2P |
| `listTransactions` | Historial |
| `getPendingTokensForClaiming` | Tokens por reclamar |

### API Routes locales (`pages/api/`)

| Grupo | Endpoints relevantes |
|-------|---------------------|
| Wallets | `create`, `import`, `unlock`, `balance`, `utxos`, `change-name` |
| Transacciones | `claim-tx`, `create-order`, `unlock-order`, `sign-and-submit` |
| Validaciones | `validUser`, `validateExternalWalletUser` |
| Pagos | `createPayment`, respuesta Epayco |
| Contratos | `get-scripts`, consultas de balance por dirección |
| Tasas | `getRates` |

### Servicios externos

| Servicio | Uso del investor |
|----------|------------------|
| AWS Cognito | Auth |
| Wallet API | Crear, desbloquear, firmar transacciones |
| Epayco | Pagos FIAT |
| Persona | Verificación KYC |
| Blockfrost | Consultas blockchain |

---

## 11. Lo que el investor NO puede hacer

| Funcionalidad | Rol requerido | Motivo |
|---------------|---------------|--------|
| Core Wallet (mint, scripts, oracle) | `walletRole = 'core'` | Panel administrativo on-chain |
| Promover/revocar core wallet | Admin con wallet core | `promoteWallet` / `unpromoteWallet` |
| Admin de marketplace | `marketplace_admin` + `subrole` | Gestión del marketplace |
| Validar proyectos | `validator` | Oficializar condiciones financieras/técnicas |
| Construir proyectos | `constructor` | Scripts y wallets de constructor |
| Crear wallet con `isAdmin: true` | `marketplace_admin` | Solo admins al crear credenciales |
| MFA con envío de secreto externo | `admin`, `admon`, `marketplace_admin` | Tratamiento privilegiado en `EnableMFA` |
| Bypass de acceso sin wallet | Token NFT / admin | Mecanismos de Suan, no aplican al investor estándar |

---

## 12. Mapa de rutas del investor

### Rutas públicas (sin login)

```
/                          → Listado de proyectos
/projects/[id]             → Detalle de proyecto
/projects/[id]/purchase      → Compra de tokens
/auth/login                → Login
/auth/signup               → Registro
/auth/confirm-code         → Confirmar email
/auth/forgot-password      → Recuperar contraseña
/auth/mfa                  → MFA
/generate-wallet           → Crear wallet
/restore-wallet            → Importar wallet
/mockups                   → Prototipos UI
/listproject               → Listar proyecto (mockup)
```

### Rutas protegidas (login + wallet desbloqueada)

```
/home                      → Home con categorías
/wallet                    → Dashboard wallet
/wallet/assets             → Activos
/wallet/transactions       → Historial
/wallet/send               → Enviar tokens
/wallet/achievements       → Logros
/trade                     → Mercado P2P
/dashboard                 → Dashboard inversionista
/projects/[id]/dashboard   → Dashboard del proyecto
/pay-response              → Respuesta de pago Epayco
```

### Rutas bloqueadas para investor

```
/corewallet                → Solo walletRole = 'core'
```

---

## 13. Flujo completo del investor (resumen)

```
1. Registro (investor) → Confirmar email → Login
2. Crear o importar wallet Cardano
3. Explorar proyectos en / (público)
4. Ver detalle en /projects/[id]
5. Ir a compra → Completar KYC (Persona)
6. Pagar con Epayco (FIAT) o crypto (on-chain)
7. Reclamar tokens en /wallet (ClaimTokens)
8. Ver portfolio en /dashboard
9. Operar en mercado secundario en /trade
10. Enviar tokens desde /wallet/send
```

---

## 14. Archivos de referencia

| Área | Archivos principales |
|------|---------------------|
| Signup / rol | `ui-lib/src/lib/auth/SignUpForm.tsx` |
| Layout protegido | `ui-lib/src/lib/common/MainLayout.tsx` |
| Onboarding wallet | `ui-lib/src/lib/landing/WelcomeCard2.tsx` |
| Listado proyectos | `apps/terrasacha-marketplace/components/mockups/MockupProjectsList.tsx` |
| Detalle proyecto | `apps/terrasacha-marketplace/components/mockups/MockupProjectDetail.tsx` |
| Compra + KYC | `apps/terrasacha-marketplace/components/mockups/MockupPurchasePage.tsx` |
| Claim tokens | `ui-lib/src/lib/wallet/ClaimTokens.tsx` |
| Trading | `ui-lib/src/lib/trade/TradeCard.tsx` |
| Dashboard | `ui-lib/src/lib/dashboard/DashboardInvestor.tsx` |
| Sidebar | `ui-lib/src/lib/layout/Sidebar.tsx` |
| Datos GraphQL | `data-access/src/lib/data-access.ts` |

---

*Documento generado a partir del análisis del código fuente. Última revisión: marzo 2026.*
