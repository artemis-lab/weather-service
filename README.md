[![Node.js CI](https://github.com/artemis-lab/weather-service/actions/workflows/node.js.yml/badge.svg)](https://github.com/artemis-lab/weather-service/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/artemis-lab/weather-service/branch/master/graph/badge.svg)](https://codecov.io/gh/artemis-lab/weather-service)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Weather Service

A Node.js/Express API service that retrieves weather forecast from the [Weather.gov API](https://www.weather.gov/documentation/services-web-api) for US locations. Built with Node.js, TypeScript, Express, and Zod.

## Purpose

Returns today's weather forecast including conditions and temperature classification (cold/moderate/hot) for given coordinates.

## Live API

The service is deployed and available at:

**Base URL**: `https://api.weather.artemislab.net`

Try it out:

```bash
# Health check
curl https://api.weather.artemislab.net/health

# Get weather forecast for Kansas
curl https://api.weather.artemislab.net/v1/forecast/39.7456,-97.0892

# Get weather forecast for New York City
curl https://api.weather.artemislab.net/v1/forecast/40.7128,-74.0060
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm

### Install Dependencies

```bash
npm install
```

**Note**: `.npmrc` ensures exact versions are installed for deterministic builds.

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

### Run with Docker

Test the production Docker image locally using Docker Compose (recommended):

```bash
# Start the service (builds automatically)
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop and remove containers
docker-compose down

# Rebuild and restart
docker-compose up --build
```

Or use Docker CLI directly:

```bash
# Build and run
docker build -t weather-service .
docker run -p 3000:3000 --name weather-service weather-service

# Run in detached mode (background)
docker run -d -p 3000:3000 --name weather-service weather-service

# Run with custom environment variables
docker run -p 3000:3000 --name weather-service -e CORS_ORIGIN=https://myapp.com weather-service

# View logs
docker logs weather-service
docker logs -f weather-service  # Follow logs (stream)

# Stop and remove container
docker stop weather-service
docker rm weather-service
```

Test the service:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/v1/forecast/39.7456,-97.0892
```

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
GET /v1/forecast/:coordinates
```

The `coordinates` should be in the form `{latitude},{longitude}`.

## Examples

```bash
# Valid US location (Kansas)
curl http://localhost:3000/v1/forecast/39.7456,-97.0892

# Invalid coordinates (out of range)
curl http://localhost:3000/v1/forecast/999,999

# Invalid format
curl http://localhost:3000/v1/forecast/invalid

# Location not in US (will return 404)
curl http://localhost:3000/v1/forecast/0,0
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

### Error Response (429)

```json
{
  "success": false,
  "error": "TooManyRequestsError",
  "message": "Too many requests, please try again later"
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

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 100 requests per IP address
- **Window**: 15 minutes (900 seconds)
- **Headers**: Standard `RateLimit-*` headers are returned with every response
- **Response**: Returns 429 status code when limit is exceeded

**Example:**

```bash
# Check rate limit status in response headers
curl -I http://localhost:3000/health

# Response headers include:
# RateLimit-Limit: 100
# RateLimit-Remaining: 99
# RateLimit-Reset: 900
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
- ✅ **Secure**: Rate limiting (100 req/15min), 1MB body size limit, configurable CORS
- ✅ **Production-ready**: Graceful shutdown handling (SIGTERM/SIGINT)
- ✅ **Well-tested**: 100% test coverage with unit and integration tests
- ✅ **Centralized error handling**: Consistent error responses across all endpoints

## Technical Details

- **Architecture**: Layered architecture (Routes → Controllers → Services)
- **Error Handling**: Custom error classes extending ApplicationError with HTTP status codes
- **Dependency Injection**: Constructor-based DI for testability
- **Testing**: Vitest with 100% test coverage
- **Code Quality**: ESLint + Prettier with automated formatting

## Deployment

This service is ready for deployment to Google Cloud Run. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions including:

- Initial Google Cloud setup and deployment
- Custom domain configuration (`api.weather.yourdomain.com`)
- Automatic SSL certificates
- CI/CD with GitHub Actions
- Scaling and monitoring
- Cost optimization tips

## License

MIT
