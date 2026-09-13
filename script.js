/*eslint-env browser */
/*jshint browser: true, devel: true, esversion: 6 */
/*global window, document, navigator, localStorage, Audio */

/* ==========================================================================
   INTERNSPACE AUDIO LAYER ENGINE
   ========================================================================== */

const audioTracks = {
    authAmbient: new Audio('audio/auth_ambient.mp3'),
    lampHum: new Audio('audio/lamp_hum.mp3'),
    switchClick: new Audio('audio/switch_click.mp3'),
    powerUp: new Audio('audio/power_up.mp3'),
    workspaceBeat: new Audio('audio/workspace_beat.mp3')
};

// Configure base track dimensions and loop permissions
audioTracks.authAmbient.loop = false;     
audioTracks.authAmbient.volume = 0.4;
audioTracks.lampHum.loop = true;          
audioTracks.lampHum.volume = 0.5;
audioTracks.workspaceBeat.loop = false;   
audioTracks.workspaceBeat.volume = 0.3;

// Clean event link definitions to avoid loose execution lines
audioTracks.authAmbient.onended = function() {
    audioTracks.workspaceBeat.play().catch(function() {});
};
audioTracks.workspaceBeat.onended = function() {
    audioTracks.authAmbient.play().catch(function() {});
};

/* ==========================================================================
   DRAGGABLE LIGHT SWITCH SEQUENCE (UNIFIED MOBILE TOUCH ENGINE)
   ========================================================================== */
function initSplashSequence() {
    const switchHandleNode = document.getElementById("switchNode");
    const switchCordLine = document.querySelector(".switch-line");
    const lightBulbNode = document.getElementById("lampBulb");
    const splashOverlayNode = document.getElementById("splashScreen");
    const actionableHintNode = document.getElementById("actionHint");

    if (!switchHandleNode || !switchCordLine) { return; }
    
    // Play hum sound safely on interaction baseline
    const startHum = function() {
        audioTracks.lampHum.play().catch(function() {});
    };
    window.addEventListener('click', startHum, { once: true });
    window.addEventListener('touchstart', startHum, { once: true });

    let trackingActiveDrag = false;
    let physicalStartY = 0;

    // Unified helper for extracting touch coordinates or mouse clicks
    function getClientY(e) {
        if (e.touches && e.touches.length > 0) {
            return e.touches.clientY;
        }
        return e.clientY;
    }

    function startDrag(e) {
        trackingActiveDrag = true;
        physicalStartY = getClientY(e);
        switchHandleNode.style.transition = "none";
        switchCordLine.style.transition = "none";
    }

    function doDrag(e) {
        if (!trackingActiveDrag) { return; }
        
        // CRITICAL FOR MOBILE: Block physical phone window pulling/scrolling
        if (e.cancelable) {
            e.preventDefault();
        }

        const dynamicCurrentY = getClientY(e);
        let dynamicDeltaY = dynamicCurrentY - physicalStartY;

        if (dynamicDeltaY < 0) { dynamicDeltaY = 0; }
        if (dynamicDeltaY > 45) { dynamicDeltaY = 45; }

        switchHandleNode.style.transform = "translateY(" + dynamicDeltaY + "px)";
        switchCordLine.style.height = (70 + dynamicDeltaY) + "px";

        if (dynamicDeltaY >= 45) {
            trackingActiveDrag = false;
            audioTracks.lampHum.pause();
            audioTracks.switchClick.play().catch(function() {});
            audioTracks.powerUp.play().catch(function() {});
            if (lightBulbNode) { lightBulbNode.classList.add("powered"); }
            if (actionableHintNode) { actionableHintNode.innerText = "⚡ System Active"; }

            setTimeout(function() { 
                if (splashOverlayNode) { splashOverlayNode.style.display = "none"; }
                audioTracks.authAmbient.play().catch(function() {});
            }, 600);
        }
    }

    function cancelDrag() {
        if (!trackingActiveDrag) { return; }
        trackingActiveDrag = false;
        switchHandleNode.style.transition = "transform 0.3s ease";
        switchCordLine.style.transition = "height 0.3s ease";
        switchHandleNode.style.transform = "translateY(0px)";
        switchCordLine.style.height = "70px";
    }

    // Laptop Mouse Bindings
    switchHandleNode.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", cancelDrag);

    // Mobile Phone Screen Touch Event Bindings
    switchHandleNode.addEventListener("touchstart", startDrag, { passive: false });
    window.addEventListener("touchmove", doDrag, { passive: false });
    window.addEventListener("touchend", cancelDrag, { passive: false });
}

