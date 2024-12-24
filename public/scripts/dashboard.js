//Check als het jwt expired is, dus opnieuw moet inloggen
const token = localStorage.getItem("token"); 
if(!token)
{
  window.location.href = "/index.html";

}

//Alert voor de success of danger dus is iets gelukt of is het een error met een message die je wilt tonen
function showAlert(type, message) 
{
  const alertContainer = document.getElementById("alertContainer");
  const alertHtml = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      <strong>${type === "success" ? "Success!" : "Error!"}</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  //Add de html in de innerHtml van de container
  alertContainer.innerHTML = alertHtml;
  //Nu hou die voor 3 seconden en verwijder die daarna
  setTimeout(
  () => 
  {
    const alertElement = alertContainer.querySelector(".alert");
    if(alertElement) 
    {
      alertElement.classList.remove("show");
      alertElement.classList.add("hide");
      setTimeout(() => alertElement.remove(), 500);
    }
  },
  3000);
}

//Als er op de button wordt gedrukt gaat het terug naar de index.html pagina en wordt de token verwijderd
document.getElementById("logOut").addEventListener("click",
()=>
{
  localStorage.removeItem("token");
  window.location.href = "/";
})

/*
Als je op de saveNotebook button drukt wordt er eerst gecheckt of de naam is ingevuld anders alert laten zien,
Dan wordt het notebook gemaakt, in de db en in de filesystem als notebook/owner/name.md,
De card wordt aangemaakt en in het container gezet en de modal wordt op hide gezet
Er zijn ook alerts om te tonen dat het successvol was of er een error was
*/
document.getElementById("saveNotebook").addEventListener("click",
async ()=> 
{
  const name = document.getElementById("name").value;
  if(name.includes(" "))
  {
    showAlert("danger", "Notebook name cant contain any spaces.");
    return;
  }
  if(!name) 
  {
    showAlert("danger", "Please enter a Notebook name.");
    return;
  }
  try 
  {
    const response = await fetch("http://localhost:8080/notebook/create", 
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ name }),
    });    
    if(!response.ok) 
    {
        const errorMessage = await response.text();    
        showAlert("danger","Couldnt create the notebook." +errorMessage);
        return;
    }
    const { notebookName, notebookOwner } = await response.json();    
    const card = `
      <div class="col-md-4">
        <div class="card h-100 shadow">
          <div class="card-body">
            <h5 class="card-title">${notebookName}</h5>
            <p class="card-text">Owned by: ${notebookOwner}</p>
            <div class="d-flex justify-content-between align-items-center">
              <a href="/notebook.html?owner=${notebookOwner}&name=${notebookName}" class="btn btn-primary">View Notebook</a>
              <button 
                class="btn btn-danger btn-sm delete-notebook" 
                onclick="deleteNotebook('${notebookName}','${notebookOwner}')">
                Delete
              </button>
              <button 
                class="btn btn-secondary btn-sm share-notebook" 
                data-name="${notebookName}" 
                data-owner="${notebookOwner}" 
                onclick="openShareModal('${notebookName}', '${notebookOwner}')">
                Share
              </button>
            </div>
          </div>
        </div>
      </div>`;    
    document.querySelector(".row.g-4").innerHTML += card;
    showAlert("success", "Notebook "+notebookName+" created successfully!");
    document.getElementById("name").value = "";
    const modal = bootstrap.Modal.getInstance(document.getElementById("createModal"));
    modal.hide();
  } 
  catch (e) 
  {
    showAlert("danger", "Couldnt create the notebook. Please try again." + e.message);
  }
});

/*
Als je op de delete notebook klikt wordt het in de db verwijderd
Nadat het successvol is verwijderd in het filesystem ook verwijderd;
*/
async function deleteNotebook(name, owner) 
{
  try
  {
    const response = await fetch("http://localhost:8080/notebook/delete",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ name, owner }),
    });

    if(!response.ok)
    {
      const errorMessage = await response.json();
      showAlert("danger", errorMessage);
      return
    }
    showAlert("success","Notebook deleted successfully");
    fetchNotebooks();
  } 
  catch (e)
  {
    showAlert("danger", e.message);
  }
}

/*
Fetch alle notebooks van de user zelf, met de token
Add all die notebooks dan in de container met hun eigen card
*/
async function fetchNotebooks() 
{
  try
  {
    const response = await fetch("http://localhost:8080/notebook/all", 
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token"),
      },
    });

    if(!response.ok) 
    {
      const errorMessage = await response.json();
      showAlert("danger", errorMessage);
      return
    }
    const notebooks = await response.json();
    const notebooksContainer = document.querySelector(".row.g-4");
    notebooksContainer.innerHTML = "";
    notebooks.forEach((notebook) => {
      const card = `
          <div class="col-md-4">
            <div class="card h-100 shadow">
              <div class="card-body">
                <h5 class="card-title">${notebook.name}</h5>
                <p class="card-text">Owned by: ${notebook.owner}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <a href=/notebook.html?owner=${notebook.owner}&name=${notebook.name} class="btn btn-primary">View Notebook</a>
                  <button 
                    class="btn btn-danger btn-sm delete-notebook" 
                    onclick="deleteNotebook('${notebook.name}','${notebook.owner}')">
                    Delete
                  </button>
                  <button 
                    class="btn btn-secondary btn-sm share-notebook" 
                    data-name="${notebook.name}" 
                    data-owner="${notebook.owner}" 
                    onclick="openShareModal('${notebook.name}', '${notebook.owner}')">
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>`;
      notebooksContainer.innerHTML += card;
    });
  } 
  catch (e) 
  {
    showAlert("danger", e.message);
  }
}

