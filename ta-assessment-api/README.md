# TechAbout Assessment API (`ta-assessment-api`)

A robust, production-ready Node.js backend RESTful API built for recruitment assessment submissions, reviewer evaluation workflows, audit logging, and candidate management.



## 1. Project Overview & Architecture

`ta-assessment-api` is designed for reliable recruitment workflows. It allows candidates to fetch job assessment briefs securely, submit their completed assignments with file uploads and work metrics, and enables HR reviewers to filter, evaluate, score, and record decision notes with complete database transaction safety and audit trails.

### Tech Stack
* **Runtime**: Node.js (v18+)
* **Framework**: Express.js 5
* **Database**: PostgreSQL 16
* **ORM**: Prisma ORM 6
* **Authentication**: JWT (JSON Web Tokens) for HR Reviewers, Private Secret Bearer Tokens for Candidates, Bcrypt for password hashing
* **File Upload**: Multer (Disk Storage with file type filtering & size constraints)
* **Security & Rate Limiting**: `express-rate-limit`
* **Logging**: Morgan HTTP logger
* **Testing**: Jest & Supertest

### Directory Structure
```text
ta-assessment-api/
├── prisma/
│   ├── schema.prisma        # Database schema definitions, indexes, relations
│   ├── seed.js              # Initial database seed script
│   └── migrations/          # SQL migration history logs
├── src/
│   ├── config/
│   │   └── prisma.js        # Prisma client single-instance initialization
│   ├── controllers/
│   │   ├── assessmentController.js  # Candidate brief retrieval
│   │   ├── authController.js        # HR authentication (login)
│   │   └── submissionController.js  # Submissions listing, creation, reviews
│   ├── middleware/
│   │   ├── candidateAuth.js # Candidate token validation
│   │   ├── reviewerAuth.js  # HR JWT verification & role authorization
│   │   ├── rateLimiter.js   # Request rate limiters
│   │   └──  upload.js       # Multer upload & validation handler
│   ├── routes/
│   │   ├── assessmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── reviewerRoutes.js
│   │   └── submissionRoutes.js
│   └── app.js               # Express application pipeline
├── tests/
│   ├──  audit.test.js       # Audit log automated test
│   ├──  auth.test.js        # HR Login test suite
│   ├── assessment.test.js   # Candidate brief test suite
│   ├── review.test.js       # Reviewer authorization tests
│   └── reviewsubmission.test.js # Review validation tests
├── docker-compose.yml       # PostgreSQL database container orchestration
├── server.js                # Application entry point
├── package.json
└── README.md
```

---

## 2. Setup & Installation Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Docker & Docker Compose** (for running PostgreSQL container locally)

### Step-by-Step Installation

1. **Clone the repository and enter the directory**:
   ```bash
   cd ta-assessment-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (or use the provided defaults):
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ta_assessment"
   PORT=5001
   JWT_SECRET="supersecretjwtkey"
   ```

4. **Start PostgreSQL via Docker**:
   ```bash
   docker-compose up -d
   ```

5. **Run Prisma Migrations & Seed Database**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The API server will run at `http://localhost:5001`.

7. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

---

## 3. Required Product Features Implemented

1. **Candidate Assessment Brief Retrieval**: Candidates access their assigned assessment brief using a unique `privateToken` passed via the standard `Authorization: Bearer <privateToken>` header.
2. **Candidate Work Submission**: Candidates submit work link, file upload reference (`.pdf`, `.zip`, `.docx`), completion time taken, notes, and challenges faced.
3. **Multi-Criteria HR Filtering & Pagination**: HR reviewers list all submissions with flexible combinations of filters: candidate `role`, candidate `city`, submission `status`, score range (`minScore`, `maxScore`), date ranges (`submittedFrom`, `submittedTo` or `submittedDate`), and paginated response metrics (`page`, `limit`, `totalPages`, `total`).
4. **HR Evaluation & Decision**: HR reviewers assign scores (0-100), decision outcomes (`Accepted` or `Rejected`), and private review notes. Executes within an atomic Prisma `$transaction` to ensure atomic state updates (`Pending` -> `Reviewed`).
5. **System Audit Trail**: Automatic creation of `AuditLog` records tracking candidate submission actions (`Submission Created`) and HR reviewer evaluations (`Submission Reviewed`).

---

## 4. API Specification & Request/Response Examples

### 1. HR Reviewer Login
* **Endpoint**: `POST /auth/login`
* **Access**: Public (Protected by rate limiter: max 5 requests per 15 mins)
* **Request Body**:
  ```json
  {
    "email": "hr@gmail.com",
    "password": "123456"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login Successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Error Response (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "message": "Invalid Email or Password"
  }
  ```

---

