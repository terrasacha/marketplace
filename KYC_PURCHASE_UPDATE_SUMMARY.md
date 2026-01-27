## Resumen de actividades realizadas

- **Análisis de flujo de compra y Epayco**  
  - Se revisó la página de compra de tokens `purchase/index.tsx` y el componente `MockupPurchasePage` para entender el flujo actual de compra FIAT (Epayco) y crypto, así como el uso de `createPayment` y `updatePayment`.

- **Refactor de lógica de compra de tokens**  
  - Se cambió la lógica para que el usuario ingrese la **cantidad de tokens** y el sistema calcule automáticamente el **monto total a pagar** según el `tokenPrice`.  
  - Se reforzó la validación para aceptar solo **números enteros** (sin decimales) y se ocultaron los spinners del input numérico.

- **Integración y visibilidad de KYC (Persona)**  
  - Se reemplazó el flujo antiguo de verificación (Truora) por **Persona** utilizando el SDK incrustado.  
  - Se agregó carga dinámica del script de Persona (`persona-v5.1.2`) y se inicializó el cliente con `templateId` y `environmentId` proporcionados.  
  - Se implementó la función `startPersonaVerification` con callbacks `onReady`, `onComplete`, `onError` y actualización de estado en DynamoDB (`isValidatedStep2`).

- **Estado de validación de usuario en la interfaz de compra**  
  - Se creó estado local `kycStatus` para reflejar `isValidatedStep1` e `isValidatedStep2` obtenidos desde `/api/validations/validUser`.  
  - Se añadió un **banner KYC** en la UI (después del stepper) con tres estados:  
    - No validado: mensaje y botón **“Verificarme Ahora”**.  
    - Validación básica lista pero sin verificación avanzada: mensaje para completar KYC Pro.  
    - Totalmente verificado: badge **“Identidad Verificada”** discreto.

- **Control de acceso al botón de pago**  
  - Se actualizó `validateValidUser` para usar correctamente `isValidatedStep1` / `isValidatedStep2` dependiendo del tipo de pago (FIAT o crypto).  
  - El botón **“Pagar”** queda deshabilitado mientras el usuario no tenga la validación mínima requerida (`isValidatedStep1`) o mientras el flujo KYC esté cargando.

- **Ajustes visuales según Terrasacha Design**  
  - Se aplicaron colores de la paleta de marca (`#6e6c35`, `#44482c`, `#849b50`, `#b1c181`, `#e8d79a`) y fuentes `font-jostRegular` / `font-jostBold`.  
  - Se usaron gradientes y sombras suaves para el banner KYC y botones, manteniendo un estilo **minimalista y coherente** con Terrasacha.

- **Configuración del tamaño del modal de Persona**  
  - Se añadió `containerSize: 'large'` en la inicialización de `Persona.Client` para mostrar el modal de verificación en un tamaño más grande y cómodo para el usuario.





