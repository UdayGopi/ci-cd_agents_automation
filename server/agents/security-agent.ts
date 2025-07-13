import { storage } from "../storage";
import { groqService } from "../services/groqService";

interface SecurityScan {
  id: number;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  findings: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

interface SecurityRecommendation {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  remediation: string;
}

class SecurityAgent {
  private activeScans: Map<number, SecurityScan> = new Map();

  async startSecurityScan(pipelineId: number): Promise<SecurityScan> {
    try {
      const scan: SecurityScan = {
        id: Date.now(),
        timestamp: new Date(),
        severity: 'low',
        findings: [],
        status: 'pending'
      };

      this.activeScans.set(scan.id, scan);

      // Start async scan process
      this.runSecurityScan(scan.id, pipelineId).catch(console.error);

      return scan;
    } catch (error) {
      console.error('Security scan error:', error);
      throw error;
    }
  }

  private async runSecurityScan(scanId: number, pipelineId: number) {
    try {
      const scan = this.activeScans.get(scanId);
      if (!scan) return;

      scan.status = 'in_progress';

      const pipeline = await storage.getPipeline(pipelineId);
      if (!pipeline) throw new Error('Pipeline not found');

      // Perform security checks
      const findings = await this.performSecurityChecks(pipeline);
      
      scan.findings = findings;
      scan.status = 'completed';
      scan.severity = this.calculateSeverity(findings);

      this.activeScans.set(scanId, scan);
    } catch (error) {
      console.error('Security scan execution error:', error);
      const scan = this.activeScans.get(scanId);
      if (scan) {
        scan.status = 'completed';
        scan.findings = ['Error during security scan'];
        scan.severity = 'high';
        this.activeScans.set(scanId, scan);
      }
    }
  }

  private async performSecurityChecks(pipeline: any): Promise<string[]> {
    const findings: string[] = [];

    // Basic security checks
    if (!pipeline.configuration?.securitySettings?.scanning) {
      findings.push('Security scanning is not enabled');
    }

    if (!pipeline.configuration?.securitySettings?.authentication) {
      findings.push('Authentication is not configured');
    }

    return findings;
  }

  private calculateSeverity(findings: string[]): 'low' | 'medium' | 'high' {
    if (findings.length === 0) return 'low';
    if (findings.length < 3) return 'medium';
    return 'high';
  }

  async getScanStatus(scanId: number): Promise<SecurityScan | null> {
    return this.activeScans.get(scanId) || null;
  }

  async getSecurityRecommendations(pipelineId: number): Promise<SecurityRecommendation[]> {
    try {
      const pipeline = await storage.getPipeline(pipelineId);
      if (!pipeline) throw new Error('Pipeline not found');

      return [
        {
          type: 'configuration',
          severity: 'medium',
          description: 'Security scanning should be enabled for all pipelines',
          remediation: 'Enable security scanning in pipeline configuration'
        },
        {
          type: 'authentication',
          severity: 'high',
          description: 'Strong authentication methods should be enforced',
          remediation: 'Configure authentication requirements in security settings'
        }
      ];
    } catch (error) {
      console.error('Security recommendations error:', error);
      return [];
    }
  }

  async clearScan(scanId: number) {
    this.activeScans.delete(scanId);
  }
}

export const securityAgent = new SecurityAgent(); 