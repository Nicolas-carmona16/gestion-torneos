# Documentación de Arquitectura del Sistema - Plataforma para la Gestión de Torneos

## Descripción General
Este documento describe la arquitectura completa del sistema de gestión de torneos deportivos y de esports de la Universidad de Antioquia.

## Diagrama de Arquitectura
El diagrama de arquitectura se encuentra en el archivo separado: **`diagrama-arquitectura-sistema.puml`**

## Detalles de la Arquitectura

### **Frontend (React + Vite)**
- **Framework:** React 19.0.0 con Vite 6.2.0
- **UI Library:** Material-UI (MUI) 7.0.0
- **Styling:** Tailwind CSS 3.3.2 + Tema personalizado
- **Routing:** React Router DOM 7.4.0
- **State Management:** Context API + React Hooks
- **HTTP Client:** Axios 1.8.4
- **Form Handling:** Formik 2.4.6 + Yup 1.6.1
- **Date Handling:** Day.js 1.11.13

### **Backend (Node.js + Express)**
- **Runtime:** Node.js con ES Modules
- **Framework:** Express 4.21.2
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 3.0.2
- **Validation:** express-validator 7.2.1
- **Rate Limiting:** express-rate-limit 7.5.0
- **File Upload:** multer 1.4.5
- **Excel Export:** exceljs 4.4.0
- **Documentation:** JSDoc 4.0.4

### **Base de Datos**
- **Database:** MongoDB con Mongoose 8.12.2
- **ODM:** Mongoose para modelado de datos
- **Connection:** Configuración centralizada en `config/db.js`

### **Servicios Externos**
- **Supabase:** Para funcionalidades adicionales
- **JWT:** Para autenticación y autorización

### **Seguridad**
- **CORS:** Configurado para desarrollo local
- **JWT Tokens:** Almacenados en cookies seguras
- **Role-based Access:** Admin, Captain, Assistant
- **Rate Limiting:** Protección contra ataques
- **Input Validation:** Validación en frontend y backend

### **Comunicación**
- **API REST:** Endpoints RESTful
- **HTTP/HTTPS:** Comunicación cliente-servidor
- **JSON:** Formato de datos
- **Cookies:** Para autenticación

## Flujo de Datos

1. **Usuario** interactúa con la **Interfaz React**
2. **Componentes** llaman a **Servicios API**
3. **Servicios** hacen peticiones HTTP al **Backend**
4. **Express** procesa la petición a través de **Middlewares**
5. **Controladores** ejecutan la lógica de negocio
6. **Modelos Mongoose** interactúan con **MongoDB**
7. **Respuesta** regresa por la misma ruta

## Tecnologías Clave

| Capa | Tecnología | Versión | Propósito |
|------|------------|---------|-----------|
| Frontend | React | 19.0.0 | UI Framework |
| Frontend | Vite | 6.2.0 | Build Tool |
| Frontend | Material-UI | 7.0.0 | UI Components |
| Frontend | Tailwind CSS | 3.3.2 | Styling |
| Backend | Node.js | - | Runtime |
| Backend | Express | 4.21.2 | Web Framework |
| Backend | Mongoose | 8.12.2 | ODM |
| Database | MongoDB | - | NoSQL Database |
| Auth | JWT | 9.0.2 | Authentication |
| Validation | Yup | 1.6.1 | Schema Validation |

## Puertos y URLs

- **Frontend:** `http://localhost:5173` (Vite dev server)
- **Backend:** `http://localhost:5000` (Express server)
- **API Base:** `http://localhost:5000/api`
- **MongoDB:** Configurado via variables de entorno

## Variables de Entorno

### Frontend (.env)
```
VITE_BACKEND_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/gestion-torneos
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_key
```

## Estructura de Archivos

### Frontend
```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas principales
│   ├── services/      # Servicios API
│   ├── theme/         # Configuración de tema
│   ├── utils/         # Utilidades
│   ├── App.jsx        # Componente principal
│   └── main.jsx       # Punto de entrada
├── public/            # Archivos estáticos
└── package.json       # Dependencias
```

### Backend
```
backend/
├── config/           # Configuración (DB, Supabase)
├── controllers/      # Lógica de negocio
├── models/          # Modelos de MongoDB
├── routes/          # Endpoints API
├── middlewares/     # Middlewares (Auth, Validation)
├── utils/           # Utilidades (Generadores, Validadores)
├── server.js        # Punto de entrada
└── package.json     # Dependencias
```

---

*Esta documentación representa la arquitectura actual del sistema de gestión de torneos deportivos de la Universidad de Antioquia.* 