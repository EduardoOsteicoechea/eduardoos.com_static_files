import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const outputCandidates = [
  path.join(projectRoot, ".svelte-kit", "output", "prerendered", "pages"),
  path.join(projectRoot, "build"),
  path.join(projectRoot, ".svelte-kit", "output", "client")
];

const jsonLdScriptRegex =
  /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

async function pathExists(targetPath) {
  try {
    const stat = await fs.stat(targetPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function collectHtmlFiles(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const htmlFiles = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      htmlFiles.push(...(await collectHtmlFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      htmlFiles.push(fullPath);
    }
  }

  return htmlFiles;
}

async function detectOutputDirectory() {
  for (const candidate of outputCandidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

function parseJsonLdBlocks(fileContent) {
  const blocks = [];
  let match;
  while ((match = jsonLdScriptRegex.exec(fileContent)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

async function main() {
  const outputDirectory = await detectOutputDirectory();

  if (!outputDirectory) {
    console.error("JSON-LD validation failed: no SvelteKit output directory found.");
    console.error(
      `Checked: ${outputCandidates
        .map((candidatePath) => path.relative(projectRoot, candidatePath))
        .join(", ")}`
    );
    process.exit(1);
  }

  const htmlFiles = await collectHtmlFiles(outputDirectory);
  let invalidCount = 0;
  let checkedBlocks = 0;

  for (const filePath of htmlFiles) {
    const html = await fs.readFile(filePath, "utf8");
    const blocks = parseJsonLdBlocks(html);

    for (const [blockIndex, blockContent] of blocks.entries()) {
      checkedBlocks += 1;
      try {
        JSON.parse(blockContent);
      } catch (error) {
        invalidCount += 1;
        const relativeFilePath = path.relative(projectRoot, filePath);
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `Invalid JSON-LD in ${relativeFilePath} (script #${blockIndex + 1}): ${message}`
        );
      }
    }
  }

  if (invalidCount > 0) {
    console.error(`JSON-LD validation failed with ${invalidCount} invalid block(s).`);
    process.exit(1);
  }

  console.log(
    `JSON-LD validation passed: ${checkedBlocks} block(s) checked across ${htmlFiles.length} HTML file(s).`
  );
}

await main();
