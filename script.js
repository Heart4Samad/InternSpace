const sounds = {
    authAmbient: new Audio('audio/auth_ambient.mp3'),
    lampHum: new Audio('audio/lamp_hum.mp3'),
    switchClick: new Audio('audio/switch_click.mp3'),
    powerUp: new Audio('audio/power_up.mp3'),
    workspaceBeat: new Audio('audio/workspace_beat.mp3')
};

sounds.authAmbient.loop = true; sounds.authAmbient.volume = 0.4;
sounds.lampHum.loop = true; sounds.lampHum.volume = 0.5;
sounds.workspaceBeat.loop = true; sounds.workspaceBeat.volume = 0.3;

document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes("index.html") || currentPath.includes("register.html") || currentPath === "/" || currentPath.endsWith("/");
    const activeSession = localStorage.getItem("loggedInUser");

    if (!activeSession && !isAuthPage) {
        window.location.href = "index.html"; 
        return;
    }

    if (document.getElementById("splashScreen")) {
        initSplashSequence();
    } else if (isAuthPage) {
        window.addEventListener('click', () => { sounds.authAmbient.play().catch(()=>{}); }, { once: true });
    } else {
        window.addEventListener('click', () => { sounds.workspaceBeat.play().catch(()=>{}); }, { once: true });
        sounds.workspaceBeat.play().catch(() => {});
    }

    if (document.getElementById("registerForm")) initRegisterLogic();
    if (document.getElementById("loginForm")) initLoginLogic();
    if (document.getElementById("onboardingProgress")) initDashboardHub(activeSession);
    if (document.getElementById("kanbanForm")) initKanbanSystem();

    const logoutBtn = document.getElementById("logoutBtn") || document.getElementById("logoutBtn2");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            localStorage.removeItem("loggedInUser");
            window.location.href = "index.html";
        });
    }
});

function initSplashSequence() {
    const splash = document.getElementById("splashScreen");
    const bulb = document.getElementById("lampBulb");
    const switchNode = document.getElementById("switchNode");
    const switchLine = document.querySelector(".switch-line");
    const hint = document.getElementById("actionHint");

    if (!splash) return;
    sounds.lampHum.play().catch(()=>{});

    let isDragging = false;
    let startY = 0;
    const maxDragDistance = 45;

    const startDrag = (e) => {
        isDragging = true;
        startY = e.clientY || e.touches.clientY;
        switchNode.style.transition = "none";
        switchLine.style.transition = "none";
        sounds.lampHum.play().catch(()=>{});
    };

    const doDrag = (e) => {
        if (!isDragging) return;
        const currentY = e.clientY || e.touches.clientY;
        let deltaY = currentY - startY;

        if (deltaY < 0) deltaY = 0;
        if (deltaY > maxDragDistance) deltaY = maxDragDistance;

        switchNode.style.transform = `translateY(${deltaY}px)`;
        switchLine.style.height = (70 + deltaY) + "px";

        if (deltaY >= maxDragDistance) triggerSystemPowerOn();
    };

    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        switchNode.style.transition = "transform 0.3s ease";
        switchLine.style.transition = "height 0.3s ease";
        switchNode.style.transform = "translateY(0px)";
        switchLine.style.height = "70px";
    };

    function triggerSystemPowerOn() {
        isDragging = false;
        switchNode.removeEventListener("mousedown", startDrag);
        window.removeEventListener("mousemove", doDrag);
        window.removeEventListener("mouseup", stopDrag);
        switchNode.removeEventListener("touchstart", startDrag);
        window.removeEventListener("touchmove", doDrag);
        window.removeEventListener("touchend", stopDrag);

        sounds.lampHum.pause();
        sounds.switchClick.play().catch(()=>{});
        sounds.powerUp.play().catch(()=>{});

        bulb.classList.add("powered");
        hint.innerText = "⚡ Workspace Authenticated";
        hint.style.color = "var(--gold-bright)";

        setTimeout(() => { 
            splash.classList.add("system-ready");
            sounds.authAmbient.play().catch(()=>{});
        }, 800);
    }

    switchNode.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", stopDrag);
    switchNode.addEventListener("touchstart", startDrag, { passive: true });
    window.addEventListener("touchmove", doDrag, { passive: true });
    window.addEventListener("touchend", stopDrag);
}

function initRegisterLogic() {
    document.getElementById("registerForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("regName").value;
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;

        let userDb = JSON.parse(localStorage.getItem("internspaceUsers")) || [];
        if (userDb.some(user => user.email === email)) {
            alert("This corporate email profile address has already been registered!");
            return;
        }

        userDb.push({ name, email, password });
        localStorage.setItem("internspaceUsers", JSON.stringify(userDb));
        alert("Account initialized successfully! Proceeding to signature clearance gate.");
        window.location.href = "index.html";
    });
}

