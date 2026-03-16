const fs = require('fs');
const path = require('path');
const R = (v, n=3) => +v.toFixed(n);

const W = 1080, H = 1080, CX = 540, CY = 540;
const FPS = 60, FRAMES = 300;

// Board radii
const DOUBLE_O = 320, DOUBLE_I = 300;
const TREBLE_O = 195, TREBLE_I = 180;
const BULL_O = 55, BULL_I = 22;
const BOARD_R = DOUBLE_O;
const NUMS = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];

// Colors [r,g,b,a] in 0-1
function hex(h) {
  return [R(parseInt(h.slice(1,3),16)/255), R(parseInt(h.slice(3,5),16)/255), R(parseInt(h.slice(5,7),16)/255), 1];
}
const C = {
  black:hex('#1c1c1c'), cream:hex('#f5e6c8'), red:hex('#d62839'), green:hex('#1b6b3a'),
  wire:hex('#a8a8a8'), bg:hex('#111111'), dartBody:hex('#2a2a5e'), dartTip:hex('#b0b0b0'),
  flight:hex('#d62839'), flightHL:hex('#f05565'), shaft:hex('#222222'),
  yellow:hex('#ffdd57'), white:hex('#ffffff'), flash:hex('#ffffe0'),
};

// === Lottie helpers ===
const sv = v => ({a:0,k:v});
const av = k => ({a:1,k});
const z2 = [0,0];

function arcPath(rO, rI, t1, t2) {
  const k = R((4/3)*Math.tan((t2-t1)/4));
  const c1=Math.cos(t1),s1=Math.sin(t1),c2=Math.cos(t2),s2=Math.sin(t2);
  return {
    v:[[R(rO*c1),R(rO*s1)],[R(rO*c2),R(rO*s2)],[R(rI*c2),R(rI*s2)],[R(rI*c1),R(rI*s1)]],
    i:[z2,[R(k*rO*s2),R(-k*rO*c2)],z2,[R(-k*rI*s1),R(k*rI*c1)]],
    o:[[R(-k*rO*s1),R(k*rO*c1)],z2,[R(k*rI*s2),R(-k*rI*c2)],z2],
    c:true
  };
}

function circle(r) {
  const k=R(r*0.5522847498);
  return {v:[[r,0],[0,r],[-r,0],[0,-r]],i:[[0,-k],[k,0],[0,k],[-k,0]],o:[[0,k],[-k,0],[0,-k],[k,0]],c:true};
}

function line(x1,y1,x2,y2) {
  return {v:[[R(x1),R(y1)],[R(x2),R(y2)]],i:[z2,z2],o:[z2,z2],c:false};
}

const sh = p => ({ty:'sh',ks:sv(p)});
const fl = (c,o=100) => ({ty:'fl',c:sv(c),o:sv(o),r:1});
const st = (c,w) => ({ty:'st',c:sv(c),o:sv(100),w:sv(w),lc:2,lj:2});
const trS = (px=0,py=0) => ({ty:'tr',p:sv([px,py]),a:sv(z2),s:sv([100,100]),r:sv(0),o:sv(100)});
const trA = props => ({ty:'tr',p:sv(z2),a:sv(z2),s:sv([100,100]),r:sv(0),o:sv(100),...props});
const gr = (items,nm,t) => ({ty:'gr',nm,it:[...items,t||trS()]});

function layer4(shapes,nm,ks,ip=0,op=FRAMES) {
  return {ty:4,nm,ip,op,st:0,sr:1,bm:0,ks,shapes};
}

// === Board shapes ===
function boardShapes() {
  const out = [];
  const seg = Math.PI*2/20;
  const off = -Math.PI/2 - seg/2;

  // Background circle
  out.push(gr([sh(circle(BOARD_R+15)),fl(C.bg)],'BG'));

  // 80 segments (20 positions x 4 rings)
  const rings = [[DOUBLE_O,DOUBLE_I,true],[DOUBLE_I,TREBLE_O,false],[TREBLE_O,TREBLE_I,true],[TREBLE_I,BULL_O,false]];
  for (let i=0;i<20;i++) {
    const a1=off+i*seg, a2=a1+seg, even=i%2===0;
    for (const [ro,ri,scoring] of rings) {
      const col = scoring ? (even?C.red:C.green) : (even?C.black:C.cream);
      out.push(gr([sh(arcPath(ro,ri,a1,a2)),fl(col)],`S${i}`));
    }
  }

  // Bulls
  out.push(gr([sh(circle(BULL_O)),fl(C.green)],'OB'));
  out.push(gr([sh(circle(BULL_I)),fl(C.red)],'IB'));

  // Wire lines
  for (let i=0;i<20;i++) {
    const a=off+i*seg;
    out.push(gr([sh(line(Math.cos(a)*BULL_O,Math.sin(a)*BULL_O,Math.cos(a)*DOUBLE_O,Math.sin(a)*DOUBLE_O)),st(C.wire,1.2)],`WL${i}`));
  }

  // Wire rings
  for (const r of [DOUBLE_O,DOUBLE_I,TREBLE_O,TREBLE_I,BULL_O,BULL_I])
    out.push(gr([sh(circle(r)),st(C.wire,0.8)],`WR${r}`));

  // Reverse: in Lottie, shapes[0] renders on top, shapes[last] on bottom
  out.reverse();
  return out;
}

