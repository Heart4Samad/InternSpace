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

// Configure basic audio playback loops and properties
audioTracks.authAmbient.loop = false;     
audioTracks.authAmbient.volume = 0.4;
audioTracks.lampHum.loop = true;          
audioTracks.lampHum.volume = 0.5;
audioTracks.workspaceBeat.loop = false;   
audioTracks.workspaceBeat.volume = 0.3;

var systemInstallationPrompt = null;

/* ==========================================================================
   SAFE RE-ROUTING & VIEW GUARDS
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function() {
    var userSessionToken = localStorage.getItem("loggedInUser");
    
    // Setup Audio End Event Observers inside the safe DOM lifecycle
    audioTracks.authAmbient.addEventListener('ended', function() {
        audioTracks.workspaceBeat.play().catch(function() {});
    });
    audioTracks.workspaceBeat.addEventListener('ended', function() {
        audioTracks.authAmbient.play().catch(function() {});
    });

    // Explicit node lookups to pinpoint page states safely
    var checkLoginPage = document.getElementById("loginForm") !== null;
    var checkRegisterPage = document.getElementById("registerForm") !== null;
    var checkDashboardPage = document.getElementById("onboardingProgress") !== null;
    var checkKanbanPage = document.getElementById("kanbanForm") !== null;

    // GUARD A: Force strangers away from internal operational pages
    if (!userSessionToken && (checkDashboardPage || checkKanbanPage)) {
        window.location.href = "./index.html";
        return;
    }

    // GUARD B: Force logged-in users straight past the login gateway layout
    if (userSessionToken && (checkLoginPage || checkRegisterPage)) {
        window.location.href = "./dashboard.html";
        return;
    }

    // Handle Lamp Splash display state overlay parameters
    var splashOverlayNode = document.getElementById("splashScreen");
    if (splashOverlayNode) {
        if (userSessionToken) {
            splashOverlayNode.style.display = "none";
        } else {
            initSplashSequence();
        }
    }

    // Continuous music management context logic
    if (checkLoginPage || checkRegisterPage) {
        window.addEventListener('click', function() { 
            if (audioTracks.authAmbient.paused && audioTracks.workspaceBeat.paused) {
                audioTracks.authAmbient.play().catch(function() {}); 
            }
        }, { once: true });
    } else if (checkDashboardPage || checkKanbanPage) {
        if (audioTracks.workspaceBeat.paused) {
            audioTracks.authAmbient.pause();
            audioTracks.workspaceBeat.play().catch(function() {
                window.addEventListener('click', function() { 
                    if(audioTracks.workspaceBeat.paused) audioTracks.workspaceBeat.play().catch(function() {}); 
                }, { once: true });
            });
        }
    }

    // Initialize layout scripts with strict validation wrappers
    if (checkRegisterPage) initRegisterLogic();
    if (checkLoginPage) {
        initLoginLogic();
        initForgotPasswordViews();
    }
    if (checkDashboardPage) initDashboardHub(userSessionToken);
    if (checkKanbanPage) initKanbanSystem();

    // UNIFIED SIGN OUT ENGINE (Clears audio loops immediately)
    var logoutButtonElements = document.querySelectorAll("#logoutBtn, #logoutBtn2, .logout-action");
    logoutButtonElements.forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            audioTracks.workspaceBeat.pause();
            audioTracks.authAmbient.pause();
            localStorage.removeItem("loggedInUser");
            window.location.href = "./index.html";
        });
    });
});

/* ==========================================================================
   DRAGGABLE LIGHT SWITCH SEQUENCE 
   ========================================================================== */
