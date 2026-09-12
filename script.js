/* ==========================================================================
   INTERNSPACE AUDIO LAYER ENGINE
   ========================================================================== */

var audioTracks = {
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

var systemInstallationPrompt = null;

// Fixed Audio Queue Management Layer Core
audioTracks.authAmbient.addEventListener('ended', function() {
    audioTracks.workspaceBeat.play().catch(function() {});
});
audioTracks.workspaceBeat.addEventListener('ended', function() {
    audioTracks.authAmbient.play().catch(function() {});
});

/* ==========================================================================
   DRAGGABLE LIGHT SWITCH SEQUENCE 
   ========================================================================== */
function initSplashSequence() {
    var switchHandleNode = document.getElementById("switchNode");
    var switchCordLine = document.querySelector(".switch-line");
    var lightBulbNode = document.getElementById("lampBulb");
    var splashOverlayNode = document.getElementById("splashScreen");
    var actionableHintNode = document.getElementById("actionHint");

    if (!switchHandleNode || !switchCordLine) return;
    window.addEventListener('click', function() { audioTracks.lampHum.play().catch(function() {}); }, { once: true });

    var trackingActiveDrag = false;
    var physicalStartY = 0;

    switchHandleNode.addEventListener("mousedown", function(e) {
        trackingActiveDrag = true;
        physicalStartY = e.clientY;
        switchHandleNode.style.transition = "none";
        switchCordLine.style.transition = "none";
    });

    window.addEventListener("mousemove", function(e) {
        if (!trackingActiveDrag) return;
        var dynamicDeltaY = e.clientY - physicalStartY;
        if (dynamicDeltaY < 0) dynamicDeltaY = 0;
        if (dynamicDeltaY > 45) dynamicDeltaY = 45;

        switchHandleNode.style.transform = "translateY(" + dynamicDeltaY + "px)";
        switchCordLine.style.height = (70 + dynamicDeltaY) + "px";

        if (dynamicDeltaY >= 45) {
            trackingActiveDrag = false;
            audioTracks.lampHum.pause();
            audioTracks.switchClick.play().catch(function() {});
            audioTracks.powerUp.play().catch(function() {});
            if (lightBulbNode) lightBulbNode.classList.add("powered");
            if (actionableHintNode) actionableHintNode.innerText = "⚡ System Active";

            setTimeout(function() { 
                if (splashOverlayNode) splashOverlayNode.classList.add("system-ready");
                audioTracks.authAmbient.play().catch(function() {});
            }, 600);
        }
    });

    window.addEventListener("mouseup", function() {
        if (!trackingActiveDrag) return;
        trackingActiveDrag = false;
        switchHandleNode.style.transition = "transform 0.3s ease";
        switchCordLine.style.transition = "height 0.3s ease";
        switchHandleNode.style.transform = "translateY(0px)";
        switchCordLine.style.height = "70px";
    });
}

/* ==========================================================================
   GATEWAY SWITCHES & AUTH FLOW MANAGERS
   ========================================================================== */
function initGatewayAuthenticationSystems() {
    var loginView = document.getElementById("loginView");
    var registerView = document.getElementById("registerView");
    
    var toggleToRegisterLink = document.querySelector("a[href='#register']") || document.getElementById("forgotPasswordLink");
    

    if (toggleToRegisterLink) {
        toggleToRegisterLink.addEventListener("click", function(e) {
            e.preventDefault();
            if(loginView) loginView.style.display = "none";
            if(registerView) registerView.style.display = "block";
        });
    }

    var registrationFormNode = document.getElementById("registerForm");
    if (registrationFormNode) {
        registrationFormNode.addEventListener("submit", function(e) {
            e.preventDefault();
            var accountName = document.getElementById("regName").value;
            var accountEmail = document.getElementById("regEmail").value.trim();
            var accountPassword = document.getElementById("regPassword").value;

            var emailCryptoMaskMatcher = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailCryptoMaskMatcher.test(accountEmail)) {
                alert("Security alert: Please key in a fully valid email (e.g. user@domain.com).");
                return;
            }

            var interactiveUserRegistry = JSON.parse(localStorage.getItem("internspaceUsers")) || [];
            if (interactiveUserRegistry.some(function(u) { return u.email === accountEmail; })) {
                alert("Email address already stored inside registry system.");
                return;
            }

            interactiveUserRegistry.push({ name: accountName, email: accountEmail, password: accountPassword });
            localStorage.setItem("internspaceUsers", JSON.stringify(interactiveUserRegistry));

            alert("Security Profile Created! Transitioning straight to log in fields.");
            if(registerView) registerView.style.display = "none";
            if(loginView) loginView.style.display = "block";
        });
    }

    var loginFormNode = document.getElementById("loginForm");
    if (loginFormNode) {
        loginFormNode.addEventListener("submit", function(e) {
            e.preventDefault();
            var emailInput = document.getElementById("loginEmail").value.trim();
            var passwordInput = document.getElementById("loginPassword").value;
            var errDisplay = document.getElementById("loginError");

            var interactiveUserRegistry = JSON.parse(localStorage.getItem("internspaceUsers")) || [];
            var matchedUser = interactiveUserRegistry.find(function(u) { return u.email === emailInput && u.password === passwordInput; });

            if (matchedUser) {
                audioTracks.authAmbient.pause();
                localStorage.setItem("loggedInUser", matchedUser.name);
                window.location.href = "./dashboard.html";
            } else {
                if (errDisplay) errDisplay.style.display = "block";
            }
        });
    }
    
    var splashScreen = document.getElementById("splashScreen");
    if (splashScreen && !localStorage.getItem("loggedInUser")) {
        initSplashSequence();
    }
}