//De sharemodal te openenen e, fetch de sharedUsers van die bepaalde notebook
//Om te tonen aan de user met wie hij/zij het heeft geshared en de permissions
function openShareModal(name, owner) 
{
  document.getElementById("notebookName").value = name;
  document.getElementById("notebookOwner").value = owner;
  fetchSharedUsers(name, owner); 
  const modal = new bootstrap.Modal(document.getElementById("shareModal"));
  modal.show();
}

//Fetch alle users met wie het notebook van de user geshared mee is
async function fetchSharedUsers(name, owner) 
{
  try 
  {
    const response = await fetch("http://localhost:8080/shared/shared-with-users",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ name }),
    });
    if(!response.ok) 
    {
      showAlert("danger","Failed to fetch shared users");
    }
    const sharedUsers = await response.json();
    const sharedList = document.getElementById("sharedList");
    sharedList.innerHTML = ""; 

    sharedUsers.forEach((user) => {
      const listItem = document.createElement("li");
      listItem.className = "list-group-item d-flex justify-content-between align-items-center";
      listItem.innerHTML = `
         <span>${user.shared_with}</span>
        <div class="d-flex align-items-center">
          <select class="form-select form-select-sm me-2" style="width: auto;" onchange="updatePermission('${name}', '${owner}', '${user.shared_with}', this.value)">
            <option value="read" ${user.permission === "read" ? "selected" : ""}>Read</option>
            <option value="write" ${user.permission === "write" ? "selected" : ""}>Write</option>
          </select>
          <button class="btn btn-sm btn-danger" onclick="removeAccess('${name}', '${owner}', '${user.shared_with}')">
            Remove
          </button>
        </div>
      `;
      sharedList.appendChild(listItem);
    });
  } 
  catch (e) 
  {
    showAlert("danger", e.message);
  }
}

//Add een nieuwe user waarmee je wilt sharen test eerst of het een echte email is dan kan je die sharen
//En refresh dan de sharedUsers list
document.getElementById("addShareButton").addEventListener("click", 
async ()=> 
{
  const name = document.getElementById("notebookName").value;
  const owner = document.getElementById("notebookOwner").value;
  const sharedWith = document.getElementById("recipientEmail").value;
  const permission = document.getElementById("permissions").value;
  const sharedList = document.getElementById("sharedList").children;
  for (let i = 0; i < sharedList.length; i++) 
  {
    const listItemEmail = sharedList[i].querySelector("span").textContent.trim();
    if (listItemEmail === sharedWith) {
      showAlert("danger", "This person is already in the shared list.");
      return;
    }
  }
  if(owner === sharedWith){
    showAlert("danger", "You cant share it with the owner.");
    return;
  }
  if(!sharedWith || !isEmail(sharedWith)) 
  {
    showAlert("danger","Please fill an actual email.");
    return;
  }
  try
  {
    const response = await fetch("http://localhost:8080/shared/share", 
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ name, sharedWith, permission }),
    });

    if(!response.ok) 
    {
      const errorMessage = await response.json();
      showAlert("danger", errorMessage);
      return
    }
    showAlert("success", "Notebook shared successfully.");
    fetchSharedUsers(name, owner); 
    document.getElementById("recipientEmail").value = ""; 
  } 
  catch (e) 
  {
    showAlert("danger", e.message);
  }
});

//Update de permission van het user en refresh dan de sharedUsersList
async function updatePermission(name, owner, sharedWith, permission) {
  
  try 
  {
    const response = await fetch("http://localhost:8080/shared/permission", 
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ name, owner, sharedWith,  permission}),
    });

    if(!response.ok) 
    {
      const errorMessage = await response.json();
      showAlert("danger", errorMessage);
      return
    }
    showAlert("success", `Permission updated to "${permission}" for ${sharedWith}.`);
    fetchSharedUsers(name, owner);
  }
  catch(e)
  {
    showAlert("danger", e.message);
  }
}

//Remove access van de persoon waarmee jij mee hebt geshared en refresh de sharedUsers list
async function removeAccess(name, owner, sharedWith) 
{
  try 
  {
    const response = await fetch("http://localhost:8080/shared/remove", 
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ name, owner, sharedWith }),
    });

    if(!response.ok) 
    {    
      const errorMessage = await response.json();
      showAlert("danger", errorMessage);
      return
    }
    showAlert("success",sharedWith+" has been removed.");
    fetchSharedUsers(name, owner); 
  } 
  catch (e) 
  {
    showAlert("danger", e.message);
    return
  }
}

//Zoeken voor een bepaalde notebook door te luisteren naar de input,
//Als iets wordt getyped dan pak die value en zoek die card aan de hadn van de title
//Show die cards die de query containen
document.getElementById("searchNotebook").addEventListener("input", 
()=>
{
  const query = document.getElementById("searchNotebook").value.toLowerCase();
  const notebooks = document.querySelectorAll(".card");
  notebooks.forEach((notebook)=>
  {
    const title = notebook.querySelector(".card-title").textContent.toLowerCase();
    notebook.parentElement.style.display = title.includes(query) ? "" : "none";
  });
});


//Als alle html is geload fetch dan snel alle notebook en maak voor elk notebook een card en zet die dan in de container
document.addEventListener("DOMContentLoaded", 
async ()=> 
{
  fetchNotebooks();
});

//Email regex pattern, checkt of het een email is
function isEmail(email)
{
    return  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}