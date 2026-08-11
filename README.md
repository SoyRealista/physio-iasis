# Physio ΙΑΣΙΣ

Entorno digital completo para una clínica de fisioterapia en Tesalónica: web pública, motor de reservas online, bot de atención con IA (DeepSeek) y un panel de administración tipo ERP (agenda, clientes con historial médico, servicios, terapeutas).

Funciona **sin ninguna clave configurada**: la web pública se ve y se navega con contenido de ejemplo. Para reservas reales, bot y panel admin hace falta Supabase (gratis) y, opcionalmente, una clave de DeepSeek.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Supabase** (Postgres + Auth) — base de datos y login del personal
- **DeepSeek API** (`deepseek-chat`) — bot de reservas, muy barato (mismo proveedor que ya usas en MosaicBot)
- Sin dependencias pesadas: sin librería de calendario, sin ORM — solo `@supabase/supabase-js`

## 1. Arrancar en local (modo demo, sin claves)

```bash
cd /Users/dimitri/PhysioIasis/physio-iasis
npm install
npm run dev
```

Abre `http://localhost:3000`. Verás la web pública funcionando con contenido de ejemplo (servicios, terapeutas, horarios). El chat del bot y las reservas mostrarán un aviso de que falta configuración — es normal hasta el paso 2.

## 2. Conectar la base de datos real (Supabase)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta todo el contenido de [`supabase/schema.sql`](supabase/schema.sql). Crea las tablas, la seguridad (RLS) y datos de ejemplo (2 terapeutas, 6 servicios) que ya puedes editar desde el panel.
3. En **Project Settings → API**, copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secreta) → `SUPABASE_SERVICE_ROLE_KEY`
4. Copia `.env.example` a `.env.local` y pega esas tres claves.
5. Crea el primer usuario del panel: **Authentication → Users → Add user** (email + contraseña). No hay registro público — solo se entra al `/admin` con cuentas creadas así. Cualquier usuario autenticado tiene acceso total al panel (modelo pensado para una clínica pequeña; si en el futuro hay más personal con distintos permisos, se puede refinar).
6. Reinicia `npm run dev`. Ahora la web lee y escribe en tu base real, y `/admin` pide login.

## 3. Activar el bot de reservas (DeepSeek)

1. Crea una cuenta y una API key en [platform.deepseek.com](https://platform.deepseek.com) (modelo `deepseek-chat`, céntimos por conversación).
2. Pega la clave en `.env.local` como `DEEPSEEK_API_KEY`.
3. Reinicia el servidor. El bubble de chat (abajo a la derecha en toda la web) ya puede responder dudas y crear reservas reales comprobando disponibilidad antes de confirmar.

Sin esta clave, el chat sigue visible pero responde con un aviso amable indicando que se use el formulario de reserva.

## Qué incluye

**Web pública** (`/`, `/services`, `/about`, `/contact`, `/book`)
- Bilingüe griego/inglés (botón EL/EN en el header) — el griego es el idioma por defecto.
- Reserva online en 4 pasos: servicio → terapeuta (o "cualquiera disponible") → día/hora → datos de contacto.
- La disponibilidad se calcula en el servidor cruzando el horario semanal de cada terapeuta con las citas ya existentes — no se pueden solapar citas.

**Bot de reservas** (chat flotante en toda la web)
- Responde dudas sobre servicios, precios y horarios.
- Puede consultar disponibilidad real y crear la cita directamente en la base de datos (tool-calling con DeepSeek).
- Cada conversación queda registrada en la tabla `chat_logs` (visible solo desde Supabase por ahora).

**Panel admin** (`/admin`, protegido con login)
- **Panel**: citas de hoy, pendientes, total de clientes, ingresos del mes cobrados.
- **Agenda**: vista por día de todas las citas, cambio de estado (pendiente/confirmada/completada/cancelada/no-show) y de pago (pendiente/pagado/exento) con un clic.
- **Clientes**: ficha con datos de contacto, historial médico/notas libres, e historial de citas.
- **Servicios**: alta/edición/baja, nombre y descripción en griego e inglés, duración y precio.
- **Terapeutas**: alta/edición/baja, con horario semanal editable por día.
- **Ajustes**: nombre, dirección, teléfono, email y horario de la clínica (se refleja en la web pública y en el bot).

## Qué falta para producción (siguiente iteración)

Esto es un MVP sólido y funcional, no un producto terminado. Antes de usarlo con clientes reales de verdad, conviene:

- **Notificaciones**: confirmación de cita por email/SMS al cliente (hoy la reserva se guarda pero no se avisa automáticamente; se necesitaría una cuenta de email transaccional tipo Resend).
- **Facturación fiscal griega**: el sistema registra precio y estado de pago (pagado/no pagado), pero no emite facturas legales — Grecia exige integración con **myDATA** (AADE). Eso lo debe montar un contable/gestoría local; el sistema ya guarda todo lo necesario (precio, fecha, cliente) para conectarlo después.
- **Dominio y despliegue**: recomendado desplegar en **Vercel** (gratis para empezar) + el proyecto de Supabase ya creado. Cuando quieras, te ayudo a desplegarlo y conectar un dominio (p.ej. physioiasis.gr).
- **Roles de personal**: hoy cualquier cuenta con login tiene acceso total al panel; si contratáis más personal conviene separar recepción/terapeutas/admin.

## Estructura del proyecto

```
src/
  app/
    (site)/          web pública (home, services, about, contact, book)
    admin/            panel — login público + (protected) con layout autenticado
    api/              rutas de servidor: availability, book, chat, contact
  components/         UI pública, admin/ y chat/
  lib/                supabase (cliente/servidor/admin), disponibilidad, reservas,
                       integración DeepSeek, i18n, zona horaria (Europe/Athens)
supabase/schema.sql   esquema completo + RLS + datos de ejemplo
```
