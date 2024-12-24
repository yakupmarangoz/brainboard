import authenticationDataAccess from "../dataAccessServices/AuthenticationDataAccessService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fileService from "./FileContentService.js";
import dotenv from "dotenv";
dotenv.config();

//Pak de hashed passwoord van de db en kijk of de wachtwoord juist is en dan geef jwt Token en naar dashboard
async function authenticateUser(email, plainPassword) 
{
  const user = authenticationDataAccess.findUserByEmail(email);
  if(!user) 
  {
    throw new Error("Email not found");
  }
  const {password} = user;
  const pass = await bcrypt.compare(plainPassword, password);
  if(!pass) 
  {
    throw new Error("Wrong password. Try another password");
  }
  const token = jwt.sign({ email }, process.env.TOKEN_SECRET, { expiresIn: "5h" });
  return token;
};

//Maak gebruiker hash password met random salt en dan sturen naar db
async function createUser(email, plainPassword)
{
  const user = authenticationDataAccess.findUserByEmail(email);
  if(user) 
  {
    throw new Error("Email already exist.");
  } 
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword,salt);
  const newUser = authenticationDataAccess.createUser(email, hashedPassword, salt);
  if(!newUser) 
  {
    throw new Error("Couldnt make the user");
  }
  //Maakt directory voor de persoon om fotos en the notebook zijn files
  fileService.createUserDirectory(email);
  const token = jwt.sign({ email }, process.env.TOKEN_SECRET, { expiresIn: "5h" });
  return token;
};

export default {
  createUser,
  authenticateUser,
};
