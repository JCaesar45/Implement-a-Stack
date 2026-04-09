let stackData = [];
let historyLog = [];
let matrixActive = true;
let particles = [];

const canvas = document.getElementById("matrix-canvas");
const ctx = canvas.getContext("2d");
let matrixColumns = [];
let drops = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  matrixColumns = Math.floor(canvas.width / 18);
  drops = Array(matrixColumns).fill(1);
}

function drawMatrix() {
  if (!matrixActive) return;
  ctx.fillStyle = "rgba(5, 8, 15, 0.12)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00ff88";
  ctx.font = "15px monospace";

  for (let i = 0; i < drops.length; i++) {
    const text =
      Math.random() > 0.7
        ? "⇧"
        : Math.random() > 0.5
        ? "⇩"
        : "01"[Math.floor(Math.random() * 2)];
    ctx.fillText(text, i * 18, drops[i] * 18);

    if (drops[i] * 18 > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 9;
    this.vy = (Math.random() - 0.5) * 9 - 3;
    this.life = 65;
    this.color = color;
    this.size = Math.random() * 7 + 3;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.18;
    this.life--;
    this.size *= 0.96;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.life / 65;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

function createParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
}

function renderStack() {
  const container = document.getElementById("stack-container");
  container.innerHTML = "";

  document.getElementById("size-value").textContent = stackData.length;
  document.getElementById("empty-value").textContent =
    stackData.length === 0 ? "TRUE" : "FALSE";
  document.getElementById("empty-value").className =
    stackData.length === 0 ? "true" : "";

  stackData.forEach((val, index) => {
    const el = document.createElement("div");
    el.className = "stack-element";
    el.style.borderColor =
      index === stackData.length - 1 ? "#ff00cc" : "#00f7ff";
    el.style.transform = `perspective(800px) rotateX(${
      index % 2 === 0 ? "4" : "-4"
    }deg)`;

    let displayVal = val;
    if (val === undefined) displayVal = "undefined";
    else if (val === null) displayVal = "null";
    else if (typeof val === "boolean") displayVal = val ? "true" : "false";
    else if (typeof val === "object") displayVal = JSON.stringify(val);

    el.innerHTML = `<span>${displayVal}</span><small style="position:absolute;top:8px;right:12px;font-size:10px;opacity:0.4;">${index}</small>`;
    container.appendChild(el);
  });

  if (stackData.length > 12) {
    document.getElementById("overflow").style.opacity = 1;
    setTimeout(() => {
      document.getElementById("overflow").style.opacity = 0;
    }, 1600);
  }
}

function handlePush() {
  const input = document.getElementById("push-input").value.trim();
  let value = input;

  if (input === "") return;
  if (input === "true") value = true;
  else if (input === "false") value = false;
  else if (input === "null") value = null;
  else if (input === "undefined") value = undefined;
  else if (!isNaN(parseFloat(input)) && input.trim() !== "")
    value = parseFloat(input);
  else if (input.startsWith("{") || input.startsWith("[")) {
    try {
      value = JSON.parse(input);
    } catch (e) {}
  }

  stackData.push(value);
  renderStack();

  const topEl = document.querySelector(".stack-element:last-child");
  if (topEl) {
    const rect = topEl.getBoundingClientRect();
    createParticles(rect.left + rect.width / 2, rect.top + 30, 42, "#ff00cc");
  }

  addToHistory(`PUSH → ${value}`);
  document.getElementById("push-input").value = "";
  updateMiniTerminal(`✓ pushed ${JSON.stringify(value)}`);
}

function handlePop() {
  if (stackData.length === 0) {
    document.getElementById("underflow").style.opacity = 1;
    setTimeout(
      () => (document.getElementById("underflow").style.opacity = 0),
      1400
    );
    updateMiniTerminal("✗ UNDERFLOW — stack empty");
    return;
  }

  const popped = stackData.pop();
  renderStack();

  const topEl = document.querySelector(".stack-element:last-child");
  if (topEl) topEl.classList.add("popping");

  createParticles(
    window.innerWidth * 0.3,
    window.innerHeight * 0.4,
    28,
    "#00ff88"
  );
  addToHistory(`POP ← ${popped}`);
  updateMiniTerminal(`✓ popped ${JSON.stringify(popped)}`);
}

function handlePeek() {
  const val = stackData[stackData.length - 1];
  updateMiniTerminal(
    `PEEK → ${val !== undefined ? JSON.stringify(val) : "undefined"}`
  );
  if (val !== undefined) {
    const container = document.getElementById("stack-container");
    container.style.animation = "peekShake 280ms";
    setTimeout(() => (container.style.animation = ""), 300);
  }
}

function handleIsEmpty() {
  const empty = stackData.length === 0;
  updateMiniTerminal(`IS EMPTY? ${empty ? "✅ YES" : "❌ NO"}`);
}

function handleClear() {
  const oldLength = stackData.length;
  stackData = [];
  renderStack();
  createParticles(window.innerWidth / 2, window.innerHeight / 2, 88, "#ff00cc");
  addToHistory(`CLEAR — ${oldLength} items purged`);
  updateMiniTerminal("✓ stack cleared");
}

function addToHistory(msg) {
  historyLog.unshift({
    time: new Date().toLocaleTimeString("en-US", { hour12: false }),
    msg
  });
  if (historyLog.length > 12) historyLog.pop();

  const list = document.getElementById("history-list");
  list.innerHTML = historyLog
    .map(
      (item) =>
        `<div class="history-item"><span>${item.time}</span><span>${item.msg}</span></div>`
    )
    .join("");
}

function updateMiniTerminal(text) {
  const output = document.getElementById("terminal-output");
  const entry = document.createElement("div");
  entry.textContent = `> ${text}`;
  output.appendChild(entry);
  output.scrollTop = output.scrollHeight;
  if (output.children.length > 9) output.removeChild(output.children[0]);
}

function runTerminalCommand() {
  const input = document.getElementById("terminal-input");
  const cmd = input.value.trim().toLowerCase();
  input.value = "";

  if (cmd.startsWith("push ")) {
    const val = cmd.slice(5);
    const fakeInput = document.getElementById("push-input");
    fakeInput.value = val;
    handlePush();
  } else if (cmd === "pop") handlePop();
  else if (cmd === "peek") handlePeek();
  else if (cmd === "clear" || cmd === "reset") handleClear();
  else if (cmd === "isempty") handleIsEmpty();
  else updateMiniTerminal("unknown command — try: push 42, pop, peek");
}

function toggleTerminal() {
  const mini = document.getElementById("mini-terminal");
  mini.style.display = mini.style.display === "flex" ? "none" : "flex";
}

function showCodePanel() {
  document.getElementById("code-vault").classList.remove("hidden");
  switchLang(0);
}

function hideCodePanel() {
  document.getElementById("code-vault").classList.add("hidden");
}

let currentLang = 0;
const langCodes = {
  0: `function push(stack, element) {
  stack.collection.push(element);
}

function pop(stack) {
  return stack.collection.length ? stack.collection.pop() : undefined;
}

function peek(stack) {
  return stack.collection.length ? stack.collection[stack.collection.length-1] : undefined;
}

function isEmpty(stack) {
  return stack.collection.length === 0;
}

function clear(stack) {
  stack.collection.length = 0;
}`,
  1: `class Stack:
    def __init__(self):
        self._items = []
    def push(self, element):
        self._items.append(element)
    def pop(self):
        return self._items.pop() if self._items else None
    def peek(self):
        return self._items[-1] if self._items else None
    def isEmpty(self):
        return len(self._items) == 0
    def clear(self):
        self._items.clear()`,
  2: `import java.util.ArrayList;
public class Stack {
    private ArrayList<Object> items = new ArrayList<>();
    public void push(Object element) { items.add(element); }
    public Object pop() {
        return items.isEmpty() ? null : items.remove(items.size()-1);
    }
    public Object peek() {
        return items.isEmpty() ? null : items.get(items.size()-1);
    }
    public boolean isEmpty() { return items.isEmpty(); }
    public void clear() { items.clear(); }
}`
};

function switchLang(n) {
  currentLang = n;
  document
    .querySelectorAll(".lang-tab")
    .forEach((t, i) => t.classList.toggle("active", i === n));
  document.getElementById("code-display").innerHTML = `<code>${langCodes[
    n
  ].replace(/\n/g, "<br>")}</code>`;
}

function copyCurrentCode() {
  const code = langCodes[currentLang];
  navigator.clipboard.writeText(code).then(() => {
    const btns = document.querySelectorAll(".copy-btn");
    btns.forEach((b) => {
      const orig = b.textContent;
      b.textContent = "COPIED ✓";
      setTimeout(() => (b.textContent = orig), 1200);
    });
  });
}

function switchTab(n) {
  document
    .querySelectorAll(".tab")
    .forEach((t, i) => t.classList.toggle("active", i === n));
  document
    .querySelectorAll(".tab-content")
    .forEach((c, i) => c.classList.toggle("active", i === n));

  if (n === 1) {
    setTimeout(drawPerfGraph, 120);
  }
}

let graphPoints = [];
function drawPerfGraph() {
  const c = document.getElementById("graph-canvas");
  const g = c.getContext("2d");
  g.clearRect(0, 0, c.width, c.height);

  graphPoints.push(Math.random() * 40 + 10);
  if (graphPoints.length > 28) graphPoints.shift();

  g.strokeStyle = "#00ff88";
  g.lineWidth = 3;
  g.shadowBlur = 15;
  g.shadowColor = "#00ff88";
  g.beginPath();
  for (let i = 0; i < graphPoints.length; i++) {
    const x = i * (c.width / graphPoints.length);
    const y = c.height - (graphPoints[i] / 70) * c.height;
    i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
  }
  g.stroke();

  g.fillStyle = "rgba(0,255,136,0.15)";
  g.lineTo(c.width, c.height);
  g.lineTo(0, c.height);
  g.fill();

  requestAnimationFrame(() => {
    if (document.getElementById("tab-content-1").classList.contains("active"))
      drawPerfGraph();
  });
}

function exportStack() {
  const data = JSON.stringify({ stack: stackData, timestamp: Date.now() });
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "neonstack-export-" + Date.now() + ".json";
  a.click();
  URL.revokeObjectURL(url);
  updateMiniTerminal("✓ stack exported");
}

function importStackPrompt() {
  const input = prompt("Paste exported JSON here:");
  if (!input) return;
  try {
    const parsed = JSON.parse(input);
    if (parsed.stack && Array.isArray(parsed.stack)) {
      stackData = parsed.stack;
      renderStack();
      updateMiniTerminal("✓ stack imported successfully");
    }
  } catch (e) {
    updateMiniTerminal("✗ invalid JSON");
  }
}

function clearAll() {
  stackData = [];
  historyLog = [];
  renderStack();
  document.getElementById("history-list").innerHTML = "";
  updateMiniTerminal("MATRIX RESET COMPLETE");
}

function easterEgg() {
  matrixActive = !matrixActive;
  if (matrixActive) {
    document.querySelector(".matrix-bg").style.opacity = "0.3";
  } else {
    document.querySelector(".matrix-bg").style.opacity = "0";
  }
  updateMiniTerminal(
    matrixActive ? "MATRIX RAIN ENABLED" : "MATRIX RAIN DISABLED"
  );
}

window.onload = function () {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  setInterval(() => {
    drawMatrix();
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
  }, 1000 / 60);

  renderStack();

  console.log(
    "%cNEONSTACK initialized — ready to impress everyone",
    "background:#00f7ff;color:#05080f;font-weight:900;padding:2px 6px"
  );
};
