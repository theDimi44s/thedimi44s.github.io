document.addEventListener('DOMContentLoaded', () => {
  
  const stringY = [ 58.39, 52.45, 46.51, 40.96 ];
  const muteX = 26.50; 
  const fretX = [ 
    31.00, 35.10, 41.50, 47.80, 53.70, 59.20, 64.30, 
    69.10, 73.60, 78.10, 82.40 
  ];

  const STRINGS_COUNT = 4;
  const FRETS_COUNT = 10; 
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
  let currentLibraryTarget = null; 

  const chordDatabase = window.chordDatabase || {};

  const tabInfoContent = {
    library: `<p><strong>&#10069; Інфо (Акорди):</strong><br>Натисни відповідний акорд з панелі нижче й отримай його вивід на укулеле!</p>`,
    build: `<p><strong>&#10069; Інфо (Побудова):</strong><br>Затискайте струни, щоб побачити назву акорду.<br><br><b>&#10071; FAQ:</b><br>Натисніть на будь-який лад - отримаєте назву ноти<br>Затисніть <b>три ноти</b> - отримаєте акорд<br><b>Баре-слайдер</b> - рухайте ним по ладах та комбінуйте з нотами</p>`,
    scales: `<p><strong>&#10069; Інфо (Гами):</strong><br>Оберіть тоніку (C-B) та тип гами (мажорна, мінорна тощо). На грифі миттєво підсвітяться всі ноти, що входять до цієї гами.</p>`,
    arpeggio: `<p><strong>&#10069; Інфо (Арпеджо):</strong><br>Оберіть тоніку та тип. На грифі відобразяться ноти для послідовного обігравання (арпеджо) відповідного акорду.</p>`
  };

  const modeConfigs = {
    library: {
      qualities: [
        { id: '', label: 'maj', primary: true }, { id: 'm', label: 'min', primary: true }, { id: '7', label: '7', primary: true }, 
        { id: 'm7', label: 'm7', primary: true }, { id: 'maj7', label: 'maj7', primary: true },
        { id: '6', label: '6' }, { id: 'maj9', label: 'maj9' }, { id: 'add9', label: 'add9' }, { id: 'add11', label: 'add11' },
        { id: 'm6', label: 'm6' }, { id: 'm9', label: 'm9' }, { id: 'madd9', label: 'madd9' }, { id: 'madd11', label: 'madd11' },
        { id: '9', label: '9' }, { id: '7b5', label: '7b5' }, { id: 'm7b5', label: 'm7b5' },
        { id: 'sus2', label: 'sus2' }, { id: 'sus4', label: 'sus4' }, { id: '7sus2', label: '7sus2' }, { id: '7sus4', label: '7sus4' },
        { id: 'dim', label: 'dim' }, { id: 'dim7', label: 'dim7' }, { id: 'aug', label: 'aug' }
      ]
    },
    scales: {
      qualities: [
        { id: 'maj', label: 'Мажорна', primary: true }, { id: 'min', label: 'Мінорна', primary: true },
        { id: 'pent_maj', label: 'Пентатоніка маж.' }, { id: 'pent_min', label: 'Пентатоніка мін.' }
      ]
    },
    arpeggio: {
      qualities: [
        { id: 'maj', label: 'Мажорне', primary: true }, { id: 'min', label: 'Мінорне', primary: true }, 
        { id: '7', label: 'Домінант. 7' }, { id: 'maj7', label: 'Велике маж. 7' }
      ]
    }
  };

  const intervalsData = {
    scales: {
      'maj': [0, 2, 4, 5, 7, 9, 11], 'min': [0, 2, 3, 5, 7, 8, 10],
      'pent_maj': [0, 2, 4, 7, 9], 'pent_min': [0, 3, 5, 7, 10]
    },
    arpeggio: {
      'maj': [0, 4, 7], 'min': [0, 3, 7],
      '7': [0, 4, 7, 10], 'maj7': [0, 4, 7, 11]
    }
  };

  let currentRoot = 'C';
  let currentQuality = ''; 

  const ukuleleViewEl = document.getElementById('ukuleleView');
  const chordNameEl = document.getElementById('chordResult');
  const chordNotesEl = document.getElementById('chordNotes');
  const resetBtn = document.getElementById('resetBtn');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const libraryPanel = document.getElementById('chordLibraryPanel');
  const capoSlider = document.getElementById('capoSlider');
  const capoValueEl = document.getElementById('capoValue');
  const capoVisual = document.getElementById('capoVisual');
  const mobileRotateBtn = document.getElementById('mobileRotateBtn');
  const ukuleleWorkspace = document.getElementById('ukuleleWorkspace');
  const infoToggleBtn = document.getElementById('infoToggleBtn');
  const infoContent = document.getElementById('infoContent');
  
  const variationsContainer = document.getElementById('variationsContainer');
  const prevVariationBtn = document.getElementById('prevVariationBtn');
  const nextVariationBtn = document.getElementById('nextVariationBtn');
  const variationCountEl = document.getElementById('variationCount');

  // БЕЗПЕКА: перевіряємо, чи є такий елемент
  if (infoContent) {
    infoContent.innerHTML = tabInfoContent[currentMode];
  }

  function getNoteName(stringIdx, fret) {
    if (fret === 'X') return 'X'; 
    const baseNote = tuning[stringIdx];
    const baseIdx = chromaticScale.indexOf(baseNote);
    return chromaticScale[(baseIdx + fret) % 12];
  }

  function getScaleNotes(rootNote, intervals) {
    const normalizedRoot = enharmonicMap[rootNote] && rootNote.includes('b') ? enharmonicMap[rootNote] : rootNote;
    const rootIdx = chromaticScale.indexOf(normalizedRoot);
    return intervals.map(interval => chromaticScale[(rootIdx + interval) % 12]);
  }

  function buildMatrix() {
    if (!ukuleleViewEl) return; // Запобіжник
    ukuleleViewEl.querySelectorAll('.interactive-node, .mute-node').forEach(n => n.remove());
    for (let s = 0; s < STRINGS_COUNT; s++) {
      const muteNode = document.createElement('div');
      muteNode.className = 'mute-node';
      muteNode.style.left = `${muteX}%`;
      muteNode.style.top = `${stringY[s]}%`;
      muteNode.dataset.string = s;
      const muteDot = document.createElement('div');
      muteDot.className = 'mute-dot';
      muteDot.innerText = 'X';
      muteNode.appendChild(muteDot);
      muteNode.addEventListener('click', () => handleMuteClick(s));
      ukuleleViewEl.appendChild(muteNode);
    }
    for (let f = 0; f <= FRETS_COUNT; f++) {
      for (let s = 0; s < STRINGS_COUNT; s++) {
        const node = document.createElement('div');
        node.className = 'interactive-node';
        node.style.left = `${fretX[f]}%`;
        node.style.top = `${stringY[s]}%`;
        node.dataset.fret = f;
        node.dataset.string = s;
        const dot = document.createElement('div');
        dot.className = 'finger-dot';
        dot.innerText = getNoteName(s, f); 
        node.appendChild(dot);
        node.addEventListener('click', () => handleFretClick(s, f));
        ukuleleViewEl.appendChild(node);
      }
    }
  }

  function switchToBuildMode() {
    if (currentMode === 'build') return;
    currentMode = 'build';
    currentLibraryTarget = null; 
    tabBtns.forEach(b => b.classList.remove('active'));
    const buildTab = document.querySelector('[data-tab="build"]');
    if (buildTab) buildTab.classList.add('active');
    if (infoContent) infoContent.innerHTML = tabInfoContent['build'];
    if (libraryPanel) libraryPanel.style.display = 'none'; 
  }

  // БЕЗПЕКА: перевірка на наявність capoSlider
  if (capoSlider) {
    capoSlider.addEventListener('input', (e) => {
      if (currentMode !== 'build' && currentMode !== 'library') switchToBuildMode(); 
      const val = parseInt(e.target.value);
      if (currentCapo !== val) {
        if (typeof navigator.vibrate === "function") navigator.vibrate(20); 
        setCapo(val);
      }
    });
  }

  function setCapo(fret) {
    currentCapo = fret;
    if (capoSlider) capoSlider.value = fret; 
    
    if (fret === 0) {
      if (capoValueEl) capoValueEl.innerText = "0";
      if (capoVisual) capoVisual.style.display = "none";
    } else {
      if (capoValueEl) capoValueEl.innerText = `${fret}`;
      if (capoVisual) {
        capoVisual.style.display = "block";
        capoVisual.style.left = `${fretX[fret]}%`;
      }
    }
    currentFingering = [fret, fret, fret, fret];
    if (currentMode === 'build' || currentMode === 'library') {
      updateUI();
      checkChord();
    }
  }

  function handleMuteClick(stringIdx) {
    if (currentMode !== 'build') switchToBuildMode(); 
    if (currentFingering[stringIdx] === 'X') {
      currentFingering[stringIdx] = currentCapo; 
    } else {
      currentFingering[stringIdx] = 'X'; 
    }
    updateUI();
    checkChord();
  }

  function handleFretClick(stringIdx, fret) {
    if (currentMode !== 'build') switchToBuildMode(); 
    if (currentFingering[stringIdx] === 'X') return; 
    if (fret < currentCapo) return; 

    if (currentFingering[stringIdx] === fret) {
      currentFingering[stringIdx] = currentCapo; 
    } else {
      currentFingering[stringIdx] = fret; 
    }
    updateUI();
    checkChord();
  }

  function updateUI() {
    if (currentMode === 'scales' || currentMode === 'arpeggio') return; 

    document.querySelectorAll('.interactive-node').forEach(n => {
      n.classList.remove('active', 'disabled');
    });
    document.querySelectorAll('.mute-node').forEach(n => n.classList.remove('active'));

    currentFingering.forEach((fretValue, stringIdx) => {
      if (fretValue === 'X') {
        const muteNode = document.querySelector(`.mute-node[data-string="${stringIdx}"]`);
        if (muteNode) muteNode.classList.add('active');
        document.querySelectorAll(`.interactive-node[data-string="${stringIdx}"]`).forEach(n => n.classList.add('disabled'));
        return;
      }
      if (currentCapo > 0 && fretValue === currentCapo) return;
      const targetNode = document.querySelector(`.interactive-node[data-string="${stringIdx}"][data-fret="${fretValue}"]`);
      if (targetNode) targetNode.classList.add('active');
    });

    toggleResetButton();
  }

  function toggleResetButton(forceShow = false) {
    if (!resetBtn) return;
    if (forceShow) {
      resetBtn.classList.remove('hide');
      return;
    }
    const isPlaying = currentFingering.some(f => f !== 0) || currentCapo !== 0;
    if (isPlaying) {
      resetBtn.classList.remove('hide');
    } else {
      resetBtn.classList.add('hide');
    }
  }

  // БЕЗПЕКА: перевірка на наявність кнопки очищення
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      switchToBuildMode();
      setCapo(0); 
      currentFingering = [0, 0, 0, 0];
      updateUI();
      checkChord(); 
    });
  }

  function hideVariations() {
    if(variationsContainer) variationsContainer.classList.remove('visible');
    currentVariations = [];
    currentVariationIndex = 0;
  }

  function updateVariationsUI(chordName, currentKey) {
    if (!variationsContainer) return;
    const targetNames = chordName.split('/').map(n => n.trim());
    currentVariations = [];
    
    for (const [key, data] of Object.entries(chordDatabase)) {
      if (!data || !data.name) continue;
      const dbNames = data.name.split('/').map(n => n.trim());
      
      if (targetNames.some(t => dbNames.includes(t))) {
        currentVariations.push(key);
      }
    }

    currentVariations = [...new Set(currentVariations)];

    if (currentVariations.length <= 1) {
      hideVariations();
      return;
    }

    currentVariationIndex = currentVariations.indexOf(currentKey);
    if (currentVariationIndex === -1) currentVariationIndex = 0; 

    if (variationCountEl) {
       variationCountEl.innerText = `${currentVariationIndex + 1} / ${currentVariations.length}`;
    }
    variationsContainer.classList.add('visible');
  }

  function applyVariation(key) {
    let cleanKey = key.split('*')[0]; 
    let fingeringArr = cleanKey.split(',').map(val => val === 'X' ? 'X' : Number(val));
    let validFrets = fingeringArr.filter(f => typeof f === 'number' && f > 0);
    let suggestedCapo = 0;

    const chordData = chordDatabase[key];

    if (chordData && chordData.barre !== undefined) {
      suggestedCapo = chordData.barre;
    } else if (validFrets.length === 4) { 
      let minFret = Math.min(...validFrets);
      let minFretCount = validFrets.filter(f => f === minFret).length;
      if (minFretCount === 4) {
        suggestedCapo = minFret;
      }
    }

    setCapo(suggestedCapo); 
    currentFingering = fingeringArr; 
    updateUI();
    checkChord(key); 
  }

  if (prevVariationBtn && nextVariationBtn) {
    prevVariationBtn.addEventListener('click', () => {
      if (currentVariations.length <= 1) return;
      currentVariationIndex = (currentVariationIndex - 1 + currentVariations.length) % currentVariations.length;
      applyVariation(currentVariations[currentVariationIndex]);
    });

    nextVariationBtn.addEventListener('click', () => {
      if (currentVariations.length <= 1) return;
      currentVariationIndex = (currentVariationIndex + 1) % currentVariations.length;
      applyVariation(currentVariations[currentVariationIndex]);
    });
  }

  // --- ЛОГІКА ВІДОБРАЖЕННЯ НАЗВИ АКОРДУ ТА ОПИСУ ---
  function checkChord(forcedKey = null) {
    const baseKey = currentFingering.join(',');
    let foundKey = null;
    let foundChord = null;

    if (forcedKey && chordDatabase[forcedKey]) {
      foundKey = forcedKey;
      foundChord = chordDatabase[forcedKey];
    } else {
      foundKey = baseKey;
      foundChord = chordDatabase[baseKey];
      
      if (!foundChord) {
        foundKey = Object.keys(chordDatabase).find(k => k.split('*')[0] === baseKey);
        if (foundKey) foundChord = chordDatabase[foundKey];
      }
    }

    const soundingNotes = currentFingering.map((fret, stringIdx) => getNoteName(stringIdx, fret));
    
    if (foundChord) {
      let displayChordName = foundChord.name;
      let displayChordNote = foundChord.note || "";

      if (currentMode === 'library') {
        if (currentLibraryTarget) {
          const namesList = foundChord.name.split('/').map(n => n.trim());
          const notesList = displayChordNote.split('/').map(n => n.trim());
          const targetIdx = namesList.indexOf(currentLibraryTarget);
          
          if (targetIdx !== -1) {
            displayChordName = currentLibraryTarget; 
            displayChordNote = notesList[targetIdx] || displayChordNote;
          }
        } else {
          displayChordName = foundChord.name.split('/')[0].trim();
          displayChordNote = displayChordNote.split('/')[0].trim();
        }
      } else if (currentMode === 'build') {
        const pureBaseChord = chordDatabase[baseKey];
        if (pureBaseChord && pureBaseChord.name) {
             displayChordName = pureBaseChord.name;
             displayChordNote = pureBaseChord.note || "";
        } else {
             displayChordName = foundChord.name; 
             displayChordNote = foundChord.note || "";
        }
      }

      if (chordNameEl) chordNameEl.innerText = displayChordName;
      if (chordNotesEl) chordNotesEl.innerText = `${displayChordNote} (${soundingNotes.join(' - ')})`;
      
      if (currentMode === 'library' || currentMode === 'build') {
         updateVariationsUI(foundChord.name, foundKey);
      } else {
         hideVariations();
      }
    } else {
      let capoSuffix = currentCapo > 0 ? ` (Капо на ${currentCapo})` : "";
      if (chordNameEl) chordNameEl.innerText = "???";
      if (chordNotesEl) chordNotesEl.innerText = `Ноти: ${soundingNotes.join(' - ')}${capoSuffix}`;
      hideVariations();
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentMode = e.target.dataset.tab;
      
      if (infoContent) infoContent.innerHTML = tabInfoContent[currentMode];

      if (currentMode === 'build') {
        if (libraryPanel) libraryPanel.style.display = 'none'; 
        setCapo(0);
        currentFingering = [0, 0, 0, 0];
        currentLibraryTarget = null;
        updateUI();
        checkChord(); 
      } else {
        if (libraryPanel) libraryPanel.style.display = 'flex'; 
        currentQuality = (currentMode === 'library') ? '' : modeConfigs[currentMode].qualities[0].id;
        buildLibrary(); 
        updateSelection(); 
      }
    });
  });

  function buildLibrary() {
    const rootContainer = document.getElementById('rootNotesContainer');
    const qualityContainer = document.getElementById('qualityContainer');
    
    if (!rootContainer || !qualityContainer) return;

    rootContainer.innerHTML = '';
    qualityContainer.innerHTML = '';

    const noteGroups = [
      { base: 'C', mods: ['#'] },
      { base: 'D', mods: ['#', 'b'] },
      { base: 'E', mods: ['b'] },
      { base: 'F', mods: ['#'] },
      { base: 'G', mods: ['#', 'b'] },
      { base: 'A', mods: ['#', 'b'] },
      { base: 'B', mods: ['b'] }
    ];

    noteGroups.forEach(group => {
      const groupEl = document.createElement('div');
      groupEl.className = 'note-group';

      const mainBtn = document.createElement('button');
      mainBtn.className = 'main-note-btn';
      mainBtn.dataset.note = group.base;
      mainBtn.innerText = group.base;

      mainBtn.addEventListener('click', () => {
        currentRoot = group.base;
        updateBuilderActiveStates();
        updateSelection();
      });
      groupEl.appendChild(mainBtn);

      if (group.mods.length > 0) {
        const modsEl = document.createElement('div');
        modsEl.className = 'note-modifiers';
        const sortedMods = group.mods.sort((a,b) => a === '#' ? -1 : 1);

        sortedMods.forEach(mod => {
          const modBtn = document.createElement('button');
          modBtn.className = 'mod-btn';
          modBtn.dataset.note = group.base + mod;
          modBtn.innerText = mod === '#' ? '♯' : '♭';

          modBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentRoot = group.base + mod;
            updateBuilderActiveStates();
            updateSelection();
          });
          modsEl.appendChild(modBtn);
        });
        groupEl.appendChild(modsEl);
      }
      rootContainer.appendChild(groupEl);
    });

    const qualities = modeConfigs[currentMode].qualities;
    const primaryQualities = qualities.filter(q => q.primary);
    const extraQualities = qualities.filter(q => !q.primary);

    const primaryContainer = document.createElement('div');
    primaryContainer.className = 'primary-qualities';
    qualityContainer.appendChild(primaryContainer);

    primaryQualities.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'quality-btn';
      btn.dataset.quality = q.id;
      btn.innerText = q.label;
      btn.addEventListener('click', () => {
        currentQuality = q.id;
        updateBuilderActiveStates();
        updateSelection();
      });
      primaryContainer.appendChild(btn);
    });

    if (extraQualities.length > 0) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'toggle-extra-btn';
      toggleBtn.innerHTML = 'Додатково ▼';
      qualityContainer.appendChild(toggleBtn);

      const extraWrapper = document.createElement('div');
      extraWrapper.className = 'extra-qualities-wrapper';

      const extraInner = document.createElement('div');
      extraInner.className = 'extra-qualities-inner';

      extraQualities.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'quality-btn';
        btn.dataset.quality = q.id;
        btn.innerText = q.label;
        btn.addEventListener('click', () => {
          currentQuality = q.id;
          updateBuilderActiveStates();
          updateSelection();
        });
        extraInner.appendChild(btn);
      });

      extraWrapper.appendChild(extraInner);
      qualityContainer.appendChild(extraWrapper);

      toggleBtn.addEventListener('click', () => {
        extraWrapper.classList.toggle('expanded');
        toggleBtn.innerHTML = extraWrapper.classList.contains('expanded') ? 'Приховати ▲' : 'Додатково ▼';
      });
    }

    updateBuilderActiveStates();
  }

  function updateBuilderActiveStates() {
    document.querySelectorAll('.main-note-btn, .mod-btn, .quality-btn').forEach(b => {
      b.classList.remove('active', 'active-base');
    });

    let base = currentRoot;
    let mod = null;
    if (currentRoot.length > 1) {
      base = currentRoot[0];
      mod = currentRoot.substring(1);
    }

    if (!mod) {
      const mainBtn = document.querySelector(`.main-note-btn[data-note="${base}"]`);
      if (mainBtn) mainBtn.classList.add('active');
    } else {
      const mainBtn = document.querySelector(`.main-note-btn[data-note="${base}"]`);
      if (mainBtn) mainBtn.classList.add('active-base'); 
      const modBtn = document.querySelector(`.mod-btn[data-note="${currentRoot}"]`);
      if (modBtn) modBtn.classList.add('active');
    }

    const qBtn = document.querySelector(`.quality-btn[data-quality="${currentQuality}"]`);
    if (qBtn) qBtn.classList.add('active');
  }

  function getQualityLabel() {
     const q = modeConfigs[currentMode].qualities.find(x => x.id === currentQuality);
     return q ? q.label : '';
  }

  function updateSelection() {
    if (currentMode === 'library') {
      const targetName = currentRoot + currentQuality; 
      currentLibraryTarget = targetName; 
      
      let foundKey = null;

      foundKey = Object.keys(chordDatabase).find(key => 
        chordDatabase[key] && chordDatabase[key].name === targetName
      );

      if (!foundKey) {
        for (const [key, data] of Object.entries(chordDatabase)) {
          if (!data || !data.name) continue;
          const namesList = data.name.split('/').map(n => n.trim());
          if (namesList.includes(targetName)) {
            foundKey = key;
            break;
          }
        }
      }
      
      if (foundKey) {
        let cleanKey = foundKey.split('*')[0];
        let fingeringArr = cleanKey.split(',').map(val => val === 'X' ? 'X' : Number(val));
        
        let validFrets = fingeringArr.filter(f => typeof f === 'number' && f > 0);
        let suggestedCapo = 0;
        if (chordDatabase[foundKey] && chordDatabase[foundKey].barre !== undefined) {
          suggestedCapo = chordDatabase[foundKey].barre;
        } else if (validFrets.length === 4) { 
          let minFret = Math.min(...validFrets);
          let minFretCount = validFrets.filter(f => f === minFret).length;
          if (minFretCount === 4) suggestedCapo = minFret;
        }

        setCapo(suggestedCapo); 
        currentFingering = fingeringArr;
        updateUI();
        checkChord(foundKey);
      } else {
        setCapo(0);
        currentFingering = [0, 0, 0, 0];
        updateUI(); 
        if (chordNameEl) chordNameEl.innerText = targetName;
        if (chordNotesEl) chordNotesEl.innerText = "Акорд відсутній у базі";
        hideVariations();
      }

    } else if (currentMode === 'scales' || currentMode === 'arpeggio') {
      setCapo(0); 
      currentFingering = [0, 0, 0, 0]; 
      
      document.querySelectorAll('.interactive-node').forEach(n => n.classList.remove('active', 'disabled'));
      document.querySelectorAll('.mute-node').forEach(n => n.classList.remove('active'));

      const intervals = intervalsData[currentMode][currentQuality];
      const notesToHighlight = getScaleNotes(currentRoot, intervals);

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

  // --- ЛОГІКА РОЗВОРОТУ НА МОБІЛЬНИХ (ПОВНОЕКРАННИЙ РЕЖИМ) ---
  // БЕЗПЕКА: перевірка на наявність кнопки розвороту
  if (mobileRotateBtn) {
    mobileRotateBtn.addEventListener('click', () => {
      if (ukuleleWorkspace) {
        ukuleleWorkspace.classList.toggle('fullscreen-rotated');
        
        if (ukuleleWorkspace.classList.contains('fullscreen-rotated')) {
          mobileRotateBtn.innerText = "✖ Закрити режим";
          mobileRotateBtn.classList.add('active-mode');
          ukuleleWorkspace.scrollLeft = 0;
          ukuleleWorkspace.scrollTop = 0;
        } else {
          mobileRotateBtn.innerText = "🔲 На весь екран";
          mobileRotateBtn.classList.remove('active-mode');
        }
      }
    });
  }


  buildMatrix();
  buildLibrary();
  updateSelection(); 
});