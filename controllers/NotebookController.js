import service from "../services/NotebookService.js";

function createNotebook(req, res) 
{
    try {
        const { name } = req.body;
        const owner = req.email;
        const { name: notebookName, owner: notebookOwner } = service.createNotebook(name, owner);
        res.status(200).json({ notebookName, notebookOwner });
    }
    catch (e) 
    {
        res.status(400).json(e.message);
    }
};

function getNotebook(req, res) 
{
    try{
        const { name } = req.body; 
        const owner = req.email; 
        const notebook = service.getNotebook(name, owner);
        res.status(200).json(notebook);
    } 
    catch(e) 
    {
        res.status(400).json(e.message );
    }
};

function getAllNotebooks(req, res) 
{
    try 
    {
        const owner = req.email;
        const notebooks = service.getAllNotebooksByOwner(owner);
        res.status(200).json(notebooks);
    }
    catch (e) 
    {
        res.status(400).json(e.message);
    }
};



function deleteNotebook(req, res)
{
    try 
    {
        const { name } = req.body;
        const owner = req.email; 
        const result = service.deleteNotebook(name, owner);
        res.status(200).json(result);
    }
    catch (e) 
    {
        res.status(400).json(e.message);
    }
};

export default {
    createNotebook,
    getNotebook,
    getAllNotebooks,
    deleteNotebook,
};
