# Gestor de Gastos para Proyectos Comunitarios

Una aplicación web progresiva (PWA) moderna, intuitiva y potente, diseñada para simplificar la gestión financiera de proyectos comunitarios. Digitaliza facturas y recibos en segundos usando inteligencia artificial, permitiendo un seguimiento, control y reporte de gastos eficiente y transparente.

![Captura de pantalla de la aplicación (Sugerencia: añade una imagen aquí)](https://via.placeholder.com/800x450.png?text=Vista+Previa+de+la+App)

---

## 🚀 Características Principales

- **Gestión Multi-proyecto**: Administra múltiples proyectos de forma independiente desde una pantalla de inicio centralizada.
- **Control de Presupuesto Detallado**: Define un presupuesto total y desglósalo por ítems. Visualiza métricas en tiempo real: Presupuesto Total, Ejecutado y Saldo Disponible.
- **Extracción de Datos Avanzada (IA/OCR)**: Digitaliza facturas y recibos (PDF o Imágenes). Elige entre procesamiento local (privacidad total) o en la nube (máxima precisión).
- **Organización por Fases**: Estructura tus proyectos en fases (ej. Fundaciones, Electricidad, Acabados) para un control de gastos segmentado.
- **Exportación Versátil**: Genera reportes en formato Excel (.xlsx) para análisis contable o exporta la base de datos completa en JSON para respaldos.
- **Reportes y Reportaje**: Resúmenes detallados con desglose por fases, optimizados para impresión física o guardado en PDF.
- **Versión de Escritorio**: Además de ser una PWA, incluye un instalador nativo para Windows basado en Electron para un acceso más robusto.
- **Prevención de Errores**: Sistema de alertas para facturas duplicadas y validación de montos según el presupuesto disponible.
- **Privacidad y Seguridad Local**: Tus datos financieros no viajan a servidores externos; todo se almacena de forma segura en tu propio dispositivo.
- **Diseño Premium y Responsivo**: Interfaz moderna con soporte nativo para dispositivos móviles y computadoras, con micro-animaciones y visualizaciones claras.

---

## 📖 ¿Cómo Usar la Aplicación? (Para Usuarios)

1.  **Gestión de Proyectos**: Al iniciar, verás un listado de tus proyectos. Puedes crear uno nuevo o seleccionar uno existente.
2.  **Configuración Inicial**: Dentro de un proyecto nuevo, define el nombre de la comunidad, el número de proyecto, el año y el **Presupuesto Total**.
3.  **Configura el Presupuesto**: Usa la pestaña "Presupuesto" para desglosar tus fondos en ítems específicos.
4.  **Crea las Fases**: Añade las etapas de obra (ej: Fundaciones, Mano de Obra) para organizar tus gastos.
5.  **Carga de Gastos**: Sube facturas en **PDF o Imagen**. Puedes activar el "Modo Nube" para una lectura más precisa de datos complejos.
6.  **Asigna y Verifica**: Asegúrate de asignar cada factura a una fase. El sistema restará automáticamente el monto del presupuesto disponible.
7.  **Reportes**:
    - Genera el reporte general para ver el estado financiero del proyecto.
    - Exporta a Excel para compartir con la comunidad o entes auditores.

---

## 🛠️ Guía de Instalación y Despliegue (Para Desarrolladores)

Sigue estos pasos para ejecutar el proyecto en tu máquina local y desplegarlo en internet de forma gratuita usando GitHub Pages.

### Prerrequisitos

- **Node.js**: Debes tener Node.js instalado. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
- **Cuenta de GitHub**: Necesaria para desplegar la aplicación.

### Configuración Local

1.  **Clonar el Repositorio**:
    ```bash
    git clone https://github.com/enmaduro/administracion_proyectos.git
    cd administracion_proyectos
    ```

2.  **Instalar Dependencias**:
    ```bash
    npm install
    ```

### Ejecutar en Local

Para iniciar la aplicación en modo de desarrollo en tu máquina:

```bash
npm run dev
```

Esto iniciará un servidor local (normalmente en `http://localhost:5173`). La primera vez que abras la app en tu navegador, te pedirá la clave de API de Gemini.

### Despliegue en GitHub Pages

1.  **Configura tu `package.json`**:
    Abre el archivo `package.json` y modifica la línea `homepage` con tu URL de GitHub Pages.
    ```json
    "homepage": "https://enmaduro.github.io/administracion_proyectos",
    ```

2.  **Configura tu `vite.config.ts`**:
    Asegúrate de que la propiedad `base` en `vite.config.ts` coincida con el nombre de tu repositorio.
    ```typescript
    base: '/administracion_proyectos/'
    ```

3.  **Ejecuta el Comando de Despliegue**:
    Este comando compilará tu aplicación y la subirá a la rama `gh-pages` de tu repositorio.
    ```bash
    npm run deploy
    ```

4.  **Activa GitHub Pages**:
    - Ve a tu repositorio en GitHub y haz clic en **Settings > Pages**.
    - En la sección "Build and deployment", bajo "Source", selecciona la rama **`gh-pages`** y la carpeta **`/(root)`**.
    - Guarda los cambios. Tu sitio estará online en pocos minutos en la URL que configuraste.

---



## 💻 Tecnologías Utilizadas

- **Núcleo**: React 19, TypeScript, Vite
- **Estilos**: Vanilla CSS con Tailwind CSS
- **App de Escritorio**: Electron 33+ (con instalador NSIS)
- **Procesamiento de Facturas**: Tesseract.js (OCR Local) y Google Gemini AI (Cloud OCR)
- **Manejo de PDF y Datos**: PDF.js, XLSX, File-Saver
- **Desarrollo Asistido**: Google Antigravity
- **Despliegue Web**: GitHub Pages
- **Funcionalidad Progresiva**: PWA (Service Workers y Manifiesto)
