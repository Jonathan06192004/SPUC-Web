import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzSCJ8XellJRvOSBZ7cTCA2OcmFh8jSrs",
  authDomain: "spuc-events-web.firebaseapp.com",
  projectId: "spuc-events-web",
  storageBucket: "spuc-events-web.firebasestorage.app",
  messagingSenderId: "989356465487",
  appId: "1:989356465487:web:428b119629a939e725793a",
  measurementId: "G-QE1HPE63EH"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Password show/hide
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", function(){
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
});

// Login system
const form = document.getElementById("loginForm");

form.addEventListener("submit", function(e){
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error");
    const loginBtn = document.querySelector(".login-btn");

    loginBtn.innerHTML = "Signing in...";
    loginBtn.disabled = true;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        localStorage.setItem("isAdminLoggedIn", "true");
        window.location.href = "AdminDashboard.html";
    })
    .catch((error) => {
        errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + error.message;
        errorMsg.style.display = "block";
        loginBtn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
        loginBtn.disabled = false;
    });
});
