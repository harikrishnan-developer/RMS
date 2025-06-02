import { showError } from './toastUtils';

/**
 * Handle API errors consistently across the application
 * @param {Error} error - The error object
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @param {Function} clearAction - Redux action to clear error state (optional)
 * @returns {string} Error message
 */
export const handleApiError = (error, dispatch = null, clearAction = null) => {
  let errorMessage = 'An unexpected error occurred';

  // Handle specific error responses from the API
  if (error.response) {
    // The server responded with a status code outside the 2xx range
    const { status, data } = error.response;

    if (data && data.message) {
      errorMessage = data.message;
    } else if (status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
      // Handle token expiration or auth failure
      if (window.localStorage.getItem('token')) {
        window.localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (status === 422) {
      errorMessage = 'Validation error. Please check your inputs.';
    } else if (status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'Network error. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an error
    errorMessage = error.message || 'Request error. Please try again.';
  }

  // Show error toast
  showError(errorMessage);

  // Dispatch an action to clear the error state if provided
  if (dispatch && clearAction) {
    setTimeout(() => {
      dispatch(clearAction());
    }, 5000);
  }

  return errorMessage;
};

/**
 * Handle form validation errors
 * @param {Object} errors - Formik errors object
 * @returns {void}
 */
export const handleFormErrors = (errors) => {
  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0];
    showError(firstError);
  }
};
