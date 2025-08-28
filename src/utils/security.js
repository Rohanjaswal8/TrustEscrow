export const preventRightClick = () => {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
};

export const preventScreenshot = () => {
  // Prevent PrintScreen key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'PrintScreen') {
      e.preventDefault();
    }
  });

  // Prevent Alt + PrintScreen
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'PrintScreen') {
      e.preventDefault();
    }
  });

  // Prevent Windows + Shift + S
  document.addEventListener('keydown', (e) => {
    if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
    }
  });
};

export const setupSecurity = () => {
  preventRightClick();
  preventScreenshot();
}; 