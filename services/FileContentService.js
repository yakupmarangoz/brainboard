import fs from "fs";
import path from "path";

//Maak de .md file in de filesystem
function createNotebookFile(owner, name) 
{    
    const filePath = path.join("notebooks", owner, name + ".md");
    try {
        const dirPath = path.dirname(filePath);
        fs.mkdirSync(dirPath, { recursive: true });

        fs.writeFileSync(filePath, "# Hello " + owner + " thank you for using **BrainBoard** ♥");
        return filePath;
    } catch(e) 
    {
        throw new Error(e.message);
    }
};

//Uploads de image naar de owners filemap.
function uploadImage(owner, fileName, fileBuffer) 
{
    const uploadPath = path.join("notebooks", owner);
    const filePath = path.join(uploadPath, fileName);
    try {
        fs.writeFileSync(filePath, Buffer.from(fileBuffer));
        const fileReference = `/notebooks/${owner}/${fileName}`;
        return fileReference;
    }
    catch (e) 
    {
        throw new Error("Couldn't upload file: " + e.message);
    }
};

//Pak de content van de file
function readNotebookFile(owner, name) 
{
    const filePath = path.join("notebooks", owner,  name + ".md");
    try 
    {
        if(!fs.existsSync(filePath)) 
        {
            throw new Error("Coulndt find the file");
        }
        const content = fs.readFileSync(filePath, "utf-8");
        return content;
    } 
    catch (e) 
    {
        throw new Error(e.message);
    }
};

//Schrijf naar de file
function writeNotebookFile(owner, name, content) 
{
    const filePath = path.join("notebooks", owner,  name + ".md");
    try 
    {
        fs.writeFileSync(filePath, content, "utf-8");
    } 
    catch (e) 
    {
        throw new Error(e.message);
    }
};

//Delete de file
function deleteNotebookFile(owner, name)
{
    const filePath = path.join("notebooks", owner,  name + ".md");
    try 
    {
        //checkt of de file bestaat en dan verwijderen
        if(fs.existsSync(filePath)) 
        {
            fs.unlinkSync(filePath);
        }
    } 
    catch (e){
        throw new Error(e.message);
    }
};

//Maak de user map aan recusive zodat als de notebooks map er niet bestaat ook gemaakt word
function createUserDirectory(owner)  
{
    const filePath = path.join("notebooks", owner);
    try 
    {
        fs.mkdirSync(filePath, { recursive: true });
    } 
    catch (e) 
    {
        throw new Error(e.message);
    }
};

export default {
    createNotebookFile,
    readNotebookFile,
    writeNotebookFile,
    deleteNotebookFile,
    createUserDirectory,
    uploadImage,
};
