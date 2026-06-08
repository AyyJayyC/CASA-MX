# CASA MX — Guía del Proyecto

> Esta guía explica cómo funciona CASA MX en lenguaje sencillo, para cualquier persona sin conocimientos técnicos.

---

## 1. ¿Qué es CASA MX?

CASA MX es un mercado inmobiliario mexicano. Permite a las personas:

- **Buscar y comprar** propiedades (casas, departamentos, terrenos)
- **Rentar** propiedades
- **Publicar propiedades** en venta o renta
- **Negociar** ofertas entre compradores y vendedores
- **Administrar** sus propiedades, solicitudes y contactos

El lema es "Tu ruta, tu decisión" — la plataforma ayuda a compradores, inquilinos, vendedores y arrendadores a encontrar y negociar propiedades.

---

## 2. Los Roles de Usuario

Cada persona en CASA MX puede tener uno o más roles. Todos los roles requieren aprobación de un administrador.

| Rol | ¿Qué puede hacer? |
|---|---|
| **Comprador** (buyer) | Buscar propiedades en venta, hacer ofertas, solicitar información de contacto |
| **Inquilino** (tenant) | Buscar propiedades en renta, enviar solicitudes de renta |
| **Vendedor** (seller) | Publicar propiedades en venta, recibir ofertas, ver datos de compradores |
| **Arrendador** (landlord) | Publicar propiedades en renta, recibir solicitudes, ver datos de inquilinos |
| **Mayorista** (wholesaler) | Igual que vendedor, pero enfocado en volumen |
| **Administrador** (admin) | Aprobar usuarios, ver estadísticas, gestionar toda la plataforma |

---

## 3. ¿Cómo Funciona por Dentro?

Imagina CASA MX como un restaurante:

- La **página web** es el comedor — lo que los usuarios ven y tocan
- El **servidor** es la cocina — donde se procesan los pedidos
- La **base de datos** es la despensa — donde se guarda toda la información
- El **sistema de pagos** (Stripe) es la caja registradora

### Diagrama Simple

```
         USUARIO
            │
            ▼
    ┌──────────────┐
    │  PÁGINA WEB  │  ← Lo que ves en el navegador
    │  (casa-mx)   │
    └──────┬───────┘
           │ Internet (siempre cifrado con HTTPS)
           ▼
    ┌──────────────┐
    │   SERVIDOR   │  ← Donde se procesa todo
    │  (backend)   │
    └──┬───────┬───┘
       │       │
       ▼       ▼
   ┌──────┐ ┌──────┐
   │ BASE │ │CACHE │
   │ DATOS│ │REDIS │
   └──────┘ └──────┘
```

---

## 4. Las Tecnologías Explicadas

Cada tecnología es una herramienta que cumple un trabajo específico. Aquí están todas, qué hacen, y por qué las elegimos.

### 4.1 Frontend (lo que ves en el navegador)

| Tecnología | ¿Qué Hace? | ¿Por Qué La Usamos? |
|---|---|---|
| **Next.js** | El armazón de la página web. Maneja las páginas, rutas, y hace que los buscadores (Google) encuentren las propiedades. | Es gratis, de código abierto, creado por Vercel. La versión más usada para sitios web modernos. |
| **React** | Los bloques de construcción. Cada botón, campo de texto, tarjeta de propiedad es un "componente" de React. | El estándar de la industria. Facebook lo creó y mantiene. Usado por Netflix, Airbnb, WhatsApp. |
| **Tailwind CSS** | La pintura y decoración. Define colores, tamaños, espacios, y cómo se ve todo en celular y computadora. | La forma más rápida de diseñar. En lugar de escribir archivos CSS separados, el estilo va directo en el código. |
| **React Query** | El mensajero. Pide datos al servidor, los guarda en memoria temporal (caché), y los refresca automáticamente. | Evita pantallas de carga innecesarias. Los datos se actualizan solos sin que el usuario haga nada. |
| **React Hook Form** | El manejador de formularios. Controla lo que el usuario escribe, valida que sea correcto, y lo envía al servidor. | Reduce cientos de líneas de código repetitivo para formularios. |
| **Zod** | El libro de reglas. Define qué datos son válidos: "el precio debe ser mayor a 0", "el título debe tener al menos 5 letras", etc. | Atrapa errores antes de que lleguen al servidor. Como un filtro de seguridad. |
| **Leaflet** | El mapa interactivo. Muestra las propiedades en un mapa donde los usuarios pueden hacer clic. | Es gratis y de código abierto. Alternativa a Google Maps (que cobra por uso). |
| **Zustand** | La memoria del usuario. Recuerda preferencias entre visitas: filtros guardados, direcciones recientes. | Es minúsculo (1KB) y muy simple. No requiere configuración complicada. |
| **nuqs** | El administrador de direcciones web. Guarda los filtros de búsqueda en la URL del navegador para que puedas compartir enlaces. | Hecho específicamente para Next.js. Los enlaces son compartibles y funcionan con el botón "atrás" del navegador. |
| **Stripe** | La caja registradora. Procesa pagos con tarjeta de crédito/débito de forma segura. | Es el estándar mundial para pagos en internet. CASA MX nunca ve los números de tarjeta — Stripe los maneja directamente. |
| **Recharts** | Las gráficas. Crea gráficas de barras, líneas y pastel para el panel de análisis. | Es gratis, simple, y funciona bien con React. |

