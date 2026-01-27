# Prompt para Stitch - Interfaz de Lista de Proyectos Terrasacha

## Contexto de la Marca

**Terrasacha** es una plataforma de marketplace de tokens de carbono y proyectos sostenibles tokenizados en blockchain (Cardano). El slogan es "Pioneros del Mañana" y los valores centrales son: Innovación, Conciencia, Transformación, Educación, Responsabilidad, Imaginación, Cambio, Inspiración, Esperanza y Colectividad.

**Tono visual:** Inspiracional, ecológico, tecnológico, ancestral

---

## Sistema de Colores

### Color Primario
- **Verde Selva** (#6e6c35 / RGB: 109, 110, 53)
  - Uso: Botones principales, acentos, elementos destacados

### Colores Secundarios
- **Verde Bosques Nublados** (#44482c / RGB: 68, 72, 44)
  - Uso: Variantes de botones, elementos oscuros
  
- **Verde Pradera** (#849b50 / RGB: 132, 155, 80)
  - Uso: Elementos de apoyo, gradientes
  
- **Verde Claro** (#b1c181 / RGB: 177, 193, 129)
  - Uso: Fondos sutiles, hover states
  
- **Amarillo Tierra** (#e8d79a / RGB: 232, 215, 154)
  - Uso: Acentos cálidos, elementos destacados

### Colores Neutros
- Fondo principal: Blanco (#ffffff)
- Fondo secundario: Gris claro (#f9fafb / gray-50)
- Texto principal: Gris oscuro (#333333)
- Bordes: Gris claro (#e5e7eb / gray-100)

---

## Tipografía

### Fuente Principal
- **Jost** (Regular, Bold, Italic)
  - Uso: Textos generales, títulos, descripciones
  - Características: Moderna, legible, amigable

### Fuentes Secundarias
- **Champagne & Limousines Bold**
  - Uso: Slogan "Pioneros del Mañana", mensajes promocionales
  
- **Futura Bold**
  - Uso: Títulos alternativos, acentos tipográficos

---

## Estilo Visual de la Vista de Detalles (Referencia)

La interfaz actual de detalles de proyecto tiene estas características:

### Elementos Visuales
- **Cards con gradientes sutiles**: `bg-gradient-to-br from-white to-gray-50`
- **Sombras suaves**: `shadow-lg`, `hover:shadow-xl`
- **Bordes redondeados**: `rounded-xl`, `rounded-lg`
- **Efectos hover**: Escalado sutil (`hover:scale-105`), cambios de sombra
- **Animaciones**: fade-in, slide-up, scale-in, shimmer, float
- **Gradientes en botones**: `from-custom-marca-boton via-custom-marca-boton-variante2 to-custom-marca-boton`
- **Backdrop blur**: Efectos de vidrio esmerilado en overlays

### Componentes Característicos
- Badges de estado con colores diferenciados (Verde para activo, Gris para pendiente)
- Iconos SVG minimalistas con colores de marca
- Tooltips informativos con fondo oscuro y texto blanco
- Imágenes con overlay de gradiente
- Indicadores visuales (puntos animados, barras de progreso)

---

## Especificaciones para la Lista de Proyectos

### Layout General
- **Grid responsivo**: 
  - Mobile: 1 columna
  - Tablet: 2 columnas
  - Desktop: 3 columnas
  - Large Desktop: 4 columnas (opcional)

- **Espaciado**: Generoso entre cards (gap-6 o gap-8)
- **Padding del contenedor**: `container mx-auto px-4 py-8`

### Card de Proyecto

Cada card debe incluir:

#### 1. Imagen del Proyecto
- **Aspecto**: 16:9 o 4:3
- **Estilo**: `rounded-xl overflow-hidden`
- **Efecto hover**: Zoom sutil (`group-hover:scale-110`)
- **Overlay**: Gradiente sutil desde abajo con color de marca
- **Badge opcional**: Badge flotante con certificación o estado

#### 2. Información Principal
- **Título del Proyecto**
  - Fuente: `font-jostBold`
  - Tamaño: `text-xl` o `text-2xl`
  - Color: `text-custom-dark` o gradiente con colores de marca
  - Máximo 2 líneas con ellipsis

- **Ubicación**
  - Icono de ubicación pequeño
  - Texto: `font-jostRegular text-gray-600 text-sm`
  - Formato: "Ciudad, País"

- **Categoría/Tipo**
  - Badge pequeño con color de marca
  - Ejemplo: "Tokenized Real Estate", "Energía Renovable"

#### 3. Métricas del Token
Mostrar en formato compacto:
- **Precio por Token**: `$X.XX USD / TOKEN`
- **Tokens Disponibles**: `XXX,XXX TOKENS`
- **ROI**: `XX%` (si aplica)
- **Estado**: Badge (Tokens Verdes/Grises)

#### 4. Indicadores Visuales
- **Barra de progreso**: Mostrar porcentaje de tokens vendidos/disponibles
- **Badge de estado**: 
  - Verde para proyectos certificados (Tokens Verdes)
  - Gris para proyectos en fase inicial (Tokens Grises)
- **Icono de certificación**: Si tiene certificado de carbono

#### 5. Botón de Acción
- **Texto**: "Ver Detalles" o "Invertir"
- **Estilo**: 
  - Gradiente con colores de marca
  - `rounded-lg` o `rounded-xl`
  - Efecto shimmer en hover
  - Icono opcional (flecha o chevron)

### Efectos y Animaciones

- **Entrada de cards**: `animate-fade-in` o `animate-slide-up` con delays escalonados
- **Hover en card**: 
  - Elevación de sombra (`shadow-lg` → `shadow-xl`)
  - Escalado sutil (`scale-[1.02]`)
  - Transición suave de colores
- **Hover en botones**: 
  - Efecto shimmer
  - Rotación de iconos
  - Cambio de gradiente

### Filtros y Búsqueda (Opcional)

Si incluyes barra de filtros:
- **Input de búsqueda**: 
  - Fondo blanco con borde sutil
  - Icono de búsqueda
  - Placeholder: "Buscar proyectos..."
  
- **Filtros**:
  - Dropdowns o chips
  - Colores de marca en estados activos
  - Estilo consistente con el resto de la UI

### Paginación (Opcional)

- Botones numerados
- Estilo minimalista
- Color de marca en página activa
- Hover states sutiles

---

## Elementos Específicos a Incluir

### 1. Header de la Página
- Título: "Proyectos Disponibles" o "Explorar Proyectos"
- Subtítulo opcional con el slogan "Pioneros del Mañana"
- Fondo con gradiente sutil de colores de marca

### 2. Fondo Decorativo
- Círculos difuminados con colores de marca (`blur-3xl`)
- Animación float sutil
- Posicionados en esquinas (top-right, bottom-left)

### 3. Estados Vacíos
- Mensaje amigable cuando no hay proyectos
- Icono ilustrativo
- Call-to-action para volver o explorar

### 4. Loading States
- Skeleton loaders con el mismo layout de las cards
- Animación pulse sutil
- Colores de marca en versión desaturada

---

## Principios de Diseño

1. **Consistencia**: Mantener el mismo lenguaje visual de la vista de detalles
2. **Jerarquía**: Información más importante (precio, disponibilidad) debe destacar
3. **Legibilidad**: Contraste adecuado, tamaños de fuente apropiados
4. **Accesibilidad**: Estados hover claros, contraste WCAG AA mínimo
5. **Responsive**: Adaptación fluida a todos los tamaños de pantalla
6. **Performance visual**: Animaciones suaves pero no excesivas

---

## Paleta de Estilos Tailwind a Usar

```css
/* Colores */
bg-custom-marca-boton (#6e6c35)
bg-custom-marca-boton-variante (#44482c)
bg-custom-marca-boton-variante2 (#849b50)
bg-custom-marca-boton-alterno (#b1c181)
bg-custom-marca-boton-alterno2 (#e8d79a)
text-custom-dark (#333333)

/* Tipografía */
font-jostBold
font-jostRegular
font-champane (para slogan)

/* Efectos */
rounded-xl, rounded-lg
shadow-lg, shadow-xl
backdrop-blur-sm
bg-gradient-to-br, bg-gradient-to-r

/* Animaciones */
animate-fade-in
animate-slide-up
animate-scale-in
animate-shimmer
animate-float
```

---

## Ejemplo de Estructura de Card

```
┌─────────────────────────────────┐
│  [Imagen con overlay]           │
│  [Badge: Certificado]           │
├─────────────────────────────────┤
│  Título del Proyecto            │
│  📍 Ubicación                   │
│  [Badge: Categoría]             │
├─────────────────────────────────┤
│  💰 $1.25 USD / TOKEN           │
│  📊 450,000 TOKENS disponibles  │
│  📈 ROI: 125%                   │
│  [Barra de progreso]            │
│  [Badge: Tokens Verdes/Grises]  │
├─────────────────────────────────┤
│  [Botón: Ver Detalles →]        │
└─────────────────────────────────┘
```

---

## Notas Finales

- La interfaz debe transmitir **confianza, innovación y sostenibilidad**
- Usar **espaciado generoso** para respirabilidad visual
- **Microinteracciones** sutiles pero presentes
- **Iconografía** consistente (SVG minimalista)
- Mantener la **identidad visual** de Terrasacha en todos los elementos
- El diseño debe sentirse **premium pero accesible**

---

**Objetivo**: Crear una interfaz de lista de proyectos que sea visualmente atractiva, informativa y que invite a los usuarios a explorar y conocer más sobre cada proyecto de inversión sostenible, manteniendo la coherencia con la vista de detalles existente y los valores de marca de Terrasacha.


