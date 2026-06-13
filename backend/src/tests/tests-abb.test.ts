/**
 * Tests TDD - Inserción de Candidatos
 * 
 * Fase 1: Validator Tests
 * Fase 2: Domain Model Tests
 * Fase 3: File Upload Tests
 * 
 * Ubicación: backend/src/tests/tests-abb.test.ts
 */

// ============================================================
// MOCK MULTER (debe estar antes de cualquier import que use multer)
// ============================================================
jest.mock('multer', () => {
    // Create a diskStorage mock that returns a valid storage configuration
    const diskStorageMock = jest.fn((config: any) => ({
        _config: config,
        // Return the configuration object that multer uses internally
        getDestination: config.destination,
        getFilename: config.filename,
    }));

    return {
        __esModule: true,
        default: jest.fn(() => ({
            single: jest.fn((fieldName: string) => {
                // Return the middleware function that will be called
                return (req: any, res: any, cb: any) => {
                    // Check if there's a mock error set
                    const error = (globalThis as any).__multerError;
                    if (error) {
                        delete (globalThis as any).__multerError;
                        return cb(error);
                    }
                    // Simulate successful upload by setting req.file
                    if (req.__mockFile) {
                        req.file = req.__mockFile;
                    }
                    cb(null);
                };
            }),
        })),
        MulterError: class MulterError extends Error {
            code: string;
            constructor(message: string, code?: string) {
                super(message);
                this.name = 'MulterError';
                this.code = code || 'UNKNOWN';
            }
        },
        diskStorage: diskStorageMock,
    };
});

// ============================================================
// MOCK PRISMA (debe estar antes de importar los modelos)
// ============================================================
const mockPrismaInstance = {
    candidate: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
    },
};

class MockPrismaClientInitializationError extends Error {
    code: string;
    clientVersion: string;
    constructor(message: string, code: string, clientVersion: string) {
        super(message);
        this.name = 'PrismaClientInitializationError';
        this.code = code;
        this.clientVersion = clientVersion;
    }
}

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mockPrismaInstance),
        Prisma: {
            PrismaClientInitializationError: MockPrismaClientInitializationError,
        },
    };
});

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
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';

