# Registro de Prompts y Respuestas

---

## Conversación - 2026-06-13

### Prompt del Usuario
```
registra todos los prompts y respuestas en @[prompts/prompts-abb.md]
```

### Respuesta del Asistente
Verifiqué el contenido del archivo `prompts/prompts-abb.md` y encontré que estaba vacío. Procedí a crear esta estructura de registro con la conversación actual.

---

## Conversación - 2026-06-13

### Prompt del Usuario
```
analiza el proyecto y registralo en un archivo markdown para que lo puedas utilizar posteriormente como referencia
```

### Respuesta del Asistente
Analicé completamente el proyecto LTI Talent Tracking System y creé un archivo de referencia detallado en `.cascade/project-reference.md` con:

- **Resumen ejecutivo** con stack tecnológico completo
- **Arquitectura** de carpetas y patrones (Active Record)
- **Esquema Prisma** completo de PostgreSQL
- **Reglas de validación** con regex españoles
- **Endpoints API** y especificación OpenAPI
- **Dependencias** de frontend, backend y root
- **Flujo de datos** del proceso Add Candidate
- **Estado del testing** (TDD ejercicio)
- **Observaciones clave** sobre CORS, puertos, patrones

---

## Análisis TDD - Senior Backend Developer (2026-06-13)

### Prompt del Usuario
```
tomando el rol de senior backend developer:
Tareas a realizar:
- Identificar los casos de uso relacionados con la inserción de candidatos
- Recopilar los requerimientos en base a las decisiones presentes en el proyecto
- Proponer los test que puedan ser relevantes para este caso de uso sin implementarlos
```

### Respuesta del Asistente
Se entregó análisis completo con:

**Casos de Uso Identificados (5):**
- UC-01: Crear Candidato (Core)
- UC-02: Validar Datos de Candidato
- UC-03: Manejar Duplicados (Email)
- UC-04: Subir Archivo CV
- UC-05: Recuperación de Errores DB

**Requerimientos Funcionales (10):** Desde RF-01 (campos obligatorios) hasta RF-10 (transaccionalidad implícita)

**Requerimientos No Funcionales (6):** Validación previa, códigos HTTP, mensajes descriptivos, CORS

**Propuesta de Tests por Suite:**
1. `validator.test.ts` - 25+ casos (nombres, email, teléfono, educación, experiencia, CV)
2. `candidate.model.test.ts` - 10+ casos (constructor, save create/update, findOne)
3. `candidateService.test.ts` - 12+ casos (happy path, validación, duplicados, errores DB)
4. `candidateController.test.ts` - 8+ casos (HTTP responses, edge cases)
5. `candidate.api.test.ts` - 6+ casos (E2E, concurrencia)
6. `fileUpload.test.ts` - 6+ casos (PDF/DOCX, tamaño, errores)

**Total:** ~70 casos de test propuestos siguiendo TDD.

---

## Plan de Implementación TDD (2026-06-13)

### Prompt del Usuario
```
escribe el plan de implementación de los tests enfocados a TDD en la misma ubicación que @[backend/src/tests/tests-abb.tests.ts] con nombre de archivo test-abb-plan.md
```

### Respuesta del Asistente
Se creó archivo `backend/src/tests/test-abb-plan.md` con plan detallado TDD:

**Contenido del Plan:**
- **Estrategia TDD:** Ciclo Red → Green → Refactor
- **6 Fases de implementación ordenadas por prioridad:**
  1. Validator Tests (30+ casos) - `backend/src/application/__tests__/validator.test.ts`
  2. Domain Model Tests (10+ casos) - `backend/src/domain/models/__tests__/candidate.model.test.ts`
  3. File Upload Tests (6+ casos) - `backend/src/application/services/__tests__/fileUpload.test.ts`
  4. Service Tests (15+ casos) - `backend/src/application/services/__tests__/candidateService.test.ts`
  5. Controller Tests (8+ casos) - `backend/src/presentation/controllers/__tests__/candidateController.test.ts`
  6. E2E API Tests (6+ casos) - `backend/src/tests/candidate.api.test.ts`

**Estructura por cada test:**
- Descripción del caso
- Arrange/Act/Assert comentado
- Implementación esperada
- Ubicación del archivo

**Extras incluidos:**
- Configuración Jest recomendada con cobertura 80%+
- Sprints organizados (6 sprints)
- Anti-patterns y buenas prácticas
- DoD (Definition of Done) por test

---

## Evaluación TDD Plan - Jest Expert (2026-06-13)

### Prompt del Usuario
```
tomando el rol de experto en testing con jest revisa @[backend/src/tests/test-abb-plan.md] y valora el mismo. Propon posibles modificaciones al mismo
```

### Respuesta del Asistente
Evaluación completa del plan TDD realizada y guardada en `C:\Users\shack\.windsurf\plans\tdd-plan-evaluation-c8f9c7.md`:

**Veredicto:** 8/10 - Buen plan con optimizaciones identificadas

**Mejoras Clave Propuestas:**
- **jest-mock-extended** para mocks tipados de Prisma
- **Table-driven testing** en validators (reduce código ~60%)
- **Supertest** para tests HTTP más robustos
- **Co-localizar tests** unitarios junto al código fuente
- **Renombrar E2E → Integration** (honestidad técnica con mocks)
- **Data Factories** para fixtures DRY

**Thresholds de Cobertura Recomendados:**
- Validator: 100%
- Domain Models: 90%
- Services: 85%
- Controllers: 80%

**Dependencias Agregadas:**
- `jest-mock-extended`
- `supertest` + `@types/supertest`

---
