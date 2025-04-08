# Plataforma para la Gestión de Torneos

## Descripción
La **Plataforma para la Gestión de Torneos** es una aplicación web diseñada para optimizar la administración de torneos deportivos y de esports en la Universidad de Antioquia. Permite a los organizadores gestionar inscripciones, programar partidos, automatizar emparejamientos y visualizar estadísticas de manera eficiente.

## Tecnologías Utilizadas
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Base de Datos:** MongoDB con Mongoose
- **Gestión de Estados:** Context API / Redux (según necesidad)
- **Autenticación:** JWT (JSON Web Tokens)
- **Estilos:** Tailwind CSS / Material UI / Ant Design
- **Herramientas de Desarrollo:** Trello (Gestión Ágil), GitHub (Control de Versiones), Figma (Mockups)

## Estructura del Proyecto
📦 gestion-torneos  
┣ 📂 backend  
┃ ┣ 📂 config/ # Configuración de la BD  
┃ ┣ 📂 controllers/ # Lógica del negocio  
┃ ┣ 📂 models/ # Modelos de la base de datos  
┃ ┣ 📂 routes/ # Endpoints de la API  
┃ ┣ 📜 server.js # Punto de entrada del servidor  
┃ ┗ 📜 .env # Variables de entorno  
┣ 📂 frontend  
┃ ┣ 📂 src/  
┃ ┃ ┣ 📂 components/ # Componentes reutilizables  
┃ ┃ ┣ 📂 pages/ # Páginas principales  
┃ ┃ ┣ 📂 services/ # Conexión con API  
┃ ┣ 📜 App.jsx # Componente principal  
┃ ┣ 📜 main.jsx # Punto de entrada  
┣ 📜 README.md # Documentación  
┣ 📜 .gitignore # Archivos ignorados en Git  
┗ 📜 package.json # Dependencias del proyecto 

## Instalación y Configuración
### **1. Clonar el Repositorio**
```sh
git clone https://github.com/Nicolas-carmona16/gestion-torneos.git
cd gestion-torneos
```
### **2. Configurar el Backend**
```
cd backend
npm install
# Configurar variables de entorno (crear archivo .env)
npm run dev
```
#### 2.1. Ver documentación del backend
```
# Debe estar en la carpeta del backend y no en la raiz
npm run doc
# Abrir el index.html que esta en backend/docs
```
### **3. Configurar el Frontend**
```
cd ../frontend
npm install
# Configurar variables de entorno (crear archivo .env)
npm run dev
```
#### 3.1. Ver documentación del frontend
```
# Debe estar en la carpeta del frontend y no en la raiz
npm run doc
# Abrir el index.html que esta en backend/docs
```

## Funcionalidades clave
- Registro e inicio de sesión de usuarios
- Creación y gestión de torneos
- Inscripción de equipos y participantes
- Emparejamientos automáticos
- Visualización de estadísticas y reportes
- Personalización de reglas y criterios de desempate


testing...