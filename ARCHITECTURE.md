# SafeGuard Platform - Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Landing   │  │    Auth     │  │      Dashboard      │ │
│  │    Page     │  │  (Login/    │  │   (Tool Selector)   │ │
│  │             │  │   Signup)   │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐ │
│  │   Evidence   │ │   Threat     │ │   Geolocation      │ │
│  │    Vault     │ │ Intelligence │ │     Tracking       │ │
│  └──────────────┘ └──────────────┘ └────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS (Supabase Client)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              LOVABLE CLOUD / SUPABASE BACKEND               │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │              AUTHENTICATION (Supabase Auth)            ││
│  │  • Email/Password                                      ││
│  │  • Session Management                                  ││
│  │  • Auto-confirm emails                                 ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │              POSTGRESQL DATABASE (5 Tables)            ││
│  │                                                        ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ ││
│  │  │evidence_items│  │threat_       │  │linked_      │ ││
│  │  │              │  │incidents     │  │attackers    │ ││
│  │  │• SHA-256 hash│  │• AI severity │  │• fingerprint│ ││
│  │  │• file_url    │  │• risk_score  │  │• platforms  │ ││
│  │  │• blockchain  │  │• platform    │  │• incident_  │ ││
│  │  │  timestamp   │  │• username    │  │  count      │ ││
│  │  └──────────────┘  └──────────────┘  └─────────────┘ ││
│  │                                                        ││
│  │  ┌──────────────┐  ┌──────────────┐                  ││
│  │  │tracking_links│  │geo_captures  │                  ││
│  │  │              │  │              │                  ││
│  │  │• link_code   │  │• ip_address  │                  ││
│  │  │• target_url  │  │• geolocation │                  ││
│  │  │• captures_   │  │• device_info │                  ││
│  │  │  count       │  │• fingerprint │                  ││
│  │  └──────────────┘  └──────────────┘                  ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │              STORAGE BUCKETS (Supabase Storage)        ││
│  │  • evidence-files (private)                            ││
│  │    - Max 50MB per file                                 ││
│  │    - MIME type validation                              ││
│  │    - User-specific RLS policies                        ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │           EDGE FUNCTIONS (Serverless - Deno)           ││
│  │                                                        ││
│  │  ┌───────────────────┐  ┌────────────────────────┐   ││
│  │  │ upload-evidence   │  │  analyze-threat        │   ││
│  │  │ • FormData parse  │  │  • AI API call         │   ││
│  │  │ • SHA-256 hash    │  │  • Severity classify   │   ││
│  │  │ • Storage upload  │  │  • Attacker linking    │   ││
│  │  │ • DB insert       │  │  • Risk scoring        │   ││
│  │  └───────────────────┘  └────────────────────────┘   ││
│  │                                                        ││
│  │  ┌───────────────────┐  ┌────────────────────────┐   ││
│  │  │ capture-geo       │  │  create-tracking-link  │   ││
│  │  │ • Public endpoint │  │  • Generate link code  │   ││
│  │  │ • IP extraction   │  │  • DB insert           │   ││
│  │  │ • Geolocation API │  │  • Return full URL     │   ││
│  │  │ • Device parsing  │  │                        │   ││
│  │  │ • Fingerprinting  │  │                        │   ││
│  │  └───────────────────┘  └────────────────────────┘   ││
│  └────────────────────────────────────────────────────────┘│
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               EXTERNAL SERVICES                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  LOVABLE AI GATEWAY                                 │   │
│  │  • Model: google/gemini-2.5-flash                   │   │
│  │  • Endpoint: ai.gateway.lovable.dev                 │   │
│  │  • Pre-configured API key                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  IPAPI.CO (Geolocation Service)                     │   │
│  │  • Public API (no key required)                     │   │
│  │  • Returns city, region, country from IP            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Evidence Upload Flow

