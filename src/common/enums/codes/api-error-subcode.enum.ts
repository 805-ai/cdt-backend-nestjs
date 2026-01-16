export enum ApiErrorSubCode {
  // =============================================================================
  // 🔹 1000: Validation Errors
  // =============================================================================

  INVALID_DATA = 1001, // Generic invalid input
  MISSING_REQUIRED_FIELD = 1002, // Required field missing
  DUPLICATE_DATA = 1003, // Unique constraint violated
  INVALID_FORMAT = 1004, // Wrong format (e.g., email, phone)
  VALUE_TOO_LONG = 1005, // Exceeds max length
  VALUE_TOO_SHORT = 1006, // Below min length
  VALUE_OUT_OF_RANGE = 1007, // Number/date out of bounds
  INVALID_ENUM_VALUE = 1008, // Not in allowed list
  MALFORMED_JSON = 1009, // Invalid JSON in request
  CONFLICTING_FIELDS = 1010, // Mutually exclusive fields provided

  // =============================================================================
  // 🔹 2000: Resource Errors
  // =============================================================================

  NOT_FOUND = 2001, // Resource not found
  ALREADY_EXISTS = 2002, // Resource already exists
  DEPENDENT_RESOURCES_EXIST = 2003, // Can't delete due to dependencies
  RESOURCE_LOCKED = 2004, // Resource is immutable (e.g., paid, finalized)
  RESOURCE_ARCHIVED = 2005, // Resource is soft-deleted/inactive
  EXCEEDS_QUOTA = 2006, // User/org hit limit (e.g., storage, items)
  RATE_LIMITED = 2007, // Too many requests (can also be 4xxx)

  // =============================================================================
  // 🔹 3000: Auth & Session Errors
  // =============================================================================

  UNAUTHORIZED_ACCESS = 3001, // No valid auth (401)
  FORBIDDEN_ACCESS = 3002, // Auth OK but no permission (403)
  TOKEN_EXPIRED = 3003, // JWT or API token expired
  INVALID_SESSION = 3004, // Session invalid or not found
  INVALID_CREDENTIALS = 3005, // Wrong email/password
  ACCOUNT_LOCKED = 3006, // Temporarily locked (e.g., 5 failed logins)
  ACCOUNT_INACTIVE = 3007, // User banned, suspended, or unverified
  INSUFFICIENT_SCOPES = 3008, // Token lacks required permissions
  MFA_REQUIRED = 3009, // MFA needed but not provided
  SESSION_EXPIRED = 3010, // Session timed out
  PASSWORD_RESET_REQUIRED = 3011, // Forced password change

  // =============================================================================
  // 🔹 4000: Server & Operation Errors
  // =============================================================================

  OPERATION_FAILED = 4001, // Generic server-side failure
  EXTERNAL_SERVICE_ERROR = 4002, // Downstream service failed
  TIMEOUT = 4003, // Request timed out
  SERVICE_UNAVAILABLE = 4004, // Temporarily down (e.g., maintenance)
  DATABASE_ERROR = 4006, // DB connection/query failed
  VALIDATION_FAILED = 4008, // Business rule validation failed
  INCONSISTENT_STATE = 4009, // System in invalid state for action
  NOT_IMPLEMENTED = 4010, // Feature not yet supported
  PAYLOAD_TOO_LARGE = 4012, // Request body too big
  UNSUPPORTED_MEDIA_TYPE = 4013, // e.g., sent XML when only JSON accepted

  // =============================================================================
  // 🔹 5000: Business Logic / Workflow Errors
  // Customize based on your app (e.g., e-commerce, SaaS, bookings)
  // =============================================================================

  PAYMENT_REQUIRED = 5001, // Subscription expired, payment needed
  ORDER_NOT_CONFIRMED = 5002, // Order exists but not confirmed
  INVALID_TRANSITION = 5003, // Invalid state change (e.g., cancel shipped order)
  FRAUD_DETECTED = 5004, // Suspicious activity blocked
  INVOICE_PAID = 5005, // Can't modify a paid invoice
  TRIAL_EXPIRED = 5006, // Free trial ended
  FEATURE_DISABLED = 5007, // Feature disabled for plan/user
  ACTION_NOT_ALLOWED = 5008, // Action not allowed in current context
  INSUFFICIENT_BALANCE = 5009, // Wallet balance too low
  MAX_DRAFTS_REACHED = 5010,
  INITIALIZATION_FAILED,
  NOT_AUTHORIZED,
  NOT_ALLOWED,
  INVALID_INPUT,
  NOT_VERIFIED,
  IDEMPOTENCY_CONFLICT,
  INVALID_HEADER,
  INVALID_TIMESTAMP,
  UNAUTHORIZED, // User hit limit on drafts
}
