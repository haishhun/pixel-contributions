import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { fetchContributions } from "./fetchContributions.js";
import { renderSvg } from "./renderSvg.js";
function getInput(name, required = false) {
    const val = process.env[`INPUT_${name.toUpperCase().replace(/-/g, "_")}`] ?? "";
    if (required && !val) {
        console.error(`❌ Missing required input: ${name}`);
        process.exit(1);
    }
    return val;
}
function parseBool(val, defaultVal = true) {
    if (!val)
        return defaultVal;
    return val.toLowerCase() !== "false";
}
async function main() {
    const username = getInput("github_user_name", true);
    const token = process.env.GITHUB_TOKEN ?? getInput("token", true);
    const outputPath = getInput("output_path") || "dist/pixel-contributions.svg";
    const colorScheme = (getInput("color_scheme") || "github-dark");
    const showTotal = parseBool(getInput("show_total"));
    const showMonths = parseBool(getInput("show_months"));
    const showDays = parseBool(getInput("show_days"));
    const compress = parseBool(getInput("compress"), false);
    const quote = getInput("quote") || undefined;
    console.log(`📊 Fetching contributions for: ${username}`);
    const data = await fetchContributions(username, token);
    console.log(`✅ Got ${data.totalContributions} contributions across ${data.weeks.length} weeks`);
    console.log(`🎨 Rendering SVG with scheme: ${colorScheme}`);
    const svg = renderSvg(data, {
        colorScheme,
        showTotal,
        showMonths,
        showDays,
        compress,
        quote,
    });
    // Support multiple outputs (newline-separated like snk)
    const outputs = outputPath.split("\n").map((s) => s.trim()).filter(Boolean);
    for (const out of outputs) {
        // Parse query string options e.g. dist/dark.svg?color_scheme=dracula
        const [filePath, qs] = out.split("?");
        const params = new URLSearchParams(qs ?? "");
        const schemeOverride = (params.get("color_scheme") ?? colorScheme);
        const compressOverride = params.has("compress") ? params.get("compress") !== "false" : compress;
        const finalSvg = (schemeOverride !== colorScheme || compressOverride !== compress)
            ? renderSvg(data, { colorScheme: schemeOverride, showTotal, showMonths, showDays, compress: compressOverride, quote })
            : svg;
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, finalSvg, "utf-8");
        console.log(`💾 Saved: ${filePath}`);
    }
}
main().catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
});
