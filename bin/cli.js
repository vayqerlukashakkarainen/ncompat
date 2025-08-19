#!/usr/bin/env node

const { checkPackageCompatibility } = require("../lib/checker");

function parseArgs() {
	const args = process.argv.slice(2);
	const options = {
		file: "./package.json",
		node: "18.0.0",
		verbose: false,
	};

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--file" || args[i] === "-f") {
			options.file = args[++i];
		} else if (args[i] === "--node" || args[i] === "-n") {
			options.node = args[++i];
		} else if (args[i] === "--verbose" || args[i] === "-v") {
			options.verbose = true;
		} else if (args[i] === "--help" || args[i] === "-h") {
			console.log(`
Usage: node bin/simple-cli.js [options]

Options:
  -f, --file <path>     Path to package.json file (default: ./package.json)
  -n, --node <version>  Target Node.js version (default: 18.0.0)
  -v, --verbose         Verbose output
  -h, --help           Show help
      `);
			process.exit(0);
		}
	}

	return options;
}

async function main() {
	try {
		const options = parseArgs();

		console.log(`Checking compatibility for Node.js ${options.node}...`);
		const results = await checkPackageCompatibility(
			options.file,
			options.node,
			options.verbose
		);

		if (results.length === 0) {
			console.log("No packages found or all packages are compatible!");
			return;
		}

		console.log("\nCompatibility Report:");
		console.log("=".repeat(70));

		results.forEach((result) => {
			if (result.error) {
				console.log(`✗ ${result.name}@${result.currentVersion}`);
				console.log(`  → Error: ${result.error}`);
				return;
			}

			const currentStatus = result.currentVersionCompatible ? "✓" : "✗";
			console.log(`${currentStatus} ${result.name}`);
			console.log(
				`  Current: ${result.currentInstalledVersion} (from range: ${result.currentVersionRange})`
			);

			if (result.latestSupportedVersion) {
				if (result.canUpgrade) {
					console.log(
						`  Latest supported: ${result.latestSupportedVersion} ⬆️`
					);
				} else {
					console.log(
						`  Latest supported: ${result.latestSupportedVersion} (up to date)`
					);
				}
			} else {
				console.log(`  Latest supported: No compatible version found`);
			}

			if (options.verbose) {
				if (result.currentVersionNodeSupport) {
					console.log(
						`  Current Node support: ${result.currentVersionNodeSupport}`
					);
				}
				if (result.latestVersionNodeSupport) {
					console.log(
						`  Latest Node support: ${result.latestVersionNodeSupport}`
					);
				}
			}

			console.log(""); // Empty line for readability
		});
	} catch (error) {
		console.error("Error:", error.message);
		process.exit(1);
	}
}

main();
