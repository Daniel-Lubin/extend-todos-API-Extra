const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// open sqlite database
const db = new sqlite3.Database('./todos.db', (err) => {
    if (err) {
      console.error("Failed to connect", err);
    } else {
      console.log("Connected to database");
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT,
    completed BOOLEAN DEFAULT 0,
    priority TEXT DEFAULT 'medium'
  )`);

// Question 1: Add a "Priority" Field to the To-Do API
// Sample data


// GET /todos - Retrieve all to-do items
app.get('/todos', (req, res) => {
  const { completed } = req.query;
  let query = "SELECT * FROM todos";

  if (completed !== undefined) {
    query += ` WHERE completed = ${completed === 'true' ? 1 : 0}`;
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

/* 
Q.3"
GET /todos - Retrieve all to-do items or filter by completed status.
after completing this part, you need to comment out the GET end point 
already implemented here to test this new GET endpoint! 
*/


// POST /todos - Add a new to-do item
app.post('/todos', (req, res) => {
    const { task, priority } = req.body;
    const sql = "INSERT INTO todos (task, priority) VALUES (?, ?)";
    const params = [task, priority || 'medium'];
  
    db.run(sql, params, function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID, task, priority: priority || 'medium', completed: false });
    });
  });

// PUT /todos/:id - Update an existing to-do item
app.put('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { task, completed, priority } = req.body;
  
    const sql = "UPDATE todos SET task = ?, completed = ?, priority = ? WHERE id = ?";
    const params = [task, completed, priority, id];
  
    db.run(sql, params, function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        return res.status(404).send("To-Do item not found");
      }
      res.json({ id, task, completed, priority });
    });
  });

/*
Question 2: Implement a "Complete All" Endpoint
example usage: 
curl -X PUT http://localhost:3000/todos/complete-all
*/
app.put('/todos/complete-all', (req, res) => {
    const sql = "UPDATE todos SET completed = 1";
    
    db.run(sql, function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "All items marked as completed" });
    });
  });


// DELETE /todos/:id - Delete a to-do item
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const sql = "DELETE FROM todos WHERE id = ?";
    
    db.run(sql, id, function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        return res.status(404).send("item not found");
      }
      res.status(204).send();
    });
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});