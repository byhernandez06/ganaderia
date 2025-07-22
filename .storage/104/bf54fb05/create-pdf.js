const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');

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