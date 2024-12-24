import { db } from "../db/db.js";

function shareNotebook(name, owner, sharedWith, permission) 
{
  const query = `
    INSERT INTO Shared (name, owner, shared_with, permission)
    VALUES (?, ?, ?, ?);
  `;
  const result = db.prepare(query).run(name, owner, sharedWith, permission);
  return result;
};

function updatePermission(name, owner, sharedWith, permission)
{
  const query = `
    UPDATE Shared
    SET permission = ?
    WHERE name = ? AND owner = ? AND shared_with = ?;
  `;
  const result = db.prepare(query).run(permission, name, owner, sharedWith);
  return result;
};

function findSharedWithUsers(name, owner) 
{
  const query = `
    SELECT shared_with, permission
    FROM Shared
    WHERE name = ? AND owner = ?;
  `;
  const sharedUsers = db.prepare(query).all(name, owner);
  return sharedUsers;
};

function findAllSharedWithUser(sharedWith)
{
  const query = `
    SELECT name, owner, permission
    FROM Shared
    WHERE shared_with = ?;
  `;
  const notebooks = db.prepare(query).all(sharedWith);
  return notebooks;
};

function removeAccess(name, owner, sharedWith) 
{
  const query = `
    DELETE FROM Shared
    WHERE name = ? AND owner = ? AND shared_with = ?;
  `;
  const result = db.prepare(query).run(name, owner, sharedWith);
  return result;
};

function getUserPermission(name, owner, email) 
{
  const query = `
    SELECT permission
    FROM Shared
    WHERE name = ? AND owner = ? AND shared_with = ?;
  `;
  const result = db.prepare(query).get(name, owner, email);
  return result || null;
};

export default {
  shareNotebook,
  updatePermission,
  findSharedWithUsers,
  findAllSharedWithUser,
  removeAccess,
  getUserPermission,
};
