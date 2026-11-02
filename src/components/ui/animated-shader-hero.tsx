import React, { useRef, useEffect } from 'react';

interface HeroProps {
  trustBadge?: { text: string; icons?: string[] };
  headline: { line1: string; line2: string };
  subtitle: string;
  buttons?: {
    primary?: { text: string; onClick?: () => void };
    secondary?: { text: string; onClick?: () => void };
  };
}

const VERTEX_SRC = `#version 300 es
precision highp float;
in vec4 position;
void main(){ gl_Position = position; }`;

const FRAG_SRC = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p){
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p){
  vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  float a=rnd(i),b=rnd(i+vec2(1,0)),c=rnd(i+vec2(0,1)),d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p){
  float t=0.,a=1.;mat2 m=mat2(1.,-.5,.2,1.2);
  for(int i=0;i<5;i++){t+=a*noise(p);p*=2.*m;a*=.5;}
  return t;
}
float clouds(vec2 p){
  float d=1.,t=0.;
  for(float i=0.;i<3.;i++){
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);d=a;p*=2./(i+1.);
  }
  return t;
}
void main(){
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for(float i=1.;i<12.;i++){
    uv+=.1*cos(i*vec2(.1+.01*i,.8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*.25,bg*.137,bg*.05),d);
  }
  O=vec4(col,1);
}`;

const Hero: React.FC<HeroProps> = ({ trustBadge: _trustBadge, headline: _headline, subtitle: _subtitle, buttons: _buttons }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;

    const gl = cvs.getContext('webgl2');
    if (!gl) { console.error('No WebGL2'); return; }

    const mkShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const vs = mkShader(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = mkShader(gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;

    const prg = gl.createProgram()!;
    gl.attachShader(prg, vs);
    gl.attachShader(prg, fs);
    gl.linkProgram(prg);
    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prg));
      return;
    }
    gl.useProgram(prg);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prg, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prg, 'resolution');
    const uTime = gl.getUniformLocation(prg, 'time');

    let raf = 0;
    const t0 = performance.now();

    // Force explicit dimensions immediately — do not rely on offsetWidth/clientWidth
    // which return 0 before layout in headless/preview environments
    const getDim = (): [number, number] => {
      const w = window.innerWidth
        || document.documentElement?.clientWidth
        || document.body?.clientWidth
        || screen?.width
        || 1920;
      const h = window.innerHeight
        || document.documentElement?.clientHeight
        || document.body?.clientHeight
        || screen?.height
        || 1080;
      return [Math.max(w, 1), Math.max(h, 1)];
    };

    const applySize = (w: number, h: number) => {
      const dpr = Math.max(1, (window.devicePixelRatio || 1) * 0.5);
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      // Set BOTH buffer size (attributes) AND display size (CSS) explicitly
      cvs.width = bw;
      cvs.height = bh;
      cvs.style.width = `${w}px`;
      cvs.style.height = `${h}px`;
      // Also set via setAttribute to bypass any style override issues
      cvs.setAttribute('width', String(bw));
      cvs.setAttribute('height', String(bh));
      gl.viewport(0, 0, bw, bh);
    };

    // Synchronous initial sizing
    const [iw, ih] = getDim();
    applySize(iw, ih);

    // Retry on next two frames to catch post-layout dimensions
    let retries = 0;
    const retryResize = () => {
      if (retries++ < 3) {
        const [rw, rh] = getDim();
        if (rw !== iw || rh !== ih) applySize(rw, rh);
        requestAnimationFrame(retryResize);
      }
    };
    requestAnimationFrame(retryResize);

    // Observe parent for live resize; fall back to window resize
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) applySize(width, height);
      }
    }) : null;
    if (ro && cvs.parentElement) ro.observe(cvs.parentElement);
    const onWindowResize = () => { const [w, h] = getDim(); applySize(w, h); };
    window.addEventListener('resize', onWindowResize);

    const loop = () => {
      gl.uniform2f(uRes, cvs.width, cvs.height);
      gl.uniform1f(uTime, (performance.now() - t0) * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onWindowResize);
      gl.deleteProgram(prg);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: '100vw', height: '100vh',
      overflow: 'hidden', background: '#000'
    }}>
      <canvas ref={canvasRef} style={{
        position: 'absolute', top: 0, left: 0,
        display: 'block', touchAction: 'none'
      }} />

      {/* Content overlay removed — shader-only background */}
    </div>
  );
};

export default Hero;