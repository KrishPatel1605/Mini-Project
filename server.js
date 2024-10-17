const express = require('express');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Load data based on branch and division
app.get('/data', (req, res) => {
    const branch = req.query.branch;
    const division = req.query.division;

    if (!branch || !division) {
        res.status(400).send('Branch and division are required.');
        return;
    }

    const filePath = path.join(__dirname, 'public', 'uploads', `${branch}_${division}.xlsx`);

    if (fs.existsSync(filePath)) {
        const workbook = XLSX.readFile(filePath);
        const worksheet = workbook.Sheets['Sheet1'];

        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        res.json(jsonData);  // Return the existing data as JSON
    } else {
        res.json([]);  // If file doesn't exist, return an empty array
    }
});

// Save data to the file based on branch and division
app.post('/save', (req, res) => {
    const { branch, division, students } = req.body;

    if (!branch || !division || !students) {
        res.status(400).send('Branch, division, and students are required.');
        return;
    }

    const filePath = path.join(__dirname, 'public', 'uploads', `${branch}_${division}.xlsx`);
    let workbook;

    if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
    } else {
        workbook = XLSX.utils.book_new();
    }

    if (workbook.Sheets['Sheet1']) {
        delete workbook.Sheets['Sheet1'];
        const sheetIndex = workbook.SheetNames.indexOf('Sheet1');
        if (sheetIndex > -1) {
            workbook.SheetNames.splice(sheetIndex, 1);
        }
    }

    const ws = XLSX.utils.json_to_sheet(students);
    XLSX.utils.book_append_sheet(workbook, ws, 'Sheet1');
    XLSX.writeFile(workbook, filePath);

    res.send('File saved successfully');
});

// Download route for Excel file
app.get('/download', (req, res) => {
    const branch = req.query.branch;
    const division = req.query.division;

    if (!branch || !division) {
        res.status(400).send('Branch and division are required.');
        return;
    }

    const filePath = path.join(__dirname, 'public', 'uploads', `${branch}_${division}.xlsx`);

    if (fs.existsSync(filePath)) {
        res.download(filePath, `${branch}_${division}.xlsx`, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('Error downloading the file.');
            }
        });
    } else {
        res.status(404).send('File not found');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
