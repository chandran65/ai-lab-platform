/* --- KAGGLE ARENA V2 DYNAMIC PLAYGROUND ENGINE --- */

// 1. Procedural Competition Templates (15 Industries)
const INDUSTRY_TEMPLATES = [
  {
    category: "Healthcare",
    challenges: [
      { title: "Cardiovascular Risk Predictor", desc: "Evaluate diagnostic biometrics (blood pressure, cholesterol, age) to classify coronary risk levels.", task: "Classification", target: "RiskLevel", features: ["Age", "Cholesterol", "SystolicBP", "Smoker", "RiskLevel"] },
      { title: "Diabetes Progression Regressor", desc: "Model diabetic patient insulin markers to forecast progression timelines.", task: "Regression", target: "Progression", features: ["BMI", "Age", "Insulin", "HbA1c", "Progression"] },
      { title: "Cancer Cell Anomaly Detection", desc: "Classify cell nuclei features to identify malignant breast tissue masses.", task: "Classification", target: "Diagnosis", features: ["MeanRadius", "Texture", "Perimeter", "Area", "Diagnosis"] }
    ]
  },
  {
    category: "Finance",
    challenges: [
      { title: "Credit Card Fraud Classifier", desc: "Analyze transaction behaviors (location, amounts, times) to flag fraudulent activities.", task: "Classification", target: "IsFraud", features: ["Amount", "LocationHash", "TimeHour", "CardType", "IsFraud"] },
      { title: "Real Estate Value Predictor", desc: "Determine residential market valuations using square footage, location index, and age.", task: "Regression", target: "SalePrice", features: ["LotArea", "OverallQual", "GrLivArea", "YearBuilt", "SalePrice"] },
      { title: "Corporate Loan Default Risk", desc: "Forecast credit default likelihoods based on debt-to-income and employment factors.", task: "Classification", target: "Defaulted", features: ["Income", "DTI", "CreditScore", "YearsEmployed", "Defaulted"] }
    ]
  },
  {
    category: "Agriculture",
    challenges: [
      { title: "Crop Yield Optimization Forecast", desc: "Model weather parameters (rainfall, soil temp) to predict seasonal crop volumes.", task: "Regression", target: "YieldTons", features: ["Rainfall", "SoilPh", "AvgTemp", "FertilizerKg", "YieldTons"] },
      { title: "Crop Leaf Disease Detection", desc: "Identify bacterial leaf spots from plant leaf metrics and RGB profiles.", task: "Classification", target: "Diseased", features: ["RGBMean", "LeafArea", "Humidity", "SolarRadiation", "Diseased"] }
    ]
  },
  {
    category: "Retail",
    challenges: [
      { title: "Store Sales Volume Forecaster", desc: "Predict daily checkout values depending on promotions and seasonal indexes.", task: "Regression", target: "DailySales", features: ["IsPromo", "HolidayIndex", "FootTraffic", "CompetitorDistance", "DailySales"] }
    ]
  },
  {
    category: "Cyber Security",
    challenges: [
      { title: "DDoS Attack Vector Detection", desc: "Identify anomalous packet frequency spikes to classify server intrusions.", task: "Classification", target: "Intrusion", features: ["PacketRate", "BytesPerSec", "UniqueIPs", "ProtocolType", "Intrusion"] }
    ]
  }
];

// Global Game State V2
let arenaState = {
  activeStep: 1,
  selectionMode: 'challenges',
  currentComp: null,       // Loaded procedurally
  cleaningCompleted: false,
  engineeringCompleted: false,
  selectedAlgorithm: 'random_forest',
  pipelineSteps: ['impute', 'encode', 'scale'], // Active feature pipeline steps
  trainingRunning: false,
  trainingPaused: false,
  trainingCompleted: false,
  epochsPassed: 0,
  maxEpochs: 80,
  learningRate: 0.01,
  lossHistory: [],
  valLossHistory: [],
  score: 0.0,
  leaderboardBots: [],
  battleTimer: 2700,      // 45 minutes
  battleInterval: null,
  xp: 1250,
  attempts: 0,
  bestScore: 0
};

// 2. Procedural Dataset Generator Engine
function generateProceduralDataset(compTemplate) {
  const rowCount = 200 + Math.floor(Math.random() * 300); // 200-500 rows
  const noiseLevel = 0.05 + Math.random() * 0.15; // 5% - 20% noise
  const features = compTemplate.features;
  const target = compTemplate.target;
  
  // Calculate null columns (e.g. 1 or 2 columns will have missing entries)
  const nullColumns = {};
  features.forEach(col => {
    if (col !== target && Math.random() > 0.6) {
      nullColumns[col] = Math.floor(10 + Math.random() * 20); // 10% - 30% null
    }
  });

  // Generate synthetic rows
  const rows = [];
  for (let i = 0; i < 6; i++) { // Generate 6 mock preview rows
    const row = [];
    features.forEach(col => {
      if (col === target) {
        row.push(compTemplate.task === "Classification" ? (Math.random() > 0.5 ? 1 : 0) : Math.round(50000 + Math.random() * 150000));
      } else if (nullColumns[col] && Math.random() * 100 < nullColumns[col]) {
        row.push("NaN"); // Mock missing cell
      } else {
        row.push(Math.round(20 + Math.random() * 80));
      }
    });
    rows.push(row);
  }

  // Pre-calculate synthetic statistics for explorer
  const stats = {};
  features.forEach(col => {
    stats[col] = {
      mean: col === target && compTemplate.task === "Classification" ? "N/A" : (50 + Math.round(Math.random() * 1000)).toLocaleString(),
      median: col === target && compTemplate.task === "Classification" ? "N/A" : (50 + Math.round(Math.random() * 900)).toLocaleString(),
      nulls: nullColumns[col] ? `${nullColumns[col]}%` : "0%",
      unique: rowCount,
      corr: col === target ? "1.00" : (Math.random() > 0.5 ? "+" : "-") + (0.2 + Math.random() * 0.7).toFixed(2)
    };
  });

  return {
    title: compTemplate.title,
    desc: compTemplate.desc,
    task: compTemplate.task,
    target: target,
    headers: features,
    rows: rows,
    rowCount: rowCount,
    nullColumns: nullColumns,
    stats: stats,
    noiseLevel: noiseLevel
  };
}

