const showPw = document.querySelector("#showPw");
showPw.addEventListener("click", function() {
    const pwInput = document.getElementById("account_password");
    const type = pwInput.getAttribute("type");
    if (type == "password") {
        pwInput.setAttribute("type", "text");
        showPw.innerHTML = "Hide Password";
    } else {
        pwInput.setAttribute("type", "password");
        showPw.innerHTML = "Show Password";
    }
});