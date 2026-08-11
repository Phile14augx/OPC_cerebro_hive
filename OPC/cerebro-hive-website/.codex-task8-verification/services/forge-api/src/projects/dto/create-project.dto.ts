import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'Natural language build prompt' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  prompt?: string;

  @ApiPropertyOptional({ description: 'Workspace UUID — falls back to FORGE_DEFAULT_WORKSPACE_ID env var' })
  @IsOptional()
  @IsUUID()
  workspaceId?: string;

  @ApiPropertyOptional({ description: 'Frameworks / tech hints', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  frameworks?: string[];
}
