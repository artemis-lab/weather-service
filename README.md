[![Node.js CI](https://github.com/artemis-lab/weather-service/actions/workflows/node.js.yml/badge.svg)](https://github.com/artemis-lab/weather-service/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/artemis-lab/weather-service/branch/master/graph/badge.svg)](https://codecov.io/gh/artemis-lab/weather-service)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Weather Service

A Node.js/Express API service that retrieves weather forecast from the [Weather.gov API](https://www.weather.gov/documentation/services-web-api) for US locations.

## Purpose

Returns today's weather forecast including conditions and temperature classification (cold/moderate/hot) for given coordinates.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm

### Install Dependencies

```bash
npm install
```

### Configuration

The service can be configured using environment variables:

```bash
# Required: Environment mode
NODE_ENV=development  # or production

# Optional: CORS origin (default: * allows all origins)
CORS_ORIGIN=https://myapp.com

# Optional: Server port (default: 3000)
PORT=8080
```

### Build

```bash
npm run build
```

### Run

```bash
# Development with hot reload
npm run dev

# Production (requires build first)
npm start
```

The server runs on `http://localhost:3000` by default (configurable via `PORT` environment variable).

### Development

```bash
# Run tests
npm run test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests with coverage and open coverage report in a browser
npm run test:coverage:open

# Run tests in a browser
npm run test:ui

# Lint code
npm run lint

# Format code
npm run format
```

## API Usage

### Get Weather Forecast

```bash
GET /api/v1/weather/forecast/:coordinates
```

The `coordinates` should be in the form `{latitude},{longitude}`.

## Examples

```bash
# Valid US location (Kansas)
curl http://localhost:3000/api/v1/weather/forecast/39.7456,-97.0892

# Invalid coordinates (out of range)
curl http://localhost:3000/api/v1/weather/forecast/999,999

# Invalid format
curl http://localhost:3000/api/v1/weather/forecast/invalid

# Location not in US (will return 404)
curl http://localhost:3000/api/v1/weather/forecast/0,0
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "name": "This Afternoon",
    "shortForecast": "Partly Cloudy",
    "temperature": "cold",
    "location": {
      "latitude": 39.7456,
      "longitude": -97.0892
    }
  }
}
```

### Error Response (400)

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Latitude must be between -90 and 90",
  "details": [
    {
      "field": "latitude",
      "message": "Latitude must be between -90 and 90"
    }
  ]
}
```

### Error Response (404)

```json
{
  "success": false,
  "error": "NotFoundError",
  "message": "Location not found. Coordinates may be outside the US or in an unsupported area"
}
```

### Error Response (503)

```json
{
  "success": false,
  "error": "ServiceUnavailableError",
  "message": "Weather service returned status 500"
}
```

## Health Check

```bash
curl http://localhost:3000/health
```

## Temperature Classification

- **cold**: <= 50F
- **moderate**: 51-79F
- **hot**: >= 80F

## Features

- ✅ **Type-safe**: Written in TypeScript with strict mode enabled
- ✅ **Validated**: Zod schema validation for all inputs
- ✅ **Resilient**: Automatic retry logic with exponential backoff (3 attempts)
- ✅ **Observable**: Structured logging with trace IDs for request tracking
- ✅ **Secure**: 1MB body size limit, configurable CORS
- ✅ **Production-ready**: Graceful shutdown handling (SIGTERM/SIGINT)
- ✅ **Well-tested**: 100% test coverage with unit and integration tests
- ✅ **Centralized error handling**: Consistent error responses across all endpoints

## Technical Details

- **Architecture**: Layered architecture (Routes → Controllers → Services)
- **Error Handling**: Custom error classes extending ApplicationError with HTTP status codes
- **Dependency Injection**: Constructor-based DI for testability
- **Testing**: Vitest with 100% test coverage
- **Code Quality**: ESLint + Prettier with automated formatting

## License

MIT
