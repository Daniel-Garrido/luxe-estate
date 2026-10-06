# Buenas Prácticas Inmobiliarias en Next.js (Luxe Estate)

Cheat sheet condensado con los principios clave, patrones técnicos y recomendaciones para el desarrollo de la plataforma inmobiliaria.

---

## 1. Arquitectura y Rendimiento (Next.js App Router)
* **Server Components por defecto:** Renderiza catálogos, fichas de propiedad (`[slug]`) y consultas directas a Supabase en el servidor para minimizar el bundle JS en el cliente.
* **Client Components atómicos (`'use client'`):** Limítalos exclusivamente a componentes con interactividad pura (favoritos, modales, sliders de rango y carruseles).
* **Filtros en URL (`searchParams`):** Sincroniza categoría, tipo de listado, precio y paginación en la query string (`?category=Villa&type=buy&page=2`) para mantener el historial y permitir compartir enlaces exactos.
* **Streaming con `<Suspense>` y `loading.tsx`:** Implementa skeletons con las dimensiones de las tarjetas de propiedades para evitar layouts vacíos mientras cargan los datos.
* **Parallel Data Fetching:** Consulta propiedad, amenidades, fotos y propiedades recomendadas en paralelo con `Promise.all()`.
* **Optimización visual (`next/image`):** Activa `priority` en la imagen principal para proteger el LCP, usa `placeholder="blur"` y establece relaciones de aspecto fijas (`aspect-[4/3]`) para prevenir CLS.

---

## 2. Experiencia de Usuario y Diseño (UI/UX)
* **Tarjetas de propiedad (Property Cards):** Muestra de forma inmediata imagen de alta calidad, precio formateado, specs clave (m², recámaras, baños), ubicación simplificada y badges de estatus (*Exclusive*, *Featured*, *New Arrival*).
* **Microinteracciones ágiles:** Botón de favoritos accesible sobre la imagen con retroalimentación visual instantánea.
* **Búsqueda con debounce:** Aplica un retraso de 300ms a 400ms en el campo de texto libre para evitar peticiones redundantes a la base de datos.
* **Filtros intuitivos:** Controles claros para Venta/Renta, categorías, deslizador de rango de precio y botón visible de "Limpiar filtros".
* **Empty States proactivos:** Si una búsqueda no da resultados, muestra sugerencias alternativas, listados destacados y botón para restablecer filtros con un solo clic.

---

## 3. SEO Técnico y Datos Estructurados
* **Metadatos dinámicos (`generateMetadata`):** Títulos únicos (`[Título] | [Tipo] en [Ubicación] - Luxe Estate`) y etiquetas Open Graph con foto en alta definición para previsualizaciones en WhatsApp y redes sociales.
* **Schema JSON-LD (`RealEstateListing`):** Agrega datos estructurados con precio, divisa, dirección, geo-coordenadas y metros cuadrados para activar Rich Snippets en Google.
* **URLs semánticas y amigables:** Usa slugs legibles (`/properties/the-glass-pavilion-beverly-hills`) en lugar de identificadores numéricos.
* **Sitemap y robots dinámicos:** Configura `sitemap.ts` y `robots.ts` en Next.js para indexar en tiempo real todas las propiedades publicadas.

---

## 4. Base de Datos y Supabase (PostgreSQL)
* **Bandera `is_featured`:** Campo booleano (`DEFAULT false`) con índice dedicado (`idx_properties_is_featured`) para consultas instantáneas en la sección de destacados.
* **Estatus de propiedad (`status`):** Enum (`active`, `pending`, `sold`, `rented`, `off-market`) para gestionar la disponibilidad sin eliminar registros históricos.
* **Tipos numéricos precisos:** Precios y áreas en `numeric` o `bigint`, evitando `float` para no perder precisión en divisas.
* **Índices de búsqueda frecuentes:** Índices compuestos para `(category, listing_type, price)` y ordenamientos por `(created_at DESC)`.
* **Seguridad RLS (Row Level Security):** Lectura pública para propiedades activas y mutaciones reservadas exclusivamente para administradores autenticados.

---

## 5. Conversión y Captación de Leads
* **Formularios de contacto contextuales:** Botones para *"Agendar Visita Privada"* o *"Solicitar Dossier"* que autocompletan el ID y título de la propiedad.
* **WhatsApp Directo (Click-to-Chat):** Enlace directo con mensaje preconfigurado: *"Hola, me interesa agendar una visita para: [Título] (Ref: [ID])"*.
* **Perfil de asesor visible:** Foto profesional, nombre, credenciales y contacto directo del broker responsable de cada listado.
* **Calculadora hipotecaria interactiva:** Herramienta interactiva para calcular pagos mensuales ajustando enganche, plazo e interés.

---

## 6. Ideas y Funcionalidades Innovadoras
* **Colecciones temáticas curadas:** Crear colecciones especializadas como *Waterfront Living*, *Architectural Icons*, *Skyline Penthouses* y *Eco-Luxury Estates*.
* **Comparador de propiedades:** Selector para contrastar hasta 3 propiedades en una tabla comparativa (precio por m², amenidades, gastos de mantenimiento).
* **Dossier imprimible en PDF:** Botón para generar y descargar una ficha técnica profesional con fotos de alta resolución.
* **Tours 3D y recorridos virtuales:** Soporte para incrustar vistas 360° (Matterport) y videos cinematográficos 4K en pantalla completa.
* **Soporte multidivisa:** Conversor en tiempo real de precios entre USD, EUR, MXN y CAD.
* **Alertas personalizadas:** Notificaciones por email cuando ingrese al catálogo una propiedad que coincida con los criterios guardados del cliente.
