// Auto-generated type definitions for legal documents
// Package version: 0.6.1

export interface Policy {
  markdown: string;
  html: string;
  plainText: string;
  metadata: {
    version: string;
    lastUpdated: string;
    filename: string;
    hash: string;
    [key: string]: any;
  };
}

export const privacyPolicy: Policy;
export const termsOfUse: Policy;
export const ispAspPrivacyNotice: Policy;
export const idxPrivacyNotice: Policy;
export const relyingPartyAgreement: Policy;

export declare const allDocuments: {
  privacyPolicy: Policy;
  termsOfUse: Policy;
  ispAspPrivacyNotice: Policy;
  idxPrivacyNotice: Policy;
  relyingPartyAgreement: Policy;
};
