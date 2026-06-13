# Plan de Implementación TDD - Inserción de Candidatos

> **Proyecto:** LTI Talent Tracking System  
> **Fecha:** 2026-06-13  
> **Enfoque:** Test-Driven Development (Red → Green → Refactor)  

---

## Estrategia TDD

### Ciclo de Desarrollo
1. **Red:** Escribir test que falla (define comportamiento esperado)
2. **Green:** Implementar código mínimo para que pase
3. **Refactor:** Optimizar sin cambiar comportamiento

### Orden de Implementación (Prioridad TDD)

| Fase | Suite | Prioridad | Rationale |
|------|-------|-----------|-----------|
| 1 | `validator.test.ts` | Crítica | Reglas de negocio puras, sin dependencias externas |
| 2 | `candidate.model.test.ts` | Alta | Core domain, requiere mock de Prisma |
| 3 | `fileUpload.test.ts` | Media-Alta | Servicio independiente con multer mocks |
| 4 | `candidateService.test.ts` | Alta | Integración validator + model + transaccionalidad |
| 5 | `candidateController.test.ts` | Media | HTTP layer, req/res mocks |
| 6 | `candidate.api.test.ts` | Baja | E2E, requiere infraestructura (DB real) |

---

## Fase 1: Validator Tests (`validator.test.ts`)

**Ubicación:** `backend/src/application/__tests__/validator.test.ts`

### Bloque 1.1: Validación de Nombres (firstName, lastName)
```typescript
// Test 1.1.1 - Debe fallar: nombre vacío
describe('validateName', () => {
  it('should throw "Invalid name" when name is empty', () => {
    // Arrange: name = ''
    // Act: validateName('')
    // Assert: throws Error with message 'Invalid name'
  });

  it('should throw "Invalid name" when name is 1 character', () => {
    // Arrange: name = 'A'
    // Act/Assert: throws Error
  });

  it('should throw "Invalid name" when name exceeds 100 characters', () => {
    // Arrange: name = 'A'.repeat(101)
    // Act/Assert: throws Error
  });

  it('should throw "Invalid name" when name contains numbers', () => {
    // Arrange: name = 'Juan123'
    // Act/Assert: throws Error
  });

  it('should throw "Invalid name" when name contains special characters', () => {
    // Arrange: name = 'Juan@Perez'
    // Act/Assert: throws Error
  });

  it('should pass with Spanish tildes (áéíóúÁÉÍÓÚ)', () => {
    // Arrange: name = 'José María'
    // Act/Assert: no error
  });

  it('should pass with Spanish letter ñÑ', () => {
    // Arrange: name = 'Niño Niña'
    // Act/Assert: no error
  });

  it('should pass with valid 2-character name', () => {
    // Arrange: name = 'An'
    // Act/Assert: no error
  });

  it('should pass with valid 100-character name', () => {
    // Arrange: name = 'A'.repeat(100)
    // Act/Assert: no error
  });
});
```

**Implementación esperada:**
- Crear función `validateName(name: string)` en `validator.ts`
- Regex: `/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$/`
- Longitud: 2-100 caracteres

### Bloque 1.2: Validación de Email
```typescript
describe('validateEmail', () => {
  it('should throw "Invalid email" when email is empty', () => {});
  it('should throw "Invalid email" when email lacks @ symbol', () => {});
  it('should throw "Invalid email" when email lacks domain', () => {});
  it('should throw "Invalid email" when email has invalid TLD', () => {});
  it('should throw "Invalid email" when email has spaces', () => {});
  it('should pass with valid simple email', () => {});
  it('should pass with valid email containing dots', () => {});
  it('should pass with valid email containing plus', () => {});
  it('should pass with valid email containing hyphen in domain', () => {});
});
```

