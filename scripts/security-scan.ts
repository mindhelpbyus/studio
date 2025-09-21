#!/usr/bin/env tsx
/**
 * Security Scan Script
 * Performs comprehensive security scanning of the codebase
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
}

class SecurityScanner {
  private issues: SecurityIssue[] = [];

  async runAllScans(): Promise<void> {
    console.log('🔒 Running comprehensive security scans...\n');

    await Promise.all([
      this.scanDependencies(),
      this.scanSecrets(),
      this.scanCodePatterns(),
      this.scanConfiguration(),
      this.scanDockerfile(),
    ]);

    this.printResults();
    this.exitWithStatus();
  }

  private async scanDependencies(): Promise<void> {
    console.log('📦 Scanning dependencies for vulnerabilities...');
    
    try {
      // Run npm audit
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities) {
        for (const [name, vuln] of Object.entries(audit.vulnerabilities as any)) {
          const severity = this.mapAuditSeverity((vuln as any).severity);
          
          this.issues.push({
            severity,
            type: 'dependency_vulnerability',
            description: `Vulnerable dependency: ${name} - ${(vuln as any).title}`,
            recommendation: `Update to version ${(vuln as any).fixAvailable || 'latest'}`,
          });
        }
      }
    } catch (error) {
      console.warn('Failed to run npm audit:', error);
    }
  }

  private async scanSecrets(): Promise<void> {
    console.log('🔑 Scanning for exposed secrets...');
    
    const secretPatterns = [
      { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
      { name: 'AWS Secret Key', pattern: /[0-9a-zA-Z/+]{40}/ },
      { name: 'GitHub Token', pattern: /ghp_[0-9a-zA-Z]{36}/ },
      { name: 'JWT Token', pattern: /eyJ[0-9a-zA-Z_-]*\.eyJ[0-9a-zA-Z_-]*\.[0-9a-zA-Z_-]*/ },
      { name: 'Private Key', pattern: /-----BEGIN (RSA )?PRIVATE KEY-----/ },
      { name: 'API Key', pattern: /api[_-]?key['"\\s]*[:=]['"\\s]*[0-9a-zA-Z]{20,}/ },
      { name: 'Password', pattern: /password['"\\s]*[:=]['"\\s]*[^\\s'"]{8,}/ },
    ];

    const filesToScan = this.getSourceFiles();
    
    for (const file of filesToScan) {
      try {
        const content = readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          for (const pattern of secretPatterns) {
            if (pattern.pattern.test(line)) {
              this.issues.push({
                severity: 'critical',
                type: 'exposed_secret',
                description: `Potential ${pattern.name} found in source code`,
                file,
                line: i + 1,
                recommendation: 'Move secrets to environment variables or secure vault',
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to scan file ${file}:`, error);
      }
    }
  }

  private async scanCodePatterns(): Promise<void> {
    console.log('🔍 Scanning for insecure code patterns...');
    
    const insecurePatterns = [
      {
        name: 'SQL Injection Risk',
        pattern: /query\s*\(\s*['"]\s*SELECT.*\+/,
        severity: 'high' as const,
        recommendation: 'Use parameterized queries or prepared statements',
      },
      {
        name: 'Command Injection Risk',
        pattern: /exec\s*\(\s*.*\+/,
        severity: 'high' as const,
        recommendation: 'Validate and sanitize user input before executing commands',
      },
      {
        name: 'Hardcoded Credentials',
        pattern: /(password|secret|key)\s*=\s*['"][^'"]+['"]/i,
        severity: 'critical' as const,
        recommendation: 'Use environment variables or secure configuration',
      },
      {
        name: 'Insecure Random',
        pattern: /Math\.random\(\)/,
        severity: 'medium' as const,
        recommendation: 'Use crypto.randomBytes() for security-sensitive operations',
      },
      {
        name: 'Eval Usage',
        pattern: /eval\s*\(/,
        severity: 'high' as const,
        recommendation: 'Avoid eval() - use safer alternatives like JSON.parse()',
      },
    ];

    const filesToScan = this.getSourceFiles();
    
    for (const file of filesToScan) {
      try {
        const content = readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          for (const pattern of insecurePatterns) {
            if (pattern.pattern.test(line)) {
              this.issues.push({
                severity: pattern.severity,
                type: 'insecure_code',
                description: `${pattern.name} detected`,
                file,
                line: i + 1,
                recommendation: pattern.recommendation,
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to scan file ${file}:`, error);
      }
    }
  }

  private async scanConfiguration(): Promise<void> {
    console.log('⚙️  Scanning configuration files...');
    
    const configFiles = [
      'next.config.js',
      'next.config.mjs',
      '.env',
      '.env.local',
      '.env.production',
      'docker-compose.yml',
      'package.json',
    ];

    for (const configFile of configFiles) {
      if (existsSync(configFile)) {
        try {
          const content = readFileSync(configFile, 'utf8');
          
          // Check for insecure configurations
          if (configFile.includes('.env')) {
            this.scanEnvFile(content, configFile);
          } else if (configFile === 'package.json') {
            this.scanPackageJson(content);
          } else if (configFile.includes('next.config')) {
            this.scanNextConfig(content, configFile);
          }
        } catch (error) {
          console.warn(`Failed to scan config file ${configFile}:`, error);
        }
      }
    }
  }

  private scanEnvFile(content: string, file: string): void {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        
        if (value && !value.startsWith('$') && value.length > 10) {
          // Potential hardcoded secret
          this.issues.push({
            severity: 'medium',
            type: 'configuration_issue',
            description: `Potential hardcoded value in environment file: ${key}`,
            file,
            line: i + 1,
            recommendation: 'Consider using secret management or placeholder values',
          });
        }
      }
    }
  }

  private scanPackageJson(content: string): void {
    try {
      const pkg = JSON.parse(content);
      
      // Check for scripts that might be insecure
      if (pkg.scripts) {
        for (const [name, script] of Object.entries(pkg.scripts)) {
          if (typeof script === 'string' && script.includes('curl') && script.includes('bash')) {
            this.issues.push({
              severity: 'high',
              type: 'configuration_issue',
              description: `Potentially insecure script: ${name}`,
              file: 'package.json',
              recommendation: 'Avoid piping curl output directly to bash',
            });
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse package.json:', error);
    }
  }

  private scanNextConfig(content: string, file: string): void {
    // Check for insecure Next.js configurations
    if (content.includes('dangerouslyAllowBrowser: true')) {
      this.issues.push({
        severity: 'high',
        type: 'configuration_issue',
        description: 'Dangerous browser configuration enabled',
        file,
        recommendation: 'Remove dangerouslyAllowBrowser or ensure it\'s only for development',
      });
    }
    
    if (content.includes('experimental: { esmExternals: false }')) {
      this.issues.push({
        severity: 'medium',
        type: 'configuration_issue',
        description: 'ESM externals disabled - potential security risk',
        file,
        recommendation: 'Enable ESM externals for better security',
      });
    }
  }

  private async scanDockerfile(): Promise<void> {
    console.log('🐳 Scanning Dockerfile...');
    
    if (existsSync('Dockerfile')) {
      try {
        const content = readFileSync('Dockerfile', 'utf8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.startsWith('USER root')) {
            this.issues.push({
              severity: 'high',
              type: 'docker_security',
              description: 'Running as root user in Docker',
              file: 'Dockerfile',
              line: i + 1,
              recommendation: 'Create and use a non-root user',
            });
          }
          
          if (line.includes('--no-check-certificate')) {
            this.issues.push({
              severity: 'high',
              type: 'docker_security',
              description: 'Certificate verification disabled',
              file: 'Dockerfile',
              line: i + 1,
              recommendation: 'Remove --no-check-certificate flag',
            });
          }
          
          if (line.startsWith('ADD http')) {
            this.issues.push({
              severity: 'medium',
              type: 'docker_security',
              description: 'Using ADD with HTTP URL',
              file: 'Dockerfile',
              line: i + 1,
              recommendation: 'Use COPY with local files or RUN with curl/wget',
            });
          }
        }
      } catch (error) {
        console.warn('Failed to scan Dockerfile:', error);
      }
    }
  }

  private getSourceFiles(): string[] {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const files: string[] = [];
    
    const scanDir = (dir: string) => {
      try {
        const fs = require('fs');
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scanDir(fullPath);
          } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Ignore errors for inaccessible directories
      }
    };
    
    scanDir('src');
    scanDir('scripts');
    
    return files;
  }

  private mapAuditSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'moderate':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  }

  private printResults(): void {
    console.log('\n🔒 Security Scan Results');
    console.log('='.repeat(50));
    
    if (this.issues.length === 0) {
      console.log('✅ No security issues found!');
      return;
    }
    
    const groupedIssues = this.groupIssuesBySeverity();
    
    for (const severity of ['critical', 'high', 'medium', 'low'] as const) {
      const issues = groupedIssues[severity];
      if (issues.length > 0) {
        console.log(`\n${this.getSeverityIcon(severity)} ${severity.toUpperCase()} (${issues.length})`);
        console.log('-'.repeat(30));
        
        for (const issue of issues) {
          console.log(`• ${issue.description}`);
          if (issue.file) {
            console.log(`  File: ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
          }
          console.log(`  Recommendation: ${issue.recommendation}`);
          console.log('');
        }
      }
    }
    
    const summary = this.getSummary();
    console.log('Summary:');
    console.log(`🔴 Critical: ${summary.critical}`);
    console.log(`🟠 High: ${summary.high}`);
    console.log(`🟡 Medium: ${summary.medium}`);
    console.log(`🟢 Low: ${summary.low}`);
    console.log('');
  }

  private groupIssuesBySeverity() {
    return {
      critical: this.issues.filter(i => i.severity === 'critical'),
      high: this.issues.filter(i => i.severity === 'high'),
      medium: this.issues.filter(i => i.severity === 'medium'),
      low: this.issues.filter(i => i.severity === 'low'),
    };
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '❓';
    }
  }

  private getSummary() {
    return {
      critical: this.issues.filter(i => i.severity === 'critical').length,
      high: this.issues.filter(i => i.severity === 'high').length,
      medium: this.issues.filter(i => i.severity === 'medium').length,
      low: this.issues.filter(i => i.severity === 'low').length,
    };
  }

  private exitWithStatus(): void {
    const summary = this.getSummary();
    
    if (summary.critical > 0) {
      console.log('🚨 Security scan failed - critical issues found');
      process.exit(1);
    } else if (summary.high > 0) {
      console.log('⚠️  Security scan completed with high-severity issues');
      process.exit(1);
    } else if (summary.medium > 0) {
      console.log('⚠️  Security scan completed with medium-severity issues');
      process.exit(0);
    } else {
      console.log('✅ Security scan passed');
      process.exit(0);
    }
  }
}

// Run security scan if called directly
if (require.main === module) {
  const scanner = new SecurityScanner();
  scanner.runAllScans().catch(error => {
    console.error('Security scan failed:', error);
    process.exit(1);
  });
}

export { SecurityScanner };