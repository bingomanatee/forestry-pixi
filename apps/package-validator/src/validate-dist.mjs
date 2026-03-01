#!/usr/bin/env node

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../..');
const packagesRoot = path.join(repoRoot, 'packages');

const args = new Set(process.argv.slice(2));
const runtimeImport = args.has('--runtime-import');
const strictEsm = args.has('--strict-esm');
const failOnWarn = args.has('--fail-on-warn');
const verbose = args.has('--verbose');

const JS_EXTENSIONS = new Set(['.js', '.mjs', '.cjs']);
const NON_JS_EXTENSIONS = new Set(['.json', '.node']);
const ALLOWED_EAGER_EXTENSIONS = new Set([...JS_EXTENSIONS, ...NON_JS_EXTENSIONS]);

function existsFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function listCandidates(fromFile, specifier) {
  const fromDir = path.dirname(fromFile);
  const base = path.resolve(fromDir, specifier);
  const specExt = path.extname(specifier);

  if (specExt && ALLOWED_EAGER_EXTENSIONS.has(specExt)) {
    return [base];
  }

  return [
    base,
    `${base}.js`,
    `${base}.mjs`,
    `${base}.cjs`,
    `${base}.json`,
    path.join(base, 'index.js'),
    path.join(base, 'index.mjs'),
    path.join(base, 'index.cjs'),
  ];
}

function resolveRelativeImport(fromFile, specifier) {
  const candidates = listCandidates(fromFile, specifier);
  for (const candidate of candidates) {
    if (existsFile(candidate)) {
      return { resolved: candidate, candidates };
    }
  }
  return { resolved: null, candidates };
}

function extractSpecifiers(code) {
  const specifiers = [];
  const pattern =
    /\b(?:import|export)\b[\s\S]*?\bfrom\s*['"]([^'"]+)['"]|(?:^|[^\w$])import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/gm;

  for (const match of code.matchAll(pattern)) {
    const specifier = match[1] ?? match[2] ?? match[3];
    if (specifier) {
      specifiers.push(specifier);
    }
  }

  return specifiers;
}

async function validatePackage(pkgDir) {
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  const pkgText = await fsp.readFile(pkgJsonPath, 'utf8');
  const pkg = JSON.parse(pkgText);
  const pkgName = pkg.name ?? path.basename(pkgDir);
  const issues = [];
  const warnings = [];
  const graph = { filesVisited: 0, localImportsChecked: 0 };

  const mainPath = path.resolve(pkgDir, pkg.main ?? 'dist/index.js');
  if (!existsFile(mainPath)) {
    issues.push(`main entry not found: ${path.relative(repoRoot, mainPath)}`);
    return { pkgName, issues, warnings, graph };
  }

  if (pkg.types) {
    const typesPath = path.resolve(pkgDir, pkg.types);
    if (!existsFile(typesPath)) {
      issues.push(`types entry not found: ${path.relative(repoRoot, typesPath)}`);
    }
  }

  const queue = [mainPath];
  const seen = new Set();

  while (queue.length > 0) {
    const filePath = queue.shift();
    if (!filePath || seen.has(filePath)) {
      continue;
    }
    seen.add(filePath);
    graph.filesVisited += 1;

    let code;
    try {
      code = await fsp.readFile(filePath, 'utf8');
    } catch (error) {
      issues.push(`unable to read ${path.relative(repoRoot, filePath)}: ${error.message}`);
      continue;
    }

    const specifiers = extractSpecifiers(code);
    for (const specifier of specifiers) {
      if (!(specifier.startsWith('./') || specifier.startsWith('../'))) {
        continue;
      }

      graph.localImportsChecked += 1;

      if (strictEsm && !path.extname(specifier)) {
        warnings.push(
          `extensionless relative import in ${path.relative(
            repoRoot,
            filePath,
          )}: "${specifier}"`,
        );
      }

      const { resolved, candidates } = resolveRelativeImport(filePath, specifier);
      if (!resolved) {
        issues.push(
          [
            `unresolved import in ${path.relative(repoRoot, filePath)}: "${specifier}"`,
            `tried: ${candidates
              .map((candidate) => path.relative(repoRoot, candidate))
              .join(', ')}`,
          ].join(' | '),
        );
        continue;
      }

      const ext = path.extname(resolved);
      if (JS_EXTENSIONS.has(ext)) {
        queue.push(resolved);
      } else if (!ALLOWED_EAGER_EXTENSIONS.has(ext)) {
        warnings.push(
          `imported non-standard file extension in ${path.relative(
            repoRoot,
            filePath,
          )}: ${path.relative(repoRoot, resolved)}`,
        );
      }
    }
  }

  let runtimeError = null;
  if (runtimeImport) {
    try {
      await import(`${pathToFileURL(mainPath).href}?cachebust=${Date.now()}`);
    } catch (error) {
      runtimeError = error;
      issues.push(`runtime import failed: ${error.message}`);
    }
  }

  if (verbose && runtimeError) {
    warnings.push(runtimeError.stack ?? String(runtimeError));
  }

  return { pkgName, issues, warnings, graph };
}

async function run() {
  const dirents = await fsp.readdir(packagesRoot, { withFileTypes: true });
  const packageDirs = dirents
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packagesRoot, entry.name))
    .sort((a, b) => a.localeCompare(b));

  const results = [];
  for (const pkgDir of packageDirs) {
    const pkgJsonPath = path.join(pkgDir, 'package.json');
    if (!existsFile(pkgJsonPath)) {
      continue;
    }
    results.push(await validatePackage(pkgDir));
  }

  let failed = 0;
  let warned = 0;

  for (const result of results) {
    const hasIssues = result.issues.length > 0;
    const hasWarnings = result.warnings.length > 0;
    if (hasIssues) {
      failed += 1;
    }
    if (hasWarnings) {
      warned += 1;
    }

    const status = hasIssues ? 'FAIL' : hasWarnings ? 'WARN' : 'PASS';
    console.log(
      `[${status}] ${result.pkgName} (files: ${result.graph.filesVisited}, local imports: ${result.graph.localImportsChecked})`,
    );

    for (const issue of result.issues) {
      console.log(`  - ERROR: ${issue}`);
    }
    for (const warning of result.warnings) {
      console.log(`  - WARN: ${warning}`);
    }
  }

  console.log(
    `\nSummary: ${results.length - failed}/${results.length} passed, ${failed} failed, ${warned} with warnings.`,
  );

  if (failed > 0 || (failOnWarn && warned > 0)) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
