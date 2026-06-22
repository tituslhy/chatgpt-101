(function() {

  const btn = document.getElementById('themeToggle');
  const root = document.documentElement;

  function preferredTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (btn) {
      btn.textContent = theme === 'dark' ? '🌙' : '☀️';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  setTheme(root.getAttribute('data-theme') || preferredTheme());

  if (btn) {
    btn.addEventListener('click', function() {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next);
      setTimeout(updateChartColors, 50);
    });
  }

  // ─── CHART COLOR UTILS ───
  function getColors() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      grid:    dark ? 'rgba(255,255,255,0.07)' : '#EEEEEE',
      text:    dark ? '#666666' : '#888888',
      blue:    dark ? '#3399FF' : '#0085FF',
      indigo:  dark ? '#AB68FF' : '#7C3AED',
      orange:  '#F59E0B',
      red:     '#EF4444',
      fadBlue:   dark ? 'rgba(51,153,255,0.12)'  : 'rgba(0,133,255,0.08)',
      fadIndigo: dark ? 'rgba(171,104,255,0.10)' : 'rgba(124,58,237,0.06)',
      fadOrange: 'rgba(245,158,11,0.07)',
      textPrimary: dark ? '#ECECEC' : '#111111',
    };
  }

  // ─── BUILD ALL CHARTS ───
  const charts = {};

  function createChart(id, config) {
    const canvas = document.getElementById(id);
    if (!canvas || typeof Chart === 'undefined') return null;
    return new Chart(canvas, config);
  }

  function buildCharts() {
    const C = getColors();

    // 1. Market Share
    charts.market = createChart('marketChart', {
      type: 'line',
      data: {
        labels: ['Feb 2025','Apr','Jun','Aug','Oct','Dec','Feb 2026','Apr','May 2026'],
        datasets: [
          { label:'ChatGPT',  data:[87,84,80,76,72,68,63,56,46.4], borderColor:C.textPrimary, backgroundColor:C.fadIndigo, borderWidth:2.5, fill:true, tension:0.4, pointRadius:3, pointBackgroundColor:C.textPrimary },
          { label:'Gemini',   data:[5.6,7,9,12,15,18,22,25,27.7],  borderColor:C.orange,       backgroundColor:C.fadOrange, borderWidth:2.5, fill:true, tension:0.4, pointRadius:3, pointBackgroundColor:C.orange },
          { label:'Claude',   data:[1.4,1.6,1.8,2,2.2,2.5,4,8.2,10.3], borderColor:C.indigo, backgroundColor:C.fadIndigo, borderWidth:2.5, fill:true, tension:0.4, pointRadius:3, pointBackgroundColor:C.indigo },
          { label:'DeepSeek', data:[0,0,0,0,0,1,12,5,4.1], borderColor:C.blue, backgroundColor:C.fadBlue, borderWidth:2, fill:true, tension:0.4, pointRadius:3, pointBackgroundColor:C.blue, borderDash:[4,3] },
        ]
      },
      options: chartOpts(C, { yCallback: v => v+'%', yMax:100 })
    });

    // 2. DeepSeek
    charts.deepseek = createChart('deepseekChart', {
      type:'bar',
      data:{
        labels:['Jan 24','Jan 25 pre','Jan 27 CRASH','Feb 25','May 25','Oct 25'],
        datasets:[{
          label:'Nvidia Market Cap ($T)',
          data:[2.4,3.4,2.81,3.0,3.3,5.0],
          backgroundColor: ctx => ctx.dataIndex===2 ? '#EF4444' : C.blue,
          borderRadius:6, borderSkipped:false,
        }]
      },
      options: chartOpts(C, { yCallback: v => '$'+v+'T', legend:false,
        tooltipExtra: ctx => ctx.dataIndex===2 ? ' ← DeepSeek R1 released Jan 20' : ''
      })
    });

    // 3. Radar
    charts.radar = createChart('radarChart', {
      type:'radar',
      data:{
        labels:['Speed','Raw Intelligence','Cost Efficiency','Context Window','Tool Use','Safety/Honesty'],
        datasets:[
          { label:'GPT-5.5',          data:[88,85,72,70,80,70], borderColor:C.textPrimary, backgroundColor:root.getAttribute('data-theme')==='dark'?'rgba(236,236,236,0.06)':'rgba(17,17,17,0.05)', borderWidth:2, pointBackgroundColor:C.textPrimary },
          { label:'Claude Opus 4.8',  data:[65,92,68,90,88,92], borderColor:C.indigo,      backgroundColor:C.fadIndigo, borderWidth:2, pointBackgroundColor:C.indigo },
          { label:'Claude Sonnet 4.6',data:[82,84,88,88,84,88], borderColor:C.blue,        backgroundColor:C.fadBlue,   borderWidth:2, pointBackgroundColor:C.blue },
          { label:'Gemini 3.5 Flash', data:[92,78,90,85,76,72], borderColor:C.orange,      backgroundColor:C.fadOrange, borderWidth:2, pointBackgroundColor:C.orange },
        ]
      },
      options:{
        responsive:true,
        plugins:{ legend:{ position:'top', labels:{ usePointStyle:true, pointStyle:'circle', padding:20, color:C.text } } },
        scales:{ r:{
          grid:{ color:C.grid }, angleLines:{ color:C.grid },
          pointLabels:{ color:C.text, font:{ size:11 } },
          ticks:{ display:false }, min:0, max:100
        }}
      }
    });

    // 4. Subscription comparison
    charts.sub = createChart('subChart', {
      type:'bar',
      data:{
        labels:['Claude Max 20×\n(one plan)','Titus Armory Strategy™\n(3 × S$27)'],
        datasets:[
          { label:'Claude Pro/Max', data:[270,27], backgroundColor:C.indigo, borderRadius:6, borderSkipped:false },
          { label:'ChatGPT Plus',   data:[0,27],   backgroundColor:C.blue,   borderRadius:6, borderSkipped:false },
          { label:'Perplexity Pro', data:[0,27],   backgroundColor:C.orange, borderRadius:6, borderSkipped:false },
        ]
      },
      options:{
        indexAxis:'y', responsive:true,
        plugins:{
          legend:{ position:'top', labels:{ usePointStyle:true, pointStyle:'circle', padding:20, color:C.text } },
          tooltip:{ backgroundColor:'#111', borderColor:'#333', borderWidth:1, titleColor:'#fff', bodyColor:'#aaa', callbacks:{ label: c => ` S$${c.parsed.x}/month` } }
        },
        scales:{
          x:{ stacked:true, grid:{ color:C.grid }, ticks:{ color:C.text, callback: v => 'S$'+v }, max:300 },
          y:{ stacked:true, grid:{ display:false }, ticks:{ color:C.text } }
        }
      }
    });

    // 5. H2H
    charts.h2h = createChart('h2hChart', {
      type:'bar',
      data:{
        labels:['Writing','CLI Copilots','App Coding','Image Gen','Voice','Design Proto','Reasoning','Enterprise Trust','Free Tier','Instruction Follow','Sycophancy Resistance'],
        datasets:[
          { label:'ChatGPT', data:[68,95,80,95,88,20,82,72,94,72,55], backgroundColor:C.blue,   borderRadius:4, borderSkipped:false },
          { label:'Claude',  data:[92,95,85,5,72,90,88,88,36,90,88],  backgroundColor:C.indigo, borderRadius:4, borderSkipped:false },
        ]
      },
      options:{ indexAxis:'y', responsive:true,
        plugins:{ legend:{ position:'top', labels:{ usePointStyle:true, pointStyle:'circle', padding:20, color:C.text } }, tooltip:{ backgroundColor:'#111', borderColor:'#333', borderWidth:1, titleColor:'#fff', bodyColor:'#aaa' } },
        scales:{
          x:{ grid:{ color:C.grid }, ticks:{ color:C.text }, max:100, min:0 },
          y:{ grid:{ display:false }, ticks:{ color:C.text } }
        }
      }
    });

    // 6. ClosedAI Arc
    charts.arc = createChart('arcChart', {
      type:'line',
      data:{
        labels:["2022\n(ClosedAI joke)","2023\n(ChatGPT launch)","2024\n(For-profit)","2025\n(Elon sues)","2026\n(GPT-5.5 free)"],
        datasets:[
          { label:"OpenAI 'Openness'", data:[10,25,15,12,85], borderColor:C.blue, backgroundColor:C.fadBlue, borderWidth:2.5, fill:true, tension:0.3,
            pointRadius:6, pointBackgroundColor:['#EF4444','#F59E0B','#EF4444','#EF4444',C.blue], pointBorderWidth:0 },
          { label:"Titus's ClosedAI Accuracy", data:[95,90,98,99,5], borderColor:C.indigo, backgroundColor:C.fadIndigo, borderWidth:2, fill:true, tension:0.3,
            pointRadius:4, pointBackgroundColor:C.indigo, borderDash:[5,3] }
        ]
      },
      options: chartOpts(C, { yCallback: v => v+'%', yMax:110 })
    });
  }

  function chartOpts(C, extras={}) {
    return {
      responsive:true,
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend: extras.legend===false ? { display:false } : { position:'top', labels:{ usePointStyle:true, pointStyle:'circle', padding:20, color:C.text } },
        tooltip:{
          backgroundColor:'#111', borderColor:'#333', borderWidth:1, titleColor:'#fff', bodyColor:'#aaa',
          callbacks:{
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y ?? ctx.parsed.x}${extras.yCallback ? '' : ''}`,
            afterLabel: extras.tooltipExtra || undefined
          }
        }
      },
      scales:{
        x:{ grid:{ color:C.grid }, ticks:{ color:C.text } },
        y:{ grid:{ color:C.grid }, ticks:{ color:C.text, callback: extras.yCallback || (v=>v) }, max:extras.yMax||undefined, min:0 }
      }
    };
  }

  function updateChartColors() {
    const C = getColors();
    Object.values(charts).forEach(c => { if(c) c.destroy(); });
    buildCharts();
  }

  // Build on load
  buildCharts();

  // Track dark var for radar
  
})();
