const https = require('https');

const NPM_REGISTRY_URL = 'https://registry.npmjs.org';

function fetchPackageInfo(packageName) {
  return new Promise((resolve, reject) => {
    const url = `${NPM_REGISTRY_URL}/${encodeURIComponent(packageName)}`;
    
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          if (response.statusCode === 200) {
            const packageInfo = JSON.parse(data);
            resolve(packageInfo);
          } else if (response.statusCode === 404) {
            reject(new Error(`Package '${packageName}' not found in npm registry`));
          } else {
            reject(new Error(`HTTP ${response.statusCode}: Failed to fetch package info`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse package info: ${error.message}`));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(new Error(`Network error: ${error.message}`));
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

module.exports = {
  fetchPackageInfo
};