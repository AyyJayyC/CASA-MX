# CASA MX — Visión y Propósito

> Documento fuente de la visión original del proyecto, actualizado para reflejar lo implementado al 2026-06-05.

---

## El Problema

El mercado de venta y renta de bienes raíces en México carece de formalización:

- **Búsquedas no estructuradas** en plataformas como Facebook, WhatsApp y grupos informales.
- **Procesos engorrosos y sin garantías** en trámites importantes como contratos, verificación de identidad y pagos.
- **Plataformas extranjeras y nacionales no especializadas** que generan una desconexión con las necesidades reales del mercado mexicano (idioma, normatividad, cultura de negociación).

## La Solución

CASA MX centraliza el mercado de bienes raíces en México con:

1. **Flujos de trabajo formales** para arrendamiento y compra-venta de inmuebles, desde la publicación hasta el contrato firmado.
2. **Producto completamente en español**, adaptado a las necesidades y normatividad del mercado mexicano.
3. **Verificación de identidad** (INE) que genera confianza entre compradores, vendedores, arrendadores e inquilinos.
4. **Contratos con validez legal**, generados conforme a la legislación civil de cada uno de los 32 estados (NOM-247).

## Características Principales

| Característica | Estado |
|---|---|
| Publicación y búsqueda de propiedades con mapas | ✅ Implementado |
| Flujos de negociación por propiedad (ofertas, contraofertas) | ✅ Implementado |
| Solicitudes de arrendamiento | ✅ Implementado |
| Contratos de arrendamiento oficiales (PDF con validez legal) | ✅ Implementado |
| Contratos de compra-venta oficiales (PDF con validez legal) | ✅ Implementado |
| Verificación de identidad (INE) por revisión administrativa | ✅ Implementado |
| Plataforma completamente en español | ✅ Implementado |
| Sistema de créditos para desbloquear información de contacto | ✅ Implementado |
| Facturación CFDI para compra de créditos | ✅ Implementado |
| Membresías para agencias inmobiliarias | ✅ Implementado |
| Panel de administración con analíticas | ✅ Implementado |
| Integración de pagos con Stripe | ✅ Implementado |
| Integración de mapas (Google Maps) | ✅ Implementado |
| Notificaciones por correo electrónico | ✅ Implementado |
| Caché con Redis | ✅ Implementado |
| Monitoreo de errores (Sentry) | ✅ Implementado |

## Modelo de Negocio (Actualizado)

### 1. Venta de Créditos

Un crédito es la moneda interna que permite desbloquear información de contacto de interesados (compradores, inquilinos, ofertantes). El propietario gasta **10 créditos** para ver los datos de contacto de un lead.

**Paquetes disponibles (Stripe):**

| Plan | Créditos | Precio (MXN) | Costo por crédito |
|---|---|---|---|
| Explorador | 30 | $59 | ~$1.97 |
| Básico | 100 | $149 | ~$1.49 |
| Agente | 250 | $299 | ~$1.20 |
| Pro | 600 | $599 | ~$1.00 |
| Ilimitado | 1,200 | $999 | ~$0.83 |

Las compras generan factura CFDI automáticamente. Los reembolsos y disputas se manejan vía webhooks de Stripe.

### 2. Membresías para Agencias

Planes mensuales para agencias inmobiliarias con límite de agentes:

| Plan | Agentes | Precio (MXN/mes) |
|---|---|---|
| Básico | 3 | $2,499 |
| Pro | 10 | $5,999 |
| Empresarial | 25 | $9,999 |

Cada agente adicional: $500 MXN/mes. Las membresías se administran desde el panel de admin (no hay cobro automatizado vía Stripe aún — ver tareas pendientes).

### 3. Comisión por Transacción

> **⚠️ NO IMPLEMENTADO** — El plan original contempla 5% del valor de venta, dividido 50/50 entre comprador y vendedor. Esta funcionalidad no está construida aún. Pendiente para fase futura.

---

## Flujo del Usuario

```
Registro → Verificación de email → Verificación de INE (manual por admin)
   ↓
Publicar propiedad (requiere INE verificado)
   ↓
Recibir solicitudes/ofertas de interesados
   ↓
Negociar (contraofertas, mensajes)
   ↓
Gastar créditos para ver contacto del interesado
   ↓
Generar contrato oficial (PDF)
   ↓
Cerrar trato
```

---

## Stack Tecnológico

- **Frontend**: Next.js 15 + React 18 + Tailwind CSS + React Query + React Hook Form + Zod + Leaflet + Recharts
- **Backend**: Fastify + TypeScript + Prisma + PostgreSQL + Redis
- **Pagos**: Stripe (PaymentIntents, webhooks, reembolsos, disputas)
- **Mapas**: Google Maps API (con monitoreo de cuota), OpenStreetMap (fallback)
- **Email**: Resend
- **Almacenamiento**: AWS S3
- **Monitoreo**: Sentry, pino logger
- **CI/CD**: GitHub Actions (unit tests, E2E Playwright, accessibility)

---

## Estado Actual (Fase 4 — Junio 2026)

- **Backend tests**: 242/242 ✅
- **Frontend tests**: 69/69 ✅
- **E2E (Playwright)**: 34/34 ✅
- **En producción**: `https://casa-mx.com`
- **Tareas post-lanzamiento**: Ver `SEEK.md`

---

## Lo Que Viene (Próximas Fases)

Ver `SEEK.md` para el backlog completo. Resumen de prioridades:

- [ ] Guard de propiedad centralizado (`requireOwnership()`)
- [ ] Logging estructurado con contexto (77 sitios)
- [ ] Mecanismo de recuperación del monitor de mapas
- [ ] Manejo global de errores de Prisma (P2002/P2003/P2025)
- [ ] Health check de email en `/health`
- [ ] Facturación automatizada de membresías de agencia vía Stripe
- [ ] Catálogo de colonias enriquecido (137 → miles)
- [ ] Comisión por transacción de venta (5%)
