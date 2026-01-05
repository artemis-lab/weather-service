<!-- omit in toc -->
# Deployment Guide

This guide covers deploying the weather service to Google Cloud Run with a custom domain.

<!-- omit in toc -->
## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
  - [1. Authenticate with Google Cloud](#1-authenticate-with-google-cloud)
  - [2. Configure Docker for Google Cloud](#2-configure-docker-for-google-cloud)
  - [3. Build and Push Docker Image](#3-build-and-push-docker-image)
  - [4. Deploy to Cloud Run](#4-deploy-to-cloud-run)
  - [5. Set Environment Variables (Optional)](#5-set-environment-variables-optional)
  - [6. Verify Deployment](#6-verify-deployment)
- [Custom Domain Setup](#custom-domain-setup)
  - [Option 1: Subdomain (Recommended)](#option-1-subdomain-recommended)
    - [Step 1: Map Domain to Cloud Run](#step-1-map-domain-to-cloud-run)
    - [Step 2: Configure DNS](#step-2-configure-dns)
    - [Step 3: Verify Certificate](#step-3-verify-certificate)
    - [Step 4: Test Your Domain](#step-4-test-your-domain)
  - [Option 2: Apex Domain](#option-2-apex-domain)
- [Scaling](#scaling)
  - [Adjust Memory and CPU](#adjust-memory-and-cpu)
  - [Adjust Instance Limits](#adjust-instance-limits)
  - [Configure Concurrency](#configure-concurrency)
- [Monitoring](#monitoring)
  - [View Logs](#view-logs)
  - [Check Service Status](#check-service-status)
  - [View Metrics](#view-metrics)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
  - [Setup Steps](#setup-steps)
- [Environment Variables](#environment-variables)
- [Cost Optimization](#cost-optimization)
  - [Pricing](#pricing)
  - [Minimize Costs](#minimize-costs)
- [Troubleshooting](#troubleshooting)
  - [Deployment Fails](#deployment-fails)
  - [Architecture Errors](#architecture-errors)
  - [DNS Not Working](#dns-not-working)
  - [Service Not Responding](#service-not-responding)
  - [Port Issues](#port-issues)
- [Rollback](#rollback)
- [Cleanup](#cleanup)
- [Additional Resources](#additional-resources)

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud SDK**: Install the gcloud CLI tool

   ```bash
   # macOS
   brew install --cask google-cloud-sdk

   # Linux
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL

   # Windows
   # Download from: https://cloud.google.com/sdk/docs/install
   ```

3. **Docker**: Required for local testing (see [README.md](./README.md#run-with-docker))
4. **Domain** (Optional): A domain name for your service (e.g., `yourdomain.com`)

## Initial Setup

### 1. Authenticate with Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set your project (create one in console.cloud.google.com if needed)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Configure Docker for Google Cloud

```bash
# Configure Docker to use gcloud as credential helper
gcloud auth configure-docker
```

### 3. Build and Push Docker Image

**Option A: Using Google Cloud Build (Recommended)**

Let Google Cloud build the image for you - this ensures compatibility with Cloud Run's architecture:

```bash
# Set your project ID
export PROJECT_ID=YOUR_PROJECT_ID

# Build and push in one command
gcloud builds submit --tag gcr.io/$PROJECT_ID/weather-service
```

**Option B: Local Build**

If building locally, you must specify the correct architecture:

```bash
# Set your project ID
export PROJECT_ID=YOUR_PROJECT_ID

# Build for amd64 architecture (required for Cloud Run)
docker buildx build --platform linux/amd64 -t gcr.io/$PROJECT_ID/weather-service .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/weather-service
```

**Important**: Cloud Run only supports `linux/amd64` architecture. If you're on Apple Silicon (M1/M2/M3), you must use `--platform linux/amd64` or use `gcloud builds submit`.

### 4. Deploy to Cloud Run

```bash
# Deploy the service
gcloud run deploy weather-service \
  --image gcr.io/$PROJECT_ID/weather-service \
  --platform managed \
  --region us-west1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

# The command will output your service URL
# Example: https://weather-service-xxxxx-uw.a.run.app
```

**Regions**: Choose a region close to your users. Common options:

- `us-west1` (Oregon) - Used in this guide
- `us-east1` (South Carolina)
- `us-central1` (Iowa)
- `europe-west1` (Belgium)
- Full list: https://cloud.google.com/run/docs/locations

**Note**: Replace `us-west1` with your preferred region throughout this guide.

### 5. Set Environment Variables (Optional)

```bash
# Set CORS origin
gcloud run services update weather-service \
  --region us-west1 \
  --set-env-vars CORS_ORIGIN=https://myapp.com

# Or set multiple variables
gcloud run services update weather-service \
  --region us-west1 \
  --set-env-vars CORS_ORIGIN=https://myapp.com,NODE_ENV=production
```

### 6. Verify Deployment

```bash
# Get service URL
gcloud run services describe weather-service \
  --region us-west1 \
  --format 'value(status.url)'

# Test the service (replace with your actual URL)
curl https://weather-service-xxxxx-uw.a.run.app/health
curl https://weather-service-xxxxx-uw.a.run.app/v1/forecast/39.7456,-97.0892
```

## Custom Domain Setup

Cloud Run provides automatic SSL certificates for custom domains.

**Note**: Domain mapping commands require the `gcloud beta` component. If not installed, run:

```bash
gcloud components install beta
```

### Option 1: Subdomain (Recommended)

Set up `api.weather.yourdomain.com` to point to your Cloud Run service.

#### Step 1: Map Domain to Cloud Run

```bash
# Add domain mapping
gcloud beta run domain-mappings create \
  --service weather-service \
  --domain api.weather.yourdomain.com \
  --platform managed
```

Cloud Run will provide DNS records to configure.

#### Step 2: Configure DNS

Add the DNS records shown in the output. Typically you'll need to add:

**For subdomains:**

| Type  | Name        | Value                 |
| ----- | ----------- | --------------------- |
| CNAME | api.weather | ghs.googlehosted.com. |

**For domain verification (if required):**

| Type | Name            | Value                        |
| ---- | --------------- | ---------------------------- |
| TXT  | @ (root domain) | google-site-verification=... |

**Important**: TXT and CNAME records cannot coexist at the same hostname. The TXT verification record must be added at the root domain (@), while the CNAME record is added at the subdomain (api.weather).

**Note**: DNS propagation can take a few minutes to 48 hours.

#### Step 3: Verify Certificate

```bash
# Check domain mapping status
gcloud beta run domain-mappings describe \
  --domain api.weather.yourdomain.com \
  --platform managed

# Wait for status: ACTIVE and certificate provisioned
```

Once active, Google Cloud automatically provisions and renews SSL certificates.

#### Step 4: Test Your Domain

```bash
# Test with custom domain
curl https://api.weather.yourdomain.com/health
curl https://api.weather.yourdomain.com/v1/forecast/39.7456,-97.0892
```

### Option 2: Apex Domain

For apex domains (e.g., `weather.yourdomain.com` or `yourdomain.com`):

```bash
gcloud beta run domain-mappings create \
  --service weather-service \
  --domain weather.yourdomain.com \
  --platform managed
```

Follow the DNS instructions. You'll typically need to add:

- **A records** pointing to Google's IP addresses
- **AAAA records** for IPv6 (optional but recommended)

Google Cloud will provide the specific IP addresses in the mapping output.

## Scaling

### Adjust Memory and CPU

```bash
# Scale to larger instance
gcloud run services update weather-service \
  --region us-west1 \
  --memory 512Mi \
  --cpu 2

# View available options
gcloud run deploy --help | grep -A 5 "memory\|cpu"
```

### Adjust Instance Limits

```bash
# Set minimum instances (avoid cold starts, costs more)
gcloud run services update weather-service \
  --region us-west1 \
  --min-instances 1 \
  --max-instances 20

# Scale to zero (cost-effective, has cold starts)
gcloud run services update weather-service \
  --region us-west1 \
  --min-instances 0 \
  --max-instances 10
```

### Configure Concurrency

```bash
# Set max concurrent requests per instance
gcloud run services update weather-service \
  --region us-west1 \
  --concurrency 80
```

## Monitoring

### View Logs

**Option 1: Cloud Console (Recommended)**

Direct link to your service logs:

```
https://console.cloud.google.com/run/detail/us-west1/weather-service/observability/logs
```

Or navigate manually:

1. Go to https://console.cloud.google.com/run
2. Click on **weather-service**
3. Click the **LOGS** tab

**Option 2: Command Line**

```bash
# Read recent logs (last 50 entries)
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=weather-service" \
  --limit=50 \
  --format=json

# Stream logs in real-time (requires alpha component)
gcloud alpha logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=weather-service" \
  --location=us-west1

# Filter logs by severity
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=weather-service AND severity>=ERROR" \
  --limit=50
```

**What you'll see in logs:**

- Request logs with trace IDs
- Response status codes
- Server startup messages
- Configuration info (CORS origin, NODE_ENV, port)
- Any errors or warnings

### Check Service Status

```bash
# Get detailed service information
gcloud run services describe weather-service --region us-west1

# Get just the service URL
gcloud run services describe weather-service \
  --region us-west1 \
  --format 'value(status.url)'

# List all Cloud Run services in your project
gcloud run services list

# Check a specific revision
gcloud run revisions list --service weather-service --region us-west1
```

### View Metrics

**Cloud Console (Best for visual metrics):**

```
https://console.cloud.google.com/run/detail/us-west1/weather-service/observability/metrics
```

Shows:

- Request count
- Request latency
- Container instance count
- CPU and memory utilization
- Billable container time

**Command Line:**

```bash
# Check current revisions and traffic split
gcloud run services describe weather-service \
  --region us-west1 \
  --format 'value(status.traffic)'
```

## CI/CD with GitHub Actions

Automatic deployment on push to `master` branch is configured in `.github/workflows/cloud-run-deploy.yml`.

### Setup Steps

1. **Create Service Account**:

   ```bash
   # Create service account
   gcloud iam service-accounts create github-actions \
     --display-name "GitHub Actions"

   # Grant permissions
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com \
     --role roles/run.admin

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com \
     --role roles/storage.admin

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com \
     --role roles/iam.serviceAccountUser

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com \
     --role roles/artifactregistry.writer

   # Create and download key
   gcloud iam service-accounts keys create key.json \
     --iam-account github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

2. **Add Secrets to GitHub**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `GCP_PROJECT_ID`: Your Google Cloud project ID
     - `GCP_SA_KEY`: Contents of `key.json` file (paste the entire JSON)

3. **Delete local key file** (security):

   ```bash
   rm key.json
   ```

4. **Push to Master**:
   ```bash
   git push origin master
   ```

The GitHub Action will automatically:

- Run all tests
- Build the Docker image
- Push to Google Container Registry
- Deploy to Cloud Run
- Only deploy if all checks pass

## Environment Variables

Environment variables can be set via the `--set-env-vars` flag:

```bash
# Set a variable
gcloud run services update weather-service \
  --region us-west1 \
  --set-env-vars CORS_ORIGIN=https://myapp.com

# Set multiple variables
gcloud run services update weather-service \
  --region us-west1 \
  --set-env-vars CORS_ORIGIN=https://myapp.com,NODE_ENV=production

# View current environment variables
gcloud run services describe weather-service \
  --region us-west1 \
  --format 'value(spec.template.spec.containers[0].env)'

# Remove a variable
gcloud run services update weather-service \
  --region us-west1 \
  --remove-env-vars CORS_ORIGIN
```

**Available Environment Variables**:

- `NODE_ENV` - Environment mode (defaults to `production`)
- `PORT` - Server port (Cloud Run sets this automatically to 8080, but we use 3000 in Dockerfile)
- `CORS_ORIGIN` - Optional, defaults to `*` (all origins)

**Note**: Cloud Run automatically sets `PORT=8080`, but our Dockerfile exposes port 3000. Cloud Run will map requests correctly.

## Cost Optimization

### Pricing

Google Cloud Run pricing (after free tier):

- **CPU**: $0.00002400/vCPU-second
- **Memory**: $0.00000250/GiB-second
- **Requests**: $0.40 per million requests
- **Free tier** (always available):
  - 2 million requests/month
  - 360,000 GiB-seconds of memory
  - 180,000 vCPU-seconds

**Estimated cost for this service** (after free tier):

- **Low traffic** (10k requests/month): ~$0.50-$2/month
- **Medium traffic** (100k requests/month): ~$5-$10/month
- **Scale to zero**: Pay only when handling requests

Visit [Cloud Run Pricing](https://cloud.google.com/run/pricing) for current rates.

### Minimize Costs

1. **Scale to Zero**: Keep `--min-instances 0` (default)
2. **Use Smallest Resources**: 256Mi memory, 1 CPU is sufficient
3. **Single Region**: Use one region unless you need global distribution
4. **Monitor Usage**: Use Cloud Console to track requests and costs
5. **Set Budgets**: Configure budget alerts in Cloud Console

```bash
# Check current configuration
gcloud run services describe weather-service --region us-west1

# Optimize for cost
gcloud run services update weather-service \
  --region us-west1 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

## Troubleshooting

### Deployment Fails

```bash
# Check logs during deployment
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=weather-service" --limit=50

# Describe service for errors
gcloud run services describe weather-service --region us-west1

# Test locally first
docker build -t weather-service .
docker run -p 3000:3000 weather-service
```

### Architecture Errors

If you see an error like:

```
Cloud Run does not support image: Container manifest type 'application/vnd.oci.image.index.v1+json' must support amd64/linux
```

This means your Docker image was built for the wrong architecture (likely ARM64 on Apple Silicon Macs).

**Fix**: Rebuild with the correct architecture:

```bash
# Option 1: Use Google Cloud Build (recommended)
gcloud builds submit --tag gcr.io/$PROJECT_ID/weather-service

# Option 2: Build locally with platform flag
docker buildx build --platform linux/amd64 -t gcr.io/$PROJECT_ID/weather-service .
docker push gcr.io/$PROJECT_ID/weather-service
```

### DNS Not Working

```bash
# Verify domain mapping status
gcloud beta run domain-mappings describe \
  --domain api.weather.yourdomain.com \
  --platform managed

# Check DNS propagation
dig api.weather.yourdomain.com
nslookup api.weather.yourdomain.com

# Common issues:
# - DNS records not propagated (wait up to 48 hours)
# - Incorrect CNAME format (check DNS provider docs)
# - Domain verification pending (check domain mapping status)
```

### Service Not Responding

```bash
# Check service status
gcloud run services describe weather-service --region us-west1

# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=weather-service" --limit=100

# Check health endpoint (replace with your actual URL)
curl https://weather-service-xxxxx-uw.a.run.app/health

# Redeploy if needed
gcloud run deploy weather-service \
  --image gcr.io/$PROJECT_ID/weather-service \
  --region us-west1
```

### Port Issues

Cloud Run expects services to listen on the port specified by the `PORT` environment variable (default 8080). Our Dockerfile uses port 3000, but we specify `--port 3000` in the deploy command, so Cloud Run handles the mapping correctly.

If you have issues, verify:

```bash
# Check that port is set correctly
gcloud run services describe weather-service \
  --region us-west1 \
  --format 'value(spec.template.spec.containers[0].ports[0].containerPort)'
```

## Rollback

```bash
# List revisions
gcloud run revisions list --service weather-service --region us-west1

# Rollback to specific revision
gcloud run services update-traffic weather-service \
  --region us-west1 \
  --to-revisions REVISION_NAME=100
```

## Cleanup

```bash
# Delete the service
gcloud run services delete weather-service --region us-west1

# Delete domain mapping
gcloud beta run domain-mappings delete \
  --domain api.weather.yourdomain.com \
  --platform managed

# Delete container images
gcloud container images delete gcr.io/$PROJECT_ID/weather-service
```

## Additional Resources

- [Cloud Run Documentation](https://docs.cloud.google.com/run/docs)
- [Cloud Run Quickstart](https://docs.cloud.google.com/run/docs/quickstarts)
- [Custom Domains](https://docs.cloud.google.com/run/docs/mapping-custom-domains)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
