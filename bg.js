// Fondo líquido animado (inspirado en monopo.vn), en negro y azul.
// Se dibuja con WebGL a baja resolución para que no pese en el celular.
// Con "reducir movimiento" activado queda una imagen quieta.
(() => {
  const canvas = document.getElementById("bg");
  const gl = canvas && canvas.getContext("webgl", { alpha: false, antialias: false, depth: false });
  if (!gl) return; // sin WebGL queda el degradé de CSS

  const vert = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;
  const frag = `
    precision mediump float;
    uniform vec2 res;
    uniform float t;
    uniform float dim;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
                 mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.0 + 13.7; a *= 0.5; }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / res;
      vec2 p = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y) * 1.6;

      // Deformación en capas: da el movimiento de líquido
      vec2 q = vec2(fbm(p + t * 0.05), fbm(p + vec2(5.2, 1.3) - t * 0.04));
      vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.06),
                    fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.05));
      float f = fbm(p + 3.5 * r);

      vec3 black = vec3(0.0);
      vec3 navy  = vec3(0.016, 0.07, 0.20);
      vec3 blue  = vec3(0.0, 0.443, 0.89);   // #0071e3
      vec3 light = vec3(0.16, 0.59, 1.0);    // #2997ff

      vec3 col = mix(black, navy, smoothstep(0.2, 0.6, f));
      col = mix(col, blue, smoothstep(0.55, 0.85, f) * 0.85);
      col = mix(col, light, smoothstep(0.78, 0.98, f * length(r)) * 0.5);

      // Más luz arriba (detrás del título), más oscuro abajo y en los bordes
      float vig = smoothstep(1.25, 0.2, length((uv - vec2(0.5, 0.72)) * vec2(1.0, 1.3)));
      col *= mix(0.25, 1.0, vig) * dim;

      gl_FragColor = vec4(col, 1.0);
    }`;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "res");
  const uT = gl.getUniformLocation(prog, "t");
  const uDim = gl.getUniformLocation(prog, "dim");

  // Resolución baja: el difuminado esconde los píxeles y ahorra batería
  const SCALE = 0.35;
  function resize() {
    canvas.width = Math.max(1, Math.round(innerWidth * SCALE));
    canvas.height = Math.max(1, Math.round(innerHeight * SCALE));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }

  // Al bajar por la página el fondo se apaga un poco para que se lean las tarjetas
  const dim = () => 1 - 0.45 * Math.min(1, scrollY / innerHeight);

  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let start = performance.now(), last = 0, raf = 0;

  function draw(now) {
    gl.uniform1f(uT, (now - start) / 1000);
    gl.uniform1f(uDim, dim());
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < 33) return; // ~30 cuadros por segundo alcanzan
    last = now;
    draw(now);
  }
  function run() {
    cancelAnimationFrame(raf);
    if (still.matches || document.hidden) draw(start + 20000);
    else raf = requestAnimationFrame(loop);
  }

  resize();
  run();
  addEventListener("resize", () => { resize(); if (still.matches) run(); });
  addEventListener("scroll", () => { if (still.matches) run(); }, { passive: true });
  document.addEventListener("visibilitychange", run);
  still.addEventListener("change", run);
})();
