import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase config
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

// DOM Elements
const form = document.getElementById("eventForm");
const eventsContainer = document.getElementById("eventsContainer");
const calendarGrid = document.getElementById("calendarGrid");
const monthYear = document.getElementById("monthYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const eventDetails = document.getElementById("eventDetails");
const selectedDateText = document.getElementById("selectedDateText");
const timeSelect = document.getElementById("time");
const customTimeInput = document.getElementById("customTime");
const titleSelect = document.getElementById("title");
const customTitleInput = document.getElementById("customTitle");

let events = [];
let selectedDate = null;
let currentDate = new Date();
let editID = null;

const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// HELPER: Ensures time is stored in DB with :00 format (e.g., "4:00 - 6:00 PM")
function formatTimeForDB(timeStr) {
    // Replaces numbers like "4" or "6" with "4:00" or "6:00"
    return timeStr.replace(/(\d+)(?::\d+)?(?=\s*(?:-|–)\s*(\d+)(?::\d+)?)/g, '$1:00')
                  .replace(/(\d+)(?::\d+)?(?=\s*[AP]M)/g, '$1:00');
}

// LOAD EVENTS
async function loadEvents(){
    events = [];
    const querySnapshot = await getDocs(collection(db,"events"));
    querySnapshot.forEach((docSnap)=>{
        events.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderEvents();
    renderCalendar();
}

// CALENDAR
function renderCalendar(){
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYear.textContent = `${months[month]} ${year}`;
    const firstDay = new Date(year,month,1).getDay();
    const daysInMonth = new Date(year,month+1,0).getDate();
    let html = days.map(d=>`<div class="day-name">${d}</div>`).join("");
    for(let i=0;i<firstDay;i++){ html += `<div class="calendar-day empty"></div>`; }
    for(let day=1;day<=daysInMonth;day++){
        const date = new Date(year,month,day);
        const dateStr = date.toDateString();
        const hasEvent = events.some(e=>e.date===dateStr);
        html += `<div class="calendar-day ${hasEvent ? "has-event":""}" data-date="${dateStr}">${day}</div>`;
    }
    calendarGrid.innerHTML = html;
    document.querySelectorAll(".calendar-day:not(.empty)").forEach(day=>{
        day.addEventListener("click",()=>{
            selectedDate = new Date(day.dataset.date);
            selectedDateText.textContent = selectedDate.toDateString();
            eventDetails.style.display="block";
        });
    });
}

// SAVE EVENT (Updated with Formatting)
form.addEventListener("submit", async(e)=>{
    e.preventDefault();
    if(!selectedDate){ alert("Select a date"); return; }
    
    const rawTime = timeSelect.value === "custom" ? customTimeInput.value : timeSelect.value;
    
    const newEvent = {
        date: selectedDate.toDateString(),
        day: days[selectedDate.getDay()] + ', ' + selectedDate.toLocaleDateString(),
        time: formatTimeForDB(rawTime), // Automatically formats before saving
        title: titleSelect.value === "custom" ? customTitleInput.value : titleSelect.value,
        description: document.getElementById("description").value
    };
    
    if(editID){
        await updateDoc(doc(db,"events",editID),newEvent);
        editID = null;
    }else{
        await addDoc(collection(db,"events"),newEvent);
    }
    form.reset();
    selectedDate=null;
    eventDetails.style.display="none";
    loadEvents();
});

// RENDER EVENTS
function renderEvents(){
    eventsContainer.innerHTML="";
    if(events.length===0){ eventsContainer.innerHTML=`<p>No events yet</p>`; return; }
    events.forEach((event)=>{
        eventsContainer.innerHTML += `
        <div class="event-card">
            <div class="event-header"><strong>${event.day} | ${event.time}</strong></div>
            <h3>${event.title}</h3>
            <p>${event.description || ""}</p>
            <div class="btn-group">
                <button onclick="editEvent('${event.id}')">Edit</button>
                <button onclick="deleteEvent('${event.id}')" class="delete">Delete</button>
            </div>
        </div>
        `;
    });
}

// ... (Rest of your existing functions: editEvent, deleteEvent, navigation, UI toggles remain unchanged) ...
// Ensure you keep your existing bottom functions for Logout, DarkMode, etc.

// EDIT EVENT
window.editEvent = function(id){
    const event = events.find(e=>e.id===id);
    editID = id;
    selectedDate = new Date(event.date);
    selectedDateText.textContent = event.date;
    timeSelect.value = event.time;
    titleSelect.value = event.title;
    document.getElementById("description").value = event.description;
    eventDetails.style.display="block";
}

// DELETE EVENT
window.deleteEvent = async function(id){
    if(confirm("Delete this event?")){
        await deleteDoc(doc(db,"events",id));
        loadEvents();
    }
}

// MONTH NAVIGATION
prevMonth.onclick = ()=>{
    currentDate.setMonth(currentDate.getMonth()-1);
    renderCalendar();
}

nextMonth.onclick = ()=>{
    currentDate.setMonth(currentDate.getMonth()+1);
    renderCalendar();
}

// START
loadEvents();

// Dropdown menu toggle
const menuToggle = document.getElementById("menuToggle");
const dropdownMenu = document.getElementById("dropdownMenu");
const darkModeToggle = document.getElementById("darkModeToggle");
let isDropdownOpen = false;

menuToggle.addEventListener('mouseenter', function() {
    if (!isDropdownOpen) {
        dropdownMenu.style.display = 'block';
    }
});

menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
    dropdownMenu.style.display = isDropdownOpen ? 'block' : 'none';
});

document.querySelector('.user-menu').addEventListener('mouseleave', function() {
    if (!isDropdownOpen) {
        dropdownMenu.style.display = 'none';
    }
});

document.addEventListener('click', function() {
    if (isDropdownOpen) {
        isDropdownOpen = false;
        dropdownMenu.style.display = 'none';
    }
});

// Dark mode toggle
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
}

darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        this.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        this.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
    }
});

// Custom time input
timeSelect.addEventListener('change', function() {
    if (this.value === 'custom') {
        customTimeInput.style.display = 'block';
        customTimeInput.required = true;
    } else {
        customTimeInput.style.display = 'none';
        customTimeInput.required = false;
        customTimeInput.value = '';
    }
});

// Custom event title input
titleSelect.addEventListener('change', function() {
    if (this.value === 'custom') {
        customTitleInput.style.display = 'block';
        customTitleInput.required = true;
    } else {
        customTitleInput.style.display = 'none';
        customTitleInput.required = false;
        customTitleInput.value = '';
    }
});

window.logout = function() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("isAdminLoggedIn");
        window.location.href = "LoginAdmin.html";
    }
}
