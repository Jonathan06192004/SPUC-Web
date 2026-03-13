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

let currentDate = new Date(2026, 2, 12);
let selectedDate = new Date(2026, 2, 12);

const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const dayNames = ["SUN", "MON", "TUES", "WED", "THU", "FRI", "SAT"];

function updateMonthDisplay() {
    const months = [];
    for (let i = -2; i <= 2; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        const monthName = monthNames[date.getMonth()];
        const year = date.getFullYear();
        months.push({ name: monthName, year: year, offset: i });
    }

    const monthNav = document.querySelector('.month-nav');
    monthNav.innerHTML = '';

    // First month (2 months before)
    const span1 = document.createElement('span');
    span1.className = 'month-label';
    span1.textContent = months[0].name;
    monthNav.appendChild(span1);

    // Second month (1 month before)
    const span2 = document.createElement('span');
    span2.className = 'month-label';
    span2.textContent = months[1].name;
    monthNav.appendChild(span2);

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'nav-btn prev';
    prevBtn.textContent = '<';
    prevBtn.type = 'button';
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(currentDate);
        updateMonthDisplay();
    });
    monthNav.appendChild(prevBtn);

    // Current month
    const currentSpan = document.createElement('h3');
    currentSpan.className = 'current-month';
    currentSpan.id = 'currentMonth';
    currentSpan.textContent = `${months[2].name} ${months[2].year}`;
    monthNav.appendChild(currentSpan);

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'nav-btn next';
    nextBtn.textContent = '>';
    nextBtn.type = 'button';
    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate);
        updateMonthDisplay();
    });
    monthNav.appendChild(nextBtn);

    // Fourth month (1 month after)
    const span4 = document.createElement('span');
    span4.className = 'month-label';
    span4.textContent = months[3].name;
    monthNav.appendChild(span4);

    // Fifth month (2 months after)
    const span5 = document.createElement('span');
    span5.className = 'month-label';
    span5.textContent = months[4].name;
    monthNav.appendChild(span5);
}

function generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarDates = document.getElementById('calendarDates');
    calendarDates.innerHTML = '';
    
    for (let i = firstDay - 1; i >= 0; i--) {
        const btn = document.createElement('button');
        btn.className = 'date-btn other-month';
        btn.textContent = daysInPrevMonth - i;
        btn.disabled = true;
        calendarDates.appendChild(btn);
    }
    
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

generateCalendar(currentDate);
updateMonthDisplay();
updateFormDate();
loadTimeSlots();
loadPrograms();