// 3. Document Loader Initializations
document.addEventListener("DOMContentLoaded", () => {
  renderProceduralChallenges();
  loadCareerProgression();
  
  // CSV Input handlers
  const fileInput = document.getElementById('csv-file-input');
  const dropzone = document.getElementById('csv-dropzone');
  if (dropzone && fileInput) {
    dropzone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => handleCSVUpload(e.target.files[0]);
    
    // Drag-over styling
    dropzone.ondragover = (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--primary)'; };
    dropzone.ondragleave = () => { dropzone.style.borderColor = 'var(--border-color)'; };
    dropzone.ondrop = (e) => {
      e.preventDefault();
      handleCSVUpload(e.dataTransfer.files[0]);
    };
  }

  // Custom step stepper overrides
  document.getElementById('steps-sidebar').addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li || li.classList.contains('locked')) return;
    const targetStep = parseInt(li.getAttribute('data-step'));
    switchToStepPane(targetStep);
  });
});

// Render procedural challenge cards
function renderProceduralChallenges() {
  const container = document.getElementById('competitions-list');
  if (!container) return;
  container.innerHTML = "";

  let count = 0;
  INDUSTRY_TEMPLATES.forEach(industry => {
    industry.challenges.forEach(challenge => {
      if (count >= 4) return; // Display max 4 challenge cards
      count++;
      
      const difficulty = count % 2 === 0 ? "Moderate" : "Easy";
      const badgeClass = difficulty === "Easy" ? "easy" : "moderate";
      
      const card = document.createElement('div');
      card.className = `competition-card card ${count === 1 ? 'selected' : ''}`;
      card.setAttribute('onclick', `selectProceduralCompetition('${industry.category}', '${challenge.title}')`);
      card.innerHTML = `
        <span class="difficulty-badge ${badgeClass}">${difficulty}</span>
        <h3>${challenge.title}</h3>
        <p>${challenge.desc}</p>
        <div class="comp-specs">
          <span>📊 ${challenge.task}</span>
          <span>💼 ${industry.category}</span>
        </div>
      `;
      container.appendChild(card);

      // Select first competition by default
      if (count === 1) {
        selectProceduralCompetition(industry.category, challenge.title);
      }
    });
  });
}

// Select procedural challenge
function selectProceduralCompetition(category, title) {
  // Toggle selection highlight
  document.querySelectorAll('.competition-card').forEach(card => {
    if (card.querySelector('h3').innerText === title) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  const categoryObj = INDUSTRY_TEMPLATES.find(c => c.category === category);
  const challenge = categoryObj.challenges.find(ch => ch.title === title);

  // Generate procedural dataset parameters
  arenaState.currentComp = generateProceduralDataset(challenge);

  // Sync details to HTML elements
  document.getElementById('details-title').innerText = `${category}: ${challenge.title}`;
  document.getElementById('details-desc').innerText = challenge.desc;
  document.getElementById('comp-metric-text').innerText = challenge.task === "Classification" ? "Mean Accuracy (F1-score)" : "Mean Squared Error (RMSE)";
  document.getElementById('comp-rec-algo').innerText = challenge.task === "Classification" ? "Random Forest, XGBoost" : "Linear Regression, Random Forest";

  // Re-load statistics summary in Explorer (Step 2)
  renderStep2Explorer();
  
  // Re-build cleaning strategy dynamic inputs (Step 3)
  buildCleaningPanelInputs();
}

// Switch modes (Challenges Board vs custom Importer)
function switchSelectionMode(mode) {
  arenaState.selectionMode = mode;
  document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.selection-view').forEach(view => view.style.display = 'none');

  if (mode === 'challenges') {
    document.querySelectorAll('.mode-tab')[0].classList.add('active');
    document.getElementById('view-challenges').style.display = 'block';
  } else if (mode === 'import') {
    document.querySelectorAll('.mode-tab')[1].classList.add('active');
    document.getElementById('view-import').style.display = 'block';
  } else if (mode === 'teacher') {
    document.querySelectorAll('.mode-tab')[2].classList.add('active');
    document.getElementById('view-teacher').style.display = 'block';
  }
}

// Parse custom CSV spreadsheet via PapaParse
function handleCSVUpload(file) {
  if (!file) return;
  
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: function(results) {
      processUploadedCSV(file.name, results.data);
    },
    error: function(err) {
      alert("Error parsing CSV: " + err.message);
    }
  });
}

// Process imported spreadsheet columns
function processUploadedCSV(filename, data) {
  if (!data || data.length === 0) {
    alert("Empty CSV dataset detected!");
    return;
  }
  
  const headers = Object.keys(data[0]);
  const rowsCount = data.length;
  
  // Show metadata
  document.getElementById('meta-rows').innerText = rowsCount;
  document.getElementById('meta-cols').innerText = headers.length;
  document.getElementById('import-details').style.display = 'block';

  // Populate Target Column dropdown select
  const select = document.getElementById('import-target-select');
  select.innerHTML = "";
  headers.forEach(h => {
    const opt = document.createElement('option');
    opt.value = h;
    opt.innerText = h;
    select.appendChild(opt);
  });

  // Save current imported data arrays in temporary state
  arenaState.importedCSV = {
    filename: filename,
    headers: headers,
    data: data
  };

  suggestImportTask();
}

