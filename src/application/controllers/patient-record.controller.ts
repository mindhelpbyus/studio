/**
 * Patient Record API Controller
 * Application layer controllers following Clean Architecture principles
 */

import { Request, Response } from 'express';
import { PatientRecordUseCase, VitalSignsUseCase, MedicationUseCase, EHRCompositeUseCase } from '../../core/use-cases/patient-record.usecase';
import { SearchQuery } from '../../core/repositories/patient-record.repository';

export class PatientRecordController {
  constructor(
    private patientRecordUseCase: PatientRecordUseCase,
    private vitalsUseCase: VitalSignsUseCase,
    private medicationUseCase: MedicationUseCase,
    private ehrCompositeUseCase: EHRCompositeUseCase
  ) {}

  private getUserId(req: Request): string | null {
    const userId = req.headers['x-user-id'];
    return typeof userId === 'string' ? userId : null;
  }

  async getPatientRecord(req: Request, res: Response) {
    try {
      const { recordId } = req.params;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const record = await this.patientRecordUseCase.getPatientRecord(recordId, userId);
      if (!record) {
        return res.status(404).json({ error: 'Patient record not found' });
      }

      res.json({ success: true, data: record });
    } catch (error) {
      console.error('Error fetching patient record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createPatientRecord(req: Request, res: Response) {
    try {
      const { patientId } = req.body;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!patientId) {
        return res.status(400).json({ error: 'Patient ID is required' });
      }

      const record = await this.patientRecordUseCase.createPatientRecord(patientId, userId);
      res.status(201).json({ success: true, data: record });
    } catch (error) {
      console.error('Error creating patient record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updatePatientRecord(req: Request, res: Response) {
    try {
      const { recordId } = req.params;
      const updates = req.body;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const record = await this.patientRecordUseCase.updatePatientRecord(recordId, updates, userId);
      res.json({ success: true, data: record });
    } catch (error) {
      console.error('Error updating patient record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async searchPatientRecords(req: Request, res: Response) {
    try {
      const query: SearchQuery = req.query as SearchQuery;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const records = await this.patientRecordUseCase.searchPatientRecords(query, userId);
      res.json({ success: true, data: records });
    } catch (error) {
      console.error('Error searching patient records:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async recordVitalSigns(req: Request, res: Response) {
    try {
      const { recordId } = req.params;
      const vitalsData = req.body;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      vitalsData.recordedBy = userId;
      vitalsData.recordedAt = new Date();

      const vitals = await this.vitalsUseCase.recordVitalSigns(recordId, userId, vitalsData);
      res.status(201).json({ success: true, data: vitals });
    } catch (error) {
      console.error('Error recording vital signs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getVitalTrends(req: Request, res: Response) {
    try {
      const { recordId, vitalType } = req.params;
      const { days } = req.query;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const trends = await this.vitalsUseCase.getVitalTrends(
        recordId,
        userId,
        vitalType,
        parseInt(days as string, 10) || 30
      );

      res.json({ success: true, data: trends });
    } catch (error) {
      console.error('Error getting vital trends:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getVitalAlerts(req: Request, res: Response) {
    try {
      const { recordId } = req.params;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const alerts = await this.vitalsUseCase.getVitalAlerts(recordId, userId);
      res.json({ success: true, data: alerts });
    } catch (error) {
      console.error('Error getting vital alerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async prescribeMedication(req: Request, res: Response) {
    try {
      const { recordId } = req.params;
      const medicationData = req.body;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      medicationData.prescribedBy = userId;
      medicationData.startDate = medicationData.startDate || new Date();

      const medication = await this.medicationUseCase.prescribeMedication(
        recordId,
        userId,
        medicationData
      );

      res.status(201).json({ success: true, data: medication });
    } catch (error) {
      console.error('Error prescribing medication:', error);
      if (error instanceof Error && (error.message.includes('allergy') || error.message.includes('interaction'))) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getActiveMedications(req: Request, res: Response) {
    try {
      const { recordId } = req.params;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const medications = await this.medicationUseCase.getActiveMedications(recordId, userId);
      res.json({ success: true, data: medications });
    } catch (error) {
      console.error('Error getting active medications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getInteractionAlerts(req: Request, res: Response) {
    try {
      const { recordId } = req.params;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const alerts = await this.medicationUseCase.getInteractionAlerts(recordId, userId);
      res.json({ success: true, data: alerts });
    } catch (error) {
      console.error('Error getting interaction alerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCompleteRecord(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const record = await this.ehrCompositeUseCase.getCompleteRecord(patientId, userId);
      res.json({ success: true, data: record });
    } catch (error) {
      console.error('Error getting complete record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPatientSummary(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const summary = await this.ehrCompositeUseCase.getPatientSummary(patientId, userId);
      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Error getting patient summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getClinicalAlerts(req: Request, res: Response) {
    try {
      const { recordId } = req.params;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const alerts = await this.ehrCompositeUseCase.getClinicalAlerts(recordId, userId);
      res.json({ success: true, data: alerts });
    } catch (error) {
      console.error('Error getting clinical alerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getRecentActivity(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const { days } = req.query;
      const userId = this.getUserId(req);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const activity = await this.ehrCompositeUseCase.getRecentActivity(
        patientId,
        userId,
        parseInt(days as string, 10) || 7
      );

      res.json({ success: true, data: activity });
    } catch (error) {
      console.error('Error getting recent activity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
