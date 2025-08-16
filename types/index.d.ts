/**
 * Type definitions for Comms.ID Legal Documents build system
 */

export interface DocumentVersion {
  version: string;
  lastContentHash: string;
}

export interface DocumentVersions {
  [filename: string]: DocumentVersion;
}

export interface DocumentMetadata {
  title?: string;
  description?: string;
  type?: string;
  author?: string;
  jurisdiction?: string;
  role?: string;
  version: string;
  lastUpdated: string;
  filename: string;
  hash: string;
}

export interface ProcessedDocument {
  markdown: string;
  html: string;
  plainText: string;
  metadata: DocumentMetadata;
}

export interface FileMap {
  [filename: string]: string;
}

export interface BuildConfig {
  rootDir: string;
  srcDir: string;
  distDir: string;
  versionsFile: string;
  fileMap: FileMap;
}