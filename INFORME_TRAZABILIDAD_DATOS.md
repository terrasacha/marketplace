# Informe de Trazabilidad de Datos
## Marketplace Terrasacha - Plataforma Principal

Este documento muestra de dónde proviene cada información que se muestra en el Marketplace, estableciendo la trazabilidad entre la Plataforma Principal y el Marketplace.

---

## 📋 Información Básica del Proyecto

| **Información Mostrada** | **Origen en Plataforma** | **Campo/Feature ID** |
|--------------------------|---------------------------|----------------------|
| **ID del Proyecto** | Entidad `Product` | `product.id` |
| **Nombre del Proyecto** | Entidad `Product` | `product.name` |
| **Descripción** | Entidad `Product` | `product.description` |
| **Categoría** | Entidad `Product` → Relación `Category` | `product.categoryID` / `product.category.name` |
| **Estado del Proyecto** | Entidad `Product` | `product.status` |
| **Tokens Verdes/Grises** | Entidad `Product` | `product.tokenGenesis` |

---

## 📍 Información de Ubicación

| **Información Mostrada** | **Origen en Plataforma** | **Campo/Feature ID** | **Nota** |
|--------------------------|---------------------------|----------------------|----------|
| **Municipio** | `ProductFeature` | `A_municipio` | ⚠️ Opcional - Si no existe, se muestra vacío |
| **Vereda** | `ProductFeature` | `A_vereda` | ⚠️ Opcional - Si no existe, se muestra vacío |
| **Departamento** | Entidad `Property` | `product.properties.items[0].department` | ⚠️ Opcional - Si no existe, se muestra vacío |
| **Coordenadas (Mapa)** | `ProductFeature` | `C_ubicacion` | ✅ Ejemplo: "4.6097, -74.0817 0 0" |

---

## 🖼️ Información Visual

| **Información Mostrada** | **Origen en Plataforma** | **Campo/Feature ID** |
|--------------------------|---------------------------|----------------------|
| **Imagen Principal** | Entidad `Image` | `product.images.items[0].imageURL` |

---

## 💰 Información de Tokens

| **Información Mostrada** | **Origen en Plataforma** | **Campo/Feature ID** |
|--------------------------|---------------------------|----------------------|
| **Nombre del Token** | `ProductFeature` | `GLOBAL_TOKEN_NAME` | ⚠️ Opcional - Si no existe, usa el nombre del proyecto (sin "Proyecto - ") |
| **Moneda del Token** | `ProductFeature` | `GLOBAL_TOKEN_CURRENCY` | ✅ Ejemplo: "USD" |
| **Total de Tokens** | `ProductFeature` | `GLOBAL_TOKEN_TOTAL_AMOUNT` | ✅ Ejemplo: "3550000" - Si no existe, calcula desde `GLOBAL_TOKEN_HISTORICAL_DATA` |
| **Precio Actual** | `ProductFeature` → Calculado | `GLOBAL_TOKEN_HISTORICAL_DATA` (período actual) |
| **Tokens Disponibles** | Calculado | `GLOBAL_TOKEN_TOTAL_AMOUNT` - `GLOBAL_TOKEN_AMOUNT_DISTRIBUTION` |
| **Tokens Distribuidos** | `ProductFeature` | `GLOBAL_TOKEN_AMOUNT_DISTRIBUTION` (suma de CANTIDAD) |
| **ROI (Retorno de Inversión)** | `ProductFeature` | `GLOBAL_INDICADORES_FINANCIEROS_TOKEN` | ✅ JSON parseado - Extrae el campo `roi` del primer elemento |
| **Histórico de Precios** | `ProductFeature` | `GLOBAL_TOKEN_HISTORICAL_DATA` (todos los períodos) |
| **Emisión por Período** | `ProductFeature` | `GLOBAL_TOKEN_HISTORICAL_DATA` (period, date, amount, price) | ✅ JSON parseado - Array con períodos, fechas, cantidades y precios |

---

## 👤 Información del Postulante

| **Información Mostrada** | **Origen en Plataforma** | **Campo/Feature ID** |
|--------------------------|---------------------------|----------------------|
| **Nombre del Postulante** | `ProductFeature` | `A_postulante_name` | ✅ Ejemplo: "Postulante Simulado" |

---

## ✅ Información de Certificación

