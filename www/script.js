const textarea = document.querySelector("textarea");
const loginBtn = document.getElementById("login-btn");

window.addEventListener("load", () => {
    setTimeout(() => document.querySelector("textarea").focus(), 400);
  });
  
textarea.addEventListener("input", () => {
  if (textarea.value.trim().length > 0) {
    loginBtn.classList.add("active");
    loginBtn.disabled = false;
  
  } else {
    loginBtn.classList.remove("active");
    loginBtn.disabled = true;
  }
});

loginBtn.addEventListener('click',e  =>{
    e.preventDefault()
    localStorage.setItem('msg', textarea.value)
    location.replace('./login')
})
