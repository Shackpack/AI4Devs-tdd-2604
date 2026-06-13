# Referencia del Proyecto - LTI Talent Tracking System

> **Última actualización:** 2026-06-13
> **Ejercicio:** TDD (Test-Driven Development) - AI4Devs

---

## Resumen Ejecutivo

Sistema full-stack de seguimiento de candidatos (ATS) para gestión de reclutamiento. Permite registrar candidatos con información personal, educación, experiencia laboral y CV.

**Tecnologías:**
- Frontend: React 18 + TypeScript + Bootstrap
- Backend: Express 4 + TypeScript + Prisma ORM
- Base de datos: PostgreSQL
- Testing: Jest (v30 en root, v29 en backend)

---

## Arquitectura del Proyecto

```
AI4Devs-tdd-2604/
├── backend/           # API Express (TypeScript)
│   ├── src/
│   │   ├── domain/        # Modelos (Active Record)
│   │   ├── application/   # Servicios + Validación
│   │   ├── presentation/  # Controladores
│   │   ├── routes/        # Rutas Express
│   │   └── index.ts       # Entry point
│   └── prisma/
│       └── schema.prisma  # Definición DB
├── frontend/          # React SPA (TypeScript/JS)
│   └── src/
│       ├── components/    # UI Components
│       └── services/      # API Client
└── prompts/           # Registro de prompts
```

---

## Estructura de Carpetas Detallada

### Backend (`backend/`)

| Directorio | Archivos | Descripción |
|------------|----------|-------------|
| `src/domain/models/` | Candidate.ts, Education.ts, WorkExperience.ts, Resume.ts | Modelos con patrón Active Record |
| `src/application/services/` | candidateService.ts, fileUploadService.ts | Lógica de negocio |
| `src/application/` | validator.ts | Validaciones con regex españoles |
| `src/presentation/controllers/` | candidateController.ts | Controladores HTTP |
| `src/routes/` | candidateRoutes.ts | Definición de rutas |
| `src/tests/` | tests-abb.tests.ts | Tests (vacío - ejercicio TDD) |
| `prisma/` | schema.prisma | Esquema PostgreSQL |

### Frontend (`frontend/src/`)

| Directorio | Archivos | Descripción |
|------------|----------|-------------|
| `components/` | AddCandidateForm.js, FileUploader.js, RecruiterDashboard.js | Componentes React |
| `services/` | candidateService.js | Cliente API (axios/fetch) |
| `assets/` | - | Recursos estáticos |

---

## Esquema de Base de Datos (Prisma)

```prisma
// PostgreSQL - 4 modelos principales

model Candidate {
  id              Int               @id @default(autoincrement())
  firstName       String            @db.VarChar(100)
  lastName        String            @db.VarChar(100)
  email           String            @unique @db.VarChar(255)
  phone           String?           @db.VarChar(15)
  address         String?           @db.VarChar(100)
  educations      Education[]
  workExperiences WorkExperience[]
  resumes         Resume[]
}

model Education {
  id          Int       @id @default(autoincrement())
  institution String    @db.VarChar(100)
  title       String    @db.VarChar(250)
  startDate   DateTime
  endDate     DateTime?
  candidateId Int
  candidate   Candidate @relation(fields: [candidateId], references: [id])
}

model WorkExperience {
  id          Int       @id @default(autoincrement())
  company     String    @db.VarChar(100)
  position    String    @db.VarChar(100)
  description String?   @db.VarChar(200)
  startDate   DateTime
  endDate     DateTime?
  candidateId Int
  candidate   Candidate @relation(fields: [candidateId], references: [id])
}

model Resume {
  id          Int       @id @default(autoincrement())
  filePath    String    @db.VarChar(500)
  fileType    String    @db.VarChar(50)
  uploadDate  DateTime
  candidateId Int
  candidate   Candidate @relation(fields: [candidateId], references: [id])
}
```

---

## Reglas de Validación

Ubicación: `backend/src/application/validator.ts`

