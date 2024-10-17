const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

// Source and destination directories
const sourceDir = path.join(__dirname, 'uploads');
const destinationDir = path.join(__dirname, 'public', 'uploads');

// Function to copy files from source to destination
function copyFileToPublic(filePath) {
    const fileName = path.basename(filePath);
    const destinationPath = path.join(destinationDir, fileName);

    fs.copyFile(filePath, destinationPath, (err) => {
        if (err) {
            console.error(`Failed to copy ${fileName}:`, err);
        } else {
            console.log(`File ${fileName} successfully copied to public/uploads.`);
        }
    });
}

// Initialize chokidar watcher to watch the source directory for changes
const watcher = chokidar.watch(sourceDir, {
    persistent: true,
    ignoreInitial: false, // Process existing files at startup
    awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
    }
});

// Watch for added or changed files
watcher
    .on('add', filePath => {
        console.log(`File added: ${filePath}`);
        copyFileToPublic(filePath);
    })
    .on('change', filePath => {
        console.log(`File changed: ${filePath}`);
        copyFileToPublic(filePath);
    })
    .on('error', error => console.error(`Watcher error: ${error}`));

// Make sure the destination directory exists
if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
}

console.log(`Watching for changes in the ${sourceDir} directory...`);