```
User                   Frontend              Edge Function          Storage           Database
 │                        │                       │                    │                 │
 │  Select file           │                       │                    │                 │
 │───────────────────────>│                       │                    │                 │
 │                        │                       │                    │                 │
 │  Fill form + Submit    │                       │                    │                 │
 │───────────────────────>│                       │                    │                 │
 │                        │                       │                    │                 │
 │                        │  POST /upload-evidence│                    │                 │
 │                        │  (FormData)           │                    │                 │
 │                        │──────────────────────>│                    │                 │
 │                        │                       │                    │                 │
 │                        │                       │  Generate SHA-256  │                 │
 │                        │                       │  hash from file    │                 │
 │                        │                       │────────────────    │                 │
 │                        │                       │                │   │                 │
 │                        │                       │<───────────────    │                 │
 │                        │                       │                    │                 │
 │                        │                       │  Upload file       │                 │
 │                        │                       │───────────────────>│                 │
 │                        │                       │                    │                 │
 │                        │                       │  Return file URL   │                 │
 │                        │                       │<───────────────────│                 │
 │                        │                       │                    │                 │
 │                        │                       │  INSERT evidence_items row           │
 │                        │                       │  (hash, url, metadata)               │
 │                        │                       │─────────────────────────────────────>│
 │                        │                       │                    │                 │
 │                        │                       │  Return inserted record              │
 │                        │                       │<─────────────────────────────────────│
 │                        │                       │                    │                 │
 │                        │  Success response     │                    │                 │
 │                        │  (hash, evidence data)│                    │                 │
 │                        │<──────────────────────│                    │                 │
 │                        │                       │                    │                 │
 │  Toast notification    │                       │                    │                 │
 │  "Evidence uploaded"   │                       │                    │                 │
 │<───────────────────────│                       │                    │                 │
 │                        │                       │                    │                 │
 │  Reload evidence list  │                       │                    │                 │
 │───────────────────────>│                       │                    │                 │
 │                        │  SELECT evidence_items                     │                 │
 │                        │  WHERE user_id = $1                        │                 │
 │                        │────────────────────────────────────────────────────────────>│
 │                        │                       │                    │                 │
 │                        │  Return evidence rows │                    │                 │
 │                        │<────────────────────────────────────────────────────────────│
 │                        │                       │                    │                 │
 │  Display evidence      │                       │                    │                 │
 │<───────────────────────│                       │                    │                 │
```

### 2. Threat Analysis Flow

```
User              Frontend         Edge Function      Lovable AI       Database
 │                   │                   │                 │               │
 │  Fill incident    │                   │                 │               │
 │  report form      │                   │                 │               │
 │──────────────────>│                   │                 │               │
 │                   │                   │                 │               │
 │  Submit report    │                   │                 │               │
 │──────────────────>│                   │                 │               │
 │                   │                   │                 │               │
 │                   │ POST /analyze-    │                 │               │
 │                   │ threat (JSON)     │                 │               │
 │                   │──────────────────>│                 │               │
 │                   │                   │                 │               │
 │                   │                   │ Generate        │               │
 │                   │                   │ attacker        │               │
 │                   │                   │ fingerprint     │               │
 │                   │                   │ (SHA-256 of     │               │
 │                   │                   │ platform +      │               │
 │                   │                   │ username +      │               │
 │                   │                   │ profile URL)    │               │
 │                   │                   │─────────────    │               │
 │                   │                   │             │   │               │
 │                   │                   │<────────────    │               │
 │                   │                   │                 │               │
 │                   │                   │ POST /v1/chat/  │               │
 │                   │                   │ completions     │               │
 │                   │                   │ (prompt with    │               │
 │                   │                   │ incident data)  │               │
 │                   │                   │────────────────>│               │
 │                   │                   │                 │               │
 │                   │                   │ AI analyzes:    │               │
 │                   │                   │ • Severity      │               │
 │                   │                   │ • Risk score    │               │
 │                   │                   │ • Patterns      │               │
 │                   │                   │                 │               │
 │                   │                   │ Return analysis │               │
 │                   │                   │<────────────────│               │
 │                   │                   │                 │               │
 │                   │                   │ Check for       │               │
 │                   │                   │ existing        │               │
 │                   │                   │ linked_attacker │               │
 │                   │                   │ by fingerprint  │               │
 │                   │                   │────────────────────────────────>│
 │                   │                   │                 │               │
 │                   │                   │ If exists:      │               │
 │                   │                   │ increment       │               │
 │                   │                   │ incident_count  │               │
 │                   │                   │                 │               │
 │                   │                   │ If new: INSERT  │               │
 │                   │                   │ linked_attacker │               │
 │                   │                   │<────────────────────────────────│
 │                   │                   │                 │               │
 │                   │                   │ INSERT          │               │
 │                   │                   │ threat_incident │               │
 │                   │                   │ with AI results │               │
 │                   │                   │────────────────────────────────>│
 │                   │                   │                 │               │
 │                   │                   │ Return inserted │               │
 │                   │                   │ record          │               │
 │                   │                   │<────────────────────────────────│
 │                   │                   │                 │               │
 │                   │ Success response  │                 │               │
 │                   │ (severity, risk,  │                 │               │
 │                   │ isRepeatOffender) │                 │               │
 │                   │<──────────────────│                 │               │
 │                   │                   │                 │               │
 │ Toast with        │                   │                 │               │
 │ analysis results  │                   │                 │               │
 │<──────────────────│                   │                 │               │
 │                   │                   │                 │               │
 │ Reload incidents  │                   │                 │               │
 │──────────────────>│                   │                 │               │
 │                   │ SELECT threat_incidents                            │
 │                   │────────────────────────────────────────────────────>│
 │                   │                   │                 │               │
 │                   │ Return incidents  │                 │               │
 │                   │<────────────────────────────────────────────────────│
 │                   │                   │                 │               │
 │ Display incidents │                   │                 │               │
 │<──────────────────│                   │                 │               │
```

