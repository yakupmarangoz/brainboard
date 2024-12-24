import Database from "better-sqlite3";

export const db = new Database("./db/database.db");

export function InitializeDatabase() 
{
  try {
    db.pragma("journal_mode = WAL;");
    db.pragma("busy_timeout = 5000;");
    db.pragma("synchronous = NORMAL;");
    db.pragma("cache_size = 1000000000;");
    db.pragma("foreign_keys = true;");
    db.pragma("temp_store = memory;");
    //User table maken
    db.prepare(`
      CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        salt TEXT NOT NULL
      );
    `).run();
    //Notebook table maken
    db.prepare(`
      CREATE TABLE IF NOT EXISTS Notebook (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        owner TEXT NOT NULL,
        FOREIGN KEY (owner) REFERENCES User(email) ON DELETE CASCADE
        UNIQUE (name, owner)
      );
    `).run();

    //Shared table maken
    db.prepare(`
      CREATE TABLE IF NOT EXISTS Shared (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        owner TEXT NOT NULL,
        shared_with TEXT NOT NULL,
        permission TEXT NOT NULL,
        FOREIGN KEY (name, owner) REFERENCES Notebook(name, owner) ON DELETE CASCADE,
        FOREIGN KEY (shared_with) REFERENCES User(email) ON DELETE CASCADE
      );
    `).run();

  }
  catch (e) 
  {
    throw new Error(e.message);
  }
}

