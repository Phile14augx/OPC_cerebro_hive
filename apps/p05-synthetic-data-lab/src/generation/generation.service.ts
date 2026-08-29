export class GenerationService {
  async triggerGeneration(payload: { id: string; type: string; schema: any; targetRows: number }) {
    if (!payload || !payload.id || !payload.schema || typeof payload.targetRows !== 'number') {
      throw new Error('Invalid generation payload');
    }

    return {
      id: payload.id,
      status: 'completed',
      result: {
        rows: payload.targetRows,
        schema: payload.schema
      }
    };
  }
}
