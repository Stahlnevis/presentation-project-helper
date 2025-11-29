console.log("SafeGuard Protection Active");

// Listen for PrintScreen key (try both keyup and keydown for better compatibility)
document.addEventListener('keyup', function (e) {
  if (e.key === 'PrintScreen') {
    showSafeGuardModal();
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'PrintScreen') {
    showSafeGuardModal();
  }
});

function showSafeGuardModal() {
  // Check if modal already exists
  if (document.getElementById('safeguard-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'safeguard-modal';
  modal.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    background: #0f172a;
    color: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    z-index: 999999;
    font-family: system-ui, -apple-system, sans-serif;
    border: 1px solid #1e293b;
    animation: slideIn 0.3s ease-out;
  `;

  modal.innerHTML = `
    <style>
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .sg-btn {
        display: block;
        width: 100%;
        padding: 10px;
        margin-top: 10px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: opacity 0.2s;
      }
      .sg-btn:hover { opacity: 0.9; }
      .sg-primary { background: #0ea5e9; color: white; }
      .sg-secondary { background: #334155; color: white; }
    </style>
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
      <span style="font-size: 24px;">🛡️</span>
      <div>
        <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Screenshot Detected</h3>
        <p style="margin: 2px 0 0; font-size: 12px; color: #94a3b8;">SafeGuard Protection</p>
      </div>
    </div>
    <p style="margin: 0 0 15px; font-size: 14px; line-height: 1.4;">
      Do you want to securely upload this evidence to your vault?
    </p>
    <button id="sg-secure-btn" class="sg-btn sg-primary">
      🔐 Secure Evidence Now
    </button>
    <button id="sg-close-btn" class="sg-btn sg-secondary">
      Dismiss
    </button>
  `;

  document.body.appendChild(modal);

  document.getElementById('sg-secure-btn').addEventListener('click', () => {
    window.open('https://presentation-project-helper.vercel.app', '_blank');
    removeModal();
  });

  document.getElementById('sg-close-btn').addEventListener('click', removeModal);

  function removeModal() {
    modal.style.animation = 'slideIn 0.3s ease-in reverse';
    setTimeout(() => modal.remove(), 300);
  }
}
