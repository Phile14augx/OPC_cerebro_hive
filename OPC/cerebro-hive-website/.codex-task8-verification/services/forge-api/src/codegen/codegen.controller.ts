import { Controller, Post, Param, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { CodegenService } from './codegen.service';

@ApiTags('Codegen')
@ApiBearerAuth()
@Controller('forge/projects/:id/codegen')
export class CodegenController {
  constructor(private readonly codegenService: CodegenService) {}

  /**
   * POST /forge/projects/:id/codegen/start
   * Returns a text/event-stream SSE response.
   * Each event is a JSON-encoded CodegenEvent.
   */
  @Post('start')
  @ApiOperation({ summary: 'Start code generation — streams SSE events' })
  async start(@Param('id') id: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      for await (const event of this.codegenService.generateCode(id)) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
        // Flush per-chunk so the client sees real-time output
        if (typeof (res as any).flush === 'function') (res as any).flush();
        if (event.type === 'done' || event.type === 'error') break;
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      res.write(`data: ${JSON.stringify({ type: 'error', error })}\n\n`);
    } finally {
      res.end();
    }
  }
}
