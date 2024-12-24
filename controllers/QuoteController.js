import dotenv from "dotenv";

//API key van de website zit in de dotenv file
dotenv.config();


//API request om een random quote te krijgen met als query happiness
async function getQuote(req,res)
{
    try 
    {
        const response = await fetch("https://api.api-ninjas.com/v1/quotes?category=happiness", {
            method:"GET",
            headers: {"Content-Type":"application/json", "X-Api-Key": process.env.API_KEY_QUOTE }
        });
        const data = await response.json();

        if (!response.ok) 
        {
            return res.status(response.status).send(data.error);
        }

        res.status(200).json(data[0]);
    } 
    catch
    {
        //Als er iets verkeerds gaat met de server van api-ninjas
        res.status(500).send("Error fetching the quote, something wrong with API-ninjas");
    }
};

export default {
    getQuote,
}