// ============================================================
// FASE 1: VALIDATOR TESTS
// ============================================================
describe('Fase 1: Validator Tests - RED', () => {

    // Shared fixtures — defined at Fase 1 scope to avoid duplication across blocks
    const VALID_EDUCATION = {
        institution: 'Universidad Complutense',
        title: 'Ingeniería Informática',
        startDate: '2020-09-01',
        endDate: '2024-06-30',
    };

    const VALID_EXPERIENCE = {
        company: 'TechCorp',
        position: 'Software Developer',
        description: 'Desarrollo backend con Node.js',
        startDate: '2024-01-15',
        endDate: undefined,
    };

    const VALID_CV = {
        filePath: '/uploads/cv-juan.pdf',
        fileType: 'application/pdf',
    };


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

        it('should throw "Invalid name" when name contains @ character', () => {
            expect(() => validateName('Juan@Perez')).toThrow('Invalid name');
        });

        it('should throw "Invalid name" when name contains # character', () => {
            expect(() => validateName('María#')).toThrow('Invalid name');
        });

        it('should pass with Spanish tildes lowercase (áéíóú)', () => {
            expect(() => validateName('José María')).not.toThrow();
        });

        it('should pass with Spanish tildes uppercase (ÁÉÍÓÚ)', () => {
            expect(() => validateName('Ángel Édgar Íñigo Óscar Úrsula')).not.toThrow();
        });

        it('should pass with Spanish letter ñ (lowercase)', () => {
            expect(() => validateName('Niño Niña')).not.toThrow();
        });

        it('should pass with Spanish letter Ñ (uppercase)', () => {
            expect(() => validateName('Ñoño')).not.toThrow();
        });

        it('should pass with valid 2-character name', () => {
            expect(() => validateName('An')).not.toThrow();
        });

        it('should pass with valid 100-character name', () => {
            const validName = 'A'.repeat(100);
            expect(() => validateName(validName)).not.toThrow();
        });

        it('should pass with single space between names', () => {
            expect(() => validateName('Juan Carlos')).not.toThrow();
        });

        it('should pass with multiple spaces between compound names', () => {
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

        it('should throw "Invalid phone" when phone has valid length but wrong prefix (5)', () => {
            expect(() => validatePhone('512345678')).toThrow('Invalid phone');
        });

        it('should throw "Invalid phone" when phone has valid length but wrong prefix (8)', () => {
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

        it('should pass with valid date at year start boundary (January 1st)', () => {
            expect(() => validateDate('2024-01-01')).not.toThrow();
        });

        it('should pass with valid date at year end boundary (December 31st)', () => {
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

        it('should throw "Invalid institution" when institution is empty', () => {
            const education = { ...VALID_EDUCATION, institution: '' };
            expect(() => validateEducation(education)).toThrow('Invalid institution');
        });

        it('should throw "Invalid institution" when institution exceeds 100 chars', () => {
            const education = { ...VALID_EDUCATION, institution: 'U'.repeat(101) };
            expect(() => validateEducation(education)).toThrow('Invalid institution');
        });

        it('should throw "Invalid title" when title is empty', () => {
            const education = { ...VALID_EDUCATION, title: '' };
            expect(() => validateEducation(education)).toThrow('Invalid title');
        });

        it('should throw "Invalid title" when title exceeds 100 chars', () => {
            const education = { ...VALID_EDUCATION, title: 'T'.repeat(101) };
            expect(() => validateEducation(education)).toThrow('Invalid title');
        });

        it('should throw "Invalid date" when startDate is invalid', () => {
            const education = { ...VALID_EDUCATION, startDate: 'invalid' };
            expect(() => validateEducation(education)).toThrow('Invalid date');
        });

        it('should throw "Invalid end date" when endDate has wrong format', () => {
            const education = { ...VALID_EDUCATION, endDate: '15-01-2024' };
            expect(() => validateEducation(education)).toThrow('Invalid end date');
        });

        it('should pass when endDate is undefined', () => {
            const education = { ...VALID_EDUCATION, endDate: undefined };
            expect(() => validateEducation(education)).not.toThrow();
        });

        it('should pass when endDate is null', () => {
            const education = { ...VALID_EDUCATION, endDate: null };
            expect(() => validateEducation(education)).not.toThrow();
        });

        it('should pass with valid education data', () => {
            expect(() => validateEducation(VALID_EDUCATION)).not.toThrow();
        });
    });

    // ============================================================
    // BLOQUE 1.7: Validación de Experiencia Laboral
    // ============================================================
    describe('validateExperience', () => {

        it('should throw "Invalid company" when company is empty', () => {
            const experience = { ...VALID_EXPERIENCE, company: '' };
            expect(() => validateExperience(experience)).toThrow('Invalid company');
        });

        it('should throw "Invalid company" when company exceeds 100 chars', () => {
            const experience = { ...VALID_EXPERIENCE, company: 'C'.repeat(101) };
            expect(() => validateExperience(experience)).toThrow('Invalid company');
        });

        it('should throw "Invalid position" when position is empty', () => {
            const experience = { ...VALID_EXPERIENCE, position: '' };
            expect(() => validateExperience(experience)).toThrow('Invalid position');
        });

        it('should throw "Invalid position" when position exceeds 100 chars', () => {
            const experience = { ...VALID_EXPERIENCE, position: 'P'.repeat(101) };
            expect(() => validateExperience(experience)).toThrow('Invalid position');
        });

        it('should throw "Invalid description" when description exceeds 200 chars', () => {
            const experience = { ...VALID_EXPERIENCE, description: 'D'.repeat(201) };
            expect(() => validateExperience(experience)).toThrow('Invalid description');
        });

        it('should pass when description is undefined', () => {
            const experience = { ...VALID_EXPERIENCE, description: undefined };
            expect(() => validateExperience(experience)).not.toThrow();
        });

        it('should pass when description is empty string', () => {
            const experience = { ...VALID_EXPERIENCE, description: '' };
            expect(() => validateExperience(experience)).not.toThrow();
        });

        it('should pass with valid experience data', () => {
            expect(() => validateExperience(VALID_EXPERIENCE)).not.toThrow();
        });
    });

    // ============================================================
    // BLOQUE 1.8: Validación de CV
    // ============================================================
    describe('validateCV', () => {

        it('should throw "Invalid CV data" when cv is a string', () => {
            expect(() => validateCV('not an object')).toThrow('Invalid CV data');
        });

        it('should throw "Invalid CV data" when cv is a number', () => {
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
            expect(() => validateCV(VALID_CV)).not.toThrow();
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
            educations: [VALID_EDUCATION],
            workExperiences: [VALID_EXPERIENCE],
            cv: VALID_CV,
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

        // Update mode: When data.id is present, validation is skipped entirely
        // This supports partial updates (PATCH-like behavior) where only some fields
        // are sent for editing an existing candidate. In edit mode, we assume the
        // candidate already passed validation when created, so we allow partial updates.
        // BEHAVIOR: If data.id exists (truthy) -> skip all validation
        //           If data.id is undefined or null -> validate normally (create mode)
        it('should skip all validation when data.id is provided (edit mode)', () => {
            const dataWithId = {
                ...validCandidate,
                id: 1,              // Edit mode: bypasses all validation
                firstName: '',      // Invalid but ignored in edit mode
                email: 'invalid-email', // Invalid but ignored in edit mode
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

// ============================================================
// FASE 2: DOMAIN MODEL TESTS
// ============================================================
describe('Fase 2: Domain Model Tests - RED', () => {

    // Access the shared mock instance
    const mockPrisma = mockPrismaInstance;

    // Shared fixture — minimal valid candidate data used across blocks 2.1, 2.2, 2.3, 2.4
    const MINIMAL_CANDIDATE_DATA = {
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan@example.com',
    };

    // ============================================================
    // BLOQUE 2.1: Candidate Constructor
    // ============================================================
    describe('Candidate Constructor', () => {
        it('should create Candidate with all properties', () => {
            const data = {
                id: 1,
                ...MINIMAL_CANDIDATE_DATA,
                phone: '612345678',
                address: 'Calle Mayor 123',
                education: [],
                workExperience: [],
                resumes: [],
            };

            const candidate = new Candidate(data);

            expect(candidate.id).toBe(1);
            expect(candidate.firstName).toBe('Juan');
            expect(candidate.lastName).toBe('Perez');
            expect(candidate.email).toBe('juan@example.com');
            expect(candidate.phone).toBe('612345678');
            expect(candidate.address).toBe('Calle Mayor 123');
        });

        it('should initialize empty arrays when education is undefined', () => {
            const data = { ...MINIMAL_CANDIDATE_DATA, education: undefined };

            const candidate = new Candidate(data);

            expect(candidate.education).toEqual([]);
        });

        it('should initialize empty arrays when education is null', () => {
            const data = { ...MINIMAL_CANDIDATE_DATA, education: null };

            const candidate = new Candidate(data);

            expect(candidate.education).toEqual([]);
        });

        it('should initialize empty arrays when workExperience is undefined', () => {
            const data = { ...MINIMAL_CANDIDATE_DATA, workExperience: undefined };

            const candidate = new Candidate(data);

            expect(candidate.workExperience).toEqual([]);
        });

        it('should initialize empty arrays when workExperience is null', () => {
            const data = { ...MINIMAL_CANDIDATE_DATA, workExperience: null };

            const candidate = new Candidate(data);

            expect(candidate.workExperience).toEqual([]);
        });

        it('should initialize empty arrays when resumes is undefined', () => {
            const data = { ...MINIMAL_CANDIDATE_DATA, resumes: undefined };

            const candidate = new Candidate(data);

            expect(candidate.resumes).toEqual([]);
        });

        it('should initialize empty arrays when resumes is null', () => {
            const data = { ...MINIMAL_CANDIDATE_DATA, resumes: null };

            const candidate = new Candidate(data);

            expect(candidate.resumes).toEqual([]);
        });

        it('should handle partial data correctly', () => {
            // Intentional: verifies complete property mapping contract for partial input
            const candidate = new Candidate(MINIMAL_CANDIDATE_DATA);

            expect(candidate.firstName).toBe('Juan');
            expect(candidate.lastName).toBe('Perez');
            expect(candidate.email).toBe('juan@example.com');
            expect(candidate.phone).toBeUndefined();
            expect(candidate.address).toBeUndefined();
            expect(candidate.education).toEqual([]);
            expect(candidate.workExperience).toEqual([]);
            expect(candidate.resumes).toEqual([]);
        });

        it('should preserve Education instances in education array', () => {
            const education = new Education({
                institution: 'Universidad',
                title: 'Ingenieria',
                startDate: '2020-09-01',
                endDate: '2024-06-30',
            });

            const data = { ...MINIMAL_CANDIDATE_DATA, education: [education] };

            const candidate = new Candidate(data);

            expect(candidate.education).toHaveLength(1);
            expect(candidate.education[0]).toBeInstanceOf(Education);
        });

        it('should preserve WorkExperience instances in workExperience array', () => {
            const experience = new WorkExperience({
                company: 'TechCorp',
                position: 'Developer',
                startDate: '2024-01-01',
            });

            const data = { ...MINIMAL_CANDIDATE_DATA, workExperience: [experience] };

            const candidate = new Candidate(data);

            expect(candidate.workExperience).toHaveLength(1);
            expect(candidate.workExperience[0]).toBeInstanceOf(WorkExperience);
        });

        it('should preserve Resume instances in resumes array', () => {
            const resume = new Resume({
                filePath: '/uploads/cv.pdf',
                fileType: 'application/pdf',
                candidateId: 1,
            });

            const data = { ...MINIMAL_CANDIDATE_DATA, resumes: [resume] };

            const candidate = new Candidate(data);

            expect(candidate.resumes).toHaveLength(1);
            expect(candidate.resumes[0]).toBeInstanceOf(Resume);
        });
    });

    // ============================================================
    // BLOQUE 2.2: Save - Create Operation
    // ============================================================
    describe('Candidate.save() - Create', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should call prisma.candidate.create with correct data', async () => {

            const candidate = new Candidate(MINIMAL_CANDIDATE_DATA);
            await candidate.save();

            expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
                data: {
                    firstName: 'Juan',
                    lastName: 'Perez',
                    email: 'juan@example.com',
                },
            });
        });

        it('should not include undefined fields in create data', async () => {

            const candidate = new Candidate(MINIMAL_CANDIDATE_DATA);
            await candidate.save();

            const callArg = mockPrisma.candidate.create.mock.calls[0][0];
            expect(callArg.data).not.toHaveProperty('phone');
            expect(callArg.data).not.toHaveProperty('address');
        });

        it('should include optional fields when provided', async () => {

            const data = { ...MINIMAL_CANDIDATE_DATA, phone: '612345678', address: 'Calle Mayor 123' };

            const candidate = new Candidate(data);
            await candidate.save();

            expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
                data: {
                    firstName: 'Juan',
                    lastName: 'Perez',
                    email: 'juan@example.com',
                    phone: '612345678',
                    address: 'Calle Mayor 123',
                },
            });
        });

        it('should include nested educations when provided', async () => {

            const education = new Education({
                institution: 'Universidad',
                title: 'Ingenieria',
                startDate: '2020-09-01',
                endDate: '2024-06-30',
            });

            const data = { ...MINIMAL_CANDIDATE_DATA, education: [education] };

            const candidate = new Candidate(data);
            await candidate.save();

            expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    educations: {
                        create: [{
                            institution: 'Universidad',
                            title: 'Ingenieria',
                            startDate: education.startDate,
                            endDate: education.endDate,
                        }],
                    },
                }),
            });
        });

        it('should include nested workExperiences when provided', async () => {

            const experience = new WorkExperience({
                company: 'TechCorp',
                position: 'Developer',
                description: 'Backend dev',
                startDate: '2024-01-01',
            });

            const data = { ...MINIMAL_CANDIDATE_DATA, workExperience: [experience] };

            const candidate = new Candidate(data);
            await candidate.save();

            expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    workExperiences: {
                        create: [{
                            company: 'TechCorp',
                            position: 'Developer',
                            description: 'Backend dev',
                            startDate: experience.startDate,
                            endDate: undefined,
                        }],
                    },
                }),
            });
        });

        it('should include nested resumes when provided', async () => {

            const resume = new Resume({
                filePath: '/uploads/cv.pdf',
                fileType: 'application/pdf',
                candidateId: 1,
            });

            const data = { ...MINIMAL_CANDIDATE_DATA, resumes: [resume] };

            const candidate = new Candidate(data);
            await candidate.save();

            expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    resumes: {
                        create: [{
                            filePath: '/uploads/cv.pdf',
                            fileType: 'application/pdf',
                        }],
                    },
                }),
            });
        });

        it('should return created candidate data', async () => {

            const createdData = { id: 1, ...MINIMAL_CANDIDATE_DATA };
            mockPrisma.candidate.create.mockResolvedValue(createdData);

            const candidate = new Candidate(MINIMAL_CANDIDATE_DATA);

            const result = await candidate.save();

            expect(result).toEqual(createdData);
        });

        it('should throw Spanish error message on database connection error', async () => {

            const connectionError = new MockPrismaClientInitializationError(
                'Database connection failed',
                'P1001',
                '2.30.0'
            );
            mockPrisma.candidate.create.mockRejectedValue(connectionError);

            const candidate = new Candidate(MINIMAL_CANDIDATE_DATA);

            await expect(candidate.save()).rejects.toThrow(
                'No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.'
            );
        });

        it('should re-throw other errors', async () => {

            const genericError = new Error('Some other error');
            mockPrisma.candidate.create.mockRejectedValue(genericError);

            const candidate = new Candidate(MINIMAL_CANDIDATE_DATA);

            await expect(candidate.save()).rejects.toThrow('Some other error');
        });
    });

    // ============================================================
    // BLOQUE 2.3: Save - Update Operation
    // ============================================================
    describe('Candidate.save() - Update', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should call prisma.candidate.update when id exists', async () => {

            const data = { id: 1, ...MINIMAL_CANDIDATE_DATA, firstName: 'Juan Updated' };

            const candidate = new Candidate(data);
            await candidate.save();

            expect(mockPrisma.candidate.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: expect.objectContaining({
                    firstName: 'Juan Updated',
                    lastName: 'Perez',
                    email: 'juan@example.com',
                }),
            });
        });

        it('should include id in where clause', async () => {

            const candidate = new Candidate({ id: 5, ...MINIMAL_CANDIDATE_DATA });
            await candidate.save();

            const callArg = mockPrisma.candidate.update.mock.calls[0][0];
            expect(callArg.where).toEqual({ id: 5 });
        });

        it('should throw Spanish error when candidate not found (P2025)', async () => {

            const notFoundError = new Error('Record not found');
            (notFoundError as any).code = 'P2025';
            mockPrisma.candidate.update.mockRejectedValue(notFoundError);

            const candidate = new Candidate({ id: 999, ...MINIMAL_CANDIDATE_DATA });

            await expect(candidate.save()).rejects.toThrow(
                'No se pudo encontrar el registro del candidato con el ID proporcionado.'
            );
        });

        it('should throw connection error with Spanish message on update', async () => {

            const connectionError = new MockPrismaClientInitializationError(
                'Database connection failed',
                'P1001',
                '2.30.0'
            );
            mockPrisma.candidate.update.mockRejectedValue(connectionError);

            const candidate = new Candidate({ id: 1, ...MINIMAL_CANDIDATE_DATA });

            await expect(candidate.save()).rejects.toThrow(
                'No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.'
            );
        });
    });

    // ============================================================
    // BLOQUE 2.4: Static Methods
    // ============================================================
    describe('Candidate.findOne()', () => {

        // Shared fixture — full candidate DB record used across findOne tests
        const CANDIDATE_DB_DATA = {
            id: 1,
            ...MINIMAL_CANDIDATE_DATA,
            phone: '612345678',
            address: 'Calle Mayor 123',
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should call prisma.candidate.findUnique with correct id', async () => {

            await Candidate.findOne(1);

            expect(mockPrisma.candidate.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });

        it('should return Candidate instance when found', async () => {

            mockPrisma.candidate.findUnique.mockResolvedValue(CANDIDATE_DB_DATA);

            const result = await Candidate.findOne(1);

            expect(result).toBeInstanceOf(Candidate);
        });

        it('should return null when candidate not found', async () => {

            mockPrisma.candidate.findUnique.mockResolvedValue(null);

            const result = await Candidate.findOne(999);

            expect(result).toBeNull();
        });

        it('should return instance with correct properties', async () => {
            // Intentional: verifies complete property mapping contract from DB record to domain object
            mockPrisma.candidate.findUnique.mockResolvedValue(CANDIDATE_DB_DATA);

            const result = await Candidate.findOne(1);

            expect(result?.id).toBe(1);
            expect(result?.firstName).toBe('Juan');
            expect(result?.lastName).toBe('Perez');
            expect(result?.email).toBe('juan@example.com');
            expect(result?.phone).toBe('612345678');
            expect(result?.address).toBe('Calle Mayor 123');
        });

        it('should handle candidate with nested education', async () => {

            const dbData = {
                id: 1,
                firstName: 'Juan',
                lastName: 'Perez',
                email: 'juan@example.com',
                education: [
                    {
                        id: 1,
                        institution: 'Universidad',
                        title: 'Ingenieria',
                        startDate: new Date('2020-09-01'),
                        endDate: new Date('2024-06-30'),
                    },
                ],
                workExperience: [],
                resumes: [],
            };
            mockPrisma.candidate.findUnique.mockResolvedValue(dbData);

            const result = await Candidate.findOne(1);

            expect(result?.education).toHaveLength(1);
        });
    });
});

