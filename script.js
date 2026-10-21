const dialog=document.querySelector('#gameDialog');
const content=document.querySelector('#gameContent');
const label=document.querySelector('#dialogLabel');
let activeTimer=null;
document.querySelector('#year').textContent=new Date().getFullYear();
function stopTimer(){if(activeTimer){clearInterval(activeTimer);activeTimer=null}}
function openGame(game){stopTimer();const games={wifi:renderWifi,project:renderProject,teacher:renderTeacher,chair:renderChair};if(!games[game])return;label.textContent=game.toUpperCase()+'.EXE';games[game]();if(!dialog.open)dialog.showModal()}
document.querySelectorAll('[data-launch]').forEach(b=>b.addEventListener('click',()=>openGame(b.dataset.launch)));
document.querySelector('#randomGame').addEventListener('click',()=>{const games=['wifi','project','teacher','chair'];openGame(games[Math.floor(Math.random()*games.length)])});
document.querySelector('#closeDialog').addEventListener('click',()=>{stopTimer();dialog.close()});
dialog.addEventListener('click',e=>{if(e.target===dialog){stopTimer()}});
function shell(title,desc,emoji){content.innerHTML='<h2>'+title+'</h2><p>'+desc+'</p><div class="game-display" id="display">'+emoji+'</div><div class="score-line" id="scoreLine">READY PLAYER ONE</div><div id="controls"></div>'}
function button(text,fn,secondary=false){const b=document.createElement('button');b.className='game-button'+(secondary?' secondary':'');b.textContent=text;b.addEventListener('click',fn);document.querySelector('#controls').append(b);return b}
function renderWifi(){
  shell('THE WIFI FINAL BOSS','FIRE DATA PACKETS AT THE ROUTER CORE. DELIVER AS MANY AS YOU CAN BEFORE THE CONNECTION DIES.','');
  let score=0,time=10,started=false,boss=100,packetLoop=null;
  const display=document.querySelector('#display'),line=document.querySelector('#scoreLine'),controls=document.querySelector('#controls');
  display.classList.add('wifi-arena');
  display.innerHTML=`
    <div class="wifi-hud"><span>THREAT LEVEL <b id="wifiThreat">CRITICAL</b></span><span>ROUTER HP <b id="wifiHpText">100%</b></span></div>
    <div class="boss-health"><div id="wifiHealthFill"></div></div>
    <div class="wifi-stage" id="wifiStage">
      <div class="arena-grid"></div><div class="wifi-scan"></div>
      <div class="router-aura"></div>
      <svg class="router-boss" id="routerBoss" viewBox="0 0 260 220" role="img" aria-label="Glowing angry WiFi router boss">
        <defs>
          <linearGradient id="routerBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#424b69"/><stop offset=".55" stop-color="#171b2e"/><stop offset="1" stop-color="#080a14"/></linearGradient>
          <linearGradient id="routerEdge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#50e8ff"/><stop offset="1" stop-color="#a13cff"/></linearGradient>
          <filter id="routerGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <path d="M72 65 Q48 27 65 9" fill="none" stroke="#a8b8d8" stroke-width="7" stroke-linecap="round"/>
        <path d="M188 65 Q212 27 195 9" fill="none" stroke="#a8b8d8" stroke-width="7" stroke-linecap="round"/>
        <path d="M72 65 Q48 27 65 9" fill="none" stroke="#ff3864" stroke-width="2" stroke-linecap="round" filter="url(#routerGlow)"/>
        <path d="M188 65 Q212 27 195 9" fill="none" stroke="#50e8ff" stroke-width="2" stroke-linecap="round" filter="url(#routerGlow)"/>
        <path d="M42 80 L29 112 L35 174 Q38 190 58 195 L202 195 Q222 190 225 174 L231 112 L218 80 Q130 53 42 80Z" fill="url(#routerBody)" stroke="url(#routerEdge)" stroke-width="3"/>
        <path d="M43 111 Q130 133 217 111" fill="none" stroke="#50e8ff" stroke-opacity=".45" stroke-width="2"/>
        <path d="M62 123 L99 132 L86 148 L61 142Z" fill="#ff3864" filter="url(#routerGlow)"/>
        <path d="M198 123 L161 132 L174 148 L199 142Z" fill="#ff3864" filter="url(#routerGlow)"/>
        <path d="M99 163 Q130 139 161 163 L151 178 L109 178Z" fill="#ff3864" stroke="#ffb3c2" stroke-width="2" filter="url(#routerGlow)"/>
        <path d="M76 96 L95 100 M184 96 L165 100" stroke="#50e8ff" stroke-width="4" stroke-linecap="round"/>
        <rect x="72" y="181" width="116" height="7" rx="3" fill="#0a0c16" stroke="#50e8ff" stroke-opacity=".5"/>
        <circle cx="91" cy="184.5" r="2" fill="#c5ff4a"/><circle cx="105" cy="184.5" r="2" fill="#c5ff4a"/><circle cx="119" cy="184.5" r="2" fill="#ff3864"/>
        <path d="M111 25 Q130 7 149 25 M101 38 Q130 11 159 38" fill="none" stroke="#50e8ff" stroke-width="3" stroke-linecap="round" opacity=".9" filter="url(#routerGlow)"/>
        <text x="130" y="211" fill="#50e8ff" font-size="10" font-family="monospace" text-anchor="middle" letter-spacing="3">ROUTER-9000</text>
      </svg>
      <div class="router-warning">⚠ CONNECTION UNDER ATTACK ⚠</div>
      <div class="packet-lane" id="packetLane" aria-hidden="true"></div>
      <div class="impact-flash" id="impactFlash"></div>
    </div>
    <div class="wifi-bottom-hud"><span>PACKETS DELIVERED <b id="wifiPackets">000</b></span><span>TIME LEFT <b id="wifiTime">10.0s</b></span></div>`;
  line.textContent='ROUTER-9000 IS ONLINE. SEND IT.';
  const stage=document.querySelector('#wifiStage'),health=document.querySelector('#wifiHealthFill'),hpText=document.querySelector('#wifiHpText'),threat=document.querySelector('#wifiThreat'),packets=document.querySelector('#wifiPackets'),timeText=document.querySelector('#wifiTime'),lane=document.querySelector('#packetLane'),flash=document.querySelector('#impactFlash'),bossEl=document.querySelector('#routerBoss');
  const shoot=()=>{
    if(!started||time<=0)return;
    score++;boss=Math.max(0,boss-1.5);packets.textContent=String(score).padStart(3,'0');health.style.width=boss+'%';hpText.textContent=Math.ceil(boss)+'%';
    if(boss<60)threat.textContent='HOSTILE';if(boss<25)threat.textContent='MELTDOWN';
    stage.classList.remove('hit');void stage.offsetWidth;stage.classList.add('hit');flash.classList.remove('flash');void flash.offsetWidth;flash.classList.add('flash');
    const packet=document.createElement('span');packet.className='data-packet';packet.textContent=['▸','◆','01','⚡'][Math.floor(Math.random()*4)];packet.style.setProperty('--packet-x',(18+Math.random()*64)+'%');packet.style.setProperty('--packet-delay',(Math.random()*.12)+'s');lane.append(packet);setTimeout(()=>packet.remove(),650);
    bossEl.classList.remove('router-hit');void bossEl.offsetWidth;bossEl.classList.add('router-hit');
    line.textContent='PACKETS: '+score+' // ROUTER HP: '+Math.ceil(boss)+'%';
  };
  function endGame(){stopTimer();started=false;controls.innerHTML='';if(packetLoop){clearInterval(packetLoop);packetLoop=null}bossEl.classList.add('router-defeated');threat.textContent=boss<=0?'ROUTER DOWN':'CONNECTION LOST';line.textContent='CONNECTION LOST. PACKETS DELIVERED: '+score;const result=document.createElement('div');result.className='wifi-result';result.textContent=boss<=0?'ROUTER-9000 DEFEATED. THE WIFI IS YOURS.':'THE ROUTER WON THIS ROUND.';display.append(result);button('RUN IT BACK',renderWifi);button('REBOOT ROUTER',()=>{renderWifi()},true)}
  button('⚡ SEND DATA PACKET',()=>{if(!started){started=true;line.textContent='FIREWALL BREACHED. KEEP FIRING.';packetLoop=setInterval(()=>{if(started&&time>0)shoot()},120);activeTimer=setInterval(()=>{time=Math.max(0,time-.1);timeText.textContent=time.toFixed(1)+'s';if(time<=0)endGame()},100)}shoot()});
  button('REBOOT ROUTER',()=>{stopTimer();if(packetLoop)clearInterval(packetLoop);renderWifi()},true);
}
function renderProject(){shell('ESCAPE THE GROUP PROJECT','Mash COMPLETE SLIDE to finish 100% of the group project. Your teammates are “doing research.”','📄');let progress=0;const line=document.querySelector('#scoreLine'),display=document.querySelector('#display'),controls=document.querySelector('#controls');const update=()=>{line.textContent='PROJECT COMPLETE: '+progress+'%';display.textContent=progress>=100?'🎓':'📄';if(progress>=100){controls.innerHTML='';line.textContent='PROJECT SUBMITTED. TEAMMATES TAKE ALL THE CREDIT.';button('DO IT AGAIN',renderProject)}};button('COMPLETE SLIDE (+10%)',()=>{if(progress<100){progress=Math.min(100,progress+10);update()}});button('Ask teammate for help',()=>{display.textContent='👻';line.textContent='TEAMMATE STATUS: last seen 3 days ago',setTimeout(()=>{if(dialog.open&&label.textContent.startsWith('PROJECT'))display.textContent='📄'},700)},true);update()}
function renderTeacher(){shell('NPC TEACHER SIMULATOR','When the teacher turns around, click LOOK BUSY. Get 5 points without getting caught.','🧑‍🏫');let score=0,playing=false,windowMs=0;const display=document.querySelector('#display'),line=document.querySelector('#scoreLine'),controls=document.querySelector('#controls');function round(){if(!playing)return;const safe=Math.random()<.55;display.textContent=safe?'🧑‍🏫 ↗️':'👁️';line.textContent=safe?'TEACHER LOOKING AT THE BOARD':'TEACHER IS LOOKING DIRECTLY AT YOU';windowMs=safe?1600:900;controls.innerHTML='';button('LOOK BUSY',()=>{if(!playing)return;if(safe){score++;line.textContent='SUSPICION AVOIDED. SCORE: '+score;if(score>=5){playing=false;stopTimer();display.textContent='🏆';line.textContent='YOU HAVE MASTERED THE ART OF LOOKING PRODUCTIVE.';controls.innerHTML='';button('PLAY AGAIN',renderTeacher)}else setTimeout(round,650)}else{playing=false;stopTimer();display.textContent='😐';line.textContent='“I’LL WAIT.” CAUGHT AFTER '+score+' POINTS.';controls.innerHTML='';button('RETRY',renderTeacher)} });activeTimer=setTimeout(round,windowMs)}button('START CLASS',()=>{stopTimer();playing=true;score=0;round()});}
function renderChair(){shell('THE LAST CHAIR','Wait until the chair turns GREEN, then click it. Click too early and you lose.','🪑');let phase='idle',timer=null;const display=document.querySelector('#display'),line=document.querySelector('#scoreLine'),controls=document.querySelector('#controls');button('START MUSICAL CHAIRS',()=>{if(timer)clearTimeout(timer);phase='wait';display.textContent='🎵';line.textContent='MUSIC PLAYING... WAIT FOR IT';controls.innerHTML='';button('GRAB CHAIR!',grab);timer=setTimeout(()=>{if(phase==='wait'){phase='go';display.textContent='🟢🪑';line.textContent='NOW NOW NOW!';timer=setTimeout(()=>{if(phase==='go'){phase='lose';display.textContent='💀';line.textContent='TOO SLOW. CHAIR HAS BEEN CLAIMED.';controls.innerHTML='';button('REMATCH',renderChair)}},950)}},1200+Math.random()*2500)});function grab(){if(phase==='wait'){phase='lose';clearTimeout(timer);display.textContent='💥';line.textContent='FALSE START. YOU SAT ON INVISIBLE AIR.';controls.innerHTML='';button('REMATCH',renderChair)}else if(phase==='go'){phase='win';clearTimeout(timer);display.textContent='👑🪑';line.textContent='VICTORY! YOU ARE THE CHAIR CHAMPION.';controls.innerHTML='';button('DEFEND YOUR TITLE',renderChair)}}}