function suggestImportTask() {
  const select = document.getElementById('import-target-select');
  const target = select.value;
  const data = arenaState.importedCSV.data;
  
  // Check data types of target value rows (Numeric vs Category strings)
  let numericCount = 0;
  let uniqueValues = new Set();
  
  data.forEach(row => {
    if (typeof row[target] === 'number') numericCount++;
    uniqueValues.add(row[target]);
  });

  const task = (numericCount > data.length * 0.8 && uniqueValues.size > 10) ? "Regression" : "Classification";
  document.getElementById('meta-task').innerText = task;
}

// Custom imported competition builder
function joinCustomImportedCompetition() {
  const csv = arenaState.importedCSV;
  const select = document.getElementById('import-target-select');
  const target = select.value;
  const task = document.getElementById('meta-task').innerText;

  // Build custom competition dataset configuration
  const formattedRows = csv.data.slice(0, 5).map(row => csv.headers.map(h => row[h]));

  // Auto compile column stats
  const stats = {};
  csv.headers.forEach(col => {
    stats[col] = {
      mean: (Math.random() * 100).toFixed(1),
      median: (Math.random() * 90).toFixed(1),
      nulls: "0%",
      unique: csv.data.length,
      corr: col === target ? "1.00" : (Math.random() > 0.5 ? "+" : "-") + (0.1 + Math.random() * 0.8).toFixed(2)
    };
  });

  arenaState.currentComp = {
    title: `Imported Challenge: ${csv.filename}`,
    desc: `Run predictive pipelines on targets: ${target}.`,
    task: task,
    target: target,
    headers: csv.headers,
    rows: formattedRows,
    rowCount: csv.data.length,
    nullColumns: {}, // Clean initially
    stats: stats,
    noiseLevel: 0.1
  };

  // Skip setup, jump directly to step 2 explorer
  renderStep2Explorer();
  proceedToStep(2);
}

// Teacher mode challenge generator
function generateTeacherCompetition() {
  const title = document.getElementById('teacher-title').value;
  const metric = document.getElementById('teacher-metric').value;
  const file = document.getElementById('teacher-file').files[0];

  if (!file) {
    alert("Please select a classroom dataset CSV file!");
    return;
  }

  alert(`Teacher challenge generated: ${title}\nStudents will evaluate algorithms using: ${metric.toUpperCase()}`);
  
  // Re-use PapaParse logic to parse and load it
  handleCSVUpload(file);
}

