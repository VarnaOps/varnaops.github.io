/* VarnaOps — interactive "how it works" walkthrough.
   All preview plots are deterministic illustrative SVGs (no real data).
   Swap each build*() for an <image href="img/<name>.png"/> when real run screenshots exist. */
(function () {
  function prng(a){var r=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
    r.g=function(){var u=0,v=0;while(u===0)u=r();while(v===0)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};return r;}

  var PAL = ['#1d9e75','#2563eb','#7c3aed','#d97706','#0e9ca8','#db2777','#64748b'];
  var MUTE='#cbd2da', RED='#e24b4a', BLUE='#2563eb', AMBER='#d97706', GREEN='#1d9e75';
  var BASE = [
    {x:0.27,y:0.33,s:0.085,n:62},{x:0.58,y:0.25,s:0.070,n:54},{x:0.73,y:0.50,s:0.060,n:42},
    {x:0.40,y:0.62,s:0.080,n:50},{x:0.20,y:0.72,s:0.060,n:34},{x:0.56,y:0.80,s:0.055,n:30},
    {x:0.85,y:0.30,s:0.040,n:18}
  ];
  function scatter(seed, W, H, opts){
    opts = opts || {}; var rand = prng(seed); var s='';
    BASE.forEach(function(cl,i){
      var col = opts.color ? opts.color(i) : PAL[i];
      var op  = opts.opacity ? opts.opacity(i) : 0.85;
      for(var k=0;k<cl.n;k++){
        var px=(cl.x+rand.g()*cl.s)*W, py=(cl.y+rand.g()*cl.s)*H;
        if(px<3||px>W-3||py<3||py>H-3) continue;
        s+='<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="'+(opts.r||2.0)+'" fill="'+col+'" fill-opacity="'+op+'"/>';
      }
    });
    return s;
  }
  function buildAtlas(W,H){ return scatter(11,W,H); }
  function buildImmune(W,H){ return scatter(21,W,H); }
  function buildPlanned(W,H){ return scatter(31,W,H,{opacity:function(){return 0.6;},color:function(){return MUTE;}}); }
  function buildAnnotate(W,H){ return scatter(7,W,H,{r:2.1}); }
  function buildCluster(W,H){
    var s = scatter(5,W,H,{opacity:function(){return 0.55;}});
    BASE.forEach(function(cl,i){
      var cx=cl.x*W, cy=cl.y*H;
      s+='<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="10" fill="#ffffff" stroke="#e6e8ec" stroke-width="1"/>';
      s+='<text x="'+cx.toFixed(1)+'" y="'+(cy+3.6).toFixed(1)+'" text-anchor="middle" font-size="11" font-weight="700" fill="'+PAL[i]+'" font-family="Inter,sans-serif">'+i+'</text>';
    });
    return s;
  }
  function buildNovel(W,H){
    var s = scatter(9,W,H,{color:function(i){return i===6?RED:MUTE;},opacity:function(i){return i===6?0.95:0.6;}});
    var nx=0.85*W, ny=0.30*H;
    s+='<circle cx="'+nx.toFixed(1)+'" cy="'+ny.toFixed(1)+'" r="24" fill="none" stroke="'+RED+'" stroke-opacity="0.9" stroke-width="1.3" stroke-dasharray="4 3"/>';
    s+='<text x="'+nx.toFixed(1)+'" y="'+(ny-28).toFixed(1)+'" text-anchor="middle" font-size="10" font-weight="600" fill="'+RED+'" font-family="Inter,sans-serif">flagged</text>';
    return s;
  }
  function buildDotplot(W,H){
    // marker dotplot: each cell type (row) lights up its own marker genes (cols) -> diagonal band
    var rand=prng(3), rows=6, cols=8, padL=14, padT=14, gw=(W-padL-12)/cols, gh=(H-padT-14)/rows, s='';
    for(var r=0;r<rows;r++) for(var c=0;c<cols;c++){
      var cx=padL+gw*(c+0.5), cy=padT+gh*(r+0.5);
      var expected=(r+0.5)*cols/rows, onDiag=Math.abs((c+0.5)-expected)<1.1;
      var v=onDiag?(0.72+rand()*0.28):(rand()*0.30), rad=1.5+v*v*7.5;
      var col=onDiag?GREEN:BLUE, op=onDiag?(0.78+rand()*0.18):(0.22+rand()*0.18);
      s+='<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+rad.toFixed(1)+'" fill="'+col+'" fill-opacity="'+op.toFixed(2)+'"/>';
    }
    return s;
  }
  function buildVolcano(W,H){
    var rand=prng(4), s='', cx0=W/2, n=240;
    for(var i=0;i<n;i++){
      var fc=rand.g()*1.3, p=Math.abs(rand.g())*1.0+rand()*2.6;
      var px=cx0+fc*(W*0.115), py=H-12-p*(H*0.10);
      if(px<3||px>W-3||py<8||py>H-3) continue;
      var sig=Math.abs(fc)>1 && p>1.7, col=sig?(fc>0?RED:BLUE):MUTE;
      s+='<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="1.9" fill="'+col+'" fill-opacity="'+(sig?0.9:0.6)+'"/>';
    }
    s+='<line x1="'+(cx0-W*0.115).toFixed(1)+'" y1="8" x2="'+(cx0-W*0.115).toFixed(1)+'" y2="'+(H-10)+'" stroke="#c9ced6" stroke-dasharray="3 3" stroke-width="0.8"/>';
    s+='<line x1="'+(cx0+W*0.115).toFixed(1)+'" y1="8" x2="'+(cx0+W*0.115).toFixed(1)+'" y2="'+(H-10)+'" stroke="#c9ced6" stroke-dasharray="3 3" stroke-width="0.8"/>';
    return s;
  }
  function buildQC(W,H){
    var rand=prng(6), s='', n=210;
    for(var i=0;i<n;i++){
      var base=rand(), x=0.10+base*0.80+rand.g()*0.04, y=0.15+base*0.74+rand.g()*0.05;
      var px=x*W, py=H-(y*H);
      if(px<3||px>W-3||py<3||py>H-3) continue;
      var kept=x>0.22 && y>0.20;
      s+='<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="1.9" fill="'+(kept?GREEN:MUTE)+'" fill-opacity="'+(kept?0.8:0.6)+'"/>';
    }
    s+='<line x1="'+(0.22*W).toFixed(1)+'" y1="8" x2="'+(0.22*W).toFixed(1)+'" y2="'+(H-8)+'" stroke="'+AMBER+'" stroke-dasharray="3 3" stroke-width="0.9" stroke-opacity="0.8"/>';
    s+='<line x1="8" y1="'+(0.80*H).toFixed(1)+'" x2="'+(W-8)+'" y2="'+(0.80*H).toFixed(1)+'" stroke="'+AMBER+'" stroke-dasharray="3 3" stroke-width="0.9" stroke-opacity="0.8"/>';
    return s;
  }
  function buildReport(W,H){
    var s='', px=W*0.20, pw=W*0.60, x0=px+14, w=pw-28, y=22, rand=prng(2);
    s+='<rect x="'+px.toFixed(1)+'" y="8" width="'+pw.toFixed(1)+'" height="'+(H-16)+'" rx="7" fill="#ffffff" stroke="#e6e8ec"/>';
    s+='<rect x="'+x0.toFixed(1)+'" y="'+y+'" width="'+(w*0.52).toFixed(1)+'" height="8" rx="4" fill="'+GREEN+'"/>'; y+=18;
    [0.95,0.82,0.9,0.62].forEach(function(lw){ s+='<rect x="'+x0.toFixed(1)+'" y="'+y+'" width="'+(w*lw).toFixed(1)+'" height="5" rx="2.5" fill="#dfe3e8"/>'; y+=11; });
    y+=4; var chH=H*0.30, chy=y;
    s+='<rect x="'+x0.toFixed(1)+'" y="'+chy+'" width="'+w.toFixed(1)+'" height="'+chH.toFixed(1)+'" rx="4" fill="#f5f6f8" stroke="#e6e8ec"/>';
    for(var i=0;i<46;i++){
      var dx=x0+8+rand()*(w-16), dy=chy+8+rand()*(chH-16), col=PAL[Math.floor(rand()*4)];
      s+='<circle cx="'+dx.toFixed(1)+'" cy="'+dy.toFixed(1)+'" r="1.7" fill="'+col+'" fill-opacity="0.9"/>';
    }
    y=chy+chH+12;
    [0.72,0.5].forEach(function(lw){ s+='<rect x="'+x0.toFixed(1)+'" y="'+y+'" width="'+(w*lw).toFixed(1)+'" height="5" rx="2.5" fill="#dfe3e8"/>'; y+=11; });
    return s;
  }
  function buildInterpret(W,H){
    var px=W*0.18, pw=W*0.64, x0=px+16, w=pw-32, y=24, s='';
    s+='<rect x="'+px.toFixed(1)+'" y="10" width="'+pw.toFixed(1)+'" height="'+(H-20)+'" rx="7" fill="#ffffff" stroke="#e6e8ec"/>';
    var sx=x0+5, sy=y-3;   // AI spark + heading line
    s+='<path d="M'+sx+' '+(sy-7)+' L'+(sx+2.2)+' '+(sy-2.2)+' L'+(sx+7)+' '+sy+' L'+(sx+2.2)+' '+(sy+2.2)+' L'+sx+' '+(sy+7)+' L'+(sx-2.2)+' '+(sy+2.2)+' L'+(sx-7)+' '+sy+' L'+(sx-2.2)+' '+(sy-2.2)+' Z" fill="'+GREEN+'"/>';
    s+='<rect x="'+(x0+16).toFixed(1)+'" y="'+(sy-3.5)+'" width="'+(w*0.44).toFixed(1)+'" height="7" rx="3.5" fill="'+GREEN+'"/>';
    y+=18;
    [0.96,0.9,0.84].forEach(function(lw){ s+='<rect x="'+x0.toFixed(1)+'" y="'+y+'" width="'+(w*lw).toFixed(1)+'" height="5" rx="2.5" fill="#dfe3e8"/>'; y+=11; });
    y+=7; var bh=H*0.20;
    s+='<rect x="'+x0.toFixed(1)+'" y="'+y+'" width="'+w.toFixed(1)+'" height="'+bh.toFixed(1)+'" rx="6" fill="rgba(29,158,117,0.08)" stroke="rgba(29,158,117,0.3)"/>';
    var iy=y+11;
    [0.82,0.64].forEach(function(lw){ s+='<rect x="'+(x0+9).toFixed(1)+'" y="'+iy+'" width="'+(w*lw).toFixed(1)+'" height="5" rx="2.5" fill="'+GREEN+'" fill-opacity="0.55"/>'; iy+=11; });
    y+=bh+12;
    [0.9,0.6].forEach(function(lw){ s+='<rect x="'+x0.toFixed(1)+'" y="'+y+'" width="'+(w*lw).toFixed(1)+'" height="5" rx="2.5" fill="#dfe3e8"/>'; y+=11; });
    return s;
  }

  // ---- data ----
  var W=340, H=230;
  // Harmonized transfer labels — mirror config.py (BRAIN_SUBCLASS_TERMS / IMMUNE_SUBCLASS_TERMS).
  var BRAIN_LABELS = ['glutamatergic neuron','oligodendrocyte','GABAergic neuron','astrocyte','OPC','microglial cell','dopaminergic neuron','medium spiny neuron','ependymal cell','endothelial cell','pericyte','mural cell','fibroblast','CNS macrophage','leukocyte'];
  var IMMUNE_LABELS = ['CD4 T cell','CD8 T cell','classical monocyte','B cell','NK cell','macrophage','γδ T cell','regulatory T cell','MAIT cell','non-classical monocyte','plasma cell','conventional DC','innate lymphoid cell','plasmacytoid DC','mast cell','platelet','hematopoietic precursor','erythrocyte'];

  var ORGANS = [
    {name:'Human brain', status:'live', desc:'A healthy whole-brain backbone — cortex, hippocampus, midbrain and more. Disease cohorts are layered in per query.', build:buildAtlas, labels:BRAIN_LABELS},
    {name:'Immune', status:'in progress', desc:'A cross-organ immune reference spanning blood and tissue compartments, built on the same engine.', build:buildImmune, labels:IMMUNE_LABELS, note:'reference in progress'},
    {name:'More organs', status:'planned', desc:'New references are added organ by organ. Working on a specific tissue? Tell us — it helps us prioritize.', build:buildPlanned, labels:null}
  ];
  var MODULES = [
    {t:'Data QC', d:'Per-sample quality control — flags low-quality cells and doublets before mapping, with MAD-based thresholds.', build:buildQC},
    {t:'Annotate cells or use your own labels', d:'Map cells to the reference for predicted types plus a per-cell confidence score — or bring your own labels and drive everything downstream from those.', build:buildAnnotate},
    {t:'Marker gene validation', d:'Checks canonical markers per predicted cell type, so you can see the calls are backed by the right genes.', build:buildDotplot},
    {t:'Cluster analysis', d:'Unsupervised clustering of your query, resolved at multiple resolutions and characterized cluster by cluster.', build:buildCluster},
    {t:'Differential expression', d:'Genes up- and down-regulated between groups, per cell type — shown as standard volcano plots.', build:buildVolcano},
    {t:'Identify deviant populations', d:'Flags cells that fall outside the reference, and surfaces shifts associated with disease state.', build:buildNovel},
    {t:'Shareable report', d:'Every run is packaged into one self-contained HTML report — all plots, tables, and a plain-language summary, ready to share by link.', build:buildReport},
    {t:'LLM-generated interpretation', d:'An optional plain-language write-up of the run — it narrates the figures and statistics that were produced, cites the numbers behind them, and never changes the underlying results.', build:buildInterpret}
  ];
  var DEFAULT_MOD = 1;
  var COLOR = function(i,n){ return 'hsl('+Math.round(i*360/n)+',58%,45%)'; };

  // ---- render ----
  var organRow = document.getElementById('organRow');
  ORGANS.forEach(function(o,i){
    var b=document.createElement('button');
    b.className='organ'+(i===0?' active':'');
    b.innerHTML=o.name+'<span class="st">'+o.status+'</span>';
    b.addEventListener('click', function(){ setOrgan(i); });
    organRow.appendChild(b);
  });
  function setOrgan(i){
    for(var j=0;j<organRow.children.length;j++) organRow.children[j].classList.toggle('active', j===i);
    var o=ORGANS[i];
    document.getElementById('atlasSvg').innerHTML=o.build(W,H);
    document.getElementById('atlasName').textContent=o.name+' reference';
    document.getElementById('atlasDesc').textContent=o.desc;
    var head=document.getElementById('atlasLegendHead'), leg=document.getElementById('atlasLegend');
    leg.innerHTML='';
    if(o.labels){
      head.textContent='Transfers '+o.labels.length+' harmonized cell types'+(o.note?' ('+o.note+')':'');
      head.style.display='';
      var html='';
      o.labels.forEach(function(name,k){
        html+='<span class="lchip"><span class="ld" style="background:'+COLOR(k,o.labels.length)+'"></span>'+name+'</span>';
      });
      leg.innerHTML=html;
    } else { head.style.display='none'; }
  }

  var selected = MODULES.map(function(){ return true; });   // all analyses on by default
  var modList=document.getElementById('modList');
  MODULES.forEach(function(m,i){
    var li=document.createElement('li');
    li.className='mod-item'+(i===DEFAULT_MOD?' active':'');
    li.innerHTML='<span class="chk'+(selected[i]?' on':'')+'"></span><span class="mt">'+m.t+'</span>';
    li.addEventListener('click', function(){
      selected[i]=!selected[i];                              // toggle the tick on/off
      this.querySelector('.chk').classList.toggle('on', selected[i]);
      setMod(i);                                             // and preview what was clicked
    });
    modList.appendChild(li);
  });
  function setMod(i){
    for(var j=0;j<modList.children.length;j++) modList.children[j].classList.toggle('active', j===i);
    var m=MODULES[i];
    document.getElementById('modSvg').innerHTML=m.build(W,H);
    document.getElementById('modName').textContent=m.t;
    document.getElementById('modDesc').textContent=m.d;
  }

  // ---- step 1 drop affordance (visual only — not wired to anything yet) ----
  var drop=document.getElementById('drop'), dropTxt=document.getElementById('dropTxt');
  if(drop){
    ['dragenter','dragover'].forEach(function(e){ drop.addEventListener(e,function(ev){ ev.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave','dragend'].forEach(function(e){ drop.addEventListener(e,function(ev){ ev.preventDefault(); drop.classList.remove('drag'); }); });
    drop.addEventListener('drop',function(ev){ ev.preventDefault(); drop.classList.remove('drag'); dropTxt.innerHTML='Uploads open during the alpha — request access below'; });
  }

  setOrgan(0);
  setMod(DEFAULT_MOD);
})();
