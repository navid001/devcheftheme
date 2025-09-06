// Global namespace to avoid conflicts
var DeliveryCountdown = (function () {
  // Private variables
  var initialized = false;
  var intervals = [];

  // Initialize function - can be called multiple times safely
  function initialize() {
    // Exit if already running to prevent duplicate intervals
    if (initialized) return;
    initialized = true;

    // Start the update loop
    const updateInterval = setInterval(updateAllCountdowns, 1000);
    intervals.push(updateInterval);

    // Start the check for window changes
    const checkInterval = setInterval(checkWindowChange, 60000);
    intervals.push(checkInterval);

    // Run initial update
    updateAllCountdowns();
  }

  // Register a new countdown timer
  function registerCountdown(
    counterId,
    orderByDay,
    orderByHour,
    orderByMinute
  ) {
    // Create global array if it doesn't exist
    if (!window.deliveryCountdowns) {
      window.deliveryCountdowns = [];
    }

    // Check if this exact counter is already registered
    if (!window.deliveryCountdowns.some((c) => c.element === counterId)) {
      window.deliveryCountdowns.push({
        element: counterId,
        orderByDay: orderByDay,
        orderByHour: orderByHour,
        orderByMinute: orderByMinute,
      });
    }

    // Initialize the countdown system if not already running
    initialize();
  }

  // Function to get the next target day and time
  function getNextTargetDay(dayName, hour, minute) {
    const dayMapping = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const targetDayNum = dayMapping[dayName.toLowerCase()];

    // Create a date in EST
    const estOptions = { timeZone: "America/New_York" };
    const now = new Date().toLocaleString("en-US", estOptions);
    const estDate = new Date(now);
    const currentDay = estDate.getDay();

    // Calculate days until target day
    let daysUntilTarget = targetDayNum - currentDay;

    // If today is after target day or it's the same day but we've passed the time
    if (
      daysUntilTarget < 0 ||
      (daysUntilTarget === 0 &&
        (estDate.getHours() > hour ||
          (estDate.getHours() === hour && estDate.getMinutes() >= minute)))
    ) {
      daysUntilTarget += 7;
    }

    // Set the target date and time in EST
    const targetDate = new Date(estDate);
    targetDate.setDate(estDate.getDate() + daysUntilTarget);
    targetDate.setHours(hour, minute, 0, 0);

    return targetDate;
  }

  // Update all countdown timers
  function updateAllCountdowns() {
    if (!window.deliveryCountdowns || window.deliveryCountdowns.length === 0)
      return;

    const estOptions = { timeZone: "America/New_York" };
    const now = new Date().toLocaleString("en-US", estOptions);
    const estNow = new Date(now);

    window.deliveryCountdowns.forEach((countdown) => {
      const targetTime = getNextTargetDay(
        countdown.orderByDay,
        countdown.orderByHour,
        countdown.orderByMinute
      );

      // Calculate time remaining
      const timeRemaining = targetTime - estNow;

      // Get the element to update
      const element = document.getElementById(countdown.element);
      if (!element) return;

      // If deadline passed
      if (timeRemaining <= 0) {
        element.textContent = "too late for this window";
        return;
      }

      // Calculate time units
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      // Build time string
      let timeString = "";
      if (days > 0) {
        timeString += days + (days === 1 ? "D " : "D ");
      }
      if (hours > 0 || days > 0) {
        timeString += hours + (hours === 1 ? "H " : "H ");
      }
      timeString += minutes + (minutes === 1 ? "M " : "M ");
      timeString += seconds + (seconds === 1 ? "S" : "S");

      // Update the element
      // You can optionally add the EST date here if needed
      element.textContent = timeString;
    });
  }

  // Check if window has changed and reload if needed
  function checkWindowChange() {
    if (!window.deliveryCountdowns) return;

    const estOptions = { timeZone: "America/New_York" };
    const now = new Date().toLocaleString("en-US", estOptions);
    const estNow = new Date(now);

    const needsReload = [];

    window.deliveryCountdowns.forEach((countdown, index) => {
      const targetTime = getNextTargetDay(
        countdown.orderByDay,
        countdown.orderByHour,
        countdown.orderByMinute
      );

      if (estNow > targetTime && !countdown.reloadScheduled) {
        countdown.reloadScheduled = true;
        needsReload.push(index);
      }
    });

    if (needsReload.length > 0) {
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }
  }

  // Clean up all intervals
  function cleanup() {
    intervals.forEach((interval) => clearInterval(interval));
    intervals = [];
    initialized = false;
  }

  // Public API
  return {
    registerCountdown: registerCountdown,
    initialize: initialize,
    cleanup: cleanup,
  };
})();

// When the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the countdown system
  DeliveryCountdown.initialize();

  // Look for any countdown elements that might be in the initial page load
  initializeExistingCountdowns();
});

// Handle dynamic content loading
document.addEventListener("cart:refresh", function () {
  setTimeout(initializeExistingCountdowns, 100);
});

document.addEventListener("ajax:complete", function () {
  setTimeout(initializeExistingCountdowns, 100);
});

// Modal or drawer opening events
document.addEventListener("drawer:open", function () {
  setTimeout(initializeExistingCountdowns, 100);
});

// Function to find and initialize any countdown elements on the page
function initializeExistingCountdowns() {
  document
    .querySelectorAll(".countdown-container")
    .forEach(function (container) {
      const countdownElement = container.querySelector(".countdown-highlight");
      if (countdownElement && countdownElement.id) {
        // This is a countdown element
        const dataElement = container.querySelector(
          "script[data-countdown-data]"
        );
        if (dataElement) {
          try {
            const countdownData = JSON.parse(
              dataElement.getAttribute("data-countdown-data")
            );
            DeliveryCountdown.registerCountdown(
              countdownElement.id,
              countdownData.orderByDay,
              countdownData.orderByHour,
              countdownData.orderByMinute
            );
          } catch (e) {
            console.error("Error parsing countdown data", e);
          }
        }
      }
    });
}

// Clean up on page unload
window.addEventListener("beforeunload", DeliveryCountdown.cleanup);
