const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// setup database
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("TODOs.db", (err) => {
  if (err) {
    return console.error("Error opening database:", err.message);
  }
  console.log("Connected to the TODOs database.");
});

// create a table
db.run(
  `
  CREATE TABLE IF NOT EXISTS TODOs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    priority TEXT DEFAULT 'low',
    is_complete BOOLEAN DEFAULT 0,
    is_fun BOOLEAN DEFAULT 1
  )
`,
  (err) => {
    if (err) {
      return console.error("Error creating table:", err.message);
    }
    console.log("TODOs table created (if it didn't already exist).");
  }
);

// server.js
// A simple Express.js backend for a Todo list API

// Middleware to parse JSON requests
app.use(express.json());

// Middle ware to inlcude static content
app.use(express.static("public"));

// server index.html
app.get("/", (req, res) => {
  res.sendFile("index.html");
});

// GET all todo items
app.get("/todos", (req, res) => {
  console.log("hello");
  db.all("SELECT * FROM TODOs", (err, rows) => {
    if (err) {
      return console.error("Error fetching data:", err.message);
    }
    console.log(rows);
    res.json(rows);
  });
});

// GET a specific todo item by ID
app.get("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find((item) => item.id === id);
  if (todo) {
    res.json(todo);
  } else {
    res.status(404).json({ message: "Todo item not found" });
  }
});

// POST a new todo item
app.post("/todos", (req, res) => {
  const { name, priority = "low", isFun } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const newTodo = {
    name,
    priority,
    isComplete: false,
    isFun,
  };
  const insertQuery = `
  INSERT INTO TODOs (name, priority, is_fun)
  VALUES (?, ?, ?)
`;

  db.run(insertQuery, [name, priority, isFun], function (err) {
    if (err) {
      return console.error("Error inserting TODO:", err.message);
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  });
  res.status(201).json(newTodo);
});

// DELETE a todo item by ID
app.delete("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let idArray = [];

  db.all("SELECT id FROM TODOs", (err, rows) => {
    if (err) {
      return console.error("Error fetching IDs:", err.message);
    }
    idArray = rows.map((row) => row.id); // extract just the ID values
    if (!idArray.includes(id)) {
      return res.json({ message: `Id ${id} not available in database.` });
    } else {
      if (id !== -1) {
        db.run("DELETE FROM TODOs WHERE id = ?", [id], function (err) {
          if (err) {
            return console.error("Error deleting data:", err.message);
          }
          console.log(`Rows deleted: ${this.changes}`);
        });

        res.json({ message: `Todo item ${id} deleted.` });
      } else {
        res.status(404).json({ message: "Todo item not found" });
      }
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Todo API server running at http://localhost:${port}`);
});