---

## Database Schema

### Table: `evidence_items`
```sql
CREATE TABLE evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                    -- FK to auth.users
  title TEXT NOT NULL,
  evidence_type TEXT NOT NULL,              -- screenshot, video, audio, etc.
  description TEXT,
  file_url TEXT,                            -- Supabase Storage URL
  file_hash TEXT NOT NULL,                  -- SHA-256 hash
  blockchain_timestamp TEXT,                -- Simulated blockchain timestamp
  status TEXT DEFAULT 'verified',
  metadata JSONB,                           -- {uploaded_at, browser, etc.}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own evidence"
  ON evidence_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own evidence"
  ON evidence_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Table: `threat_incidents`
```sql
CREATE TABLE threat_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,                -- FK to auth.users
  platform TEXT NOT NULL,                   -- instagram, facebook, etc.
  harasser_username TEXT,
  harasser_profile_url TEXT,
  incident_description TEXT NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  severity_level TEXT,                      -- AI-assigned: critical, high, medium, low
  linked_attacker_id UUID REFERENCES linked_attackers(id),
  metadata JSONB,                           -- {risk_score, analysis_data}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE threat_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own incidents"
  ON threat_incidents FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can insert their own incidents"
  ON threat_incidents FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);
```

### Table: `linked_attackers`
```sql
CREATE TABLE linked_attackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_fingerprint TEXT UNIQUE NOT NULL, -- SHA-256 of platform+username+profile
  platforms JSONB DEFAULT '[]'::jsonb,      -- ["instagram", "facebook"]
  known_aliases JSONB DEFAULT '[]'::jsonb,  -- ["@user1", "@user2"]
  incident_count INTEGER DEFAULT 1,
  risk_score INTEGER,                       -- 0-100
  behavioral_patterns JSONB,                -- AI-extracted patterns
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access for cross-user linking (privacy preserved via fingerprint)
ALTER TABLE linked_attackers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read attackers"
  ON linked_attackers FOR SELECT
  USING (auth.role() = 'authenticated');
```

### Table: `tracking_links`
```sql
CREATE TABLE tracking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                    -- FK to auth.users
  title TEXT NOT NULL,
  description TEXT,
  link_code TEXT UNIQUE NOT NULL,           -- Random 12-char string
  target_url TEXT,                          -- Optional redirect
  captures_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tracking links"
  ON tracking_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracking links"
  ON tracking_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Table: `geo_captures`
