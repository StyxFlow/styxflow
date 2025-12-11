# User Module Tests

Comprehensive unit and integration tests for the User module's resume upload functionality.

## Test Structure

### Unit Tests (`user.test.ts`)

Tests individual components in isolation with mocked dependencies.

#### Service Tests

- ✅ Upload resume successfully when candidate exists
- ✅ Throw ApiError when candidate does not exist
- ✅ Handle empty file path (no queue operation)
- ✅ Handle database connection errors
- ✅ Handle queue connection errors

#### Controller Tests

- ✅ Return success response on successful upload
- ✅ Handle errors and pass to next middleware
- ✅ Handle missing user in request
- ✅ Handle missing file in request

### Integration Tests (`user.integration.test.ts`)

Tests the entire API endpoint with HTTP requests, simulating real-world usage.

#### API Endpoint Tests

- ✅ Upload resume successfully with valid file
- ✅ Return 404 when candidate profile not found
- ✅ Return error when no file is uploaded
- ✅ Handle multiple file uploads (only first accepted)
- ✅ Handle PDF files (based on multer config)
- ✅ Handle queue connection errors
- ✅ Handle database connection errors
- ✅ Require authentication (middleware applied)
- ✅ Handle large file uploads (5MB test)
- ✅ Validate file field name is 'resume'
- ✅ Handle concurrent upload requests

## Running Tests

```bash
# Run all tests
yarn test

# Run only unit tests
yarn test:unit

# Run only integration tests
yarn test:integration

# Watch mode (re-run on file changes)
yarn test:watch

# Generate coverage report
yarn test:coverage
```

## Test Coverage

The tests cover:

- **Service Layer**: Database queries, business logic, error handling
- **Controller Layer**: Request/response handling, validation
- **API Routes**: Full HTTP request/response cycle
- **Error Scenarios**: Missing data, connection failures, invalid inputs
- **Edge Cases**: Large files, concurrent requests, empty values

## Mocked Dependencies

- `db.drizzle` - Database operations
- `queues/producer` - BullMQ queue operations
- `validateUser` middleware - Authentication (always passes in tests)

## Test Files Location

- `src/__tests__/user.test.ts` - Unit tests
- `src/__tests__/user.integration.test.ts` - Integration tests
- `vitest.config.ts` - Test configuration

## Notes

- Integration tests create temporary files in `uploads/` directory
- Tests use vitest for test runner and mocking
- Supertest is used for HTTP testing
- All external dependencies are mocked to ensure test isolation
