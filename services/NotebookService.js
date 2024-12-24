import notebookDataAccess from "../dataAccessServices/NotebookDataAccessService.js";
import fileService from "./FileContentService.js";

function createNotebook(name, owner) 
{
    if(!name || !owner) 
    {
        throw new Error("To create a notebook, an owner and name are needed");
    }

    const existingNotebook = notebookDataAccess.findNotebook(name, owner);
    if(existingNotebook) 
    {
        throw new Error("There already exists a notebook");
    }
    const result = notebookDataAccess.createNotebook(name, owner);
    fileService.createNotebookFile(owner, name);
    return { name, owner };
};


function getNotebook(name, owner) 
{
    if(!name || !owner) 
    {
        throw new Error("Notebook name and owner are needed");
    }

    const notebook = notebookDataAccess.findNotebook(name, owner);
    if(!notebook) 
    {
        throw new Error("Notebook not found");
    }
    return notebook;
};

function getAllNotebooksByOwner(owner)  
{
    if(!owner) 
    {
        throw new Error("Owner is needed");
    }
    const notebooks = notebookDataAccess.findAllNotebooksByOwner(owner);
    return notebooks;
};

function deleteNotebook(name, owner)  
{
    if(!name || !owner) 
    {
        throw new Error("Notebook name and owner are needed");
    }
   
    const result = notebookDataAccess.deleteNotebook(name, owner);
    if(result.changes === 0) 
    {
        throw new Error("Notebook not found or could not be deleted");
    }
    fileService.deleteNotebookFile(owner, name);
    return { success: true };
};

export default {
    createNotebook,
    getNotebook,
    getAllNotebooksByOwner,
    deleteNotebook,
};
