export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const apiKey = localStorage.getItem('apifyApiKey');
  const currentUser = localStorage.getItem('currentUser');
  
  return !!(apiKey && currentUser);
};

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('apifyApiKey');
  localStorage.removeItem('currentUser');
};

export const redirectToAuth = (): void => {
  if (typeof window === 'undefined') return;
  
  window.location.href = '/auth';
};

export const redirectToDashboard = (): void => {
  if (typeof window === 'undefined') return;
  
  window.location.href = '/dashboard';
};
