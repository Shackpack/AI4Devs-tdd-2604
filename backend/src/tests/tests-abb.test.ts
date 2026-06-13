/**
 * Fase 1: Validator Tests - Ciclo RED (TDD)
 * 
 * Tests para las funciones de validación del caso de uso
 * "Inserción de Candidatos"
 * 
 * Estado: RED - Tests escritos, implementación pendiente
 * Ubicación: backend/src/tests/tests-abb.tests.ts
 */

import {
    validateName,
    validateEmail,
    validatePhone,
    validateDate,
    validateAddress,
    validateEducation,
    validateExperience,
    validateCV,
    validateCandidateData,
} from '../application/validator';

describe('Fase 1: Validator Tests - RED', () => {

    // ============================================================
    // BLOQUE 1.1: Validación de Nombres (firstName, lastName)
    // ============================================================
    describe('validateName', () => {
        it('should throw "Invalid name" when name is empty', () => {
            expect(() => validateName('')).toThrow('Invalid name');
        });

        it('should throw "Invalid name" when name is 1 character', () => {
            expect(() => validateName('A')).toThrow('Invalid name');
        });

        it('should throw "Invalid name" when name exceeds 100 characters', () => {
            const longName = 'A'.repeat(101);
            expect(() => validateName(longName)).toThrow('Invalid name');
        });

        it('should throw "Invalid name" when name contains numbers', () => {
            expect(() => validateName('Juan123')).toThrow('Invalid name');
        });

        it('should throw "Invalid name" when name contains special characters', () => {
            expect(() => validateName('Juan@Perez')).toThrow('Invalid name');
            expect(() => validateName('María#')).toThrow('Invalid name');
        });

        it('should pass with Spanish tildes (áéíóúÁÉÍÓÚ)', () => {
            expect(() => validateName('José María')).not.toThrow();
            expect(() => validateName('Ángel Édgar Íñigo Óscar Úrsula')).not.toThrow();
        });

        it('should pass with Spanish letter ñÑ', () => {
            expect(() => validateName('Niño Niña')).not.toThrow();
            expect(() => validateName('Ñoño')).not.toThrow();
        });

        it('should pass with valid 2-character name', () => {
            expect(() => validateName('An')).not.toThrow();
        });

        it('should pass with valid 100-character name', () => {
            const validName = 'A'.repeat(100);
            expect(() => validateName(validName)).not.toThrow();
        });

        it('should pass with spaces between names', () => {
            expect(() => validateName('Juan Carlos')).not.toThrow();
            expect(() => validateName('María de la Paz')).not.toThrow();
        });
    });

    // ============================================================
    // BLOQUE 1.2: Validación de Email
    // ============================================================
    describe('validateEmail', () => {
        it('should throw "Invalid email" when email is empty', () => {
            expect(() => validateEmail('')).toThrow('Invalid email');
        });

        it('should throw "Invalid email" when email lacks @ symbol', () => {
            expect(() => validateEmail('testexample.com')).toThrow('Invalid email');
        });

        it('should throw "Invalid email" when email lacks domain', () => {
            expect(() => validateEmail('test@')).toThrow('Invalid email');
        });

        it('should throw "Invalid email" when email has invalid TLD', () => {
            expect(() => validateEmail('test@example.c')).toThrow('Invalid email');
        });

        it('should throw "Invalid email" when email has spaces', () => {
            expect(() => validateEmail('test @example.com')).toThrow('Invalid email');
        });

        it('should pass with valid simple email', () => {
            expect(() => validateEmail('test@example.com')).not.toThrow();
        });

        it('should pass with valid email containing dots in local part', () => {
            expect(() => validateEmail('first.last@example.com')).not.toThrow();
        });

        it('should pass with valid email containing plus', () => {
            expect(() => validateEmail('test+tag@example.com')).not.toThrow();
        });

        it('should pass with valid email containing hyphen in domain', () => {
            expect(() => validateEmail('test@my-example.com')).not.toThrow();
        });

        it('should pass with valid email containing numbers', () => {
            expect(() => validateEmail('user123@example.com')).not.toThrow();
        });
    });

    // ============================================================
    // BLOQUE 1.3: Validación de Teléfono (Móvil Español)
    // ============================================================
    describe('validatePhone', () => {
        it('should pass when phone is undefined', () => {
            expect(() => validatePhone(undefined)).not.toThrow();
        });

        it('should pass when phone is null', () => {
            expect(() => validatePhone(null as any)).not.toThrow();
        });

        it('should pass with valid mobile starting with 6', () => {
            expect(() => validatePhone('612345678')).not.toThrow();
        });

        it('should pass with valid mobile starting with 7', () => {
            expect(() => validatePhone('712345678')).not.toThrow();
        });

        it('should pass with valid mobile starting with 9', () => {
            expect(() => validatePhone('912345678')).not.toThrow();
        });

        it('should throw "Invalid phone" when phone has 8 digits but wrong prefix (5)', () => {
            expect(() => validatePhone('512345678')).toThrow('Invalid phone');
        });

        it('should throw "Invalid phone" when phone has 8 digits but wrong prefix (8)', () => {
            expect(() => validatePhone('812345678')).toThrow('Invalid phone');
        });

        it('should throw "Invalid phone" when phone has 9 digits', () => {
            expect(() => validatePhone('6123456789')).toThrow('Invalid phone');
        });

        it('should throw "Invalid phone" when phone has 7 digits', () => {
            expect(() => validatePhone('61234567')).toThrow('Invalid phone');
        });

        it('should throw "Invalid phone" when phone has letters', () => {
            expect(() => validatePhone('61234567A')).toThrow('Invalid phone');
        });

        it('should throw "Invalid phone" when phone is empty string', () => {
            expect(() => validatePhone('')).toThrow('Invalid phone');
        });

        it('should throw "Invalid phone" when phone contains spaces', () => {
            expect(() => validatePhone('612 345 678')).toThrow('Invalid phone');
        });
    });

    // ============================================================
    // BLOQUE 1.4: Validación de Fechas
    // ============================================================
    describe('validateDate', () => {
        it('should throw "Invalid date" when date is empty', () => {
            expect(() => validateDate('')).toThrow('Invalid date');
        });

        it('should throw "Invalid date" when date format is DD-MM-YYYY', () => {
            expect(() => validateDate('15-01-2024')).toThrow('Invalid date');
        });

        it('should throw "Invalid date" when date format is MM/DD/YYYY', () => {
            expect(() => validateDate('01/15/2024')).toThrow('Invalid date');
        });

        it('should throw "Invalid date" when date format is YYYY/MM/DD', () => {
            expect(() => validateDate('2024/01/15')).toThrow('Invalid date');
        });

        it('should throw "Invalid date" when date has invalid month (13)', () => {
            expect(() => validateDate('2024-13-01')).toThrow('Invalid date');
        });

        it('should throw "Invalid date" when date has invalid day (32)', () => {
            expect(() => validateDate('2024-01-32')).toThrow('Invalid date');
        });

        it('should pass with valid date format YYYY-MM-DD', () => {
            expect(() => validateDate('2024-01-15')).not.toThrow();
        });

        it('should pass with leap year date (2024-02-29)', () => {
            expect(() => validateDate('2024-02-29')).not.toThrow();
        });

        it('should pass with valid date at year boundaries', () => {
            expect(() => validateDate('2024-01-01')).not.toThrow();
            expect(() => validateDate('2024-12-31')).not.toThrow();
        });
    });

    // ============================================================
    // BLOQUE 1.5: Validación de Address
    // ============================================================
    describe('validateAddress', () => {
        it('should pass when address is undefined', () => {
            expect(() => validateAddress(undefined)).not.toThrow();
        });

        it('should pass when address is null', () => {
            expect(() => validateAddress(null as any)).not.toThrow();
        });

        it('should pass with empty string', () => {
            expect(() => validateAddress('')).not.toThrow();
        });

        it('should pass with valid address under 100 chars', () => {
            expect(() => validateAddress('Calle Mayor 123, 4ºB')).not.toThrow();
        });

        it('should pass with valid address at exactly 100 chars', () => {
            const address100 = 'C'.repeat(100);
            expect(() => validateAddress(address100)).not.toThrow();
        });

        it('should throw "Invalid address" when address exceeds 100 characters', () => {
            const address101 = 'C'.repeat(101);
            expect(() => validateAddress(address101)).toThrow('Invalid address');
        });
    });

    // ============================================================
    // BLOQUE 1.6: Validación de Educación
    // ============================================================
    describe('validateEducation', () => {
        const validEducation = {
            institution: 'Universidad Complutense',
            title: 'Ingeniería Informática',
            startDate: '2020-09-01',
            endDate: '2024-06-30',
        };

        it('should throw "Invalid institution" when institution is empty', () => {
            const education = { ...validEducation, institution: '' };
            expect(() => validateEducation(education)).toThrow('Invalid institution');
        });

        it('should throw "Invalid institution" when institution exceeds 100 chars', () => {
            const education = { ...validEducation, institution: 'U'.repeat(101) };
            expect(() => validateEducation(education)).toThrow('Invalid institution');
        });

        it('should throw "Invalid title" when title is empty', () => {
            const education = { ...validEducation, title: '' };
            expect(() => validateEducation(education)).toThrow('Invalid title');
        });

        it('should throw "Invalid title" when title exceeds 100 chars', () => {
            const education = { ...validEducation, title: 'T'.repeat(101) };
            expect(() => validateEducation(education)).toThrow('Invalid title');
        });

        it('should throw "Invalid date" when startDate is invalid', () => {
            const education = { ...validEducation, startDate: 'invalid' };
            expect(() => validateEducation(education)).toThrow('Invalid date');
        });

        it('should throw "Invalid end date" when endDate has wrong format', () => {
            const education = { ...validEducation, endDate: '15-01-2024' };
            expect(() => validateEducation(education)).toThrow('Invalid end date');
        });

        it('should pass when endDate is undefined', () => {
            const education = { ...validEducation, endDate: undefined };
            expect(() => validateEducation(education)).not.toThrow();
        });

        it('should pass when endDate is null', () => {
            const education = { ...validEducation, endDate: null };
            expect(() => validateEducation(education)).not.toThrow();
        });

        it('should pass with valid education data', () => {
            expect(() => validateEducation(validEducation)).not.toThrow();
        });
    });

    // ============================================================
    // BLOQUE 1.7: Validación de Experiencia Laboral
    // ============================================================
    describe('validateExperience', () => {
        const validExperience = {
            company: 'TechCorp',
            position: 'Software Developer',
            description: 'Desarrollo backend con Node.js',
            startDate: '2024-01-15',
            endDate: undefined,
        };

        it('should throw "Invalid company" when company is empty', () => {
            const experience = { ...validExperience, company: '' };
            expect(() => validateExperience(experience)).toThrow('Invalid company');
        });

        it('should throw "Invalid company" when company exceeds 100 chars', () => {
            const experience = { ...validExperience, company: 'C'.repeat(101) };
            expect(() => validateExperience(experience)).toThrow('Invalid company');
        });

        it('should throw "Invalid position" when position is empty', () => {
            const experience = { ...validExperience, position: '' };
            expect(() => validateExperience(experience)).toThrow('Invalid position');
        });

        it('should throw "Invalid position" when position exceeds 100 chars', () => {
            const experience = { ...validExperience, position: 'P'.repeat(101) };
            expect(() => validateExperience(experience)).toThrow('Invalid position');
        });

        it('should throw "Invalid description" when description exceeds 200 chars', () => {
            const experience = { ...validExperience, description: 'D'.repeat(201) };
            expect(() => validateExperience(experience)).toThrow('Invalid description');
        });

        it('should pass when description is undefined', () => {
            const experience = { ...validExperience, description: undefined };
            expect(() => validateExperience(experience)).not.toThrow();
        });

        it('should pass when description is empty string', () => {
            const experience = { ...validExperience, description: '' };
            expect(() => validateExperience(experience)).not.toThrow();
        });

        it('should pass with valid experience data', () => {
            expect(() => validateExperience(validExperience)).not.toThrow();
        });
    });

    // ============================================================
    // BLOQUE 1.8: Validación de CV
    // ============================================================
    describe('validateCV', () => {
        const validCV = {
            filePath: '/uploads/cv-juan.pdf',
            fileType: 'application/pdf',
        };

        it('should throw "Invalid CV data" when cv is not an object', () => {
            expect(() => validateCV('not an object')).toThrow('Invalid CV data');
            expect(() => validateCV(123)).toThrow('Invalid CV data');
        });

        it('should throw "Invalid CV data" when filePath is missing', () => {
            const cv = { fileType: 'application/pdf' };
            expect(() => validateCV(cv)).toThrow('Invalid CV data');
        });

        it('should throw "Invalid CV data" when filePath is not string', () => {
            const cv = { filePath: 123, fileType: 'application/pdf' };
            expect(() => validateCV(cv)).toThrow('Invalid CV data');
        });

        it('should throw "Invalid CV data" when fileType is missing', () => {
            const cv = { filePath: '/uploads/cv.pdf' };
            expect(() => validateCV(cv)).toThrow('Invalid CV data');
        });

        it('should throw "Invalid CV data" when fileType is not string', () => {
            const cv = { filePath: '/uploads/cv.pdf', fileType: 123 };
            expect(() => validateCV(cv)).toThrow('Invalid CV data');
        });

        it('should pass with valid CV data', () => {
            expect(() => validateCV(validCV)).not.toThrow();
        });

        it('should pass when cv is empty object (optional)', () => {
            expect(() => validateCV({})).not.toThrow();
        });

        it('should pass when cv is null (optional)', () => {
            expect(() => validateCV(null as any)).not.toThrow();
        });
    });

    // ============================================================
    // BLOQUE 1.9: Validación Integrada (validateCandidateData)
    // ============================================================
    describe('validateCandidateData', () => {
        const validCandidate = {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@example.com',
            phone: '612345678',
            address: 'Calle Mayor 123',
            educations: [
                {
                    institution: 'Universidad Complutense',
                    title: 'Ingeniería',
                    startDate: '2020-09-01',
                    endDate: '2024-06-30',
                },
            ],
            workExperiences: [
                {
                    company: 'TechCorp',
                    position: 'Developer',
                    description: 'Backend development',
                    startDate: '2024-07-01',
                    endDate: undefined,
                },
            ],
            cv: {
                filePath: '/uploads/cv.pdf',
                fileType: 'application/pdf',
            },
        };

        // Happy Path
        it('should pass with valid complete candidate data', () => {
            expect(() => validateCandidateData(validCandidate)).not.toThrow();
        });

        it('should pass with minimal required fields only', () => {
            const minimal = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
            };
            expect(() => validateCandidateData(minimal)).not.toThrow();
        });

        it('should pass without optional fields (phone, address, educations, etc)', () => {
            const withoutOptionals = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
            };
            expect(() => validateCandidateData(withoutOptionals)).not.toThrow();
        });

        // Error Priority
        it('should throw first validation error encountered (firstName)', () => {
            const data = { ...validCandidate, firstName: '' };
            expect(() => validateCandidateData(data)).toThrow('Invalid name');
        });

        // Arrays validation
        it('should validate all items in educations array', () => {
            const data = {
                ...validCandidate,
                educations: [
                    { ...validCandidate.educations[0] },
                    { ...validCandidate.educations[0], institution: '' }, // Invalid
                ],
            };
            expect(() => validateCandidateData(data)).toThrow('Invalid institution');
        });

        it('should validate all items in workExperiences array', () => {
            const data = {
                ...validCandidate,
                workExperiences: [
                    { ...validCandidate.workExperiences[0] },
                    { ...validCandidate.workExperiences[0], company: '' }, // Invalid
                ],
            };
            expect(() => validateCandidateData(data)).toThrow('Invalid company');
        });

        it('should throw for first invalid education in array', () => {
            const data = {
                ...validCandidate,
                educations: [
                    { institution: '', title: '', startDate: 'invalid' },
                ],
            };
            expect(() => validateCandidateData(data)).toThrow('Invalid institution');
        });

        // Update mode
        it('should skip all validation when data.id is provided (edit mode)', () => {
            const dataWithId = {
                ...validCandidate,
                id: 1,
                firstName: '', // Would normally fail
                email: 'invalid-email', // Would normally fail
            };
            expect(() => validateCandidateData(dataWithId)).not.toThrow();
        });

        it('should validate normally when data.id is undefined', () => {
            const data = { firstName: '' }; // Invalid
            expect(() => validateCandidateData(data)).toThrow('Invalid name');
        });

        it('should validate normally when data.id is null', () => {
            const data = { firstName: '', id: null }; // Invalid name
            expect(() => validateCandidateData(data)).toThrow('Invalid name');
        });

        // Edge cases with arrays
        it('should pass with empty educations array', () => {
            const data = { ...validCandidate, educations: [] };
            expect(() => validateCandidateData(data)).not.toThrow();
        });

        it('should pass with empty workExperiences array', () => {
            const data = { ...validCandidate, workExperiences: [] };
            expect(() => validateCandidateData(data)).not.toThrow();
        });

        it('should pass when educations is undefined', () => {
            const data = { ...validCandidate, educations: undefined };
            expect(() => validateCandidateData(data)).not.toThrow();
        });

        it('should pass when workExperiences is undefined', () => {
            const data = { ...validCandidate, workExperiences: undefined };
            expect(() => validateCandidateData(data)).not.toThrow();
        });

        // CV edge cases
        it('should pass when cv is empty object', () => {
            const data = { ...validCandidate, cv: {} };
            expect(() => validateCandidateData(data)).not.toThrow();
        });

        it('should pass when cv is null', () => {
            const data = { ...validCandidate, cv: null };
            expect(() => validateCandidateData(data)).not.toThrow();
        });

        it('should pass when cv is undefined', () => {
            const data = { ...validCandidate, cv: undefined };
            expect(() => validateCandidateData(data)).not.toThrow();
        });

        it('should validate cv when provided with data', () => {
            const data = {
                ...validCandidate,
                cv: { filePath: 'valid.pdf', fileType: 123 }, // Invalid type
            };
            expect(() => validateCandidateData(data)).toThrow('Invalid CV data');
        });
    });
});
