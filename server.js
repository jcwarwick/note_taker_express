const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // Serving static files from the 'public' directory

app.use(express.json());

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// API Routes
app.get('/api/notes', (req, res) => {
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Error reading file' });
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/notes', (req, res) => {
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Error reading file' });
    }

    const notes = JSON.parse(data);
    const newNote = req.body;
    newNote.id = Math.random().toString(36).substring(2); // Generate a unique ID
    notes.push(newNote);

    fs.writeFile('db/db.json', JSON.stringify(notes), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ error: 'Error writing file' });
      }
      res.json(newNote);
    });
  });
});

app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Error reading file' });
    }

    const notes = JSON.parse(data);
    const noteIndex = notes.findIndex((note) => note.id === noteId);

    if (noteIndex !== -1) {
      notes.splice(noteIndex, 1);

      fs.writeFile('db/db.json', JSON.stringify(notes), (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return res.status(500).json({ error: 'Error writing file' });
        }
        res.json({ message: 'Note deleted successfully' });
      });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  });
});

// Fetch and display existing notes
app.get('/notes-data', (req, res) => {
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Error reading file' });
    }

    const notes = JSON.parse(data);
    res.send(notes);
  });
});

// Serving notes.html with embedded JavaScript for frontend functionality
app.get('/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'public/notes.html'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Something went wrong!');
    }

    res.send(data);
  });
});

app.listen(PORT, () => {
  console.log(`App is listening on PORT ${PORT}`);
});