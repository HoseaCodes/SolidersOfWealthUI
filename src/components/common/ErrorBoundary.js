import React from 'react';
import { toast } from 'react-toastify';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  React.useEffect(() => {
    toast.error('An error occurred. Please try again.');
  }, [error]);

  return (
    <div className="error-boundary">
      <div className="error-content">
        <h2>Something went wrong</h2>
        <pre className="error-details">{error.message}</pre>
        <button 
          className="retry-button"
          onClick={resetErrorBoundary}
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export { ErrorFallback };
