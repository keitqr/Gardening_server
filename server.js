//Server.js

import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'garden_clients',
  password: 'Keitfysiko2020!',
  port: 5432,
});

pool
  .connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to PostgreSQL database:', error);
  });

 app.post('/clients', (req, res) => {
  const { name, phone, address } = req.body;

  console.log('Received client registration request:', req.body);

  const checkQuery = 'SELECT * FROM clients WHERE name = $1 AND phone = $2 AND address = $3';
  const checkValues = [name, phone, address];

  pool
    .query(checkQuery, checkValues)
    .then((result) => {
      if (result.rowCount > 0) {
        const existingClient = result.rows[0];
        console.log('Client already exists:', existingClient);
        res.json({ success: true, client: existingClient });
      } else {
        const insertQuery = 'INSERT INTO clients (name, phone, address) VALUES ($1, $2, $3) RETURNING *';
        const insertValues = [name, phone, address];

        pool
          .query(insertQuery, insertValues)
          .then((result) => {
            const newClient = result.rows[0];
            console.log('Registered new client:', newClient);
            res.json({ success: true, client: newClient });
          })
          .catch((error) => {
            console.error('Error registering client:', error);
            res.status(500).json({ success: false, message: 'Error registering client' });
          });
      }
    })
    .catch((error) => {
      console.error('Error checking client existence:', error);
      res.status(500).json({ success: false, message: 'Error checking client existence' });
    });
});

  
  app.get('/clients', (req, res) => {
    const query = 'SELECT * FROM clients';
  
    pool
      .query(query)
      .then((result) => {
        const clients = result.rows;
        res.json({ success: true, clients });
      })
      .catch((error) => {
        console.error('Error retrieving clients:', error);
        res.json({ success: false, error: 'Failed to retrieve clients' });
      });
  });

  app.post('/notes', (req, res) => {
    const { clientId, notes } = req.body;
    console.log('Received request to update notes:', clientId, notes);
  
    const selectQuery = 'SELECT notes FROM clients WHERE id = $1';
    const updateQuery = 'UPDATE clients SET notes = $1 WHERE id = $2';
  
    pool
      .query(selectQuery, [clientId])
      .then((result) => {
        const existingNotes = result.rows[0]?.notes || '';
        const updatedNotes = `${existingNotes}\n${notes}`;
  
        pool
          .query(updateQuery, [updatedNotes, clientId])
          .then(() => {
            console.log('Notes updated successfully');
            res.json({ success: true });
          })
          .catch((error) => {
            console.error('Error updating notes:', error);
            res.status(500).json({ success: false, message: 'Error updating notes' });
          });
      })
      .catch((error) => {
        console.error('Error retrieving existing notes:', error);
        res.status(500).json({ success: false, message: 'Error retrieving existing notes' });
      });
  });
  

  



  app.get('/notes/:clientId', (req, res) => {
    const { clientId } = req.params;
  
    const query = 'SELECT notes FROM clients WHERE name = $1'; // Update column name to 'name'
    const values = [clientId];
  
    pool
      .query(query, values)
      .then((result) => {
        const { notes } = result.rows[0] || { notes: '' }; // Set default value for notes if it's undefined
        res.json({ success: true, notes });
      })
      .catch((error) => {
        console.error('Error retrieving notes:', error);
        res.status(500).json({ success: false, message: 'Error retrieving notes' });
      });
  });
  
