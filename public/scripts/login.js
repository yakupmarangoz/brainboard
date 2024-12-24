//Check als het al ingelogged is
if(localStorage.getItem("token"))
{
    window.location.href = "/dashboard.html"; 
}

//Correcte antwoord van het captcha
let correctAns;

//Genereer captcha functie pak twee random getallen van 1 tot 10,
//Bijvoorbeeld: 10+5 en de correcte antwoord is dan 15
function generateCaptcha() 
{
    const x = Math.floor(Math.random() * 10) + 1;
    const y = Math.floor(Math.random() * 10) + 1;
    correctAns = x + y;
    document.getElementById("captchaQuestion").textContent = x +" + "+ y;
}
generateCaptcha();

/*
Wanneer je op de loginBUtton drukt check of de captcha juist is anders stop je het daar al en genereer het een nieuwe captcha, 
Als het correct is worden de inputs gecheckt of het wel in het juiste formaat is anders stop je het daar al,
Dan wordt het request pas gedaan, ik heb dit geimplement omdat ik geen oneindig foute request wil.
Dan krijgt de client zijn jwt token en kan het opslaan in localStorage en dan ook nog naar de dashboard pagina gaan.
Ik heb ook error messages geplaats zodat het duidelijk is wat fout is.
*/
document.getElementById("loginButton").addEventListener("click",
async ()=>
{
    const email = document.getElementById("email").value;
    const emailError = document.getElementById("emailError");
    const password = document.getElementById("password").value;
    const passwordError = document.getElementById("passwordError");
    const captchaAns = parseInt(document.getElementById("captchaAnswer").value, 10);
    const captchaError = document.getElementById("captchaError");

    if(captchaAns !== correctAns) 
    {
        captchaError.style.display = "block";
        generateCaptcha();
        return;
    } 
    else
    {
        captchaError.style.display = "none";
    }

    if(!email || !isEmail(email)) 
    {
        emailError.style.display = "block";
        emailError.textContent = "Please fill in an actual email."
        passwordError.style.display = "none";
        return
    }

    if(!password || !isPassword(password)) {
        passwordError.style.display = "block";
        passwordError.textContent ="Password has to be 8 character long, 1 capital character, 1 number and 1 special character.";
        emailError.style.display = "none";
        return
    }
    
    try
    {
        const response = await fetch("http://localhost:8080/authentication/authenticate", 
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if(!response.ok) 
        {
            //Check wat voor soort error het is en show die dan
            const errorMessage = await response.text();
            if(errorMessage.toLowerCase().includes("email"))
            {                
                emailError.style.display = "block";
                emailError.textContent = errorMessage;
                passwordError.style.display = "none";
            }
            else
            {
                passwordError.style.display = "block";
                passwordError.textContent =errorMessage;
                emailError.style.display = "none";
            }
        }
        const token = await response.json();
        localStorage.setItem("token", token);
        window.location.href = "/dashboard.html"; 
    } 
    catch (e) 
    {
        if(e.message.toLowerCase().includes("email")){                
            emailError.style.display = "block";
            emailError.textContent = errorMessage;
            passwordError.style.display = "none";
        }
        else{
            passwordError.style.display = "block";
            passwordError.textContent =errorMessage;
            emailError.style.display = "none";
        }
    }
});

//Request een random quote van de server en show die dan, stop als de response niet ok is
document.addEventListener("DOMContentLoaded",
async ()=>{
    const response =  await fetch("http://localhost:8080/quote",
    {
        method:"GET",
        headers:{"Content-Type":"application/json", }
    });

    if(!response.ok)
    {
        return
    }
    const {quote, author} = await response.json();
    document.getElementById("quote").textContent = quote + " ~"+author;        
});

//Email regex pattern, checkt of het een email is
function isEmail(email)
{
    return  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
//Password regex pattern, checkt of het all de patterns wel bestaan in het string
function isPassword(password) 
{
    return /[!@#$%^&*(),.?":{}|<>]/.test(password) && /[A-Z]/.test(password) && password.length >= 8;
}