# ncompat

A CLI tool that scans a package.json file and checks each package's compatibility with a target Node.js version, recommending the highest supported version for each package.

## Installation

```bash
npm install
```

## Usage

```bash
# Check compatibility with Node.js 18.0.0 (default)
node bin/cli.js

# Check compatibility with a specific Node.js version
node bin/cli.js --node 16.0.0

# Check a specific package.json file
node bin/cli.js --file /path/to/package.json --node 18.0.0

# Verbose output showing Node.js support ranges
node bin/cli.js --verbose
```

## Options

- `-f, --file <path>`: Path to package.json file (default: ./package.json)
- `-n, --node <version>`: Target Node.js version (default: 18.0.0)
- `-v, --verbose`: Show detailed Node.js support information
- `--help`: Show help information

## Example Output

```
Checking compatibility for Node.js 18.0.0...

Compatibility Report:
==================================================
✓ express@^4.18.0
  → Node support: >=0.10.0
✗ some-old-package@^1.0.0
  → Recommended: 2.1.0
  → Node support: >=16.0.0
```

## How it works

1. Reads the specified package.json file
2. Extracts all dependencies and devDependencies
3. Queries the npm registry for each package's version information
4. Checks each version's `engines.node` field for Node.js compatibility
5. Recommends the highest version that supports the target Node.js version
