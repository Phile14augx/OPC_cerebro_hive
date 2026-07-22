'use server';

import { z } from 'zod';
import { PmService } from '@/lib/services/pm.service';
import { getLocalSession } from '@/app/actions/auth';
import { pmAgentQueue } from '@/lib/queue/client';

const DecomposeEpicSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Description body is required'),
  promptTemplate: z.string().min(1, 'Prompt template is required'),
});

export async function processEpicDecompositionAction(formData: FormData) {
  try {
    const session = await getLocalSession();
    if (!session?.userId) {
      return { error: 'Unauthorized' };
    }

    const data = {
      projectId: formData.get('projectId'),
      title: formData.get('title'),
      body: formData.get('body'),
      promptTemplate: formData.get('promptTemplate'),
    };

    const validated = DecomposeEpicSchema.parse(data);

    // Offload to BullMQ for background processing instead of waiting synchronously for the LLM
    const jobId = await pmAgentQueue.add('decomposeEpic', {
      ...validated,
      userId: session.userId,
    });

    return { success: true, jobId: jobId.id };
  } catch (error) {
    console.error('Action failed:', error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'An unexpected error occurred while queueing the epic decomposition.' };
  }
}
