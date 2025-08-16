# Runtime Legal Documents Usage

This guide shows how to fetch legal documents at runtime instead of build time, ensuring users always see the latest policies.

## Setup

### 1. Deploy API Files

The build process generates JSON files in `dist/api/`. These need to be served from your API:

```bash
# After building
pnpm build

# Deploy dist/api/ contents to your API server
# e.g., https://api.comms.id/legal/
```

### 2. Set Environment Variable

In your consuming app:

```bash
# .env.local
NEXT_PUBLIC_LEGAL_API_URL=https://api.comms.id/legal
```

## Usage in Next.js Apps

### Install the Hook

Copy `src/hooks/useLegalDocument.tsx` to your app, or we can publish it as part of the package.

### Basic Usage

```tsx
// app/(app)/(root)/legals/privacy/page.tsx
'use client';

import { useLegalDocument } from '@/hooks/useLegalDocument';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PrivacyPage() {
  const { document, loading, error } = useLegalDocument('privacyPolicy');

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Unable to load privacy policy. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">{document.metadata.title}</h1>
        <Badge variant="outline">v{document.metadata.version}</Badge>
      </div>
      
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: document.html }}
      />
      
      <footer className="mt-8 text-sm text-muted-foreground">
        Last updated: {new Date(document.metadata.lastUpdated).toLocaleDateString()}
      </footer>
    </div>
  );
}
```

### With Server Components (Recommended)

For SEO and performance, fetch on the server:

```tsx
// app/(app)/(root)/legals/privacy/page.tsx
import { Badge } from '@/components/ui/badge';

async function getLegalDocument(type: string) {
  const res = await fetch(
    `${process.env.LEGAL_API_URL || 'https://api.comms.id/legal'}/${type}.json`,
    { 
      next: { revalidate: 60 }, // Cache for 1 minute
      cache: 'no-store' // Or disable caching entirely
    }
  );
  
  if (!res.ok) {
    throw new Error('Failed to fetch legal document');
  }
  
  return res.json();
}

export default async function PrivacyPage() {
  const document = await getLegalDocument('privacyPolicy');

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">{document.metadata.title}</h1>
        <Badge variant="outline">v{document.metadata.version}</Badge>
      </div>
      
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: document.html }}
      />
      
      <footer className="mt-8 text-sm text-muted-foreground">
        Last updated: {new Date(document.metadata.lastUpdated).toLocaleDateString()}
      </footer>
    </div>
  );
}
```

### Dynamic Document Router

```tsx
// app/(app)/(root)/legals/[slug]/page.tsx
async function getLegalDocument(slug: string) {
  const documentMap: Record<string, string> = {
    'privacy': 'privacyPolicy',
    'terms': 'termsOfUse',
    'privacy-identity-services': 'ispAspPrivacyNotice',
    'privacy-identity-exchange': 'idxPrivacyNotice',
    'relying-party-agreement': 'relyingPartyAgreement',
  };

  const documentType = documentMap[slug];
  if (!documentType) {
    notFound();
  }

  const res = await fetch(
    `${process.env.LEGAL_API_URL}/${documentType}.json`,
    { cache: 'no-store' }
  );
  
  if (!res.ok) {
    throw new Error('Failed to fetch legal document');
  }
  
  return res.json();
}

export default async function LegalPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const document = await getLegalDocument(params.slug);
  
  // Render document...
}
```

## Deployment Options

### Option 1: Static File Hosting (Recommended)

Deploy the `dist/api/` folder to any static hosting:

- **Vercel**: Add to `public/api/legal/` in your Next.js app
- **S3 + CloudFront**: Upload to S3, serve via CloudFront
- **GitHub Pages**: Automated via GitHub Actions
- **Nginx**: Serve as static files with CORS headers

### Option 2: Edge Functions

Create an edge function that serves the latest files:

```typescript
// api/legal/[document].ts
export const runtime = 'edge';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const document = url.pathname.split('/').pop()?.replace('.json', '');
  
  // Fetch from GitHub or your storage
  const response = await fetch(
    `https://raw.githubusercontent.com/comms-id/policies/main/dist/api/${document}.json`
  );
  
  return new Response(response.body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

## Benefits

1. **Always Current**: Users see the latest policies without app rebuilds
2. **Centralized Updates**: Update policies once, all apps get them
3. **Version Tracking**: Know exactly which version users are viewing
4. **No Build Dependencies**: Apps don't need GitHub Packages access
5. **Better Performance**: Only load policies when needed

## Migration from Build-Time Import

Replace:
```typescript
import { privacyPolicy } from '@comms-id/legal-documents';
```

With:
```typescript
const document = await getLegalDocument('privacyPolicy');
```

## Error Handling

Always handle network failures gracefully:

```tsx
export default async function PrivacyPage() {
  try {
    const document = await getLegalDocument('privacyPolicy');
    return <div>...</div>;
  } catch (error) {
    // Log to monitoring service
    console.error('Failed to load privacy policy:', error);
    
    // Show user-friendly error
    return (
      <Alert>
        <AlertDescription>
          We're having trouble loading our privacy policy. 
          Please try refreshing the page or contact support.
        </AlertDescription>
      </Alert>
    );
  }
}
```

## Monitoring

Track policy fetch failures:

```typescript
async function getLegalDocument(type: string) {
  try {
    const res = await fetch(`${API_URL}/${type}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    // Send to monitoring service
    trackEvent('legal_document_fetch_failed', {
      document: type,
      error: error.message,
    });
    throw error;
  }
}
```