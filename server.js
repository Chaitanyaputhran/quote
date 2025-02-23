const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Ensure this is correct
  database: "erp",
}); 

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// API to fetch all projects
app.get("/projects", (req, res) => {
  db.query("SELECT project_id FROM project", (err, results) => {
    if (err) {
      console.error("Error fetching projects:", err);
      res.status(500).send("Error fetching projects.");
    } else {
      res.json(results);
    }
  });
});

// API to fetch customer details by project ID
app.get("/customer/:project_id", (req, res) => {
  const { project_id } = req.params;

  const query = `
    SELECT c.cname AS customer_name, c.customer_address AS address
    FROM customer c
    JOIN project p ON c.customer_id = p.customer_id
    WHERE p.project_id = ?;
  `;

  db.query(query, [project_id], (err, results) => {
    if (err) {
      console.error("Error fetching customer:", err);
      return res.status(500).json({ error: "Error fetching customer." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Customer not found." });
    }

    res.json(results[0]);
  });
});



// API to fetch categories
app.get("/categories", (req, res) => {
  db.query("SELECT * FROM category", (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      res.status(500).send("Error fetching categories.");
    } else {
      res.json(results);
    }
  });
});

// API to fetch items by category ID
app.get("/items/:category_id", (req, res) => {
  const { category_id } = req.params;
  db.query(
    "SELECT * FROM rates WHERE category_id = ?",
    [category_id],
    (err, results) => {
      if (err) {
        console.error(`Error fetching items for category ${category_id}:`, err);
        res.status(500).send("Error fetching items.");
      } else {
        res.json(results);
      }
    }
  );
});

// API to save a quote
app.post("/save-quote", (req, res) => {
  const {
    project_id,
    customer_name,
    drip_cost,
    plumbing_cost,
    automation_cost,
    labour_cost,
    additional_cost,
    total_cost,
  } = req.body;

  // Check if the project_id exists
  db.query(
    "SELECT project_id FROM customers_data WHERE project_id = ?",
    [project_id],
    (err, results) => {
      if (err) {
        console.error("Error checking project existence:", err);
        return res.status(500).send("Database error.");
      }
      if (results.length === 0) {
        return res.status(400).send("Error: Project ID does not exist.");
      }

      // Insert quote data
      db.query(
        `INSERT INTO quotesdata (project_id, customer_name, drip_cost, plumbing_cost, 
            automation_cost, labour_cost, additional_cost, total_cost) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project_id,
          customer_name,
          drip_cost || 0,
          plumbing_cost || 0,
          automation_cost || 0,
          labour_cost || 0,
          additional_cost || 0,
          total_cost || 0,
        ],
        (err) => {
          if (err) {
            console.error("Error saving quote:", err);
            return res.status(500).send("Error saving quote.");
          }
          res.send("Quote saved successfully!");
        }
      );
    }
  );
});

// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
