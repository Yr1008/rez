/* Rezonate cinematic hero engine - SCROLL-DRIVEN.
   The hero is a tall section with a sticky 100vh stage; choreography maps to
   scroll progress p (0..1) over the section. Zoom-independent (uses rects).
   Markup contract: #cinehero (tall) > sticky div containing
     #cinevid-wrap (video/img dolly), .cine-vignette, .cine-curtain,
     #cinescrim2 (darken), #cinehead (phase A),
     #cinelabelwrap + #cineword[data-words|data-accents] (phase B),
     .cine-card[data-x|data-y|data-rot] (screens), #cineclose (phase C),
     #cinecue (scroll hint), #cineprog (progress bar).
*/
(function(){
  var cl=function(t){return t<0?0:t>1?1:t;};
  var ez=function(t){t=cl(t);return 1-Math.pow(1-t,3);};
  var lp=function(a,b,t){return a+(b-a)*t;};
  var lastWi=-1, lastSi=-1, vCur=null;
  /* Canvas frame-sequence scrub: the robust way to scroll-scrub. No video seeking - just draw the frame nearest the scroll position. Instant first frame, smooth both directions, plays only on scroll. */
  var seq=null, vseq=null, gDt=16.7;
  function pickLoaded(idx){
    if(idx<0) idx=0; if(idx>seq.count-1) idx=seq.count-1;
    var img=seq.imgs[idx];
    if(img&&img._ok) return img;
    var lo=idx,hi=idx;
    while(lo>=0||hi<seq.count){ if(lo>=0&&seq.imgs[lo]&&seq.imgs[lo]._ok) return seq.imgs[lo]; if(hi<seq.count&&seq.imgs[hi]&&seq.imgs[hi]._ok) return seq.imgs[hi]; lo--;hi++; }
    return null;
  }
  function seqDraw(p){
    if(!seq) return;
    /* Frame position maps DIRECTLY to the (already eased/smoothed) scroll value sp. The scroll
       loop eases sp toward the raw scroll at EASE/frame, which by itself plays smoothly THROUGH
       the intermediate frames on a fast scroll (sp converges over ~20 frames, drawing each one).
       A second "chase limiter" on top of that used to advance ~1.5 frames per 60fps tick and,
       with sharp rounding, dropped roughly every third source frame during a flick - the visible
       "skipping". One smoothing stage, not two, is what makes the scrub track cleanly. */
    var fpos=cl(p/0.92)*(seq.count-1);
    seq.chasing=false;
    if(seq.lastF!==undefined && Math.abs(fpos-seq.lastF)<0.0022) return;
    var i0, frac, i1;
    if(seq.sharp){
      /* Sharp mode: snap to the nearest crisp frame. For moving-camera footage a cross-dissolve
         between two spatially-different frames ghosts/double-images and reads as a skip; showing
         each frame crisply tracks like a real video scrub. */
      i0=Math.round(fpos); frac=0; i1=i0;
    } else {
      /* Crossfade the two nearest frames by the fractional part - smooth for subtle motion. */
      i0=Math.floor(fpos); frac=fpos-i0; i1=i0+1;
    }
    var exact=seq.imgs[i0];
    /* Until the first real paint, require the EXACT target frame to be decoded. Drawing a
       nearest-loaded fallback here would cover the CSS f00 placeholder with the wrong frame
       and flash when the correct one arrives (the "frame changes then video starts" jump). */
    if(!seq.painted && !(exact&&exact._ok)) return;
    /* After first paint: if the exact frame isn't in yet, HOLD the last good frame instead of
       snapping to a far-away nearest-loaded one - that snap is what reads as a skip/strobe. As
       each frame decodes, draw0() re-renders and the scrub catches up automatically. */
    if(seq.painted && !(exact&&exact._ok)) return;
    var a=(exact&&exact._ok)?exact:pickLoaded(i0); if(!a) return;
    var b=(frac>0.001)?pickLoaded(i1):null;
    var cw=seq.cv, ctx=seq.ctx;
    /* Size the backing store to the canvas's DEVICE pixels (clientW/H * dpr), not the source
       size. Drawing the source straight to source-size then letting CSS stretch+zoom it to a
       full-screen 2x viewport compounds two soft GPU upscales; rendering at device resolution
       and doing the cover-crop here is a single high-quality bicubic pass = as sharp as the
       source allows. dpr capped so the bitmap can't blow up memory on hidpi screens. */
    var dpr=Math.min(window.devicePixelRatio||1, window.innerWidth<=700 ? 1.25 : 1.5);
    var bw=Math.round((cw.clientWidth||a.naturalWidth)*dpr), bh=Math.round((cw.clientHeight||a.naturalHeight)*dpr);
    if(bw && bh && (cw.width!==bw || cw.height!==bh)){ cw.width=bw; cw.height=bh; }
    /* object-position Y (e.g. "50% 35%") so the in-canvas crop matches the CSS the markup set. */
    if(seq.posY===undefined){ var op=getComputedStyle(cw).objectPosition.split(' '); var py=parseFloat(op[op.length-1]); seq.posY=isNaN(py)?50:py; }
    var fy=seq.posY/100;
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    var cover=function(img,alpha){
      var iw=img.naturalWidth, ih=img.naturalHeight;
      var s=Math.max(cw.width/iw, cw.height/ih);
      var dw=iw*s, dh=ih*s;
      ctx.globalAlpha=alpha; ctx.drawImage(img, (cw.width-dw)/2, (cw.height-dh)*fy, dw, dh);
    };
    ctx.globalAlpha=1; cover(a,1);
    if(b&&b!==a){ cover(b,frac); ctx.globalAlpha=1; }
    seq.painted=true;
    seq.lastF=fpos;
  }

  /* In-memory video frame scrub: decode the source video into high-res ImageBitmaps
     ONCE at load (seeking happens here, off the scroll path), then scrub the cached
     frames with zero per-scroll seeking - smooth like an image sequence, but full
     quality straight from the (4K) source and no disk/capture size limit. */
  function vpick(idx){
    if(idx<0)idx=0; if(idx>vseq.count-1)idx=vseq.count-1;
    var f=vseq.frames[idx]; if(f&&f._ok) return f;
    var lo=idx,hi=idx;
    while(lo>=0||hi<vseq.count){ if(lo>=0&&vseq.frames[lo]&&vseq.frames[lo]._ok)return vseq.frames[lo]; if(hi<vseq.count&&vseq.frames[hi]&&vseq.frames[hi]._ok)return vseq.frames[hi]; lo--;hi++; }
    return null;
  }
  function vseqDraw(p){
    if(!vseq) return;
    var fpos=cl(p/0.92)*(vseq.count-1);
    var i0=Math.round(fpos);
    if(vseq.lastF!==undefined && Math.abs(fpos-vseq.lastF)<0.004) return;
    /* Smoothness like a disk frame-sequence: once we've painted, only ADVANCE to a frame
       that is actually decoded. If the exact target isn't ready yet (still decoding), hold
       the last good frame instead of snapping to a far-away nearest-ready one - that snapping
       is what reads as the fast-scroll "glitch"/strobe. As decode fills in, every frame
       becomes available and the scrub is buttery. Before the first paint, fall back to
       nearest-ready so we show SOMETHING immediately. */
    var exact=vseq.frames[i0];
    if(vseq.painted && !(exact&&exact._ok)) return;
    var a=(exact&&exact._ok)?exact:vpick(i0); if(!a) return;
    var cw=vseq.cv, ctx=vseq.ctx;
    var dpr=Math.min(window.devicePixelRatio||1, window.innerWidth<=700 ? 1.25 : 1.5);
    var bw=Math.round((cw.clientWidth||a.nw)*dpr), bh=Math.round((cw.clientHeight||a.nh)*dpr);
    if(bw && bh && (cw.width!==bw || cw.height!==bh)){ cw.width=bw; cw.height=bh; }
    if(vseq.posY===undefined){ var op=getComputedStyle(cw).objectPosition.split(' '); var py=parseFloat(op[op.length-1]); vseq.posY=isNaN(py)?50:py; }
    var fy=vseq.posY/100, sc=vseq.scale||1;
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    var iw=a.nw, ih=a.nh, s=Math.max(cw.width/iw, cw.height/ih)*sc, dw=iw*s, dh=ih*s;
    ctx.drawImage(a.img, (cw.width-dw)/2, (cw.height-dh)*fy, dw, dh);
    vseq.painted=true; vseq.lastF=fpos;
  }
  function setupVseq(cv){
    var src=cv.getAttribute('data-vsrc'); if(!src) return;
    var count=parseInt(cv.getAttribute('data-vframes'),10)||44;
    var scale=parseFloat(cv.getAttribute('data-vscale'))||1;
    if(window.innerWidth<=700) count=Math.min(count,26);
    vseq={cv:cv, ctx:cv.getContext('2d'), count:count, frames:new Array(count), ready:0, painted:false, posY:undefined, scale:scale};
    var capH=window.innerWidth<=700?620:1040;
    var v=document.createElement('video'); v.muted=true; v.playsInline=true; v.setAttribute('playsinline',''); v.preload='auto';
    var off=document.createElement('canvas'), octx=null, i=0, dur=0;
    var redraw=function(){ vseq.lastF=undefined; vseqDraw(sp); kick(); };
    var seekNext=function(){ if(i>=count){ vseq.allReady=true; return; } var t=0.05+(i/(count-1))*Math.max(0.1,(dur-0.35)); try{ v.currentTime=Math.max(0.05, t); }catch(_){} };
    var grab=function(){ if(i>=count||!octx) return; try{ octx.drawImage(v,0,0,off.width,off.height); }catch(_){ i++; seekNext(); return; }
      createImageBitmap(off).then(function(bmp){ vseq.frames[i]={img:bmp,_ok:true,nw:bmp.width,nh:bmp.height}; vseq.ready++; if(i===0||vseq.painted) redraw(); i++; seekNext(); }).catch(function(){ i++; seekNext(); }); };
    v.addEventListener('loadedmetadata', function(){ dur=v.duration||5; var ar=(v.videoWidth/v.videoHeight)||1.778; off.height=capH; off.width=Math.round(capH*ar); octx=off.getContext('2d'); seekNext(); });
    var present=function(cb){ var done=false; var go=function(){ if(done)return; done=true; cb(); };
      if(v.requestVideoFrameCallback){ try{ v.requestVideoFrameCallback(function(){ go(); }); }catch(_){} }
      setTimeout(go, 150); };
    v.addEventListener('seeked', function(){ present(grab); });
    fetch(src).then(function(r){return r.blob();}).then(function(b){ v.src=URL.createObjectURL(b); v.load(); }).catch(function(){ v.src=src; v.load(); });
  }

  function isMobile(){ return (window.matchMedia && window.matchMedia('(max-width:1024px)').matches) || window.innerWidth<=1024; }
  function render(p){
    /* PHONES: no scroll choreography. The hero is a plain video + heading (see the
       mobile CSS that de-stickies #cinehero to 100vh). Force the static top state -
       heading fully visible, video gently framed - and bail before any scroll math so
       the heading never fades and the cards/label/close/cue never appear. */
    if(isMobile()){
      var hdm=document.getElementById('cinehead');
      if(hdm){ hdm.style.opacity='1'; hdm.style.transform='none'; hdm.style.pointerEvents='auto'; }
      var vwm=document.getElementById('cinevid-wrap');
      if(vwm){ vwm.style.transform='scale(1.04)'; }
      return;
    }
    var vw=document.getElementById('cinevid-wrap');
    if(vw){ vw.style.transform='scale('+lp(1.14,1.06,ez(cl(p/0.62))).toFixed(3)+') translateY('+(p*-2.2).toFixed(1)+'%)'; }

    /* Drive frames from the SMOOTHED scroll value (sp), not raw scroll. sp is an interpolated/"guided" scroll position that fills in the gaps between chunky wheel/trackpad steps, so frames advance smoothly instead of jumping with each input tick. */
    seqDraw(p);
    if(vseq) vseqDraw(p);

    var sv=document.querySelector('#cinevid-wrap video[data-scrub]');
    if(sv && sv.duration && sv._ready && sv.readyState>=2){
      var d=sv.duration, target=cl(p/0.92)*(d-0.06);
      if(vCur===null) vCur=sv.currentTime||target;
      vCur += (target - vCur) * 0.2;
      if(Math.abs(target - vCur) < 0.006) vCur = target;
      /* Always chase the latest position. Setting currentTime while a seek is in flight just retargets that seek to the newest value, so the frame keeps tracking the scroll instead of freezing for the ~400ms a seek can take on long-GOP video. Larger threshold = fewer seeks = smoother on heavy 4K footage. */
      if(Math.abs(sv.currentTime - vCur) > 0.045){ try{ sv.currentTime = vCur; }catch(_){} }
      if(!sv.paused){ try{ sv.pause(); }catch(_){} }
    }

    var s2=document.getElementById('cinescrim2');
    if(s2){ s2.style.background='rgba(6,7,10,0)'; }

    var hd=document.getElementById('cinehead');
    if(hd){ var ht=ez((p-0.07)/0.11), fo=1-ht; hd.style.opacity=fo.toFixed(3);
      hd.style.transform='translateY('+(-ht*58).toFixed(1)+'px)';
      hd.style.pointerEvents=fo>0.5?'auto':'none'; }

    var lw=document.getElementById('cinelabelwrap');
    if(lw) lw.style.opacity=(ez((p-0.14)/0.08)*(1-ez((p-0.80)/0.07))).toFixed(3);

    var wEl=document.getElementById('cineword');
    if(wEl && wEl.getAttribute('data-words')){
      var words=wEl.getAttribute('data-words').split('|'), acc=(wEl.getAttribute('data-accents')||'').split('|');
      var wi=Math.min(words.length-1, Math.floor(cl((p-0.16)/0.62)*words.length));
      if(lastWi!==wi){ lastWi=wi; wEl.textContent=words[wi]; if(acc[wi])wEl.style.color=acc[wi];
        wEl.style.animation='none'; void wEl.offsetWidth; wEl.style.animation='cineword .55s cubic-bezier(.2,.85,.3,1)'; }
    }

    var stEl=document.getElementById('cinestat');
    if(stEl){ stEl.style.opacity=(ez((p-0.20)/0.07)*(1-ez((p-0.80)/0.06))).toFixed(3);
      if(stEl.getAttribute('data-words')){ var sw=stEl.getAttribute('data-words').split('|');
        var sq=document.getElementById('cinestatnum'), sl=document.getElementById('cinestatlbl');
        var si=Math.min(sw.length-1, Math.floor(cl((p-0.18)/0.60)*sw.length));
        if(lastSi!==si){ lastSi=si; var parts=sw[si].split('::'); if(sq)sq.textContent=parts[0]; if(sl)sl.textContent=parts[1]||'';
          if(sq){ sq.style.animation='none'; void sq.offsetWidth; sq.style.animation='cineword .55s cubic-bezier(.2,.85,.3,1)'; } } } }

    var beats=document.querySelectorAll('.cine-beat');
    for(var bi=0;bi<beats.length;bi++){ var be=beats[bi];
      var inP=parseFloat(be.getAttribute('data-in'))||0, outP=parseFloat(be.getAttribute('data-out')); if(isNaN(outP))outP=1;
      var bop=cl(ez((p-inP)/0.05))*cl(1-ez((p-(outP-0.04))/0.045));
      be.style.opacity=bop.toFixed(3);
      be.style.transform='translateY('+lp(22,-12,ez((p-inP)/Math.max(0.001,(outP-inP)))).toFixed(1)+'px)';
    }

    var cards=document.querySelectorAll('.cine-card'), n=cards.length||1;
    var heroEl=document.getElementById('cinehero');
    var span=(heroEl&&heroEl.getAttribute('data-cardspan'))?parseFloat(heroEl.getAttribute('data-cardspan')):0.56;
    var base=(heroEl&&heroEl.getAttribute('data-cardbase'))?parseFloat(heroEl.getAttribute('data-cardbase')):0.16;
    for(var i=0;i<cards.length;i++){ var c=cards[i];
      var st=base + i*(span/n), rin=ez((p-st)/0.14), out=lp(1,0,ez((p-0.84)/0.12));
      var x=parseFloat(c.getAttribute('data-x'))||0, y=parseFloat(c.getAttribute('data-y'))||0, rot=parseFloat(c.getAttribute('data-rot'))||0;
      var cy=lp(y+10,y,rin)+(p-st)*-4, tx=lp(x*0.5,x,rin), sc=lp(.88,1,rin)*lp(1,.96,ez((p-0.84)/0.12));
      c.style.opacity=(rin*out).toFixed(3);
      c.style.transform='translate(-50%,-50%) translate('+tx.toFixed(2)+'vw,'+cy.toFixed(2)+'vh) rotate('+rot+'deg) scale('+sc.toFixed(3)+')';
    }

    var cc=document.getElementById('cineclose');
    if(cc){ var co=ez((p-0.84)/0.13); cc.style.opacity=co.toFixed(3);
      cc.style.transform='translateY('+lp(30,0,co).toFixed(1)+'px)'; cc.style.pointerEvents=co>0.5?'auto':'none'; }

    var cue=document.getElementById('cinecue'); if(cue) cue.style.opacity=(1-ez(p/0.06)).toFixed(3);
    var pr=document.getElementById('cineprog'); if(pr) pr.style.width=(p*100).toFixed(2)+'%';
  }

  var tp=0, sp=0, rawP=0, booted=false, EASE=0.05;
  var heroEl0=null, onScreen=true;
  function measure(){
    var sec=heroEl0||(heroEl0=document.getElementById('cinehero')); if(!sec) return;
    var r=sec.getBoundingClientRect(), vh=window.innerHeight, total=r.height-vh;
    tp=total>0?cl((-r.top)/total):0;
    if(!userIn) tp=0; /* lock hero to its top state until the user actually scrolls - kills the "heading changes on refresh" flash caused by the browser's scroll-restore race */
    /* Is the pinned stage anywhere near the viewport? When the hero has scrolled
       fully away there's nothing to scrub, so the loop can sleep. */
    onScreen = (r.bottom > -120 && r.top < vh + 120);
  }
  /* Idle-out loop: keep animating only while the smoothed scroll is still
     catching up (settling) or the user scrolled recently AND the hero is on
     screen. Otherwise stop the rAF entirely so we're not reading layout and
     repainting every frame forever. Late-arriving sequence frames redraw
     themselves via draw0(), so a sleeping loop never leaves a stale canvas. */
  var running=false, lastKick=0, lastT=0;
  function frame(ts){
    measure();
    rawP=tp;
    /* Framerate-independent smoothing: EASE is calibrated for 60fps; convert it to a
       per-ms decay so 120Hz displays and janky frames glide identically. */
    var dt=lastT?Math.min(50,ts-lastT):16.7; lastT=ts;
    gDt=dt;
    var al=1-Math.pow(1-EASE, dt/16.7);
    sp += (tp - sp) * al;
    if(Math.abs(tp - sp) < 0.0004) sp = tp;
    render(sp);
    var settling = Math.abs(tp - sp) > 0.0004 || (seq && seq.chasing);
    /* Keep the loop live the WHOLE time the hero is on screen (not just for 320ms after a
       scroll). The choreography sets .cine-card opacity/transform imperatively every frame;
       if the loop sleeps while the hero is stopped on-screen and anything re-renders those
       nodes (React reconcile, DOM swap), the cards get wiped to their CSS default (opacity 0)
       and never come back until the next scroll. Running while onScreen re-asserts the correct
       state within a frame - cards can no longer "disappear on the second scroll". It's cheap
       (a handful of style writes) and only runs while the hero is actually visible. */
    if(settling || onScreen){ requestAnimationFrame(frame); }
    else { running = false; lastT = 0; }
  }
  function kick(){ lastKick = performance.now(); if(!running){ running = true; requestAnimationFrame(frame); } }
  function boot(){
    var sec=document.getElementById('cinehero'); if(!sec) return false;
    /* The video/canvas streams into the DC slightly after #cinehero exists. If we boot before it's there, we'd mark ourselves done and never wire the scrubber. So wait for the scrub target. */
    /* Scrub targets drive video frames from scroll. canvas[data-autoseq] is the AUTOPLAY hero:
       the video plays on its own (hero-autoplay.js), and cine.js runs in CHOREOGRAPHY-ONLY mode -
       it still wires scroll->render for the heading morph, word cycle, cards and outro, but never
       touches the canvas (seq stays null, so seqDraw is a no-op). That gives an autoplaying hero
       video AND the scroll-driven card choreography over it. */
    if(!sec.querySelector('video[data-scrub], video[data-bg], canvas[data-seq], canvas[data-vseq], canvas[data-autoseq]')) return false;
    /* PHONES: skip the entire scroll engine. Just make the bg video autoplay and leave the
       static heading. The choreography layers stay at their inline opacity:0 (never touched),
       and the mobile CSS collapses #cinehero to one screen so the next section flows right after. */
    if(isMobile()){
      sec.querySelectorAll('video').forEach(function(v){
        /* Swap to the lightweight mobile encode (data-msrc, ~170-490KB) BEFORE the
           first play() so phones never pull the heavier desktop clip. A src attr
           overrides <source> children; drop them so the parser can't fetch them. */
        var m=v.getAttribute('data-msrc');
        if(m && (v.getAttribute('src')||'')!==m){
          var ss=v.querySelectorAll('source'); for(var si=0;si<ss.length;si++){ if(ss[si].parentNode) ss[si].parentNode.removeChild(ss[si]); }
          v.setAttribute('src', m); try{ v.load(); }catch(e){}
        }
        v.muted=true; v.playsInline=true; v.setAttribute('playsinline',''); v.setAttribute('muted','');
        v.removeAttribute('data-scrub'); v.loop=true;
        var pl=function(){ var p=v.play&&v.play(); if(p&&p.catch)p.catch(function(){}); };
        pl(); v.addEventListener('canplay', pl); v.addEventListener('loadeddata', pl);
        /* NOT once: an early tap lands before the video has data (play() rejects
           on iOS) — keep retrying on every touch until it's actually playing. */
        document.addEventListener('touchstart', function(){ if(v.paused) pl(); }, {passive:true});
      });
      var hdm=document.getElementById('cinehead'); if(hdm){ hdm.style.opacity='1'; hdm.style.transform='none'; }
      return true;
    }
    var ez0=parseFloat(sec.getAttribute('data-ease')); if(!isNaN(ez0)) EASE=ez0;
    /* In-memory video frame-scrub (4K source decoded to cached frames). */
    var cvv=document.querySelector('#cinevid-wrap canvas[data-vseq]');
    if(cvv){ setupVseq(cvv); }
    /* Set up canvas frame-sequence if present (preferred over video scrub). */
    var cv=document.querySelector('#cinevid-wrap canvas[data-seq]');
    if(cv){ var dir=cv.getAttribute('data-seq-dir'), count=parseInt(cv.getAttribute('data-seq-count'),10)||48, ext=cv.getAttribute('data-seq-ext')||'jpg';
      seq={cv:cv, ctx:cv.getContext('2d'), count:count, imgs:new Array(count), last:-1, sharp:cv.hasAttribute('data-seq-sharp')};
      var draw0=function(){ seq.lastF=undefined; seqDraw(sp); if(seq.chasing) kick(); };
      var srcOf=function(i){ return dir+'/f'+(i<10?'0'+i:i)+'.'+ext; };
      var loadOne=function(i,done){ var im=new Image(); im.decoding='async'; try{ im.fetchPriority=(i===0?'high':'low'); }catch(_){} seq.imgs[i]=im;
        im.onload=function(){ im._ok=true; if(done){ done(); done=null; } /* free the queue slot as soon as the file is in (don't wait on decode) */
          if(im.decode){ im.decode().then(function(){ im._dec=true; draw0(); }).catch(function(){ draw0(); }); } else { draw0(); } };
        im.onerror=function(){ if(done){ done(); done=null; } };
        im.src=srcOf(i); };
      /* Load frame 0 first (poster) so the top of the hero is sharp immediately. */
      loadOne(0);
      /* Coarse-to-fine load order. Streaming 0,1,2,... leaves the far end of the clip
         unloaded, so a quick scroll-ahead freezes on an early frame until that region
         arrives. Instead load a sparse spread across the WHOLE timeline first (largest
         power-of-two stride down to 1), then fill the gaps: after ~10-15 frames the
         entire hero is coarsely scrubbable and it refines as you watch. On phones we
         stop at stride 2 (~half the frames) - seqDraw's pickLoaded() maps the in-between
         positions to the nearest loaded frame, so scroll range is unchanged but download
         and decode are halved. */
      var mob=(window.matchMedia&&window.matchMedia('(pointer:coarse)').matches)||window.innerWidth<=700;
      var minStride=mob?2:1;
      var coarse=[], fine=[], seen={0:1};
      var stride=1; while(stride*2<count) stride*=2;
      for(; stride>=minStride; stride=Math.floor(stride/2)){
        for(var qk=stride;qk<count;qk+=stride){ if(!seen[qk]){ seen[qk]=1; (stride>2?coarse:fine).push(qk); } }
        if(stride===minStride) break;
      }
      /* Two-tier load: the COARSE spread (whole timeline scrubbable) downloads immediately.
         The FINE detail frames are deferred to browser idle time so they don't compete with the
         page's critical resources (fonts, above-fold paint) - faster overall load, and image
         quality is untouched (every frame is still the full-resolution source, just later). */
      var CONC=mob?6:10;
      var runQueue=function(q,cb){ var active=0, done=false;
        var finish=function(){ if(done||q.length||active>0) return; done=true; if(cb) cb(); };
        var pump=function(){ while(active<CONC && q.length){ active++; loadOne(q.shift(), function(){ active--; pump(); finish(); }); } finish(); };
        pump(); };
      /* Load the coarse spread first (whole timeline scrubbable within a few frames), then
         immediately continue into the fine detail frames. Frames are lightweight webp, so we
         DON'T defer the fine pass to idle any more - waiting up to 2.5s left the in-between
         frames missing, and a scroll in that window made seqDraw hold-then-jump (the "skip").
         Loading straight through means the full sequence is present in ~1-2s and stays smooth. */
      runQueue(coarse, function(){ if(fine.length) runQueue(fine); });
    }
    sec.querySelectorAll('video').forEach(function(v){ v.muted=true; v.playsInline=true; v.setAttribute('playsinline','');
      if(v.hasAttribute('data-scrub')){ v.removeAttribute('loop'); v.removeAttribute('autoplay'); v.setAttribute('preload','auto'); v._ready=false; try{v.pause();}catch(_){}
        /* Hard guard: scrub video is driven only by currentTime, never played. */
        v.addEventListener('play', function(){ try{ v.pause(); }catch(_){} });
        var curT=function(){ var dd=v.duration; if(!dd||isNaN(dd)||dd===Infinity)return 0.001; return cl(sp/0.92)*(dd-0.06)||0.001; };
        /* Ready the moment the file can seek across its whole length (full buffer). Works whether the source is faststart or not. */
        var check=function(){ if(v._ready)return; try{ if(v.duration && v.seekable && v.seekable.length && v.seekable.end(v.seekable.length-1) > v.duration-0.6){ v._ready=true; try{v.pause(); v.currentTime=curT();}catch(_){} } }catch(_){} };
        ['loadeddata','canplay','canplaythrough','progress','timeupdate','durationchange'].forEach(function(ev){ v.addEventListener(ev, check); });
        try{v.load();}catch(_){}
        check();
        var ci=setInterval(function(){ check(); if(v._ready) clearInterval(ci); }, 150);
        setTimeout(function(){ if(ci) clearInterval(ci); }, 12000);
        /* Always fetch the file as a blob right away (network is fast). A fully in-memory blob has a complete seekable range, which is the reliable path for non-faststart MP4s; native progressive seeking is used too if it happens to work first. */
        (function(){ var src=v.currentSrc || (v.querySelector('source')&&v.querySelector('source').src) || v.src; if(!src) return; fetch(src).then(function(r){return r.blob();}).then(function(b){ if(v._ready && v.src && v.src.indexOf('blob:')===0) return; var u=URL.createObjectURL(b); var s=v.querySelector('source'); if(s)s.remove(); v.src=u; v._ready=false; try{v.load();}catch(_){} ['loadeddata','canplaythrough','progress','durationchange'].forEach(function(ev){ v.addEventListener(ev, check); }); check(); }).catch(function(){}); })();
      }
      else { v.loop=true; var pl=v.play(); if(pl&&pl.catch)pl.catch(function(){}); }
    });
    measure(); sp=tp; render(sp);
    kick();
    return true;
  }
  var started=false;
  function tryBoot(){ if(started) return; if(boot()){ started=true; if(iv) clearInterval(iv); } }
  /* Start every load at the top so the hero opens on frame 0 instead of the browser
     restoring a mid-scroll position and the canvas snapping to a mid-clip frame. */
  try{ if('scrollRestoration' in history) history.scrollRestoration='manual'; }catch(_){}
  /* Force the top on load/refresh so the hero always opens on its main heading (frame 0),
     not a browser-restored mid-scroll position that would show a later choreography heading. */
  try{ window.scrollTo(0,0); }catch(_){}
  /* Anti-flash guard: even with scrollRestoration=manual, the browser (or host) can
     re-apply a saved scroll position a beat after our scrollTo(0,0). The hero then
     renders a mid-scroll choreography state for a few frames (opening heading gone,
     word-cycle heading showing) before snapping back - which reads as "the heading
     changes for a second" on refresh. Until the USER actually interacts, any scroll
     away from the top in the first ~1.2s is snapped straight back to 0. */
  var userIn=false;
  /* Hard anti-flash lock. Added synchronously so it's on before any restore race.
     CSS (.cine-lock #cinehead) force-holds the opening title visible and hides the
     later choreography layers, so a momentary p>0 from a late scroll-restore can no
     longer fade the title out-and-in. Released only on a REAL user interaction. */
  try{ document.documentElement.classList.add('cine-lock'); }catch(_){}
  var releaseLock=function(){ userIn=true; try{ document.documentElement.classList.remove('cine-lock'); }catch(_){} };
  ['wheel','touchstart','keydown','pointerdown'].forEach(function(ev){ window.addEventListener(ev, releaseLock, {passive:true, capture:true, once:true}); });
  /* Until the user actually interacts, pin the page to the top so a late browser
     scroll-restore can't leave the hero mid-scroll. No time limit - the lock owns
     visibility, this just keeps the start position clean for when choreography begins. */
  window.addEventListener('scroll', function(){
    if(userIn) return;
    if((window.scrollY||document.documentElement.scrollTop||0)>0){ try{ window.scrollTo(0,0); }catch(_){} }
  }, {passive:true, capture:true});
  window.addEventListener('load', function(){ if(!userIn){ try{ window.scrollTo(0,0); }catch(_){} } });
  var iv=setInterval(tryBoot, 90);
  /* Wake the loop on scroll/resize; it sleeps again on its own when idle. */
  window.addEventListener('scroll', kick, {passive:true, capture:true});
  window.addEventListener('resize', function(){ measure(); kick(); }, {passive:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', tryBoot);
  tryBoot();
  setTimeout(function(){ if(iv) clearInterval(iv); }, 8000);
})();
