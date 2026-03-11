import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app);


// SHOW / HIDE PASSWORD
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", function(){
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
});


// LOGIN SYSTEM
const form = document.getElementById("loginForm");

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const username = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const errorMsg = document.getElementById("error");
    const loginBtn = document.querySelector(".login-btn");

    loginBtn.innerHTML = "Signing in...";
    loginBtn.disabled = true;

    try {

        const querySnapshot = await getDocs(collection(db, "admin"));
        let authenticated = false;
        let adminData = null;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if(username === data.username && password === data.password){
                authenticated = true;
                adminData = { id: docSnap.id, ...data };
            }
        });

        if(authenticated){
            localStorage.setItem("isAdminLoggedIn", "true");
            localStorage.setItem("adminId", adminData.id);
            localStorage.setItem("adminName", adminData.name);
            window.location.href = "AdminDashboard.html";
        }else{
            errorMsg.innerHTML = "Invalid username or password";
            errorMsg.style.display = "block";
            loginBtn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
            loginBtn.disabled = false;
        }

    } catch(error){

        errorMsg.innerHTML = error.message;
        errorMsg.style.display = "block";

        loginBtn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
        loginBtn.disabled = false;

    }

});