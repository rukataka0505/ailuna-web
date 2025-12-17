const { execSync } = require('child_process');

function runCommand(command) {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Failed to execute command: ${command}`);
        process.exit(1);
    }
}

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

console.log('Starting backup...');

try {
    // Generate code summary
    console.log('Generating code summary...');
    execSync('npm run summary', { stdio: 'inherit' });

    // Check for changes
    const status = execSync('git status --porcelain').toString();
    if (!status) {
        console.log('No changes to backup.');
        process.exit(0);
    }

    console.log('Adding files...');
    runCommand('git add .');

    const message = `backup: ${getFormattedDate()}`;
    console.log(`Committing with message: "${message}"...`);
    runCommand(`git commit -m "${message}"`);

    const branch = execSync('git branch --show-current').toString().trim();
    if (!branch) {
        console.error('Error: Could not determine current branch (detached HEAD?). Aborting push.');
        process.exit(1);
    }

    console.log(`Pushing to origin ${branch}...`);
    // Check if remote origin exists to be safe
    try {
        execSync('git remote get-url origin', { stdio: 'ignore' });
    } catch (e) {
        console.error('Error: Remote "origin" not found.');
        process.exit(1);
    }

    runCommand(`git push -u origin ${branch}`);

    console.log('Backup completed successfully!');
} catch (error) {
    console.error('An error occurred during backup:', error.message);
    process.exit(1);
}
