# PipelineForge Deployment Guide

This guide covers three deployment methods for PipelineForge: Render, Docker to ECS, and Kubernetes.

## Prerequisites

- Node.js 18+
- Docker installed locally
- AWS CLI configured (for ECS deployment)
- kubectl configured (for Kubernetes deployment)
- PostgreSQL database (or managed database service)
- GROQ API key

## Method 1: Render Deployment

Render provides the simplest deployment method with automatic builds and scaling.

### Steps:

1. **Connect Repository**: Link your GitHub repository to Render
2. **Configure Service**: Use the provided `render.yaml` configuration
3. **Set Environment Variables**:
   - `GROQ_API_KEY`: Your Groq API key
   - Database will be automatically configured

### Render Configuration:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Health Check**: `/api/health`
- **Auto-deploy**: Enabled on git push

### Benefits:
- Zero-configuration PostgreSQL database
- Automatic SSL certificates
- Built-in CDN
- Automatic scaling
- Git-based deployments

## Method 2: Docker to AWS ECS

ECS provides scalable container orchestration with AWS integration.

### Prerequisites:
- AWS account with appropriate permissions
- ECR repository created
- ECS cluster configured
- RDS PostgreSQL instance (optional)

### Steps:

1. **Build and Push Docker Image**:
```bash
# Build image
docker build -t pipelineforge .

# Tag for ECR
docker tag pipelineforge:latest YOUR_ACCOUNT_ID.dkr.ecr.YOUR_REGION.amazonaws.com/pipelineforge:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.YOUR_REGION.amazonaws.com/pipelineforge:latest
```

2. **Configure ECS Task Definition**:
   - Update `aws/ecs-task-definition.json` with your values
   - Set CPU/Memory based on your needs
   - Configure secrets in AWS Secrets Manager

3. **Deploy to ECS**:
```bash
# Make deploy script executable
chmod +x aws/deploy-to-ecs.sh

# Update configuration in script
# Run deployment
./aws/deploy-to-ecs.sh
```

### ECS Resources:
- **Task Definition**: Container configuration and resource allocation
- **Service**: Manages desired count and load balancer integration
- **Application Load Balancer**: Routes traffic to healthy containers
- **Auto Scaling**: Scales based on CPU/Memory utilization

### Benefits:
- Full AWS integration
- Managed container orchestration
- Load balancing and auto-scaling
- Integration with AWS services (RDS, Secrets Manager)
- Cost-effective for variable workloads

## Method 3: Kubernetes Deployment

Kubernetes provides maximum flexibility and portability across cloud providers.

### Prerequisites:
- Kubernetes cluster (EKS, GKE, AKS, or self-managed)
- kubectl configured
- Container registry access
- Ingress controller installed (nginx-ingress recommended)

### Steps:

1. **Build and Push Image**:
```bash
# Build image
docker build -t your-registry/pipelineforge:latest .

# Push to registry
docker push your-registry/pipelineforge:latest
```

2. **Configure Secrets**:
```bash
# Encode secrets
echo -n "your-database-url" | base64
echo -n "your-groq-api-key" | base64

# Update k8s/secret.yaml with encoded values
kubectl apply -f k8s/secret.yaml
```

3. **Deploy Application**:
```bash
# Make deploy script executable
chmod +x k8s/deploy.sh

# Deploy with custom image
./k8s/deploy.sh latest your-registry
```

### Kubernetes Resources:
- **Namespace**: Isolated environment for PipelineForge
- **ConfigMap**: Non-sensitive configuration
- **Secret**: Database URL and API keys
- **Deployment**: Application pods with rolling updates
- **Service**: Internal load balancing
- **Ingress**: External access and SSL termination
- **HPA**: Horizontal Pod Autoscaler for dynamic scaling

### Benefits:
- Cloud-agnostic deployment
- Advanced networking and security features
- Sophisticated scaling and self-healing
- Extensive ecosystem and tooling
- GitOps-friendly configuration

## Database Considerations

### Required Tables
The application requires the following core tables to be set up:

1. **Users Table**: For authentication and user management
   - Required for user registration and login
   - Stores hashed passwords using bcrypt
   - Manages user profiles and preferences