// Step 2 Exploration Panel Renderer
function renderStep2Explorer() {
  const comp = arenaState.currentComp;
  if (!comp) return;

  document.getElementById('explorer-filename').innerText = comp.title;
  const table = document.getElementById('data-grid-table');
  table.innerHTML = "";

  // Headers
  const thead = document.createElement('thead');
  const hRow = document.createElement('tr');
  comp.headers.forEach(h => {
    const th = document.createElement('th');
    th.innerText = h;
    th.onclick = () => showFeatureStatistics(h);
    hRow.appendChild(th);
  });
  thead.appendChild(hRow);
  table.appendChild(thead);

  // Rows
  const tbody = document.createElement('tbody');
  comp.rows.forEach(r => {
    const tr = document.createElement('tr');
    r.forEach(val => {
      const td = document.createElement('td');
      td.innerText = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // Default select first metric
  showFeatureStatistics(comp.headers[0]);
}

// Filter dataset exploration records search
function filterDataGrid() {
  const query = document.getElementById('explorer-search').value.toLowerCase();
  const table = document.getElementById('data-grid-table');
  const rows = table.querySelectorAll('tbody tr');

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    if (text.includes(query)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Show statistics details
function showFeatureStatistics(col) {
  const comp = arenaState.currentComp;
  const stats = comp.stats[col];
  const pane = document.getElementById('feature-detail-pane');

  if (!stats) return;

  pane.innerHTML = `
    <div class="metric-row"><strong>Target Column:</strong> <span>${col}</span></div>
    <div class="metric-row"><strong>Mean Vector:</strong> <span>${stats.mean}</span></div>
    <div class="metric-row"><strong>Median Value:</strong> <span>${stats.median}</span></div>
    <div class="metric-row"><strong>Null Density:</strong> <span style="color:var(--danger)">${stats.nulls}</span></div>
    <div class="metric-row"><strong>Correlation:</strong> <span style="color:var(--primary)">${stats.corr}</span></div>
  `;

  // Draw simple SVG distribution bars representing distributions
  const svg = document.getElementById('exploration-svg');
  if (svg) {
    svg.innerHTML = `
      <rect x="20" y="80" width="40" height="40" fill="var(--border-hover)" rx="3" />
      <rect x="70" y="40" width="40" height="80" fill="var(--primary)" rx="3" />
      <rect x="120" y="20" width="40" height="100" fill="var(--primary)" rx="3" />
      <rect x="170" y="60" width="40" height="60" fill="var(--primary)" rx="3" />
      <rect x="220" y="90" width="40" height="30" fill="var(--border-hover)" rx="3" />
      <text x="140" y="145" fill="var(--text-muted)" font-size="9" text-anchor="middle">Variable Distribution Density</text>
    `;
  }
}

// Switch exploration charts
function switchExplorationChart(type) {
  const tabs = document.querySelectorAll('.chart-tabs .chart-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  const svg = document.getElementById('exploration-svg');

  if (type === 'dist') {
    tabs[0].classList.add('active');
    svg.innerHTML = `
      <rect x="20" y="80" width="40" height="40" fill="var(--border-hover)" rx="3" />
      <rect x="70" y="40" width="40" height="80" fill="var(--primary)" rx="3" />
      <rect x="120" y="20" width="40" height="100" fill="var(--primary)" rx="3" />
      <rect x="170" y="60" width="40" height="60" fill="var(--primary)" rx="3" />
      <rect x="220" y="90" width="40" height="30" fill="var(--border-hover)" rx="3" />
      <text x="140" y="145" fill="var(--text-muted)" font-size="9" text-anchor="middle">Variable Distribution Density</text>
    `;
  } else if (type === 'corr') {
    tabs[1].classList.add('active');
    // Draw correlation heatmap grid
    svg.innerHTML = `
      <rect x="30" y="20" width="40" height="40" fill="#EF4444" opacity="0.8" rx="2" />
      <rect x="75" y="20" width="40" height="40" fill="#FBBF24" opacity="0.5" rx="2" />
      <rect x="120" y="20" width="40" height="40" fill="#10B981" opacity="0.3" rx="2" />
      
      <rect x="30" y="65" width="40" height="40" fill="#FBBF24" opacity="0.6" rx="2" />
      <rect x="75" y="65" width="40" height="40" fill="#EF4444" opacity="0.9" rx="2" />
      <rect x="120" y="65" width="40" height="40" fill="#10B981" opacity="0.2" rx="2" />

      <text x="190" y="50" fill="var(--text-main)" font-size="10" font-weight="bold">Heatmap Matrix</text>
      <text x="190" y="70" fill="var(--text-muted)" font-size="9">Red: High Pos</text>
      <text x="190" y="85" fill="var(--text-muted)" font-size="9">Green: Neutral</text>
    `;
  }
}

// Step 3 Preprocessing Inputs Generator
function buildCleaningPanelInputs() {
  const comp = arenaState.currentComp;
  const container = document.getElementById('cleaning-inputs-container');
  if (!container) return;
  container.innerHTML = "";

  const nullCols = Object.keys(comp.nullColumns);
  if (nullCols.length === 0) {
    container.innerHTML = "<p style='color:var(--success)'>✔ Dataset contains 0 missing entries. No cleaning needed!</p>";
    document.getElementById('clean-next-btn').removeAttribute('disabled');
    document.getElementById('quality-val').innerText = "100%";
    return;
  }

  nullCols.forEach(col => {
    const formGroup = document.createElement('div');
    formGroup.className = "cleaning-field-row";
    formGroup.innerHTML = `
      <div class="clean-col-info">
        <strong>${col}</strong>
        <span>Missing: ${comp.nullColumns[col]}%</span>
      </div>
      <select class="clean-select" id="clean-strat-${col}">
        <option value="mean">Impute Mean</option>
        <option value="median">Impute Median</option>
        <option value="mode">Impute Mode</option>
        <option value="drop">Drop Rows</option>
      </select>
    `;
    container.appendChild(formGroup);
  });
}

function executeDataCleaning() {
  const comp = arenaState.currentComp;
  const qualityVal = document.getElementById('quality-val');
  const feedback = document.getElementById('quality-feedback');

  const nullCols = Object.keys(comp.nullColumns);
  let correctDecisions = 0;

  nullCols.forEach(col => {
    const decision = document.getElementById(`clean-strat-${col}`).value;
    
    // Mean is bad for highly skewed data, let's pretend median is optimal in this scenario
    if (decision === 'median' || decision === 'mean') {
      correctDecisions++;
    }
  });

  const finalQuality = 80 + Math.round((correctDecisions / (nullCols.length || 1)) * 18);
  qualityVal.innerText = `${finalQuality}%`;
  
  if (finalQuality >= 90) {
    qualityVal.style.color = "var(--success)";
    feedback.innerHTML = `<span style="color:var(--success)">✔ Imputation successful. Dataset Quality Maximized. Step 4 unlocked.</span>`;
  } else {
    qualityVal.style.color = "var(--primary)";
    feedback.innerHTML = `<span style="color:var(--primary)">⚠ Dataset prepared but sub-optimal strategies selected for skewed columns.</span>`;
  }

  document.getElementById('clean-next-btn').removeAttribute('disabled');
  arenaState.cleaningCompleted = true;
}

// Step 4 Feature Engineering Visual Builder
function addPipelineStep(step) {
  if (arenaState.pipelineSteps.includes(step)) return;
  arenaState.pipelineSteps.push(step);
  renderPipelineFlow();
}

function removePipelineStep(step) {
  // Do not allow removing input or output
  arenaState.pipelineSteps = arenaState.pipelineSteps.filter(s => s !== step);
  renderPipelineFlow();
}

function renderPipelineFlow() {
  const container = document.getElementById('active-pipeline-flow');
  if (!container) return;
  container.innerHTML = "";

  // Start Node
  const startNode = document.createElement('div');
  startNode.className = "pipeline-node start";
  startNode.innerHTML = `<strong>Input Features</strong><p>${arenaState.currentComp ? arenaState.currentComp.headers.length : 5} dimensions</p>`;
  container.appendChild(startNode);

  // Intermediate Nodes
  arenaState.pipelineSteps.forEach(step => {
    const arrow = document.createElement('div');
    arrow.className = "flow-arrow";
    arrow.innerText = "↓";
    container.appendChild(arrow);

    const node = document.createElement('div');
    node.className = "pipeline-node";
    node.setAttribute('onclick', `removePipelineStep('${step}')`);

    let title = "", desc = "";
    if (step === 'impute') { title = "Imputer"; desc = "Missing value imputation"; }
    else if (step === 'encode') { title = "One-Hot Encoder"; desc = "Convert text labels"; }
    else if (step === 'scale') { title = "StandardScaler"; desc = "Scale variance to 1"; }
    else if (step === 'poly') { title = "Polynomial Features"; desc = "Build cross-product columns"; }
    else if (step === 'imbalance') { title = "SMOTE Balance"; desc = "Oversample sparse target rows"; }
    else if (step === 'select') { title = "SelectKBest"; desc = "Keep top correlative variables"; }

    node.innerHTML = `<strong>${title}</strong><p>${desc}</p>`;
    container.appendChild(node);
  });

  // End Node
  const arrow = document.createElement('div');
  arrow.className = "flow-arrow";
  arrow.innerText = "↓";
  container.appendChild(arrow);

  const endNode = document.createElement('div');
  endNode.className = "pipeline-node end";
  endNode.innerHTML = `<strong>Final Output</strong><p>Target correlation matrices ready</p>`;
  container.appendChild(endNode);

  // Re-compile Feature Importances Preview
  renderFeatureImportances();
}

function renderFeatureImportances() {
  const container = document.getElementById('importance-chart');
  if (!container) return;
  container.innerHTML = "";

  const featuresList = [
    { name: "Principal_Comp_1", val: 78 },
    { name: "Var_Encoded", val: 56 },
    { name: "Cross_Metric_X", val: 45 },
    { name: "Base_Metric_Y", val: 32 }
  ];

  // If poly features is activated, append a highly correlated combined variable
  if (arenaState.pipelineSteps.includes('poly')) {
    featuresList.unshift({ name: "Poly_Feature_X_Y", val: 94 });
  }

  featuresList.forEach(f => {
    const row = document.createElement('div');
    row.className = 'importance-bar';
    row.innerHTML = `
      <span class="bar-name">${f.name}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${f.val}%;"></div>
      </div>
      <span class="bar-val">${f.val}%</span>
    `;
    container.appendChild(row);
  });
}

// Step 5 Model Marketplace Dynamic cards
function proceedToStep(n) {
  // Unlock target link in sidebar
  const links = document.querySelectorAll('.step-link');
  if (n <= links.length) {
    const targetLink = links[n - 1];
    targetLink.classList.remove('locked');
    
    // Add completed checkmark to previous step
    const prevLink = links[n - 2];
    if (prevLink) prevLink.classList.add('completed');
  }

  if (n === 5) {
    buildModelMarketplace();
  }

  switchToStepPane(n);
}

function buildModelMarketplace() {
  const comp = arenaState.currentComp;
  const container = document.getElementById('model-marketplace-container');
  if (!container) return;
  container.innerHTML = "";

  const models = [
    { id: "decision_tree", name: "Decision Tree", desc: "Pruned decision paths. Susceptible to overfitting.", speed: "Fast", acc: "Med", mem: "Low", category: "Classification" },
    { id: "random_forest", name: "Random Forest", desc: "Baggings of decision trees. Robust to outlier rows.", speed: "Medium", acc: "High", mem: "Medium", category: "Classification" },
    { id: "xgboost", name: "XGBoost", desc: "Extreme Gradient Boosting tree nodes. High performance.", speed: "Slow", acc: "V. High", mem: "High", category: "Classification" },
    { id: "linear_reg", name: "Linear Regression", desc: "Simple coefficient regression pipeline.", speed: "V. Fast", acc: "Med", mem: "Low", category: "Regression" },
    { id: "ridge_lasso", name: "Ridge & Lasso", desc: "Regularized linear pipelines restricting coefficient sizing.", speed: "Fast", acc: "High", mem: "Low", category: "Regression" }
  ];

  // Filter based on dataset task
  const filtered = models.filter(m => m.category === comp.task);
  
  filtered.forEach(m => {
    const card = document.createElement('div');
    card.className = `algo-card card ${arenaState.selectedAlgorithm === m.id ? 'selected' : ''}`;
    card.setAttribute('onclick', `selectAlgorithm('${m.id}')`);
    card.innerHTML = `
      <div>
        <span class="algo-type">${m.speed} Training</span>
        <h3>${m.name}</h3>
        <p>${m.desc}</p>
      </div>
      <div class="algo-specs">
        <span>Accuracy: ${m.acc}</span>
        <span>RAM: ${m.mem}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function selectAlgorithm(algoId) {
  arenaState.selectedAlgorithm = algoId;
  buildModelMarketplace(); // Redraw selection outline
}

// Step 6 Live training sandbox loop controls
let trainingInterval = null;

function updateLearningRateDisplay() {
  const val = parseInt(document.getElementById('param-lr').value);
  const lr = val / 1000;
  arenaState.learningRate = lr;
  document.getElementById('lr-val').innerText = lr.toFixed(3);
}

function toggleTrainingPause() {
  const btn = document.getElementById('pause-train-btn');
  if (arenaState.trainingPaused) {
    arenaState.trainingPaused = false;
    btn.innerText = "Pause";
    // Resume training loop
    runModelTrainingStep();
  } else {
    arenaState.trainingPaused = true;
    btn.innerText = "Resume";
  }
}

function startModelTraining() {
  const consoleLog = document.getElementById('training-console');
  const startBtn = document.getElementById('start-train-btn');
  const pauseBtn = document.getElementById('pause-train-btn');
  
  startBtn.setAttribute('disabled', 'true');
  pauseBtn.removeAttribute('disabled');

  consoleLog.innerText = "Training Pipeline Initiated...\n";
  arenaState.trainingRunning = true;
  arenaState.trainingPaused = false;
  arenaState.epochsPassed = 0;
  arenaState.lossHistory = [];
  arenaState.valLossHistory = [];
  
  arenaState.maxEpochs = parseInt(document.getElementById('param-estimators').value);

  // Reset hardware workloads
  document.getElementById('cpu-fill').style.width = "75%";
  document.getElementById('gpu-fill').style.width = "90%";

  runModelTrainingStep();
}

function runModelTrainingStep() {
  if (arenaState.trainingPaused || !arenaState.trainingRunning) return;

  const consoleLog = document.getElementById('training-console');
  const nextBtn = document.getElementById('train-next-btn');

  trainingInterval = setTimeout(() => {
    arenaState.epochsPassed++;
    
    // Simulate validation losses decreasing
    let decayFactor = 1.0 - (arenaState.learningRate * 2.0);
    if (decayFactor < 0.1) decayFactor = 0.1;

    let baseLoss = 0.8 * Math.pow(decayFactor, arenaState.epochsPassed / 10);
    // Add noise based on learning rate size (high lr = unstable training bounds)
    let lrNoise = (Math.random() - 0.5) * arenaState.learningRate * 3.0;
    let loss = baseLoss + Math.abs(lrNoise);
    let valLoss = baseLoss * 1.08 + Math.abs((Math.random() - 0.4) * arenaState.learningRate * 1.5);
    
    if (loss < 0.05) loss = 0.05;
    if (valLoss < 0.07) valLoss = 0.07;

    arenaState.lossHistory.push(loss);
    arenaState.valLossHistory.push(valLoss);

    // Calculate validation accuracy
    let baseAcc = 65;
    let tuningMultiplier = arenaState.pipelineSteps.length * 4; // Pipeline nodes increase accuracy
    let finalAcc = baseAcc + tuningMultiplier + (1.0 - valLoss) * 15;
    if (finalAcc > 94.2) finalAcc = 94.2;

    consoleLog.innerText += `Epoch ${arenaState.epochsPassed}/${arenaState.maxEpochs} - Loss: ${loss.toFixed(4)} - Val Loss: ${valLoss.toFixed(4)} - Accuracy: ${finalAcc.toFixed(1)}%\n`;
    consoleLog.scrollTop = consoleLog.scrollHeight;

    // Draw training loss curves
    drawTrainingLossCurve();

    if (arenaState.epochsPassed < arenaState.maxEpochs) {
      runModelTrainingStep();
    } else {
      // Training ended
      clearTimeout(trainingInterval);
      document.getElementById('pause-train-btn').setAttribute('disabled', 'true');
      document.getElementById('start-train-btn').removeAttribute('disabled');
      nextBtn.removeAttribute('disabled');
      arenaState.trainingCompleted = true;
      
      document.getElementById('cpu-fill').style.width = "8%";
      document.getElementById('gpu-fill').style.width = "0%";

      // Calculate Step 7 Diagnostics
      calculateValidationDiagnostics(finalAcc, valLoss);
    }
  }, 100);
}

function drawTrainingLossCurve() {
  const svg = document.getElementById('training-loss-svg');
  if (!svg) return;

  const pointsCount = arenaState.lossHistory.length;
  if (pointsCount === 0) return;

  const width = 300;
  const height = 130;
  const margin = 15;

  let pathDataTrain = "";
  let pathDataVal = "";

  for (let i = 0; i < pointsCount; i++) {
    let x = margin + (i / (arenaState.maxEpochs - 1)) * (width - margin * 2);
    // Map loss 0.0 to 1.0 to SVG coordinates
    let lossVal = arenaState.lossHistory[i];
    let valLossVal = arenaState.valLossHistory[i];

    if (lossVal > 1.0) lossVal = 1.0;
    if (valLossVal > 1.0) valLossVal = 1.0;

    let yTrain = height - margin - (lossVal * (height - margin * 2));
    let yVal = height - margin - (valLossVal * (height - margin * 2));

    if (i === 0) {
      pathDataTrain = `M ${x} ${yTrain}`;
      pathDataVal = `M ${x} ${yVal}`;
    } else {
      pathDataTrain += ` L ${x} ${yTrain}`;
      pathDataVal += ` L ${x} ${yVal}`;
    }
  }

  svg.innerHTML = `
    <!-- Grid borders -->
    <line x1="15" y1="15" x2="15" y2="115" stroke="var(--border-color)" />
    <line x1="15" y1="115" x2="285" y2="115" stroke="var(--border-color)" />
    
    <!-- Path tags -->
    <path d="${pathDataTrain}" fill="none" stroke="#FBBF24" stroke-width="2" />
    <path d="${pathDataVal}" fill="none" stroke="#10B981" stroke-width="2" />
    
    <text x="240" y="30" fill="#FBBF24" font-size="9" font-family="monospace">Train Loss</text>
    <text x="240" y="45" fill="#10B981" font-size="9" font-family="monospace">Val Loss</text>
  `;
}

// Step 7 Diagnostics calculations
function calculateValidationDiagnostics(acc, loss) {
  arenaState.score = parseFloat(acc.toFixed(1));
  const f1 = acc - 1.4;

  document.getElementById('eval-accuracy').innerText = `${arenaState.score}%`;
  document.getElementById('eval-f1').innerText = `${f1.toFixed(1)}%`;
  document.getElementById('eval-loss').innerText = loss.toFixed(3);

  // Render Confusion Matrix
  let tp = Math.round(arenaState.score * 1.5);
  let fn = 180 - tp;
  let fp = Math.round(15 - (arenaState.score - 80) * 0.5);
  let tn = 90 - fp;

  if (fp < 2) fp = 2;
  if (tn < 0) tn = 0;

  document.getElementById('cell-tp').innerText = tp;
  document.getElementById('cell-fn').innerText = fn;
  document.getElementById('cell-fp').innerText = fp;
  document.getElementById('cell-tn').innerText = tn;

  // Render SHAP Values based on current features
  renderSHAPDashboard();
  
  // Render Misclassified Error Samples List
  renderErrorSamples();
}

// Render SHAP Values
function renderSHAPDashboard() {
  const container = document.getElementById('shap-container');
  if (!container) return;
  container.innerHTML = "";

  const shaps = [
    { name: "Feature_A", val: 38 },
    { name: "Feature_B", val: -22 },
    { name: "Feature_C", val: 12 },
    { name: "Feature_D", val: -5 }
  ];

  shaps.forEach(s => {
    const widthPercentage = Math.abs(s.val);
    const directionClass = s.val >= 0 ? 'positive' : 'negative';

    const bar = document.createElement('div');
    bar.className = "shap-bar";
    bar.innerHTML = `
      <span class="shap-label">${s.name}</span>
      <div class="shap-track">
        <div class="shap-fill ${directionClass}" style="width: ${widthPercentage}%;"></div>
      </div>
      <span style="font-family:var(--font-mono); font-size:11px; width:30px; color:${s.val >= 0 ? 'var(--success)' : 'var(--danger)'}">
        ${s.val >= 0 ? '+' : ''}${s.val}%
      </span>
    `;
    container.appendChild(bar);
  });
}

function renderErrorSamples() {
  const table = document.getElementById('error-samples-table');
  if (!table) return;
  table.innerHTML = `
    <thead>
      <tr>
        <th>Row ID</th>
        <th>Predicted Class</th>
        <th>Ground Truth</th>
        <th>Conf %</th>
      </tr>
    </thead>
    <tbody>
      <tr style="cursor:pointer" onclick="alert('SHAP Analysis: Predicted class 1 due to high Feature_A (84), but Ground Truth was 0 (Likely noise event).')">
        <td>#142</td>
        <td><span style="color:var(--danger)">1</span></td>
        <td>0</td>
        <td>84.2%</td>
      </tr>
      <tr style="cursor:pointer" onclick="alert('SHAP Analysis: Predicted class 0 due to low Feature_B (10), but Ground Truth was 1.')">
        <td>#205</td>
        <td><span style="color:var(--danger)">0</span></td>
        <td>1</td>
        <td>61.5%</td>
      </tr>
    </tbody>
  `;
}

// Step 8 K-Fold validation optimizer
function runCVOptimization() {
  const kfolds = parseInt(document.getElementById('kfold-select').value);
  const reg = parseInt(document.getElementById('reg-slider').value);
  
  // Calculate validation scores
  let baseScore = arenaState.score;
  let optimizedScore = baseScore + (kfolds / 12) - (Math.abs(reg - 5) / 10);
  
  document.getElementById('cv-score-val').innerText = `${optimizedScore.toFixed(1)}%`;
}

// Step 9 Predictions Submission calculations
function executeSubmission() {
  const resultBox = document.getElementById('submission-result');
  if (!resultBox) return;
  resultBox.style.display = "block";
  
  // Public/Private dynamic split (adding slight noise to mimic leaderboard shakeup)
  const publicScore = arenaState.score;
  const privateScore = publicScore + (Math.random() - 0.45) * 1.5;

  document.getElementById('public-score-val').innerText = `${publicScore.toFixed(1)}%`;
  document.getElementById('private-score-val').innerText = `${privateScore.toFixed(1)}%`;

  // Award XP and coins
  let currentXP = parseInt(localStorage.getItem("ml_quest_xp")) || 1250;
  arenaState.xp = currentXP + 250;
  localStorage.setItem("ml_quest_xp", arenaState.xp);
  document.getElementById('stat-xp').innerText = `${arenaState.xp.toLocaleString()} XP`;

  // Provide Dynamic Suggestion text
  let suggestion = "+250 XP earned. Optimal pipeline built! Tip: Try scaling continuous inputs to squeeze out 0.5% more validation scores.";
  if (!arenaState.pipelineSteps.includes('scale')) {
    suggestion = "Submission received! Tips: You didn't StandardScaler features. Adding scaling to continuous inputs can prevent local minimum bounds.";
  }
  document.getElementById('sub-achievement-msg').innerText = suggestion;

  document.getElementById('sub-next-btn').removeAttribute('disabled');

  // Trigger bot competitors spawn
  spawnLeaderboardBots(privateScore);
  
  // Update state counters for database progress
  arenaState.attempts = (arenaState.attempts || 0) + 1;
  if (privateScore > (arenaState.bestScore || 0)) {
    arenaState.bestScore = privateScore;
  }

  // Notify parent app of progress update
  try {
    window.parent.postMessage({
      type: 'GAME_PROGRESS',
      gameId: 'kaggle_arena',
      progressData: {
        attempts: arenaState.attempts,
        bestScore: Math.round(arenaState.bestScore * 100) / 100
      }
    }, '*');
  } catch (err) {
    console.error("Failed to post message to parent:", err);
  }

  // Trigger Random Event popup randomly
  if (Math.random() > 0.3) {
    setTimeout(triggerRandomEventPopup, 1000);
  }
}

// Step 10 Leaderboard Renderer
function spawnLeaderboardBots(playerScore) {
  arenaState.leaderboardBots = [
    { rank: 1, name: "sarah_ai", score: 89.2, algo: "XGBoost Classifier", time: "1.4s", xp: "+500" },
    { rank: 2, name: "alex_code", score: 87.4, algo: "Random Forest", time: "0.8s", xp: "+400" },
    { rank: 3, name: "You (Student)", score: playerScore, algo: arenaState.selectedAlgorithm.toUpperCase(), time: "0.4s", xp: "+300", highlight: true },
    { rank: 4, name: "neural_ninja", score: 82.3, algo: "Decision Tree", time: "0.2s", xp: "+200" },
    { rank: 5, name: "trent_datast", score: 81.0, algo: "Linear Classifier", time: "0.1s", xp: "+100" }
  ];

  renderLeaderboardTable();
}

function renderLeaderboardTable() {
  const tbody = document.getElementById('leaderboard-body');
  if (!tbody) return;
  tbody.innerHTML = "";

  // Sort bots based on score descending
  arenaState.leaderboardBots.sort((a, b) => b.score - a.score);

  arenaState.leaderboardBots.forEach((bot, idx) => {
    bot.rank = idx + 1;
    const tr = document.createElement('tr');
    if (bot.highlight) tr.className = "highlight-user";

    tr.innerHTML = `
      <td><b>${bot.rank}</b></td>
      <td>${bot.name}</td>
      <td><span style="color:#10B981; font-weight:700;">${bot.score.toFixed(1)}%</span></td>
      <td>${bot.algo}</td>
      <td>${bot.time}</td>
      <td><span style="color:var(--primary); font-weight:600;">${bot.xp}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// Step 11 Winner timeline replay
function switchToStepPane(n) {
  arenaState.activeStep = n;

  document.querySelectorAll('.step-link').forEach(link => link.classList.remove('active'));
  const activeLink = document.querySelectorAll('.step-link')[n - 1];
  if (activeLink) activeLink.classList.add('active');

  document.querySelectorAll('.pane').forEach(pane => pane.classList.remove('active'));
  const activePane = document.getElementById(`pane-${n}`);
  if (activePane) activePane.classList.add('active');

  if (n === 11) {
    triggerWinnerTimelineReplay();
  } else if (n === 12) {
    initBattleMode();
  } else if (n === 13) {
    loadCareerProgression();
  }
}

function triggerWinnerTimelineReplay() {
  const timeline = document.getElementById('winner-replay-timeline');
  if (!timeline) return;
  timeline.innerHTML = "";
  document.getElementById('winner-context-desc').innerText = "Analyzing pipeline matrices...";

  const steps = [
    { title: "EDA Exploration", desc: "Found missing values in biometrics, identified outlier thresholds." },
    { title: "Cleaning execution", desc: "Applied Median imputation to bypass skewed outliers." },
    { title: "Visual engineering", desc: "Constructed Polynomial features to cross-interact variables." },
    { title: "Model selection", desc: "Blended XGBoost and LightGBM ensemble algorithms." }
  ];

  let current = 0;
  function printNextNode() {
    if (current < steps.length) {
      if (current > 0) {
        const arrow = document.createElement('div');
        arrow.className = "flow-arrow";
        arrow.innerText = "↓";
        timeline.appendChild(arrow);
      }

      const node = document.createElement('div');
      node.className = "flow-node";
      node.innerHTML = `<strong>${steps[current].title}</strong><p>${steps[current].desc}</p>`;
      timeline.appendChild(node);
      
      document.getElementById('winner-context-desc').innerText = steps[current].desc;

      current++;
      setTimeout(printNextNode, 400);
    }
  }
  printNextNode();
}

// Step 12 Multiplayer Battle 1v1 countdown timer
function initBattleMode() {
  const timer = document.getElementById('battle-timer');
  const log = document.getElementById('battle-log-feed');
  const playerScore = document.getElementById('player-battle-score');
  const opponentScore = document.getElementById('opponent-battle-score');

  if (!timer || !log) return;

  playerScore.innerText = `${arenaState.score || 84.2}%`;
  opponentScore.innerText = "81.5%";

  let time = 2700; // 45 minutes
  if (arenaState.battleInterval) clearInterval(arenaState.battleInterval);

  arenaState.battleInterval = setInterval(() => {
    time--;
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    timer.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update log
    if (time % 30 === 0) {
      const logs = [
        "neural_ninja engineered 'Cross_Metric' column (+1.5% accuracy).",
        "neural_ninja switched target validation splitting parameters.",
        "You calculated model parameter checks. Score locked.",
        "neural_ninja submitted predictions grid."
      ];
      const item = document.createElement('div');
      item.className = "log-item";
      item.innerText = logs[Math.floor(Math.random() * logs.length)];
      log.insertBefore(item, log.firstChild);

      // Shift opponent score
      let score = parseFloat(opponentScore.innerText);
      opponentScore.innerText = `${(score + (Math.random() - 0.4)).toFixed(1)}%`;
    }

    if (time <= 0) {
      clearInterval(arenaState.battleInterval);
      alert("Multiplayer round ended! Inspect final ranking outcomes.");
    }
  }, 1000);
}

// Step 13 Career Progression Rank checks
function loadCareerProgression() {
  const title = document.getElementById('career-badge-title');
  const progBar = document.getElementById('career-progress-bar');
  const progText = document.getElementById('career-progress-text');
  
  if (!title) return;

  const xp = parseInt(localStorage.getItem("ml_quest_xp")) || 1250;
  
  if (xp >= 3000) {
    title.innerText = "Senior AI Research Scientist";
    progBar.style.width = "100%";
    progText.innerText = "Max Rank Tier Unlocked!";
    document.getElementById('status-health').innerText = "Grandmaster status";
    document.getElementById('lock-finance').style.display = "none";
    document.getElementById('career-track-finance').classList.remove('locked');
  } else if (xp >= 2000) {
    title.innerText = "ML Engineer Pro";
    progBar.style.width = "75%";
    progText.innerText = `${xp} / 3,000 XP to next credential.`;
    document.getElementById('lock-finance').style.display = "none";
    document.getElementById('career-track-finance').classList.remove('locked');
  } else {
    title.innerText = "Junior Data Analyst";
    progBar.style.width = "35%";
    progText.innerText = `${xp} / 2,000 XP to unlock Senior tracks.`;
  }
}

// Random Events Engine Popups
const RANDOM_EVENTS = [
  { title: "Client Dataset Update", desc: "The client supplied updated biometrics logs. Outlier frequencies have spiked in the target vectors." },
  { title: "Client Changes Metric", desc: "The client now demands maximizing F1-Score instead of base Accuracy. Readjust classifiers!" },
  { title: "Data Leak Found", desc: "A data leak was detected in column 'Feature_C'. The correlation score dropped. Drop it immediately!" }
];

function triggerRandomEventPopup() {
  const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  document.getElementById('event-title-text').innerText = event.title;
  document.getElementById('event-desc-text').innerText = event.desc;
  
  document.getElementById('random-event-modal').style.display = "flex";
}

function closeRandomEventModal() {
  document.getElementById('random-event-modal').style.display = "none";
  alert("Pipeline recalculated to adapt to the client event.");
}
