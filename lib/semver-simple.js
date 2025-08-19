function normalizeVersion(version) {
	const parts = version.split(".");
	while (parts.length < 3) {
		parts.push("0");
	}
	return parts.join(".");
}

function parseVersion(version) {
	var normalized = normalizeVersion(version);
	const match = normalized.match(/(\d+)\.(\d+)\.(\d+)/);
	if (!match) return null;
	return {
		major: parseInt(match[1]),
		minor: parseInt(match[2]),
		patch: parseInt(match[3]),
		original: normalized,
	};
}

function satisfies(version, range) {
	const v = parseVersion(version);
	if (!v) return false;

	if (range.startsWith(">=")) {
		const target = parseVersion(range.slice(2));
		if (!target) return false;
		return (
			v.major > target.major ||
			(v.major === target.major && v.minor > target.minor) ||
			(v.major === target.major &&
				v.minor === target.minor &&
				v.patch >= target.patch)
		);
	}

	if (range.startsWith("^")) {
		const target = parseVersion(range.slice(1));
		if (!target) return false;
		return (
			v.major === target.major &&
			(v.minor > target.minor ||
				(v.minor === target.minor && v.patch >= target.patch))
		);
	}

	return version === range;
}

function valid(version) {
	return parseVersion(version) !== null;
}

function coerce(version) {
	const match = version.match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
	if (!match) return null;
	return `${match[1]}.${match[2] || "0"}.${match[3] || "0"}`;
}

function rcompare(a, b) {
	const va = parseVersion(a);
	const vb = parseVersion(b);
	if (!va || !vb) return 0;

	if (va.major !== vb.major) return vb.major - va.major;
	if (va.minor !== vb.minor) return vb.minor - va.minor;
	return vb.patch - va.patch;
}

module.exports = {
	satisfies,
	valid,
	coerce,
	rcompare,
};
