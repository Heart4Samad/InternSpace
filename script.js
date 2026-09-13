// 1. CHOOSE THE MUSIC TRACKS
const sounds = {
    authAmbient: new Audio('audio/auth_ambient.mp3'),
    lampHum: new Audio('audio/lamp_hum.mp3'),
    switchClick: new Audio('audio/switch_click.mp3'),
    powerUp: new Audio('audio/power_up.mp3'),
    workspaceBeat: new Audio('audio/workspace_beat.mp3')
};
sounds.authAmbient.loop = true;
sounds.lampHum.loop = true;
sounds.workspaceBeat.loop = true;

let deferredPrompt;

// 2. CHOOSE THE AUTOMATIC PAGE RULES
document.addEventListener("DOMContentLoaded", function() {
    const user = localStorage.getItem("loggedInUser");
    
    // Check exactly what page the user is currently looking at
    const isLogin = document.getElementById("loginForm") !== null;
    const isRegister = document.getElementById("registerForm") !== null;
    const isDashboard = document.getElementById("onboardingProgress") !== null;
    const isKanban = document.getElementById("kanbanForm") !== null;

    // RULE A: If a stranger tries to open dashboard or kanban, take them to login page
    if (!user && (isDashboard || isKanban)) {
        window.location.href = "index.html";
        return;
    }

    // RULE B: If a user is already logged in, take them straight to dashboard (SKIP THE LAMP!)
    if (user && (isLogin || isRegister)) {
        window.location.href = "dashboard.html";
        return;
    }

    // RULE C: Hide the dark lamp screen automatically if the user is already logged in
    const splash = document.getElementById("splashScreen");
    if (splash) {
        if (user) {
            splash.style.display = "none";
        } else {
            initSplashSequence(); // Start the lamp switch for new loggers
        }
    }

    // RULE D: Play music safely
    if (isLogin || isRegister) {
        window.addEventListener('click', () => { sounds.authAmbient.play().catch(()=>{}); }, { once: true });
    } else {
        window.addEventListener('click', () => { sounds.workspaceBeat.play().catch(()=>{}); }, { once: true });
        sounds.workspaceBeat.play().catch(() => {});
    }

    // Initialize individual page systems safely
    if (isRegister) initRegisterLogic();
    if (isLogin) {
        initLoginLogic();
        initForgotPasswordViews();
    }
    if (isDashboard) initDashboardHub(user);
    if (isKanban) initKanbanSystem();

    // Sign Out Button Action
    const logoutBtn = document.getElementById("logoutBtn") || document.getElementById("logoutBtn2");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            sounds.workspaceBeat.pause();
            localStorage.removeItem("loggedInUser");
            window.location.href = "index.html";
        });
    }
});

// 3. SIMPLE LIGHT SWITCH DRAG CODE (WORKS PERFECTLY ON PHONES AND LAPTOPS)
function initSplashSequence() {
    const splash = document.getElementById("splashScreen");
    const bulb = document.getElementById("lampBulb");
    const switchNode = document.getElementById("switchNode");
    const switchLine = document.querySelector(".switch-line");
    const hint = document.getElementById("actionHint");

    if (!splash) return;
    window.addEventListener('click', () => { sounds.lampHum.play().catch(()=>{}); }, { once: true });

    let isDragging = false;
    let startY = 0;

    const startDrag = (e) => {
        isDragging = true;
        startY = e.clientY || (e.touches && e.touches[0].clientY);
        switchNode.style.transition = "none";
        switchLine.style.transition = "none";
    };

    const doDrag = (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault(); // Stops mobile screen from breaking

        const currentY = e.clientY || (e.touches && e.touches[0].clientY);
        let deltaY = currentY - startY;

        if (deltaY < 0) deltaY = 0;
        if (deltaY > 45) deltaY = 45; // Move limit

        switchNode.style.transform = `translateY(${deltaY}px)`;
        switchLine.style.height = (70 + deltaY) + "px";

        if (deltaY >= 45) {
            isDragging = false;
            sounds.lampHum.pause();
            sounds.switchClick.play().catch(()=>{});
            sounds.powerUp.play().catch(()=>{});
            bulb.classList.add("powered");
            hint.innerText = "⚡ System Active";

            setTimeout(() => { 
                splash.classList.add("system-ready");
                sounds.authAmbient.play().catch(()=>{});
            }, 600);
        }
    };

    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        switchNode.style.transition = "transform 0.3s ease";
        switchLine.style.transition = "height 0.3s ease";
        switchNode.style.transform = "translateY(0px)";
        switchLine.style.height = "70px";
    };

    switchNode.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", stopDrag);
    switchNode.addEventListener("touchstart", startDrag, { passive: false });
    window.addEventListener("touchmove", doDrag, { passive: false });
    window.addEventListener("touchend", stopDrag);
}

