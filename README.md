# Chama — Documentación Completa del Proyecto

> Wallet USDT para Cuba. Custodia simple. Una sola cosa, perfecta.

---

## Índice

1. [Visión del producto](#1-visión-del-producto)
2. [Filosofía de desarrollo](#2-filosofía-de-desarrollo)
3. [Arquitectura general](#3-arquitectura-general)
4. [Stack técnico y justificaciones](#4-stack-técnico-y-justificaciones)
5. [Sistema de diseño — Archivo sagrado](#5-sistema-de-diseño--archivo-sagrado)
6. [Estructura de carpetas](#6-estructura-de-carpetas)
7. [Base de datos — Supabase](#7-base-de-datos--supabase)
8. [Seguridad y custodia](#8-seguridad-y-custodia)
9. [Módulo 01 — Wallet (COMPLETADO)](#9-módulo-01--wallet-completado)
10. [Módulo 02 — Panel de Administración Web](#10-módulo-02--panel-de-administración-web)
11. [Módulo 03 — P2P Exchange](#11-módulo-03--p2p-exchange)
12. [Módulo 04 — Ecosistema](#12-módulo-04--ecosistema)
13. [Monetización](#13-monetización)
14. [Despliegue y distribución](#14-despliegue-y-distribución)
15. [Migración Testnet → Mainnet](#15-migración-testnet--mainnet)
16. [Guía para futuros desarrolladores](#16-guía-para-futuros-desarrolladores)
17. [Glosario](#17-glosario)

---

## 1. Visión del producto

Chama es una wallet móvil de USDT diseñada específicamente para el mercado cubano. Su propósito es permitir que usuarios sin conocimiento técnico de blockchain puedan guardar USDT y enviarlo a otros usuarios usando únicamente @usernames simples, sin necesidad de entender direcciones de blockchain.

### Contexto cubano

El mercado cubano impone restricciones únicas que definen cada decisión de diseño:

- **Conectividad intermitente**: La app debe funcionar con conexión inestable y mostrar datos cacheados cuando no hay red, sin romperse.
- **Bajo poder adquisitivo**: Comisiones mínimas (0.5%), sin cobros ocultos, distribución gratuita.
- **Familiaridad técnica limitada**: El usuario nunca ve hashes, direcciones BSC, gas, ni ningún término técnico de blockchain.
- **Distribución forzosa fuera de app stores**: APK descargado directamente via enlace en Telegram, sin Google Play ni App Store.
- **Confianza institucional baja**: El sistema de reputación entre pares es el diferenciador real porque no hay instituciones de confianza.

### Qué hace el MVP

Una sola cosa: **guardar USDT y enviarlo a otro usuario por su @username**.

No tiene intercambio P2P integrado (eso es el Módulo 03). El comercio P2P ocurre orgánicamente fuera de la app (WhatsApp, Telegram, en persona), y Chama solo ejecuta la transferencia.

### Métricas de éxito del MVP

- 500 usuarios registrados con al menos una transacción completada en 90 días
- 30% de retención al día 7
- Promedio de 3 transacciones por usuario activo por semana
- Net Promoter Score cualitativo positivo en el grupo de Telegram

---

## 2. Filosofía de desarrollo

### Regla sagrada

**Cada subfase se prueba en un dispositivo Android físico hasta que funciona perfectamente. Solo entonces se avanza a la siguiente.** No hay "lo probaré después". No hay "funciona en el emulador". El dispositivo físico manda.

### Custodia simple primero

La decisión más importante del proyecto: las llaves privadas viven en el servidor cifradas con AES-256. El usuario solo necesita email + PIN. Si pierde el teléfono, recupera todo desde otro dispositivo.

Esto choca con la ideología cripto de autocustodia, pero es la decisión correcta para Cuba porque:
- El usuario promedio escribirá las 12 palabras en WhatsApp si se las mostramos
- Perder un teléfono no debe significar perder los fondos
- La confianza se construye primero, la educación sobre autocustodia viene después

La autocustodia es la aspiración a largo plazo (Fase futura), no el punto de partida.

### Blockchain invisible

El usuario ve USDT y @usernames. Nunca ve:
- Hashes de transacción (solo disponibles en el detalle técnico para usuarios avanzados)
- Direcciones BSC (solo en pantalla de Recibir para compartir)
- Gas o costos de red en términos técnicos (se muestra como "costo de envío")
- Confirmaciones de bloques (la app dice "en camino" y actualiza sola)

### Una pantalla, dos acciones máximo

Si una pantalla tiene más de dos botones principales, está haciendo demasiado y se divide.

### Reglas de UX no negociables

1. Sin spinners — siempre skeletons que imitan la forma del contenido
2. Errores que enseñan — cada mensaje de error dice qué pasó y cómo resolverlo
3. Haptic en cada acción importante (confirmaciones, errores, recepciones)
4. Offline no rompe nada — banner amarillo, datos cacheados, app funcional
5. El sistema de reputación es el diferenciador — se construye desde la primera transacción

---

## 3. Arquitectura general

### Tres capas de datos con reglas estrictas

```
┌─────────────────────────────────────────────────────────┐
│  DISPOSITIVO (nunca sale)                               │
│  • Hash del PIN (expo-secure-store → Keystore Android)  │
│  • JWT de sesión (expo-secure-store en chunks)          │
└─────────────────────────────────────────────────────────┘
                           ↕ HTTPS
┌─────────────────────────────────────────────────────────┐
│  SUPABASE (datos de perfil y metadata)                  │
│  • Perfil: id, username, dirección pública, reputación  │
│  • Llave privada CIFRADA (nunca en texto plano)         │
│  • Historial de transacciones (metadata, no fondos)     │
│  • Sistema de reputación                                │
│  • Límites diarios por usuario                          │
└─────────────────────────────────────────────────────────┘
                           ↕ RPC
┌─────────────────────────────────────────────────────────┐
│  BLOCKCHAIN BSC (inmutable, público)                    │
│  • Transacciones reales de USDT BEP-20                  │
│  • Los fondos viven aquí, no en Supabase                │
└─────────────────────────────────────────────────────────┘
```

**Regla de oro de seguridad**: Supabase NUNCA tiene acceso a llaves privadas en texto plano. Si Supabase fuera hackeado, el atacante obtiene texto cifrado inútil sin el PIN del usuario.

### Flujo de custodia — Registro

```
1. Usuario elige: username + email + contraseña + PIN (4 dígitos)
2. App genera par de llaves BSC con expo-crypto (entropia aleatoria segura)
3. Llave privada se cifra: AES-256 con clave derivada de PIN + salt único
4. Se envía a Supabase: { dirección_pública, llave_cifrada, salt, pin_hash }
5. Hash del PIN se guarda en expo-secure-store del dispositivo
6. Llave privada en texto plano se destruye de memoria
```

### Flujo de custodia — Envío

```
1. Usuario busca @username destinatario
2. Ingresa monto
3. Ingresa PIN → app calcula hash del PIN
4. Llama Edge Function con { destinatario_username, monto, pin_hash }
5. Edge Function:
   a. Verifica JWT del usuario
   b. Verifica pin_hash contra el guardado en DB
   c. Verifica límite diario disponible
   d. Descifra llave privada EN MEMORIA (milisegundos)
   e. Construye y firma transacción BSC
   f. Transmite a la red
   g. Registra tx en Supabase como "pendiente"
   h. DESTRUYE llave descifrada de memoria
6. App muestra "Tu envío está en camino" en segundos
7. Cron job verifica el hash en BSC cada minuto
8. Cuando confirma: actualiza estado, notifica via Realtime
```

---

## 4. Stack técnico y justificaciones

### Frontend móvil

| Tecnología | Versión | Por qué |
|---|---|---|
| React Native + Expo | SDK 54 | Managed Workflow elimina complejidad nativa. EAS Build compila APKs sin Android Studio. Una base de código para Android (prioritario) e iOS (futuro). |
| Expo Router | v3 | Navegación basada en archivos. Grupos `(auth)` y `(app)` separan flujos. typedRoutes para seguridad de tipos. |
| Zustand | v4 | Estado global mínimo sin boilerplate. Más simple que Redux para esta escala. |
| TanStack Query | v5 | Todo dato del servidor pasa aquí. Cache offline-first con `networkMode: 'offlineFirst'`. Revalidación automática. |
| Zod | v3 | Validación de formularios con mensajes en español. Tipado automático de schemas. |
| expo-secure-store | SDK 54 | Almacenamiento seguro del hash del PIN. Usa Keystore de Android nativamente. Compatible con Expo Go. |
| expo-crypto | SDK 54 | Generación de bytes aleatorios seguros para crear wallets. Único proveedor de crypto que funciona en Expo Go sin polyfills. |
| lucide-react-native | 0.383.0 | Iconos profesionales consistentes. Ligero. Sin emojis en la UI. |
| viem | latest | Derivación criptográfica correcta de dirección BSC desde llave privada. Más tree-shakeable que ethers.js. |

### Backend

| Tecnología | Por qué |
|---|---|
| Supabase | Auth + PostgreSQL + Edge Functions + Realtime. Plan gratuito cubre el MVP completo. Open source. |
| Edge Functions (Deno) | Serverless para lógica crítica. La firma de transacciones ocurre aquí, no en el cliente. |
| Supabase Realtime | WebSockets gestionados para notificaciones in-app de recepciones. |
| pg_cron + pg_net | Cron job que verifica transacciones pendientes en BSC cada minuto. |

### Blockchain

| Tecnología | Por qué |
|---|---|
| BSC (BNB Smart Chain) | Comisiones casi nulas (~$0.01 por tx en Mainnet). Compatible con Ethereum (misma API). USDT BEP-20 disponible. |
| BSC Testnet | Para desarrollo. Chain ID 97. USDT en `0x337610d27c682E347C9cD60BD4b3b107C9d34dDD`. |
| BSC Mainnet | Para producción. Chain ID 56. USDT en `0x55d398326f99059fF775485246999027B3197955`. |
| RPC directo via fetch | Para consultar balances desde el cliente. No usa viem/ethers en el cliente (problemas de compatibilidad con Expo Go). Implementado manualmente con `eth_call`. |

### Nota crítica sobre react-native-reanimated

**PROBLEMA CONOCIDO**: `react-native-reanimated@3.16.7` es incompatible con React Native 0.81.5 (incluido en Expo SDK 54) en builds de producción (EAS Build). Los errores de C++ en `ShadowNode::Shared` y `parentShadowView` hacen que el build falle.

**SOLUCIÓN**: Agregar `"newArchEnabled": false` en `app.json` dentro del objeto `"android"` para deshabilitar la New Architecture en el build de producción.

**ALTERNATIVA FUTURA**: Cuando `react-native-reanimated` publique una versión compatible con RN 0.81, actualizar y remover `newArchEnabled: false`.

---

## 5. Sistema de diseño — Archivo sagrado

El archivo `src/theme/tokens.ts` es el **archivo sagrado** del proyecto. **Ningún componente define colores, espaciados, tipografías o radios fuera de este archivo.**

### Paleta de colores

```typescript
// Fondos (de más oscuro a más claro)
ink:          '#0A0F1E'   // Fondo principal
ink2:         '#131929'   // Superficies / cards
ink3:         '#1C2640'   // Bordes / inputs activos

// Marca principal
teal:         '#0EC4A0'   // Acción primaria, marca
tealDark:     '#0A9678'   // Estado pressed
tealLight:    'rgba(14, 196, 160, 0.12)'  // Fondos suaves

// Semánticos
gold:         '#F5A623'   // Advertencia / pendiente / offline
goldLight:    'rgba(245, 166, 35, 0.12)'
coral:        '#E85A4F'   // Error / fallido / peligro
coralLight:   'rgba(232, 90, 79, 0.12)'
```

### Justificación de la paleta

- **Fondo oscuro (#0A0F1E)**: Reduce consumo de batería en pantallas OLED (común en Android económico). Profesional para app financiera.
- **Teal (#0EC4A0)**: Color tropical pero profesional. Evoca agua, movimiento de dinero, confianza. Diferente de los verdes estándar de apps de dinero.
- **Gold (#F5A623)**: Advertencias y estados pendientes. Visible en oscuro sin ser agresivo.
- **Coral (#E85A4F)**: Errores. Más suave que el rojo puro, menos alarmante.

### Escala de espaciado

Sistema de 4pt. Todo margen y padding usa estos valores:
```
0: 0px   1: 4px   2: 8px   3: 12px   4: 16px   5: 20px
6: 24px  7: 28px  8: 32px  10: 40px  12: 48px  16: 64px
```

### Tipografía

- **Sistema (sin familia)**: Para todo el texto de interfaz. SF Pro en iOS, Roboto en Android. No se carga ninguna fuente externa para mantener el APK ligero.
- **Tamaños**: xs(11) sm(13) base(15) md(17) lg(20) xl(24) 2xl(30) 3xl(38) 4xl(48)
- **Números de balance**: `font-variant-numeric: tabular-nums` para que los dígitos no "salten" al cambiar.

---

## 6. Estructura de carpetas

```
chama/
├── app/                              # Expo Router — cada archivo es una ruta
│   ├── (auth)/                       # Grupo sin tab bar (no autenticado)
│   │   ├── _layout.tsx               # Stack con animación slide_from_right
│   │   ├── bienvenida.tsx            # Pantalla inicial — dos botones
│   │   ├── registro.tsx              # Crear cuenta + wallet en un flujo
│   │   ├── login.tsx                 # Iniciar sesión
│   │   └── recuperar.tsx             # Recuperación por email
│   ├── (app)/                        # Grupo con tab bar (autenticado)
│   │   ├── _layout.tsx               # Tab bar + Toast + useRealtime
│   │   ├── inicio.tsx                # Dashboard: balance + últimas txs
│   │   ├── enviar/
│   │   │   ├── index.tsx             # Buscar destinatario con sugerencias
│   │   │   ├── monto.tsx             # Ingresar monto + desglose
│   │   │   └── confirmar.tsx         # Resumen + PinPad + envío
│   │   ├── recibir.tsx               # QR + @username + compartir
│   │   ├── historial.tsx             # Lista con filtros + modal de detalle
│   │   └── perfil.tsx                # Estadísticas + cambiar PIN + logout
│   ├── index.tsx                     # Redirect según estado de sesión
│   └── _layout.tsx                   # Root: GestureHandlerRootView + Providers
│
├── src/
│   ├── theme/
│   │   └── tokens.ts                 # ⚠️ ARCHIVO SAGRADO — no modificar sin consenso
│   │
│   ├── components/
│   │   ├── ui/                       # Primitivos — usan solo tokens
│   │   │   ├── Button.tsx            # Variantes: primary, secondary, ghost, danger
│   │   │   ├── Input.tsx             # Estados: idle, focused, error, disabled
│   │   │   ├── Text.tsx              # Variantes tipográficas del sistema
│   │   │   ├── Card.tsx              # Superficies: default, elevated, outlined, teal
│   │   │   ├── Badge.tsx             # Estados: success, warning, error, pending
│   │   │   ├── Screen.tsx            # Wrapper con SafeAreaView + scroll opcional
│   │   │   ├── Divider.tsx           # Separador horizontal
│   │   │   ├── PinPad.tsx            # Teclado numérico para PIN con haptics
│   │   │   └── index.ts              # Barrel export
│   │   ├── wallet/
│   │   │   └── BalanceSkeleton.tsx   # Skeleton animado del balance
│   │   ├── transacciones/
│   │   │   └── ModalReputacion.tsx   # Modal para calificar transacciones
│   │   └── shared/
│   │       ├── Providers.tsx         # QueryClient + SafeAreaProvider + SesionListener
│   │       ├── OfflineBanner.tsx     # Banner amarillo cuando no hay conexión
│   │       └── Toast.tsx             # Notificaciones in-app animadas
│   │
│   ├── stores/                       # Zustand — estado global
│   │   ├── sesionStore.ts            # { sesion, cargando, setSesion, cerrarSesion }
│   │   ├── offlineStore.ts           # { online, ultimoBalance, ultimaActualizacion }
│   │   └── uiStore.ts                # { toast, mostrarToast, ocultarToast }
│   │
│   ├── queries/                      # TanStack Query hooks
│   │   ├── useBalance.ts             # Balance USDT on-chain con polling 30s
│   │   └── useTransacciones.ts       # Historial de transacciones desde Supabase
│   │
│   ├── services/
│   │   ├── blockchain/
│   │   │   ├── balance.ts            # Consulta RPC directa (eth_call sin viem)
│   │   │   └── wallet.ts             # Generación de wallet con expo-crypto + viem
│   │   ├── supabase/
│   │   │   ├── client.ts             # Cliente Supabase con SecureStore chunked
│   │   │   ├── auth.ts               # register, login, logout, recuperar, obtenerPerfil
│   │   │   ├── usuarios.ts           # guardarWallet, buscarPorUsername, buscarUsuarios
│   │   │   └── transacciones.ts      # enviarUSDT (invoca Edge Function), obtenerTransacciones
│   │   └── seguridad/
│   │       ├── cifrado.ts            # hashPin, cifrarLlave, generarSalt (expo-crypto)
│   │       └── pin.ts                # guardarPinHash, obtenerPinHash (SecureStore)
│   │
│   ├── hooks/
│   │   ├── useConectividad.ts        # NetInfo → offlineStore.setOnline
│   │   └── useRealtime.ts            # Supabase Realtime → invalidar queries + toast
│   │
│   ├── utils/
│   │   ├── constantes.ts             # BSC config, USDT contract, límites operacionales
│   │   ├── formateo.ts               # formatearUSDT, formatearFechaRelativa, acortarDireccion
│   │   └── validaciones.ts           # Schemas Zod: registroSchema, loginSchema, recuperarSchema
│   │
│   └── types/
│       ├── usuario.ts                # Usuario, SesionUsuario
│       ├── transaccion.ts            # Transaccion, TransaccionConUsuarios, EstadoTx
│       └── wallet.ts                 # WalletInfo, WalletEnMemoria
│
├── supabase/
│   ├── migrations/                   # SQL versionado — ejecutar en orden
│   │   ├── 001_usuarios.sql
│   │   ├── 002_transacciones.sql
│   │   ├── 003_reputacion.sql
│   │   └── 004_limites_diarios.sql
│   └── functions/
│       ├── enviar-usdt/index.ts      # ⚠️ CRÍTICA — firma y transmite transacciones
│       ├── verificar-txs/index.ts    # Cron: confirma txs pendientes en BSC
│       └── resolver-username/index.ts # Resuelve @username → dirección BSC
│
├── android/
│   └── gradle.properties             # newArchEnabled=false (fix para RN 0.81)
│
├── app.json                          # Configuración Expo + android.newArchEnabled: false
├── eas.json                          # Perfiles de build: development, preview, production
├── tsconfig.json                     # paths: @/* → src/*
└── .env                              # EXPO_PUBLIC_SUPABASE_URL + ANON_KEY (no en git)
```

---

## 7. Base de datos — Supabase

### Tabla: `usuarios`

```sql
CREATE TABLE usuarios (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id        UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username       TEXT UNIQUE NOT NULL CHECK (username ~* '^[a-z0-9_]{3,20}$'),
  nombre         TEXT,
  direccion      TEXT UNIQUE,           -- dirección pública BSC (0x...)
  llave_cifrada  TEXT,                  -- llave privada cifrada AES-256 + PIN + salt
  salt           TEXT,                  -- salt único por usuario para el cifrado
  pin_hash       TEXT,                  -- SHA-256 del PIN (para verificación en Edge Function)
  puntuacion     INTEGER DEFAULT 0,     -- suma de calificaciones +1/-1
  limite_diario  DECIMAL(10,2) DEFAULT 100.00,  -- USDT máximo por día
  creado_en      TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- `usuario_propio`: El usuario puede ver y modificar solo su propio perfil (`auth.uid() = auth_id`)
- `buscar_por_username`: Cualquier usuario autenticado puede buscar por username (solo lectura de campos públicos)

### Tabla: `transacciones`

```sql
CREATE TABLE transacciones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remitente_id    UUID NOT NULL REFERENCES usuarios(id),
  destinatario_id UUID NOT NULL REFERENCES usuarios(id),
  monto           DECIMAL(18,6) NOT NULL CHECK (monto > 0),
  estado          TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'confirmada', 'fallida')),
  hash_tx         TEXT,              -- hash en BSC, null hasta que se transmite
  error_msg       TEXT,              -- mensaje de error si estado = 'fallida'
  creado_en       TIMESTAMPTZ DEFAULT now(),
  confirmado_en   TIMESTAMPTZ        -- timestamp de confirmación on-chain
);
```

**Índices**:
```sql
CREATE INDEX idx_tx_remitente    ON transacciones(remitente_id,    creado_en DESC);
CREATE INDEX idx_tx_destinatario ON transacciones(destinatario_id, creado_en DESC);
```

**RLS Policies**:
- `ver_mis_transacciones`: Solo puedes ver txs donde eres remitente o destinatario
- `insertar_transacciones`: Cualquiera puede insertar (la Edge Function usa service role)
- `actualizar_transacciones`: Cualquiera puede actualizar (la Edge Function usa service role)

**Realtime**: `ALTER PUBLICATION supabase_realtime ADD TABLE transacciones;`

### Tabla: `reputacion`

```sql
CREATE TABLE reputacion (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluador_id    UUID NOT NULL REFERENCES usuarios(id),
  evaluado_id     UUID NOT NULL REFERENCES usuarios(id),
  transaccion_id  UUID NOT NULL REFERENCES transacciones(id),
  valor           SMALLINT NOT NULL CHECK (valor IN (-1, 1)),
  creado_en       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (evaluador_id, transaccion_id)  -- una calificación por transacción
);
```

### Tabla: `limites_diarios`

```sql
CREATE TABLE limites_diarios (
  usuario_id  UUID NOT NULL REFERENCES usuarios(id),
  fecha       DATE NOT NULL DEFAULT CURRENT_DATE,
  total_usado DECIMAL(10,2) DEFAULT 0,
  PRIMARY KEY (usuario_id, fecha)
);
```

### Tabla: `intentos_pin`

```sql
CREATE TABLE intentos_pin (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  intentos        INTEGER DEFAULT 0,
  bloqueado_hasta TIMESTAMPTZ,
  actualizado_en  TIMESTAMPTZ DEFAULT now()
);
```

### Función SQL: `actualizar_puntuacion`

```sql
CREATE OR REPLACE FUNCTION actualizar_puntuacion(p_usuario_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE usuarios
  SET puntuacion = (
    SELECT COALESCE(SUM(valor), 0)
    FROM reputacion
    WHERE evaluado_id = p_usuario_id
  )
  WHERE id = p_usuario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Cron job — verificar-txs

```sql
-- Ejecutar en SQL Editor de Supabase
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT vault.create_secret('https://TU_PROJECT_REF.supabase.co', 'project_url');
SELECT vault.create_secret('TU_ANON_KEY', 'anon_key');

SELECT cron.schedule(
  'verificar-txs-pendientes',
  '* * * * *',  -- cada minuto
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
           || '/functions/v1/verificar-txs',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

---

## 8. Seguridad y custodia

### Capas de protección

| Capa | Mecanismo | Propósito |
|---|---|---|
| Autenticación | Supabase Auth (JWT con refresh automático) | Verificar identidad del usuario |
| Hash del PIN | SHA-256 via expo-crypto, guardado en Keystore Android | Verificar PIN sin guardar el PIN |
| Cifrado de llave privada | AES-256-CBC con clave derivada de PIN + salt (10,000 iteraciones SHA-256) | Proteger la llave privada en reposo |
| JWT chunked | Dividir JWT en chunks de 1800 bytes en SecureStore | SecureStore tiene límite de 2048 bytes |
| RLS en Supabase | Políticas por tabla para aislar datos por usuario | Evitar acceso cruzado entre usuarios |
| Edge Functions | Llave privada solo en memoria durante milisegundos | Nunca persiste descifrada |
| Límites diarios | 100 USDT/día por defecto, configurable por admin | Limitar daño en caso de compromiso |
| Intentos de PIN | 3 intentos → bloqueo 5 minutos | Prevenir fuerza bruta del PIN |

### Algoritmo de cifrado de llave privada

El algoritmo implementado en `src/services/seguridad/cifrado.ts`:

```
1. hash_0 = SHA-256(PIN + salt)
2. hash_i = SHA-256(hash_{i-1} + PIN + salt) para i = 1..9999
3. clave = hash_9999 (32 bytes = 256 bits)
4. Para cada byte i: llave_cifrada[i] = llave_plana[i] XOR clave[i % 32]
5. Resultado: string hexadecimal de la llave cifrada
```

**Por qué XOR y no AES estándar**: La API `crypto.subtle` (AES-CBC) no está disponible uniformemente en React Native/Expo Go. El XOR con una clave derivada de 10,000 iteraciones SHA-256 es suficientemente seguro para el contexto del MVP. En producción con mayor escala, considerar migrar a una Edge Function que maneje todo el cifrado server-side.

### Lo que NUNCA debe pasar

- La llave privada en texto plano NUNCA se guarda en Supabase
- El PIN en texto plano NUNCA viaja a través de la red
- La llave privada descifrada NUNCA se loguea (no hay console.log en Edge Functions de producción)
- Las variables de entorno de Supabase NUNCA van en el código fuente (usar `.env`)

---

## 9. Módulo 01 — Wallet (COMPLETADO)

### Subfases completadas

#### Fase 1 — Fundación

- **1.1 Scaffolding y design system**: Proyecto Expo, dependencias, tokens.ts (archivo sagrado), estructura de carpetas, tsconfig con paths alias.
- **1.2 Componentes UI base**: Button, Input, Text, Card, Badge, Screen, Divider, PinPad. Todos usando exclusivamente tokens del archivo sagrado.
- **1.3 Navegación y layout**: Expo Router con grupos (auth) y (app). Tab bar con 5 tabs. Protección de rutas.
- **1.4 Autenticación completa**: Supabase Auth, registro con validación realtime de username, login, recuperación por email, sesión persistente con SecureStore chunked.

#### Fase 2 — Wallet y blockchain

- **2.1 Generación de wallet**: expo-crypto para entropía segura, viem para derivación criptográfica correcta de dirección BSC, cifrado de llave privada, guardado en Supabase.
- **2.2 Dashboard y balance**: Consulta RPC directa a BSC (eth_call manual sin viem en cliente), polling 30s con TanStack Query, OfflineBanner, BalanceSkeleton, últimas transacciones en dashboard.
- **2.3 Pantalla de recibir**: QR de la dirección BSC, @username en grande, copiar al portapapeles con haptic, compartir via Share nativo.

#### Fase 3 — Envío de USDT

- **3.1 Edge Function enviar-usdt**: Verificación JWT, verificación PIN, límite diario, descifrado de llave, firma y transmisión BSC, registro en Supabase, comisión 0.5%.
- **3.2 Flujo de envío UI**: Búsqueda de usuario con sugerencias en tiempo real, selección visual con checkmark, pantalla de monto con desglose de comisión, confirmación con PinPad, auto-confirma al 4to dígito, pantalla de éxito.
- **3.3 Cron de confirmación**: Edge Function verificar-txs, pg_cron cada minuto, actualiza estados pendiente→confirmada/fallida en Supabase.

#### Fase 4 — Historial, reputación y pulido

- **4.1 Historial de transacciones**: FlatList virtualizado, filtros todas/enviadas/recibidas, estados visuales con colores semánticos, modal de detalle con hash BSC.
- **4.2 Notificaciones Realtime**: Supabase Realtime via WebSockets, toast in-app animado con haptic, invalidación de queries para refrescar balance e historial automáticamente.
- **4.3 Sistema de reputación**: Modal de calificación +1/-1, verificación de calificación previa sin pestañeo, actualización de puntuación acumulada, advertencia para usuarios con reputación negativa.
- **4.4 Perfil y ajustes**: Avatar, estadísticas de txs, barra de límite diario, cambio de PIN con flujo de 3 pasos, enlace a soporte Telegram, cerrar sesión.
- **4.5 Pulido y APK**: Dashboard mejorado con últimas transacciones, configuración EAS Build, `newArchEnabled: false` para compatibilidad con RN 0.81.

### Problemas conocidos y soluciones del Módulo 01

| Problema | Causa | Solución aplicada |
|---|---|---|
| react-native-reanimated falla en EAS Build | Incompatibilidad con RN 0.81.5 (New Architecture) | `android.newArchEnabled: false` en app.json |
| SecureStore límite 2048 bytes | JWT de Supabase supera el límite | Dividir en chunks de 1800 bytes |
| ethers.js randomBytes falla en Expo Go | No hay crypto nativo en RN | expo-crypto para entropía, viem para derivación |
| Sesión no persiste al recargar | Supabase recupera sesión pero el store de Zustand se resetea | SesionListener en Providers carga perfil al iniciar |
| Balance siempre falla | Dirección USDT con 41 caracteres (faltaba un caracter) | Verificar siempre que direcciones BSC tienen exactamente 42 caracteres |
| QR no compartible | expo-sharing solo acepta archivos locales | Usar Share nativo de React Native |

---

## 10. Módulo 02 — Panel de Administración Web

### Visión

Un panel web que te da control centralizado sobre la app sin depender del SQL Editor de Supabase. Construido con React + Vite para aprovechar el conocimiento de React Native.

### Stack

```
Frontend:  React 18 + Vite + TypeScript
Estado:    TanStack Query v5 + Zustand
UI:        Tailwind CSS + shadcn/ui
Validación: Zod
Backend:   Supabase JS (service_role_key para operaciones admin)
Gráficas:  Recharts
```

### Autenticación del panel

**CRÍTICO**: El panel usa `service_role_key` que tiene acceso total sin restricciones de RLS. Un acceso no autorizado significa control total de la app.

```
- Login con email + contraseña limitado a un solo usuario admin
- Sin registro público (el admin se crea directamente en Supabase Auth)
- Sesión con timeout de 8 horas
- Todas las acciones se loguean en tabla `admin_logs`
```

### Estructura del panel

```
chama-admin/
├── src/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx          # Métricas generales
│   │   ├── Usuarios.tsx           # Lista y gestión de usuarios
│   │   ├── UsuarioDetalle.tsx     # Perfil completo + historial
│   │   ├── Transacciones.tsx      # Monitoreo completo de txs
│   │   ├── Reputacion.tsx         # Sistema de calificaciones
│   │   └── Configuracion.tsx      # Settings globales de la app
│   ├── components/
│   │   ├── Layout.tsx             # Sidebar + header
│   │   ├── MetricCard.tsx         # Cards de métricas
│   │   ├── UserTable.tsx          # Tabla paginada de usuarios
│   │   ├── TxTable.tsx            # Tabla de transacciones con filtros
│   │   └── charts/                # Recharts components
│   ├── lib/
│   │   ├── supabase.ts            # Cliente con service_role_key
│   │   └── queries.ts             # Funciones de consulta admin
│   └── stores/
│       └── authStore.ts           # Sesión del admin
```

### Fase 1 — Ver y entender (prioritario)

**Subfase 1.1 — Setup y autenticación**
- Crear proyecto con `npm create vite@latest chama-admin -- --template react-ts`
- Instalar: Tailwind, shadcn/ui, TanStack Query, Zustand, Supabase JS, Recharts, Zod
- Pantalla de login con email + contraseña
- Verificar que el usuario tiene rol de admin (campo `is_admin` en tabla `admins` o verificar email contra lista)
- Redirigir a dashboard tras login exitoso
- Layout con sidebar navegable

**Subfase 1.2 — Dashboard de métricas**
- Tarjetas de métricas en tiempo real:
  - Total de usuarios registrados
  - Usuarios activos hoy (con al menos 1 tx en las últimas 24h)
  - Transacciones hoy (count + volumen en USDT)
  - Total de USDT movido (suma histórica)
  - Comisiones generadas (0.5% de txs confirmadas)
- Gráfico de crecimiento de usuarios (últimos 30 días) con Recharts LineChart
- Gráfico de volumen diario de txs (últimos 30 días) con Recharts BarChart
- Lista de las últimas 10 transacciones con estado en tiempo real
- Alertas automáticas:
  - Usuarios con puntuación de reputación < -5
  - Txs fallidas repetidas del mismo usuario (> 3 en 24h)
  - Usuarios que alcanzaron el 90% de su límite diario

```typescript
// Ejemplo de query de métricas
async function obtenerMetricas() {
  const hoy = new Date().toISOString().split('T')[0]
  
  const [usuarios, txsHoy, volumenTotal] = await Promise.all([
    supabase.from('usuarios').select('count'),
    supabase.from('transacciones')
      .select('count, monto')
      .eq('estado', 'confirmada')
      .gte('creado_en', hoy),
    supabase.from('transacciones')
      .select('monto')
      .eq('estado', 'confirmada'),
  ])
  
  return {
    totalUsuarios: usuarios.count,
    txsHoy: txsHoy.count,
    volumenHoy: txsHoy.data?.reduce((s, t) => s + t.monto, 0),
    comisionesHoy: volumenHoy * 0.005,
  }
}
```

**Subfase 1.3 — Tabla de usuarios**
- Tabla paginada (25 por página) con columnas:
  - @username, email (solo visible para admin), dirección BSC (truncada), fecha de registro, puntuación de reputación, límite diario, estado (activo/suspendido)
- Búsqueda en tiempo real por @username o email
- Filtros: todos, activos hoy, reputación negativa, suspendidos
- Click en fila → ver detalle del usuario

**Subfase 1.4 — Detalle de usuario**
- Información completa del perfil
- Historial completo de transacciones del usuario
- Gráfico de actividad (txs por día último mes)
- Calificaciones de reputación recibidas (quién lo calificó y cuándo)
- Notas internas del admin (campo `admin_notes` en tabla `usuarios`)
- Acciones disponibles (ver Fase 2)

**Subfase 1.5 — Tabla de transacciones**
- Tabla completa con filtros:
  - Por estado: todas, pendientes, confirmadas, fallidas
  - Por fecha: rango personalizable
  - Por usuario: buscar por @username
  - Por monto: mayor/menor a X USDT
- Columnas: fecha, remitente, destinatario, monto, comisión, estado, hash BSC
- Click en hash → abrir en BSC Testnet/Mainnet Explorer
- Exportar a CSV (para contabilidad)

### Fase 2 — Actuar sobre usuarios (necesario antes del P2P)

**Subfase 2.1 — Acciones sobre usuarios**

Tabla adicional requerida:
```sql
CREATE TABLE admin_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    TEXT NOT NULL,          -- email del admin
  accion      TEXT NOT NULL,          -- 'suspender', 'ajustar_limite', etc.
  usuario_id  UUID REFERENCES usuarios(id),
  detalle     JSONB,                  -- datos de la acción
  creado_en   TIMESTAMPTZ DEFAULT now()
);
```

Acciones disponibles:
- **Suspender/reactivar usuario**: Cambiar estado en Supabase Auth (`supabase.auth.admin.updateUserById`)
- **Ajustar límite diario individual**: Actualizar `limite_diario` en tabla `usuarios`. Útil para usuarios verificados manualmente que necesitan mover más USDT.
- **Agregar nota interna**: Campo de texto libre para documentar verificaciones manuales ("Verificado en persona por admin el 15/01/2025").
- **Ver intentos de PIN**: Ver si el usuario ha tenido intentos fallidos sospechosos.

```typescript
// Ajustar límite diario
async function ajustarLimite(usuarioId: string, nuevoLimite: number, razon: string) {
  await supabase.from('usuarios').update({ limite_diario: nuevoLimite }).eq('id', usuarioId)
  await supabase.from('admin_logs').insert({
    admin_id: adminEmail,
    accion: 'ajustar_limite',
    usuario_id: usuarioId,
    detalle: { limite_anterior: limiteActual, nuevo_limite: nuevoLimite, razon }
  })
}
```

**Subfase 2.2 — Sistema de verificación manual**

Tabla adicional:
```sql
CREATE TABLE solicitudes_limite (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID NOT NULL REFERENCES usuarios(id),
  limite_solicitado DECIMAL(10,2) NOT NULL,
  razon       TEXT NOT NULL,
  estado      TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  admin_nota  TEXT,
  creado_en   TIMESTAMPTZ DEFAULT now(),
  resuelto_en TIMESTAMPTZ
);
```

En el panel:
- Cola de "Solicitudes de aumento de límite" pendientes
- El admin puede aprobar (ajusta límite automáticamente) o rechazar con nota
- El usuario ve el estado de su solicitud en la app (Módulo 01 Fase 5)

**Subfase 2.3 — Moderación de reputación**
- Ver todas las calificaciones con contexto (quién calificó a quién, en qué tx, cuándo)
- Detectar patrones sospechosos: un usuario calificando negativamente a muchos (posible sabotaje)
- Opción de anular una calificación específica (con log de la acción)
- Lista de usuarios con reputación muy negativa (< -10) para revisión

### Fase 3 — Control operacional (cuando haya volumen real)

**Subfase 3.1 — Configuración global**

Tabla adicional:
```sql
CREATE TABLE configuracion_app (
  clave   TEXT PRIMARY KEY,
  valor   TEXT NOT NULL,
  tipo    TEXT NOT NULL CHECK (tipo IN ('string', 'number', 'boolean')),
  descripcion TEXT
);

INSERT INTO configuracion_app VALUES
  ('limite_diario_default', '100', 'number', 'Límite diario para usuarios nuevos'),
  ('comision_porcentaje', '0.5', 'number', 'Comisión de envío en porcentaje'),
  ('registro_habilitado', 'true', 'boolean', 'Si los usuarios pueden registrarse'),
  ('minimo_envio', '0.01', 'number', 'Monto mínimo de envío en USDT');
```

En el panel:
- Formulario para editar configuración global
- Los cambios se reflejan en la app sin necesidad de recompilar (la app consulta esta tabla al iniciar)

**Subfase 3.2 — Marcado de transacciones revisadas**

Agregar columna a transacciones:
```sql
ALTER TABLE transacciones ADD COLUMN revisada_por TEXT;  -- email del admin
ALTER TABLE transacciones ADD COLUMN revisada_en TIMESTAMPTZ;
ALTER TABLE transacciones ADD COLUMN nota_admin TEXT;
```

En el panel: botón "Marcar como revisada" con campo de nota. Útil para llevar control interno de transacciones grandes o sospechosas.

**Subfase 3.3 — Detección de fraude**
- Algoritmo simple de detección:
  - Usuario enviando a > 10 cuentas diferentes en 24h
  - Múltiples txs fallidas del mismo usuario en 1 hora
  - Volumen inusual (> 500 USDT en un día para usuario con historial de < 50)
- Alertas en el dashboard con botón de investigar
- Historial de alertas para seguimiento

---

## 11. Módulo 03 — P2P Exchange

### Visión

Compra y venta de USDT por CUP dentro de la app. Los usuarios publican anuncios, se conectan, realizan el intercambio con escrow automático en blockchain.

**Prerequisito**: El Módulo 01 debe tener 500+ usuarios activos antes de construir esto.

### Concepto de monetización

El P2P es donde está el ingreso principal. Chama controla el tipo de cambio visible y cobra un spread:
- Precio compra: tipo de cambio - 2%
- Precio venta: tipo de cambio + 2%
- Diferencia = 4% de margen en cada intercambio

### Tablas adicionales requeridas

```sql
CREATE TABLE anuncios_p2p (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      UUID NOT NULL REFERENCES usuarios(id),
  tipo            TEXT NOT NULL CHECK (tipo IN ('compra', 'venta')),  -- compra/venta USDT
  monto_usdt      DECIMAL(18,6) NOT NULL,
  tasa_cup        DECIMAL(10,2) NOT NULL,   -- CUP por 1 USDT
  metodo_pago     TEXT NOT NULL,            -- 'transfermovil', 'enzona', 'efectivo'
  descripcion     TEXT,
  estado          TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'pausado', 'completado', 'cancelado')),
  creado_en       TIMESTAMPTZ DEFAULT now(),
  expira_en       TIMESTAMPTZ               -- anuncios que expiran automáticamente
);

CREATE TABLE ordenes_p2p (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anuncio_id      UUID NOT NULL REFERENCES anuncios_p2p(id),
  comprador_id    UUID NOT NULL REFERENCES usuarios(id),
  vendedor_id     UUID NOT NULL REFERENCES usuarios(id),
  monto_usdt      DECIMAL(18,6) NOT NULL,
  monto_cup       DECIMAL(10,2) NOT NULL,
  estado          TEXT DEFAULT 'iniciada' CHECK (estado IN (
    'iniciada',       -- orden creada
    'usdt_depositado',-- el vendedor depositó USDT en escrow
    'pago_enviado',   -- el comprador marcó que envió CUP
    'completada',     -- el vendedor liberó el USDT del escrow
    'disputada',      -- hay un conflicto
    'cancelada'       -- cancelada antes de completarse
  )),
  hash_escrow_deposit  TEXT,   -- tx de depósito en escrow
  hash_escrow_release  TEXT,   -- tx de liberación del escrow
  creado_en       TIMESTAMPTZ DEFAULT now(),
  completado_en   TIMESTAMPTZ
);

CREATE TABLE mensajes_p2p (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id    UUID NOT NULL REFERENCES ordenes_p2p(id),
  usuario_id  UUID NOT NULL REFERENCES usuarios(id),
  contenido   TEXT NOT NULL,
  tipo        TEXT DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagen', 'sistema')),
  creado_en   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE disputas_p2p (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id    UUID NOT NULL REFERENCES ordenes_p2p(id) UNIQUE,
  abierta_por UUID NOT NULL REFERENCES usuarios(id),
  razon       TEXT NOT NULL,
  evidencia   TEXT[],           -- URLs de capturas de pantalla
  estado      TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'resuelta')),
  resolucion  TEXT,             -- quién ganó y por qué
  creado_en   TIMESTAMPTZ DEFAULT now(),
  resuelto_en TIMESTAMPTZ
);
```

### Contrato de escrow en BSC

El P2P requiere un smart contract en BSC que actúe como escrow:

```solidity
// Escrow simplificado (pseudocódigo)
contract ChamaEscrow {
  mapping(bytes32 => Escrow) public escrows;
  
  struct Escrow {
    address vendedor;
    address comprador;
    uint256 monto;
    bool liberado;
    bool cancelado;
  }
  
  function depositar(bytes32 orderId, address comprador) external payable { ... }
  function liberar(bytes32 orderId) external { ... }  // Solo el vendedor
  function cancelar(bytes32 orderId) external { ... }  // Por tiempo o admin
  function resolver(bytes32 orderId, address ganador) external onlyAdmin { ... }
}
```

### Fases del Módulo 03

**Fase 1 — Marketplace**

- Subfase 1.1: Pantalla de anuncios con lista paginada y filtros (compra/venta, método de pago)
- Subfase 1.2: Crear anuncio con validación de balance suficiente
- Subfase 1.3: Ver detalle de anuncio + botón iniciar orden

**Fase 2 — Escrow y orden**

- Subfase 2.1: Desplegar smart contract de escrow en BSC Testnet
- Subfase 2.2: Flujo de orden: vendedor deposita USDT → comprador envía CUP → vendedor libera USDT
- Subfase 2.3: Chat integrado por orden con Supabase Realtime
- Subfase 2.4: Sistema de timeouts (si el vendedor no libera en X horas → disputa automática)

**Fase 3 — Resolución de disputas**

- Subfase 3.1: Flujo de apertura de disputa (evidencias, capturas)
- Subfase 3.2: Panel de admin para resolver disputas (liberar escrow a favor de uno u otro)
- Subfase 3.3: Sistema de calificaciones específico para P2P

**Fase 4 — Calificaciones y reputación P2P**

- Subfase 4.1: Calificación tras orden completada (separada de la reputación de wallet)
- Subfase 4.2: Perfil P2P del usuario (tasa de completado, tiempo promedio, calificaciones)
- Subfase 4.3: Badges de verificación (usuario verificado, trader de confianza, etc.)

---

## 12. Módulo 04 — Ecosistema

### Visión (a definir cuando P2P esté maduro)

Expansión del ecosistema Chama más allá de wallet y P2P.

### Ideas documentadas para futura evaluación

**Directorio de negocios**
- Negocios que aceptan Chama como pago listados con mapa
- Los negocios pagan mensualidad para aparecer listados
- Integración con EncuentraYa (proyecto previo del desarrollador)

**Múltiples monedas**
- USDC como segunda opción
- Quizás BTC con Lightning Network para microtransacciones

**Integración Transfermóvil/EnZona**
- Alta complejidad regulatoria y técnica
- Solo factible si hay un acuerdo formal con las entidades cubanas
- No contemplar en el corto plazo

**Notificaciones push nativas**
- Firebase Cloud Messaging para notificaciones cuando la app está cerrada
- Requiere un development build (no funciona en Expo Go)
- Prerequisito para el Módulo P2P (el usuario necesita saber que tiene una orden pendiente)

---

## 13. Monetización

### Módulo 01 — Wallet

**Comisión por envío (0.5%)**

Implementada en la Edge Function `enviar-usdt`. El monto neto que recibe el destinatario es `monto - (monto * 0.005)`. La diferencia queda en la wallet de comisiones de Chama.

```typescript
// En Edge Function enviar-usdt
const COMISION = 0.005  // 0.5%
const montoNeto = monto - (monto * COMISION)
const comisionWei = BigInt(Math.floor(monto * COMISION * 1e18))

// Se ejecutan DOS transacciones:
// 1. De remitente → destinatario por montoNeto
// 2. De remitente → wallet_chama por comision
// O alternativamente: el smart contract divide automáticamente
```

**Proyección de ingresos** (referencia):
- 500 usuarios activos × 3 txs/semana × 30 USDT promedio = 45,000 USDT/semana en volumen
- 0.5% de comisión = 225 USDT/semana = ~900 USDT/mes
- A medida que crece la base de usuarios, escala linealmente

### Módulo 03 — P2P Exchange

**Spread en conversión (principal ingreso a largo plazo)**

Chama controla el tipo de cambio visible:
- Precio de compra USDT: tipo_cambio_mercado - 2%
- Precio de venta USDT: tipo_cambio_mercado + 2%
- Margen total: ~4% por intercambio

Con volumen P2P de 10,000 USDT/semana: ~400 USDT/semana en margen.

### Módulo 02 — Panel Admin

No genera ingresos directamente, pero es infraestructura necesaria para gestionar los ingresos de los otros módulos.

### Futuro

- Freemium: límite de 100 USDT/día gratis, 500 USDT/día con suscripción de 2 USDT/mes
- Publicidad nativa: negocios que pagan por aparecer en el directorio (Módulo 04)
- Verificación premium: usuarios que pagan por verificación y límites más altos

---

## 14. Despliegue y distribución

### APK de Android

```bash
# Build de preview (para beta testers)
eas build --platform android --profile preview

# Build de producción (para distribución final)
eas build --platform android --profile production
```

El APK se descarga desde el dashboard de EAS Build y se sube a Supabase Storage en un bucket público.

### Variables de entorno en EAS

Las variables de entorno (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) se configuran en el dashboard de EAS en `expo.dev/accounts/{username}/projects/chama/environment-variables`, no en `eas.json`.

### Distribución

1. Compilar APK con EAS Build
2. Subir APK a Supabase Storage (bucket `releases`, acceso público)
3. Obtener URL pública del APK
4. Compartir en grupo de Telegram oficial de Chama
5. Actualizar descripción del grupo con instrucciones de instalación:
   - Descargar el APK
   - En Android: Ajustes → Seguridad → Fuentes desconocidas → Activar
   - Instalar el APK
   - En Android 8+: el sistema pide permiso al instalar desde el navegador directamente

### Estrategia de actualizaciones

Expo tiene `expo-updates` para OTA (Over The Air) updates que no requieren reinstalar el APK. Sin embargo, para cambios que afectan código nativo (nuevas librerías nativas), se necesita un nuevo APK.

---

## 15. Migración Testnet → Mainnet

La migración es quirúrgica. Solo cambia `src/utils/constantes.ts`:

```typescript
export const BSC = {
  // TESTNET (desarrollo) — ACTIVO
  chainId:    97,
  rpcUrl:     'https://data-seed-prebsc-1-s1.binance.org:8545',
  explorerUrl:'https://testnet.bscscan.com',
  usdt:       '0x337610d27c682E347C9cD60BD4b3b107C9d34dDD',
  nombre:     'BSC Testnet',

  // MAINNET (producción) — descomentar cuando esté validado
  // chainId:    56,
  // rpcUrl:     'https://bsc-dataseed1.binance.org',
  // explorerUrl:'https://bscscan.com',
  // usdt:       '0x55d398326f99059fF775485246999027B3197955',
  // nombre:     'BSC',
} as const
```

También en las Edge Functions (variables de entorno en Supabase Dashboard → Settings → Edge Functions):
```
BSC_RPC=https://bsc-dataseed1.binance.org
USDT_CONTRACT=0x55d398326f99059fF775485246999027B3197955
```

**Lo que NO cambia**: Toda la lógica de la app, las pantallas, los stores, la base de datos. La migración es literalmente 4 líneas de configuración en el cliente y 2 variables de entorno en el servidor.

**Cuándo migrar**: Cuando el MVP tenga 200+ usuarios activos en Testnet y las métricas de retención sean positivas. No antes.

---

## 16. Guía para futuros desarrolladores

### Setup del entorno de desarrollo

**Requisitos previos**:
- Node.js 20+
- PowerShell (Windows) o bash (Mac/Linux)
- Expo Go instalado en un Android físico
- Cuenta en expo.dev
- Proyecto Supabase configurado

**Instalación**:
```bash
git clone https://github.com/yerald0108/chama
cd chama
npm install --legacy-peer-deps
cp .env.example .env
# Editar .env con las credenciales de Supabase
npx expo start --clear
```

**IMPORTANTE**: Siempre usar `--legacy-peer-deps` al instalar dependencias. El proyecto tiene conflictos de peer dependencies que son inofensivos pero hacen fallar la instalación sin este flag.

### Reglas de desarrollo

1. **Nunca modificar tokens.ts sin consenso** — es el archivo sagrado. Un cambio aquí afecta toda la app.
2. **Siempre probar en dispositivo físico Android** — el emulador no replica las condiciones reales de Cuba.
3. **Nada de `console.log` en producción** — usar condicionales `if (__DEV__)`.
4. **TypeScript estricto** — correr `npx tsc --noEmit` antes de cada commit.
5. **Mensajes de error en español cubano** — nunca mensajes técnicos en inglés para el usuario.
6. **Blockchain invisible** — ningún hash, dirección ni término técnico visible sin que el usuario lo busque explícitamente.

### Patrones de código establecidos

**Query con TanStack Query**:
```typescript
export function useBalance(direccion: string | null | undefined) {
  return useQuery({
    queryKey:        ['balance', direccion],
    queryFn:         async () => { ... },
    enabled:         Boolean(direccion),
    refetchInterval: 30_000,
    networkMode:     'offlineFirst',  // SIEMPRE offlineFirst
  })
}
```

**Store con Zustand**:
```typescript
interface MiState {
  valor:    string
  setValor: (v: string) => void
}

export const useMiStore = create<MiState>((set) => ({
  valor:    '',
  setValor: (valor) => set({ valor }),
}))

// Uso (evitar re-renders innecesarios)
const valor = useMiStore(s => s.valor)  // selector específico, no desestructurar el store completo
```

**Validación con Zod**:
```typescript
const schema = z.object({ campo: z.string().min(3, 'Mínimo 3 caracteres') })

const resultado = schema.safeParse(datos)
if (!resultado.success) {
  resultado.error.issues.forEach(e => {  // ISSUES no ERRORS (Zod v3)
    console.log(e.path[0], e.message)
  })
}
```

**Llamar a Edge Function**:
```typescript
const { data, error } = await supabase.functions.invoke('nombre-funcion', {
  body: { campo1: valor1, campo2: valor2 },
})
if (error) throw new Error(error.message)
if (!data?.ok) throw new Error(data?.error ?? 'Error desconocido')
```

### Problemas frecuentes y soluciones

| Síntoma | Causa probable | Solución |
|---|---|---|
| `npm install` falla con ERESOLVE | Conflictos de peer dependencies | Agregar `--legacy-peer-deps` |
| `npx expo install X` no acepta flags | `npx expo install` tiene sintaxis especial | Usar `npx expo install X -- --legacy-peer-deps` |
| App no abre en Expo Go | Dependencia nueva que requiere módulo nativo | Verificar si la librería requiere development build |
| Balance siempre muestra error | Dirección BSC incorrecta en constantes | Verificar que la dirección tiene exactamente 42 caracteres |
| Sesión no persiste | JWT muy grande para SecureStore | Verificar que el cliente de Supabase usa el adaptador chunked |
| EAS Build falla con error C++ | react-native-reanimated incompatible con RN 0.81 | Verificar `android.newArchEnabled: false` en app.json |
| `pg_cron` no disponible | Plan gratuito de Supabase puede no incluirlo | Verificar en Dashboard → Database → Extensions |

### Comandos útiles

```bash
# Desarrollo
npx expo start --clear          # Limpiar caché y arrancar
npx tsc --noEmit                # Verificar TypeScript sin compilar
npx expo doctor                 # Diagnóstico del proyecto

# Build
eas build --platform android --profile preview    # APK de prueba
eas build --platform android --profile production # APK final
eas build:list                                    # Ver historial de builds

# Supabase
supabase login                  # Autenticarse en CLI
supabase functions deploy enviar-usdt  # Desplegar Edge Function
supabase db push                # Aplicar migraciones locales
```

### Variables de entorno necesarias

```bash
# .env (no subir a git)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# En Supabase Edge Functions (configurar en Dashboard)
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
BSC_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
USDT_CONTRACT=0x337610d27c682E347C9cD60BD4b3b107C9d34dDD

# En Supabase Vault (para el cron job)
project_url = https://xxxxxxxxxxxx.supabase.co
anon_key    = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Testing manual — Checklist completo

**Auth**:
- [ ] Registro: username disponible muestra check verde en tiempo real
- [ ] Registro: username tomado muestra error inline (no toast)
- [ ] Registro: PIN de confirmación que no coincide bloquea avance
- [ ] Registro: sin conexión muestra banner y desactiva submit
- [ ] Login: credenciales incorrectas muestran error claro
- [ ] Login: sesión persiste al cerrar y reabrir la app
- [ ] Recuperación: email de recuperación llega en < 2 minutos

**Wallet**:
- [ ] Balance muestra `0.00` sin errores después de registro
- [ ] Indicador verde de conexión visible
- [ ] Desactivar WiFi → banner amarillo aparece, balance cacheado visible
- [ ] Pull to refresh actualiza el balance
- [ ] QR en pantalla de Recibir es escaneable por otra wallet
- [ ] Copiar dirección funciona y cambia a "Copiado" con haptic
- [ ] Compartir abre el menú nativo del sistema

**Envío**:
- [ ] Búsqueda muestra sugerencias mientras escribes (debounce 350ms)
- [ ] Seleccionar usuario muestra card de confirmación con checkmark
- [ ] Intentar enviarse a uno mismo no aparece en sugerencias
- [ ] Monto mayor al balance muestra error con balance actual
- [ ] Desglose de comisión visible en pantalla de monto
- [ ] PinPad auto-confirma al 4to dígito
- [ ] PIN incorrecto muestra error y limpia el PinPad
- [ ] Tras envío exitoso: pantalla de éxito → historial actualizado

**Historial y reputación**:
- [ ] Filtros todas/enviadas/recibidas funcionan
- [ ] Tap en tx abre modal de detalle
- [ ] Modal de calificación abre desde detalle de tx confirmada
- [ ] Calificar dos veces la misma tx muestra "Ya calificaste"
- [ ] Puntuación se actualiza en perfil del evaluado

**Offline**:
- [ ] Sin WiFi: balance cacheado visible con banner amarillo
- [ ] Sin WiFi: intentar enviar muestra mensaje claro
- [ ] Sin WiFi: historial cacheado sigue visible
- [ ] Reconectar: balance se actualiza automáticamente

---

## 17. Glosario

| Término | Definición en el contexto de Chama |
|---|---|
| **BSC** | BNB Smart Chain. La blockchain que usa Chama. Compatible con Ethereum. |
| **USDT BEP-20** | Tether USD en la red BSC. Es el token que mueve Chama. |
| **Testnet** | Red de prueba de BSC (Chain ID 97). Los tokens no tienen valor real. Usada durante desarrollo. |
| **Mainnet** | Red principal de BSC (Chain ID 56). Los tokens tienen valor real. Usada en producción. |
| **Llave privada** | El secreto criptográfico que permite firmar transacciones. Quien la tiene controla los fondos. |
| **Dirección BSC** | Identificador público de una wallet. Formato: 0x + 40 caracteres hexadecimales. Longitud siempre 42. |
| **Hash de transacción** | Identificador único de una transacción en BSC. Permite verificarla en el explorador. |
| **Edge Function** | Función serverless de Supabase que corre en Deno. Aquí ocurre la firma de transacciones. |
| **RLS** | Row Level Security. Políticas de Supabase que aíslan datos por usuario. |
| **Realtime** | WebSockets gestionados de Supabase. Permite notificaciones instantáneas sin polling. |
| **Custodia simple** | Modelo donde el proveedor (Chama) guarda las llaves cifradas. El usuario recupera con email+PIN. |
| **Autocustodia** | Modelo donde el usuario guarda sus propias llaves. Más seguro pero más responsabilidad. |
| **Gas** | Costo computacional de ejecutar una transacción en BSC. Se paga en BNB. |
| **EAS Build** | Expo Application Services. Compila APKs en la nube sin configurar Android Studio. |
| **APK** | Android Package Kit. El archivo instalable de la app en Android. |
| **@username** | Identificador único del usuario en Chama. Máximo 20 caracteres, solo letras, números y guión bajo. |
| **PIN** | Código de 4 dígitos que el usuario usa para confirmar envíos. Nunca viaja en texto plano. |
| **Archivo sagrado** | `src/theme/tokens.ts`. El único lugar donde se definen valores visuales. |
| **Skeleton** | Pantalla de carga que imita la forma del contenido. Más amigable que un spinner. |
| **Haptic** | Vibración táctil del dispositivo. Se usa en confirmaciones importantes. |
| **CUP** | Peso cubano. La moneda fiat del intercambio P2P (Módulo 03). |
| **Spread** | Diferencia entre precio de compra y venta. Principal fuente de ingresos del P2P. |
| **Escrow** | Contrato inteligente que retiene fondos hasta que ambas partes confirman el intercambio. |
| **pg_cron** | Extensión de PostgreSQL para programar tareas recurrentes (cron jobs). |
| **Vault** | Sistema seguro de Supabase para guardar secrets (llaves, contraseñas). |

---

*Documentación generada para el proyecto Chama — Wallet USDT para Cuba.*
*Versión del Módulo 01: Completado — BSC Testnet*
*Próximo hito: Build APK estable → Beta privada → Migración a Mainnet*