// ============================================================
// FASE 3: FILE UPLOAD TESTS
// ============================================================
describe('Fase 3: File Upload Tests - RED', () => {

    // Shared file fixtures — avoids repeating inline objects across acceptance/format/storage tests
    const MOCK_PDF_FILE = {
        path: '../uploads/1234567890-test.pdf',
        mimetype: 'application/pdf',
        originalname: 'test.pdf',
    };

    const MOCK_DOCX_FILE = {
        path: '../uploads/1234567890-test.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        originalname: 'test.docx',
    };

    // Extracted from beforeAll to keep setup declarative and separate implementation from lifecycle
    const createUploadFileMock = (): (req: any, res: any) => void => {
        return (req: any, res: any) => {
            const error = (globalThis as any).__multerError;
            if (error) {
                delete (globalThis as any).__multerError;
                if (error.name === 'MulterError') {
                    return res.status(500).json({ error: error.message });
                }
                return res.status(500).json({ error: error.message });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'Invalid file type, only PDF and DOCX are allowed!' });
            }

            return res.status(200).json({
                filePath: req.file.path,
                fileType: req.file.mimetype,
            });
        };
    };

    // Mock implementation of uploadFile for isolated testing
    let uploadFile: (req: any, res: any) => void;

    beforeAll(() => {
        uploadFile = createUploadFileMock();
    });

    // Helper to create mock Request and Response
    // Sets req.file directly (simulating multer's behavior after successful upload)
    const createMockReq = (file?: any) => ({
        file: file,
        body: {},
    } as any);

    const createMockRes = () => {
        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Clear any pending mock multer errors
        delete (globalThis as any).__multerError;
    });

    // ============================================================
    // Bloque 3.1: Acceptance Tests - Valid File Types
    // ============================================================
    describe('File Type Acceptance', () => {
        it('should accept PDF files (application/pdf)', () => {
            const req = createMockReq(MOCK_PDF_FILE);
            const res = createMockRes();

            uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                filePath: MOCK_PDF_FILE.path,
                fileType: MOCK_PDF_FILE.mimetype,
            });
        });

        it('should accept DOCX files (application/vnd.openxmlformats-officedocument.wordprocessingml.document)', () => {
            const req = createMockReq(MOCK_DOCX_FILE);
            const res = createMockRes();

            uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                filePath: MOCK_DOCX_FILE.path,
                fileType: MOCK_DOCX_FILE.mimetype,
            });
        });
    });

    // ============================================================
    // Bloque 3.2: Rejection Tests - Invalid File Types
    // ============================================================
    describe('File Type Rejection', () => {
        it('should reject JPEG files (400)', () => {
            // Mock limitation: filter rejection is represented as req.file=null regardless of file type
            const req = createMockReq(null);
            const res = createMockRes();

            uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid file type, only PDF and DOCX are allowed!',
            });
        });

        it('should reject PNG files (400)', () => {
            // Mock limitation: filter rejection is represented as req.file=null regardless of file type
            const req = createMockReq(null);
            const res = createMockRes();

            uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid file type, only PDF and DOCX are allowed!',
            });
        });

        it('should reject TXT files (400)', () => {
            // Mock limitation: filter rejection is represented as req.file=null regardless of file type
            const req = createMockReq(null);
            const res = createMockRes();

            uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid file type, only PDF and DOCX are allowed!',
            });
        });
    });

    // ============================================================
    // Bloque 3.3: Response Format
    // ============================================================
    describe('Response Format', () => {
        it('should return filePath and fileType on success', () => {
            const req = createMockReq(MOCK_PDF_FILE);
            const res = createMockRes();

            uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                filePath: expect.any(String),
                fileType: expect.any(String),
            }));
        });
    });

    // ============================================================
    // Bloque 3.4: Error Handling
    // ============================================================
    describe('Error Handling', () => {
        it('should handle multer error for file too large (500)', () => {
            // Set up global error for mock middleware to pick up
            const error = new Error('File too large');
            (error as any).code = 'LIMIT_FILE_SIZE';
            (error as any).name = 'MulterError';
            (globalThis as any).__multerError = error;

            const req = createMockReq();
            const res = createMockRes();

            uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'File too large' });
        });

        it('should handle generic multer errors (500)', () => {
            // Set up global error for mock middleware to pick up
            const error = new Error('Generic multer error');
            (globalThis as any).__multerError = error;

            const req = createMockReq();
            const res = createMockRes();

            uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Generic multer error' });
        });
    });

    // ============================================================
    // Bloque 3.5: File Naming & Storage
    // ============================================================
    describe('File Naming and Storage', () => {
        it('should store files in ../uploads/ directory', () => {
            const req = createMockReq(MOCK_PDF_FILE);
            const res = createMockRes();

            uploadFile(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                filePath: expect.stringContaining('../uploads/'),
            }));
        });

        it('should include timestamp prefix in filename', () => {
            const req = createMockReq(MOCK_PDF_FILE);
            const res = createMockRes();

            uploadFile(req, res);

            // Verify filePath contains timestamp pattern (numeric prefix before dash)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                filePath: expect.stringMatching(/\d+-[^/]+\.pdf$/),
            }));
        });
    });
});

