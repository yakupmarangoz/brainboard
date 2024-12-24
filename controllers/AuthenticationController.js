import service from "../services/AuthenticationService.js";

//Maak user in de authService en return de json webtoken voor op te slaan in de localStorage anders error
async function createUser(req, res)
{
  try 
  {
    const { email, password } = req.body;
    const token = await service.createUser(email, password);
    res.status(200).json({ token });
  } 
  catch(e) 
  {
    res.status(400).json(e.message);
  }
};

//Kijk of het email en password juist is dat verstuurd is anders error 
async function authenticateUser(req, res)
{
  try 
  {
    const { email, password } = req.body;
    const token = await service.authenticateUser(email, password);
    res.status(200).json(token);
  } 
  catch(e) 
  {
    res.status(400).json(e.message);
  }
};

export default 
{
  createUser,
  authenticateUser,
};
