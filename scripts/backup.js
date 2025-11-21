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

    console.log('Pushing to origin main...');
    runCommand('git push origin main');

    console.log('Backup completed successfully!');
} catch (error) {
    console.error('An error occurred during backup:', error.message);
    process.exit(1);
}
