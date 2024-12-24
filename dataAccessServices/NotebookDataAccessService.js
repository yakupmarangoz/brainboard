import { db } from "../db/db.js";

//Maak een notebook in de db 
function createNotebook(name, owner) 
{
  const query = `
    INSERT INTO Notebook (name, owner)
    VALUES (?, ?);
  `;
  const result = db.prepare(query).run(name, owner);
  return result;
};

function findNotebook(name, owner)
{
  const query = `
    SELECT name, owner
    FROM Notebook
    WHERE name = ? AND owner = ?;
  `;
  const notebook = db.prepare(query).get(name, owner);
  return notebook;
};

function findAllNotebooksByOwner(owner)
{
  const query = `
    SELECT name, owner
    FROM Notebook
    WHERE owner = ?;
  `;
  const notebooks = db.prepare(query).all(owner);
  return notebooks;
};

function deleteNotebook(name, owner)
{
  const query = `
    DELETE FROM Notebook
    WHERE name = ? AND owner = ?;
  `;
  const result = db.prepare(query).run(name, owner);
  return result;
};

export default {
  createNotebook,
  findNotebook,
  findAllNotebooksByOwner,
  deleteNotebook,
};
