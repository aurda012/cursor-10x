/**
 * Date Verification System
 *
 * Ensures consistent date usage across all agents
 * All agents must use the current date from this system
 * The system enforces the current date but with year 2025
 */

// Create global namespace if it doesn't exist
if (typeof globalThis.URDAFX_SYSTEM === "undefined") {
  globalThis.URDAFX_SYSTEM = {};
}

/**
 * Date System
 * Provides standardized date handling for the URDAFX system
 */
class DateSystem {
  constructor() {
    // Initialize with current date but year fixed to 2025
    this.initialized = false;
    this.currentYear = 2025; // Fixed year
  }

  /**
   * Initialize the date system
   */
  initialize() {
    console.log("Initializing Date System...");

    try {
      // Get current date with year 2025
      const currentDate = this.getCurrentDate();

      // Store current date in global namespace
      globalThis.URDAFX_SYSTEM.currentDate = currentDate;

      // Create formatted versions for easy access
      const formattedDate = {
        full: this.formatDateSimple(currentDate, "yyyy-MM-dd"),
        long: this.formatDateSimple(currentDate, "dddd, MMMM d, yyyy"),
        short: this.formatDateSimple(currentDate, "MM/dd/yyyy"),
      };

      // Store formatted date
      globalThis.CURRENT_DATE = {
        date: currentDate,
        year: this.currentYear,
        month: currentDate.getMonth() + 1, // 1-indexed for external use
        day: currentDate.getDate(),
        formatted: formattedDate,
      };

      console.log(
        `Date Verification System initialized with date: ${formattedDate.long}`
      );

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing Date System:", error);
      return false;
    }
  }

  /**
   * Get the current date with year set to 2025
   * @returns {Date} Current date with year set to 2025
   */
  getCurrentDate() {
    // Get current date
    const now = new Date();

    // Create a new date with the same month/day but year 2025
    return new Date(
      this.currentYear,
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );
  }

  /**
   * Format a date according to the specified format
   * @param {Date|string} date - Date to format
   * @param {string} format - Format string
   * @returns {string} Formatted date
   */
  formatDate(date, format = "yyyy-MM-dd") {
    const dateObj = this._ensureDate(date);
    return this.formatDateSimple(dateObj, format);
  }

  /**
   * Simple date formatter
   * @param {Date} date - Date object
   * @param {string} format - Format string
   * @returns {string} Formatted date
   */
  formatDateSimple(date, format) {
    // Get date components
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    const day = date.getDate();
    const weekday = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Month names
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthNamesShort = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Weekday names
    const weekdayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const weekdayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Format the date based on known format patterns
    if (format === "yyyy-MM-dd") {
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    }

    if (format === "MM/dd/yyyy") {
      return `${String(month + 1).padStart(2, "0")}/${String(day).padStart(
        2,
        "0"
      )}/${year}`;
    }

    if (format === "dddd, MMMM d, yyyy") {
      return `${weekdayNames[weekday]}, ${monthNames[month]} ${day}, ${year}`;
    }

    // Default fallback
    return date.toLocaleDateString();
  }

  /**
   * Calculate age from birthdate
   * @param {Date|string} birthdate - Birthdate
   * @returns {number} Age in years
   */
  calculateAge(birthdate) {
    const birthdateObj = this._ensureDate(birthdate);
    const currentDate = this.getCurrentDate();

    let age = currentDate.getFullYear() - birthdateObj.getFullYear();

    // Adjust age if birthday hasn't occurred yet this year
    const currentMonth = currentDate.getMonth();
    const birthMonth = birthdateObj.getMonth();

    if (
      birthMonth > currentMonth ||
      (birthMonth === currentMonth &&
        birthdateObj.getDate() > currentDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Check if a date is in the future
   * @param {Date|string} date - Date to check
   * @returns {boolean} True if the date is in the future
   */
  isFutureDate(date) {
    const dateObj = this._ensureDate(date);
    const currentDate = this.getCurrentDate();

    return dateObj > currentDate;
  }

  /**
   * Check if a date is in the past
   * @param {Date|string} date - Date to check
   * @returns {boolean} True if the date is in the past
   */
  isPastDate(date) {
    const dateObj = this._ensureDate(date);
    const currentDate = this.getCurrentDate();

    return dateObj < currentDate;
  }

  /**
   * Calculate the difference between two dates in days
   * @param {Date|string} date1 - First date
   * @param {Date|string} date2 - Second date
   * @returns {number} Difference in days
   */
  daysBetween(date1, date2) {
    const date1Obj = this._ensureDate(date1);
    const date2Obj = this._ensureDate(date2);

    // Convert both dates to milliseconds and get the difference
    const diffTime = Math.abs(date2Obj - date1Obj);

    // Convert difference to days
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Ensure a date object is returned
   * @param {Date|string} date - Date or date string
   * @returns {Date} Date object
   * @private
   */
  _ensureDate(date) {
    if (date instanceof Date) {
      return date;
    }

    return new Date(date);
  }
}

// Singleton instance
let dateSystem = null;

/**
 * Initialize the date system
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
async function initializeDateSystem() {
  console.log("Initializing Date Verification System...");

  try {
    // Create date system if it doesn't exist
    if (!dateSystem) {
      dateSystem = new DateSystem();
      const initialized = dateSystem.initialize();

      if (!initialized) {
        throw new Error("Failed to initialize Date Verification System");
      }

      // Set up global DATE_SYSTEM reference
      console.log("Setting up global DATE_SYSTEM reference");
      globalThis.DATE_SYSTEM = dateSystem;
    }

    // Update URDAFX_SYSTEM status
    globalThis.URDAFX_SYSTEM.dateInitialized = true;

    console.log("Date Verification System initialized successfully");

    return true;
  } catch (error) {
    console.error("Error initializing Date Verification System:", error);
    return false;
  }
}

// Module exports
module.exports = {
  initializeDateSystem,
  getDateSystem: () => dateSystem,
};
