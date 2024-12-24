import sharedDataAccess from "../dataAccessServices/SharedNotebookDataAccessService.js";
import notebookDataAccess from "../dataAccessServices/NotebookDataAccessService.js";
import authenticationDataAccess from "../dataAccessServices/AuthenticationDataAccessService.js";

function shareNotebook (name, owner, sharedWith, permission)  
{
    const notebook = notebookDataAccess.findNotebook(name, owner);
    
    if(!notebook) 
    {
        throw new Error("Notebook doesnt exist");
    }
    const exists = authenticationDataAccess.findUserByEmail(sharedWith);
    if(!exists)
    {
        throw new Error("This person does not have an account.");
    }
    const result = sharedDataAccess.shareNotebook(name, owner, sharedWith, permission);
    return "Success";
};

function updatePermission (name, owner, sharedWith, permission)  
{
    const result = sharedDataAccess.updatePermission(name, owner, sharedWith, permission);
    if(result.changes === 0) 
    {
        throw new Error("Notebook not found.");
    }
    return "Succes";
};

function getSharedWithUsers (name, owner)  
{
    const sharedUsers = sharedDataAccess.findSharedWithUsers(name, owner);
    return sharedUsers;
};

function getSharedNotebooks (sharedWith)  
{
    const sharedNotebooks = sharedDataAccess.findAllSharedWithUser(sharedWith);
    if(!shareNotebook)
    {
        throw new Error("Error getting the shared notebooks.");
    }
    if(sharedNotebooks.length === 0) 
    {
        throw new Error("No notebooks are shared with you.");
    }
    return sharedNotebooks;
};

function removeAccess (name, owner, sharedWith)  
{
    const result = sharedDataAccess.removeAccess(name, owner, sharedWith);
    if(result.changes === 0) 
    {
        throw new Error("User doesnt exist");
    }
    return "success";
};

function getUserPermission (name, owner, email)  
{
    const permission = sharedDataAccess.getUserPermission(name, owner, email);
    if(!permission) 
    {
        throw new Error("The notebook does not exists.");
    }
    return permission; 
};

export default {
    shareNotebook,
    updatePermission,
    getSharedWithUsers,
    getSharedNotebooks,
    removeAccess,
    getUserPermission
};
