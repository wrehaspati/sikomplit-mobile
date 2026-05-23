/**
 * Formats a date string into a more readable format (e.g., "12 Jan 2024")
 * @param date 
 * @returns Formatted date string
 */
export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Formats a date string into a more readable format with time (e.g., "12 Jan 2024, 14:30")
 * @param date 
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};