import '@testing-library/jest-dom';

// Ensure localStorage is clean before each test
beforeEach(() => {
  window.localStorage.clear();
});
