import sharedService from "../services/SharedNotebooksService.js";

function shareNotebook(req, res) 
{
    try {
        const { name, sharedWith, permission } = req.body;
        const owner = req.email; 
        const result = sharedService.shareNotebook(name, owner, sharedWith, permission);
        res.status(200).json(result);
    }
    catch (e) 
    {
        res.status(400).json(e.message);
    }
};

function updatePermission(req, res)  
{
    try {
        const { name, sharedWith, permission } = req.body;
        const owner = req.email; 
        const result = sharedService.updatePermission(name, owner, sharedWith, permission);
        res.status(200).json(result);
    } 
    catch (e)
    {
        res.status(400).json(e.message);
    }
};

function getSharedWithUsers(req, res)  
{
    try {
        const { name } = req.body;
        const owner = req.email; 
        const sharedUsers = sharedService.getSharedWithUsers(name, owner);
        res.status(200).json(sharedUsers);
    } catch (e) 
    {
        res.status(400).json(e.message);
    }
};

function getSharedNotebooks(req, res) 
{
    try {
        const sharedWith = req.email; 
        const sharedNotebooks = sharedService.getSharedNotebooks(sharedWith);
        res.status(200).json(sharedNotebooks);
    } catch (e) 
    {
        res.status(400).json(e.message);
    }
};

function removeAccess(req, res)  
{
    try {
        const { name, sharedWith } = req.body;
        const owner = req.email; 
        const result = sharedService.removeAccess(name, owner, sharedWith);
        res.status(200).json(result);
    } 
    catch (e){
        res.status(400).json(e.message);
    }
};
function getUserPermission(req, res) {
    try {
        const { name, owner } = req.body;
        const email = req.email;

        if (owner == email) {
            return res.status(200).json({ owner }); // Add `return` to stop further execution.
        }

        const result = sharedService.getUserPermission(name, owner, email);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json(e.message);
    }
};

export default {
    shareNotebook,
    updatePermission,
    getSharedWithUsers,
    getSharedNotebooks,
    removeAccess,
    getUserPermission
};
