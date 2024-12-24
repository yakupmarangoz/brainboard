import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
/*
Pakt het jwt token van de auth header en krijgt de payload 
De payload is de email en dan zet die het in de req zodat de controllers direct het email kunnen krijgen
Dan de volgende func aanroepen
*/
export function authenticateJWTToken(req, res, next)
{
  try 
  {
    const header = req.headers["authorization"];
    if(!header || !header.startsWith("Bearer ")) 
    {
      return res.status(400).json("Authorization header is missin");
    }
    const token = header.split(" ")[1];
    if(!token) 
    {
      return res.status(400).json("There is no jwt token.");
    }
    const secret = process.env.TOKEN_SECRET;
    if(!secret) 
    {
      return res.status(500).json("There is no token secret in the .env file sorry");
    }
    const payload = jwt.verify(token, secret);
    req.email = payload.email; 
    next();
  }
  catch (e) 
  {
    return res.status(400).json(e.message);
  }
};
