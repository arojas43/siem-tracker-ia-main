# Nova Logistics Web React

Sistema de gestión logística desarrollado con React, TypeScript y Vite para el seguimiento y administración de operaciones de importación/exportación.

## 📋 Descripción del Proyecto

Nova Logistics es una aplicación web moderna diseñada para la gestión integral de operaciones logísticas. El sistema permite a diferentes tipos de usuarios (SIEM y Clientes) realizar el seguimiento completo de operaciones de comercio exterior, desde la creación hasta la finalización, incluyendo gestión de documentos, fases, tareas y reportes.

## 🚀 Inicio Rápido

### Pasos para levantar el contenedor

#### 1. Construir la imagen Docker
Primero necesitas construir la imagen. El Dockerfile requiere un argumento `stage` que puede ser `dev`, `qa`, o `prod`:

```bash
# Para desarrollo
docker build --build-arg stage=dev -t nova-logistics-web .

# Para QA
docker build --build-arg stage=qa -t nova-logistics-web .

# Para producción
docker build --build-arg stage=prod -t nova-logistics-web .
```

#### 2. Ejecutar el contenedor
Una vez construida la imagen, puedes ejecutar el contenedor:

```bash
# Ejecutar el contenedor
docker run -d -p 8080:8080 --name nova-logistics-container nova-logistics-web
```

#### 3. Verificar que funciona
El contenedor estará disponible en: http://localhost:8080

#### Comando completo recomendado
Para desarrollo, te sugerimos usar este comando completo:

```bash
# Construir y ejecutar en un solo paso
docker build --build-arg stage=dev -t nova-logistics-web . && \
docker run -d -p 8080:8080 --name nova-logistics-container nova-logistics-web && \
docker logs -f -t nova-logistics-container
```

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

- **Frontend**: React 18.3.1 con TypeScript
- **Build Tool**: Vite 6.0.1
- **Estado Global**: Redux Toolkit con Redux Persist
- **Routing**: React Router DOM v7
- **UI Framework**: React Bootstrap 2.10.6
- **Estilos**: SCSS con módulos CSS
- **Gráficos**: Chart.js con React-ChartJS-2
- **Mapas**: Google Maps API
- **PDF**: React-PDF para visualización de documentos
- **Validación**: Formularios con validación integrada

### Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
├── pages/               # Páginas principales del sistema
├── store/               # Estado global con Redux
├── hooks/               # Hooks personalizados
├── utils/               # Utilidades y helpers
├── assets/              # Recursos estáticos
└── environments/        # Configuración de entornos
```

## 🚀 Funcionalidades Principales

### 1. Sistema de Autenticación
- Login seguro con JWT
- Renovación automática de tokens
- Rutas protegidas con `PrivateRoute`
- Gestión de sesiones persistentes

### 2. Gestión de Operaciones
- **Creación de operaciones**: Formularios completos para nuevas operaciones
- **Seguimiento de fases**: Control de etapas del proceso logístico
- **Gestión de tareas**: Asignación y seguimiento de tareas por fase
- **Documentos**: Carga, visualización y gestión de documentos PDF
- **Imágenes**: Gestión de imágenes relacionadas con operaciones
- **Fechas importantes**: Control de fechas críticas del proceso

### 3. Gestión de Entidades
- **Clientes**: CRUD completo de clientes
- **Proveedores**: Administración de proveedores
- **Aduanas**: Gestión de información aduanera
- **Usuarios**: Administración de usuarios del sistema

### 4. Sistema de Reportes
- **Reportes personalizables**: Configuración de columnas visibles
- **Filtros avanzados**: Múltiples criterios de filtrado
- **Exportación**: Exportación a Excel
- **Templates**: Plantillas predefinidas de reportes

### 5. Dashboard y Widgets
- **Widgets informativos**: Métricas clave del sistema
- **Vistas diferenciadas**: Interfaces específicas para SIEM y Clientes
- **Semaforización**: Indicadores visuales de estado de operaciones

## 👥 Tipos de Usuario

### SIEM (Sistema Interno)
- Acceso completo a todas las funcionalidades
- Gestión de operaciones internas
- Administración de usuarios y entidades
- Acceso a reportes avanzados

### Cliente
- Vista limitada a sus propias operaciones
- Seguimiento de estado de operaciones
- Acceso a documentos relacionados
- Interfaz simplificada

## 🛠️ Componentes Principales

### Componentes Reutilizables
- **Toaster**: Sistema de notificaciones
- **StatusBadge**: Indicadores de estado
- **TableSearchBar**: Búsqueda en tablas
- **TablePagination**: Paginación de tablas
- **PDFPreviewModal**: Visualizador de PDFs
- **ConfirmationModal**: Modales de confirmación
- **GoogleMapsContainer**: Integración con Google Maps
- **BulkUploadModal**: Carga masiva de archivos

### Componentes de UI
- **SiemLogo**: Logo de la empresa
- **BackButton**: Botón de navegación
- **NewOperationButton**: Botón para nuevas operaciones
- **ActionModalContainer**: Contenedor de modales de acción

## 📊 Gestión de Estado

### Redux Store
- **Authentication**: Estado de autenticación
- **UserInfo**: Información del usuario
- **Operations**: Gestión de operaciones
- **ClientOperations**: Operaciones específicas de clientes
- **AppState**: Estado general de la aplicación
- **VisibleReportingColumns**: Configuración de columnas de reportes

### APIs Integradas
- **authApi**: Autenticación y login
- **operationApi**: Gestión de operaciones
- **userApi**: Gestión de usuarios
- **documentApi**: Gestión de documentos
- **zipDocumentApi**: Compresión de documentos

## 🎨 Sistema de Diseño

### Estilos
- **SCSS Modules**: Estilos modulares por componente
- **Variables globales**: Sistema de variables centralizadas
- **Mixins**: Funciones reutilizables de estilos
- **Responsive**: Diseño adaptativo para móviles y desktop

### Tema
- Colores corporativos de SIEM
- Tipografía consistente
- Iconografía con React Icons
- Componentes Bootstrap personalizados

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Servidor de desarrollo

# Construcción
npm run build:dev          # Build para desarrollo
npm run build:qa           # Build para QA
npm run build:prod         # Build para producción

# Calidad de código
npm run lint               # Linting con ESLint
npm run preview            # Preview del build

# Servidor estático
npm run serve              # Servir archivos estáticos
```

