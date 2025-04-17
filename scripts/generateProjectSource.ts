/**
 * Script: generateProjectSource.ts
 * Description: Scans the project directory (excluding node_modules, dist,
 * coverage, generated, scripts folders, .git directory, and bun.lock file)
 * and concatenates the source code of all files into a single output file
 * in the generated folder. Adds a project header, table of contents, and
 * exclusions summary for better context when uploading to ChatGPT.
 * Usage: bun run scripts/generateProjectSource.ts
 */

import { promises as fs } from 'fs';
import path from 'path';

const rootDir = process.cwd();
const outputDir = path.join(rootDir, 'generated');
const outputFile = path.join(outputDir, 'project-source.txt');
// Directories to ignore
const ignoreDirs = new Set([
  'node_modules',
  'dist',
  'coverage',
  'generated',
  'scripts',
  '.git',
]);
// Files to ignore
const ignoreFiles = new Set(['bun.lock']);

/**
 * Read project metadata (name & version) from package.json
 */
async function getProjectMetadata() {
  try {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkgContent = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgContent);
    return {
      name: pkg.name || path.basename(rootDir),
      version: pkg.version || '0.0.0',
    };
  } catch {
    return {
      name: path.basename(rootDir),
      version: '0.0.0',
    };
  }
}

/**
 * Recursively collect files, skipping ignored dirs/files
 */
async function getFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(rootDir, fullPath);
    const parts = relPath.split(path.sep);

    if (entry.isDirectory() && ignoreDirs.has(entry.name)) continue;
    if (entry.isFile() && ignoreFiles.has(entry.name)) continue;
    if (parts.some((p) => ignoreDirs.has(p))) continue;

    if (entry.isDirectory()) {
      files = files.concat(await getFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main execution: generate the aggregated source file
 */
async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const { name: projectName, version: projectVersion } =
    await getProjectMetadata();
  const generatedAt = new Date().toISOString();

  // Collect and sort file list
  const files = (await getFiles(rootDir)).sort();

  // Build project header
  const projectHeader =
    `/**
` +
    ` * Project: ${projectName}
` +
    ` * Version: ${projectVersion}
` +
    ` * Generated At: ${generatedAt}
` +
    ` */

`;

  // Build table of contents
  const tocLines = files.map(
    (file, index) => ` * ${index + 1}. ${path.relative(rootDir, file)}`,
  );
  const tocHeader =
    `/**
 * Table of Contents
` +
    tocLines.join(`
`) +
    `
 */

`;

  // Build exclusions summary
  const exclusionDirs = Array.from(ignoreDirs).sort();
  const exclusionFiles = Array.from(ignoreFiles).sort();
  const exclusionsHeader =
    `/**
` +
    ` * Excluded Directories:
` +
    exclusionDirs.map((d) => ` *  - ${d}`).join(`
`) +
    `
` +
    ` * Excluded Files:
` +
    exclusionFiles.map((f) => ` *  - ${f}`).join(`
`) +
    `
` +
    ` */

`;

  // Initialize file with header, TOC, and exclusions
  await fs.writeFile(outputFile, projectHeader + tocHeader + exclusionsHeader);

  // Append each file with separators and metadata
  for (const filePath of files) {
    const relPath = path.relative(rootDir, filePath);
    const stats = await fs.stat(filePath);

    const separator = `// ===== Start File: ${relPath} =====
`;
    const fileHeader =
      `/**
` +
      ` * Path: ${relPath}
` +
      ` * Size: ${stats.size} bytes
` +
      ` * Last Modified: ${stats.mtime.toISOString()}
` +
      ` */

`;
    const content = await fs.readFile(filePath, 'utf-8');

    await fs.appendFile(
      outputFile,
      separator +
        fileHeader +
        content +
        `
// ===== End File: ${relPath} =====

`,
    );
  }

  console.log(`All source code written to ${outputFile}`);
}

main().catch((err) => {
  console.error('Error generating project source:', err);
  process.exit(1);
});
