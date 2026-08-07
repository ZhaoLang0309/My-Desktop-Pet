const pet = document.querySelector('#pet');
const config = {
  idle: ['idle', 6], wave: ['waving', 4], sad: ['failed', 8], working: ['running', 6], review: ['review', 6],
  waiting: ['waiting', 6], jump: ['jumping', 5], runLeft: ['running-left', 8], runRight: ['running-right', 8]
};
let initial = 'idle', shown = 'idle', frame = 0, hoverArmed = true, menuOpen = false, dragging = false, jumpLoops = 0, suppressHover = false;
let dragStart;

function imagePath(state, index) { const [folder] = config[state]; return `../assets/${folder}/${String(index).padStart(2, '0')}.png`; }
function display(state) { if (shown !== state) { shown = state; frame = 0; } pet.src = imagePath(shown, frame); }
function setInitial(state) { initial = state; }
function beginJump() { if (!hoverArmed || suppressHover || menuOpen || dragging || shown !== initial) return; hoverArmed = false; jumpLoops = 0; display('jump'); }
function restoreInitial() { display(initial); }

setInterval(() => {
  const [, count] = config[shown];
  if (shown === 'jump' && frame === count - 1) {
    jumpLoops += 1;
    if (jumpLoops >= 3) restoreInitial(); else { frame = 0; pet.src = imagePath(shown, frame); }
    return;
  }
  frame = (frame + 1) % count;
  pet.src = imagePath(shown, frame);
}, 240);

pet.addEventListener('mouseenter', beginJump);
pet.addEventListener('mouseleave', () => { if (!dragging && !menuOpen) { hoverArmed = true; suppressHover = false; } });
pet.addEventListener('contextmenu', event => { event.preventDefault(); menuOpen = true; display('waiting'); window.petHost.openMenu(); });
window.petHost.onInitialState(setInitial);
window.petHost.onMenuClosed(() => { menuOpen = false; suppressHover = pet.matches(':hover'); hoverArmed = !suppressHover; restoreInitial(); });

pet.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  dragging = true; dragStart = { x: event.screenX, y: event.screenY }; pet.setPointerCapture(event.pointerId);
  window.petHost.dragStart(dragStart);
});
pet.addEventListener('pointermove', event => {
  if (!dragging) return;
  const dx = event.screenX - dragStart.x;
  if (Math.abs(dx) > 1) display(dx < 0 ? 'runLeft' : 'runRight');
  window.petHost.dragMove({ x: event.screenX, y: event.screenY });
});
pet.addEventListener('pointerup', event => {
  if (!dragging) return;
  dragging = false; window.petHost.dragEnd(); pet.releasePointerCapture(event.pointerId); restoreInitial();
});
display(initial);