## 🌐 Configuración de Entornos

El proyecto utiliza diferentes configuraciones según el entorno:

- **Desarrollo**: `VITE_API_ENDPOINT` para desarrollo local
- **QA**: Configuración para ambiente de pruebas
- **Producción**: Configuración optimizada para producción

## 📱 Características Responsive

- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Navegación adaptativa**: Menú colapsable en móviles
- **Tablas responsivas**: Adaptación de tablas a pantallas pequeñas
- **Formularios optimizados**: Mejor experiencia en touch devices

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con renovación automática
- **Rutas protegidas**: Control de acceso basado en autenticación
- **Validación de formularios**: Validación tanto en cliente como servidor
- **Sanitización de datos**: Limpieza de datos de entrada

## 📈 Rendimiento

- **Lazy Loading**: Carga diferida de componentes
- **Code Splitting**: División del código por rutas
- **Optimización de imágenes**: Compresión y optimización automática
- **Caching**: Cache inteligente con Redux Persist

## 🧪 Testing

```bash
npm run test               # Ejecutar tests (pendiente de implementación)
npm run test:no-watch      # Tests sin modo watch
```

## 🚀 Despliegue

### Docker
El proyecto incluye configuración Docker para despliegue con soporte para múltiples entornos:

```bash
# Construir imagen para diferentes entornos
docker build --build-arg stage=dev -t nova-logistics-web:dev .
docker build --build-arg stage=qa -t nova-logistics-web:qa .
docker build --build-arg stage=prod -t nova-logistics-web:prod .

# Ejecutar contenedor
docker run -d -p 8080:8080 --name nova-logistics-container nova-logistics-web:dev

# Ver logs del contenedor
docker logs -f -t nova-logistics-container
```

### CI/CD
- **Cloud Build**: Configuración para Google Cloud Platform
- **Múltiples ambientes**: Desarrollo, QA y Producción
- **Despliegue automático**: Pipeline de CI/CD configurado

## 📚 Documentación Adicional

### Estructura de Rutas
- `/login` - Página de inicio de sesión
- `/home` - Dashboard principal
- `/operations` - Gestión de operaciones
- `/clients` - Gestión de clientes
- `/suppliers` - Gestión de proveedores
- `/customs` - Gestión de aduanas
- `/tasks` - Gestión de tareas
- `/reporting` - Sistema de reportes
- `/help` - Página de ayuda

### Convenciones de Código
- **TypeScript**: Tipado estricto en todo el proyecto
- **ESLint**: Reglas de linting configuradas
- **Prettier**: Formateo automático de código
- **Husky**: Git hooks para calidad de código

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es propiedad de SIEM y está destinado para uso interno de la empresa.

## 🆘 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo interno.
