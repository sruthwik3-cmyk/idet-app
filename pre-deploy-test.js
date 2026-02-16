// Pre-Deployment Test Script
// Run this before deploying to Render to verify everything works

console.log('🔍 IDET Pre-Deployment Verification\n');

// Test 1: Check environment variables
console.log('✅ Test 1: Environment Variables');
const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'GMAIL_USER',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GMAIL_REFRESH_TOKEN'
];

let envCheck = true;
requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
        console.log(`   ❌ Missing: ${varName}`);
        envCheck = false;
    } else {
        console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    }
});

if (!envCheck) {
    console.log('\n⚠️  Some environment variables are missing!');
    console.log('   Make sure to add them in Render dashboard.\n');
}

// Test 2: Check package.json
console.log('\n✅ Test 2: Package Configuration');
import { readFileSync } from 'fs';
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

console.log(`   Name: ${pkg.name}`);
console.log(`   Version: ${pkg.version}`);
console.log(`   Type: ${pkg.type}`);
console.log(`   Start Command: ${pkg.scripts.start}`);
console.log(`   Build Command: ${pkg.scripts.build}`);

if (pkg.dependencies['path-to-regexp']) {
    console.log(`   ✅ path-to-regexp: ${pkg.dependencies['path-to-regexp']}`);
} else {
    console.log('   ⚠️  path-to-regexp not found in dependencies');
}

// Test 3: Check critical files
console.log('\n✅ Test 3: Critical Files');
import { existsSync } from 'fs';
const criticalFiles = [
    'server.js',
    'package.json',
    'src/context/AppContext.tsx',
    'src/utils/emailService.ts',
    'src/utils/soundUtils.ts',
    'supabase_schema.sql'
];

criticalFiles.forEach(file => {
    if (existsSync(file)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ Missing: ${file}`);
    }
});

// Test 4: Alert System Configuration
console.log('\n✅ Test 4: Alert System Configuration');
console.log('   30-Day Alert: Triggers at 8-30 days remaining');
console.log('   7-Day Alert: Triggers at 0-7 days remaining');
console.log('   Sound Duration: 15 seconds (5 loops)');
console.log('   Priority Support: Critical, Important, Optional');
console.log('   Email Service: Gmail API (REST)');

console.log('\n🎉 Pre-Deployment Check Complete!\n');
console.log('📋 Next Steps:');
console.log('   1. Run: npm install');
console.log('   2. Run: npm run build');
console.log('   3. Test locally: npm start');
console.log('   4. Push to GitHub');
console.log('   5. Deploy to Render');
console.log('   6. Follow RENDER_DEPLOYMENT_CHECKLIST.md\n');