### 4.2 Backend (el servidor que procesa todo)

| Tecnología | ¿Qué Hace? | ¿Por Qué La Usamos? |
|---|---|---|
| **Fastify** | La recepción. Recibe todas las peticiones (buscar propiedades, iniciar sesión, publicar) y las responde lo más rápido posible. | Es uno de los servidores más rápidos que existen. Más veloz que Express (el anterior estándar). |
| **Prisma** | El bibliotecario. Traduce las peticiones en español a consultas de base de datos, y mantiene toda la información organizada. | Genera consultas automáticamente. Si alguien quiere "todas las propiedades en CDMX", Prisma crea la instrucción correcta para la base de datos. |
| **PostgreSQL** | El archivero. Guarda TODA la información: usuarios, propiedades, ofertas, pagos, fotos, mensajes. | Es la base de datos de código abierto más confiable del mundo. Usada por Apple, Spotify, Instagram. |
| **Redis** | La memoria rápida. Guarda datos que se usan mucho (como la lista de estados de México) en RAM para acceso instantáneo. | Reduce la carga en PostgreSQL 10 veces. Como tener un atajo en lugar de ir al archivo completo. |
| **JWT** | El gafete de identificación. Cuando inicias sesión, el servidor te da un "token" que prueba quién eres en cada página que visitas. | Es la forma estándar de autenticación. No requiere consultar la base de datos en cada página. |
| **BullMQ** | El ayudante de tareas. Maneja trabajos que toman tiempo (enviar correos, procesar archivos Excel) sin hacer esperar al usuario. | Corre en segundo plano. Si subes 100 propiedades por Excel, BullMQ las procesa mientras tú sigues usando el sitio. |

### 4.3 Infraestructura (dónde vive el proyecto)

| Servicio | ¿Qué Hace? | ¿Por Qué Lo Usamos? |
|---|---|---|
| **Vercel** | El edificio del frontend. Publica la página web en internet, la hace rápida con CDN, y maneja los certificados de seguridad (HTTPS). | La plataforma oficial de Next.js. El plan gratuito es suficiente para este proyecto. |
| **Railway** | El edificio del backend. Corre el servidor, la base de datos, y Redis. | Sencillo de usar. También tiene plan gratuito generoso. |
| **GitHub** | La bóveda del código. Guarda todo el código del proyecto, el historial de cambios, y quién cambió qué. | El estándar mundial. Plan gratuito ilimitado. |
| **GitHub Actions** | El robot de pruebas. Cada vez que alguien cambia algo, automáticamente ejecuta todas las pruebas para verificar que nada se rompió. | Viene incluido con GitHub. Automatiza el control de calidad. |
| **Sentry** | El detector de humo. Si algo falla en producción (un error, una página rota), Sentry avisa inmediatamente. | Tiene plan gratuito generoso. La versión de código abierto se puede instalar en tu propio servidor. |
| **Playwright** | El inspector de calidad. Abre un navegador real, hace clic en botones, llena formularios, y verifica que todo funcione como un usuario real. | La herramienta más moderna para pruebas automáticas. Creada por Microsoft. |

---

## 5. Cómo Está Organizado el Código

```
casa-mx/                     ← El proyecto principal (frontend)
├── app/                     ← Las páginas del sitio
│   ├── page.js              ← Página principal (home)
│   ├── login/page.js        ← Iniciar sesión
│   ├── register/            ← Registro de usuario
│   ├── properties/          ← Búsqueda y detalle de propiedades
│   ├── dashboard/           ← Panel de control (por rol)
│   ├── admin/               ← Panel de administración
│   └── settings/            ← Configuración de usuario
├── components/              ← Bloques reutilizables (botones, formularios, tarjetas)
│   ├── NavBar.jsx           ← La barra de navegación superior
│   ├── PropertyCard.jsx     ← Tarjeta de propiedad en listados
│   └── PropertyUploadForm.jsx ← El formulario para publicar propiedades
├── lib/                     ← La "caja de herramientas"
│   ├── api/                 ← Código que habla con el servidor
│   ├── auth/                ← Sistema de autenticación (login, roles)
│   ├── queries/             ← Consultas de datos con caché automático
│   ├── validation/          ← Reglas de validación de formularios
│   ├── analytics/           ← Seguimiento de uso (páginas visitadas, clics)
│   └── stores/              ← Memoria de preferencias del usuario
├── tests/                   ← Pruebas automáticas
├── docs/                    ← Documentación del proyecto
└── public/                  ← Archivos públicos (logos, imágenes, PDFs)
```