**Implementación esperada:**
- Regex: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`

### Bloque 1.3: Validación de Teléfono (Móvil Español)
```typescript
describe('validatePhone', () => {
  it('should pass when phone is undefined', () => {});
  it('should pass when phone is null', () => {});
  it('should pass with valid mobile starting with 6', () => {});
  it('should pass with valid mobile starting with 7', () => {});
  it('should pass with valid mobile starting with 9', () => {});
  it('should throw "Invalid phone" when phone has 8 digits but wrong prefix (5)', () => {});
  it('should throw "Invalid phone" when phone has 8 digits but wrong prefix (8)', () => {});
  it('should throw "Invalid phone" when phone has 9 digits', () => {});
  it('should throw "Invalid phone" when phone has 7 digits', () => {});
  it('should throw "Invalid phone" when phone has letters', () => {});
  it('should throw "Invalid phone" when phone is empty string', () => {});
});
```

**Implementación esperada:**
- Regex: `/^(6|7|9)\d{8}$/`
- Teléfono es opcional

### Bloque 1.4: Validación de Fechas
```typescript
describe('validateDate', () => {
  it('should throw "Invalid date" when date is empty', () => {});
  it('should throw "Invalid date" when date format is DD-MM-YYYY', () => {});
  it('should throw "Invalid date" when date format is MM/DD/YYYY', () => {});
  it('should throw "Invalid date" when date has invalid month (13)', () => {});
  it('should throw "Invalid date" when date has invalid day (32)', () => {});
  it('should pass with valid date format YYYY-MM-DD', () => {});
  it('should pass with leap year date (2024-02-29)', () => {});
});
```

**Implementación esperada:**
- Regex: `/^\d{4}-\d{2}-\d{2}$/`
- Nota: No validar fechas futuras/pasadas inicialmente (fuera de scope actual)

### Bloque 1.5: Validación de Address
```typescript
describe('validateAddress', () => {
  it('should pass when address is undefined', () => {});
  it('should pass when address is null', () => {});
  it('should pass with empty string', () => {});
  it('should pass with valid address under 100 chars', () => {});
  it('should throw "Invalid address" when address exceeds 100 characters', () => {});
});
```

### Bloque 1.6: Validación de Educación
```typescript
describe('validateEducation', () => {
  it('should throw "Invalid institution" when institution is empty', () => {});
  it('should throw "Invalid institution" when institution exceeds 100 chars', () => {});
  it('should throw "Invalid title" when title is empty', () => {});
  it('should throw "Invalid title" when title exceeds 100 chars', () => {});
  it('should throw "Invalid date" when startDate is invalid', () => {});
  it('should throw "Invalid end date" when endDate has wrong format', () => {});
  it('should pass when endDate is undefined', () => {});
  it('should pass when endDate is null', () => {});
  it('should pass with valid education data', () => {});
});
```

### Bloque 1.7: Validación de Experiencia Laboral
```typescript
describe('validateExperience', () => {
  it('should throw "Invalid company" when company is empty', () => {});
  it('should throw "Invalid company" when company exceeds 100 chars', () => {});
  it('should throw "Invalid position" when position is empty', () => {});
  it('should throw "Invalid position" when position exceeds 100 chars', () => {});
  it('should throw "Invalid description" when description exceeds 200 chars', () => {});
  it('should pass when description is undefined', () => {});
  it('should pass when description is empty string', () => {});
  it('should pass with valid experience data', () => {});
});
```

### Bloque 1.8: Validación de CV
```typescript
describe('validateCV', () => {
  it('should throw "Invalid CV data" when cv is not an object', () => {});
  it('should throw "Invalid CV data" when filePath is missing', () => {});
  it('should throw "Invalid CV data" when filePath is not string', () => {});
  it('should throw "Invalid CV data" when fileType is missing', () => {});
  it('should throw "Invalid CV data" when fileType is not string', () => {});
  it('should pass with valid CV data', () => {});
  it('should pass when cv is empty object (optional)', () => {});
  it('should pass when cv is null (optional)', () => {});
});
```

### Bloque 1.9: Validación Integrada (validateCandidateData)
```typescript
describe('validateCandidateData', () => {
  // Happy Path
  it('should pass with valid complete candidate data', () => {});
  it('should pass with minimal required fields only', () => {});
  it('should pass without optional fields (phone, address, educations, etc)', () => {});
  
  // Error Priority
  it('should throw first validation error encountered', () => {});
  
  // Arrays validation
  it('should validate all items in educations array', () => {});
  it('should validate all items in workExperiences array', () => {});
  it('should throw for first invalid education in array', () => {});
  
  // Update mode
  it('should skip all validation when data.id is provided (edit mode)', () => {});
  it('should validate normally when data.id is undefined', () => {});
  it('should validate normally when data.id is null', () => {});
});
```

---

## Fase 2: Domain Model Tests (`candidate.model.test.ts`)

**Ubicación:** `backend/src/domain/models/__tests__/candidate.model.test.ts`

### Configuración de Mocks (Prisma)
```typescript
// Mock PrismaClient before imports
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => ({
      candidate: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
    })),
    Prisma: {
      PrismaClientInitializationError: class extends Error {},
    },
  };
});
```

### Bloque 2.1: Constructor
```typescript
describe('Candidate Constructor', () => {
  it('should create Candidate with all properties', () => {});
  it('should initialize empty arrays when education/workExperience/resumes are undefined', () => {});
  it('should initialize empty arrays when education/workExperience/resumes are null', () => {});
  it('should handle partial data correctly', () => {});
  it('should convert date strings to Date objects in education', () => {});
  it('should convert date strings to Date objects in workExperience', () => {});
});
```

### Bloque 2.2: Save - Create Operation
```typescript
describe('Candidate.save() - Create', () => {
  it('should call prisma.candidate.create with correct data', () => {});
  it('should not include undefined fields in create data', () => {});
  it('should include nested educations when provided', () => {});
  it('should include nested workExperiences when provided', () => {});
  it('should include nested resumes when provided', () => {});
  it('should return created candidate data', () => {});
  
  // Error handling
  it('should throw Spanish error message on database connection error', () => {});
  it('should re-throw other errors', () => {});
});
```

### Bloque 2.3: Save - Update Operation
```typescript
describe('Candidate.save() - Update', () => {
  it('should call prisma.candidate.update when id exists', () => {});
  it('should include id in where clause', () => {});
  it('should throw Spanish error when candidate not found (P2025)', () => {});
  it('should throw connection error with Spanish message', () => {});
});
```

### Bloque 2.4: Static Methods
```typescript
describe('Candidate.findOne()', () => {
  it('should call prisma.candidate.findUnique with correct id', () => {});
  it('should return Candidate instance when found', () => {});
  it('should return null when candidate not found', () => {});
  it('should return instance with correct properties', () => {});
});
```

---

## Fase 3: File Upload Tests (`fileUpload.test.ts`)

**Ubicación:** `backend/src/application/services/__tests__/fileUpload.test.ts`

```typescript
describe('uploadFile', () => {
  // Mock multer setup
  
  it('should accept PDF files (application/pdf)', () => {});
  it('should accept DOCX files (application/vnd.openxmlformats-officedocument.wordprocessingml.document)', () => {});
  it('should reject JPEG files (400)', () => {});
  it('should reject PNG files (400)', () => {});
  it('should reject TXT files (400)', () => {});
  it('should return filePath and fileType on success', () => {});
  it('should handle multer error for file too large (500)', () => {});
  it('should handle generic multer errors (500)', () => {});
  it('should generate unique filename with timestamp prefix', () => {});
  it('should store files in ../uploads/ directory', () => {});
});
```

---

## Fase 4: Service Tests (`candidateService.test.ts`)

**Ubicación:** `backend/src/application/services/__tests__/candidateService.test.ts`

### Configuración
- Mock validator
- Mock Candidate model
- Mock Education model
- Mock WorkExperience model
- Mock Resume model

### Bloque 4.1: Validación Integrada
```typescript
describe('addCandidate - Validation', () => {
  it('should call validateCandidateData with input data', () => {});
  it('should throw error when validation fails (before any DB call)', () => {});
  it('should not create candidate when validation fails', () => {});
  it('should not call Candidate constructor when validation fails', () => {});
});
```

### Bloque 4.2: Creación de Candidato Base
```typescript
describe('addCandidate - Candidate Creation', () => {
  it('should create Candidate instance with provided data', () => {});
  it('should call candidate.save()', () => {});
  it('should return saved candidate data', () => {});
});
```

### Bloque 4.3: Creación de Entidades Relacionadas
```typescript
describe('addCandidate - Related Entities', () => {
  it('should save all educations with correct candidateId', () => {});
  it('should save all workExperiences with correct candidateId', () => {});
  it('should save CV when provided with correct candidateId', () => {});
  it('should not save educations when array is empty', () => {});
  it('should not save workExperiences when array is empty', () => {});
  it('should not save CV when cv is empty object', () => {});
  it('should use candidate.id from saved candidate for related entities', () => {});
});
```

### Bloque 4.4: Manejo de Errores
```typescript
describe('addCandidate - Error Handling', () => {
  // Email duplicado
  it('should throw "email already exists" when P2002 error occurs', () => {});
  it('should throw specific error message for unique constraint violation', () => {});
  
  // Otros errores Prisma
  it('should handle PrismaClientInitializationError', () => {});
  it('should handle generic errors', () => {});
  it('should re-throw original error when not P2002', () => {});
  
  // Transaccionalidad implícita
  it('should not create partial data when education save fails', () => {});
  it('should not create partial data when workExperience save fails', () => {});
  it('should not create partial data when resume save fails', () => {});
});
```

### Bloque 4.5: Casos de Borde
```typescript
describe('addCandidate - Edge Cases', () => {
  it('should handle candidate with only required fields', () => {});
  it('should handle candidate with 10 educations', () => {});
  it('should handle candidate with 10 workExperiences', () => {});
  it('should handle candidate with no optional fields', () => {});
  it('should handle candidate with all fields populated', () => {});
});
```

---

## Fase 5: Controller Tests (`candidateController.test.ts`)

**Ubicación:** `backend/src/presentation/controllers/__tests__/candidateController.test.ts`

### Configuración
```typescript
// Mock Request and Response objects
const mockRequest = (body = {}) => ({ body } as Request);
const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res as Response;
};
```

### Bloque 5.1: Respuestas HTTP Exitosas
```typescript
describe('addCandidateController - Success', () => {
  it('should return 201 status on successful creation', () => {});
  it('should return JSON with success message', () => {});
  it('should return created candidate data in response', () => {});
  it('should call addCandidate service with request body', () => {});
});
```

### Bloque 5.2: Respuestas HTTP Error
```typescript
describe('addCandidateController - Error Handling', () => {
  // Validation errors
  it('should return 400 on validation error', () => {});
  it('should return error message in response body', () => {});
  
  // Duplicate email
  it('should return 400 on duplicate email error', () => {});
  it('should return specific message for duplicate email', () => {});
  
  // Unknown errors
  it('should return 400 on unknown error type', () => {});
  it('should return "Unknown error" message for non-Error throws', () => {});
});
```

### Bloque 5.3: Formato de Respuesta
```typescript
describe('addCandidateController - Response Format', () => {
  it('should return { message, data } on success', () => {});
  it('should return { message, error } on failure', () => {});
  it('should set Content-Type to application/json', () => {});
});
```

---

## Fase 6: E2E API Tests (`candidate.api.test.ts`)

**Ubicación:** `backend/src/tests/candidate.api.test.ts`  
**Nota:** Requiere infraestructura (DB real o testcontainers)

```typescript
describe('POST /candidates E2E', () => {
  // Setup: Iniciar servidor, conectar DB de prueba
  
  it('should create candidate end-to-end', () => {});
  it('should persist candidate in database', () => {});
  it('should persist related educations', () => {});
  it('should persist related workExperiences', () => {});
  it('should reject candidate with invalid email (400)', () => {});
  it('should reject candidate with duplicate email (400)', () => {});
  it('should reject candidate with invalid phone (400)', () => {});
  
  // Concurrency
  it('should handle concurrent requests with same email (race condition)', () => {});
  
  // Cleanup after tests
});
```

---

## Configuración Jest Recomendada

### `backend/jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## Orden de Ejecución TDD Recomendado

