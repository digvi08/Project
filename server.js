const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const Result = require('./models/Result');

const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/fruit-quality', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Middleware for serving static files
app.use(express.static('public'));
app.use(express.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Serve static files (images)
app.use('/images', express.static(path.join(__dirname, 'fruit dataset (2)/images')));

app.post('/upload', upload.single('fruitImage'), (req, res) => {
    const fruitType = req.body.fruitType;
    const imagePath = req.file.path;

    // Execute Python script for image processing
    exec(`python process_image.py "${imagePath}" "${fruitType}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            return res.status(500).json({ error: `Image processing failed: ${error.message}` });
        }
        if (stderr) {
            console.error(`Python script stderr: ${stderr}`);
        }

        try {
            const result = JSON.parse(stdout);  // Parse the result from the Python script

            if (result.error) {
                return res.status(400).json({ error: result.error });
            }

            // Return result to frontend with static image path
            res.json({
                matchedImage: `/images/${fruitType} fruit/${path.basename(result.matchedImage)}`,
                similarity: result.similarity
            });
        } catch (parseError) {
            console.error(`Error parsing Python output: ${parseError.message}`);
            res.status(500).json({ error: 'Failed to process image. Invalid output from Python script.' });
        }
    });
});


// Route to get all analysis history
app.get('/history', (req, res) => {
    Result.find().sort({ createdAt: -1 })
        .then(results => res.json(results))
        .catch(err => res.status(500).json({ error: 'Failed to retrieve history' }));
});





// Result Schema
const resultSchema = new mongoose.Schema({
    fruitType: String,
    uploadedImage: String,
    matchedImage: String,
    similarity: Number,
    date: { type: Date, default: Date.now }
});



app.post('/upload', upload.single('fruitImage'), (req, res) => {
    const fruitType = req.body.fruitType;
    const imagePath = req.file.path;

    exec(`python process_image.py "${imagePath}" "${fruitType}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            return res.status(500).json({ error: `Image processing failed: ${error.message}` });
        }

        try {
            const result = JSON.parse(stdout);

            if (result.error) {
                return res.status(400).json({ error: result.error });
            }

            const newResult = new Result({
                fruitType: fruitType,
                uploadedImage: imagePath,
                matchedImage: result.matchedImage,
                similarity: result.similarity
            });

            newResult.save()
                .then(savedResult => res.json({
                    matchedImage: `/images/${fruitType} fruit/${path.basename(savedResult.matchedImage)}`,
                    similarity: result.similarity
                }))
                .catch(err => res.status(500).json({ error: 'Failed to save result to database' }));
        } catch (parseError) {
            console.error(`Error parsing Python output: ${parseError.message}`);
            res.status(500).json({ error: 'Failed to process image. Invalid output from Python script.' });
        }
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