```sql
CREATE TABLE geo_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_link_id UUID NOT NULL REFERENCES tracking_links(id) ON DELETE CASCADE,
  ip_address TEXT,
  geolocation JSONB,                        -- {city, region, country_name, latitude, longitude}
  device_info JSONB,                        -- {browser, os, device_type}
  browser_fingerprint TEXT,                 -- SHA-256 hash
  screenshot_url TEXT,                      -- Future: screenshot of browser
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (owner of tracking_link can view captures)
ALTER TABLE geo_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view captures of their links"
  ON geo_captures FOR SELECT
  USING (
    tracking_link_id IN (
      SELECT id FROM tracking_links WHERE user_id = auth.uid()
    )
  );
```

---

## API Endpoints (Edge Functions)

### 1. `/functions/v1/upload-evidence`
**Method**: POST  
**Authentication**: Required  
**Content-Type**: multipart/form-data

**Request Body**:
```typescript
{
  file: File,                   // The evidence file
  title: string,                // Evidence title
  description?: string,         // Optional description
  evidenceType: string,         // screenshot | video | audio | chat_log | document
  metadata?: string             // JSON string with additional metadata
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    id: string,
    title: string,
    file_hash: string,          // SHA-256 hash
    file_url: string,           // Supabase Storage URL
    blockchain_timestamp: string,
    created_at: string
  },
  hash: string                  // Same as file_hash
}
```

**Error Responses**:
- `401 Unauthorized`: No valid session
- `400 Bad Request`: Missing required fields or file too large (> 50MB)
- `500 Internal Server Error`: Upload or database error

---

### 2. `/functions/v1/analyze-threat`
**Method**: POST  
**Authentication**: Required  
**Content-Type**: application/json

**Request Body**:
```typescript
{
  platform: string,             // instagram, facebook, twitter, etc.
  harasserUsername?: string,
  harasserProfileUrl?: string,
  incidentDescription: string,  // Main description for AI analysis
  incidentDate: string,         // ISO 8601 datetime
  metadata?: object             // Additional context
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    incidentId: string,
    severityLevel: "critical" | "high" | "medium" | "low",
    riskScore: number,          // 0-100
    isRepeatOffender: boolean,
    linkedAttackerId?: string,
    analysis: string            // AI-generated analysis text
  }
}
```

**AI Prompt Structure**:
```
Analyze this harassment incident and provide:
1. Severity level (critical/high/medium/low)
2. Risk score (0-100)
3. Key behavioral patterns

Incident details:
Platform: {platform}
Description: {incidentDescription}
Date: {incidentDate}

Return JSON with: severityLevel, riskScore, patterns
```

---

### 3. `/functions/v1/create-tracking-link`
**Method**: POST  
**Authentication**: Required  
**Content-Type**: application/json

**Request Body**:
```typescript
{
  title: string,
  description?: string,
  targetUrl?: string            // Optional redirect URL
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    id: string,
    title: string,
    linkCode: string,           // 12-character random code
    fullUrl: string             // Complete tracking URL
  }
}
```

**Generated URL Format**:
```
https://{SUPABASE_PROJECT_ID}.supabase.co/functions/v1/capture-geo?code={linkCode}
```

---

### 4. `/functions/v1/capture-geo` (Public Endpoint)
**Method**: GET  
**Authentication**: None (Public)  
**Query Parameters**: `?code={linkCode}`

**Process**:
1. Extract `linkCode` from query string
2. Look up `tracking_link` in database
3. Extract IP address from request headers
4. Call `ipapi.co/{ip}/json` for geolocation
5. Parse User-Agent for browser, OS, device type
6. Generate browser fingerprint (SHA-256 of User-Agent + IP)
7. Insert record into `geo_captures` table
8. Increment `captures_count` on `tracking_links`
9. Redirect to `target_url` (if set) or show success HTML

**Response (if no target_url)**:
```html
<!DOCTYPE html>
<html>
<head><title>Link Accessed</title></head>
<body>
  <h1>Link has been accessed successfully.</h1>
</body>
</html>
```

