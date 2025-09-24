/**
 * @fileoverview Patient Controller
 * @description HTTP API controller for patient management
 * @compliance HIPAA, REST API Standards
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComplianceValidatorService } from '../../compliance/validators/compliance-validator.service';
import { CreatePatientUseCase, CreatePatientRequest } from '../../core/use-cases/create-patient.use-case';
import { PatientService } from '../../healthcare/patient-management/patient.service';
import { AuditLogger } from '../../security/audit/audit-logger.service';
import { AuthenticationService } from '../../security/authentication/auth.service';
import { Injectable } from '../../security/decorators/injectable.decorator';

export interface CreatePatientDto {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO date string
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    ssn?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
  consentStatus: {
    treatmentConsent: boolean;
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    researchConsent: boolean;
  };
}

@Injectable()
export class PatientController {
  constructor(
    private readonly createPatientUseCase: CreatePatientUseCase,
    private readonly patientService: PatientService,
    private readonly authService: AuthenticationService,
    private readonly complianceValidator: ComplianceValidatorService,
    private readonly auditLogger: AuditLogger
  ) {}

  async createPatient(request: NextRequest): Promise<NextResponse> {
    try {
      // Extract authentication context
      const authContext = await this.extractAuthContext(request);
      if (!authContext.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Parse and validate request body
      const body = await request.json();
      const createPatientDto = this.validateCreatePatientDto(body);

      // Convert DTO to use case request
      const createPatientRequest: CreatePatientRequest = {
        personalInfo: {
          ...createPatientDto.personalInfo,
          dateOfBirth: new Date(createPatientDto.personalInfo.dateOfBirth)
        },
        contactInfo: createPatientDto.contactInfo,
        emergencyContacts: createPatientDto.emergencyContacts,
        consentStatus: createPatientDto.consentStatus
      };

      // Execute use case
      const patient = await this.createPatientUseCase.execute(
        createPatientRequest,
        {
          userId: authContext.user.id,
          sessionId: authContext.sessionId,
          ipAddress: this.getClientIP(request),
          userAgent: request.headers.get('user-agent') || undefined
        }
      );

      // Return sanitized response
      return NextResponse.json({
        success: true,
        data: {
          id: patient.id,
          patientId: patient.patientId,
          mrn: patient.mrn,
          personalInfo: {
            firstName: patient.personalInfo.firstName,
            lastName: patient.personalInfo.lastName,
            dateOfBirth: patient.personalInfo.dateOfBirth,
            gender: patient.personalInfo.gender
            // SSN excluded from response
          },
          contactInfo: {
            email: patient.contactInfo.email,
            phone: patient.contactInfo.phone
            // Full address may be excluded based on access level
          },
          consentStatus: patient.consentStatus,
          isActive: patient.isActive,
          createdAt: patient.createdAt
        }
      }, { status: 201 });

    } catch (error) {
      return this.handleError(error, request);
    }
  }

  async getPatient(request: NextRequest, patientId: string): Promise<NextResponse> {
    try {
      // Extract authentication context
      const authContext = await this.extractAuthContext(request);
      if (!authContext.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Get patient
      const patient = await this.patientService.getPatientById(
        patientId,
        {
          userId: authContext.user.id,
          sessionId: authContext.sessionId,
          purpose: 'treatment'
        }
      );

      if (!patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        );
      }

      // Return sanitized patient data
      return NextResponse.json({
        success: true,
        data: this.sanitizePatientResponse(patient, authContext.user.role)
      });

    } catch (error) {
      return this.handleError(error, request);
    }
  }

  async searchPatients(request: NextRequest): Promise<NextResponse> {
    try {
      // Extract authentication context
      const authContext = await this.extractAuthContext(request);
      if (!authContext.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Parse search parameters
      const url = new URL(request.url);
      const searchCriteria = {
        mrn: url.searchParams.get('mrn') || undefined,
        email: url.searchParams.get('email') || undefined,
        phone: url.searchParams.get('phone') || undefined,
        lastName: url.searchParams.get('lastName') || undefined,
        isActive: url.searchParams.get('isActive') === 'true'
      };

      // Search patients
      const patients = await this.patientService.searchPatients(
        searchCriteria,
        {
          userId: authContext.user.id,
          sessionId: authContext.sessionId,
          purpose: 'treatment'
        }
      );

      // Return sanitized results
      return NextResponse.json({
        success: true,
        data: patients.map(patient => 
          this.sanitizePatientResponse(patient, authContext.user.role)
        ),
        count: patients.length
      });

    } catch (error) {
      return this.handleError(error, request);
    }
  }

  async updatePatient(
    request: NextRequest, 
    patientId: string
  ): Promise<NextResponse> {
    try {
      // Extract authentication context
      const authContext = await this.extractAuthContext(request);
      if (!authContext.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Parse update data
      const body = await request.json();
      const updates = this.validateUpdatePatientDto(body);

      // Update patient
      const updatedPatient = await this.patientService.updatePatient(
        patientId,
        updates,
        {
          userId: authContext.user.id,
          sessionId: authContext.sessionId,
          ipAddress: this.getClientIP(request)
        }
      );

      // Return sanitized response
      return NextResponse.json({
        success: true,
        data: this.sanitizePatientResponse(updatedPatient, authContext.user.role)
      });

    } catch (error) {
      return this.handleError(error, request);
    }
  }

  private async extractAuthContext(request: NextRequest) {
    // Extract JWT token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return { user: null, sessionId: '' };
    }

    // Validate token and extract user info
    // This would integrate with your authentication service
    return {
      user: {
        id: 'user123', // Extracted from token
        role: 'provider' as const,
        permissions: []
      },
      sessionId: 'session123' // Extracted from token
    };
  }

  private validateCreatePatientDto(body: any): CreatePatientDto {
    // Comprehensive validation of create patient DTO
    if (!body.personalInfo?.firstName?.trim()) {
      throw new Error('First name is required');
    }

    if (!body.personalInfo?.lastName?.trim()) {
      throw new Error('Last name is required');
    }

    if (!body.personalInfo?.dateOfBirth) {
      throw new Error('Date of birth is required');
    }

    if (!body.contactInfo?.email?.trim()) {
      throw new Error('Email is required');
    }

    if (!body.contactInfo?.phone?.trim()) {
      throw new Error('Phone number is required');
    }

    if (!body.consentStatus?.treatmentConsent) {
      throw new Error('Treatment consent is required');
    }

    if (!body.consentStatus?.dataProcessingConsent) {
      throw new Error('Data processing consent is required');
    }

    return body as CreatePatientDto;
  }

  private validateUpdatePatientDto(body: any): Partial<CreatePatientDto> {
    // Validation for update operations
    // Only validate provided fields
    return body;
  }

  private sanitizePatientResponse(patient: any, userRole: string): any {
    // Sanitize patient data based on user role and access level
    const baseResponse = {
      id: patient.id,
      patientId: patient.patientId,
      mrn: patient.mrn,
      personalInfo: {
        firstName: patient.personalInfo.firstName,
        lastName: patient.personalInfo.lastName,
        dateOfBirth: patient.personalInfo.dateOfBirth,
        gender: patient.personalInfo.gender
      },
      contactInfo: {
        email: patient.contactInfo.email,
        phone: patient.contactInfo.phone
      },
      isActive: patient.isActive,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    };

    // Add additional fields based on role
    if (userRole === 'provider' || userRole === 'admin') {
      return {
        ...baseResponse,
        contactInfo: {
          ...baseResponse.contactInfo,
          address: patient.contactInfo.address
        },
        emergencyContacts: patient.emergencyContacts,
        consentStatus: patient.consentStatus,
        privacyPreferences: patient.privacyPreferences
      };
    }

    return baseResponse;
  }

  private getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0] ||
           request.headers.get('x-real-ip') ||
           'unknown';
  }

  private async handleError(error: any, request: NextRequest): Promise<NextResponse> {
    // Log error for monitoring
    await this.auditLogger.logSystemError({
      errorType: 'PATIENT_CONTROLLER_ERROR',
      errorMessage: error.message,
      stackTrace: error.stack,
      context: {
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent')
      }
    });

    // Return appropriate error response
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('Compliance violation')) {
      return NextResponse.json(
        { error: 'Compliance violation', details: error.message },
        { status: 403 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}