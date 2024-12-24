//Check als het jwt expired is, dus opnieuw moet inloggen
const token = localStorage.getItem("token"); 
if(!token)
{
  window.location.href = "/index.html";
}

//Check welke permission de persoon heeft
document.addEventListener("DOMContentLoaded", 
async ()=> 
{  
  const urlParams = new URLSearchParams(window.location.search);  
  const name = urlParams.get("name");
  const owner = urlParams.get("owner");
  try 
  {
    const response = await fetch(`http://localhost:8080/shared/permission`, 
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer "+token,
      },
      body: JSON.stringify({ name, owner }),
    });
    if(!response.ok)
    {
      window.location.href = "/dashboard.html";
    }
    const data = await response.json();    
    const editor = document.getElementById("editor");
    if(editor) 
    {
      editor.readOnly = data.permission == "read";
    }
  } 
  catch{}
});


const socket = io("http://localhost:8080");
const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get("name");
const owner = urlParams.get("owner");   
const editor = document.getElementById("editor");
const markdownView = document.getElementById("markdownView");
const editModeButton = document.getElementById("editMode");
const viewModeButton = document.getElementById("viewMode");
document.getElementById("notebookTitle").textContent = "Notebook: " + name;    
document.getElementById("notebookOwner").textContent = "Owner: " + owner;
let isEditMode = true;

//Stuur signal dat room owner:name joined
socket.emit("joinNotebook", { name, owner });

//Wanneer er content gestuurd wordt naar u, show de content voor de editor view en markdown view parsen
socket.on("loadNotebookContent", 
(content)=> 
{
  editor.value = content;
  markdownView.innerHTML = parseMarkdown(content);
});
//Zelfde hier
socket.on("updateContent", 
(content)=>
{
  editor.value = content;
  markdownView.innerHTML = parseMarkdown(content);
});

//Zoek images en plak die dan stuur naar server om op te slaan
editor.addEventListener("paste", 
async (event) => 
{
  const items = event.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const blob = item.getAsFile();
      const fileName = `pasted-image-${Date.now()}.png`;
      const fileBuffer = await blob.arrayBuffer();
      socket.emit("uploadImage", { owner, notebookName: name, fileName, fileBuffer });
      const placeholder = `![${fileName}](http://localhost:8080/notebooks/${owner}/${fileName})`;
      editor.value += `\n${placeholder}`;
    }
  }
});




//Als er iets wordt geedit stuur de content door als een signaal naar de server
editor.addEventListener("input", 
()=> 
{
  const content = editor.value;
  socket.emit("updateNotebookContent", { name, owner, content });
});

//Switch modes
editModeButton.addEventListener("click", 
()=> 
{
  isEditMode = true;
  editor.style.display = "block";
  markdownView.style.display = "none";
});

viewModeButton.addEventListener("click",
()=> 
{
  isEditMode = false;
  editor.style.display = "none";
  markdownView.style.display = "block";
  markdownView.innerHTML = parseMarkdown(editor.value);
});

//Parse de markdown in een html om bv youtube links en images te showen, override de link rendering in marked js
function parseMarkdown(content) 
{
  const renderer = new marked.Renderer();
  renderer.link = (href, title, text) => 
  {
    const youtubeRegex = /https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const imageRegex = /\.(jpeg|jpg|gif|png)$/i;

    //Check als er youtube video is in de link
    //https://www.youtube.com/watch?v=Ic5vxw3eijY&list=RDIc5vxw3eijY v is de id
    if(youtubeRegex.test(href)) 
    {
      const id = new URL(href).searchParams.get("v");
      return `
        <div class="embed-responsive embed-responsive-16by9 my-3">
          <iframe
            class="embed-responsive-item"
            src="https://www.youtube.com/embed/${id}"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>`;
    }
    //Kijk of het een image is
    if(imageRegex.test(href)) 
    {
      return `<img src="${href}">`;
    }
    return `<a href="${href}" target="_blank">${text}</a>`;
  };

  marked.setOptions({ renderer });
  return marked.parse(content);
};

//Voor dat die weg gaat een signaal sturen dat die weg gaat
window.addEventListener("beforeunload", 
() => 
{
  socket.emit("leaveNotebook", { name, owner });
});