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

//Fetch alle notebooks die met de users geshared zijn, het kan zijn dat er geen enkele notebook is geshared,
//Bij errors heb ik dus moeten onderscheiden of het een echte server error is of een je hebt helemaal geen values error
document.addEventListener("DOMContentLoaded", 
async ()=> 
{
  const sharedContainer = document.getElementById("sharedNotebooksContainer");  
  try
  {
    const response = await fetch("http://localhost:8080/shared/shared-with-me", 
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
      if(errorMessage == "No notebooks are shared with you.")
      {
        showAlert("success",errorMessage);
      } 
      else
      {
        showAlert("danger",errorMessage);
      }
      return
    }
    const sharedNotebooks = await response.json();
    sharedContainer.innerHTML = "";
    sharedNotebooks.forEach((notebook) =>
    {
      const card = `
        <div class="col-md-4">
          <div class="card h-100 shadow">
            <div class="card-body">
              <h5 class="card-title">${notebook.name}</h5>
              <p class="card-text">Shared by: ${notebook.owner}</p>
              <p class="card-text">Permission: ${notebook.permission}</p>
              <a href="notebook.html?owner=${notebook.owner}&name=${notebook.name}" class="btn btn-primary">View Notebook</a>
            </div>
          </div>
        </div>`;
      sharedContainer.innerHTML += card;
    });
  }
  catch
  {
  }
});

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
  