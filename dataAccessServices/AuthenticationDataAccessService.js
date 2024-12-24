import { db } from "../db/db.js";

//Simpel createUser functie om in de db een user te creeren
function createUser(email, password, salt) 
{
  const query = `
    INSERT INTO User (email, password, salt)
    VALUES (?, ?, ?);
  `;
  const result = db.prepare(query).run(email, password, salt);
  return result;
};

//Zoek een user door email
function findUserByEmail(email)
{
  const query = `
    SELECT email, password, salt
    FROM User
    WHERE email = ?;
  `;
  const user = db.prepare(query).get(email);
  return user;
};

//export default omdat het makkelijker is om dan dingen te vernoemen
  export default {
  createUser,
  findUserByEmail,
};