// 4. FORGOT PASSWORD TOGGLE VISIBILITY
function initForgotPasswordViews() {
    const loginView = document.getElementById("loginView");
    const resetView = document.getElementById("resetView");
    const forgotLink = document.getElementById("forgotPasswordLink");
    const backLink = document.getElementById("backToLoginLink");
    const resetForm = document.getElementById("forgotPasswordForm");
    const loginEmailField = document.getElementById("loginEmail");

    const savedEmail = localStorage.getItem("savedRememberEmail");
    if (savedEmail && loginEmailField) {
        loginEmailField.value = savedEmail;
        if (document.getElementById("rememberMeLogin")) document.getElementById("rememberMeLogin").checked = true;
    }

    forgotLink.addEventListener("click", function(e) {
        e.preventDefault();
        loginView.style.display = "none";
        resetView.style.display = "block";
    });

    backLink.addEventListener("click", function(e) {
        e.preventDefault();
        resetView.style.display = "none";
        loginView.style.display = "block";
    });

    resetForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const email = document.getElementById("resetEmail").value;
        const newPass = document.getElementById("newPassword").value;

        let userDb = JSON.parse(localStorage.getItem("internspaceUsers")) || [];
        let userIndex = userDb.findIndex(user => user.email === email);

        if (userIndex !== -1) {
            userDb[userIndex].password = newPass;
            localStorage.setItem("internspaceUsers", JSON.stringify(userDb));
            alert("Password Reset Successful! Try logging in now.");
            resetForm.reset();
            backLink.click();
        } else {
            alert("Email not found in our system!");
        }
    });
}

// 5. REGISTRATION FUNCTION
function initRegisterLogic() {
    const regEmailField = document.getElementById("regEmail");
    const savedEmail = localStorage.getItem("savedRememberEmail");
    if (savedEmail && regEmailField) {
        regEmailField.value = savedEmail;
        if (document.getElementById("rememberMeReg")) document.getElementById("rememberMeReg").checked = true;
    }

    document.getElementById("registerForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("regName").value;
        const email = regEmailField.value;
        const password = document.getElementById("regPassword").value;
        const rememberChecked = document.getElementById("rememberMeReg").checked;

        let userDb = JSON.parse(localStorage.getItem("internspaceUsers")) || [];
        if (userDb.some(u => u.email === email)) {
            alert("Email already registered!");
            return;
        }

        userDb.push({ name, email, password });
        localStorage.setItem("internspaceUsers", JSON.stringify(userDb));

        if (rememberChecked) {
            localStorage.setItem("savedRememberEmail", email);
        } else {
            localStorage.removeItem("savedRememberEmail");
        }

        alert("Account Created! Redirecting to login.");
        window.location.href = "index.html";
    });
}

// 6. LOGIN FUNCTION
function initLoginLogic() {
    document.getElementById("loginForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        const rememberChecked = document.getElementById("rememberMeLogin").checked;
        const errBox = document.getElementById("loginError");

        let userDb = JSON.parse(localStorage.getItem("internspaceUsers")) || [];
        const foundUser = userDb.find(u => u.email === email && u.password === password);

        if (foundUser) {
            sounds.authAmbient.pause();
            localStorage.setItem("loggedInUser", foundUser.name);

            if (rememberChecked) {
                localStorage.setItem("savedRememberEmail", email);
            } else {
                localStorage.removeItem("savedRememberEmail");
            }

            window.location.href = "dashboard.html";
        } else {
            errBox.style.display = "block";
        }
    });
}

