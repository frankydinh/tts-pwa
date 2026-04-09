import { DocumentStatus } from '@tech-audiobook/shared-types';

/**
 * Response DTO returned from GET /api/documents/:id
 */
export interface DocumentResponseDto {
  id: string;
  filename: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}
