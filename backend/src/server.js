import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import tipRoutes from './routes/tip.routes.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Attach io to app so controllers can use it
app.set('io', io);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/tips', tipRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MEDDplays Tipping Server Running 🎮' });
});

// ─────────────────────────────────────────────────────────────
// Self-contained OBS / Streamlabs overlay
// Served from the backend so the fetch('/api/tips') is same-origin
// → zero CORS issues, works in any embedded CEF browser
// ─────────────────────────────────────────────────────────────
app.get('/overlay', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>MEDDplays Overlay</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:transparent!important;width:1920px;height:1080px;overflow:hidden;font-family:'Outfit',sans-serif}
#box{position:fixed;bottom:40px;left:40px;min-width:340px;max-width:440px;padding:24px 32px;border-radius:20px;overflow:hidden;color:#fff;display:none;pointer-events:none}
#box.show{display:block;animation:inA .5s cubic-bezier(.34,1.56,.64,1) forwards}
#box.hide{animation:outA .4s ease-in forwards}
@keyframes inA{from{opacity:0;transform:translateY(60px) scale(.85)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes outA{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(-40px) scale(.9)}}
#shimmer{position:absolute;inset:0;border-radius:20px;animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
.row{display:flex;align-items:center;gap:8px;margin-bottom:10px;position:relative;z-index:1}
#badge{font-size:.65rem;font-weight:800;letter-spacing:.1em;padding:3px 10px;border-radius:999px;text-transform:uppercase;color:#fff;animation:bp 1s ease-in-out infinite}
@keyframes bp{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
#tbadge{font-size:.6rem;font-weight:700;letter-spacing:.12em;padding:3px 8px;border-radius:999px;text-transform:uppercase}
#amount{display:flex;align-items:center;gap:12px;font-size:2.8rem;font-weight:900;margin-bottom:8px;position:relative;z-index:1;animation:ap .4s cubic-bezier(.34,1.56,.64,1) .1s both}
@keyframes ap{from{transform:scale(.6)}to{transform:scale(1)}}
#sender{font-size:1.1rem;font-weight:700;color:#e2d9f3;position:relative;z-index:1;animation:fs .4s ease .2s both}
#msg{font-size:.9rem;font-style:italic;color:#a78bfa;background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.2);border-radius:10px;padding:8px 12px;margin-top:10px;position:relative;z-index:1;animation:fs .4s ease .3s both;display:none}
@keyframes fs{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
#bar{position:absolute;bottom:0;left:0;height:3px;border-radius:0 0 0 20px;width:100%}
#bar.go{animation:shrink 7s linear forwards}
@keyframes shrink{from{width:100%}to{width:0%}}
.dot{position:absolute;width:4px;height:4px;border-radius:50%;animation:df 1.5s ease-in-out infinite}
@keyframes df{0%,100%{opacity:0;transform:scale(0) translateY(0)}50%{opacity:1;transform:scale(1.5) translateY(-20px)}}
</style>
</head>
<body>
<div id="box">
  <div id="shimmer"></div>
  <div id="pts"></div>
  <div class="row"><div id="badge">&#9889; NEW TIP</div><div id="tbadge"></div></div>
  <div id="amount"><span id="em"></span><span id="am"></span></div>
  <div id="sender"></div>
  <div id="msg"></div>
  <div id="bar"></div>
</div>
<script>
var POLL=4000,lid=null,lt=0,busy=false,q=[];
// Duration scales with tip amount (ms)
function getDur(a){
  if(a>=500) return 15000;  // Legendary: 15s
  if(a>=200) return 12000;  // Epic:      12s
  if(a>=100) return 10000;  // Rare:      10s
  if(a>=50)  return 7000;   // Uncommon:   7s
  if(a>=20)  return 5000;   // Common:     5s
  return 4000;              // Small tip:  4s
}
var T={
  legendary:{glow:'#f59e0b',border:'#fbbf24',bg:'rgba(251,191,36,0.12)',badge:'#f59e0b',em:'\\uD83D\\uDE80'},
  epic:     {glow:'#a855f7',border:'#c084fc',bg:'rgba(168,85,247,0.12)',badge:'#a855f7',em:'\\uD83D\\uDC51'},
  rare:     {glow:'#8b5cf6',border:'#a78bfa',bg:'rgba(139,92,246,0.12)',badge:'#8b5cf6',em:'\\uD83D\\uDC9C'},
  uncommon: {glow:'#06b6d4',border:'#67e8f9',bg:'rgba(6,182,212,0.12)',badge:'#06b6d4',em:'\\u26A1'},
  common:   {glow:'#6b7280',border:'#9ca3af',bg:'rgba(107,114,128,0.12)',badge:'#6b7280',em:'\\uD83C\\uDFAE'}
};
function tier(a){return a>=500?'legendary':a>=200?'epic':a>=100?'rare':a>=50?'uncommon':'common';}
function snd(a){
  try{var c=new(window.AudioContext||window.webkitAudioContext)(),g=c.createGain();g.connect(c.destination);
  var f=a>=200?[523,659,784,1047,1319]:a>=100?[440,554,659,880]:a>=50?[440,554,659]:[440,554];
  f.forEach(function(fr,i){var o=c.createOscillator();o.type='sine';o.frequency.value=fr;
    g.gain.setValueAtTime(.2,c.currentTime+i*.13);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+i*.13+.35);
    o.connect(g);o.start(c.currentTime+i*.13);o.stop(c.currentTime+i*.13+.5);});}catch(e){}
}
function show(tip){
  if(busy){q.push(tip);return;}busy=true;
  var tr=tier(tip.amount),t=T[tr],box=document.getElementById('box');
  box.style.background='linear-gradient(135deg,rgba(10,5,25,.97),rgba(20,10,40,.97))';
  box.style.border='2px solid '+t.border;
  box.style.boxShadow='0 0 40px '+t.glow+'88,0 20px 60px rgba(0,0,0,.7)';
  document.getElementById('shimmer').style.background='radial-gradient(ellipse at top left,'+t.bg+' 0%,transparent 70%)';
  document.getElementById('badge').style.background=t.badge;
  var tb=document.getElementById('tbadge');
  if(tr!=='common'){tb.textContent=tr;tb.style.cssText='background:'+t.badge+'22;color:'+t.badge+';border:1px solid '+t.badge+'44;font-size:.6rem;font-weight:700;letter-spacing:.12em;padding:3px 8px;border-radius:999px;text-transform:uppercase;display:inline-block';}
  else{tb.style.display='none';}
  document.getElementById('em').textContent=t.em;
  document.getElementById('am').textContent='\\u20B9'+Number(tip.amount).toLocaleString('en-IN');
  document.getElementById('am').style.color=t.badge;
  document.getElementById('sender').textContent=tip.senderName;
  var m=document.getElementById('msg');
  if(tip.message){m.textContent='\\uD83D\\uDCAC "'+tip.message+'"';m.style.display='block';}else{m.style.display='none';}
  var pts=document.getElementById('pts');pts.innerHTML='';
  var cnt=tr==='legendary'?8:tr==='epic'?5:tr==='common'?0:3;
  for(var i=0;i<cnt;i++){var p=document.createElement('div');p.className='dot';p.style.background=t.glow;p.style.top=(10+i*10)+'%';p.style.left=(10+i*9)+'%';p.style.animationDelay=(i*.2)+'s';pts.appendChild(p);}
  var dur=getDur(tip.amount);
  var bar=document.getElementById('bar');bar.style.background='linear-gradient(90deg,'+t.glow+','+t.border+')';
  bar.style.animationDuration=''; bar.className='';void bar.offsetWidth;
  bar.style.animationDuration=(dur/1000)+'s';bar.className='go';
  box.className='show';snd(tip.amount);
  setTimeout(function(){box.className='hide';setTimeout(function(){box.className='';busy=false;if(q.length)show(q.shift());},400);},dur);
}
function poll(){
  fetch('/api/tips?status=paid&limit=1',{cache:'no-store'})
  .then(function(r){return r.json();})
  .then(function(d){
    var tips=d.tips||[];if(!tips.length)return;
    var l=tips[0],i=l._id||l.id,t=new Date(l.createdAt).getTime();
    if(lid===null){lid=i;lt=t;return;}
    if(i!==lid&&t>lt){lid=i;lt=t;show(l);}
  }).catch(function(e){console.log('err',e);});
}
poll();setInterval(poll,POLL);
</script>
</body>
</html>`);
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join-dashboard', (streamerId) => {
    socket.join(`streamer-${streamerId}`);
    console.log(`📡 Streamer ${streamerId} joined dashboard`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/meddplays_tipping');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 MEDDplays Tipping Server running on http://localhost:${PORT}`);
  });
});