| **Información Mostrada** | **Origen en Plataforma** | **Campo/Feature ID** |
|--------------------------|---------------------------|----------------------|
| **Tiene Certificado** | `ProductFeature` | `GLOBAL_PROJECT_VALIDATOR_FILES` (verifica si existe y tiene archivos) |

---

## 🌱 Información de Impacto Sostenible

| **Información Mostrada** | **Origen en Plataforma** | **Campo/Feature ID** | **Nota** |
|--------------------------|---------------------------|----------------------|----------|
| **Nacimientos de Agua** | `ProductFeature` | `F_nacimiento_agua` (parseado) | ⚠️ Opcional - Si no existe, el componente no se muestra |
| **Proyectos de Conservación** | `ProductFeature` | `F_nacimiento_agua` → `F_conservacion_desc` | ⚠️ Opcional - Dentro del JSON parseado |
| **Biodiversidad (Fauna/Flora)** | `ProductFeature` | `F_nacimiento_agua` → `F_especies_fauna`, `F_especies_flora`, etc. | ⚠️ Opcional - Dentro del JSON parseado |
| **Asistencia Técnica** | `ProductFeature` | `H_asistance_desc` | ⚠️ Opcional - Si no existe, el componente no se muestra |
| **Aliados Estratégicos** | `ProductFeature` | `H_aliados_estrategicos_desc` | ⚠️ Opcional - Si no existe, el componente no se muestra |
| **Grupos Comunitarios** | `ProductFeature` | `H_grupo_comunitario_desc` | ⚠️ Opcional - Si no existe, el componente no se muestra |

---

## 📊 Resumen de Estructura de Datos

### Entidades Principales de la Plataforma:

1. **`Product`** - Entidad principal del proyecto
   - Contiene: id, name, description, status, categoryID, tokenGenesis, etc.

2. **`ProductFeature`** - Características específicas del proyecto
   - Cada feature tiene un `featureID` único que identifica el tipo de dato
   - El `value` contiene la información (puede ser texto, JSON, etc.)

3. **`Category`** - Categoría del proyecto
   - Relacionada con `Product` a través de `categoryID`

4. **`Image`** - Imágenes del proyecto
   - Relacionadas con `Product` a través de `images.items[]`

5. **`Property`** - Propiedades del proyecto
   - Relacionadas con `Product` a través de `properties.items[]`

---

## 🔄 Flujo de Datos

```
PLATAFORMA PRINCIPAL
    ↓
GraphQL API (AWS Amplify)
    ↓
Marketplace (Next.js)
    ↓
Mappers (Transformación de datos)
    ↓
Componentes de Visualización
    ↓
Interfaz del Usuario
```

---

## 📝 Notas Importantes

1. **Datos Opcionales**: Algunos campos pueden no existir en todos los proyectos. En esos casos:
   - Se muestran valores por defecto (ej: USD para moneda, imagen por defecto)
   - El componente no se renderiza si no hay datos suficientes (ej: MockupSustainableImpact)
   - Se muestran campos vacíos si no hay información (ej: municipio, vereda)

2. **Datos Calculados**: Algunos valores se calculan a partir de otros datos:
   - **Tokens Disponibles** = `GLOBAL_TOKEN_TOTAL_AMOUNT` - Suma de `GLOBAL_TOKEN_AMOUNT_DISTRIBUTION`
   - **Precio Actual** = Precio del período actual en `GLOBAL_TOKEN_HISTORICAL_DATA` (basado en fecha actual)
   - **Progreso** = (Tokens Distribuidos / Total Tokens) × 100

3. **Datos Parseados**: Algunos `ProductFeature` contienen JSON que debe ser parseado:
   - `GLOBAL_TOKEN_HISTORICAL_DATA` → Array de objetos con: `period`, `date`, `price`, `amount`, `tir`, `investment`
   - `GLOBAL_TOKEN_AMOUNT_DISTRIBUTION` → Array de objetos con: `CONCEPTO`, `CANTIDAD`, `propertyDistribution`
   - `GLOBAL_INDICADORES_FINANCIEROS_TOKEN` → Array de objetos con: `CONCEPTO`, `CANTIDAD`, `UNIDAD`
   - `F_nacimiento_agua` → Objeto serializado con múltiples campos (requiere `parseSerializedKoboData`)

