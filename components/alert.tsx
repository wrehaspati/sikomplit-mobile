import { router } from "expo-router";

interface FullscreenAlertProps {
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'info';
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

/**
 * Navigates to a fullscreen alert screen with the provided props
 * @param title - main title of the alert
 * @param message - additional message for the alert
 * @param type - type of the alert (success, error, info)
 * @param description - detailed description of the alert
 * @param buttonText - text for the alert button
 * @param buttonHref - navigation route for the alert button
 * @returns null
 */
export function FullscreenAlert({ title, message, type, description, buttonText = "Kembali", buttonHref = "/" }: FullscreenAlertProps) {
  if (!title || !type) {
    console.error("Missing required props for FullscreenAlert");
    return null;
  }
  router.push({ pathname: '/fullscreen-alert', params: { title, message, type, description, buttonText, buttonHref } });
  return null;
}