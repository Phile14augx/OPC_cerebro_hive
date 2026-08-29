import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TransformationEngineService {
  private readonly logger = new Logger(TransformationEngineService.name);

  async triggerJob(jobName: string, parameters: Record<string, any>): Promise<string> {
    this.logger.log(`Triggering transformation job: ${jobName}`);

    try {
      // 1. Transformation Logic: Pipeline Step Executor
      const transformedData = this.applyTransformations(parameters.data, parameters.rules);

      // 2. Call P44 Anonymize Privacy Intelligence
      const anonymizeRes = await fetch('http://p44-privacy:3000/v1/privacy/anonymize', {
        method: 'POST',
        body: JSON.stringify({ payload: transformedData }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      let finalData = transformedData;
      if (anonymizeRes.ok) {
        const result = await anonymizeRes.json();
        finalData = result.data || transformedData;
      } else {
        this.logger.warn('Anonymize service failed, using transformed data as fallback or rejecting.');
        throw new Error('Anonymization failed');
      }

      // 3. Call P48 Evaluation Lab (Publish datasets)
      const evalRes = await fetch('http://p48-eval:3000/api/v1/datasets', {
        method: 'POST',
        body: JSON.stringify({ name: jobName, data: finalData }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!evalRes.ok) {
        throw new Error('Evaluation Lab dataset creation failed');
      }

      // 4. Call P47 Telemetry
      await fetch('http://p47-observability:3000/v1/telemetry/traces', {
        method: 'POST',
        body: JSON.stringify({ jobName, status: 'SUCCESS', recordCount: finalData.length }),
        headers: { 'Content-Type': 'application/json' }
      });

      return `job-${Date.now()}`;
    } catch (error: any) {
      this.logger.error(`Transformation job failed: ${error.message}`);
      
      // Call P47 Telemetry on failure
      await fetch('http://p47-observability:3000/v1/telemetry/traces', {
        method: 'POST',
        body: JSON.stringify({ jobName, status: 'FAILED', error: error.message }),
        headers: { 'Content-Type': 'application/json' }
      }).catch(e => this.logger.error('Failed to send failure telemetry', e));

      throw error;
    }
  }

  applyTransformations(data: any[], rules: any[]): any[] {
    if (!data || !rules) return data || [];
    
    return data.map(record => {
      const newRecord = { ...record };
      for (const rule of rules) {
        if (rule.type === 'cast' && newRecord[rule.field] !== undefined) {
          if (rule.targetType === 'string') {
            newRecord[rule.field] = String(newRecord[rule.field]);
          } else if (rule.targetType === 'number') {
            newRecord[rule.field] = Number(newRecord[rule.field]);
          }
        }
        if (rule.type === 'drop' && newRecord[rule.field] !== undefined) {
          delete newRecord[rule.field];
        }
      }
      return newRecord;
    });
  }

  async getJobStatus(jobId: string): Promise<string> {
    this.logger.log(`Getting status for job: ${jobId}`);
    return 'SUCCESS';
  }
}
