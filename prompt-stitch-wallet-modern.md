# Prompt para Stitch: Rediseño Moderno de Interfaz de Wallet

## Contexto de la Aplicación
Diseña una interfaz moderna e innovadora para un dashboard de billetera digital (wallet) de Cardano. La aplicación es parte de Terrasacha, una plataforma enfocada en sostenibilidad e innovación tecnológica. El usuario necesita gestionar sus activos digitales, visualizar transacciones y monitorear su balance de ADA (la criptomoneda de Cardano).

## Paleta de Colores - Terrasacha
**Colores Principales:**
- Verde Selva (Primary): #6e6c35 (RGB: 109, 110, 53)
- Verde Bosques Nublados: #44482c (RGB: 68, 72, 44)
- Verde Pradera: #849b50 (RGB: 132, 155, 80)
- Verde Claro: #b1c181 (RGB: 177, 193, 129)
- Amarillo Tierra: #e8d79a (RGB: 232, 215, 154)

**Uso de Colores:**
- Los gradientes deben usar estos verdes de forma armoniosa
- El amarillo tierra puede usarse como acento para elementos destacados
- Mantener buen contraste para legibilidad

## Elementos que Debe Incluir la Interfaz

### 1. Header/Dashboard Overview
- Título: "Cuadro de Mando" o "Wallet Dashboard"
- Icono representativo (puede ser un ícono de billetera o dashboard)
- Subtítulo descriptivo

### 2. Card de Cuenta/Balance Principal
- Avatar/Iniciales del usuario (círculo con iniciales)
- Nombre de la billetera: "Mi billetera"
- Dirección de billetera (dirección larga de Cardano, debe ser truncable)
- Botones de acción: Copiar dirección, Ver en explorador
- Balance principal en ADA (grande y destacado)
- Toggle para mostrar/ocultar saldo
- Efecto shimmer sutil en el fondo del card

### 3. Sección de Transacciones
- Título: "Transacciones" o "Historial de Transacciones"
- Lista de transacciones recientes (máximo 8 visibles)
- Cada transacción debe mostrar: tipo, cantidad, fecha, estado
- Botón de refrescar/actualizar
- Paginación si hay más transacciones
- Estado vacío cuando no hay transacciones

### 4. Sección de Activos
- Título: "Activos" o "Mis Tokens"
- Gráfico de distribución (pie chart) de los activos
- Lista de tokens con: nombre, cantidad, valor
- Estado vacío cuando no hay activos

### 5. Componente ClaimTokens (Opcional)
- Puede ser un banner o card pequeño para reclamar tokens pendientes

## Requisitos de Diseño

### Estilo Visual
- **Moderno y Minimalista**: Diseño limpio, sin elementos innecesarios
- **No Pesado**: Evitar saturación visual, usar espacios en blanco generosamente
- **Bien Organizado**: Jerarquía visual clara, agrupación lógica de información
- **Innovador**: Usar técnicas modernas de UI/UX (glassmorphism sutil, microinteracciones, animaciones suaves)

### Principios de Diseño
1. **Espaciado Generoso**: Márgenes y padding amplios para respirar
2. **Jerarquía Visual Clara**: Usar tamaño, peso y color para establecer importancia
3. **Agrupación Lógica**: Elementos relacionados deben estar cerca visualmente
4. **Feedback Visual**: Estados hover, active, loading claramente diferenciados
5. **Consistencia**: Mismo estilo de cards, botones y elementos interactivos

### Animaciones y Efectos
- Animaciones suaves y sutiles (no distractoras)
- Efecto shimmer sutil en elementos destacados
- Transiciones suaves en hover
- Animaciones de entrada escalonadas para elementos de lista
- Efectos de float/flotación para elementos decorativos de fondo

### Layout y Organización
- **Grid Responsive**: Adaptable a diferentes tamaños de pantalla
- **Cards Modulares**: Cada sección en su propio card independiente
- **Espaciado Vertical**: Usar espacio vertical para separar secciones importantes
- **Agrupación Inteligente**: Balance principal destacado, transacciones y activos en secciones secundarias

## Mejoras de UX Deseadas

### 1. Información a Primera Vista
- Balance principal debe ser lo más visible
- Métricas clave (total ADA, valor USD estimado) fácilmente accesibles
- Estado de sincronización visible pero discreto

### 2. Navegación y Acciones
- Acciones principales (copiar, ver en explorador) fácilmente accesibles
- Botones con estados claros (hover, active, disabled)
- Feedback inmediato en acciones (toasts, cambios visuales)

### 3. Visualización de Datos
- Gráficos y visualizaciones claras y comprensibles
- Listas con suficiente espacio entre elementos
- Información truncada con opción de ver completa

### 4. Estados de la Interfaz
- Loading states elegantes (skeletons, spinners sutiles)
- Empty states informativos y útiles
- Error states claros pero no alarmantes

## Especificaciones Técnicas

### Tipografía
- Fuente Principal: Jost (Bold para títulos, Regular para texto)
- Tamaños: Títulos grandes (2xl-3xl), Subtítulos (sm), Texto base (sm-base)

### Componentes Reutilizables
- Cards con bordes redondeados (rounded-xl o rounded-2xl)
- Botones con gradientes de Terrasacha
- Inputs con estados de focus claros
- Badges y etiquetas para estados

### Efectos Visuales
- Sombras suaves (shadow-md, shadow-lg)
- Bordes sutiles (border-gray-100/50)
- Backdrop blur donde sea apropiado
- Gradientes de Terrasacha en elementos destacados

## Inspiración de Estilo
- Dashboard modernos de fintech (Stripe, Revolut, N26)
- Interfaces de wallets de criptomonedas modernas
- Diseño minimalista tipo Apple
- Glassmorphism sutil (no excesivo)
- Neumorphism muy sutil (solo en elementos específicos)

## Restricciones
- NO usar colores que no sean de la paleta Terrasacha
- NO saturar con demasiados efectos visuales
- NO hacer la interfaz demasiado "pesada" visualmente
- Mantener legibilidad y accesibilidad
- Respetar la identidad de marca Terrasacha

## Resultado Esperado
Una interfaz de wallet moderna, limpia, bien organizada y que mejore significativamente la experiencia de usuario, haciendo que la gestión de activos digitales sea intuitiva, agradable y eficiente. La interfaz debe sentirse premium pero accesible, innovadora pero familiar.

