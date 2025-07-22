import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import markdownpdf from 'markdown-pdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input and output paths
const inputPath = path.join(__dirname, 'docs', 'project-documentation.md');
const outputPath = path.join(__dirname, 'docs', 'livestock-management-documentation.pdf');

// Ensure docs directory exists
if (!fs.existsSync(path.join(__dirname, 'docs'))) {
  fs.mkdirSync(path.join(__dirname, 'docs'));
}

// Convert markdown to PDF
markdownpdf()
  .from(inputPath)
  .to(outputPath, function () {
    console.log(`PDF created at: ${outputPath}`);
  });