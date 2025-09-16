/**
 * Centralized date formatting utilities
 * Format: day month year (e.g., 01 September 2025)
 * Timestamp format: day month year 24hr:mm:ss (e.g., 01 September 2025 15:15:00)
 */

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Format a date to "dd month yyyy" format
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string (e.g., "01 September 2025")
 */
export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
};

/**
 * Format a date to "dd month yyyy HH:mm:ss" format
 * @param date - Date object, string, or timestamp
 * @returns Formatted timestamp string (e.g., "01 September 2025 15:15:00")
 */
export const formatDateTime = (date: Date | string | number): string => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  
  return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Format a date for display in UI components (same as formatDate)
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string (e.g., "01 September 2025")
 */
export const formatDisplayDate = (date: Date | string | number): string => {
  return formatDate(date);
};

/**
 * Format a date for calendar/datepicker display
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string (e.g., "01 September 2025")
 */
export const formatCalendarDate = (date: Date | string | number): string => {
  return formatDate(date);
};

/**
 * Format a date for logs and alerts
 * @param date - Date object, string, or timestamp
 * @returns Formatted timestamp string (e.g., "01 September 2025 15:15:00")
 */
export const formatLogDate = (date: Date | string | number): string => {
  return formatDateTime(date);
};

/**
 * Get current date in the standard format
 * @returns Current date formatted as "dd month yyyy"
 */
export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

/**
 * Get current timestamp in the standard format
 * @returns Current timestamp formatted as "dd month yyyy HH:mm:ss"
 */
export const getCurrentDateTime = (): string => {
  return formatDateTime(new Date());
};

/**
 * Parse a date string and return a Date object
 * @param dateString - Date string in various formats
 * @returns Date object or null if invalid
 */
export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Check if a date string is valid
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export const isValidDate = (dateString: string): boolean => {
  return parseDate(dateString) !== null;
};

/**
 * Format a date for form inputs (ISO format for HTML date inputs)
 * @param date - Date object, string, or timestamp
 * @returns ISO date string (YYYY-MM-DD) for form inputs
 */
export const formatInputDate = (date: Date | string | number): string => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  return d.toISOString().split('T')[0];
};

/**
 * Format a date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: Date | string | number, endDate: Date | string | number): string => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};