---

## 6. Cómo Iniciar Sesión y Cómo Funcionan las Contraseñas

1. El usuario se registra con nombre, correo, contraseña y elige sus roles
2. Un administrador revisa y aprueba los roles
3. Cuando inicia sesión, el servidor verifica su correo y contraseña
4. Si es correcto, el servidor crea un "pase" (JWT) que se guarda como cookie segura en el navegador
5. Ese pase se envía automáticamente en cada página visitada, sin que el usuario haga nada
6. Si el pase caduca (15 minutos), se renueva silenciosamente con un "pase de refrezco"
7. Al cerrar sesión, ambos pases se eliminan

Las contraseñas NUNCA se guardan como texto. Se transforman con un algoritmo matemático irreversible (hash). Ni siquiera los desarrolladores pueden ver las contraseñas originales.

---

## 7. Cómo Funcionan los Pagos

CASA MX usa un sistema de **créditos**:

1. Los compradores e inquilinos **nunca pagan** — el sitio es gratis para ellos
2. Los vendedores y arrendadores compran **paquetes de créditos** con dinero real
3. Los créditos se usan para:
   - Publicar propiedades (gratis la primera vez en 180 días, luego cuesta créditos reactivar)
   - Ver datos de contacto de compradores interesados (1 crédito por contacto)
   - Destacar propiedades en búsquedas (300 créditos/día)
   - Aparecer en el carrusel principal (2,000 créditos/día)
4. El pago real lo procesa **Stripe** — CASA MX nunca ve ni guarda números de tarjeta
5. Los créditos se compran en paquetes: Agente, Profesional, Pro, Inmobiliario

---

## 8. Cómo Instalar y Probar Localmente

### Requisitos

1. Tener **Node.js** versión 20 instalado
2. Tener **Git** instalado
3. Una cuenta de GitHub

### Pasos

```bash
# 1. Clonar el proyecto
git clone https://github.com/tu-usuario/casa-mx.git
cd casa-mx

# 2. Instalar dependencias
npm install

# 3. Crear archivo de configuración
cp .env.example .env.local

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Abrir `http://localhost:3000` en el navegador.

### Para ejecutar las pruebas

```bash
# Pruebas unitarias (rápidas)
npm test

# Pruebas completas con navegador
npm run test:e2e:auto
```

---

## 9. Cómo Subir Cambios a Producción

CASA MX usa **despliegue automático**. No hay que hacer nada manual.

1. Haces cambios en tu computadora
2. Los subes a GitHub (`git push`)
3. GitHub Actions ejecuta todas las pruebas automáticamente
4. Si pasan las pruebas, Vercel publica los cambios en el sitio web
5. El backend se actualiza de la misma forma en Railway

### Verificar que el cambio funcionó

1. Revisa el tablero de Vercel — debe decir "Ready" en verde
2. Revisa las acciones de GitHub — todos los checks deben estar en verde
3. Abre el sitio web y verifica que tu cambio se vea

---

## 10. Funciones de Seguridad

CASA MX protege los datos de los usuarios con estas medidas:

| Protección | ¿Qué Significa? |
|---|---|
| **HTTPS obligatorio** | Toda la comunicación entre tu navegador y el servidor está cifrada. Nadie puede espiar lo que haces. |
| **Contraseñas hasheadas** | Las contraseñas se transforman con matemáticas irreversibles. Ni los empleados pueden verlas. |
| **Tokens de seguridad** | Cada formulario incluye un código secreto (CSRF) que prueba que la petición viene del sitio real, no de un impostor. |
| **Doble candado en cookies** | El pase de acceso usa cookies HttpOnly — ningún código malicioso puede robarlo. |
| **Límites de intentos** | Si alguien intenta adivinar contraseñas, el servidor bloquea los intentos después de 5 fallos por minuto. |
| **Escaneo de archivos** | Antes de guardar una foto, el servidor verifica que realmente sea una imagen y le quita metadatos ocultos (ubicación GPS, fecha, cámara). |
| **Clave de Google Maps protegida** | La clave de Google Maps nunca sale del servidor. No se puede robar desde el navegador. |
| **Detección de secretos** | En cada cambio de código, un robot revisa que no se haya filtrado ninguna contraseña o clave secreta (Gitleaks). |
| **Política de seguridad de contenido** | El navegador solo ejecuta código de fuentes autorizadas (el propio sitio, Stripe, Google Maps). Bloquea todo lo demás. |
| **Base de datos separada para pruebas** | Las pruebas automáticas usan una base de datos aislada. Nunca tocan datos reales. |