// 7. DASHBOARD LOGIC
function initDashboardHub(userName) {
    document.getElementById("userGreeting").innerText = userName;
    const checkboxes = document.querySelectorAll(".onboard-check");
    let progressKey = "onboard_" + userName;
    let localMemoryState = JSON.parse(localStorage.getItem(progressKey)) || {};

    checkboxes.forEach(box => {
        const id = box.getAttribute("data-id");
if (localMemoryState[id]) box.checked = true;box.addEventListener("change", function() {localMemoryState[id] = this.checked;localStorage.setItem(progressKey, JSON.stringify(localMemoryState));processMetrics(checkboxes);});});processMetrics(checkboxes);}function processMetrics(elements) {let checkedTotal = 0;elements.forEach(item => { if (item.checked) checkedTotal++; });const calculatedRatio = elements.length > 0 ? Math.round((checkedTotal / elements.length) * 100) : 0;document.getElementById("onboardingProgress").style.width = calculatedRatio + "%";document.getElementById("progressText").innerText = calculatedRatio + "% Clearance Achieved";}// 8. KANBAN TASK ENGINEfunction initKanbanSystem() {const kanbanForm = document.getElementById("kanbanForm");kanbanForm.addEventListener("submit", function(e) {e.preventDefault();const title = document.getElementById("taskTitle").value;const priority = document.getElementById("taskPriority").value;const id = "sprint_" + Date.now();const taskItem = { id, title, priority, status: "todo", owner: localStorage.getItem("loggedInUser") };let taskStack = JSON.parse(localStorage.getItem("globalKanbanData")) || [];taskStack.push(taskItem);localStorage.setItem("globalKanbanData", JSON.stringify(taskStack));kanbanForm.reset();refreshKanbanBoard();});refreshKanbanBoard();}function refreshKanbanBoard() {const todoBox = document.getElementById("todoContainer");const doingBox = document.getElementById("doingContainer");const doneBox = document.getElementById("doneContainer");if (!todoBox || !doingBox || !doneBox) return;todoBox.innerHTML = ""; doingBox.innerHTML = ""; doneBox.innerHTML = "";const activeUser = localStorage.getItem("loggedInUser");let masterList = JSON.parse(localStorage.getItem("globalKanbanData")) || [];let myTasks = masterList.filter(t => t && t.owner === activeUser);myTasks.forEach(task => {const card = document.createElement("div");card.className = "task-card";card.innerHTML = <h4>${task.title}</h4> <span class="priority-tag tag-${task.priority}">${task.priority}</span> <div class="kanban-actions"> ${task.status !== 'todo' ?◀: ''} ${task.status !== 'done' ?▶: ''} <button class="btn-action btn-delete" onclick="dropTaskItem('${task.id}')">🗑</button> </div>;if (task.status === "todo") todoBox.appendChild(card);if (task.status === "doing") doingBox.appendChild(card);if (task.status === "done") doneBox.appendChild(card);});}window.mutateTaskState = function(taskId, dir) {let db = JSON.parse(localStorage.getItem("globalKanbanData")) || [];const steps = ["todo", "doing", "done"];db = db.map(t => {if (t && t.id === taskId) {let p = steps.indexOf(t.status);if (dir === "progress" && p < 2) p++;if (dir === "regress" && p > 0) p--;t.status = steps[p];}return t;});localStorage.setItem("globalKanbanData", JSON.stringify(db));refreshKanbanBoard();};window.dropTaskItem = function(taskId) {let db = JSON.parse(localStorage.getItem("globalKanbanData")) || [];db = db.filter(item => item && item.id !== taskId);localStorage.setItem("globalKanbanData", JSON.stringify(db));refreshKanbanBoard();};// 9. SERVICE WORKER REGISTRATION (OFFLINE SUPPORT)if ('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('./sw.js').catch(()=>{});});}window.addEventListener('beforeinstallprompt', (e) => {e.preventDefault(); deferredPrompt = e;});window.triggerPWAInstall = function() {if (!deferredPrompt) {alert('To install: Open your phone browser settings menu and click "Add to Home Screen"');return;}deferredPrompt.prompt();};