/* ==========================================================================
   ONBOARDING COMPLIANCE ENGINE
   ========================================================================== */
function processMetrics(elements) {
    let positiveCalculatedTotalCounter = 0;
    elements.forEach(function(item) { if (item.checked) { positiveCalculatedTotalCounter++; } });
    const normalizedMetricsPercentageRatio = elements.length > 0 ? Math.round((positiveCalculatedTotalCounter / elements.length) * 100) : 0;
    
    const dynamicStatusBarNode = document.getElementById("onboardingProgress");
    const dynamicStatusTextFieldNode = document.getElementById("progressText");
    if (dynamicStatusBarNode) { dynamicStatusBarNode.style.width = normalizedMetricsPercentageRatio + "%"; }
    if (dynamicStatusTextFieldNode) { dynamicStatusTextFieldNode.innerText = normalizedMetricsPercentageRatio + "% Clearance Achieved"; }
}

function initDashboardHub(userName) {
    const dynamicGreetingFieldNode = document.getElementById("userGreeting");
    if (dynamicGreetingFieldNode) { dynamicGreetingFieldNode.innerText = userName || "Intern"; }
    
    const diagnosticProgressCheckboxesList = document.querySelectorAll(".onboard-check");
    const personalProgressKeyIdentifier = "onboard_" + userName;
    const dynamicLocalMetricsStateMap = JSON.parse(localStorage.getItem(personalProgressKeyIdentifier)) || {};

    diagnosticProgressCheckboxesList.forEach(function(box) {
        const metricUniqueId = box.getAttribute("data-id");
        if (dynamicLocalMetricsStateMap[metricUniqueId]) { box.checked = true; }

        box.addEventListener("change", function() {
            dynamicLocalMetricsStateMap[metricUniqueId] = this.checked;
            localStorage.setItem(personalProgressKeyIdentifier, JSON.stringify(dynamicLocalMetricsStateMap));
            processMetrics(diagnosticProgressCheckboxesList);
        });
    });
    processMetrics(diagnosticProgressCheckboxesList);
}

/* ==========================================================================
   AGILE SPRINT KANBAN ENGINE
   ========================================================================== */
function refreshKanbanBoard() {
    const targetTodoContainerNode = document.getElementById("todoContainer");
    const targetDoingContainerNode = document.getElementById("doingContainer");
    const targetDoneContainerNode = document.getElementById("doneContainer");
    if (!targetTodoContainerNode || !targetDoingContainerNode || !targetDoneContainerNode) { return; }

    targetTodoContainerNode.innerHTML = ""; 
    targetDoingContainerNode.innerHTML = ""; 
    targetDoneContainerNode.innerHTML = "";
    
    const currentActiveUserIdentifier = localStorage.getItem("loggedInUser");
    const globalKanbanMemoryArray = JSON.parse(localStorage.getItem("globalKanbanData")) || [];
    const userspaceFilteredTasksList = globalKanbanMemoryArray.filter(function(t) { return t && t.owner === currentActiveUserIdentifier; });

    userspaceFilteredTasksList.forEach(function(task) {
        const generatedTaskCardElement = document.createElement("div");
        generatedTaskCardElement.className = "task-card";
        
        const renderLeft = task.status !== 'todo' ? '<button type="button" class="workflow-nav-btn" onclick="window[\'executeTaskWorkflowMutation\'](\'' + task.id + '\', \'regress\')">◀ Move Left</button>' : '';
        const renderRight = task.status !== 'done' ? '<button type="button" class="workflow-nav-btn" onclick="window[\'executeTaskWorkflowMutation\'](\'' + task.id + '\', \'progress\')">Move Right ▶</button>' : '';
        
        generatedTaskCardElement.innerHTML = '<h4>' + task.title + '</h4>' +
            '<span class="priority-tag tag-' + task.priority + '">' + task.priority + ' Priority</span>' +
            '<div class="kanban-action-row-controls">' +
                renderLeft + renderRight +
                '<button type="button" class="task-delete-btn" onclick="window[\'removeTaskItemFromMemoryStorage\'](\'' + task.id + '\')">🗑 Clear</button>' +
            '</div>';

        if (task.status === "todo") { targetTodoContainerNode.appendChild(generatedTaskCardElement); }
        if (task.status === "doing") { targetDoingContainerNode.appendChild(generatedTaskCardElement); }
        if (task.status === "done") { targetDoneContainerNode.appendChild(generatedTaskCardElement); }
    });
}

