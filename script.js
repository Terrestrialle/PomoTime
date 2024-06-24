document.addEventListener("DOMContentLoaded", () => {
  const settButton = document.querySelector("#settings");
  const settContain = document.querySelector("#setting-container");
  const buttons = document.querySelectorAll("#setting-menu p");
  const contents = document.querySelectorAll("#setting-menu-content > div");
  const closeSettSection = document.querySelector(".close-btn");
  const timeDisplay = document.querySelector("#time-show");
  const progressBar = document.querySelector("#progress-bar");
  const startStopButton = document.querySelector("#start-pause");
  const skipButton = document.querySelector("#skip");
  const pomodoroView = document.querySelector("#pomodoro");
  const shortBreakView = document.querySelector("#short-break");
  const longBreakView = document.querySelector("#long-break");
  const slider = document.querySelector("#vol-alert");
  const slider2 = document.querySelector("#vol-song");
  const alarmAudio = document.querySelector("#alarm-audio");
  const songAudio = document.querySelector("#relaxing-audio");
  const playCheckbox = document.querySelector(
    "#toggle-alert input[type='checkbox']"
  );
  const autoRestartToggle = document.querySelector("#auto-restart-toggle");
  const themeSelect = document.querySelector("#input-theme");
  const playSongButton = document.querySelector("#play-song-button");

  let pomodoroDuration = 25 * 60;
  let shortBreakDuration = 5 * 60;
  let longBreakDuration = 15 * 60;
  let sessionsBeforeLongBreak = 4;
  let currentTimer = pomodoroDuration;
  let currentSession = 0;
  let isPomodoro = true;
  let timer;
  let isRunning = false;
  let pomodoroSessionCount = 0;
  let shortBreakCount = 0;
  let longBreakCount = 0;
  let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];

  const updateSliderBackground = (slider) => {
    const value =
      ((slider.value - slider.min) / (slider.max - slider.min)) * 100;

    slider.style.background = `linear-gradient(to right, var(--col-primary) ${value}%, var(--col-background) ${value}%)`;
  };

  // Initial background update
  updateSliderBackground(slider);
  updateSliderBackground(slider2);

  function togglePlayPause() {
    if (songAudio.paused) {
      songAudio.play().catch((error) => {
        console.error("Audio playback failed:", error);
        alert(
          "Audio playback failed. Please interact with the page (e.g., click) to allow playback."
        );
      });
      playSongButton.textContent = "pause";
    } else {
      songAudio.pause();
      playSongButton.textContent = "play_arrow";
    }
  }
  // Add event listener to the play/pause button
  playSongButton.addEventListener("click", togglePlayPause);

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  function updateDisplay() {
    const formattedTime = formatTime(currentTimer);
    timeDisplay.innerText = formattedTime;
    document.title = `Pomodoro Timer - ${formattedTime}`;
    updateProgressBar();
  }

  function updateProgressBar() {
    const elapsedTime =
      (isPomodoro
        ? pomodoroDuration
        : isLongBreak()
        ? longBreakDuration
        : shortBreakDuration) - currentTimer;
    const progressPercentage =
      (elapsedTime /
        (isPomodoro
          ? pomodoroDuration
          : isLongBreak()
          ? longBreakDuration
          : shortBreakDuration)) *
      100;
    progressBar.style.width = `${progressPercentage}%`;
  }

  function updateSessionHighlight() {
    pomodoroView.classList.remove("highlight");
    shortBreakView.classList.remove("highlight");
    longBreakView.classList.remove("highlight");

    if (isPomodoro) {
      pomodoroView.classList.add("highlight");
    } else if (isLongBreak()) {
      longBreakView.classList.add("highlight");
    } else {
      shortBreakView.classList.add("highlight");
    }
  }

  function playAudio() {
    const selectedAudio = audioSelect.value;
    const audioElement = audioElements[selectedAudio];
    const playPromise = audioElement.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Audio playback failed:", error);
        alert(
          "Audio playback failed. Please interact with the page (e.g., click) to allow playback."
        );
      });
    }
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timer = setInterval(() => {
      currentTimer--;
      updateDisplay();
      if (currentTimer <= 0) {
        clearInterval(timer);
        isRunning = false;
        playAudio();
        completeSession();
        if (autoRestartToggle.checked) {
          switchSession();
          startTimer();
        } else {
          switchSession();
          updateDisplay();
          updateSessionHighlight();
        }
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timer);
    isRunning = false;
  }

  function switchSession() {
    if (isPomodoro) {
      currentSession++;
      if (isLongBreak()) {
        currentTimer = longBreakDuration;
      } else {
        currentTimer = shortBreakDuration;
      }
    } else {
      currentTimer = pomodoroDuration;
    }
    isPomodoro = !isPomodoro;
    updateSessionHighlight();
  }

  function isLongBreak() {
    return currentSession % sessionsBeforeLongBreak === 0;
  }

  function skipTimer() {
    stopTimer();
    switchSession();
    updateDisplay();
    if (autoRestartToggle.checked) {
      startTimer();
    }
  }

  startStopButton.addEventListener("click", () => {
    if (isRunning) {
      stopTimer();
      startStopButton.textContent = "Start";
    } else {
      startTimer();
      startStopButton.textContent = "Stop";
    }
  });

  skipButton.addEventListener("click", () => {
    skipTimer();
  });

  function toggleAlarmPlayback() {
    if (playCheckbox.checked) {
      alarmAudio.play().catch((error) => {
        console.error("Alarm audio playback failed:", error);
        alert(
          "Alarm audio playback failed. Please interact with the page (e.g., click) to allow playback."
        );
      });
    } else {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
    }
  }

  playCheckbox.addEventListener("change", toggleAlarmPlayback);
  slider.addEventListener("input", function () {
    updateSliderBackground(this);
    alarmAudio.volume = this.value / 100;
  });
  slider2.addEventListener("input", function () {
    updateSliderBackground(this);
    songAudio.volume = this.value / 100; // Adjust song audio volume
  });

  const audioSelect = document.querySelector("#select-alarm");
  const audioElements = {
    Bell: document.querySelector("#Bell"),
    FirePager: document.querySelector("#FirePager"),
    ModernRingtone: document.querySelector("#ModernRingtone"),
    TornadoSiren: document.querySelector("#TornadoSiren"),
  };

  settButton.addEventListener("click", () => {
    settContain.style.display =
      settContain.style.display === "flex" ? "none" : "flex";
  });

  closeSettSection.addEventListener("click", () => {
    settContain.style.display = "none";
  });

  document.querySelector("#general-button").classList.add("active");
  document.querySelector("#general").classList.add("active");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      contents.forEach((content) => content.classList.remove("active"));
      if (button.id === "general-button") {
        document.querySelector("#general").classList.add("active");
      } else if (button.id === "timer-button") {
        document.querySelector("#timer-set-container").classList.add("active");
      } else if (button.id === "sound-button") {
        document.querySelector("#alarm-sound").classList.add("active");
      } else if (button.id === "stats-button") {
        document.querySelector("#session-info").classList.add("active");
      }
    });
  });

  themeSelect.addEventListener("change", (event) => {
    const selectedTheme = event.target.value;
    document.body.classList.remove("light-mode", "dark-mode");
    if (selectedTheme === "light") {
      document.body.classList.add("light-mode");
    } else if (selectedTheme === "dark") {
      document.body.classList.add("dark-mode");
    }
    savePreferences();
  });

  document
    .querySelector("#pomodoro-duration")
    .addEventListener("input", (event) => {
      const newDuration = parseInt(event.target.value) * 60;
      pomodoroDuration = newDuration;
      if (isPomodoro && !isRunning) {
        currentTimer = newDuration;
        updateDisplay();
      }
      savePreferences();
    });

  document
    .querySelector("#short-break-duration")
    .addEventListener("input", (event) => {
      const newDuration = parseInt(event.target.value) * 60;
      shortBreakDuration = newDuration;
      if (!isPomodoro && !isLongBreak() && !isRunning) {
        currentTimer = newDuration;
        updateDisplay();
      }
      savePreferences();
    });

  document
    .querySelector("#long-break-duration")
    .addEventListener("input", (event) => {
      const newDuration = parseInt(event.target.value) * 60;
      longBreakDuration = newDuration;
      if (!isPomodoro && isLongBreak() && !isRunning) {
        currentTimer = newDuration;
        updateDisplay();
      }
      savePreferences();
    });

  document
    .querySelector("#sessions-before-long-break")
    .addEventListener("input", (event) => {
      sessionsBeforeLongBreak = parseInt(event.target.value);
      savePreferences();
    });

  function savePreferences() {
    const preferences = {
      theme: themeSelect.value,
      pomodoroDuration: pomodoroDuration / 60,
      shortBreakDuration: shortBreakDuration / 60,
      longBreakDuration: longBreakDuration / 60,
      sessionsBeforeLongBreak,
    };
    localStorage.setItem("preferences", JSON.stringify(preferences));
  }

  function loadPreferences() {
    const savedPreferences = localStorage.getItem("preferences");
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      pomodoroDuration = preferences.pomodoroDuration * 60;
      shortBreakDuration = preferences.shortBreakDuration * 60;
      longBreakDuration = preferences.longBreakDuration * 60;
      sessionsBeforeLongBreak = preferences.sessionsBeforeLongBreak;

      document.querySelector("#pomodoro-duration").value =
        preferences.pomodoroDuration;
      document.querySelector("#short-break-duration").value =
        preferences.shortBreakDuration;
      document.querySelector("#long-break-duration").value =
        preferences.longBreakDuration;
      document.querySelector("#sessions-before-long-break").value =
        preferences.sessionsBeforeLongBreak;

      if (!isRunning) {
        if (isPomodoro) {
          currentTimer = pomodoroDuration;
        } else if (isLongBreak()) {
          currentTimer = longBreakDuration;
        } else {
          currentTimer = shortBreakDuration;
        }
        updateDisplay();
      }
    }
  }

  function completeSession() {
    const sessionData = {
      timestamp: new Date().toLocaleString(),
      type: isPomodoro
        ? "Pomodoro"
        : isLongBreak()
        ? "Long Break"
        : "Short Break",
    };

    sessionHistory.push(sessionData);
    localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
    updateSessionCounts();
    updateSessionHistory();
  }

  function updateSessionCounts() {
    pomodoroSessionCount = sessionHistory.filter(
      (session) => session.type === "Pomodoro"
    ).length;
    shortBreakCount = sessionHistory.filter(
      (session) => session.type === "Short Break"
    ).length;
    longBreakCount = sessionHistory.filter(
      (session) => session.type === "Long Break"
    ).length;
    document.querySelector("#pomodoro-session-count").innerText =
      pomodoroSessionCount;
    document.querySelector("#short-break-count").innerText = shortBreakCount;
    document.querySelector("#long-break-count").innerText = longBreakCount;
  }

  function updateSessionHistory() {
    const historyContainer = document.querySelector("#session-history");
    historyContainer.innerHTML = "";
    sessionHistory.forEach((session) => {
      const sessionElement = document.createElement("div");
      sessionElement.classList.add("session-item");
      sessionElement.innerText = `${session.type} completed on ${session.timestamp}`;
      historyContainer.appendChild(sessionElement);
    });
  }

  document.querySelector(".delete-session").addEventListener("click", () => {
    const confirmation = confirm(
      "Are you sure you want to delete all session history?"
    );
    if (confirmation) {
      sessionHistory = [];
      localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
      updateSessionCounts();
      updateSessionHistory();
    }
  });

  loadPreferences();
  updateSessionCounts();
  updateSessionHistory();
  updateDisplay();
  updateSessionHighlight();
});