### Sprint 1: Foundation (Validator)
1. Implementar `validateName` con tests 1.1.1-1.1.9
2. Implementar `validateEmail` con tests 1.2.x
3. Implementar `validatePhone` con tests 1.3.x
4. Implementar `validateDate` con tests 1.4.x

### Sprint 2: Complex Validations
5. Implementar `validateEducation` con tests 1.6.x
6. Implementar `validateExperience` con tests 1.7.x
7. Implementar `validateCV` con tests 1.8.x
8. Implementar `validateCandidateData` integrado con tests 1.9.x

### Sprint 3: Domain Layer
9. Implementar `Candidate` constructor con tests 2.1.x
10. Implementar `Candidate.save()` create con tests 2.2.x
11. Implementar `Candidate.save()` update con tests 2.3.x
12. Implementar `Candidate.findOne()` con tests 2.4.x

### Sprint 4: Service Layer
13. Implementar `addCandidate` service con tests 4.1.x-4.5.x

### Sprint 5: Infrastructure
14. Implementar `uploadFile` con tests Fase 3
15. Implementar `addCandidateController` con tests Fase 5

### Sprint 6: Integration
16. Implementar E2E tests Fase 6 (requiere setup de DB de prueba)

---

## Métricas de Cobertura Objetivo

| Capa | Cobertura Objetivo |
|------|-------------------|
| Validator | 95%+ |
| Domain Models | 90%+ |
| Services | 85%+ |
| Controllers | 80%+ |
| Routes | 70%+ (integration) |

---

## Notas de Implementación

### DoD (Definition of Done) por Test
- [ ] Test escrito y fallando (Red)
- [ ] Implementación mínima que pasa (Green)
- [ ] Refactor si es necesario
- [ ] Test pasa en aislamiento
- [ ] Todos los tests anteriores siguen pasando (regression)

### Anti-patterns a evitar
- ❌ No mockear lo que no se controla (DB real en unit tests)
- ❌ No testear implementación, testear comportamiento
- ❌ No omitir el paso "Red" (test que falla primero)
- ❌ No escribir múltiples tests de golpe (uno a la vez)

### Buenas prácticas
- ✅ AAA pattern: Arrange, Act, Assert
- ✅ Nombre descriptivo: "should [behavior] when [condition]"
- ✅ Un assert por test (idealmente)
- ✅ Mock external dependencies
- ✅ Testear casos límite (boundary values)
