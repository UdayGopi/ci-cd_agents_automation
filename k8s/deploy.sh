#!/bin/bash
set -e

# Configuration
NAMESPACE="pipelineforge"
IMAGE_TAG=${1:-latest}
REGISTRY=${2:-"your-registry"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting PipelineForge deployment to Kubernetes...${NC}"

# Create namespace if it doesn't exist
echo -e "${YELLOW}Creating namespace...${NC}"
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMap and Secrets
echo -e "${YELLOW}Applying configuration...${NC}"
kubectl apply -f k8s/configmap.yaml

# Check if secrets exist, if not prompt user to create them
if ! kubectl get secret pipelineforge-secrets -n $NAMESPACE &> /dev/null; then
    echo -e "${RED}Secrets not found. Please create secrets first:${NC}"
    echo "1. Encode your values: echo -n 'your-value' | base64"
    echo "2. Update k8s/secret.yaml with encoded values"
    echo "3. Apply secrets: kubectl apply -f k8s/secret.yaml"
    exit 1
fi

# Update deployment image
echo -e "${YELLOW}Updating deployment image...${NC}"
sed -i.bak "s|your-registry/pipelineforge:latest|$REGISTRY/pipelineforge:$IMAGE_TAG|g" k8s/deployment.yaml

# Apply all Kubernetes resources
echo -e "${YELLOW}Applying Kubernetes resources...${NC}"
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Wait for deployment to be ready
echo -e "${YELLOW}Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/pipelineforge-app -n $NAMESPACE --timeout=300s

# Restore original deployment file
mv k8s/deployment.yaml.bak k8s/deployment.yaml

# Get deployment status
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Deployment status:${NC}"
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=pipelineforge

echo -e "${YELLOW}Service endpoints:${NC}"
kubectl get svc -n $NAMESPACE

echo -e "${YELLOW}Ingress information:${NC}"
kubectl get ingress -n $NAMESPACE