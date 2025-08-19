const { readPackageJson, extractPackages } = require('./lib/checker');

async function test() {
  try {
    console.log('Testing package.json reader...');
    const pkg = await readPackageJson('./test-package.json');
    console.log('✓ Successfully read package.json');
    
    const packages = extractPackages(pkg);
    console.log('✓ Extracted packages:', Object.keys(packages));
    
    console.log('\nPackages found:');
    Object.entries(packages).forEach(([name, version]) => {
      console.log(`  ${name}: ${version}`);
    });
    
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

test();