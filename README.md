# Customer Enrollment API

![Northstar Bank](https://img.shields.io/badge/Northstar%20Bank-Customer%20Enrollment%20API-0055A4)

Northstar Bank uses the Customer Enrollment API to accept, review, and manage digital account enrollment applications across retail banking channels. It is consumed by mobile banking, branch-assisted onboarding, contact-center tools, and approved partner onboarding experiences that need a governed way to submit prospective customer information. The API exists in the Northstar Bank portfolio to standardize enrollment workflows, enforce consistent security controls, and make application status visible across internal and partner journeys.

## Quick Start

```bash
npm install
npm start
# Server running at http://localhost:3000
```

The API key defaults to `demo-key`. Override it with `API_KEY` when needed:

```bash
API_KEY=another-demo-key PORT=3000 npm start
```

## Curl Examples

```bash
# Happy path
curl http://localhost:3000/health -H "x-api-key: demo-key"

# Unauthorized
curl http://localhost:3000/health -H "x-api-key: wrong-key"
```

Create an enrollment application:

```bash
curl -X POST http://localhost:3000/applications \
  -H "x-api-key: demo-key" \
  -H "Content-Type: application/json" \
  -d '{
    "productType": "checking",
    "initialDepositAmount": 250,
    "customer": {
      "firstName": "Riley",
      "lastName": "Morgan",
      "dateOfBirth": "1989-04-18",
      "email": "riley.morgan@example.com",
      "phone": "+1-555-0172",
      "taxIdLast4": "4821",
      "address": {
        "line1": "410 Market Street",
        "line2": "Suite 8",
        "city": "Denver",
        "state": "CO",
        "postalCode": "80202",
        "country": "US"
      }
    },
    "consent": {
      "acceptedTerms": true,
      "marketingOptIn": false
    }
  }'
```

## API Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Returns service health and correlation metadata. |
| POST | `/applications` | Creates a customer enrollment application. |
| GET | `/applications` | Lists applications with optional `status`, `product-type`, `limit`, and `offset` query parameters. |
| GET | `/applications/:applicationId` | Retrieves an application by ID. |
| PATCH | `/applications/:applicationId/status` | Updates an application lifecycle status. |
| DELETE | `/applications/:applicationId` | Deletes a demo application and returns a cancellation result. |

## Response Shape

Most success responses use an envelope:

```json
{
  "data": {},
  "meta": {
    "correlationId": "corr_demo_123",
    "timestamp": "2026-05-12T16:30:00.000Z"
  }
}
```

Errors use:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "A valid x-api-key header is required.",
    "correlationId": "corr_demo_123"
  }
}
```

## Postman Setup

1. Import `openapi.yaml` as an API definition.
2. Import `postman/collection.json`.
3. Import `postman/environment.json` and select `Northstar Bank — Customer Enrollment API`.
4. Confirm `baseUrl` is `http://localhost:3000` and `apiKey` is `demo-key`.
5. Run the `Smoke Tests` folder first, then run `E2E Workflow`, `CRUD Operations`, and `Negative Tests`.

The E2E workflow creates an application, reads it, moves it to `in-review`, approves it, and verifies the final state. Tests also validate response envelopes, data types, lifecycle rules, and negative auth behavior.

## Docker

```bash
docker build -t northstar/customer-enrollment-api:1.0.0 .
docker run --rm -p 3000:3000 \
  -e PORT=3000 \
  -e API_KEY=demo-key \
  northstar/customer-enrollment-api:1.0.0
```

## Helm

```bash
helm install customer-enrollment-api ./helm/customer-enrollment-api
helm upgrade customer-enrollment-api ./helm/customer-enrollment-api
helm template customer-enrollment-api ./helm/customer-enrollment-api
```

Default chart values deploy two replicas, a ClusterIP service, authenticated health probes on `/health`, and an ingress host at `customer-enrollment-api.northstarbank.internal`.

## Postman Enterprise Demo Guide

Use this sequence to demonstrate API security and governance in Postman Enterprise:

1. Import `openapi.yaml` as the Customer Enrollment API definition.
2. Link `postman/collection.json` to the API so requests and tests are attached to the governed API surface.
3. Publish the API to the Postman Private API Network for internal discovery by mobile, branch, and contact-center teams.
4. Share the partner-ready collection and `PARTNER_API_GUIDE.md` through a Postman Partner Workspace.
5. Create a Postman Monitor that runs the `Smoke Tests` folder on a schedule.
6. Review test results to show operational checks for health, authentication, and contract shape.

Security and governance talking points:

- API key enforcement is applied globally through the `x-api-key` header.
- Every request gets a correlation ID for traceability across demos, monitors, and partner support workflows.
- The OpenAPI contract defines standard success and error shapes, required fields, and endpoint examples.
- Negative tests prove invalid keys, invalid payloads, unknown resources, and invalid lifecycle transitions are handled cleanly.
- The Private API Network helps internal consumers discover the governed API definition instead of copying undocumented endpoints.
- Partner Workspaces allow external collaborators to receive curated docs, examples, and tests without exposing internal-only workspaces.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| `401 UNAUTHORIZED` | Send `x-api-key: demo-key`, or start the server with the same `API_KEY` value used by the client. |
| `Route GET / was not found.` | Use `/health` or one of the documented `/applications` routes. |
| Postman tests fail on connection refused | Start the API with `npm start` and confirm `baseUrl` is `http://localhost:3000`. |
| Status update returns `409 INVALID_STATUS_TRANSITION` | Move applications through `submitted -> in-review -> approved/rejected`, or cancel before terminal states. |
| Helm probe fails | Confirm `apiKeySecret.value` matches the running application `API_KEY`. |
| Docker build cannot install dependencies | Run `npm install` locally to create `package-lock.json`, then build again from the project root. |

## Project Structure

```text
customer-enrollment-api/
├── openapi.yaml
├── package.json
├── src/
├── postman/
├── Dockerfile
├── .dockerignore
├── helm/
├── PARTNER_API_GUIDE.md
└── README.md
```