/* ==========================================================================
   GLOBAL SUBMISSION CENTRAL DELEGATION
   ========================================================================== */
function handleGlobalSubmissions(e) {
    const targetId = e.target.id;

    // 1. GATEWAY USER REGISTRATION SECURITY MASK (REAL EMAIL ENFORCED)
    if (targetId === "registerForm") {
        e.preventDefault();
        const accountName = document.getElementById("regName").value;
        const accountEmail = document.getElementById("regEmail").value.trim();
        const accountPassword = document.getElementById("regPassword").value;

        const emailCryptoMaskMatcher = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailCryptoMaskMatcher.test(accountEmail)) {
alert("Security alert: Please key in a fully valid, real email framework (e.g. user@domain.com).");return;}const regRegistry = JSON.parse(localStorage.getItem("internspaceUsers")) || [];if (regRegistry.some(function(u) { return u.email === accountEmail; })) {alert("This email address is already stored inside the registry system.");return;}regRegistry.push({ name: accountName, email: accountEmail, password: accountPassword });localStorage.setItem("internspaceUsers", JSON.stringify(regRegistry));alert("Security Profile Created! Transitioning straight to log in fields.");if(document.getElementById("registerView")) { document.getElementById("registerView").style.display = "none"; }if(document.getElementById("loginView")) { document.getElementById("loginView").style.display = "block"; }}// 2. LOG IN AUTHENTICATION ROUTINEif (targetId === "loginForm") {e.preventDefault();const emailInput = document.getElementById("loginEmail").value.trim();const passwordInput = document.getElementById("loginPassword").value;const errDisplay = document.getElementById("loginError");const loginRegistry = JSON.parse(localStorage.getItem("internspaceUsers")) || [];const matchedUser = loginRegistry.find(function(u) { return u.email === emailInput && u.password === passwordInput; });if (matchedUser) {audioTracks.authAmbient.pause();localStorage.setItem("loggedInUser", matchedUser.name);window.location.href = "./dashboard.html";} else {if (errDisplay) { errDisplay.style.display = "block"; }}}// 3. KANBAN TASK OBJECTIVE INJECTIONif (targetId === "kanbanForm") {e.preventDefault();const titleField = document.getElementById("taskTitle");const priorityField = document.getElementById("taskPriority");if (!titleField || !priorityField) { return; }const dynamicTaskTitleString = titleField.value;const dynamicTaskPriorityLevelString = priorityField.value;const dynamicTaskGeneratedUniqueId = "sprint_" + Date.now();const freshSprintTaskItemObject = { id: dynamicTaskGeneratedUniqueId, title: dynamicTaskTitleString, priority: dynamicTaskPriorityLevelString, status: "todo", owner: localStorage.getItem("loggedInUser") };const globalKanbanMemoryArray = JSON.parse(localStorage.getItem("globalKanbanData")) || [];globalKanbanMemoryArray.push(freshSprintTaskItemObject);localStorage.setItem("globalKanbanData", JSON.stringify(globalKanbanMemoryArray));e.target.reset();refreshKanbanBoard();}}/* ==========================================================================GLOBAL CLICK INTERCEPTOR DELEGATION========================================================================== */function handleGlobalClicks(e) {// A. EXPLICIT INTERCEPTOR FOR REGISTRATION FORM LAYER TOGGLE LINKSif (e.target.matches("a[href='#register']") || e.target.id === "forgotPasswordLink") {e.preventDefault();if(document.getElementById("loginView")) { document.getElementById("loginView").style.display = "none"; }if(document.getElementById("registerView")) { document.getElementById("registerView").style.display = "block"; }}// B. EXPLICIT INTERCEPTOR FOR RETURNING TO LOGIN FROM REGISTRATION LAYERif (e.target.matches("a[href='#login']") || e.target.id === "backToLoginLink") {e.preventDefault();if(document.getElementById("registerView")) { document.getElementById("registerView").style.display = "none"; }if(document.getElementById("loginView")) { document.getElementById("loginView").style.display = "block"; }}// C. CENTRAL SIGN-OUT INTERCEPTOR (WORKS ON ALL INTERACTIVE SUB-PAGES)if (e.target.id === "logoutBtn" || e.target.classList.contains("logout-action-btn")) {e.preventDefault();audioTracks.workspaceBeat.pause();audioTracks.authAmbient.pause();localStorage.removeItem("loggedInUser");window.location.href = "./index.html";}}/* ==========================================================================TEMPLATED KANBAN ACTION LAYER MODULE FUNCTIONS========================================================================== */function switchWorkspaceView(targetViewString) {const onboardingPanel = document.getElementById("onboardingSection");const kanbanPanel = document.getElementById("kanbanSection");if (!onboardingPanel || !kanbanPanel) { return; }if (targetViewString === 'onboarding') {kanbanPanel.style.display = "none";onboardingPanel.style.display = "block";} else if (targetViewString === 'kanban') {onboardingPanel.style.display = "none";kanbanPanel.style.display = "block";refreshKanbanBoard();}}function executeTaskWorkflowMutation(taskId, workflowDirectionString) {let globalKanbanMemoryArray = JSON.parse(localStorage.getItem("globalKanbanData")) || [];const workflowStagesMapSequence = ["todo", "doing", "done"];globalKanbanMemoryArray = globalKanbanMemoryArray.map(function(t) {if (t && t.id === taskId) {let currentStagePointerIndex = workflowStagesMapSequence.indexOf(t.status);if (workflowDirectionString === "progress" && currentStagePointerIndex < 2) { currentStagePointerIndex++; }if (workflowDirectionString === "regress" && currentStagePointerIndex > 0) { currentStagePointerIndex--; }t.status = workflowStagesMapSequence[currentStagePointerIndex];}return t;});localStorage.setItem("globalKanbanData", JSON.stringify(globalKanbanMemoryArray));refreshKanbanBoard();}function removeTaskItemFromMemoryStorage(taskId) {let globalKanbanMemoryArray = JSON.parse(localStorage.getItem("globalKanbanData")) || [];globalKanbanMemoryArray = globalKanbanMemoryArray.filter(function(item) { return item && item.id !== taskId; });localStorage.setItem("globalKanbanData", JSON.stringify(globalKanbanMemoryArray));refreshKanbanBoard();}/* ==========================================================================CENTRAL LIFE CYCLE ROUTER INTERACTION SYSTEM========================================================================== */function initApplicationRuntimeCore() {window.switchWorkspaceView = switchWorkspaceView;window.executeTaskWorkflowMutation = executeTaskWorkflowMutation;window.removeTaskItemFromMemoryStorage = removeTaskItemFromMemoryStorage;const authenticatedUser = localStorage.getItem("loggedInUser");const checkGatewayLoginPage = document.getElementById("loginForm") !== null;const checkInternalDashboardPage = document.getElementById("onboardingProgress") !== null;if (!authenticatedUser && checkInternalDashboardPage) {window.location.href = "./index.html";return;}if (authenticatedUser && checkGatewayLoginPage) {window.location.href = "./dashboard.html";return;}if (checkGatewayLoginPage) {const startAmbient = function() {if (audioTracks.authAmbient.paused && audioTracks.workspaceBeat.paused) {audioTracks.authAmbient.play().catch(function() {});}};window.addEventListener('click', startAmbient, { once: true });const splashScreen = document.getElementById("splashScreen");if (splashScreen && !authenticatedUser) {initSplashSequence();}} else if (checkInternalDashboardPage) {if (audioTracks.workspaceBeat.paused) {audioTracks.authAmbient.pause();audioTracks.workspaceBeat.play().catch(function() {window.addEventListener('click', function() {if(audioTracks.workspaceBeat.paused) { audioTracks.workspaceBeat.play().catch(function() {}); }}, { once: true });});}initDashboardHub(authenticatedUser);refreshKanbanBoard();}// Safely link structural handlers inside execution payload boundariesdocument.addEventListener("submit", handleGlobalSubmissions);document.addEventListener("click", handleGlobalClicks);if ('serviceWorker' in navigator) {navigator.serviceWorker.register('./sw.js').catch(function() {});}}// Map the master application engine sequence safely to clear all file constraintsdocument.addEventListener("DOMContentLoaded", initApplicationRuntimeCore);