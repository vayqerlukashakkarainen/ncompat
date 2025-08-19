const fs = require("fs").promises;
const semver = require("./semver-simple");
const { fetchPackageInfo } = require("./npm-client");

async function readPackageJson(filePath) {
	try {
		const content = await fs.readFile(filePath, "utf8");
		return JSON.parse(content);
	} catch (error) {
		throw new Error(`Failed to read package.json: ${error.message}`);
	}
}

function extractPackages(packageJson) {
	const packages = {};

	if (packageJson.dependencies) {
		Object.assign(packages, packageJson.dependencies);
	}

	if (packageJson.devDependencies) {
		Object.assign(packages, packageJson.devDependencies);
	}

	return packages;
}

function parseNodeVersion(versionString) {
	const cleaned = versionString.replace(/^[^\d]*/, "");
	const coerced = semver.coerce(cleaned);
	return semver.valid(coerced) ? coerced : null;
}

async function checkPackageCompatibility(
	packageJsonPath,
	targetNodeVersion,
	verbose = false
) {
	const packageJson = await readPackageJson(packageJsonPath);
	const packages = extractPackages(packageJson);
	const results = [];

	const targetNode = parseNodeVersion(targetNodeVersion);
	if (!targetNode) {
		throw new Error(`Invalid Node.js version: ${targetNodeVersion}`);
	}

	for (const [packageName, versionRange] of Object.entries(packages)) {
		try {
			const packageInfo = await fetchPackageInfo(packageName);
			const result = await analyzePackageCompatibility(
				packageName,
				versionRange,
				targetNode,
				packageInfo,
				verbose
			);
			results.push(result);
		} catch (error) {
			results.push({
				name: packageName,
				currentVersion: versionRange,
				compatible: false,
				error: error.message,
			});
		}
	}

	return results;
}

function parseVersionRange(versionRange) {
	const cleaned = versionRange.replace(/^[^\d]*/, "");
	const coerced = semver.coerce(cleaned);
	return semver.valid(coerced) ? coerced : cleaned;
}

async function analyzePackageCompatibility(
	packageName,
	versionRange,
	targetNode,
	packageInfo,
	verbose
) {
	const currentInstalledVersion = parseVersionRange(versionRange);
	let latestSupportedVersion = null;
	let currentVersionCompatible = false;
	let latestVersionNodeSupport = null;
	let currentVersionNodeSupport = null;

	const versions = Object.keys(packageInfo.versions).sort(semver.rcompare);

	// Find the latest version that supports the target Node.js version
	for (const version of versions) {
		const versionInfo = packageInfo.versions[version];
		const engines = versionInfo.engines;

		if (engines && engines.node) {
			const nodeRangeRaw = engines.node;
			const nodeRanges = nodeRangeRaw.split("||");

			for (const nodeRange of nodeRanges) {
				if (semver.satisfies(targetNode, nodeRange.trim())) {
					if (!latestSupportedVersion) {
						latestSupportedVersion = version;
						latestVersionNodeSupport = nodeRange;
					}
				}

				// Check if current installed version is compatible
				if (version === currentInstalledVersion) {
					currentVersionCompatible = semver.satisfies(targetNode, nodeRange);
					currentVersionNodeSupport = nodeRange;
				}
			}
		}
	}

	// If no engine requirements found, assume latest version is compatible
	if (!latestSupportedVersion && versions.length > 0) {
		latestSupportedVersion = versions[0];
		currentVersionCompatible = true;
	}

	// If we couldn't find the exact current version, check if any version in range is compatible
	if (!currentVersionNodeSupport) {
		for (const version of versions) {
			if (semver.satisfies(version, versionRange)) {
				const versionInfo = packageInfo.versions[version];
				const engines = versionInfo.engines;
				if (engines && engines.node) {
					currentVersionCompatible = semver.satisfies(targetNode, engines.node);
					currentVersionNodeSupport = engines.node;
					break;
				} else {
					currentVersionCompatible = true;
					break;
				}
			}
		}
	}

	return {
		name: packageName,
		currentVersionRange: versionRange,
		currentInstalledVersion,
		currentVersionCompatible,
		latestSupportedVersion,
		canUpgrade:
			latestSupportedVersion &&
			latestSupportedVersion !== currentInstalledVersion,
		currentVersionNodeSupport: verbose ? currentVersionNodeSupport : undefined,
		latestVersionNodeSupport: verbose ? latestVersionNodeSupport : undefined,
	};
}

module.exports = {
	checkPackageCompatibility,
	readPackageJson,
	extractPackages,
};
