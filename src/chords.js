import { chordDatabase } from './chordData.js'; 

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // КООРДИНАТИ ТА БАЗОВІ НАЛАШТУВАННЯ
  // ==========================================
  const stringY = [ 58.39, 52.45, 46.51, 40.96 ];
  const muteX = 26.50; 
  const fretX = [ 
    31.00, 35.10, 41.50, 47.80, 53.70, 59.20, 64.30, 
    69.10, 73.60, 78.10, 82.40, 86.40, 90.10 
  ];

  const STRINGS_COUNT = 4;
  const FRETS_COUNT = 12; 
  const tuning = ['G', 'C', 'E', 'A']; 
  const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const enharmonicMap = {
    'C#': 'Db', 'Db': 'C#',
    'D#': 'Eb', 'Eb': 'D#',
    'F#': 'Gb', 'Gb': 'F#',
    'G#': 'Ab', 'Ab': 'G#',
    'A#': 'Bb', 'Bb': 'A#'
  };

  let currentFingering = [0, 0, 0, 0]; 
  let currentCapo = 0; 
  let currentMode = 'library'; 
  let currentVariations = [];
  let currentVariationIndex = 0;
  
  let currentRoot = 'C';
  let currentQuality = '';
  let currentLibraryTarget = null;

  // DOM-елементи
  const ukuleleViewEl = document.getElementById('ukuleleView');
  const chordNameEl = document.getElementById('chordResult');
  const chordNotesEl = document.getElementById('chordNotes');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const infoContent = document.getElementById('dynamicInfoContent');
  const capoSlider = document.getElementById('capoSlider');
  const capoVisual = document.getElementById('capoVisual');
  const resetBtn = document.getElementById('resetBtn');
  const libraryPanel = document.getElementById('chordLibraryPanel');

  const mobileRotateBtn = document.getElementById('mobileRotateBtn');
  const ukuleleWorkspace = document.getElementById('ukuleleWorkspace');

  // ==========================================
  // КОНФІГУРАЦІЯ РЕЖИМІВ
  // ==========================================
  const modeConfigs = {
    library: {
      primaryCount: 5, 
      qualities: [
        { id: '', label: 'Maj' },
        { id: 'm', label: 'Min' },
        { id: '7', label: '7' },
        { id: 'm7', label: 'm7' },
        { id: 'maj7', label: 'Maj7' },
        { id: 'sus4', label: 'sus4' },
        { id: 'sus2', label: 'sus2' },
        { id: 'dim', label: 'dim' },
        { id: 'aug', label: 'aug' },
        { id: '6', label: '6' },
        { id: 'm6', label: 'm6' },
        { id: '9', label: '9' },
        { id: 'm9', label: 'm9' },
        { id: 'maj9', label: 'Maj9' },
        { id: '11', label: '11' },
        { id: '13', label: '13' },
        { id: 'dim7', label: 'dim7' },
        { id: 'm7b5', label: 'm7b5' },
        { id: '7sus4', label: '7sus4' },
        { id: '7#9', label: '7#9' },
        { id: '7b9', label: '7b9' },
        { id: 'add9', label: 'add9' },
        { id: 'm(add9)', label: 'm(add9)' }
      ]
    },
    scales: {
      primaryCount: 2,
      qualities: [
        { id: 'major_scale', label: 'Мажорна гама', intervals: [0, 2, 4, 5, 7, 9, 11] },
        { id: 'minor_scale', label: 'Мінорна гама', intervals: [0, 2, 3, 5, 7, 8, 10] },
        { id: 'pentatonic_major', label: 'Пентатоніка мажор', intervals: [0, 2, 4, 7, 9] },
        { id: 'pentatonic_minor', label: 'Пентатоніка мінор', intervals: [0, 3, 5, 7, 10] },
        { id: 'blues', label: 'Блюзова', intervals: [0, 3, 5, 6, 7, 10] },
        { id: 'harmonic_minor', label: 'Гармонічний мінор', intervals: [0, 2, 3, 5, 7, 8, 11] },
        { id: 'melodic_minor', label: 'Мелодичний мінор', intervals: [0, 2, 3, 5, 7, 9, 11] },
        { id: 'dorian', label: 'Дорійський', intervals: [0, 2, 3, 5, 7, 9, 10] },
        { id: 'phrygian', label: 'Фрігійський', intervals: [0, 1, 3, 5, 7, 8, 10] },
        { id: 'lydian', label: 'Лідійський', intervals: [0, 2, 4, 6, 7, 9, 11] },
        { id: 'mixolydian', label: 'Міксолідійський', intervals: [0, 2, 4, 5, 7, 9, 10] },
        { id: 'locrian', label: 'Локрійський', intervals: [0, 1, 3, 5, 6, 8, 10] }
      ]
    },
    arpeggio: {
      primaryCount: 2,
      qualities: [
        { id: 'maj_arp', label: 'Мажор', intervals: [0, 4, 7] },
        { id: 'min_arp', label: 'Мінор', intervals: [0, 3, 7] },
        { id: 'maj7_arp', label: 'Maj7', intervals: [0, 4, 7, 11] },
        { id: 'min7_arp', label: 'm7', intervals: [0, 3, 7, 10] },
        { id: 'dom7_arp', label: '7', intervals: [0, 4, 7, 10] },
        { id: 'dim_arp', label: 'Dim', intervals: [0, 3, 6] },
        { id: 'aug_arp', label: 'Aug', intervals: [0, 4, 8] }
      ]
    }
  };

  const tabInfoContent = {
    build: "В режимі <b>Побудова</b> ви можете самостійно клікати по струнах та ладах...",
    library: "У режимі <b>Акорди</b> виберіть кореневу ноту та тип акорду...",
    scales: "Режим <b>Гами</b> підсвічує ноти, що входять до обраного звукоряду...",
    arpeggio: "Режим <b>Арпеджіо</b> показує ноти акорду для покрокової гри..."
  };

  function getQualityLabel() {
    if (currentMode === 'library') {
      const q = modeConfigs.library.qualities.find(item => item.id === currentQuality);
      return q ? q.label : currentQuality;
    }
    const modeConfig = modeConfigs[currentMode];
    if (modeConfig) {
      const q = modeConfig.qualities.find(item => item.id === currentQuality);
      return q ? q.label : currentQuality;
    }
    return currentQuality;
  }

  const infoToggleBtn = document.getElementById('infoToggleBtn');
  const infoContentMobile = document.getElementById('infoContent');

  if (infoToggleBtn && infoContentMobile) {
    infoToggleBtn.addEventListener('click', () => {
      infoContentMobile.classList.toggle('open');
      infoToggleBtn.classList.toggle('active');
    });
  }

  // --- ПЛАВНЕ ПЕРЕМИКАННЯ РЕЖИМІВ ТА АНІМАЦІЯ СЛАЙДЕРА ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentMode = e.target.dataset.tab;
      
      document.body.setAttribute('data-mode', currentMode);
      
      if (infoContent) infoContent.innerHTML = tabInfoContent[currentMode];

      const capoPanel = document.getElementById('capoSlider')?.closest('.capo-control') || document.querySelector('.capo-control');

      if (currentMode === 'build') {
        if (capoPanel) capoPanel.classList.add('visible'); 
        if (libraryPanel) libraryPanel.classList.remove('active-panel');
        setCapo(0);
        currentFingering = [0, 0, 0, 0];
        currentLibraryTarget = null;
        updateUI();
        checkChord(); 
      } else {
        if (capoPanel) capoPanel.classList.remove('visible'); 
        if (libraryPanel) {
            libraryPanel.classList.add('active-panel');
            setTimeout(() => {
                currentQuality = (currentMode === 'library') ? '' : modeConfigs[currentMode].qualities[0].id;
                buildLibrary(); 
                updateSelection();
            }, 100); 
        }
      }
    });
  });

  if (capoSlider) {
    capoSlider.addEventListener('input', (e) => {
      setCapo(parseInt(e.target.value));
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentFingering = [0, 0, 0, 0];
      setCapo(0);
      currentLibraryTarget = null;
      hideVariations();
      updateUI();
      checkChord();
    });
  }

  function setCapo(fret) {
    currentCapo = fret;
    if (capoSlider) capoSlider.value = fret;
    
    const capoValueDisplay = document.getElementById('capoValue');
    if (capoValueDisplay) capoValueDisplay.innerText = fret;
    
    if (fret > 0) {
      capoVisual.style.display = 'block';
      capoVisual.style.left = `${fretX[fret]}%`;
    } else {
      capoVisual.style.display = 'none';
    }

    currentFingering = currentFingering.map(f => (f !== 0 && f < fret) ? 0 : f);
    updateUI();
    if (currentMode === 'build') checkChord();
  }

  function buildMatrix() {
    if (!ukuleleViewEl) return; 
    
    ukuleleViewEl.querySelectorAll('.interactive-node, .mute-node').forEach(n => n.remove());

    for (let stringIdx = 0; stringIdx < STRINGS_COUNT; stringIdx++) {
      const mNode = document.createElement('div');
      mNode.className = 'mute-node';
      mNode.dataset.string = stringIdx;
      mNode.style.left = `${muteX}%`;
      mNode.style.top = `${stringY[stringIdx]}%`;
      mNode.innerHTML = `<div class="mute-dot">X</div>`;
      mNode.addEventListener('click', () => handleNodeClick(stringIdx, 0));
      ukuleleViewEl.appendChild(mNode);

      for (let fret = 1; fret <= FRETS_COUNT; fret++) {
        const node = document.createElement('div');
        node.className = 'interactive-node';
        node.dataset.string = stringIdx;
        node.dataset.fret = fret;
        node.style.left = `${fretX[fret]}%`;
        node.style.top = `${stringY[stringIdx]}%`;
        
        const noteName = getNoteName(tuning[stringIdx], fret);
        node.innerHTML = `<div class="finger-dot">${noteName}</div>`;
        
        node.addEventListener('click', () => handleNodeClick(stringIdx, fret));
        ukuleleViewEl.appendChild(node);
      }
    }
  }

  function getNoteName(openNote, fret) {
    let startIdx = chromaticScale.indexOf(openNote);
    return chromaticScale[(startIdx + fret) % 12];
  }

  function handleNodeClick(stringIdx, fret) {
    if (currentMode !== 'build') return; 
    
    if (currentCapo > 0 && fret > 0 && fret < currentCapo) {
      return; 
    }
    
    if (currentFingering[stringIdx] === fret) {
      currentFingering[stringIdx] = 0; 
    } else {
      currentFingering[stringIdx] = fret;
    }
    
    updateUI();
    checkChord();
  }

  function updateUI() {
    document.querySelectorAll('.interactive-node').forEach(node => {
      node.classList.remove('active', 'disabled');
      const fret = parseInt(node.dataset.fret);
      if (currentCapo > 0 && fret < currentCapo) {
        node.classList.add('disabled');
      }
    });
    
    document.querySelectorAll('.mute-node').forEach(node => {
      node.classList.remove('active');
    });

    currentFingering.forEach((fretValue, stringIdx) => {
      if (fretValue === 0 && currentCapo === 0) {
        const mNode = document.querySelector(`.mute-node[data-string="${stringIdx}"]`);
        if (mNode) mNode.classList.add('active');
      } else if (fretValue > 0) {
        if (currentCapo > 0 && fretValue === currentCapo) return;
        const targetNode = document.querySelector(`.interactive-node[data-string="${stringIdx}"][data-fret="${fretValue}"]`);
        if (targetNode) targetNode.classList.add('active');
      }
    });

    toggleResetButton();
  }

  function toggleResetButton(forceShow = false) {
    if (!resetBtn) return;

    if (currentMode === 'scales' || currentMode === 'arpeggio') {
      resetBtn.classList.remove('show');
      return;
    }

    let isDirty = forceShow || false;
    
    if (!forceShow) {
      if (currentMode === 'build') {
         const hasFingers = currentFingering.some(f => f !== 0);
         const hasCapo = currentCapo !== 0;
         isDirty = hasFingers || hasCapo;
      } else if (currentMode === 'library') {
         isDirty = currentLibraryTarget !== null;
      }
    }

    if (isDirty) {
      resetBtn.classList.add('show');
    } else {
      resetBtn.classList.remove('show');
    }
  }

  // ==========================================
  // ВАРІАЦІЇ АКОРДІВ
  // ==========================================
  function hideVariations() {
    const container = document.getElementById('variationsContainer');
    if (container) {
        container.classList.remove('visible');
    }
  }

  function showVariations(variationsList) {
    const container = document.getElementById('variationsContainer');
    
    currentVariations = variationsList;
    currentVariationIndex = 0;

    if (!container || variationsList.length <= 1) {
      hideVariations();
      if (variationsList.length === 1) {
          applyVariation(currentVariations[0]);
      }
      return;
    }
    
    updateVariationDisplay();
    container.classList.add('visible');
  }

  function updateVariationDisplay() {
    const varCountDisplay = document.getElementById('variationCount');
    if (varCountDisplay) {
      varCountDisplay.innerText = `${currentVariationIndex + 1} / ${currentVariations.length}`;
    }
    applyVariation(currentVariations[currentVariationIndex]);
  }

  document.addEventListener('click', (e) => {
    const prevBtn = e.target.closest('#prevVariationBtn');
    if (prevBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (currentVariations.length <= 1) return;
      currentVariationIndex--;
      if (currentVariationIndex < 0) currentVariationIndex = currentVariations.length - 1;
      updateVariationDisplay();
      return;
    }

    const nextBtn = e.target.closest('#nextVariationBtn');
    if (nextBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (currentVariations.length <= 1) return;
      currentVariationIndex++;
      if (currentVariationIndex >= currentVariations.length) currentVariationIndex = 0;
      updateVariationDisplay();
      return;
    }
  });

  function applyVariation(variationKey) {
    if (!variationKey) return;
    
    const cleanKey = variationKey.split('*')[0];
    const parts = cleanKey.split(',').map(Number);
    
    const variationData = chordDatabase[variationKey];
    if (!variationData) return;
    
    currentCapo = 0; 
    currentFingering = [...parts];
    
    if (variationData.barre) {
        setCapo(variationData.barre);
    } else {
        setCapo(0);
    }
    
    if (chordNameEl && variationData.name) {
      chordNameEl.innerText = variationData.name.replace('#', '♯');
    }
    if (chordNotesEl && variationData.note) {
      chordNotesEl.innerText = variationData.note;
    }

    updateUI();
  }

  // ==========================================
  // ДОПОМІЖНА ФУНКЦІЯ: РОЗУМНЕ ОБРІЗАННЯ ТЕКСТУ ТІЛЬКИ ДЛЯ НАЗВ
  // ==========================================
  function formatTruncatedText(arr, separator) {
    // ДИНАМІЧНИЙ ЛІМІТ: 1 назва для телефонів, 2 для десктопу
    const limit = window.innerWidth <= 768 ? 1 : 2;

    if (arr.length <= limit) {
      return arr.join(separator).replace(/#/g, '♯');
    }
    
    let visible = arr.slice(0, limit).join(separator).replace(/#/g, '♯');
// Замість <br> робимо стильні плитки (теги) для кожного акорду
    let fullList = arr.map(item => `<span class="popup-chord-tag">${item.replace(/#/g, '♯')}</span>`).join('');
    
    return `${visible} <span class="more-indicator" tabindex="0">...<div class="more-popup">${fullList}</div></span>`;
  }

  // Перемальовуємо текст, якщо користувач перевернув телефон чи змінив розмір вікна
  window.addEventListener('resize', () => {
    if (currentMode === 'build' || currentMode === 'library') {
      checkChord(); 
    }
  });

  function checkChord() {
    const effectiveFingering = currentFingering.map(f => f === 0 ? currentCapo : f);
    const targetKey = effectiveFingering.join(',');
    
    const matchedKeys = Object.keys(chordDatabase).filter(key => {
        return key.split('*')[0] === targetKey;
    });

    if (matchedKeys.length > 0) {
        const uniqueNamesArr = [...new Set(matchedKeys.map(k => chordDatabase[k].name))];
        const uniqueNotesArr = [...new Set(matchedKeys.map(k => chordDatabase[k].note))];
        
        // 1. Назви виводимо з кнопкою (якщо їх забагато)
        if (chordNameEl) {
            chordNameEl.innerHTML = formatTruncatedText(uniqueNamesArr, ' / ');
        }
        
        // 2. Опис (ноти) виводимо БЕЗ кнопки за новою логікою
        if (chordNotesEl) {
            if (uniqueNotesArr.length <= 2) {
                // Якщо 1 або 2 описи - виводимо їх повністю
                chordNotesEl.innerHTML = uniqueNotesArr.join(' АБО ');
            } else {
                // Якщо більше 2-х - обрізаємо і залишаємо ТІЛЬКИ перший
                chordNotesEl.innerHTML = uniqueNotesArr[0];
            }
        }
    } else {
        if (chordNameEl) chordNameEl.innerText = "---";
        const isCompletelyEmpty = effectiveFingering.every(f => f === 0);
        
        if (chordNotesEl) {
            chordNotesEl.innerText = isCompletelyEmpty 
                ? "Вибери лади на струнах" 
                : "Невідомий акорд";
        }
    }
  }

  // ==========================================
  // ГЕНЕРАЦІЯ ПАНЕЛІ КОНСТРУКТОРА
  // ==========================================
  function buildLibrary() {
    if (!libraryPanel) return;
    
    let html = '';
    const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    html += `<div id="rootNotesContainer">`;
    naturalNotes.forEach(note => {
        const isSelectedRoot = currentRoot.replace(/#|b/, '') === note;
        const rootActiveCls = isSelectedRoot ? 'active-base' : '';
        
        const sharpNote = note + '#';
        const flatNote = note + 'b';
        
        const isSharpActive = currentRoot === sharpNote ? 'active' : '';
        const isFlatActive = currentRoot === flatNote ? 'active' : '';
        
        const hasSharp = ['C','D','F','G','A'].includes(note);
        const hasFlat = ['D','E','G','A','B'].includes(note);
        
        html += `<div class="note-group">
            <button class="main-note-btn ${rootActiveCls}" data-note="${note}">${note}</button>
            <div class="note-modifiers">`;
            
        if (hasSharp) {
            html += `<button class="mod-btn ${isSharpActive}" data-note="${sharpNote}">♯</button>`;
        } 
        
        if (hasFlat) {
            html += `<button class="mod-btn ${isFlatActive}" data-note="${flatNote}">♭</button>`;
        } 
        
        html += `</div></div>`;
    });
    html += `</div>`;
    
    const config = modeConfigs[currentMode];
    if (config) {
        html += `<div id="qualityContainer">`;
        
        const pCount = config.primaryCount || config.qualities.length;
        const primaryQualities = config.qualities.slice(0, pCount);
        const extraQualities = config.qualities.slice(pCount);

        html += `<div class="primary-qualities">`;
        primaryQualities.forEach(q => {
            const activeCls = (currentQuality === q.id) ? 'active' : '';
            html += `<button class="quality-btn ${activeCls}" data-quality="${q.id}">${q.label}</button>`;
        });
        html += `</div>`;

        if (extraQualities.length > 0) {
            const isExtraActive = extraQualities.some(q => q.id === currentQuality);
            const extraExpandedCls = isExtraActive ? 'expanded' : '';
            const toggleText = isExtraActive ? 'Згорнути ▲' : 'Додатково ▼';
            
            html += `<button class="toggle-extra-btn" id="toggleExtraBtn">${toggleText}</button>`;
            html += `<div class="extra-qualities-wrapper ${extraExpandedCls}" id="extraQualitiesWrapper">`;
            html += `<div class="extra-qualities-inner">`;
            
            extraQualities.forEach(q => {
                const activeCls = (currentQuality === q.id) ? 'active' : '';
                html += `<button class="quality-btn ${activeCls}" data-quality="${q.id}">${q.label}</button>`;
            });
            
            html += `</div></div>`;
        }
        
        html += `</div>`;
    }

    libraryPanel.innerHTML = html;

    libraryPanel.querySelectorAll('.main-note-btn, .mod-btn').forEach(btn => {
        if (btn.classList.contains('disabled')) return;
        btn.addEventListener('click', (e) => {
            currentRoot = e.target.dataset.note;
            buildLibrary(); 
            updateSelection();
        });
    });

    libraryPanel.querySelectorAll('.quality-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentQuality = e.target.dataset.quality;
            buildLibrary();
            updateSelection();
        });
    });

    const toggleExtraBtn = document.getElementById('toggleExtraBtn');
    const extraWrapper = document.getElementById('extraQualitiesWrapper');
    
    if (toggleExtraBtn && extraWrapper) {
        toggleExtraBtn.addEventListener('click', () => {
            extraWrapper.classList.toggle('expanded');
            toggleExtraBtn.innerHTML = extraWrapper.classList.contains('expanded') ? 'Згорнути ▲' : 'Додатково ▼';
        });
    }
  }

  function updateSelection() {
    if (currentMode === 'library') {
      let targetName = currentRoot + currentQuality;
      
      const foundKeys = Object.keys(chordDatabase).filter(key => {
        const dbName = chordDatabase[key].name;
        return dbName === targetName || dbName.split(' / ').includes(targetName);
      });

      if (foundKeys.length > 0) {
        currentLibraryTarget = targetName;
        showVariations(foundKeys);
        toggleResetButton(true);
      } else {
        if (chordNameEl) chordNameEl.innerText = "---";
        if (chordNotesEl) chordNotesEl.innerText = `Акорд ${targetName.replace('#', '♯')} не знайдено`;
        currentFingering = [0, 0, 0, 0];
        setCapo(0);
        updateUI();
        hideVariations();
        toggleResetButton(false);
      }
    } 
    else if (currentMode === 'scales' || currentMode === 'arpeggio') {
      const modeConfig = modeConfigs[currentMode];
      if (!modeConfig) return;
      
      const qualityData = modeConfig.qualities.find(q => q.id === currentQuality);
      if (!qualityData || !qualityData.intervals) return;
      
      let baseRoot = currentRoot.replace('b', '#');
      if (currentRoot.includes('b') && enharmonicMap[currentRoot]) {
          baseRoot = enharmonicMap[currentRoot];
      }

      const rootIndex = chromaticScale.indexOf(baseRoot);
      if (rootIndex === -1) return;

      const intervals = qualityData.intervals; 
      
      document.querySelectorAll('.interactive-node').forEach(n => n.classList.remove('active', 'disabled'));
      
      const notesToHighlight = intervals.map(interval => {
        return chromaticScale[(rootIndex + interval) % 12];
      });

      const displayNotes = notesToHighlight.map(note => {
        if (currentRoot.includes('b') && enharmonicMap[note]) {
          return enharmonicMap[note];
        }
        return note;
      });

      document.querySelectorAll('.interactive-node').forEach(node => {
        const noteName = node.querySelector('.finger-dot').innerText;
        if (notesToHighlight.includes(noteName)) {
          node.classList.add('active');
        }
      });

      if (chordNameEl) chordNameEl.innerText = `${currentRoot.replace('#', '♯')} ${getQualityLabel()}`;
      if (chordNotesEl) chordNotesEl.innerText = `Ноти: ${displayNotes.join(' - ')}`;
      toggleResetButton(true); 
      hideVariations();
    }
  }

  if (mobileRotateBtn) {
    mobileRotateBtn.addEventListener('click', () => {
      if (ukuleleWorkspace) {
        ukuleleWorkspace.style.opacity = '0';
        
        setTimeout(() => {
          const isOpening = !ukuleleWorkspace.classList.contains('fullscreen-rotated');
          ukuleleWorkspace.classList.toggle('fullscreen-rotated');
          
          if (isOpening) {
            mobileRotateBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><path d="M8 3v3h-3m18 0h-3v-3m0 18v-3h3m-18 0h3v3"></path></svg>';
            mobileRotateBtn.classList.add('active-mode');
            document.body.style.overflow = 'hidden';
            ukuleleWorkspace.scrollLeft = 0;
            ukuleleWorkspace.scrollTop = 0;
          } else {
            mobileRotateBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
            mobileRotateBtn.classList.remove('active-mode');
            document.body.style.overflow = '';
          }

          ukuleleWorkspace.style.opacity = '1';
        }, 250); 
      }
    });
  }

  let scrollTimeout;
  if (ukuleleWorkspace && mobileRotateBtn) {
    ukuleleWorkspace.addEventListener('scroll', () => {
      if (ukuleleWorkspace.classList.contains('fullscreen-rotated')) return;

      mobileRotateBtn.classList.add('scroll-hidden');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        mobileRotateBtn.classList.remove('scroll-hidden');
      }, 3000);
    });
  }

  function setInitialMobileScroll() {
    const workspace = document.getElementById('ukuleleWorkspace');
    const view = document.getElementById('ukuleleView');
    
    if (window.innerWidth <= 768 && workspace && view) {
      const targetPercent = 24.5; 
      const scrollAmount = (view.offsetWidth * targetPercent) / 100;
      workspace.scrollLeft = scrollAmount;
    }
  }

  setTimeout(setInitialMobileScroll, 50);

  // --- ІНІЦІАЛІЗАЦІЯ ---
  buildMatrix();
  buildLibrary();
  updateSelection(); 

  const capoPanel = document.getElementById('capoSlider')?.closest('.capo-control') || document.querySelector('.capo-control');
  if (capoPanel) {
      if (currentMode === 'build') capoPanel.classList.add('visible');
      else capoPanel.classList.remove('visible');
  }

  if (libraryPanel) {
    libraryPanel.classList.add('active-panel');
  }
  
  document.body.setAttribute('data-mode', currentMode);
});