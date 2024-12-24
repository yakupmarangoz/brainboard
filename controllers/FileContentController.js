import fileService from "../services/FileContentService.js";
import sharedDataAccess from "../dataAccessServices/SharedNotebookDataAccessService.js";
import notebookDataAccess from "../dataAccessServices/NotebookDataAccessService.js";

function getNotebookContent(req, res)
{
  try 
  {
    const requester = req.email;
    const { name, owner } = req.body;

    if(!name || !owner) 
    {
      return res.status(400).json("Notebooks need name and owner");
    }
    const notebook = notebookDataAccess.findNotebook(name, owner);
    if(!notebook) 
    {
      return res.status(400).json("Notebooks doesnt exist");
    }
    let permission = "read";
    if(requester === owner)
    {
      permission = "write";
    } 
    else 
    {
      const sharedUsers = sharedDataAccess.findSharedWithUsers(name, owner);
      const sharedUser = sharedUsers.find(user => user.shared_with === requester);
      if(sharedUser) 
      {
        permission = sharedUser.permission;
      } 
      else 
      {
        return res.status(400).json("Acces denied");
      }
    }
    const content = fileService.readNotebookFile(owner, name);
    res.status(200).json({ content, permission });
  }
  catch (e) 
  {
    res.status(400).json(e.message);
  }
};
export default {
  getNotebookContent,
};