4. **Fallbacks**: Si un dato no existe, se usan valores por defecto:
   - `GLOBAL_TOKEN_NAME` → Si no existe, usa `product.name` sin el prefijo "Proyecto - "
   - `GLOBAL_TOKEN_TOTAL_AMOUNT` → Si no existe, calcula sumando los `amount` de `GLOBAL_TOKEN_HISTORICAL_DATA`
   - `GLOBAL_TOKEN_CURRENCY` → Si no existe, usa "USD" por defecto

5. **Datos Reales del Proyecto "Mundo Verde"** (basado en logs):
   - ✅ **Existen**: `GLOBAL_TOKEN_TOTAL_AMOUNT` (3550000), `GLOBAL_TOKEN_CURRENCY` (USD), `GLOBAL_TOKEN_HISTORICAL_DATA`, `GLOBAL_TOKEN_AMOUNT_DISTRIBUTION`, `GLOBAL_INDICADORES_FINANCIEROS_TOKEN`, `C_ubicacion`, `A_postulante_name`
   - ❌ **No existen**: `GLOBAL_TOKEN_NAME`, `A_municipio`, `A_vereda`, `department` (en properties), `F_nacimiento_agua`, `H_asistance_desc`, `H_aliados_estrategicos_desc`, `H_grupo_comunitario_desc`

---

## 🔍 Ubicación de los Mappers

Los mappers que realizan la transformación de datos se encuentran en:
- **Archivo**: `apps/terrasacha-marketplace/lib/mappers.ts`
- **Funciones principales**:
  - `mapProductToProjectInterface()` - Para lista de proyectos
  - `mapProductToProjectDetailData()` - Para detalle del proyecto

---

## 📌 Componentes que Usan los Datos

| **Componente** | **Datos que Muestra** | **Estado en Proyecto Real** |
|----------------|----------------------|----------------------------|
| `MockupProjectsList` | Lista de proyectos (información básica, precio, tokens disponibles) | ✅ Funciona - Muestra datos reales |
| `MockupProjectDetail` | Detalle principal del proyecto (nombre, descripción, imagen, estado) | ✅ Funciona - Muestra datos reales |
| `MockupTokenDetails` | Detalles del token (total, precio actual, disponibles, ROI) | ✅ Funciona - Usa `GLOBAL_TOKEN_TOTAL_AMOUNT` (3550000) |
| `MockupPriceHistory` | Histórico de precios por período | ✅ Funciona - Muestra períodos de `GLOBAL_TOKEN_HISTORICAL_DATA` |
| `MockupTokenEmission` | Tabla de emisión de tokens por período | ✅ Funciona - Muestra períodos con fechas y cantidades |
| `MockupLocationMap` | Mapa con ubicación del proyecto | ✅ Funciona - Muestra coordenadas de `C_ubicacion` |
| `MockupSustainableImpact` | Información de impacto sostenible | ⚠️ No se muestra - No hay datos (`F_nacimiento_agua`, `H_*` no existen) |

---

## 📦 Datos Disponibles pero No Mostrados (Oportunidades Futuras)

Estos datos existen en la Plataforma pero actualmente no se muestran en el Marketplace:

| **Dato** | **Feature ID** | **Contenido** | **Uso Potencial** |
|----------|---------------|---------------|-------------------|
| **Indicadores Financieros del Proyecto** | `GLOBAL_INDICADORES_FINANCIEROS` | Relación Beneficio-Costo, Inversión, TIR | Mostrar indicadores financieros generales |
| **Ingresos por Producto** | `GLOBAL_INGRESOS_POR_PRODUCTO` | Array con conceptos (CARBONO FORESTAL, MADERA) | Mostrar productos que generan ingresos |
| **Productos del Ciclo** | `GLOBAL_PRODUCTOS_DEL_CICLO_DE_PROYECTO` | Array con conceptos (CARBONO REDD, MADERA) | Mostrar productos del ciclo del proyecto |
| **Resumen Flujo de Caja** | `GLOBAL_RESUMEN_FLUJO_DE_CAJA` | Objeto con flujos por año | Mostrar gráfico de flujo de caja |
| **Propietarios** | `B_owners` | Array con información de propietarios | Mostrar información de propietarios |

---

**Fecha de creación**: Diciembre 2024  
**Versión**: 1.0

