/* VarnaOps — interactive Home app (compact stepper).
   Preview plots are deterministic illustrative SVGs (no real data).
   The "run" status is a front-end mock — no upload / job is performed yet. */
(function () {
  function prng(a){var r=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
    r.g=function(){var u=0,v=0;while(u===0)u=r();while(v===0)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};return r;}

  var PAL = ['#1d9e75','#2563eb','#7c3aed','#d97706','#0e9ca8','#db2777','#64748b'];
  var MUTE='#cbd2da';
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
    {t:'Check data quality', d:'Per-sample quality control — flags low-quality cells and doublets before mapping, with MAD-based thresholds.'},
    {t:'Call cell types', d:'Map cells to the reference for predicted types plus a per-cell confidence score — or bring your own labels and drive everything downstream from those.'},
    {t:'Validate cell type calls with marker genes', d:'Checks canonical marker genes per predicted cell type, so you can see the calls are backed by the right genes.'},
    {t:'Find subpopulations', d:'Unsupervised clustering of your query, resolved at multiple resolutions and characterized cluster by cluster.'},
    {t:'Find signature genes', d:'The genes that define each cell type or state — found by differential expression and shown as standard volcano plots.'},
    {t:'Compute cell abnormality score', d:'Scores how far each cell sits from the reference — flagging novel populations and shifts associated with disease state.'},
    {t:'Generate a report', d:'Every run is packaged into one self-contained HTML report — all plots, tables, and a plain-language summary, ready to share by link.'},
    {t:'Interpret results with an LLM', d:'An optional plain-language write-up of the run — it narrates the figures and statistics produced, cites the numbers, and never changes the underlying results.'}
  ];
  var STEPS = ['Biological context','Desired outcomes','Your data','Run'];
  var COLOR = function(i,n){ return 'hsl('+Math.round(i*360/n)+',58%,45%)'; };

  // ---- stepper (dots joined by a progress connector that fills as you advance) ----
  var stepper = document.getElementById('stepper');
  var panels = document.querySelectorAll('.panel');
  var current = 0;
  var html='';
  STEPS.forEach(function(t,i){
    if(i) html+='<span class="sconn"></span>';
    html+='<button class="step" data-i="'+i+'"><span class="sdot">'+(i+1)+'</span><span class="slabel">'+t+'</span></button>';
  });
  stepper.innerHTML=html;
  var stepBtns = stepper.querySelectorAll('.step');
  var connEls = stepper.querySelectorAll('.sconn');
  function goStep(i){
    i=+i; current=i;
    for(var j=0;j<stepBtns.length;j++){
      stepBtns[j].classList.remove('active','done');
      if(j===i) stepBtns[j].classList.add('active');
      else if(j<i) stepBtns[j].classList.add('done');
    }
    for(var c=0;c<connEls.length;c++) connEls[c].classList.toggle('done', c<i);
    panels.forEach(function(p){ p.classList.toggle('show', +p.getAttribute('data-p')===i); });
    if(i===3) refreshRunSummary();
  }
  stepper.addEventListener('click', function(e){
    var b=e.target.closest('.step'); if(b) goStep(+b.getAttribute('data-i'));
  });
  document.querySelectorAll('[data-go]').forEach(function(b){
    b.addEventListener('click', function(){ goStep(+b.getAttribute('data-go')); });
  });

  // ---- step 1: biological context ----
  var organRow = document.getElementById('organRow');
  ORGANS.forEach(function(o,i){
    var b=document.createElement('button');
    b.className='organ'+(i===0?' active':'');
    b.innerHTML=o.name+'<span class="st">'+o.status+'</span>';
    b.addEventListener('click', function(){ setOrgan(i); });
    organRow.appendChild(b);
  });
  var activeOrgan = 0;
  function setOrgan(i){
    activeOrgan=i;
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
      var h='';
      o.labels.forEach(function(name,k){ h+='<span class="lchip"><span class="ld" style="background:'+COLOR(k,o.labels.length)+'"></span>'+name+'</span>'; });
      leg.innerHTML=h;
    } else { head.style.display='none'; }
  }

  // ---- step 2: outputs ----
  var selected = MODULES.map(function(){ return true; });   // all on by default
  var modList=document.getElementById('modList'), modDesc=document.getElementById('modDesc');
  MODULES.forEach(function(m,i){
    var li=document.createElement('li');
    li.className='mod-item';
    li.innerHTML='<span class="chk'+(selected[i]?' on':'')+'"></span><span class="mt">'+m.t+'</span>';
    li.addEventListener('click', function(){
      selected[i]=!selected[i];
      this.querySelector('.chk').classList.toggle('on', selected[i]);
      modDesc.textContent=m.d;
    });
    modList.appendChild(li);
  });
  function selectedCount(){ return selected.filter(Boolean).length; }

  // ---- step 3: drop affordance (visual only) ----
  var drop=document.getElementById('drop'), dropTxt=document.getElementById('dropTxt'), hasFile=false;
  if(drop){
    ['dragenter','dragover'].forEach(function(e){ drop.addEventListener(e,function(ev){ ev.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave','dragend'].forEach(function(e){ drop.addEventListener(e,function(ev){ ev.preventDefault(); drop.classList.remove('drag'); }); });
    drop.addEventListener('drop',function(ev){ ev.preventDefault(); drop.classList.remove('drag'); hasFile=true; dropTxt.innerHTML='<code>your_data.h5ad</code> ready — continue to run'; });
    drop.addEventListener('click',function(){ hasFile=true; dropTxt.innerHTML='<code>your_data.h5ad</code> ready — continue to run'; });
  }

  // ---- step 4: run (mock status) ----
  var runSum=document.getElementById('runSum'), runBtn=document.getElementById('runBtn'), statusEl=document.getElementById('status');
  function refreshRunSummary(){
    runSum.innerHTML='<b>'+ORGANS[activeOrgan].name+'</b> reference · <b>'+selectedCount()+'</b> outcome'+(selectedCount()===1?'':'s')+' selected · '+(hasFile?'<b>your_data.h5ad</b>':'no file loaded yet');
  }
  var STAGES=['Uploading your data','Queued','Mapping cells to the reference','Transferring labels','Computing selected outputs','Building report'];
  var timer=null;
  if(runBtn){
    runBtn.addEventListener('click', function(){
      if(timer) return;
      runBtn.setAttribute('disabled','');
      runBtn.textContent='Running…';
      var rows = STAGES.map(function(name){ return '<div class="status-stage" data-s><span class="ic"></span>'+name+'</div>'; }).join('');
      statusEl.innerHTML='<div class="progress"><i id="pbar"></i></div>'+rows;
      var stages=statusEl.querySelectorAll('[data-s]'), bar=document.getElementById('pbar'), k=0;
      function tick(){
        if(k>0) { stages[k-1].classList.remove('active'); stages[k-1].classList.add('done'); }
        if(k<stages.length){
          stages[k].classList.add('active');
          bar.style.width=Math.round((k+0.5)/stages.length*100)+'%';
          k++; timer=setTimeout(tick, 1150);
        } else {
          bar.style.width='100%'; timer=null;
          runBtn.removeAttribute('disabled'); runBtn.textContent='Run again';
          statusEl.insertAdjacentHTML('beforeend','<p class="pmute" style="margin-top:14px">Done — illustrative. A real run returns a shareable report; <a href="login.html">sign in</a> to track it.</p>');
        }
      }
      tick();
    });
  }

  // ---- init ----
  setOrgan(0);
  goStep(0);
})();
