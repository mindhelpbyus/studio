#!/usr/bin/env tsx

/**
 * Clean Application Startup Script for Vivalé Healthcare CRM
 * Starts the application with minimal output and clear status
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function startApplication() {
  console.log('🏥 Starting Vivalé Healthcare CRM...\n');
  
  // Get the port from environment or use default
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = new URL(appUrl);
  const port = url.port || '3000';
  
  console.log(`📍 Application will be available at: ${appUrl}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Starting Next.js development server...\n`);
  
  // Start the Next.js development server
  const nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: port
    }
  });
  
  // Handle process events
  nextProcess.on('error', (error) => {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  });
  
  nextProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Application exited with code ${code}`);
      process.exit(code || 1);
    }
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down application...');
    nextProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down application...');
    nextProcess.kill('SIGTERM');
  });
}

// Start the application
startApplication().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});