/**
 * React hook for fetching legal documents at runtime
 * This ensures users always see the latest policies without requiring app rebuilds
 */

import { useState, useEffect } from 'react';

export interface LegalDocument {
  markdown: string;
  html: string;
  plainText: string;
  metadata: {
    title: string;
    description?: string;
    type?: string;
    author?: string;
    jurisdiction?: string;
    version: string;
    lastUpdated: string;
    filename: string;
    hash: string;
  };
}

export interface LegalManifest {
  version: string;
  generated: string;
  documents: {
    [key: string]: {
      version: string;
      lastUpdated: string;
      title: string;
      url: string;
    };
  };
}

interface UseLegalDocumentOptions {
  baseUrl?: string;
  throwOnError?: boolean;
}

interface UseLegalDocumentReturn {
  document: LegalDocument | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export type DocumentType = 
  | 'privacyPolicy' 
  | 'termsOfUse' 
  | 'ispAspPrivacyNotice' 
  | 'idxPrivacyNotice' 
  | 'relyingPartyAgreement';

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_LEGAL_API_URL || 'https://api.comms.id/legal';

/**
 * Hook to fetch a specific legal document at runtime
 */
export function useLegalDocument(
  documentType: DocumentType,
  options: UseLegalDocumentOptions = {}
): UseLegalDocumentReturn {
  const { baseUrl = DEFAULT_BASE_URL, throwOnError = false } = options;
  
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${baseUrl}/${documentType}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${documentType}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDocument(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (throwOnError) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [documentType, baseUrl]);

  return {
    document,
    loading,
    error,
    refetch: fetchDocument
  };
}

/**
 * Hook to fetch the manifest of all available legal documents
 */
export function useLegalManifest(
  options: UseLegalDocumentOptions = {}
): {
  manifest: LegalManifest | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { baseUrl = DEFAULT_BASE_URL, throwOnError = false } = options;
  
  const [manifest, setManifest] = useState<LegalManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchManifest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${baseUrl}/manifest.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.statusText}`);
      }
      
      const data = await response.json();
      setManifest(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (throwOnError) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManifest();
  }, [baseUrl]);

  return {
    manifest,
    loading,
    error,
    refetch: fetchManifest
  };
}