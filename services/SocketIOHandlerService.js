import fileService from "./FileContentService.js"; 

//Alle actieve notebooks zodat je die direct kunt reference om content en alle users te krijgen
//Om als de laaste user leaved dat het automatisch wordt weggeschreven naar de file
const activeNotebooks = {}; 

export function setupSocketIO(io) 
{
  io.on("connection", (socket)=> 
    {
      //Als de client een signal stuurt dat die een bepaalde room wilt joinen
      //Add je de client in de users van de notebook die in de activenotebooks zitten 
      //Met als key de owner:name dus de owner van de notebook  en de naam van de notebook
      socket.on("joinNotebook", ({ name, owner })=> 
      {
        const key = owner+":"+name;
        socket.join(key);

        //Dus als er geen activeNotebook is van die key maak ene
        if(!activeNotebooks[key]) 
        {
          activeNotebooks[key] = {
            users: [],
            content: fileService.readNotebookFile(owner, name),
          };
        }
        
        activeNotebooks[key].users.push(socket.id);

        //Stuur een signaal naar de client die net heeft verbonden met de content
        socket.emit("loadNotebookContent", activeNotebooks[key].content);
    });
  
    //Ik heb snel de uplaodImage functie gedaan na het gesprek want ik dacht dat u impliceerde dat ik zou buizen als ik dit niet vandaag zou maken
    socket.on("uploadImage", async ({ owner, notebookName, fileName, fileBuffer })=> 
    {
      const key = `${owner}:${notebookName}`;
      try {
          const fileReference = fileService.uploadImage(owner, fileName, Buffer.from(fileBuffer));
          const imageMarkdown = `![${fileName}](${fileReference})`;
          if(activeNotebooks[key]) 
          {
              activeNotebooks[key].content += `\n${imageMarkdown}`; 
  
              io.to(key).emit("updateContent", activeNotebooks[key].content);
  
          }
      } 
      catch (e) {
      }
  });
  

    //Als de client een update stuurt, dan update je de content van die notebook 
    //Stuur een signaal aan alle users in de notebook behalve je eigen met de updated content
    socket.on("updateNotebookContent", ({ name, owner, content })=> 
    {
      const key = owner+":"+name;
      if(activeNotebooks[key])
      {
        activeNotebooks[key].content = content;  
        socket.to(key).emit("updateContent", content);
      }
    });
  
    //Als een client disconnect dan remove je die van de users in de notebook en als die de laatste was schrijf de changes terug naar de file en delete het van de active notebooks
    socket.on("disconnect", ()=>
    {
      for (const [key, notebook] of Object.entries(activeNotebooks))
      {
        notebook.users = notebook.users.filter((id) => id !== socket.id);
        if(notebook.users.length === 0) 
        {
          const [owner, name] = key.split(":");
          fileService.writeNotebookFile(owner, name, notebook.content);
          delete activeNotebooks[key];
        }
      }
    });
  });
}
