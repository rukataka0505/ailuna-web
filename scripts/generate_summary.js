const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..'); // web directory
const projectRoot = path.resolve(rootDir, '..'); // AiLuna-1.0 directory
const srcDir = path.join(rootDir, 'src');
const outputFile = path.join(rootDir, 'project_code_summary.txt');

const targetExtensions = ['.ts', '.tsx', '.css', '.sql'];
const excludeDirs = ['node_modules', '.next', 'dist'];

// Specific files to include from root/web root
const specificFiles = [
    path.join(rootDir, 'package.json'),
    path.join(rootDir, 'tsconfig.json'),
    path.join(rootDir, 'README.md'),
    path.join(projectRoot, '.cursorrules')
];

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!excludeDirs.includes(file)) {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            const ext = path.extname(file);
            if (targetExtensions.includes(ext)) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

function generateSummary() {
    console.log('Generating code summary...');

    // Get all src files
    let files = getAllFiles(srcDir);

    // Add specific files if they exist
    specificFiles.forEach(file => {
        if (fs.existsSync(file)) {
            files.push(file);
        } else {
            console.warn(`Warning: File not found: ${file}`);
        }
    });

    let content = '';

    files.forEach(file => {
        // Calculate relative path from project root for display
        const relativePath = path.relative(projectRoot, file).replace(/\\/g, '/');
        const fileContent = fs.readFileSync(file, 'utf8');

        content += '---\n';
        content += `File: ${relativePath}\n`;
        content += fileContent + '\n';
        content += '---\n';
    });

    fs.writeFileSync(outputFile, content);
    console.log(`Summary generated at: ${outputFile}`);
}

generateSummary();