function initLoginLogic() {
    document.getElementById("loginForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        const errBox = document.getElementById("loginError");

        let userDb = JSON.parse(localStorage.getItem("internspaceUsers")) || [];
        const targetedUser = userDb.find(user => user.email === email && user.password === password);

        if (targetedUser) {
            sounds.authAmbient.pause();
            localStorage.setItem("loggedInUser", targetedUser.name);
            window.location.href = "dashboard.html";
        } else {
            errBox.style.display = "block";
        }
    });
}

function initDashboardHub(userName) {
    document.getElementById("userGreeting").innerText = userName;
    const checkboxes = document.querySelectorAll(".onboard-check");

    let progressKey = "onboard_" + userName;
    let localMemoryState = JSON.parse(localStorage.getItem(progressKey)) || {};

    checkboxes.forEach(box => {
        const id = box.getAttribute("data-id");
        if (localMemoryState[id]) box.checked = true;

        box.addEventListener("change", function() {
            localMemoryState[id] = this.checked;
            localStorage.setItem(progressKey, JSON.stringify(localMemoryState));
            processMetrics(checkboxes);
        });
    });

    processMetrics(checkboxes);
}

function processMetrics(elements) {
    let checkedTotal = 0;
    elements.forEach(item => { if (item.checked) checkedTotal++; });
    const calculatedRatio = elements.length > 0 ? Math.round((checkedTotal / elements.length) * 100) : 0;
    document.getElementById("onboardingProgress").style.width = calculatedRatio + "%";
    document.getElementById("progressText").innerText = calculatedRatio + "% Compliance Clearance Achieved";
}

function initKanbanSystem() {
    const kanbanForm = document.getElementById("kanbanForm");
    kanbanForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const title = document.getElementById("taskTitle").value;
        const priority = document.getElementById("taskPriority").value;
        const id = "sprint_" + Date.now();

        const taskItem = { id, title, priority, status: "todo", owner: localStorage.getItem("loggedInUser") };
        let taskStack = JSON.parse(localStorage.getItem("globalKanbanData")) || [];
        taskStack.push(taskItem);
        localStorage.setItem("globalKanbanData", JSON.stringify(taskStack));

        kanbanForm.reset();
        refreshKanbanBoard();
    });

    refreshKanbanBoard();
}

function refreshKanbanBoard() {
    const todoBox = document.getElementById("todoContainer");
    const doingBox = document.getElementById("doingContainer");
    const doneBox = document.getElementById("doneContainer");

    if (!todoBox || !doingBox || !doneBox) return;

    todoBox.innerHTML = ""; doingBox.innerHTML = ""; doneBox.innerHTML = "";
    const currentActiveUser = localStorage.getItem("loggedInUser");
    let masterList = JSON.parse(localStorage.getItem("globalKanbanData")) || [];
    
    let userspaceTasks = masterList.filter(task => task && task.owner === currentActiveUser);

    userspaceTasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.innerHTML = `
            <h4>${task.title}</h4>
            <span class="priority-tag tag-${task.priority}">${task.priority}</span>
            <div class="kanban-actions">
                ${task.status !== 'todo' ? `<button class="btn-action" onclick="mutateTaskState('${task.id}', 'regress')">◀</button>` : ''}
                ${task.status !== 'done' ? `<button class="btn-action" onclick="mutateTaskState('${task.id}', 'progress')">▶</button>` : ''}
                <button class="btn-action btn-delete" onclick="dropTaskItem('${task.id}')">🗑</button>
            </div>
        `;
        if (task.status === "todo") todoBox.appendChild(card);
        if (task.status === "doing") doingBox.appendChild(card);
        if (task.status === "done") doneBox.appendChild(card);
    });
}

window.mutateTaskState = function(taskId, workflowDirection) {
    let database = JSON.parse(localStorage.getItem("globalKanbanData")) || [];
    const sequenceMap = ["todo", "doing", "done"];

database = database.map(task => {if (task && task.id === taskId) {let pointer = sequenceMap.indexOf(task.status);if (workflowDirection === "progress" && pointer < 2) pointer++;if (workflowDirection === "regress" && pointer > 0) pointer--;task.status = sequenceMap[pointer];}return task;});localStorage.setItem("globalKanbanData", JSON.stringify(database));refreshKanbanBoard();};window.dropTaskItem = function(taskId) {let dataset = JSON.parse(localStorage.getItem("globalKanbanData")) || [];dataset = dataset.filter(item => item && item.id !== taskId);localStorage.setItem("globalKanbanData", JSON.stringify(dataset));refreshKanbanBoard();};/* ==========================================================================PROGRESSIVE WEB APP (PWA) OFFLINE REGISTRATION CORE========================================================================== */if ('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('./sw.js').then((registration) => {console.log('PWA: Service Worker registered successfully under scope:', registration.scope);}).catch((error) => {console.log('PWA: Service Worker registration failed:', error);});});}