---

## 11. Cómo Hacer un Respaldo de la Base de Datos

```bash
# Desde el servidor de Railway, o con acceso a PostgreSQL:
pg_dump -h localhost -U postgres -d casamx > backup_$(date +%Y%m%d).sql
```

Los respaldos se deben hacer diario en producción. En Railway, se puede configurar un trabajo programado.

---

## 12. ¿Qué Hacer Si Algo Falla?

### El sitio no carga (Vercel)

1. Revisa `https://vercel.com/tu-cuenta/casa-mx` — ¿dice "Error"?
2. Revisa los logs de despliegue en Vercel
3. Revisa las acciones de GitHub para ver qué prueba falló

### El servidor no responde (Railway)

1. Revisa `https://railway.app/tu-proyecto` — ¿está "Healthy"?
2. Revisa los logs del servidor en Railway
3. Revisa si la base de datos está arriba

### Los pagos no funcionan (Stripe)

1. Revisa el tablero de Stripe — ¿hay errores?
2. Verifica que las claves de Stripe estén configuradas en Railway
3. Revisa los logs del servidor para ver errores de Stripe

### Se encontró una vulnerabilidad de seguridad

1. NO la reportes en público
2. Reporta directamente al equipo de desarrollo
3. Se investigará y corregirá antes de hacer pública la información

---

## 13. Glosario

| Término | Significado |
|---|---|
| **Frontend** | La parte visible del sitio — lo que el usuario ve en el navegador |
| **Backend** | El servidor que procesa datos — invisible para el usuario |
| **API** | La forma en que frontend y backend se comunican |
| **JWT** | "JSON Web Token" — el pase digital que prueba tu identidad |
| **CSRF** | "Cross-Site Request Forgery" — un ataque que nuestro sistema de tokens previene |
| **Cookie** | Pequeño archivo que el navegador guarda para recordar información |
| **HttpOnly** | Un tipo de cookie que el código JavaScript no puede leer (más seguro) |
| **HTTPS** | Conexión cifrada — el candado verde en la barra del navegador |
| **CDN** | Red de servidores que aceleran la carga de la página en todo el mundo |
| **ORM** | Traductor de código a base de datos (Prisma es un ORM) |
| **Caché** | Memoria temporal para datos frecuentes (Redis es una caché) |
| **RAM** | Memoria ultrarrápida de la computadora (Redis guarda datos aquí) |
| **Hash** | Transformación matemática irreversible (para contraseñas) |
| **Open Source** | Código abierto — cualquiera puede verlo, usarlo y mejorarlo gratis |

---

## 14. Proyectos de Código Abierto que Usamos

Todos son gratis y mantenidos por comunidades de programadores alrededor del mundo:

| Proyecto | GitHub | Para qué |
|---|---|---|
| Next.js | `vercel/next.js` | El armazón del sitio web |
| React | `facebook/react` | Bloques de construcción visuales |
| Tailwind CSS | `tailwindlabs/tailwindcss` | Diseño y estilos |
| TanStack Query | `TanStack/query` | Mensajero de datos con caché |
| React Hook Form | `react-hook-form/react-hook-form` | Manejo de formularios |
| Zod | `colinhacks/zod` | Validación de datos |
| Leaflet | `Leaflet/Leaflet` | Mapas interactivos gratuitos |
| Zustand | `pmndrs/zustand` | Memoria de preferencias |
| Fastify | `fastify/fastify` | Servidor ultrarrápido |
| Prisma | `prisma/prisma` | Traductor de base de datos |
| PostgreSQL | `postgres/postgres` | Base de datos |
| Redis | `redis/redis` | Caché ultrarrápido |
| Playwright | `microsoft/playwright` | Pruebas automáticas |
| Sharp | `lovell/sharp` | Procesamiento de imágenes |
| Pino | `pinojs/pino` | Registro de actividad del servidor |
| Gitleaks | `gitleaks/gitleaks` | Detector de secretos y contraseñas |
| Lucide | `lucide-icons/lucide` | Íconos profesionales |
