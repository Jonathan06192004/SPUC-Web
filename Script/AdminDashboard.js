import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

let currentDate = new Date(2026, 2, 12); // March 12, 2026
let selectedDate = new Date(2026, 2, 12);

const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const dayNames = ["SUN", "MON", "TUES", "WED", "THU", "FRI", "SAT"];

function generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarDates = document.getElementById('calendarDates');
    calendarDates.innerHTML = '';
    
    // Previous month dates
    for (let i = firstDay - 1; i >= 0; i--) {
        const btn = document.createElement('button');
        btn.className = 'date-btn other-month';
        btn.textContent = daysInPrevMonth - i;
        btn.disabled = true;
        calendarDates.appendChild(btn);
    }
    
    // Current month dates
    for (let day = 1; day <= daysInMonth; day++) {
        const btn = document.createElement('button');
        btn.className = 'date-btn';
        btn.textContent = day;
        btn.type = 'button';
        
        const btnDate = new Date(year, month, day);
        if (btnDate.toDateString() === selectedDate.toDateString()) {
            btn.classList.add('selected');
        }
        
        btn.addEventListener('click', () => selectDate(btnDate));
        calendarDates.appendChild(btn);
    }
    
    // Next month dates
    const totalCells = calendarDates.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const btn = document.createElement('button');
        btn.className = 'date-btn other-month';
        btn.textContent = day;
        btn.disabled = true;
        calendarDates.appendChild(btn);
    }
}

function selectDate(date) {
    selectedDate = new Date(date);
    generateCalendar(currentDate);
    updateFormDate();
    loadTimeSlots();
}

function updateFormDate() {
    const dayName = dayNames[selectedDate.getDay()];
    const monthName = monthNames[selectedDate.getMonth()];
    const day = selectedDate.getDate();
    const year = selectedDate.getFullYear();
    
    document.getElementById('selectedDate').textContent = `${dayName} ${monthName} ${day}, ${year}`;
}

async function loadTimeSlots() {
    const timeSlotSelect = document.getElementById('timeSlot');
    timeSlotSelect.innerHTML = '<option value="">Choose time slot</option>';
    
    try {
        const snapshot = await getDocs(collection(db, "timeSlots"));
        snapshot.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.data().time;
            option.textContent = doc.data().time;
            timeSlotSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading time slots:", error);
    }
}

async function loadPrograms() {
    const programSelect = document.getElementById('program');
    programSelect.innerHTML = '<option value="">Choose the program</option>';
    
    try {
        const snapshot = await getDocs(collection(db, "programs"));
        snapshot.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.data().name;
            option.textContent = doc.data().name;
            programSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading programs:", error);
    }
}

document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const timeSlot = document.getElementById('timeSlot').value;
    const program = document.getElementById('program').value;
    const description = document.getElementById('description').value;
    
    if (!timeSlot || !program) {
        alert('Please select both time slot and program');
        return;
    }
    
    try {
        await addDoc(collection(db, "events"), {
            date: selectedDate.toDateString(),
            time: timeSlot,
            programName: program,
            description: description
        });
        
        alert('Event added successfully!');
        document.getElementById('eventForm').reset();
    } catch (error) {
        console.error("Error adding event:", error);
        alert('Error adding event');
    }
});

document.querySelector('.nav-btn.prev').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
});

document.querySelector('.nav-btn.next').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
});

// Initialize
generateCalendar(currentDate);
updateFormDate();
loadTimeSlots();
loadPrograms();
