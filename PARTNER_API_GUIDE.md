# Northstar Bank Customer Enrollment API Partner Guide

The Customer Enrollment API lets approved Northstar Bank partners submit and track retail banking enrollment applications from their own onboarding experiences. Partners use this API when a customer elects to open a Northstar Bank checking, savings, or credit-card product through a trusted external channel. The API is designed for secure handoff, transparent lifecycle status, and consistent operational review across partner-submitted applications.

## Authentication

All requests require an API key in the `x-api-key` header.

```bash
curl http://localhost:3000/applications \
  -H "x-api-key: demo-key" \
  -H "x-correlation-id: corr_demo_partner_001"
```

Use a unique `x-correlation-id` per request when possible. If you do not provide one, the API generates an ID using the `corr_demo_<uuid>` format and returns it in the response.

## Base URL

For local partner workspace demos:

```text
http://localhost:3000
```

For hosted partner sandbox demonstrations, Northstar Bank will provide a partner-specific base URL and API key through the Postman Partner Workspace.

## Integration Workflows

### Submit a New Application

1. Collect customer identity, contact, address, product, deposit, and consent details.
2. Send `POST /applications` with the complete enrollment payload.
3. Store the returned `data.id` as the partner application reference.
4. Display the returned status to the customer or partner operations team.

### Check Application Status

1. Call `GET /applications/{applicationId}` with the stored application ID.
2. Read `data.status`, `data.requiredDocuments`, and `data.decisionSummary`.
3. Prompt the customer for documents or next steps when required.

### Operational Status Updates

Northstar Bank internal operators or approved service integrations can use `PATCH /applications/{applicationId}/status` to move applications through the supported lifecycle:

```text
submitted -> in-review -> approved
submitted -> in-review -> rejected
submitted -> cancelled
in-review -> cancelled
```

Terminal statuses are `approved`, `rejected`, and `cancelled`.

## Rate Limits and Usage Guidelines

These values are mock limits for the Postman Enterprise demo:

| Limit | Value |
| --- | --- |
| Burst rate | 60 requests per minute per API key |
| Daily volume | 25,000 requests per partner sandbox |
| Payload size | 256 KB per request |
| Retention | Demo data is in-memory and resets when the service restarts |

Recommended usage:

- Send one application submission per customer intent.
- Reuse the returned application ID for status checks.
- Provide a correlation ID for each request so Northstar Bank support can trace partner traffic.
- Do not submit production customer data to the demo environment.
- Treat API keys as secrets and never embed them in public client-side code.

## Error Handling

Errors use a consistent response shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "customer.email is required.",
    "correlationId": "corr_demo_partner_001"
  }
}
```

Common error codes:

| HTTP Status | Error Code | Meaning |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Required fields are missing or invalid. |
| 401 | `UNAUTHORIZED` | The `x-api-key` header is missing or invalid. |
| 404 | `APPLICATION_NOT_FOUND` | The requested application ID does not exist. |
| 409 | `INVALID_STATUS_TRANSITION` | The requested lifecycle move is not allowed. |
| 500 | `INTERNAL_SERVER_ERROR` | The service encountered an unexpected error. |

## Partner Support

Northstar Bank API Partner Team  
Email: api-partners@northstarbank.example  
Escalation hours: Monday to Friday, 8:00 AM to 6:00 PM Mountain Time  
Postman Partner Workspace: Shared by invitation from the Northstar Bank API Platform Team