/* ==========================================================================
   ONBOARDING PROGRESS TRACKER
   ========================================================================== */
function processMetrics(elements) {
    var positiveCalculatedTotalCounter = 0;
    elements.forEach(function(item) { if (item.checked) positiveCalculatedTotalCounter++; });
    var normalizedMetricsPercentageRatio = elements.length > 0 ? Math.round((positiveCalculatedTotalCounter / elements.length) * 100) : 0;
    
    var dynamicStatusBarNode = document.getElementById("onboardingProgress");
    var dynamicStatusTextFieldNode = document.getElementById("progressText");
    if (dynamicStatusBarNode) dynamicStatusBarNode.style.width = normalizedMetricsPercentageRatio + "%";
    if (dynamicStatusTextFieldNode) dynamicStatusTextFieldNode.innerText = normalizedMetricsPercentageRatio + "% Clearance Achieved";
}

function initDashboardHub(userName) {
    var dynamicGreetingFieldNode = document.getElementById("userGreeting");
    if (dynamicGreetingFieldNode) dynamicGreetingFieldNode.innerText = userName || "Intern";
    
    var diagnosticProgressCheckboxesList = document.querySelectorAll(".onboard-check");
    var personalProgressKeyIdentifier = "onboard_" + userName;
    var dynamicLocalMetricsStateMap = JSON.parse(localStorage.getItem(personalProgressKeyIdentifier)) || {};

    diagnosticProgressCheckboxesList.forEach(function(box) {
        var metricUniqueId = box.getAttribute("data-id");
        if (dynamicLocalMetricsStateMap[metricUniqueId]) box.checked = true;

        box.addEventListener("change", function() {
            dynamicLocalMetricsStateMap[metricUniqueId] = this.checked;
            localStorage.setItem(personalProgressKeyIdentifier, JSON.stringify(dynamicLocalMetricsStateMap));
            processMetrics(diagnosticProgressCheckboxesList);
        });
    });
    processMetrics(diagnosticProgressCheckboxesList);
}

/* ==========================================================================
   AGILE SPRINT KANBAN COMPONENT
   ========================================================================== */