| Campo | Regex/Limitación | Descripción |
|-------|------------------|-------------|
| Nombre | `/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$/` | Solo letras españolas + espacios |
| Longitud nombre | 2-100 caracteres | Min/max length |
| Email | `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` | Formato estándar email |
| Teléfono | `/^(6\|7\|9)\d{8}$/` | Móvil español (9 dígitos, empieza con 6,7,9) |
| Fecha | `/^\d{4}-\d{2}-\d{2}$/` | Formato YYYY-MM-DD |
| Dirección | Max 100 caracteres | Opcional |
| Institución/Empresa | Max 100 caracteres | Obligatorio en educación/experiencia |
| Título/Posición | Max 100 caracteres | Obligatorio |
| Descripción | Max 200 caracteres | Opcional en experiencia |

---

## API Endpoints

| Método | Endpoint | Descripción | Controller |
|--------|----------|-------------|------------|
| POST | `/candidates` | Crear candidato | `addCandidate` |
| POST | `/upload` | Subir CV | `uploadFile` |

### Especificación OpenAPI
- Archivo: `backend/api-spec.yaml`
- Códigos de respuesta: 201 (éxito), 400 (datos inválidos), 500 (error interno)
- Formatos permitidos CV: PDF, DOCX

---

## Dependencias Principales

### Backend (`backend/package.json`)
```json
{
  "express": "^4.19.2",
  "@prisma/client": "^5.13.0",
  "cors": "^2.8.5",
  "multer": "^1.4.5-lts.1",
  "typescript": "^4.9.5",
  "jest": "^29.7.0",
  "ts-jest": "^29.2.5"
}
```

### Frontend (`frontend/package.json`)
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.23.1",
  "bootstrap": "^5.3.3",
  "react-bootstrap": "^2.10.2",
  "react-datepicker": "^6.9.0",
  "typescript": "^4.9.5"
}
```

### Root (`package.json`)
```json
{
  "jest": "^30.4.2"
}
```

---

## Configuración de Entorno

Archivo: `.env`
```
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_USER=LTIdbUser
DB_NAME=LTIdb
DB_PORT=5432
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
```

**Docker:** `docker-compose.yml` con servicio PostgreSQL.

---

## Scripts Disponibles

### Backend
```bash
npm run dev          # Desarrollo con ts-node-dev
npm run build        # Compilar TypeScript
npm start            # Producción
npm test             # Jest
npm run prisma:generate  # Generar cliente Prisma
```

### Frontend
```bash
npm start            # React dev server (puerto 3000)
npm run build        # Build producción
npm test             # Jest
```

### Root
```bash
npm test             # Jest v30 (configuración independiente)
```

---

## Flujo de Datos (Add Candidate)

```
AddCandidateForm (React)
    ↓
candidateService.js → POST /candidates
    ↓
candidateRoutes.ts
    ↓
candidateController.ts → addCandidate()
    ↓
candidateService.ts
    ↓
validateCandidateData() ← Validaciones
    ↓
new Candidate() → Domain Model
    ↓
candidate.save() → Prisma → PostgreSQL
```

---

## Estado del Testing

| Ubicación | Estado | Notas |
|-----------|--------|-------|
| `backend/src/tests/tests-abb.tests.ts` | Vacío | Ejercicio TDD pendiente |
| Root tests | Vacío | Configuración Jest 30 lista |

**Nota:** Este es un ejercicio de TDD. Los tests deben escribirse primero.

---

## Observaciones Clave

1. **Patrón Active Record:** Los modelos en `domain/` extienden PrismaClient directamente
2. **CORS:** Configurado explícitamente para `http://localhost:3000`
3. **Port:** Backend corre en `3010`, frontend en `3000`
4. **Validación teléfono:** Regex específico para móviles españoles (6/7/9 + 8 dígitos)
5. **Subida archivos:** Servicio Multer para CV (PDF/DOCX)
6. **Tipado:** TypeScript en backend, mixto (TS/JS) en frontend

---

## Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `backend/tsconfig.json` | Config TypeScript backend |
| `frontend/tsconfig.json` | Config TypeScript frontend |
| `backend/.eslintrc.js` | Linter ESLint |
| `backend/.prettierrc` | Formato Prettier |

---

## Notas para Desarrollo Futuro

- Implementar tests unitarios en `backend/src/tests/`
- Considerar validación más estricta de fechas (no futuras)
- Añadir paginación en listado de candidatos
- Implementar autenticación JWT
- Añadir tests de integración E2E
