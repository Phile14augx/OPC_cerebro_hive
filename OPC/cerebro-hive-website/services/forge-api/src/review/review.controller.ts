import { Controller, Post, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewService } from './review.service';

@ApiTags('Review')
@ApiBearerAuth()
@Controller('forge/projects/:id/review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Run Security + Architect agents to review generated code' })
  review(@Param('id') id: string) {
    return this.reviewService.review(id);
  }
}