function initSplashSequence() {
    var splashOverlayNode = document.getElementById("splashScreen");
    var lightBulbNode = document.getElementById("lampBulb");
    var switchHandleNode = document.getElementById("switchNode");
    var switchCordLine = document.querySelector(".switch-line");
    var actionableHintNode = document.getElementById("actionHint");

    if (!switchHandleNode || !switchCordLine) return;
    window.addEventListener('click', function() { audioTracks.lampHum.play().catch(function() {}); }, { once: true });

    var trackingActiveDrag = false;
    var physicalStartY = 0;

    var registerStartDrag = function(e) {
        trackingActiveDrag = true;
        physicalStartY = e.clientY || (e.touches && e.touches.clientY);
        switchHandleNode.style.transition = "none";
        switchCordLine.style.transition = "none";
    };

    var executeActiveDrag = function(e) {
        if (!trackingActiveDrag) return;
        if (e.cancelable) e.preventDefault();

        var dynamicCurrentY = e.clientY || (e.touches && e.touches.clientY);
        var dynamicDeltaY = dynamicCurrentY - physicalStartY;

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
            if (actionableHintNode) {
                actionableHintNode.innerText = "⚡ System Active";
                actionableHintNode.style.color = "var(--gold-bright)";
            }

            setTimeout(function() { 
                if (splashOverlayNode) splashOverlayNode.classList.add("system-ready");
                audioTracks.authAmbient.play().catch(function() {});
            }, 600);
        }
    };

    var cancelCurrentDrag = function() {
        if (!trackingActiveDrag) return;
        trackingActiveDrag = false;
        switchHandleNode.style.transition = "transform 0.3s ease";
        switchCordLine.style.transition = "height 0.3s ease";
        switchHandleNode.style.transform = "translateY(0px)";
        switchCordLine.style.height = "70px";
    };

    switchHandleNode.addEventListener("mousedown", registerStartDrag);
    window.addEventListener("mousemove", executeActiveDrag);
    window.addEventListener("mouseup", cancelCurrentDrag);
    switchHandleNode.addEventListener("touchstart", registerStartDrag, { passive: false });
    window.addEventListener("touchmove", executeActiveDrag, { passive: false });
    window.addEventListener("touchend", cancelCurrentDrag);
}

/* ==========================================================================
   PROFILE ACCOUNT GATEWAYS (REMEMBER/FORGOT PASSWORD)
   ========================================================================== */