2. **User Sessions Table**: For session management
   - Required for express-session with connect-pg-simple
   - Handles session persistence and cleanup
   - Automatic session expiration handling

3. **Projects Table**: For project management
   - Stores project configurations
   - Links projects to users
   - Manages repository settings

### Render
- Managed PostgreSQL included
- Automatic backups and scaling
- Connection pooling built-in
- Tables automatically created via Drizzle ORM
- Session management configured automatically

### ECS
- Amazon RDS recommended
- Configure security groups for database access
- Use AWS Secrets Manager for credentials
- Run initial migrations using Drizzle Kit
- Configure session table manually if needed

### Kubernetes
- External managed database (RDS, Cloud SQL, etc.)
- Or deploy PostgreSQL in cluster using Helm charts
- Use Kubernetes secrets for credentials
- Apply migrations using init containers
- Session cleanup via CronJob

## Environment Variables

Required environment variables for database and authentication:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/dbname

# Session Configuration
SESSION_SECRET=your-secure-session-secret

# Optional Configuration
SESSION_MAX_AGE=86400000  # Session duration in milliseconds (default: 24h)
BCRYPT_SALT_ROUNDS=12     # Password hashing rounds (default: 12)
```

## Monitoring and Logging

### Render
- Built-in logging and metrics
- Application performance monitoring
- Log aggregation and search

### ECS
- CloudWatch Logs and Metrics
- AWS X-Ray for tracing
- Container Insights for detailed monitoring

### Kubernetes
- Prometheus and Grafana for metrics
- ELK stack or Loki for logging
- Jaeger for distributed tracing

## Scaling Configuration

### Render
- Automatic scaling based on CPU and memory
- Manual scaling options available

### ECS
- Application Auto Scaling with CloudWatch metrics
- Target tracking scaling policies
- Scheduled scaling for predictable workloads

### Kubernetes
- Horizontal Pod Autoscaler (HPA) for pod scaling
- Vertical Pod Autoscaler (VPA) for resource optimization
- Cluster Autoscaler for node scaling

## Security Best Practices

### All Deployments:
- Use secrets management for sensitive data
- Enable HTTPS/TLS encryption
- Implement proper authentication and authorization
- Regular security updates and vulnerability scanning

### Container Security:
- Use non-root user in containers
- Scan images for vulnerabilities
- Implement resource limits
- Use read-only root filesystem when possible

### Network Security:
- Configure proper security groups/network policies
- Use private subnets for databases
- Implement Web Application Firewall (WAF)
- Monitor and log all network traffic

## Cost Optimization

### Render
- Start with basic plan and scale as needed
- Built-in CDN reduces bandwidth costs

### ECS
- Use Fargate Spot for non-critical workloads
- Right-size task resources
- Implement auto-scaling to avoid over-provisioning

### Kubernetes
- Use node auto-scaling
- Implement resource quotas and limits
- Consider spot instances for cost savings
- Monitor resource usage with tools like KubeCost

## Troubleshooting

### Common Issues:
1. **Database Connection**: Verify connection string and network access
2. **Environment Variables**: Ensure all required secrets are set
3. **Health Checks**: Verify `/api/health` endpoint is accessible
4. **Image Pull**: Check registry authentication and image existence
5. **Resource Limits**: Ensure sufficient CPU and memory allocation

### Debugging Commands:

**ECS**:
```bash
aws ecs describe-services --cluster your-cluster --services your-service
aws logs get-log-events --log-group-name /ecs/pipelineforge
```

**Kubernetes**:
```bash
kubectl get pods -n pipelineforge
kubectl logs -f deployment/pipelineforge-app -n pipelineforge
kubectl describe pod <pod-name> -n pipelineforge
```

## Backup and Recovery

### Database Backups:
- **Render**: Automatic daily backups included
- **ECS with RDS**: Configure automated backups and point-in-time recovery
- **Kubernetes**: Use database-specific backup tools or Velero for cluster backups

### Application State:
- PipelineForge is stateless - all data stored in database
- Backup configuration files and secrets
- Document deployment procedures and environment setup

Choose the deployment method that best fits your infrastructure, team expertise, and scaling requirements. Render is ideal for getting started quickly, ECS provides excellent AWS integration, and Kubernetes offers maximum flexibility and control.