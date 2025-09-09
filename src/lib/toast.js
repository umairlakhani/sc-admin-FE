export function showToast(message, type = 'success') {
  const detail = { id: Math.random().toString(36).slice(2), message, type }
  window.dispatchEvent(new CustomEvent('app:toast', { detail }))
}