**Captured Data Structure**:
```typescript
{
  id: string,
  tracking_link_id: string,
  ip_address: string,
  geolocation: {
    city: string,
    region: string,
    country_name: string,
    latitude: number,
    longitude: number
  },
  device_info: {
    browser: string,            // e.g., "Chrome"
    os: string,                 // e.g., "Windows"
    device_type: string         // "Mobile" | "Tablet" | "Desktop"
  },
  browser_fingerprint: string,  // SHA-256 hash
  captured_at: string
}
```

---

## Security Architecture

### Authentication Flow
1. User signs up with email + password
2. Supabase Auth auto-confirms email (configured via `supabase--configure-auth`)
3. Session stored in `localStorage` via Supabase client
4. JWT token sent with every request in `Authorization` header
5. Edge functions verify JWT using `supabase.auth.getUser()`

### Row-Level Security (RLS) Policies

**Principle**: Users can only access their own data (except `linked_attackers` for cross-user pattern detection)

**Evidence Items**:
- ✅ Users can SELECT their own evidence
- ✅ Users can INSERT their own evidence
- ❌ Users cannot UPDATE/DELETE (preserve immutability for legal evidence)

**Threat Incidents**:
- ✅ Users can SELECT their own incidents
- ✅ Users can INSERT their own incidents

**Tracking Links**:
- ✅ Users can SELECT/INSERT their own links
- ❌ No UPDATE policy (links are immutable once created)

**Geo Captures**:
- ✅ Users can SELECT captures for their tracking links
- ❌ No INSERT policy (only edge function can insert)

**Linked Attackers**:
- ✅ All authenticated users can SELECT (for cross-referencing)
- ❌ Only edge function can INSERT/UPDATE

### File Storage Security

**Bucket**: `evidence-files` (Private)

**Policies**:
```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'evidence-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own files
CREATE POLICY "Users can read their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'evidence-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

**File Path Structure**: `evidence-files/{user_id}/{filename}`

---

## Performance Considerations

### Database Indexing
```sql
-- Speed up evidence lookups by user
CREATE INDEX idx_evidence_user_id ON evidence_items(user_id);

-- Speed up incident lookups by user
CREATE INDEX idx_incidents_reporter_id ON threat_incidents(reporter_id);

-- Speed up attacker fingerprint lookups
CREATE INDEX idx_attacker_fingerprint ON linked_attackers(attacker_fingerprint);

-- Speed up tracking link lookups by code
CREATE INDEX idx_tracking_link_code ON tracking_links(link_code);

-- Speed up capture lookups by link
CREATE INDEX idx_captures_link_id ON geo_captures(tracking_link_id);
```

### Edge Function Optimization
- **Cold Start**: < 500ms (Deno runtime)
- **Warm Execution**: < 100ms (in-memory)
- **Concurrent Requests**: Auto-scales to 100+ concurrent invocations

### Frontend Optimization
- **Code Splitting**: React.lazy() for each page route
- **Asset Optimization**: Vite auto-minifies CSS/JS
- **Image Optimization**: Hero image served via CDN

---

## Deployment Architecture

### Production Stack
```
Internet
   │
   ├─> Lovable CDN (Frontend)
   │   ├─> HTML/CSS/JS bundles
   │   ├─> Static assets
   │   └─> Cached responses
   │
   └─> Supabase (Backend)
       ├─> Auth Service (JWT)
       ├─> Database (PostgreSQL)
       ├─> Storage (S3-compatible)
       └─> Edge Functions (Deno Deploy)
```

### Scaling Strategy
- **Frontend**: CDN auto-scales globally
- **Database**: Vertical scaling via Supabase dashboard
- **Edge Functions**: Horizontal auto-scaling
- **Storage**: Unlimited (S3-compatible backend)

---

## Future Architecture Enhancements

### Phase 2: Real-time Features
- WebSocket connections via Supabase Realtime
- Live notification when tracking link is accessed
- Real-time collaborative evidence review

### Phase 3: Advanced AI
- Sentiment analysis on threat descriptions
- Predictive risk scoring based on historical patterns
- Image content analysis (OCR for screenshots)

### Phase 4: Blockchain Integration
- Actual blockchain timestamping (Ethereum, Polygon)
- Smart contract for evidence registry
- Immutable audit trail

---

**Last Updated**: 2025-11-28  
**Version**: 1.0.0