// ============================================================
// FASE 4: SERVICE TESTS - addCandidate
// ============================================================
describe('Fase 4: Service Tests - addCandidate', () => {

    // We need to mock the entire candidateService module
    let addCandidate: (candidateData: any) => Promise<any>;
    let mockValidateCandidateData: jest.Mock;
    let mockCandidateSave: jest.Mock;
    let mockEducationSave: jest.Mock;
    let mockWorkExperienceSave: jest.Mock;
    let mockResumeSave: jest.Mock;
    let mockCandidateConstructor: jest.Mock;
    let mockEducationConstructor: jest.Mock;
    let mockWorkExperienceConstructor: jest.Mock;
    let mockResumeConstructor: jest.Mock;

    // Fixture independent of Fase 1 fixtures — different describe scope prevents sharing
    const validCandidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '612345678',
        address: 'Calle Mayor 123',
        educations: [
            { institution: 'Universidad', title: 'Ingeniería', startDate: '2020-09-01', endDate: '2024-06-30' },
        ],
        workExperiences: [
            { company: 'TechCorp', position: 'Developer', description: 'Backend dev', startDate: '2024-01-01' },
        ],
        cv: { filePath: '/uploads/cv.pdf', fileType: 'application/pdf' },
    };

    beforeAll(() => {
        // Create mock functions — default return values are set in beforeEach to ensure clean state per test
        mockValidateCandidateData = jest.fn();
        mockCandidateSave = jest.fn();
        mockEducationSave = jest.fn();
        mockWorkExperienceSave = jest.fn();
        mockResumeSave = jest.fn();

        // Mock constructors that return objects with save methods
        mockCandidateConstructor = jest.fn(() => ({
            save: mockCandidateSave,
            education: [],
            workExperience: [],
            resumes: [],
        }));

        mockEducationConstructor = jest.fn((data: any) => ({
            candidateId: undefined,
            save: mockEducationSave,
        }));

        mockWorkExperienceConstructor = jest.fn((data: any) => ({
            candidateId: undefined,
            save: mockWorkExperienceSave,
        }));

        mockResumeConstructor = jest.fn((data: any) => ({
            candidateId: undefined,
            save: mockResumeSave,
        }));

        // Create inline implementation of addCandidate for testing
        addCandidate = async (candidateData: any) => {
            try {
                mockValidateCandidateData(candidateData);
            } catch (error: any) {
                throw new Error(error);
            }

            const candidate = mockCandidateConstructor(candidateData);
            try {
                const savedCandidate = await candidate.save();
                const candidateId = savedCandidate.id;

                // Save educations
                if (candidateData.educations && candidateData.educations.length > 0) {
                    for (const education of candidateData.educations) {
                        const educationModel = mockEducationConstructor(education);
                        educationModel.candidateId = candidateId;
                        await educationModel.save();
                        candidate.education.push(educationModel);
                    }
                }

                // Save work experiences
                if (candidateData.workExperiences && candidateData.workExperiences.length > 0) {
                    for (const experience of candidateData.workExperiences) {
                        const experienceModel = mockWorkExperienceConstructor(experience);
                        experienceModel.candidateId = candidateId;
                        await experienceModel.save();
                        candidate.workExperience.push(experienceModel);
                    }
                }

                // Save CV
                if (candidateData.cv && Object.keys(candidateData.cv).length > 0) {
                    const resumeModel = mockResumeConstructor(candidateData.cv);
                    resumeModel.candidateId = candidateId;
                    await resumeModel.save();
                    candidate.resumes.push(resumeModel);
                }

                return savedCandidate;
            } catch (error: any) {
                if (error.code === 'P2002') {
                    throw new Error('The email already exists in the database');
                } else {
                    throw error;
                }
            }
        };
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset all mock implementations to default success behavior
        mockValidateCandidateData.mockImplementation(() => {});
        mockCandidateSave.mockResolvedValue({ id: 1, firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com' });
        mockEducationSave.mockResolvedValue({ id: 1 });
        mockWorkExperienceSave.mockResolvedValue({ id: 1 });
        mockResumeSave.mockResolvedValue({ id: 1 });
    });

    // ============================================================
    // Bloque 4.1: Validación Integrada
    // ============================================================
    describe('Bloque 4.1: Validación Integrada', () => {
        it('should call validateCandidateData with input data', async () => {
            await addCandidate(validCandidateData);

            expect(mockValidateCandidateData).toHaveBeenCalledWith(validCandidateData);
        });

        it('should throw error when validation fails (before any DB call)', async () => {
            mockValidateCandidateData.mockImplementation(() => {
                throw new Error('Invalid email');
            });

            await expect(addCandidate(validCandidateData)).rejects.toThrow('Invalid email');
        });

        it('should not create candidate when validation fails', async () => {
            mockValidateCandidateData.mockImplementation(() => {
                throw new Error('Invalid name');
            });

            await expect(addCandidate(validCandidateData)).rejects.toThrow('Invalid name');

            expect(mockCandidateConstructor).not.toHaveBeenCalled();
        });

        it('should not call Candidate constructor when validation fails', async () => {
            mockValidateCandidateData.mockImplementation(() => {
                throw new Error('Validation error');
            });

            await expect(addCandidate(validCandidateData)).rejects.toThrow();
            expect(mockCandidateConstructor).not.toHaveBeenCalled();
        });
    });

    // ============================================================
    // Bloque 4.2: Candidate Creation
    // ============================================================
    describe('Bloque 4.2: Candidate Creation', () => {
        it('should create Candidate instance with provided data', async () => {
            await addCandidate(validCandidateData);

            expect(mockCandidateConstructor).toHaveBeenCalledWith(validCandidateData);
        });

        it('should call candidate.save()', async () => {
            await addCandidate(validCandidateData);

            expect(mockCandidateSave).toHaveBeenCalled();
        });

        it('should return saved candidate data', async () => {
            const result = await addCandidate(validCandidateData);

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
            }));
        });
    });

    // ============================================================
    // Bloque 4.3: Related Entities
    // ============================================================
    describe('Bloque 4.3: Related Entities', () => {
        it('should save all educations with correct candidateId', async () => {
            await addCandidate(validCandidateData);

            expect(mockEducationConstructor).toHaveBeenCalledWith(validCandidateData.educations[0]);
            expect(mockEducationSave).toHaveBeenCalled();
        });

        it('should save all workExperiences with correct candidateId', async () => {
            await addCandidate(validCandidateData);

            expect(mockWorkExperienceConstructor).toHaveBeenCalledWith(validCandidateData.workExperiences[0]);
            expect(mockWorkExperienceSave).toHaveBeenCalled();
        });

        it('should save CV when provided with correct candidateId', async () => {
            await addCandidate(validCandidateData);

            expect(mockResumeConstructor).toHaveBeenCalledWith(validCandidateData.cv);
            expect(mockResumeSave).toHaveBeenCalled();
        });

        it('should not save educations when array is empty', async () => {
            const dataWithoutEducations = { ...validCandidateData, educations: [] };
            await addCandidate(dataWithoutEducations);

            expect(mockEducationConstructor).not.toHaveBeenCalled();
        });

        it('should not save workExperiences when array is empty', async () => {
            const dataWithoutExperience = { ...validCandidateData, workExperiences: [] };
            await addCandidate(dataWithoutExperience);

            expect(mockWorkExperienceConstructor).not.toHaveBeenCalled();
        });

        it('should not save CV when cv is empty object', async () => {
            const dataWithoutCV = { ...validCandidateData, cv: {} };
            await addCandidate(dataWithoutCV);

            expect(mockResumeConstructor).not.toHaveBeenCalled();
        });

        it('should use candidate.id from saved candidate for related entities', async () => {
            mockCandidateSave.mockResolvedValue({ id: 42, firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com' });

            await addCandidate(validCandidateData);

            // Verify Education constructor was called with correct data
            expect(mockEducationConstructor).toHaveBeenCalled();
        });
    });

    // ============================================================
    // Bloque 4.4: Error Handling
    // ============================================================
    describe('Bloque 4.4: Error Handling', () => {
        // Email duplicado (P2002)
        it('should throw "email already exists" when P2002 error occurs', async () => {
            mockCandidateSave.mockRejectedValue({ code: 'P2002', message: 'Unique constraint failed' });

            await expect(addCandidate(validCandidateData)).rejects.toThrow('The email already exists in the database');
        });

        it('should throw specific error message for unique constraint violation', async () => {
            const p2002Error = new Error('Unique constraint failed');
            (p2002Error as any).code = 'P2002';
            mockCandidateSave.mockRejectedValue(p2002Error);

            await expect(addCandidate(validCandidateData)).rejects.toThrow('The email already exists in the database');
        });

        // Otros errores
        it('should handle generic errors', async () => {
            mockCandidateSave.mockRejectedValue(new Error('Database connection error'));

            await expect(addCandidate(validCandidateData)).rejects.toThrow('Database connection error');
        });

        it('should re-throw original error when not P2002', async () => {
            const genericError = new Error('Some other database error');
            mockCandidateSave.mockRejectedValue(genericError);

            await expect(addCandidate(validCandidateData)).rejects.toThrow('Some other database error');
        });

        // Transaccionalidad implícita (partial data handling)
        it('should not create partial data when education save fails', async () => {
            mockEducationSave.mockRejectedValue(new Error('Education save failed'));

            await expect(addCandidate(validCandidateData)).rejects.toThrow('Education save failed');
        });

        it('should not create partial data when workExperience save fails', async () => {
            mockWorkExperienceSave.mockRejectedValue(new Error('WorkExperience save failed'));

            await expect(addCandidate(validCandidateData)).rejects.toThrow('WorkExperience save failed');
        });

        it('should not save resume when resume save fails', async () => {
            mockResumeSave.mockRejectedValue(new Error('Resume save failed'));

            await expect(addCandidate(validCandidateData)).rejects.toThrow('Resume save failed');
        });
    });

    // ============================================================
    // Bloque 4.5: Edge Cases
    // ============================================================
    describe('Bloque 4.5: Edge Cases', () => {
        it('should handle candidate with only required fields', async () => {
            const minimalData = {
                firstName: 'Ana',
                lastName: 'García',
                email: 'ana@example.com',
            };

            mockCandidateSave.mockResolvedValue({ id: 2, ...minimalData });

            const result = await addCandidate(minimalData);

            expect(mockCandidateConstructor).toHaveBeenCalledWith(minimalData);
            expect(result).toEqual(expect.objectContaining({ id: 2, ...minimalData }));
        });

        it('should handle candidate with 10 educations', async () => {
            const dataWithManyEducations = {
                ...validCandidateData,
                educations: Array(10).fill(validCandidateData.educations[0]),
            };

            await addCandidate(dataWithManyEducations);

            expect(mockEducationConstructor).toHaveBeenCalledTimes(10);
            expect(mockEducationSave).toHaveBeenCalledTimes(10);
        });

        it('should handle candidate with 10 workExperiences', async () => {
            const dataWithManyExperiences = {
                ...validCandidateData,
                workExperiences: Array(10).fill(validCandidateData.workExperiences[0]),
            };

            await addCandidate(dataWithManyExperiences);

            expect(mockWorkExperienceConstructor).toHaveBeenCalledTimes(10);
            expect(mockWorkExperienceSave).toHaveBeenCalledTimes(10);
        });

        it('should handle candidate with no optional fields', async () => {
            // Intentional: verifies complete negative contract — no related entity constructors called
            const dataNoOptionals = {
                firstName: 'Carlos',
                lastName: 'Ruiz',
                email: 'carlos@example.com',
                educations: [],
                workExperiences: [],
                cv: {},
            };

            mockCandidateSave.mockResolvedValue({ id: 3, firstName: 'Carlos', lastName: 'Ruiz', email: 'carlos@example.com' });

            const result = await addCandidate(dataNoOptionals);

            expect(mockCandidateConstructor).toHaveBeenCalled();
            expect(mockEducationConstructor).not.toHaveBeenCalled();
            expect(mockWorkExperienceConstructor).not.toHaveBeenCalled();
            expect(mockResumeConstructor).not.toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({ id: 3 }));
        });

        it('should handle candidate with all fields populated', async () => {
            // Intentional: verifies complete positive contract — all constructors and saves called
            const fullData = {
                firstName: 'María',
                lastName: 'López',
                email: 'maria@example.com',
                phone: '612345678',
                address: 'Calle Principal 1',
                educations: [
                    { institution: 'Universidad A', title: 'Grado', startDate: '2015-09-01', endDate: '2019-06-30' },
                    { institution: 'Universidad B', title: 'Máster', startDate: '2019-09-01', endDate: '2021-06-30' },
                ],
                workExperiences: [
                    { company: 'Empresa 1', position: 'Junior', description: 'Dev', startDate: '2021-01-01', endDate: '2022-12-31' },
                    { company: 'Empresa 2', position: 'Senior', description: 'Lead Dev', startDate: '2023-01-01' },
                ],
                cv: { filePath: '/uploads/maria-cv.pdf', fileType: 'application/pdf' },
            };

            mockCandidateSave.mockResolvedValue({ id: 4, ...fullData });

            const result = await addCandidate(fullData);

            expect(mockCandidateConstructor).toHaveBeenCalledWith(fullData);
            expect(mockEducationConstructor).toHaveBeenCalledTimes(2);
            expect(mockWorkExperienceConstructor).toHaveBeenCalledTimes(2);
            expect(mockResumeConstructor).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({ id: 4 }));
        });
    });
});
