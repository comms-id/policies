# Comms.ID Legal Documents - Usage Guide

This package provides Comms.ID legal documents (Privacy Policy, Terms of Use, etc.) in multiple formats for use across applications.

## Installation

This package is published to GitHub Packages (not public npm). You must configure authentication first.

### 1. Configure GitHub Packages Authentication

In your project root, create or update `.npmrc`:

```bash
@comms-id:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

Set your GitHub token (needs `read:packages` scope):

```bash
# .env.local
GITHUB_PACKAGES_TOKEN=your_github_token_here
```

### 2. Install Package

```bash
pnpm add @comms-id/legal-documents
```

## Available Documents

```typescript
import { 
  privacyPolicy,           // Main privacy policy
  termsOfUse,              // Terms of use
  ispAspPrivacyNotice,     // ISP/ASP privacy notice
  idxPrivacyNotice,        // IDX privacy notice
  relyingPartyAgreement,   // Relying party agreement
  allDocuments             // Object containing all documents
} from "@comms-id/legal-documents";
```

## Document Structure

Each document provides:

```typescript
{
  markdown: string;    // Original markdown with version/date
  html: string;        // Rendered HTML (links as href="#")
  plainText: string;   // Plain text version
  metadata: {
    title: string;
    description: string;
    type: string;
    author: string;
    jurisdiction: string;
    version: string;        // Document version (e.g., "1.0.2")
    lastUpdated: string;    // ISO date string
    filename: string;
    hash: string;
  }
}
```

## Usage Examples

### Next.js App Router

```typescript
// app/(app)/(root)/legals/privacy/page.tsx
import { privacyPolicy } from "@comms-id/legal-documents";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto p-6">
      <h1>{privacyPolicy.metadata.title}</h1>
      <Badge>v{privacyPolicy.metadata.version}</Badge>
      
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: privacyPolicy.html }}
      />
      
      <footer>
        Last updated: {new Date(privacyPolicy.metadata.lastUpdated).toLocaleDateString()}
      </footer>
    </div>
  );
}
```

### React Native

```typescript
import { privacyPolicy } from "@comms-id/legal-documents";
import { WebView } from "react-native-webview";

export function PrivacyScreen() {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; 
            padding: 20px;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        ${privacyPolicy.html}
      </body>
    </html>
  `;
  
  return <WebView source={{ html: htmlContent }} style={{ flex: 1 }} />;
}
```

### Dynamic Document Routing

```typescript
// app/(app)/(root)/legals/[[...slug]]/page.tsx
import { 
  privacyPolicy, 
  termsOfUse, 
  ispAspPrivacyNotice,
  idxPrivacyNotice,
  relyingPartyAgreement 
} from "@comms-id/legal-documents";

const policies = {
  privacy: privacyPolicy,
  terms: termsOfUse,
  "privacy-identity-services": ispAspPrivacyNotice,
  "privacy-identity-exchange": idxPrivacyNotice,
  "relying-party-agreement": relyingPartyAgreement,
};

export default function LegalPage({ params }: { params: { slug?: string[] } }) {
  const slug = params.slug?.[0] || 'privacy';
  const policy = policies[slug as keyof typeof policies];
  
  if (!policy) return notFound();
  
  return (
    <div className="container">
      <h1>{policy.metadata.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: policy.html }} />
    </div>
  );
}
```

### Display Markdown Instead of HTML

```typescript
import { privacyPolicy } from "@comms-id/legal-documents";
import ReactMarkdown from 'react-markdown';

export function PrivacyPage() {
  return (
    <ReactMarkdown className="prose">
      {privacyPolicy.markdown}
    </ReactMarkdown>
  );
}
```

## Important Notes

- **Inter-document links**: HTML output contains `href="#"` for all links between documents. Implement your own routing to handle these.
- **Version tracking**: Each document has its own version in `metadata.version`, independent of the package version.
- **Tree-shaking**: Import only the documents you need to reduce bundle size.

## Troubleshooting

### 401 Unauthorized Error
- Ensure your GitHub token has `read:packages` scope
- Verify token is set correctly in environment variables
- Check token has access to the comms-id organization

### Package Not Found
- Confirm `.npmrc` is configured correctly
- Package is private to comms-id organization

### Version Updates
- Package version updates frequently (CI/CD)
- Document versions only change when content changes
- Check `metadata.version` for actual document version