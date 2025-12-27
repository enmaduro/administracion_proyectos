# Gestor de Gastos para Proyectos Comunitarios

Una aplicación web progresiva (PWA) moderna, intuitiva y potente, diseñada para simplificar la gestión financiera de proyectos comunitarios. Digitaliza facturas y recibos en segundos usando inteligencia artificial, permitiendo un seguimiento, control y reporte de gastos eficiente y transparente.

![Captura de pantalla de la aplicación (Sugerencia: añade una imagen aquí)](https://via.placeholder.com/800x450.png?text=Vista+Previa+de+la+App)

---

## 🚀 Características Principales

- **Extracción de Datos con IA**: Sube una foto o un PDF de una factura, y la IA de Google Gemini extraerá automáticamente la fecha, proveedor, RIF, número de factura, descripción y monto total.
- **Organización por Fases**: Crea y gestiona fases o etapas del proyecto (ej. "Fundaciones", "Plomería", "Electricidad") y asigna cada gasto a su fase correspondiente.
- **Gestión Completa de Facturas**: Visualiza todos los gastos en una tabla interactiva. Busca por proveedor, filtra por fecha y elimina registros fácilmente.
- **Prevención de Duplicados**: El sistema valida automáticamente que no se ingrese la misma factura dos veces para el mismo proveedor.
- **Reportes y Exportación**:
    - **Resumen General**: Obtén un desglose detallado de los gastos por cada fase y un total general del proyecto.
    - **Impresión**: Imprime tanto la tabla principal de gastos como el resumen general con un formato optimizado.
    - **Exportar a CSV**: Descarga todos los datos de las facturas en un archivo CSV para usarlo en hojas de cálculo como Excel o Google Sheets.
- **Diseño Moderno y Responsivo**: Interfaz limpia, fácil de usar y que se adapta a cualquier dispositivo: teléfonos, tabletas y computadoras.
- **Funcionalidad Offline (PWA)**: Una vez cargada, la aplicación puede funcionar sin conexión a internet. Puede ser "instalada" en la pantalla de inicio de cualquier dispositivo para un acceso rápido, como una app nativa.
- **Almacenamiento Local**: Todos los datos se guardan de forma segura en tu propio dispositivo, garantizando tu privacidad.

---

## 📖 ¿Cómo Usar la Aplicación? (Para Usuarios)

1.  **Configura tu Proyecto**: Al abrir la aplicación, introduce el nombre de tu comunidad, el número de proyecto y el año en la configuración inicial.

3.  **Crea las Fases**: En la pantalla principal, añade las fases o etapas que componen tu proyecto (ej: "Materiales", "Mano de Obra", "Transporte").
3.  **Sube una Factura**: La aplicación permite leer facturas directamente desde archivos **PDF o Imágenes**. Simplemente arrastra el archivo o haz clic en el área de carga. El sistema procesará el documento automáticamente sin necesidad de claves externas.
5.  **Asigna a una Fase**: En la tabla, usa el menú desplegable en cada fila para asignar la factura a la fase correcta.
6.  **Consulta y Reporta**:
    - Usa los filtros para encontrar gastos específicos.
    - Haz clic en el botón "Ver Resumen General" para obtener un reporte completo.
    - Usa los botones "Imprimir" o "Exportar CSV" para generar tus informes.

---

## 🛠️ Guía de Instalación y Despliegue (Para Desarrolladores)

Sigue estos pasos para ejecutar el proyecto en tu máquina local y desplegarlo en internet de forma gratuita usando GitHub Pages.

### Prerrequisitos

- **Node.js**: Debes tener Node.js instalado. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
- **Cuenta de GitHub**: Necesaria para desplegar la aplicación.
- **Clave de API de Gemini**: Obtén una clave de API desde [Google AI Studio](https://aistudio.google.com/app/apikey).

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

- **Frontend**: React, TypeScript, Vite
- **Estilos**: Tailwind CSS
- **IA**: Google Gemini API
- **Despliegue**: GitHub Pages
- **Offline/Instalación**: Progressive Web App (PWA) con Service Workers
