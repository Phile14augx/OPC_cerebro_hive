import { Injectable } from '@nestjs/common';

export interface ScanResult {
  flagged: boolean;
  matchedPattern: string | null;
}

@Injectable()
export class AdversarialService {
  private readonly injectionPatterns = [
    /ignore all previous instructions/i,
    /you are a hacker/i,
    /forget everything/i,
    /bypass security/i,
    /system prompt/i,
  ];

  scanForInjection(text: string): ScanResult {
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(text)) {
        return { flagged: true, matchedPattern: pattern.source };
      }
    }
    return { flagged: false, matchedPattern: null };
  }

  create(jobDto: any) {
    return {
      job_id: 'adv_' + Math.random().toString(36).substring(7),
      status: 'RUNNING',
    };
  }
}