function initForgotPasswordViews() {
    var primaryLoginViewNode = document.getElementById("loginView");
    var recoveryResetViewNode = document.getElementById("resetView");
    var forgotTriggerLinkNode = document.getElementById("forgotPasswordLink");
    var escapeToLoginLinkNode = document.getElementById("backToLoginLink");
    var securityResetFormNode = document.getElementById("forgotPasswordForm");
    var interactiveEmailInputNode = document.getElementById("loginEmail");

    if (!forgotTriggerLinkNode || !escapeToLoginLinkNode || !securityResetFormNode) return;

    var historicallySavedEmail = localStorage.getItem("savedRememberEmail");
    if (historicallySavedEmail && interactiveEmailInputNode) {
        interactiveEmailInputNode.value = historicallySavedEmail;
        var persistentLoginCheckboxNode = document.getElementById("rememberMeLogin");
        if (persistentLoginCheckboxNode) persistentLoginCheckboxNode.checked = true;
    }

    forgotTriggerLinkNode.addEventListener("click", function(e) {
        e.preventDefault();
        if (primaryLoginViewNode) primaryLoginViewNode.style.display = "none";
        if (recoveryResetViewNode) recoveryResetViewNode.style.display = "block";
    });

    escapeToLoginLinkNode.addEventListener("click", function(e) {
        e.preventDefault();
        if (recoveryResetViewNode) recoveryResetViewNode.style.display = "none";
        if (primaryLoginViewNode) primaryLoginViewNode.style.display = "block";
    });

    securityResetFormNode.addEventListener("submit", function(e) {
        e.preventDefault();
        var processTargetEmail = document.getElementById("resetEmail").value;
        var processTargetNewPassword = document.getElementById("newPassword").value;

        var interactiveUserRegistry = JSON.parse(localStorage.getItem("internspaceUsers")) || [];
        var targetedUserIndex = interactiveUserRegistry.findIndex(function(u) { return u.email === processTargetEmail; });

        if (targetedUserIndex !== -1) {
            interactiveUserRegistry[targetedUserIndex].password = processTargetNewPassword;
            localStorage.setItem("internspaceUsers", JSON.stringify(interactiveUserRegistry));
            alert("Password Reset Successful! Try logging in now.");
            securityResetFormNode.reset();
            escapeToLoginLinkNode.click();
        } else {
            alert("Email not found in our system!");
        }
});}function initRegisterLogic() {var workspaceRegistrationFormNode = document.getElementById("registerForm");var userRegistrationEmailInputNode = document.getElementById("regEmail");if (!workspaceRegistrationFormNode || !userRegistrationEmailInputNode) return;var historicallySavedEmail = localStorage.getItem("savedRememberEmail");if (historicallySavedEmail) {userRegistrationEmailInputNode.value = historicallySavedEmail;var persistentRegCheckboxNode = document.getElementById("rememberMeReg");if (persistentRegCheckboxNode) persistentRegCheckboxNode.checked = true;}workspaceRegistrationFormNode.addEventListener("submit", function(e) {e.preventDefault();var freshAccountName = document.getElementById("regName").value;var freshAccountEmail = userRegistrationEmailInputNode.value;var freshAccountPassword = document.getElementById("regPassword").value;var checkRememberConfigurationState = document.getElementById("rememberMeReg") ? document.getElementById("rememberMeReg").checked : false;var interactiveUserRegistry = JSON.parse(localStorage.getItem("internspaceUsers")) || [];if (interactiveUserRegistry.some(function(u) { return u.email === freshAccountEmail; })) {alert("Email already registered!");return;}interactiveUserRegistry.push({ name: freshAccountName, email: freshAccountEmail, password: freshAccountPassword });localStorage.setItem("internspaceUsers", JSON.stringify(interactiveUserRegistry));if (checkRememberConfigurationState) {localStorage.setItem("savedRememberEmail", freshAccountEmail);} else {localStorage.removeItem("savedRememberEmail");}alert("Account Created! Redirecting to login.");window.location.href = "./index.html";});}function initLoginLogic() {var corporateGatewayLoginFormNode = document.getElementById("loginForm");if (!corporateGatewayLoginFormNode) return;corporateGatewayLoginFormNode.addEventListener("submit", function(e) {e.preventDefault();var validationInputEmail = document.getElementById("loginEmail").value;var validationInputPassword = document.getElementById("loginPassword").value;var checkRememberConfigurationState = document.getElementById("rememberMeLogin") ? document.getElementById("rememberMeLogin").checked : false;var loginErrorBoxContainerNode = document.getElementById("loginError");var interactiveUserRegistry = JSON.parse(localStorage.getItem("internspaceUsers")) || [];var locallyAuthenticatedUserObject = interactiveUserRegistry.find(function(u) { return u.email === validationInputEmail && u.password === validationInputPassword; });if (locallyAuthenticatedUserObject) {audioTracks.authAmbient.pause();localStorage.setItem("loggedInUser", locallyAuthenticatedUserObject.name);if (checkRememberConfigurationState) {localStorage.setItem("savedRememberEmail", validationInputEmail);} else {localStorage.removeItem("savedRememberEmail");}window.location.href = "./dashboard.html";} else {if (loginErrorBoxContainerNode) loginErrorBoxContainerNode.style.display = "block";}});}/* ==========================================================================ONBOARDING DASHBOARD PROGRESS TRACKER========================================================================== */function initDashboardHub(userName) {var dynamicGreetingFieldNode = document.getElementById("userGreeting");if (dynamicGreetingFieldNode) dynamicGreetingFieldNode.innerText = userName || "Intern";var diagnosticProgressCheckboxesList = document.querySelectorAll(".onboard-check");var personalProgressKeyIdentifier = "onboard_" + userName;var dynamicLocalMetricsStateMap = JSON.parse(localStorage.getItem(personalProgressKeyIdentifier)) || {};diagnosticProgressCheckboxesList.forEach(function(box) {var metricUniqueId = box.getAttribute("data-id");if (dynamicLocalMetricsStateMap[metricUniqueId]) box.checked = true;box.addEventListener("change", function() {dynamicLocalMetricsStateMap[metricUniqueId] = this.checked;localStorage.setItem(personalProgressKeyIdentifier, JSON.stringify(dynamicLocalMetricsStateMap));processMetrics(diagnosticProgressCheckboxesList);});});processMetrics(diagnosticProgressCheckboxesList);}function processMetrics(elements) {var positiveCalculatedTotalCounter = 0;elements.forEach(function(item) { if (item.checked) positiveCalculatedTotalCounter++; });var normalizedMetricsPercentageRatio = elements.length > 0 ? Math.round((positiveCalculatedTotalCounter / elements.length) * 100) : 0;var dynamicStatusBarNode = document.getElementById("onboardingProgress");var dynamicStatusTextFieldNode = document.getElementById("progressText");if (dynamicStatusBarNode) dynamicStatusBarNode.style.width = normalizedMetricsPercentageRatio + "%";if (dynamicStatusTextFieldNode) dynamicStatusTextFieldNode.innerText = normalizedMetricsPercentageRatio + "% Clearance Achieved";}/* ==========================================================================AGILE SPRINT KANBAN COMPONENT========================================================================== */function initKanbanSystem() {var corporateKanbanSubmissionFormNode = document.getElementById("kanbanForm");if (!corporateKanbanSubmissionFormNode) return;corporateKanbanSubmissionFormNode.addEventListener("submit", function(e) {e.preventDefault();var dynamicTaskTitleString = document.getElementById("taskTitle").value;var dynamicTaskPriorityLevelString = document.getElementById("taskPriority").value;var dynamicTaskGeneratedUniqueId = "sprint_" + Date.now();var freshSprintTaskItemObject = { id: dynamicTaskGeneratedUniqueId, title: dynamicTaskTitleString, priority: dynamicTaskPriorityLevelString, status: "todo", owner: localStorage.getItem("loggedInUser") };var globalKanbanMemoryArray = JSON.parse(localStorage.getItem("globalKanbanData")) || [];globalKanbanMemoryArray.push(freshSprintTaskItemObject);localStorage.setItem("globalKanbanData", JSON.stringify(globalKanbanMemoryArray));corporateKanbanSubmissionFormNode.reset();refreshKanbanBoard();});refreshKanbanBoard();}function refreshKanbanBoard() {var targetTodoContainerNode = document.getElementById("todoContainer");var targetDoingContainerNode = document.getElementById("doingContainer");var targetDoneContainerNode = document.getElementById("doneContainer");if (!targetTodoContainerNode || !targetDoingContainerNode || !targetDoneContainerNode) return;targetTodoContainerNode.innerHTML = ""; targetDoingContainerNode.innerHTML = ""; targetDoneContainerNode.innerHTML = "";var currentActiveUserIdentifier = localStorage.getItem("loggedInUser");var globalKanbanMemoryArray = JSON.parse(localStorage.getItem("globalKanbanData")) || [];var userspaceFilteredTasksList = globalKanbanMemoryArray.filter(function(t) { return t && t.owner === currentActiveUserIdentifier; });userspaceFilteredTasksList.forEach(function(task) {var generatedTaskCardElement = document.createElement("div");generatedTaskCardElement.className = "task-card";var renderLeftNavigationActionControl = task.status !== 'todo' ? '◀' : '';var renderRightNavigationActionControl = task.status !== 'done' ? '▶' : '';generatedTaskCardElement.innerHTML = '' + task.title + '' +'' + task.priority + '' +'' +renderLeftNavigationActionControl +renderRightNavigationActionControl +'🗑' +'';if (task.status === "todo") targetTodoContainerNode.appendChild(generatedTaskCardElement);if (task.status === "doing") targetDoingContainerNode.appendChild(generatedTaskCardElement);if (task.status === "done") targetDoneContainerNode.appendChild(generatedTaskCardElement);});}// Attach scope functions directly to the verified global frame context without prototype triggersif (typeof window !== "undefined") {window.executeTaskWorkflowMutation = function(taskId, workflowDirectionString) {var globalKanbanMemoryArray = JSON.parse(localStorage.getItem("globalKanbanData")) || [];var workflowStagesMapSequence = ["todo", "doing", "done"];globalKanbanMemoryArray = globalKanbanMemoryArray.map(function(t) {if (t && t.id === taskId) {var currentStagePointerIndex = workflowStagesMapSequence.indexOf(t.status);if (workflowDirectionString === "progress" && currentStagePointerIndex < 2) currentStagePointerIndex++;if (workflowDirectionString === "regress" && currentStagePointerIndex > 0) currentStagePointerIndex--;t.status = workflowStagesMapSequence[currentStagePointerIndex];}return t;});localStorage.setItem("globalKanbanData", JSON.stringify(globalKanbanMemoryArray));refreshKanbanBoard();};window.removeTaskItemFromMemoryStorage = function(taskId) {var globalKanbanMemoryArray = JSON.parse(localStorage.getItem("globalKanbanData")) || [];globalKanbanMemoryArray = globalKanbanMemoryArray.filter(function(item) { return item && item.id !== taskId; });localStorage.setItem("globalKanbanData", JSON.stringify(globalKanbanMemoryArray));refreshKanbanBoard();};window.executeNativeApplicationInstallationTrigger = function() {if (!systemInstallationPrompt) {alert('Application operational context verified. To save standalone desktop launch wrappers on iOS/Safari: expand configuration share sheets and trigger Add to Home Screen.');return;}var persistentInstallationEventRef = systemInstallationPrompt;persistentInstallationEventRef.prompt();persistentInstallationEventRef.userChoice.then(function(choice) {if (choice.outcome === 'accepted') {console.log('Installation confirmed.');}systemInstallationPrompt = null;});};}/* ==========================================================================PROGRESSIVE WEB APP (PWA) DISK COUPLING INFRASTRUCTURE========================================================================== */if ('serviceWorker' in navigator) {window.addEventListener('load', function() {navigator.serviceWorker.register('./sw.js').catch(function() {});});}window.addEventListener('beforeinstallprompt', function(e) {e.preventDefault();systemInstallationPrompt = e;var dynamicInstallBannerWrapperNode = document.querySelector('.install-banner');if (dynamicInstallBannerWrapperNode) dynamicInstallBannerWrapperNode.style.display = 'flex';});