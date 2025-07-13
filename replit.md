# PipelineForge - CI/CD Automation Platform

## Overview

PipelineForge is a full-stack web application that automates Continuous Integration (CI) and Continuous Deployment (CD) workflows using intelligent agents. The platform provides automated project detection, build orchestration, deployment management, and AI-powered insights to optimize development workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- ✅ Implemented complete authentication system with login/signup and session management
- ✅ Added project creation and management features with real-time updates
- ✅ Added Security dashboard with vulnerability tracking, compliance monitoring, and security trends
- ✅ Created Cost Analytics page with cost breakdown, optimization recommendations, and forecasting
- ✅ Built comprehensive Monitoring dashboard with system health, agents status, and real-time logs
- ✅ Implemented Teams management with CRUD operations and team collaboration features
- ✅ Added Settings page with profile, notifications, security, integrations, and preferences
- ✅ Created comprehensive Tech Overview document with enhanced UI, colors, and symbols
- ✅ Updated router to include all new pages and fixed navigation issues
- ✅ Enhanced sidebar with proper navigation links and icons
- ✅ Added comprehensive API endpoints for teams, compliance, metrics, and audit logs
- ✅ Integrated GitLab and Bitbucket webhook support alongside GitHub
- ✅ Implemented multi-cloud deployment methods in DeployMaster agent

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **UI Library**: Radix UI components with shadcn/ui design system for consistent, accessible interfaces
- **Styling**: Tailwind CSS with custom theming supporting both light and dark modes
- **State Management**: TanStack Query (React Query) for efficient server state management and caching
- **Routing**: Wouter for lightweight client-side routing with minimal bundle size impact
- **Build Tool**: Vite for fast development server and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server using TypeScript and ESM modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database using serverless connection pooling
- **Authentication**: Session-based authentication with connect-pg-simple
- **Authorization**: Role-based access control (RBAC) with team-based isolation
- **WebSocket**: Native WebSocket support for real-time updates
- **Monitoring**: Prometheus metrics integration for observability
- **Security**: Audit logging, permission checking, and rate limiting
- **CI/CD**: Built-in pipeline execution with Git integration
- **AI Integration**: Groq API for AI-powered insights

### Core Features

#### CI/CD Pipeline
- **Build Process**: Automated Git clone, build, and test execution
- **Deployment**: Environment-specific deployment handling
- **Status Tracking**: Real-time pipeline status and logs
- **Metrics**: Build duration, success rates, and resource usage tracking
- **Cancellation**: Pipeline execution cancellation support

#### Team Management
- **Teams**: Multi-team support with role-based access
- **Projects**: Team-scoped project management
- **Permissions**: Granular permission system
- **Audit**: Comprehensive action logging and tracking
- **Roles**: Customizable role definitions and assignments

#### Monitoring
- **Metrics**: Prometheus integration for system metrics
- **Pipeline Stats**: Build and deployment analytics
- **Resource Usage**: CPU, memory, and disk utilization tracking
- **Performance**: API latency and error rate monitoring
- **Alerts**: Threshold-based alerting (planned)

### Database Schema
The application uses a relational database with the following key entities:
- **Users**: Authentication and user profile management with bcrypt password hashing
- **Projects**: Project configuration and repository settings
- **User Sessions**: Session storage for authentication persistence
- **Builds**: CI pipeline execution records
- **Deployments**: CD pipeline execution records  
- **Agents**: Intelligent automation agents status
- **Notifications**: System alerts and updates

### Frontend Pages
- **Dashboard**: Overview of system status, recent builds, and AI insights
- **Pipelines**: Pipeline management and execution monitoring
- **AI Assistant**: Interactive AI chat for optimization recommendations
- **Agents**: Intelligent automation agents status and configuration
- **Monitoring**: System health and performance metrics
- **Security**: Security dashboard with vulnerability tracking
- **Cost Analytics**: Infrastructure cost monitoring and optimization
- **Teams**: Team member management and permissions
- **Settings**: User preferences and system configuration

### Intelligent Agents
- **AutoBuild**: Automated CI pipeline execution
- **DeployMaster**: Deployment orchestration and management
- **SecureGuard**: Security scanning and compliance monitoring
- **CostOptimizer**: Resource usage optimization
- **AI Assistant**: Conversational AI for recommendations and troubleshooting

## Data Flow

1. **User Authentication**: Session-based authentication with PostgreSQL storage
2. **Pipeline Creation**: Users configure CI/CD pipelines for their repositories
3. **Build Triggers**: Automated builds triggered by repository changes or manual execution
4. **Agent Orchestration**: Intelligent agents process builds and deployments
5. **Real-time Updates**: WebSocket connections provide live status updates
6. **AI Analysis**: Groq API analyzes performance and provides optimization insights

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **AI Service**: Groq API for AI-powered features
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS for utility-first styling approach

### Development Tools
- **TypeScript**: Static type checking across the entire stack
- **Vite**: Fast build tool with hot module replacement
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Development Server**: TSX for TypeScript execution with hot reload
- **Database**: Direct connection to Neon PostgreSQL
- **Build Process**: Vite dev server with instant hot module replacement

### Production Environment
- **Build Process**: Vite production build with ESBuild bundling
- **Server**: Node.js with bundled Express application
- **Database**: Neon PostgreSQL with connection pooling
- **Environment Variables**: DATABASE_URL and GROQ_API_KEY required
- **Health Checks**: `/api/health` endpoint for monitoring

### Multi-Platform Deployment Support

#### 1. Render Deployment (Easiest)
- **Configuration**: `render.yaml` with automatic database provisioning
- **Features**: Auto-deploy on git push, managed PostgreSQL, SSL certificates
- **Best For**: Quick deployment, staging environments, small to medium scale

#### 2. Docker to AWS ECS (AWS Native)
- **Configuration**: `Dockerfile`, ECS task definitions, and deployment scripts
- **Features**: Auto-scaling, load balancing, AWS service integration
- **Components**: ECR registry, ECS Fargate, Application Load Balancer
- **Best For**: AWS-centric infrastructure, enterprise environments

#### 3. Kubernetes (Maximum Flexibility)
- **Configuration**: Complete K8s manifests with HPA, ingress, and monitoring
- **Features**: Multi-cloud support, advanced scaling, GitOps workflows
- **Components**: Deployments, services, secrets, ingress controllers
- **Best For**: Complex deployments, multi-cloud, advanced orchestration needs

### Deployment Files Created
- `render.yaml` - Render platform configuration
- `Dockerfile` - Multi-stage container build
- `docker-compose.yml` - Local development with containers
- `aws/` - ECS deployment configurations and scripts
- `k8s/` - Complete Kubernetes manifests
- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions

### Configuration Management
- **Environment Variables**: Database URL and API keys through environment variables
- **Path Aliases**: TypeScript path mapping for clean imports
- **CORS**: Configurable cross-origin resource sharing for API access
- **Rate Limiting**: API request rate limiting for security and performance