function refreshKanbanBoard() {
    var targetTodoContainerNode = document.getElementById("todoContainer");
    var targetDoingContainerNode = document.getElementById("doingContainer");
    var targetDoneContainerNode = document.getElementById("doneContainer");
    if (!targetTodoContainerNode || !targetDoingContainerNode || !targetDoneContainerNode) return;

    targetTodoContainerNode.innerHTML = ""; targetDoingContainerNode.innerHTML = ""; targetDoneContainerNode.innerHTML = "";
    var currentActiveUserIdentifier = localStorage.getItem("loggedInUser");
    var globalKanbanMemoryArray = JSON.parse(localStorage.getItem("globalKanbanData")) || [];
var userspaceFilteredTasksList = globalKanbanMemoryArray.filter(function(t) { return t && t.owner === currentActiveUserIdentifier; });userspaceFilteredTasksList.forEach(function(task) {var generatedTaskCardElement = document.createElement("div");generatedTaskCardElement.className = "task-card";var renderLeft = task.status !== 'todo' ? '◀ Move Left' : '';var renderRight = task.status !== 'done' ? 'Move Right ▶' : '';generatedTaskCardElement.innerHTML = '' + task.title + '' +'' + task.priority + ' Priority' +'' +renderLeft + renderRight +'🗑 Clear' +'';if (task.status === "todo") targetTodoContainerNode.appendChild(generatedTaskCardElement);if (task.status === "doing") targetDoingContainerNode.appendChild(generatedTaskCardElement);if (task.status === "done") targetDoneContainerNode.appendChild(generatedTaskCardElement);});}function initKanbanSystem() {var corporateKanbanSubmissionFormNode = document.getElementById("kanbanForm");if (!corporateKanbanSubmissionFormNode) return;corporateKanbanSubmissionFormNode.addEventListener("submit", function(e) {e.preventDefault();var dynamicTaskTitleString = document.getElementById("taskTitle").value;var dynamicTaskPriorityLevelString = document.getElementById("taskPriority").value;var dynamicTaskGeneratedUniqueId = "sprint_" + Date.now();var freshSprintTaskItemObject = { id: dynamicTaskGeneratedUniqueId, title: dynamicTaskTitleString, priority: dynamicTaskPriorityLevelString, status: "todo", owner: localStorage.getItem("loggedInUser") };var globalKanbanMemoryArray = JSON.parse(localStorage.getItem("globalKanbanData")) || [];globalKanbanMemoryArray.push(freshSprintTaskItemObject);localStorage.setItem("globalKanbanData", JSON.stringify(globalKanbanMemoryArray));corporateKanbanSubmissionFormNode.reset();refreshKanbanBoard();});refreshKanbanBoard();}/* ==========================================================================CENTRAL LIFE CYCLE ROUTER ENGINES========================================================================== */document.addEventListener("DOMContentLoaded", function() {var authenticatedUser = localStorage.getItem("loggedInUser");var checkGatewayLoginPage = document.getElementById("loginForm") !== null;var checkInternalDashboardPage = document.getElementById("onboardingProgress") !== null;if (!authenticatedUser && checkInternalDashboardPage) {window.location.href = "./index.html";return;}if (authenticatedUser && checkGatewayLoginPage) {window.location.href = "./dashboard.html";return;}if (checkGatewayLoginPage) {window.addEventListener('click', function() {if (audioTracks.authAmbient.paused && audioTracks.workspaceBeat.paused) {audioTracks.authAmbient.play().catch(function() {});}}, { once: true });initGatewayAuthenticationSystems();} else if (checkInternalDashboardPage) {if (audioTracks.workspaceBeat.paused) {audioTracks.authAmbient.pause();audioTracks.workspaceBeat.play().catch(function() {window.addEventListener('click', function() {if(audioTracks.workspaceBeat.paused) audioTracks.workspaceBeat.play().catch(function() {});}, { once: true });});}initDashboardHub(authenticatedUser);initKanbanSystem();}var logoutButton = document.getElementById("logoutBtn");if (logoutButton) {logoutButton.addEventListener("click", function(e) {e.preventDefault();audioTracks.workspaceBeat.pause();audioTracks.authAmbient.pause();localStorage.removeItem("loggedInUser");window.location.href = "./index.html";});}});if (typeof window !== "undefined") {window.switchWorkspaceView = function(targetViewString) {var onboardingPanel = document.getElementById("onboardingSection");var kanbanPanel = document.getElementById("kanbanSection");if (!onboardingPanel || !kanbanPanel) return;if (targetViewString === 'onboarding') {kanbanPanel.style.display = "none";onboardingPanel.style.display = "block";} else if (targetViewString === 'kanban') {onboardingPanel.style.display = "none";kanbanPanel.style.display = "block";refreshKanbanBoard();}};window.executeTaskWorkflowMutation = function(taskId, workflowDirectionString) {var globalKanbanMemoryArray = JSON.parse(localStorage.getItem("globalKanbanData")) || [];var workflowStagesMapSequence = ["todo", "doing", "done"];globalKanbanMemoryArray = globalKanbanMemoryArray.map(function(t) {if (t && t.id === taskId) {var currentStagePointerIndex = workflowStagesMapSequence.indexOf(t.status);if (workflowDirectionString === "progress" && currentStagePointerIndex < 2) currentStagePointerIndex++;if (workflowDirectionString === "regress" && currentStagePointerIndex > 0) currentStagePointerIndex--;t.status = workflowStagesMapSequence[currentStagePointerIndex];}return t;});localStorage.setItem("globalKanbanData", JSON.stringify(globalKanbanMemoryArray));refreshKanbanBoard();};window.removeTaskItemFromMemoryStorage = function(taskId) {var globalKanbanMemoryArray = JSON.parse(localStorage.getItem("globalKanbanData")) || [];globalKanbanMemoryArray = globalKanbanMemoryArray.filter(function(item) { return item && item.id !== taskId; });localStorage.setItem("globalKanbanData", JSON.stringify(globalKanbanMemoryArray));refreshKanbanBoard();};}if ('serviceWorker' in navigator) {window.addEventListener('load', function() {navigator.serviceWorker.register('./sw.js').catch(function() {});});}