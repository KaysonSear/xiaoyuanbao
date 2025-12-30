#!/usr/bin/env node

/**
 * Campus Treasure - Final Project Verification Script
 *
 * This script performs comprehensive verification of the completed project:
 * 1. TypeScript compilation
 * 2. Code linting
 * 3. Package.json validation
 * 4. Feature completeness check
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message) {
  process.stdout.write(message + '\n');
}

function logError(message) {
  process.stderr.write(message + '\n');
}

log('🎓 Campus Treasure - Final Project Verification');
log('='.repeat(50));

const tests = [
  {
    name: 'TypeScript Compilation',
    test: () => {
      log('🔍 Checking TypeScript compilation...');
      execSync('pnpm run type-check', { stdio: 'pipe' });
      log('✅ TypeScript compilation passed');
    },
  },
  {
    name: 'Code Linting',
    test: () => {
      log('🔍 Checking code linting...');
      execSync('pnpm run lint', { stdio: 'pipe' });
      log('✅ Code linting passed');
    },
  },
  {
    name: 'Backend Build',
    test: () => {
      log('🔍 Checking backend build...');
      execSync('cd apps/backend && npm run build', { stdio: 'pipe' });
      log('✅ Backend build passed');
    },
  },
  {
    name: 'Feature Completeness',
    test: () => {
      log('🔍 Checking feature completeness...');
      const featuresPath = path.join(__dirname, '../.agent/features.json');
      const features = JSON.parse(fs.readFileSync(featuresPath, 'utf8'));

      const totalFeatures = features.statistics.totalFeatures;
      const completedFeatures = features.statistics.completedFeatures;

      if (completedFeatures !== totalFeatures) {
        throw new Error(`Feature mismatch: ${completedFeatures}/${totalFeatures} completed`);
      }

      log(`✅ All ${totalFeatures} features completed`);
    },
  },
  {
    name: 'Package.json Validation',
    test: () => {
      log('🔍 Checking package.json files...');

      const packages = [
        'package.json',
        'apps/mobile/package.json',
        'apps/backend/package.json',
        'packages/shared-types/package.json',
        'packages/shared-utils/package.json',
      ];

      for (const pkgPath of packages) {
        const fullPath = path.join(__dirname, '../', pkgPath);
        if (!fs.existsSync(fullPath)) {
          throw new Error(`Missing package.json: ${pkgPath}`);
        }

        const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        if (!pkg.name || !pkg.version) {
          throw new Error(`Invalid package.json: ${pkgPath}`);
        }
      }

      log('✅ All package.json files valid');
    },
  },
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  try {
    test.test();
    passed++;
  } catch (error) {
    logError(`❌ ${test.name} failed: ${error.message}`);
    failed++;
  }
}

log('\n' + '='.repeat(50));
log(`📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  log('🎉 All verification tests passed!');
  log('🚀 Campus Treasure is ready for deployment!');
} else {
  logError('⚠️  Some tests failed. Please fix issues before deployment.');
  process.exit(1);
}
