import { storage } from "../storage";
import { groqService } from "../services/groqService";

interface SecurityAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

interface SecurityScan {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  findings: SecurityAlert[];
  startedAt: Date;
  completedAt?: Date;
}

class SecurityAgent {
  private activeScans: Map<string, SecurityScan> = new Map();

  async analyzePipelineSecurity(pipelineId: string) {
    try {
      const pipeline = await storage.getPipeline(parseInt(pipelineId));
      if (!pipeline) throw new Error('Pipeline not found');

      // Analyze pipeline configuration
      const configIssues = await this.scanConfiguration(pipeline.configuration);
      
      // Analyze recent builds
      const builds = await storage.getBuilds();
      const buildIssues = await this.scanBuilds(builds);

      // Get AI security recommendations
      const recommendations = await groqService.analyzeSecurityRisks({
        pipeline,
        builds: builds.slice(0, 5),
        context: "Pipeline security analysis"
      });

      return {
        configurationIssues: configIssues,
        buildIssues: buildIssues,
        recommendations,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Pipeline security analysis error:", error);
      return null;
    }
  }

  async scanConfiguration(config: any): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];

    // Check for sensitive data exposure
    if (this.containsSensitiveData(config)) {
      alerts.push({
        severity: 'high',
        type: 'sensitive_data_exposure',
        description: 'Pipeline configuration contains sensitive data',
        timestamp: new Date(),
        metadata: { type: 'configuration' }
      });
    }

    // Check for insecure commands
    if (this.hasInsecureCommands(config)) {
      alerts.push({
        severity: 'critical',
        type: 'insecure_command',
        description: 'Pipeline contains potentially dangerous commands',
        timestamp: new Date(),
        metadata: { type: 'configuration' }
      });
    }

    return alerts;
  }

  async scanBuilds(builds: any[]): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];

    for (const build of builds) {
      // Check for dependency vulnerabilities
      if (build.dependencies) {
        const vulnDeps = await this.checkDependencies(build.dependencies);
        if (vulnDeps.length > 0) {
          alerts.push({
            severity: 'high',
            type: 'vulnerable_dependencies',
            description: 'Build contains vulnerable dependencies',
            timestamp: new Date(),
            metadata: { dependencies: vulnDeps }
          });
        }
      }

      // Check for suspicious build patterns
      if (this.hasSuspiciousPatterns(build)) {
        alerts.push({
          severity: 'medium',
          type: 'suspicious_pattern',
          description: 'Build exhibits suspicious patterns',
          timestamp: new Date(),
          metadata: { buildId: build.id }
        });
      }
    }

    return alerts;
  }

  private containsSensitiveData(config: any): boolean {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /credential/i
    ];

    return this.searchPatterns(config, sensitivePatterns);
  }

  private hasInsecureCommands(config: any): boolean {
    const insecureCommands = [
      'curl',
      'wget',
      'chmod 777',
      'eval',
      'sudo'
    ];

    return this.searchPatterns(config, insecureCommands);
  }

  private searchPatterns(obj: any, patterns: Array<string | RegExp>): boolean {
    const str = JSON.stringify(obj).toLowerCase();
    return patterns.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(str);
      }
      return str.includes(pattern.toLowerCase());
    });
  }

  private async checkDependencies(deps: any[]): Promise<string[]> {
    // Implement dependency vulnerability checking
    // This could integrate with services like Snyk or npm audit
    return [];
  }

  private hasSuspiciousPatterns(build: any): boolean {
    // Implement detection of suspicious build patterns
    // This could check for unusual resource usage, network calls, etc.
    return false;
  }

  async startSecurityScan(pipelineId: string): Promise<string> {
    const scanId = `scan_${Date.now()}`;
    
    const scan: SecurityScan = {
      id: scanId,
      status: 'pending',
      findings: [],
      startedAt: new Date()
    };

    this.activeScans.set(scanId, scan);

    // Start async scan
    this.runSecurityScan(scanId, pipelineId).catch(console.error);

    return scanId;
  }

  private async runSecurityScan(scanId: string, pipelineId: string) {
    try {
      const scan = this.activeScans.get(scanId);
      if (!scan) return;

      scan.status = 'in_progress';
      
      // Run security analysis
      const results = await this.analyzePipelineSecurity(pipelineId);
      
      if (results) {
        scan.findings = [
          ...results.configurationIssues,
          ...results.buildIssues
        ];
      }

      scan.status = 'completed';
      scan.completedAt = new Date();

    } catch (error) {
      console.error('Security scan error:', error);
      const scan = this.activeScans.get(scanId);
      if (scan) {
        scan.status = 'failed';
        scan.completedAt = new Date();
      }
    }
  }

  async getScanStatus(scanId: string): Promise<SecurityScan | null> {
    return this.activeScans.get(scanId) || null;
  }
}

export const securityAgent = new SecurityAgent(); 