/**
 * Document status in the processing pipeline.
 */
export enum DocumentStatus {
  UPLOADED = 'uploaded',
  EXTRACTING = 'extracting',
  CLEANING = 'cleaning',
  CHUNKING = 'chunking',
  SYNTHESIZING = 'synthesizing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * DTO for a document entity.
 */
export interface DocumentDto {
  id: string;
  filename: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for an audio chunk within a document's playlist.
 */
export interface AudioChunkDto {
  id: string;
  documentId: string;
  index: number;
  url: string;
  durationMs: number;
}

/**
 * Response DTO for a document's playlist of audio chunks.
 */
export interface PlaylistDto {
  documentId: string;
  title: string;
  chunks: AudioChunkDto[];
}

/**
 * Response DTO for the upload endpoint.
 */
export interface UploadResponseDto {
  documentId: string;
  filename: string;
  status: DocumentStatus;
}
