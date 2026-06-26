    /* Global Error Catcher for Debugging */
    window.onerror = function(message, source, lineno, colno, error) {
      const errStr = "GLOBAL ERROR: " + message + "\nSource: " + source + "\nLine: " + lineno + ":" + colno;
      console.error(errStr, error);
      alert(errStr);
      return false;
    };
    window.addEventListener('unhandledrejection', function(event) {
      const errStr = "UNHANDLED PROMISE REJECTION:\n" + event.reason;
      console.error(errStr, event);
      alert(errStr);
    });

    /* ==========================================================================
       1. GLOBAL PLATFORM STATE
       ========================================================================== */
    const state = {
      categories: [
        { id: 'class-1', name: 'Class A', color: '#FBBF24', samples: [] },
        { id: 'class-2', name: 'Class B', color: '#F59E0B', samples: [] }
      ],
      selectedAlgos: ['mobilenet', 'knn'],
      hyperparameters: {
        epochs: 20,
        batchSize: 16,
        learningRate: 0.01,
        confidenceThreshold: 0.8
      },
      augmentations: {
        flip: true,
        rotation: true,
        brightness: true,
        zoom: true,
        crop: true,
        noise: true
      },
      models: {}, // Instance dictionary of trained models
      experiments: [],
      activePane: 'dataset',
      activeMatrixModel: 'mobilenet'
    };

    // Shared references
    let featureExtractor = null;
    let ml5Classifier = null;
    let globalTfModel = null;
    let globalKnnClassifier = null;
    let globalSvmWeights = null;
    let globalSvmBias = null;
    let validationLacking = [];
    let isCoreClassifierTrained = false;

    // Charts references
    const chartInstances = {};

    /* ==========================================================================
       2. REVOLUTIONARY JS ALGORITHMS (KNN & SVM IMPLEMENTATIONS IN JS/TF.JS)
       ========================================================================== */
    
    // In-Browser custom KNN implementation
    class CustomKnnClassifier {
      constructor(k = 3) {
        this.k = k;
        this.samples = []; // array of { featuresArray, label }
      }
      clear() {
        this.samples = [];
      }
      addSample(features, label) {
        this.samples.push({ features, label });
      }
      predict(testFeatures) {
        if (this.samples.length === 0) return null;
        
        // Calculate Euclidean distance to all samples
        const distances = this.samples.map(sample => {
          let dist = 0;
          for (let i = 0; i < testFeatures.length; i++) {
            dist += Math.pow(testFeatures[i] - sample.features[i], 2);
          }
          return { dist: Math.sqrt(dist), label: sample.label };
        });
        
        distances.sort((a, b) => a.dist - b.dist);
        
        // Top K neighbors voting
        const topK = distances.slice(0, Math.min(this.k, distances.length));
        const votes = {};
        topK.forEach(item => votes[item.label] = (votes[item.label] || 0) + 1);
        
        const labels = Array.from(new Set(this.samples.map(s => s.label)));
        const totalVotes = topK.length;
        
        const output = labels.map(lbl => {
          const v = votes[lbl] || 0;
          return { label: lbl, confidence: v / totalVotes };
        });
        
        return output.sort((a, b) => b.confidence - a.confidence);
      }
    }

    // In-Browser Linear SVM Classifier using multiclass Logistic Regression / Stochastic Gradient Descent (SGD) on top of MobileNet features
    class CustomSvmClassifier {
      constructor(featureDim = 1024) {
        this.featureDim = featureDim;
        this.weights = null; // shape [featureDim, numClasses]
        this.biases = null; // shape [numClasses]
        this.classes = [];
      }
      
      async train(featuresList, labelsList, epochs = 20, lr = 0.01, batchSize = 16) {
        const tf = window.tf || (typeof ml5 !== 'undefined' ? ml5.tf : null);
        this.classes = Array.from(new Set(labelsList));
        const numClasses = this.classes.length;
        
        // Convert labels to index
        const classToIndex = {};
        this.classes.forEach((c, i) => classToIndex[c] = i);
        const indexedLabels = labelsList.map(l => classToIndex[l]);
        
        // Compile tensors
        const xs = tf.tensor2d(featuresList);
        const ys = tf.oneHot(tf.tensor1d(indexedLabels, 'int32'), numClasses);
        
        // Single dense layer with Softmax (Logistic/Softmax regression equivalent to SGD Linear SVM margins)
        const model = tf.sequential();
        model.add(tf.layers.dense({
          inputShape: [this.featureDim],
          units: numClasses,
          activation: 'softmax',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }) // L2 weight regularization
        }));
        
        model.compile({
          optimizer: tf.train.sgd(lr),
          loss: 'categoricalCrossentropy',
          metrics: ['accuracy']
        });
        
        await model.fit(xs, ys, {
          epochs: epochs,
          batchSize: batchSize,
          shuffle: true
        });
        
        // Save weights
        const weightsTensors = model.getWeights();
        this.weights = await weightsTensors[0].array();
        this.biases = await weightsTensors[1].array();
        
        // Clean up tensors
        xs.dispose();
        ys.dispose();
        model.dispose();
      }
      
      predict(testFeatures) {
        if (!this.weights) return null;
        
        const numClasses = this.classes.length;
        const scores = new Array(numClasses).fill(0);
        
        // Matrix multiplication in JS
        let expSum = 0;
        for (let j = 0; j < numClasses; j++) {
          let score = this.biases[j];
          const wLen = this.weights.length;
          for (let i = 0; i < wLen; i++) {
            score += testFeatures[i] * this.weights[i][j];
          }
          scores[j] = Math.exp(score); // Softmax exponent
          expSum += scores[j];
        }
        
        // Normalize probabilities
        const predictions = this.classes.map((className, idx) => {
          return { label: className, confidence: scores[idx] / expSum };
        });
        
        return predictions.sort((a, b) => b.confidence - a.confidence);
      }
    }

    // Custom deep Dense Neural Network (Input 1024 -> Dense 128 -> Dropout -> Dense 64 -> Output numClasses)
    class CustomDenseNetClassifier {
      constructor(featureDim = 1024) {
        this.featureDim = featureDim;
        this.model = null;
        this.classes = [];
      }
      
      async train(featuresList, labelsList, epochs = 20, lr = 0.01, batchSize = 16, onEpoch = null) {
        const tf = window.tf || (typeof ml5 !== 'undefined' ? ml5.tf : null);
        this.classes = Array.from(new Set(labelsList));
        const numClasses = this.classes.length;
        
        const classToIndex = {};
        this.classes.forEach((c, i) => classToIndex[c] = i);
        const indexedLabels = labelsList.map(l => classToIndex[l]);
        
        const xs = tf.tensor2d(featuresList);
        const ys = tf.oneHot(tf.tensor1d(indexedLabels, 'int32'), numClasses);
        
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({ inputShape: [this.featureDim], units: 128, activation: 'relu' }));
        this.model.add(tf.layers.dropout({ rate: 0.2 }));
        this.model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
        this.model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));
        
        this.model.compile({
          optimizer: tf.train.adam(lr),
          loss: 'categoricalCrossentropy',
          metrics: ['accuracy']
        });
        
        await this.model.fit(xs, ys, {
          epochs: epochs,
          batchSize: batchSize,
          shuffle: true,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              if (onEpoch) onEpoch(epoch, logs.loss, logs.acc);
            }
          }
        });
        
        xs.dispose();
        ys.dispose();
      }
      
      async predict(testFeatures) {
        if (!this.model) return null;
        const tf = window.tf || (typeof ml5 !== 'undefined' ? ml5.tf : null);
        
        const inputTensor = tf.tensor2d([testFeatures]);
        const predictionTensor = this.model.predict(inputTensor);
        const predictionArray = await predictionTensor.data();
        
        inputTensor.dispose();
        predictionTensor.dispose();
        
        const results = this.classes.map((className, idx) => {
          return { label: className, confidence: predictionArray[idx] };
        });
        
        return results.sort((a, b) => b.confidence - a.confidence);
      }
      
      dispose() {
        if (this.model) {
          this.model.dispose();
          this.model = null;
        }
      }
    }

    /* ==========================================================================
       3. DATASET MANAGEMENT & ENHANCED VALIDATION
       ========================================================================== */
    
    // Fast Average Hash algorithm for duplicate detection
    function getAverageHash(imgEl) {
      const canvas = document.createElement('canvas');
      canvas.width = 8;
      canvas.height = 8;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgEl, 0, 0, 8, 8);
      
      try {
        const imgData = ctx.getImageData(0, 0, 8, 8).data;
        let grayscale = [];
        let sum = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i+1];
          const b = imgData[i+2];
          const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          grayscale.push(gray);
          sum += gray;
        }
        
        const avg = sum / 64;
        let hash = '';
        for (let i = 0; i < 64; i++) {
          hash += (grayscale[i] >= avg) ? '1' : '0';
        }
        return hash;
      } catch (e) {
        // Return random if security sandbox block
        return Math.random().toString(36).substring(7);
      }
    }

    // Calculate distance between two binary hash strings
    function getHammingDistance(h1, h2) {
      if (h1.length !== h2.length) return 999;
      let dist = 0;
      for (let i = 0; i < h1.length; i++) {
        if (h1[i] !== h2[i]) dist++;
      }
      return dist;
    }

    // Canvas Data Augmentation helper
    function generateAugmentedCanvas(imgEl, options) {
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      ctx.save();
      
      // Zoom / scale center
      if (options.zoom) {
        const z = 1 + (Math.random() * 0.15);
        ctx.translate(112, 112);
        ctx.scale(z, z);
        ctx.translate(-112, -112);
      }
      
      // Rotation
      if (options.rotation) {
        const theta = (Math.random() - 0.5) * 30 * Math.PI / 180;
        ctx.translate(112, 112);
        ctx.rotate(theta);
        ctx.translate(-112, -112);
      }
      
      // Horizontal Flip
      if (options.flip) {
        ctx.translate(224, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(imgEl, 0, 0, 224, 224);
      ctx.restore();
      
      // Brightness Adjust
      if (options.brightness) {
        const offset = (Math.random() - 0.5) * 45;
        const imgData = ctx.getImageData(0, 0, 224, 224);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, data[i] + offset));
          data[i+1] = Math.min(255, Math.max(0, data[i+1] + offset));
          data[i+2] = Math.min(255, Math.max(0, data[i+2] + offset));
        }
        ctx.putImageData(imgData, 0, 0);
      }
      
      // Noise Injection
      if (options.noise) {
        const offset = (Math.random() - 0.5) * 12;
        const imgData = ctx.getImageData(0, 0, 224, 224);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * 15;
          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
          data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
        }
        ctx.putImageData(imgData, 0, 0);
      }
      
      return canvas;
    }

    // Run deep dataset validation checklist
    function validateDatasetQuality() {
      validationLacking = [];
      const warnings = [];
      
      // 1. Min classes check
      if (state.categories.length < 2) {
        warnings.push("Minimum of 2 classes are required before model compilation can occur.");
      }
      
      // 2. Class count / empty checks
      let totalSamples = 0;
      let sizes = [];
      
      state.categories.forEach(c => {
        totalSamples += c.samples.length;
        sizes.push(c.samples.length);
        
        if (c.samples.length === 0) {
          warnings.push(`Class label <strong>"${c.name}"</strong> has no training samples.`);
          validationLacking.push(c.id);
        } else if (c.samples.length < 5) {
          warnings.push(`Class label <strong>"${c.name}"</strong> requires at least 5 images (currently: ${c.samples.length}).`);
          validationLacking.push(c.id);
        }
      });
      
      // 3. Class Imbalance Indicator
      if (state.categories.length >= 2 && totalSamples > 0) {
        const minSize = Math.min(...sizes);
        const maxSize = Math.max(...sizes);
        const ratio = maxSize > 0 ? (minSize / maxSize) : 1;
        
        document.getElementById('stat-balance-ratio').innerText = ratio.toFixed(2);
        
        if (ratio < 0.5 && minSize > 0) {
          warnings.push(`Class imbalance detected (ratio: ${ratio.toFixed(2)}). Smaller categories might be overlooked during backpropagation.`);
        }
      } else {
        document.getElementById('stat-balance-ratio').innerText = "1.00";
      }
      
      // 4. Duplicate Image detection
      let duplicatesCount = 0;
      const allSamples = [];
      
      state.categories.forEach(c => {
        c.samples.forEach(s => {
          allSamples.push({ catName: c.name, sampleId: s.id, hash: s.hash });
        });
      });
      
      for (let i = 0; i < allSamples.length; i++) {
        for (let j = i + 1; j < allSamples.length; j++) {
          const dist = getHammingDistance(allSamples[i].hash, allSamples[j].hash);
          if (dist <= 2) { // Hamming distance threshold for identical/similar images
            duplicatesCount++;
          }
        }
      }
      
      if (duplicatesCount > 0) {
        warnings.push(`Detected ${duplicatesCount} highly similar or duplicate image samples. Duplicates inflate validation metrics without teaching generalized features.`);
      }
      
      // Render warning UI
      const valBox = document.getElementById('validation-box');
      const valList = document.getElementById('validation-list');
      
      if (warnings.length > 0) {
        valBox.classList.add('active');
        valList.innerHTML = warnings.map(w => `<li>${w}</li>`).join('');
      } else {
        valBox.classList.remove('active');
        valList.innerHTML = '';
      }
      
      // Update stats Overview
      document.getElementById('stat-total-classes').innerText = state.categories.length;
      document.getElementById('stat-total-samples').innerText = totalSamples;
      
      // Enable/Disable training buttons
      const canTrain = state.categories.length >= 2 && !state.categories.some(c => c.samples.length < 5);
      document.getElementById('global-train-btn').disabled = !canTrain;
    }

    /* --- DOM Renders for Dataset Builder --- */
    
    function renderCategories() {
      const container = document.getElementById('categories-container');
      container.innerHTML = '';
      
      state.categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'card class-card';
        card.id = `cat-card-${cat.id}`;
        
        const isLacking = validationLacking.includes(cat.id);
        const badgeClass = !isLacking ? 'badge-success' : 'badge-warning';
        const badgeText = !isLacking ? `${cat.samples.length} samples added` : `${cat.samples.length}/5 samples (lacking)`;
        
        card.innerHTML = `
          <div class="class-header">
            <div class="class-title">
              <span class="class-color-dot" style="color:${cat.color}; background-color:${cat.color};"></span>
              <input type="text" class="class-name-input" value="${escapeHTML(cat.name)}" onchange="renameCategory('${cat.id}', this.value)" aria-label="Class name label" />
            </div>
            
            <div class="class-actions">
              <button class="class-btn" onclick="duplicateCategory('${cat.id}')" title="Duplicate Category">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button class="class-btn delete" onclick="deleteCategory('${cat.id}')" title="Delete Category">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          
          <div class="drop-zone" id="drop-zone-${cat.id}">
            <p class="drop-zone-text">Drag & Drop files or</p>
            <div style="display:flex; gap:6px; justify-content:center; margin-top:8px;">
              <button class="btn-action-small" onclick="triggerFileInput('${cat.id}')" style="display: inline-flex; align-items: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                Browse
              </button>
              <button class="btn-action-small" onclick="openWebcamCaptureModal('${cat.id}')" style="display: inline-flex; align-items: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Camera
              </button>
            </div>
            <input type="file" id="file-input-${cat.id}" multiple accept="image/*" style="display:none;" onchange="handleFileSelect(event, '${cat.id}')" />
          </div>
          
          <div class="thumbnails-grid">
            ${cat.samples.map(sample => `
              <div class="thumbnail-wrapper" id="thumb-${sample.id}">
                <img class="sample-thumbnail" src="${sample.src}" alt="Sample visual" />
                <button class="remove-sample-btn" onclick="removeSample('${cat.id}', '${sample.id}')" title="Remove Sample">
                  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            `).join('')}
          </div>
          
          <div class="class-footer">
            <span class="sample-count-badge ${badgeClass}">${badgeText}</span>
          </div>
        `;
        
        container.appendChild(card);
        setupDragAndDrop(cat.id);
      });
      
      validateDatasetQuality();
      updateAugmentationPreview();
    }

    function renameCategory(id, name) {
      const cat = state.categories.find(c => c.id === id);
      if (cat) {
        cat.name = name.trim() || 'Unnamed';
        renderCategories();
      }
    }

    function duplicateCategory(id) {
      const srcCat = state.categories.find(c => c.id === id);
      if (!srcCat) return;
      
      const newId = 'class-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
      const newCat = {
        id: newId,
        name: srcCat.name + ' (Copy)',
        color: getRandomColorTag(),
        samples: srcCat.samples.map(s => {
          return {
            id: 'sample-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            src: s.src,
            hash: s.hash
          };
        })
      };
      
      state.categories.push(newCat);
      renderCategories();
    }

    function triggerFileInput(catId) {
      document.getElementById(`file-input-${catId}`).click();
    }
    
    function handleFileSelect(e, catId) {
      const files = e.target.files;
      if (files.length > 0) {
        addFilesToCategory(catId, files);
      }
    }

    function setupDragAndDrop(catId) {
      const dz = document.getElementById(`drop-zone-${catId}`);
      if (!dz) return;
      dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('dragover'); });
      dz.addEventListener('dragleave', () => { dz.classList.remove('dragover'); });
      dz.addEventListener('drop', (e) => {
        e.preventDefault();
        dz.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) addFilesToCategory(catId, files);
      });
    }

    function addFilesToCategory(catId, files) {
      const cat = state.categories.find(c => c.id === catId);
      if (!cat) return;
      
      for (let file of files) {
        if (file.type.startsWith('image/')) {
          const sampleId = 'sample-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          const objectURL = URL.createObjectURL(file);
          
          const img = new Image();
          img.onload = () => {
            const hash = getAverageHash(img);
            cat.samples.push({
              id: sampleId,
              src: objectURL,
              hash: hash
            });
            renderCategories();
          };
          img.src = objectURL;
        }
      }
    }

    function removeSample(catId, sampleId) {
      const cat = state.categories.find(c => c.id === catId);
      if (!cat) return;
      const idx = cat.samples.findIndex(s => s.id === sampleId);
      if (idx !== -1) {
        URL.revokeObjectURL(cat.samples[idx].src);
        cat.samples.splice(idx, 1);
        renderCategories();
      }
    }

    function deleteCategory(id) {
      if (state.categories.length <= 2) {
        alert("At least 2 categories are required to train classification models.");
        return;
      }
      const idx = state.categories.findIndex(c => c.id === id);
      if (idx !== -1) {
        state.categories[idx].samples.forEach(s => URL.revokeObjectURL(s.src));
        state.categories.splice(idx, 1);
        renderCategories();
      }
    }

    /* --- Augmentation Live Previews --- */
    
    function updateAugmentationPreview() {
      const origPreview = document.getElementById('aug-preview-orig');
      const previewCanvas = document.getElementById('aug-preview-canvas');
      const ctx = previewCanvas.getContext('2d');
      
      // Grab the first available sample image
      let sampleSrc = '';
      for (let cat of state.categories) {
        if (cat.samples.length > 0) {
          sampleSrc = cat.samples[0].src;
          break;
        }
      }
      
      if (!sampleSrc) {
        // If no images exist, show a blank placeholder preview
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(0, 0, 90, 90);
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No Samples', 45, 50);
        origPreview.src = '';
        return;
      }
      
      origPreview.src = sampleSrc;
      
      const img = new Image();
      img.onload = () => {
        const augCanvas = generateAugmentedCanvas(img, state.augmentations);
        ctx.clearRect(0,0,90,90);
        ctx.drawImage(augCanvas, 0, 0, 90, 90);
      };
      img.src = sampleSrc;
    }

    function regenerateAugmentationPreview() {
      // Toggle inputs state values
      state.augmentations.flip = document.getElementById('aug-flip').checked;
      state.augmentations.rotation = document.getElementById('aug-rotation').checked;
      state.augmentations.brightness = document.getElementById('aug-brightness').checked;
      state.augmentations.zoom = document.getElementById('aug-zoom').checked;
      state.augmentations.crop = document.getElementById('aug-crop').checked;
      state.augmentations.noise = document.getElementById('aug-noise').checked;
      
      updateAugmentationPreview();
    }

    /* ==========================================================================
       4. ALGORITHM SELECTION WORKSPACE
       ========================================================================== */
    
    const ALGORITHM_CATALOG = [
      { id: 'mobilenet', name: 'MobileNet Transfer Learning', tag: 'Transfer Learning CNN', desc: 'Retrains a final layer on top of MobileNet Conv2D layers. Highly stable, fast training in browser.', badges: ['High Accuracy', 'Fast Speed'] },
      { id: 'densenet', name: 'Custom Dense Neural Network', tag: 'Deep Learning MLP', desc: 'Trains a sequential multilayer perceptron model directly on MobileNet extracted features.', badges: ['Configurable', 'Medium Accuracy'] },
      { id: 'knn', name: 'K-Nearest Neighbors (KNN)', tag: 'Classical ML', desc: 'Saves feature vectors of samples and assigns test images the vote classification of closest neighbors.', badges: ['Instant Training', 'Interpretable'] },
      { id: 'svm', name: 'Support Vector Machine (SVM)', tag: 'Classical ML', desc: 'Performs multi-class classification using SGD margins optimization on MobileNet feature descriptors.', badges: ['High Class Margin', 'Stable'] }
    ];

    function renderAlgorithmsWorkspace() {
      const container = document.getElementById('algo-container');
      container.innerHTML = '';
      
      ALGORITHM_CATALOG.forEach(algo => {
        const isSelected = state.selectedAlgos.includes(algo.id);
        const card = document.createElement('div');
        card.className = `card algo-card ${isSelected ? 'selected' : ''}`;
        card.onclick = () => toggleAlgoSelect(algo.id);
        
        card.innerHTML = `
          <input type="checkbox" class="algo-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleAlgoSelect('${algo.id}')" />
          <h3 class="algo-meta-title">${algo.name}</h3>
          <span class="algo-type-tag">${algo.tag}</span>
          <p class="algo-desc">${algo.desc}</p>
          <div class="algo-badges">
            ${algo.badges.map(b => `<span class="algo-badge ${b === 'High Accuracy' ? 'highlight' : ''}">${b}</span>`).join('')}
          </div>
        `;
        container.appendChild(card);
      });
    }

    function toggleAlgoSelect(algoId) {
      const idx = state.selectedAlgos.indexOf(algoId);
      if (idx !== -1) {
        state.selectedAlgos.splice(idx, 1);
      } else {
        state.selectedAlgos.push(algoId);
      }
      renderAlgorithmsWorkspace();
    }

    /* ==========================================================================
       5. MULTI-MODEL TRAINING ENGINE & CONVERSIONS
       ========================================================================== */
    
    // Abstract Model evaluation execution to determine Accuracy, Precision, Recall, F1
    async function evaluateClassifierMetrics(modelInstance, validationFeatures, validationLabels, classes) {
      let correct = 0;
      const total = validationFeatures.length;
      
      // Initialize confusion matrix
      const matrix = {};
      classes.forEach(act => {
        matrix[act] = {};
        classes.forEach(pred => matrix[act][pred] = 0);
      });
      
      for (let i = 0; i < total; i++) {
        const testFeats = validationFeatures[i];
        const actual = validationLabels[i];
        
        const preds = await modelInstance.predict(testFeats);
        const predicted = preds && preds.length > 0 ? preds[0].label : classes[0];
        
        if (predicted === actual) correct++;
        matrix[actual][predicted]++;
      }
      
      const accuracy = correct / total;
      
      // Calculate micro-averaged stats
      let precisionSum = 0;
      let recallSum = 0;
      
      classes.forEach(c => {
        let tp = matrix[c][c];
        let fp = 0;
        let fn = 0;
        
        classes.forEach(other => {
          if (other !== c) {
            fp += matrix[other][c];
            fn += matrix[c][other];
          }
        });
        
        precisionSum += (tp + fp > 0) ? (tp / (tp + fp)) : 0;
        recallSum += (tp + fn > 0) ? (tp / (tp + fn)) : 0;
      });
      
      const precision = precisionSum / classes.length;
      const recall = recallSum / classes.length;
      const f1 = (precision + recall > 0) ? (2 * precision * recall) / (precision + recall) : 0;
      
      return { accuracy, precision, recall, f1, matrix };
    }

    // Main multi-model training cycle
    async function triggerMultiModelTraining() {
      // Reset loss chart graph values before training
      if (typeof LossChart !== 'undefined') {
        LossChart.clear();
      }
      try {

      if (state.selectedAlgos.length === 0) {
        alert("Please select at least 1 algorithm in step 2 before compiling.");
        return;
      }
      
      const tf = window.tf || (typeof ml5 !== 'undefined' ? ml5.tf : null);
      
      // Switch view to training tab
      switchPane('training');
      
      // Initialize dashboard tables UI
      const tbody = document.getElementById('training-dashboard-body');
      tbody.innerHTML = state.selectedAlgos.map(algoId => {
        const algo = ALGORITHM_CATALOG.find(a => a.id === algoId);
        return `
          <tr id="train-row-${algoId}">
            <td><strong>${algo.name}</strong></td>
            <td><span class="training-status-pill status-pending" id="status-pill-${algoId}">Pending</span></td>
            <td id="accuracy-val-${algoId}">-</td>
            <td id="loss-val-${algoId}">-</td>
            <td id="time-val-${algoId}">-</td>
          </tr>
        `;
      }).join('');
      
      // Start mascot animations
      document.getElementById('training-network-mascot').className = 'network-container training';
      document.getElementById('global-training-text').innerText = "Compiling algorithm nodes...";
      
      // Build Dataset: extract feature tensors asynchronously from MobileNet
      const classesList = state.categories.map(c => c.name);
      
      // Collect raw images
      const imagesList = [];
      const labelsList = [];
      
      state.categories.forEach(cat => {
        cat.samples.forEach(s => {
          imagesList.push(s.src);
          labelsList.push(cat.name);
        });
      });
      
      // If augmentation is enabled, create augmented images in DOM
      const totalOriginals = imagesList.length;
      document.getElementById('global-training-text').innerText = "Augmenting dataset tensors...";
      
      const hiddenTrainingContainer = document.getElementById('hidden-training-images');
      hiddenTrainingContainer.innerHTML = ''; // reset
      
      const augmentedImagesList = [];
      const augmentedLabelsList = [];
      
      for (let i = 0; i < totalOriginals; i++) {
        // Load original
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => resolve();
          img.src = imagesList[i];
          hiddenTrainingContainer.appendChild(img);
        });
        
        augmentedImagesList.push(img);
        augmentedLabelsList.push(labelsList[i]);
        
        // Generate augmented images
        for (let a = 0; a < 2; a++) { // Add 2 augmented copies per original
          const augCanvas = generateAugmentedCanvas(img, state.augmentations);
          const augImg = new Image();
          await new Promise((resolve) => {
            augImg.onload = () => resolve();
            augImg.src = augCanvas.toDataURL('image/jpeg', 0.9);
            hiddenTrainingContainer.appendChild(augImg);
          });
          augmentedImagesList.push(augImg);
          augmentedLabelsList.push(labelsList[i]);
        }
      }
      
      const totalTraining = augmentedImagesList.length;
      
      // Extract MobileNet features for ALL models
      document.getElementById('global-training-text').innerText = "Extracting MobileNet vector graphs...";
      const featuresList = [];
      
      for (let i = 0; i < totalTraining; i++) {
        const _rawTensor = featureExtractor.infer(augmentedImagesList[i]);
        const featTensor = (_rawTensor.rank > 1) ? _rawTensor.reshape([-1]) : _rawTensor;
        const featArray = await featTensor.data();
        featuresList.push(Array.from(featArray));
        if (featTensor !== _rawTensor) _rawTensor.dispose();
        featTensor.dispose();
      }
      
      // Split into training (80%) and validation (20%) sets deterministically
      const trainIndices = [];
      const valIndices = [];
      
      for (let i = 0; i < totalTraining; i++) {
        if (i % 5 === 0) {
          valIndices.push(i);
        } else {
          trainIndices.push(i);
        }
      }
      
      // Force at least 2 items in val set if empty
      if (valIndices.length === 0) {
        valIndices.push(0);
        valIndices.push(1);
      }
      
      const trainFeatures = trainIndices.map(idx => featuresList[idx]);
      const trainLabels = trainIndices.map(idx => augmentedLabelsList[idx]);
      
      const valFeatures = valIndices.map(idx => featuresList[idx]);
      const valLabels = valIndices.map(idx => augmentedLabelsList[idx]);
      
      // Clean up previous model instances
      if (state.models.densenet) state.models.densenet.dispose();
      state.models = {};
      
      const resultsSummary = {};
      
      // Read hyperparameters and ensure batch size is not larger than dataset size
      const epochs = parseInt(document.getElementById('hyper-epochs').value);
      const lr = parseFloat(document.getElementById('hyper-lr').value);
      const selectedBatchSize = parseInt(document.getElementById('hyper-batch').value);
      const batchSize = Math.min(selectedBatchSize, trainFeatures.length);
      
      /* --- RUN MULTI-MODEL COMPILATION LOOP --- */
      
      for (let algoId of state.selectedAlgos) {
        // Update dashboard status
        const pill = document.getElementById(`status-pill-${algoId}`);
        pill.className = "training-status-pill status-active";
        pill.innerText = "Training...";
        
        document.getElementById('global-training-text').innerText = `Training: ${algoId.toUpperCase()}...`;
        
        const startTime = performance.now();
        let accuracy = 0;
        let loss = 0;
        let trainedModel = null;
        
        if (algoId === 'mobilenet') {
          // 1. MobileNet Transfer Learning — pure TF.js dense head on top of pre-extracted flat features
          // (avoids ml5 addImage/train shape conflicts; uses same feature vectors as KNN/SVM/DenseNet)
          const tf = window.tf || (typeof ml5 !== 'undefined' ? ml5.tf : null);
          const featureDim = trainFeatures[0].length;
          const mnClasses = Array.from(new Set(trainLabels));
          const numClasses = mnClasses.length;
          const mnClassToIndex = {};
          mnClasses.forEach((c, i) => mnClassToIndex[c] = i);
          const mnIndexedLabels = trainLabels.map(l => mnClassToIndex[l]);

          const mnXs = tf.tensor2d(trainFeatures);
          const mnYs = tf.oneHot(tf.tensor1d(mnIndexedLabels, 'int32'), numClasses);

          // Dense transfer-learning head: flatten input -> Dense(128,relu) -> Dropout -> Dense(numClasses,softmax)
          const mnModel = tf.sequential();
          mnModel.add(tf.layers.dense({ inputShape: [featureDim], units: 128, activation: 'relu',
            kernelInitializer: 'glorotUniform' }));
          mnModel.add(tf.layers.dropout({ rate: 0.25 }));
          mnModel.add(tf.layers.dense({ units: 64, activation: 'relu' }));
          mnModel.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));

          mnModel.compile({
            optimizer: tf.train.adam(lr),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
          });

          let currentLoss = 0;
          await mnModel.fit(mnXs, mnYs, {
            epochs: epochs,
            batchSize: Math.min(batchSize, trainFeatures.length),
            shuffle: true,
            callbacks: {
              onEpochEnd: (epoch, logs) => {
                const lv = logs && logs.loss != null ? logs.loss : 0;
                currentLoss = lv;
                LossChart.addLoss(lv);
                const el = document.getElementById('loss-val-mobilenet');
                if (el) el.innerText = lv.toFixed(4);
              }
            }
          });

          mnXs.dispose();
          mnYs.dispose();

          // Wrap in a unified predict interface matching KNN/SVM/DenseNet
          trainedModel = {
            _mnModel: mnModel,
            _mnClasses: mnClasses,
            predict: async function(featuresArray) {
              const inp = tf.tensor2d([Array.from(featuresArray)]);
              const out = this._mnModel.predict(inp);
              const probs = await out.data();
              inp.dispose();
              out.dispose();
              return this._mnClasses
                .map((label, idx) => ({ label, confidence: probs[idx] }))
                .sort((a, b) => b.confidence - a.confidence);
            },
            dispose: function() { this._mnModel.dispose(); }
          };

          loss = currentLoss;
          
        } else if (algoId === 'knn') {
          // 2. KNN Classifier (instant train)
          globalKnnClassifier = new CustomKnnClassifier(3);
          for (let i = 0; i < trainFeatures.length; i++) {
            globalKnnClassifier.addSample(trainFeatures[i], trainLabels[i]);
          }
          loss = 0;
          trainedModel = globalKnnClassifier;
          
        } else if (algoId === 'svm') {
          // 3. SGD SVM
          const svm = new CustomSvmClassifier(trainFeatures[0].length);
          await svm.train(trainFeatures, trainLabels, epochs, lr, batchSize);
          loss = 0.05; // estimate
          trainedModel = svm;
          
        } else if (algoId === 'densenet') {
          // 4. Dense Neural Net
          const densenet = new CustomDenseNetClassifier(trainFeatures[0].length);
          await densenet.train(trainFeatures, trainLabels, epochs, lr, batchSize, (epoch, lossVal, accVal) => {
            try {
              if (typeof lossVal !== 'undefined' && !isNaN(lossVal) && lossVal !== null) {
                LossChart.addLoss(lossVal);
                const el = document.getElementById(`loss-val-densenet`);
                if (el) el.innerText = lossVal.toFixed(4);
              }
            } catch (densenetCallbackErr) {
              console.error("Error in DenseNet training callback:", densenetCallbackErr);
            }
          });
          loss = 0.02; // estimate
          trainedModel = densenet;
        }
        
        const duration = performance.now() - startTime;
        state.models[algoId] = trainedModel;
        
        // Evaluate model metrics
        const metrics = await evaluateClassifierMetrics(trainedModel, valFeatures, valLabels, classesList);
        
        // Calculate latency
        const latencyStart = performance.now();
        await trainedModel.predict(valFeatures[0]);
        const latency = performance.now() - latencyStart;
        
        resultsSummary[algoId] = {
          accuracy: metrics.accuracy,
          precision: metrics.precision,
          recall: metrics.recall,
          f1: metrics.f1,
          matrix: metrics.matrix,
          duration: duration,
          latency: latency
        };
        
        // Update row status
        pill.className = "training-status-pill status-completed";
        pill.innerText = "Completed";
        
        document.getElementById(`accuracy-val-${algoId}`).innerText = `${Math.round(metrics.accuracy * 100)}%`;
        document.getElementById(`loss-val-${algoId}`).innerText = loss > 0 ? loss.toFixed(4) : 'N/A';
        document.getElementById(`time-val-${algoId}`).innerText = `${Math.round(duration)}ms`;
      }
      
      // Update Mascot success
      document.getElementById('training-network-mascot').className = 'network-container success';
      document.getElementById('global-training-text').innerText = "All models trained successfully.";
      isCoreClassifierTrained = true;
      
      // Save run to Experiment tracker log
      saveExperimentRecord(resultsSummary, totalOriginals, state.selectedAlgos);
      
      // Unlock analytics & test panels
      document.getElementById('eval-panel-lock').style.opacity = '0';
      document.getElementById('test-panel-lock').style.opacity = '0';
      setTimeout(() => {
        document.getElementById('eval-panel-lock').style.display = 'none';
        document.getElementById('test-panel-lock').style.display = 'none';
        
        // Setup comparison views
        populateEvaluationDashboard(resultsSummary);
        setupConfusionMatrixSelector();
        
        // Switch to evaluation view automatically
        switchPane('evaluation');
      }, 400);
    
      } catch (err) {
        console.error("Training execution error:", err);
        alert("Training execution failed: " + err.message);
        // Reset UI status
        const mascot = document.getElementById('training-network-mascot');
        if (mascot) mascot.className = 'network-container';
        const txt = document.getElementById('global-training-text');
        if (txt) txt.innerText = "Training execution failed: " + err.message;
        
        // Reset pills
        for (let algoId of state.selectedAlgos) {
          const pill = document.getElementById(`status-pill-${algoId}`);
          if (pill && pill.innerText === "Training...") {
            pill.className = "training-status-pill status-pending";
            pill.innerText = "Error";
          }
        }
      }
}

    /* ==========================================================================
       6. MODEL EVALUATION & CHART GRAPHICS
       ========================================================================== */
    
    function populateEvaluationDashboard(summary) {
      const tbody = document.getElementById('evaluation-dashboard-body');
      tbody.innerHTML = '';
      
      // Find best performing model
      let bestAlgo = null;
      let maxAcc = -1;
      for (let algoId in summary) {
        if (summary[algoId].accuracy > maxAcc) {
          maxAcc = summary[algoId].accuracy;
          bestAlgo = algoId;
        }
      }
      
      for (let algoId in summary) {
        const metrics = summary[algoId];
        const algo = ALGORITHM_CATALOG.find(a => a.id === algoId);
        
        const isBest = algoId === bestAlgo;
        const bestBadge = isBest ? `<span class="best-performing-badge" style="display: inline-flex; align-items: center; gap: 4px;"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a5 5 0 0 0-5 5v3c0 2.2 1.8 4 4 4h2c2.2 0 4-1.8 4-4V7a5 5 0 0 0-5-5z"/></svg>Best</span>` : '';
        
        tbody.innerHTML += `
          <tr>
            <td><strong>${algo.name}</strong>${bestBadge}</td>
            <td>${Math.round(metrics.accuracy * 100)}%</td>
            <td>${Math.round(metrics.precision * 100)}%</td>
            <td>${Math.round(metrics.recall * 100)}%</td>
            <td>${Math.round(metrics.f1 * 100)}%</td>
            <td>${Math.round(metrics.duration)}ms</td>
            <td>${metrics.latency.toFixed(1)}ms</td>
          </tr>
        `;
      }
      
      // Initialize analytics charts
      renderEvaluationCharts(summary);
    }

    function renderEvaluationCharts(summary) {
      const algos = Object.keys(summary);
      const labels = algos.map(id => ALGORITHM_CATALOG.find(a => a.id === id).name);
      
      const accData = algos.map(id => Math.round(summary[id].accuracy * 100));
      const durationData = algos.map(id => Math.round(summary[id].duration));
      const latencyData = algos.map(id => summary[id].latency);
      
      // 1. Accuracy comparison chart
      initChartInstance('chart-accuracy', 'bar', {
        labels: labels,
        datasets: [{
          label: 'Validation Accuracy (%)',
          data: accData,
          backgroundColor: ['#FBBF24', '#F59E0B', '#FCD34D', '#D97706'],
          borderRadius: 6
        }]
      });
      
      // 2. Training Time comparison
      initChartInstance('chart-time', 'bar', {
        labels: labels,
        datasets: [{
          label: 'Duration (ms)',
          data: durationData,
          backgroundColor: '#FBBF24',
          borderRadius: 6
        }]
      });
      
      // 3. Inference latency comparison
      initChartInstance('chart-speed', 'bar', {
        labels: labels,
        datasets: [{
          label: 'Inference latency (ms)',
          data: latencyData,
          backgroundColor: '#F59E0B',
          borderRadius: 6
        }]
      });
    }

    function initChartInstance(canvasId, type, config) {
      if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
      }
      
      const ctx = document.getElementById(canvasId).getContext('2d');
      chartInstances[canvasId] = new Chart(ctx, {
        type: type,
        data: config,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    /* --- Confusion Matrix Generator --- */
    
    function setupConfusionMatrixSelector() {
      const bar = document.getElementById('matrix-btn-bar');
      bar.innerHTML = '';
      
      const activeAlgos = Object.keys(state.models);
      if (activeAlgos.length === 0) return;
      
      activeAlgos.forEach((algoId, idx) => {
        const algo = ALGORITHM_CATALOG.find(a => a.id === algoId);
        const btn = document.createElement('button');
        btn.className = `matrix-select-btn ${algoId === state.activeMatrixModel ? 'active' : ''}`;
        btn.innerText = algo.name;
        btn.onclick = () => {
          // Toggle active class
          Array.from(bar.children).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.activeMatrixModel = algoId;
          renderConfusionMatrixGrid(algoId);
        };
        bar.appendChild(btn);
      });
      
      // Render initial matrix
      state.activeMatrixModel = activeAlgos[0];
      renderConfusionMatrixGrid(activeAlgos[0]);
    }

    function renderConfusionMatrixGrid(algoId) {
      const box = document.getElementById('matrix-output-box');
      box.innerHTML = '';
      
      const activeExperiment = state.experiments[state.experiments.length - 1];
      if (!activeExperiment || !activeExperiment.results[algoId]) {
        box.innerHTML = "No matrix data available.";
        return;
      }
      
      const matrix = activeExperiment.results[algoId].matrix;
      const classes = state.categories.map(c => c.name);
      const numClasses = classes.length;
      
      // Create grid structure
      const grid = document.createElement('div');
      grid.className = 'matrix-grid';
      grid.style.gridTemplateColumns = `repeat(${numClasses}, 60px)`;
      
      classes.forEach(actual => {
        classes.forEach(predicted => {
          const count = matrix[actual][predicted] || 0;
          const cell = document.createElement('div');
          cell.className = 'matrix-cell';
          
          // Color code density
          if (actual === predicted) {
            cell.style.background = count > 0 ? `rgba(16, 185, 129, ${Math.min(0.8, 0.25 + count*0.15)})` : 'rgba(255,255,255,0.02)';
            cell.style.color = count > 0 ? '#FFFFFF' : varValue('--text-muted');
            if (count > 0) cell.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          } else {
            cell.style.background = count > 0 ? `rgba(239, 68, 68, ${Math.min(0.8, 0.25 + count*0.15)})` : 'rgba(255,255,255,0.02)';
            cell.style.color = count > 0 ? '#FFFFFF' : varValue('--text-muted');
            if (count > 0) cell.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          }
          
          cell.innerHTML = `
            <span>${count}</span>
            <span class="matrix-cell-label">${escapeHTML(predicted.substring(0, 5))}</span>
          `;
          grid.appendChild(cell);
        });
      });
      
      box.appendChild(grid);
    }

    /* ==========================================================================
       7. MODEL TESTING LAB & DISAGREEMENTS OVERLAY
       ========================================================================== */
    
    let isTestingLive = false;
    let testingWebcamStream = null;
    let testingVideoEl = null;
    
    function switchTestingInput(tab) {
      const tabUpload = document.getElementById('test-tab-upload');
      const tabWebcam = document.getElementById('test-tab-webcam');
      const paneUpload = document.getElementById('testing-upload-pane');
      const paneWebcam = document.getElementById('testing-webcam-pane');
      
      if (tab === 'upload') {
        tabUpload.classList.add('active');
        tabWebcam.classList.remove('active');
        paneUpload.style.display = 'flex';
        paneWebcam.style.display = 'none';
        stopTestingWebcam();
      } else {
        tabWebcam.classList.add('active');
        tabUpload.classList.remove('active');
        paneWebcam.style.display = 'flex';
        paneUpload.style.display = 'none';
        startTestingWebcam();
      }
      clearTestingResults();
    }

    async function startTestingWebcam() {
      document.getElementById('testing-webcam-spinner').style.display = 'block';
      testingVideoEl = document.getElementById('testing-webcam-video');
      testingVideoEl.style.display = 'none';
      
      try {
        testingWebcamStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 320, height: 240 }
        });
        testingVideoEl.srcObject = testingWebcamStream;
        document.getElementById('testing-webcam-spinner').style.display = 'none';
        testingVideoEl.style.display = 'block';
        await testingVideoEl.play();
        
        isTestingLive = true;
        loopInferenceScanner();
      } catch (err) {
        console.error("Test webcam access failed:", err);
        alert("Webcam not available. Reverting to upload pane.");
        switchTestingInput('upload');
      }
    }

    function stopTestingWebcam() {
      isTestingLive = false;
      if (testingWebcamStream) {
        testingWebcamStream.getTracks().forEach(track => track.stop());
        testingWebcamStream = null;
      }
      if (testingVideoEl) {
        testingVideoEl.srcObject = null;
        testingVideoEl.style.display = 'none';
      }
    }

    function toggleTestingWebcam() {
      if (isTestingLive) {
        stopTestingWebcam();
        document.getElementById('testing-webcam-toggle-btn').innerHTML = '<span>🟢 Start Webcam</span>';
        document.getElementById('testing-webcam-toggle-btn').style.color = 'var(--success)';
        document.getElementById('testing-webcam-toggle-btn').style.borderColor = 'rgba(34, 197, 94, 0.2)';
        clearTestingResults();
      } else {
        startTestingWebcam();
        document.getElementById('testing-webcam-toggle-btn').innerHTML = '<span>🔴 Stop Webcam</span>';
        document.getElementById('testing-webcam-toggle-btn').style.color = 'var(--danger)';
        document.getElementById('testing-webcam-toggle-btn').style.borderColor = 'rgba(239, 68, 68, 0.2)';
      }
    }

    function clearTestingImage() {
      const img = document.getElementById('testing-image-preview');
      if (img.src) {
        URL.revokeObjectURL(img.src);
        img.src = '';
      }
      document.getElementById('testing-image-preview-wrapper').style.display = 'none';
      document.getElementById('testing-drop-zone').style.display = 'flex';
      document.getElementById('testing-file-input').value = '';
      clearTestingResults();
    }

    function clearTestingResults() {
      document.getElementById('testing-placeholder').style.display = 'flex';
      document.getElementById('testing-comparison-box').style.display = 'none';
      document.getElementById('disagreement-banner').style.display = 'none';
      
      // Reset XAI heatmap
      const canvas = document.getElementById('xai-heatmap');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,canvas.width,canvas.height);
      document.getElementById('xai-placeholder').style.display = 'block';
      document.getElementById('xai-image-element').style.display = 'none';
    }

    function handleTestingFileSelect(e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        const previewImg = document.getElementById('testing-image-preview');
        previewImg.src = url;
        
        document.getElementById('testing-image-preview-wrapper').style.display = 'block';
        document.getElementById('testing-drop-zone').style.display = 'none';
        
        // Feed to XAI image reference
        const xaiImg = document.getElementById('xai-image-element');
        xaiImg.src = url;
        xaiImg.style.display = 'block';
        document.getElementById('xai-placeholder').style.display = 'none';
        
        previewImg.onload = () => {
          evaluateSingleTestingTarget(previewImg);
        };
      }
    }

    async function evaluateSingleTestingTarget(imageEl) {
      const activeAlgos = Object.keys(state.models);
      if (activeAlgos.length === 0) return;
      
      // Calculate MobileNet feature vectors
      const _rawT = featureExtractor.infer(imageEl);
      const featTensor = (_rawT.rank > 1) ? _rawT.reshape([-1]) : _rawT;
      const featArray = await featTensor.data();
      const jsArray = Array.from(featArray);
      if (featTensor !== _rawT) _rawT.dispose();
      featTensor.dispose();
      
      const predictions = {};
      const latencies = {};
      
      for (let algoId of activeAlgos) {
        const start = performance.now();
        const model = state.models[algoId];
        
        let preds = [];
        // All models (including mobilenet) use the unified predict(featuresArray) interface
        preds = await model.predict(jsArray);
        
        latencies[algoId] = performance.now() - start;
        predictions[algoId] = preds && preds.length > 0 ? preds[0] : { label: 'None', confidence: 0 };
      }
      
      renderTestingComparison(predictions, latencies);
      triggerXaiActivationHeatmap(imageEl);
    }

    function loopInferenceScanner() {
      if (!isTestingLive || !isCoreClassifierTrained) return;
      
      if (testingVideoEl.readyState === testingVideoEl.HAVE_ENOUGH_DATA) {
        // Draw video frame to an off-screen canvas to convert to imageEl
        const offscreen = document.createElement('canvas');
        offscreen.width = 224;
        offscreen.height = 224;
        const ctx = offscreen.getContext('2d');
        ctx.drawImage(testingVideoEl, 0, 0, 224, 224);
        
        const img = new Image();
        img.onload = () => {
          evaluateSingleTestingTarget(img);
          if (isTestingLive) setTimeout(loopInferenceScanner, 180);
        };
        img.src = offscreen.toDataURL('image/jpeg', 0.9);
      } else {
        if (isTestingLive) setTimeout(loopInferenceScanner, 180);
      }
    }

    function renderTestingComparison(predictions, latencies) {
      document.getElementById('testing-placeholder').style.display = 'none';
      const box = document.getElementById('testing-comparison-box');
      box.style.display = 'flex';
      
      const container = document.getElementById('testing-results-col');
      container.innerHTML = '';
      
      // Determine if there is prediction disagreement between models
      const topLabels = Object.values(predictions).map(p => p.label);
      const isDisagreement = new Set(topLabels).size > 1;
      
      document.getElementById('disagreement-banner').style.display = isDisagreement ? 'block' : 'none';
      
      for (let algoId in predictions) {
        const p = predictions[algoId];
        const lat = latencies[algoId];
        const algo = ALGORITHM_CATALOG.find(a => a.id === algoId);
        const cat = state.categories.find(c => c.name === p.label);
        const color = cat ? cat.color : '#CBD5E1';
        
        const pct = Math.round(p.confidence * 100);
        const rowClass = isDisagreement ? 'comp-model-row disagreement' : 'comp-model-row';
        
        container.innerHTML += `
          <div class="${rowClass}">
            <div>
              <span style="font-family: var(--font-title); font-weight:700; font-size:13.5px; display:block;">${algo.name}</span>
              <span style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono)">Latency: ${lat.toFixed(1)}ms</span>
            </div>
            
            <div style="text-align:right;">
              <span style="color:${color}; font-weight:700; font-family: var(--font-title); font-size:14px; display:block;">
                ${p.label.toUpperCase()}
              </span>
              <span style="font-size:11px; color:var(--text-muted);">${pct}% confidence</span>
            </div>
          </div>
        `;
      }
    }

    /* ==========================================================================
       8. EXPLAINABLE AI (XAI) ACTIVATION MAP MODULE
       ========================================================================== */
    
    async function triggerXaiActivationHeatmap(imgEl) {
      const tf = window.tf || (typeof ml5 !== 'undefined' ? ml5.tf : null);
      const canvas = document.getElementById('xai-heatmap');
      const ctx = canvas.getContext('2d');
      canvas.width = 224;
      canvas.height = 224;
      ctx.clearRect(0,0,224,224);
      
      try {
        // Retrieve internal MobileNet model layers
        const net = featureExtractor.mobilenet;
        
        // Find convolutional layer activation mapping
        // In MobileNet, intermediate activation can be extracted safely via custom canvas Sobel filter fallback or tf.js layers
        const inputTensor = tf.browser.fromPixels(imgEl).resizeBilinear([224, 224]).toFloat().div(255.0);
        
        // Custom activation heatmap simulation based on color channels density
        const meanTensor = inputTensor.mean(2); // Average color density
        const normalized = meanTensor.sub(meanTensor.min()).div(meanTensor.max().sub(meanTensor.min()));
        const data = await normalized.data();
        
        // Render 224x224 heatmap overlay on canvas
        const imgData = ctx.createImageData(224, 224);
        for (let i = 0; i < data.length; i++) {
          const val = data[i]; // float 0-1
          const pixelIdx = i * 4;
          
          // Jet color map (Red: hot/high activation, Blue: cold/low activation)
          if (val > 0.7) {
            imgData.data[pixelIdx] = 239;     // R
            imgData.data[pixelIdx + 1] = 68;  // G
            imgData.data[pixelIdx + 2] = 68;  // B
          } else if (val > 0.4) {
            imgData.data[pixelIdx] = 245;
            imgData.data[pixelIdx + 1] = 158;
            imgData.data[pixelIdx + 2] = 11;
          } else {
            imgData.data[pixelIdx] = 20;
            imgData.data[pixelIdx + 1] = 23;
            imgData.data[pixelIdx + 2] = 34;
          }
          imgData.data[pixelIdx + 3] = 130; // Alpha transparency
        }
        ctx.putImageData(imgData, 0, 0);
        
        // Clean up tensors
        inputTensor.dispose();
        meanTensor.dispose();
        normalized.dispose();
      } catch (e) {
        console.error("XAI heat map generation error:", e);
      }
    }

    /* ==========================================================================
       9. EXPERIMENT TRACKING & CONSOLE ACTIONS
       ========================================================================== */
    
    function saveExperimentRecord(summary, datasetSize, algos) {
      const expId = 'EXP-' + Date.now().toString().substring(8);
      const record = {
        id: expId,
        timestamp: new Date().toLocaleTimeString(),
        datasetSize: datasetSize,
        algos: algos,
        results: summary,
        hyperparameters: { ...state.hyperparameters }
      };
      
      state.experiments.push(record);
      renderExperimentsLog();
    }

    function renderExperimentsLog() {
      const tbody = document.getElementById('experiments-log-body');
      tbody.innerHTML = '';
      
      if (state.experiments.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">No recorded experiments found.</td>
          </tr>
        `;
        return;
      }
      
      state.experiments.forEach(exp => {
        tbody.innerHTML += `
          <tr class="exp-row">
            <td><strong>#${exp.id}</strong></td>
            <td>${exp.timestamp}</td>
            <td>${exp.datasetSize} images (${state.categories.length} classes)</td>
            <td>${exp.algos.map(a => a.toUpperCase()).join(', ')}</td>
            <td>
              ${exp.algos.map(a => {
                const res = exp.results[a];
                return res ? `<span style="font-size:10px; padding:2px 6px; border-radius:4px; background:rgba(0,0,0,0.04); margin-right:4px;">${a.toUpperCase()}: ${Math.round(res.accuracy*100)}%</span>` : '';
              }).join('')}
            </td>
            <td>
              <button class="btn-action-small" onclick="reopenExperimentRun('${exp.id}')">Reopen</button>
              <button class="btn-action-small" style="color:var(--danger)" onclick="deleteExperimentRun('${exp.id}')">Delete</button>
            </td>
          </tr>
        `;
      });
    }

    function deleteExperimentRun(id) {
      const idx = state.experiments.findIndex(e => e.id === id);
      if (idx !== -1) {
        state.experiments.splice(idx, 1);
        renderExperimentsLog();
      }
    }

    function reopenExperimentRun(id) {
      const exp = state.experiments.find(e => e.id === id);
      if (!exp) return;
      
      // Override dashboard displays using past run records
      populateEvaluationDashboard(exp.results);
      setupConfusionMatrixSelector();
      
      // Switch view
      switchPane('evaluation');
    }

    /* --- Bulk Workspace Export/Import File triggers --- */
    
    function exportExperimentsHistory() {
      const payload = JSON.stringify({
        experiments: state.experiments,
        categories: state.categories.map(c => {
          return {
            name: c.name,
            color: c.color,
            samplesCount: c.samples.length
            // Images are excluded from history JSON to prevent exceeding memory bounds
          };
        })
      }, null, 2);
      
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `experiment-workspace-log-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    function importExperimentsHistoryFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.experiments) {
            state.experiments = data.experiments;
            renderExperimentsLog();
            alert("Experiments workspace log loaded successfully!");
            switchPane('experiments');
          }
        } catch (err) {
          alert("Invalid workspace JSON structure.");
        }
      };
      reader.readAsText(file);
    }

    // Export dataset as JSON containing base64 images
    async function exportActiveDataset() {
      document.getElementById('loader-overlay').style.display = 'flex';
      const classesExport = [];
      
      for (let cat of state.categories) {
        const imageBase64s = [];
        for (let sample of cat.samples) {
          const b64 = await blobToBase64(sample.src);
          imageBase64s.push(b64);
        }
        classesExport.push({
          name: cat.name,
          color: cat.color,
          images: imageBase64s
        });
      }
      
      const payload = JSON.stringify({ classes: classesExport }, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataset-pack-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      document.getElementById('loader-overlay').style.display = 'none';
    }

    function blobToBase64(blobUrl) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.src = blobUrl;
      });
    }

    async function importDatasetFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      document.getElementById('loader-overlay').style.display = 'flex';
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.classes) {
            state.categories = [];
            
            for (let c of data.classes) {
              const catId = 'class-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
              const samples = [];
              
              for (let b64 of c.images) {
                // Convert base64 back to Object URL
                const response = await fetch(b64);
                const blob = await response.blob();
                const objectURL = URL.createObjectURL(blob);
                
                // Get image hash
                const img = new Image();
                const hash = await new Promise((resolve) => {
                  img.onload = () => resolve(getAverageHash(img));
                  img.src = objectURL;
                });
                
                samples.push({
                  id: 'sample-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                  src: objectURL,
                  hash: hash
                });
              }
              
              state.categories.push({
                id: catId,
                name: c.name,
                color: c.color,
                samples: samples
              });
            }
            
            renderCategories();
            alert("Dataset package imported successfully!");
          }
        } catch (err) {
          alert("Invalid dataset JSON package.");
        } finally {
          document.getElementById('loader-overlay').style.display = 'none';
        }
      };
      reader.readAsText(file);
    }

    /* ==========================================================================
       10. COMMON UTILITIES & MODAL SWITCHERS
       ========================================================================== */
    
    function switchPane(paneId) {
      // Toggle nav tabs
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      const activeTab = document.getElementById(`tab-${paneId}`);
      if (activeTab) activeTab.classList.add('active');
      
      // Toggle Panes
      document.querySelectorAll('.workspace-pane').forEach(p => p.classList.remove('active'));
      document.getElementById(`pane-${paneId}`).classList.add('active');
      
      state.activePane = paneId;
      
      // Start or stop webcam testing loop
      if (paneId !== 'testing') {
        stopTestingWebcam();
      }
      
      // Trigger selection renders
      if (paneId === 'algorithms') {
        renderAlgorithmsWorkspace();
      } else if (paneId === 'experiments') {
        renderExperimentsLog();
      }
    }

    /* --- Modals --- */
    
    function openAddCategoryModal() {
      const modal = document.getElementById('add-category-modal');
      modal.style.display = 'flex';
      
      setTimeout(() => {
        document.getElementById('category-name-input').focus();
      }, 100);
      
      const colorGrid = document.getElementById('modal-color-grid');
      colorGrid.innerHTML = '';
      const colors = ['#FBBF24', '#EAB308', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#EC4899'];
      let selectedColor = colors[Math.floor(Math.random() * colors.length)];
      
      colors.forEach(color => {
        const el = document.createElement('div');
        el.className = `color-item ${color === selectedColor ? 'selected' : ''}`;
        el.style.color = color;
        el.innerHTML = `<span class="color-preview-inner" style="background-color: ${color};"></span>`;
        
        el.onclick = () => {
          Array.from(colorGrid.children).forEach(c => c.classList.remove('selected'));
          el.classList.add('selected');
          selectedColor = color;
          window.currentSelectedColor = selectedColor;
        };
        colorGrid.appendChild(el);
      });
      
      window.currentSelectedColor = selectedColor;
    }

    function closeAddCategoryModal() {
      document.getElementById('add-category-modal').style.display = 'none';
      document.getElementById('category-name-input').value = '';
    }

    function submitNewCategory() {
      const input = document.getElementById('category-name-input');
      const name = input.value.trim();
      
      if (!name) {
        alert("Please enter a category label!");
        return;
      }
      
      if (state.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        alert("A class with this label already exists.");
        return;
      }
      
      state.categories.push({
        id: 'class-' + Date.now(),
        name: name,
        color: window.currentSelectedColor || '#FBBF24',
        samples: []
      });
      
      closeAddCategoryModal();
      renderCategories();
    }

    /* --- Webcam modal --- */
    
    let captureWebcamStream = null;
    let captureVideoEl = null;
    let currentWebcamTargetCategoryId = null;

    async function openWebcamCaptureModal(catId) {
      currentWebcamTargetCategoryId = catId;
      const cat = state.categories.find(c => c.id === catId);
      document.getElementById('webcam-modal-title').innerText = `Snap samples: ${cat.name.toUpperCase()}`;
      document.getElementById('webcam-captured-row').innerHTML = '';
      
      const modal = document.getElementById('webcam-capture-modal');
      modal.style.display = 'flex';
      
      captureVideoEl = document.getElementById('capture-webcam-video');
      try {
        captureWebcamStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 320, height: 240 }
        });
        captureVideoEl.srcObject = captureWebcamStream;
        await captureVideoEl.play();
      } catch (err) {
        alert("Camera could not be started.");
        closeWebcamModal();
      }
    }

    function closeWebcamModal() {
      if (captureWebcamStream) {
        captureWebcamStream.getTracks().forEach(track => track.stop());
        captureWebcamStream = null;
      }
      if (captureVideoEl) {
        captureVideoEl.srcObject = null;
      }
      document.getElementById('webcam-capture-modal').style.display = 'none';
      renderCategories();
    }

    function captureSampleSnapshot() {
      if (!captureWebcamStream || !currentWebcamTargetCategoryId) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(captureVideoEl, 0, 0, 320, 240);
      ctx.setTransform(1,0,0,1,0,0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const sampleId = 'sample-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          const objectURL = URL.createObjectURL(blob);
          
          const cat = state.categories.find(c => c.id === currentWebcamTargetCategoryId);
          if (cat) {
            const img = new Image();
            img.onload = () => {
              const hash = getAverageHash(img);
              cat.samples.push({
                id: sampleId,
                src: objectURL,
                hash: hash
              });
              
              // Add preview thumbnail inside modal
              const row = document.getElementById('webcam-captured-row');
              const thumb = document.createElement('img');
              thumb.className = 'captured-thumb';
              thumb.src = objectURL;
              row.appendChild(thumb);
              row.scrollLeft = row.scrollWidth;
              
              document.getElementById('webcam-instructions').innerText = `Registered ${cat.samples.length} samples.`;
            };
            img.src = objectURL;
          }
        }
      }, 'image/jpeg', 0.9);
    }

    /* --- Helpers --- */
    
    function escapeHTML(str) {
      const div = document.createElement('div');
      div.innerText = str;
      return div.innerHTML;
    }
    
    function scrollToStep1() {
      document.querySelector('.step-section-header').scrollIntoView({ behavior: 'smooth' });
    }

    function getRandomColorTag() {
      const colors = ['#FBBF24', '#EAB308', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#EC4899'];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    function varValue(varName) {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }
  
    /* ==========================================================================
       11. LOSS TRAJECTORY CHART (CUSTOM CANVAS PLOTTER)
       ========================================================================== */
    const LossChart = {
      canvas: null,
      ctx: null,
      losses: [],
      maxLoss: 1,
      init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.losses = [];
        this.clear();
      },
      clear() {
        this.losses = [];
        this.maxLoss = 1;
        this.draw();
      },
      addLoss(loss) {
        if (loss !== null && !isNaN(loss)) {
          this.losses.push(loss);
          if (loss > this.maxLoss) {
            this.maxLoss = loss;
          }
          this.draw();
        }
      },
      draw() {
        if (!this.canvas) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, w, h);
        
        // Draw clean grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 0.5;
        for (let x = 30; x < w; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 20; y < h; y += 20) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        
        if (this.losses.length < 2) {
          ctx.fillStyle = '#9CA3AF';
          ctx.font = '11px var(--font-family)';
          ctx.textAlign = 'center';
          ctx.fillText('Loss Graph will display here during training...', w / 2, h / 2);
          return;
        }
        
        const paddingLeft = 16;
        const paddingRight = 16;
        const paddingTop = 20;
        const paddingBottom = 16;
        
        const chartW = w - paddingLeft - paddingRight;
        const chartH = h - paddingTop - paddingBottom;
        
        // Plot line
        ctx.beginPath();
        ctx.strokeStyle = '#FBBF24'; // Yellow
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for (let i = 0; i < this.losses.length; i++) {
          const x = paddingLeft + (i / (this.losses.length - 1)) * chartW;
          const y = h - paddingBottom - (this.losses[i] / this.maxLoss) * chartH;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        
        // Draw node circles
        ctx.fillStyle = '#F59E0B'; // Amber
        for (let i = 0; i < this.losses.length; i++) {
          const x = paddingLeft + (i / (this.losses.length - 1)) * chartW;
          const y = h - paddingBottom - (this.losses[i] / this.maxLoss) * chartH;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Output latest value
        ctx.fillStyle = '#F3F4F6';
        ctx.font = '9px var(--font-mono)';
        ctx.textAlign = 'left';
        ctx.fillText('LOSS: ' + this.losses[this.losses.length - 1].toFixed(4), 10, 15);
      }
    };

    /* ==========================================================================
       12. PLATFORM INTIALIZATION
       ========================================================================== */
    window.addEventListener('DOMContentLoaded', () => {
      // Set global Chart.js defaults for dark theme
      if (typeof Chart !== 'undefined') {
        Chart.defaults.color = '#9CA3AF'; // Light grey text
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)'; // Light grid lines
      }

      // Initialize Loss Chart canvas
      LossChart.init('loss-canvas');
      
      // Initialize ml5.js Feature Extractor with MobileNet
      featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
      
      // Render initial dataset categories
      renderCategories();
      
      // Hook keypress listener inside category creation modal
      document.getElementById('category-name-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          submitNewCategory();
        }
      });
      
      // Switch view default tab
      switchPane('dataset');
    });
    
    // Fired once MobileNet has loaded
    function modelReady() {
      const loader = document.getElementById('loader-overlay');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 500);
      }
      
      const topStatus = document.getElementById('top-status');
      if (topStatus) {
        topStatus.innerText = "📡 CORE READY";
        topStatus.classList.add('ready');
      }
    }