### 2. Candidate Fetch Assessment Brief
* **Endpoint**: `GET /assessment`
* **Access**: Candidate Auth Header (`Authorization: Bearer <privateToken>`)
* **Headers**: `Authorization: Bearer token123`
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "candidate": "Amna",
    "data": {
      "id": 1,
      "title": "Backend Assessment",
      "description": "Create Recruitment API",
      "deadline": "2026-08-01T00:00:00.000Z"
    }
  }
  ```
* **Error Response (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "message": "Invalid Token"
  }
  ```

---

### 3. Candidate Submit Solution
* **Endpoint**: `POST /submissions` (also accessible at `POST /`)
* **Access**: Candidate Auth Header (`Authorization: Bearer <privateToken>`)
* **Content-Type**: `multipart/form-data`
* **Form Fields**:
  * `assessmentId`: `1`
  * `workLink`: `https://github.com/candidate/techabout-assessment`
  * `timeTaken`: `4.5 hours`
  * `notes`: `Implemented full Prisma schema with indexes.`
  * `challenges`: `Optimized multi-filter query to prevent N+1 issues.`
  * `file`: `[binary upload file - .pdf, .zip, or .docx]`
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Submission created successfully",
    "data": {
      "id": 1,
      "candidateId": 1,
      "assessmentId": 1,
      "workLink": "https://github.com/candidate/techabout-assessment",
      "fileReference": "uploads/1721836000000-submission.zip",
      "timeTaken": "4.5 hours",
      "notes": "Implemented full Prisma schema with indexes.",
      "challenges": "Optimized multi-filter query to prevent N+1 issues.",
      "status": "Pending",
      "submittedAt": "2026-07-24T18:00:00.000Z"
    }
  }
  ```
* **Error Response (`409 Conflict - Duplicate Submission`)**:
  ```json
  {
    "success": false,
    "message": "Submission already exists"
  }
  ```

---

### 4. HR List Submissions (Filtered & Paginated)
* **Endpoint**: `GET /submissions`
* **Access**: HR Reviewer Auth Header (`Authorization: Bearer <jwt_token>`)
* **Query Parameters**:
  * `role`: `Backend Developer` (optional)
  * `status`: `Pending` | `Reviewed` | `Accepted` | `Rejected` (optional)
  * `city`: `Lahore` (optional)
  * `minScore`: `70` (optional)
  * `maxScore`: `100` (optional)
  * `submittedFrom`: `2026-07-01` (optional)
  * `submittedTo`: `2026-07-31` (optional)
  * `page`: `1` (default: 1)
  * `limit`: `10` (default: 10)
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Submissions fetched successfully",
    "data": [
      {
        "id": 1,
        "candidateId": 1,
        "assessmentId": 1,
        "workLink": "https://github.com/candidate/techabout-assessment",
        "fileReference": "uploads/1721836000000-submission.zip",
        "timeTaken": "4.5 hours",
        "notes": "Implemented full Prisma schema with indexes.",
        "challenges": "Optimized multi-filter query to prevent N+1 issues.",
        "status": "Pending",
        "submittedAt": "2026-07-24T18:00:00.000Z",
        "candidate": {
          "id": 1,
          "name": "Amna",
          "email": "amna@gmail.com",
          "city": "Lahore",
          "role": "Backend Developer"
        },
        "assessment": {
          "id": 1,
          "title": "Backend Assessment",
          "deadline": "2026-08-01T00:00:00.000Z"
        },
        "review": null
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

---

### 5. HR Review & Score Submission
* **Endpoint**: `PATCH /submissions/:id/review`
* **Access**: HR Reviewer Auth Header (`Authorization: Bearer <jwt_token>`)
* **Request Body**:
  ```json
  {
    "score": 95,
    "decision": "Accepted",
    "reviewNote": "Exceptional code quality, clean database indexing, and comprehensive error handling."
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Submission reviewed successfully",
    "data": {
      "id": 1,
      "submissionId": 1,
      "reviewerId": 1,
      "score": 95,
      "decision": "Accepted",
      "reviewNote": "Exceptional code quality, clean database indexing, and comprehensive error handling.",
      "reviewedAt": "2026-07-24T19:00:00.000Z"
    }
  }
  ```
* **Error Response (`400 Bad Request - Validation Error`)**:
  ```json
  {
    "success": false,
    "message": "Score must be between 0 and 100"
  }
  ```
* **Error Response (`409 Conflict - Already Reviewed`)**:
  ```json
  {
    "success": false,
    "message": "Submission already reviewed"
  }
  ```

---

## 5. Authentication, Authorization & Abuse Prevention

### Dual-Token Architecture
1. **Candidate Authentication (`middleware/candidateAuth.js`)**:
   - Uses static `privateToken` issued to each candidate upon invitation.
   - Passed via standard HTTP header `Authorization: Bearer <privateToken>`.
   - Validates existence against `Candidate.privateToken`. If missing or invalid, returns `401 Unauthorized`.
2. **Reviewer Authorization (`middleware/reviewerAuth.js`)**:
   - Uses signed JWTs generated upon successful login via `POST /auth/login`.
   - Contains payload `{ id: reviewer.id, role: reviewer.role }` with 1-day expiration.
   - Enforces Role-Based Access Control (RBAC): explicitly verifies `reviewer.role === "HR"`. Non-HR roles receive `403 Access Denied`.

### Rate Limiting (`middleware/rateLimiter.js`)
- **Login Limiter**: Restricts `POST /auth/login` to **5 requests per 15 minutes** per IP to protect against brute-force password guessing.
- **Submission Limiter**: Restricts `POST /submissions` to **10 requests per 15 minutes** per IP to prevent spam submissions and denial-of-service attempts.

### Safe File & Link Handling (`middleware/ upload.js`)
- **Disk Storage**: Files are renamed using collision-free timestamps (`Date.now() + "-" + originalname`) to prevent file overwrite attacks or path traversal risks.
- **Strict File Type Restriction**: Allowed extensions are strictly filtered to `.pdf`, `.zip`, and `.docx`.
- **Payload Limits**: Max file size capped at **5MB** to prevent storage exhaustion.


## 6. High Scale Architecture: Handling 50,000+ Applicants

When scaling `ta-assessment-api` from initial testing to 50,000+ candidate applicants, database indexing, query execution paths, connection limits, and storage strategies require specific optimization:

### 1. Database Indexing & Composite Indexing Strategy
- **Single-Column Indexes**: Existing indexes on `Submission(status)`, `Submission(submittedAt)`, and `Submission(candidateId)`.
- **Composite Index Optimization**: For high-volume multi-column filtering by HR, implement composite indexes:
  ```prisma
  @@index([status, submittedAt])
  ```
  This allows PostgreSQL Index Scan to satisfy combined status and date filtering in a single B-tree lookup without bitmap index merges.

### 2. Pagination Strategy: Keyset (Cursor-Based) vs Offset
- **Current Offset Pagination**: `skip: (page - 1) * limit, take: limit`.
- **Scale Challenge**: At 50,000+ rows, `OFFSET 45000 LIMIT 10` forces PostgreSQL to read and discard 45,000 rows.
- **High-Scale Recommendation**: Transition to **Cursor-Based Pagination**:
  ```javascript
  prisma.submission.findMany({
    take: 10,
    skip: 1,
    cursor: { id: lastSeenSubmissionId },
    orderBy: { id: 'desc' }
  })
  ```
  This yields constant `O(1)` query speed regardless of page depth.




## 7. Test Coverage & Verification

The repository includes comprehensive automated integration test suites built with **Jest** and **Supertest**.

### Running Tests
Execute the full test suite with:
```bash
npm test
```

### Included Test Modules (`tests/`)
* **`tests/assessment.test.js`**: Verifies candidate authentication for assessment brief retrieval (`401` on missing token, `200` on valid private token).
* **`tests/ auth.test.js`**: Tests HR authentication (`200` with JWT generation on valid credentials, `401` on incorrect password).
* **`tests/review.test.js`**: Tests HR authorization middleware (`401` on missing or unauthenticated requests to `/submissions`).
* **`tests/reviewsubmission.test.js`**: Tests evaluation validation constraints (`400` when score exceeds valid range `0-100`).
* **`tests/ audit.test.js`**: Verifies that creating a submission automatically registers a database record in `AuditLog`.

---

## 11. Design Tradeoffs & Future Improvements

### Key Design Tradeoffs

| Feature Area | Current Choice | Rationale | Tradeoff / Consequence |
| :--- | :--- | :--- | :--- |
| **File Storage** | Local Disk Storage (`uploads/`) | Simple local setup, zero cloud dependency for development. | Not horizontally scalable across multiple server instances without shared NFS/EFS. |
| **Rate Limiting** | In-Memory (`express-rate-limit`) | Zero external infrastructure dependency. | Rate limits reset on server restart and are per-instance rather than global across a load balancer. |
| **Candidate Auth** | Static Secret `privateToken` | Simple link-based access for candidate assessment briefs. | If a token leaks, candidate account management/revocation requires manual DB updates. |
| **Pagination** | Offset-based (`skip` / `take`) | Allows random page jumping (`page=3`) in HR UI. | Higher DB query cost on deep page offsets at 50,000+ rows. |

### Recommended Future Improvements
1. **Schema Validation**: Introduce `Zod` or `Joi` middleware for strict request body and query param schema parsing across all endpoints.
2. **Cloud Object Storage**: Replace local disk storage with Amazon S3 / Google Cloud Storage presigned URLs for direct client-to-S3 uploads.
3. **Distributed Caching & Rate Limiting**: Integrate Redis store for `express-rate-limit` and cache static `AssessmentBrief` data.
4. **OpenAPI / Swagger Documentation**: Add Swagger UI endpoint (`/api-docs`) for interactive API exploration.