// === Dart shapes ===
function dartShapes() {
  const z=[0,0], z3=[z,z,z], z4=[z,z,z,z];
  const p = (v,c=true) => ({v,i:v.map(()=>z),o:v.map(()=>z),c});
  return [
    gr([sh(p([[40,0],[8,-3],[8,3]])),fl(C.dartTip)],'Tip'),
    gr([sh(p([[8,-6],[-45,-5],[-45,5],[8,6]])),fl(C.dartBody)],'Barrel'),
    gr([sh(p([[-75,-2.5],[-45,-2.5],[-45,2.5],[-75,2.5]])),fl(C.shaft)],'Shaft'),
    gr([sh(p([[-75,-2],[-115,-28],[-105,-2]])),fl(C.flight)],'FT'),
    gr([sh(p([[-78,-2],[-112,-22],[-103,-2]])),fl(C.flightHL)],'FTh'),
    gr([sh(p([[-75,2],[-115,28],[-105,2]])),fl(C.flight)],'FB'),
    gr([sh(p([[-78,2],[-112,22],[-103,2]])),fl(C.flightHL)],'FBh'),
  ];
}

// === Build Lottie ===
function build() {
  const d1 = {fs:25,fe:50,sx:-80,sy:980,ex:CX+2,ey:CY+1,ss:1.1};
  const d2 = {fs:100,fe:125,sx:1160,sy:920,ex:CX-6,ey:CY+5,ss:1.05};
  d1.ang = R(Math.atan2(d1.ey-d1.sy,d1.ex-d1.sx)*180/Math.PI);
  d2.ang = R(Math.atan2(d2.ey-d2.sy,d2.ex-d2.sx)*180/Math.PI);

  // --- Board shake ---
  const shakeKfs = [{t:0,s:[CX,CY],h:1}];
  function addShake(hf) {
    for (let f=0;f<=12;f++) {
      const t=f/12, decay=6*(1-t);
      shakeKfs.push({t:hf+f, s:[R(CX+Math.sin(t*Math.PI*8)*decay), R(CY+Math.cos(t*Math.PI*6)*decay)]});
    }
    shakeKfs.push({t:hf+13,s:[CX,CY],h:1});
  }
  addShake(d1.fe);
  addShake(d2.fe);
  shakeKfs.push({t:FRAMES,s:[CX,CY]});

  const board = layer4(boardShapes(),'Board',{
    p:av(shakeKfs), a:sv(z2), s:sv([100,100]), r:sv(0),
    o:av([{t:0,s:[0],i:{x:[.5],y:[1]},o:{x:[.5],y:[0]}},{t:20,s:[100]}]),
  });

  // --- Dart layers ---
  const eI={x:[.25,.25],y:[1,1]}, eO={x:[.75,.75],y:[0,0]};
  function makeDart(d,nm) {
    const rotKfs = [{t:0,s:[d.ang],h:1},{t:d.fe,s:[d.ang]}];
    for (let f=1;f<=20;f++) {
      const t=f/20;
      rotKfs.push({t:d.fe+f, s:[R(d.ang + Math.sin(t*Math.PI*4)*3.5*(1-t))]});
    }
    rotKfs.push({t:d.fe+21,s:[d.ang]});

    return layer4(dartShapes(),nm,{
      p:av([{t:0,s:[d.sx,d.sy],h:1},{t:d.fs,s:[d.sx,d.sy],i:eI,o:eO},{t:d.fe,s:[d.ex,d.ey]}]),
      a:sv(z2),
      s:av([{t:0,s:[200,200],h:1},{t:d.fs,s:[200,200],i:eI,o:eO},{t:d.fe,s:[R(d.ss*100),R(d.ss*100)]}]),
      r:av(rotKfs),
      o:av([{t:0,s:[0],h:1},{t:d.fs,s:[100]}]),
    });
  }

  // --- Impact layers ---
  function makeImpact(hf,x,y,nm) {
    return layer4([
      gr([
        {ty:'el',nm:'Ring',d:1,p:sv(z2),s:av([{t:hf,s:[30,30],i:{x:[.5,.5],y:[1,1]},o:{x:[.5,.5],y:[0,0]}},{t:hf+30,s:[160,160]}])},
        st(C.yellow,3),
      ],'Ring',trA({o:av([{t:hf,s:[80]},{t:hf+30,s:[0]}])})),
      gr([
        {ty:'el',nm:'Flash',d:1,p:sv(z2),s:av([{t:hf,s:[24,24]},{t:hf+10,s:[2,2]}])},
        fl(C.flash),
      ],'Flash',trA({o:av([{t:hf,s:[80]},{t:hf+10,s:[0]}])})),
    ],nm,{
      p:sv([x,y]),a:sv(z2),s:sv([100,100]),r:sv(0),
      o:av([{t:0,s:[0],h:1},{t:hf,s:[100]},{t:hf+30,s:[0]}]),
    });
  }

  // --- Text layers ---
  const tF=160;
  const tI={x:[.64,.64],y:[1,1]}, tO={x:[.34,.34],y:[1.56,1.56]};
  function txt(nm,text,sz,col,x,y,font,animIn=true) {
    const ks = {
      p:sv([x,y]),a:sv(z2),r:sv(0),
    };
    if (animIn) {
      ks.s = sv([100,100]);
      ks.o = av([{t:0,s:[0],h:1},{t:tF,s:[0],i:{x:[.5],y:[1]},o:{x:[.5],y:[0]}},{t:tF+15,s:[100]}]);
    } else {
      ks.s = sv([100,100]);
      ks.o = sv(100);
    }
    return {
      ty:5,nm,ip:0,op:FRAMES,st:0,sr:1,bm:0,ks,
      t:{
        d:{k:[{s:{s:sz,f:font,t:text,fc:col.slice(0,3),sc:[0,0,0],sh:0,of:false,j:2,sz:[800,sz+20],ps:[-400,-(sz/2+5)],lh:R(sz*1.2),ls:0,tr:0},t:0}]},
        p:{},m:{g:1,a:{a:0,k:[0,0,0]}},a:[],
      },
    };
  }

  // Number labels around the board (parented to board layer for shake)
  const segA = Math.PI*2/20;
  const offA = -Math.PI/2 - segA/2;
  const numLayers = [];
  for (let i=0; i<20; i++) {
    const a = offA + segA/2 + i*segA;
    const nr = BOARD_R + 30;
    const nx = R(Math.cos(a)*nr);
    const ny = R(Math.sin(a)*nr);
    numLayers.push(txt(`N${NUMS[i]}`,String(NUMS[i]),28,[0.878,0.878,0.878,1],nx,ny,'Arial-BoldMT',false));
  }

  const layers = [
    txt('Score','50 + 50 = 100',34,C.white,CX,CY-BOARD_R-15,'ArialMT'),
    txt('Bullseye','BULLSEYE!',68,C.yellow,CX,CY-BOARD_R-70,'Arial-BoldMT'),
    makeImpact(d2.fe,d2.ex,d2.ey,'Impact2'),
    makeImpact(d1.fe,d1.ex,d1.ey,'Impact1'),
    makeDart(d2,'Dart2'),
    makeDart(d1,'Dart1'),
    ...numLayers,
    board,
  ];
  layers.forEach((l,i)=>{l.ind=i;});

  // Parent number labels to the board layer so they shake together
  const boardIdx = layers.indexOf(board);
  // Also match board's fade-in opacity for numbers
  for (const nl of numLayers) {
    nl.parent = boardIdx;
    nl.ks.o = av([{t:0,s:[0],i:{x:[.5],y:[1]},o:{x:[.5],y:[0]}},{t:20,s:[100]}]);
  }

  return {
    v:'5.7.1',fr:FPS,ip:0,op:FRAMES,w:W,h:H,nm:'Dartboard Animation',ddd:0,
    assets:[],
    fonts:{list:[
      {fName:'Arial-BoldMT',fFamily:'Arial',fStyle:'Bold',ascent:71.5},
      {fName:'ArialMT',fFamily:'Arial',fStyle:'Regular',ascent:71.5},
    ]},
    layers,
    markers:[],
  };
}

const outPath = path.join(__dirname, 'dartboard.json');
fs.writeFileSync(outPath, JSON.stringify(build()));
console.log('Generated ' + outPath);
