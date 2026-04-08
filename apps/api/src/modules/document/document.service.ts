import { Injectable } from '@nestjs/common';
import { DocumentDto, DocumentStatus } from '@tech-audiobook/shared-types';

@Injectable()
export class DocumentService {
  private documents: DocumentDto[] = [];

  findAll(): DocumentDto[] {
    return this.documents;
  }

  findById(id: string): DocumentDto | undefined {
    return this.documents.find((doc) => doc.id === id);
  }

  create(filename: string): DocumentDto {
    const now = new Date().toISOString();
    const doc: DocumentDto = {
      id: crypto.randomUUID(),
      filename,
      status: DocumentStatus.UPLOADED,
      createdAt: now,
      updatedAt: now,
    };
    this.documents.push(doc);
    return doc;
  }
}
