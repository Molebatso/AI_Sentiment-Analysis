const examples = [
  "This product is absolutely amazing! The quality exceeded my expectations and the customer service was exceptional. Highly recommend!",

  "Just spent 3 hours debugging a single line of code. Why does programming have to be so frustrating sometimes? 😤",

  "The new update is okay, but I think there could be improvements in the user interface. Some features are confusing.",

  "One of the most beautiful films I've ever seen. The cinematography, acting, and storytelling were all exceptional. A true masterpiece!"
];

const positiveWords = [
  "amazing",
  "excellent",
  "love",
  "great",
  "wonderful",
  "happy",
  "best",
  "awesome",
  "fantastic",
  "recommend",
  "beautiful",
  "masterpiece",
  "exceptional"
];

const negativeWords = [
  "terrible",
  "awful",
  "hate",
  "disappointed",
  "frustrated",
  "angry",
  "poor",
  "confusing",
  "bad",
  "worst",
  "problem",
  "crash",
  "difficult"
];

let history = JSON.parse(localStorage.getItem("history")) || [];

let pieChart;
let barChart;
let trendChart;

function loadExample(index) {
  document.getElementById("userText").value = examples[index];
}

function analyzeText(text) {

  const lower = text.toLowerCase();

  let positive = 0;
  let negative = 0;

  positiveWords.forEach(word => {
    if (lower.includes(word)) positive++;
  });

  negativeWords.forEach(word => {
    if (lower.includes(word)) negative++;
  });

  let sentiment = "Neutral";
  let confidence = 60;
  let tone = "Balanced";
  let explanation =
    "The text contains balanced or informational language.";

  let insight =
    "The audience appears neutral with no strong emotional indicators.";

  if (positive > negative) {

    sentiment = "Positive";
    confidence = Math.min(95, 70 + positive * 5);
    tone = "Optimistic";

    explanation =
      "The text expresses positive emotions and satisfaction.";

    insight =
      "Users respond positively toward the experience or product.";

  }

  else if (negative > positive) {

    sentiment = "Negative";
    confidence = Math.min(95, 70 + negative * 5);
    tone = "Frustrated";

    explanation =
      "The text contains criticism or dissatisfaction.";

    insight =
      "Users may be experiencing frustration or usability problems.";
  }

  return {
    text,
    sentiment,
    confidence,
    tone,
    explanation,
    insight,
    timestamp: new Date().toLocaleString()
  };
}

function analyzeSentiment() {

  const text = document.getElementById("userText").value.trim();

  if (text === "") {
    alert("Please enter text.");
    return;
  }

  const loading = document.getElementById("loading");

  loading.classList.remove("hidden");

  setTimeout(() => {

    loading.classList.add("hidden");

    const result = analyzeText(text);

    displayResult(result);

    history.unshift(result);

    localStorage.setItem("history", JSON.stringify(history));

    updateDashboard();

  }, 1500);
}

function batchAnalyze() {

  const texts = document
    .getElementById("userText")
    .value
    .split("\n")
    .filter(t => t.trim() !== "");

  if (texts.length === 0) {
    alert("Please enter text.");
    return;
  }

  texts.forEach(text => {

    const result = analyzeText(text);

    history.unshift(result);

  });

  localStorage.setItem("history", JSON.stringify(history));

  displayResult(history[0]);

  updateDashboard();
}

function displayResult(result) {

  document.getElementById("sentimentResult").innerText =
    result.sentiment;

  document.getElementById("confidenceResult").innerText =
    result.confidence + "%";

  document.getElementById("toneResult").innerText =
    result.tone;

  document.getElementById("explanation").innerText =
    result.explanation;

  document.getElementById("insight").innerText =
    result.insight;
}

function updateDashboard() {

  const positive = history.filter(
    h => h.sentiment === "Positive"
  ).length;

  const negative = history.filter(
    h => h.sentiment === "Negative"
  ).length;

  const neutral = history.filter(
    h => h.sentiment === "Neutral"
  ).length;

  const total = history.length;

  const average = total === 0
    ? 0
    : Math.round(
        history.reduce(
          (sum, h) => sum + h.confidence,
          0
        ) / total
      );

  document.getElementById("totalAnalyses").innerText = total;
  document.getElementById("positiveCount").innerText = positive;
  document.getElementById("negativeCount").innerText = negative;
  document.getElementById("neutralCount").innerText = neutral;
  document.getElementById("averageConfidence").innerText =
    average + "%";

  renderHistory();

  renderCharts(positive, negative, neutral);
}

function renderHistory() {

  const container =
    document.getElementById("historyContainer");

  const searchInput =
    document.getElementById("searchInput");

  const filterSelect =
    document.getElementById("filterSelect");

  const search = searchInput
    ? searchInput.value.toLowerCase()
    : "";

  const filter = filterSelect
    ? filterSelect.value
    : "All";

  container.innerHTML = "";

  const filteredHistory = history.filter(item => {

    const matchesSearch =
      item.text.toLowerCase().includes(search);

    const matchesFilter =
      filter === "All" ||
      item.sentiment === filter;

    return matchesSearch && matchesFilter;
  });

  filteredHistory.slice(0, 10).forEach(item => {

    container.innerHTML += `
      <div class="history-item">

        <div class="history-top">

          <span class="badge ${item.sentiment.toLowerCase()}">
            ${item.sentiment}
          </span>

          <strong>${item.confidence}%</strong>

        </div>

        <p>${item.text}</p>

        <div class="timestamp">
          ${item.timestamp}
        </div>

      </div>
    `;
  });
}

function renderCharts(positive, negative, neutral) {

  const pieCtx =
    document.getElementById("pieChart");

  const barCtx =
    document.getElementById("barChart");

  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
  if (trendChart) trendChart.destroy();

  pieChart = new Chart(pieCtx, {
    type: "doughnut",

    data: {
      labels: ["Positive", "Negative", "Neutral"],

      datasets: [{
        data: [positive, negative, neutral],

        backgroundColor: [
          "#22c55e",
          "#ef4444",
          "#94a3b8"
        ]
      }]
    }
  });

  barChart = new Chart(barCtx, {
    type: "bar",

    data: {
      labels: ["Positive", "Negative", "Neutral"],

      datasets: [{
        label: "Sentiment Count",

        data: [positive, negative, neutral],

        backgroundColor: [
          "#22c55e",
          "#ef4444",
          "#94a3b8"
        ]
      }]
    }
  });
}

function exportCSV() {

  if (history.length === 0) {
    alert("No data available.");
    return;
  }

  let csv =
    "Text,Sentiment,Confidence,Timestamp\n";

  history.forEach(item => {

    csv += `"${item.text}",${item.sentiment},${item.confidence},${item.timestamp}\n`;

  });

  const blob = new Blob([csv], {
    type: "text/csv"
  });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = "sentiment-history.csv";

  link.click();
}

async function exportPDF() {

  if (history.length === 0) {
    alert("No data available.");
    return;
  }

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.setFontSize(18);

  doc.text("Sentiment Analysis Report", 20, 20);

  let y = 40;

  history.forEach((item, index) => {

    doc.setFontSize(12);

    doc.text(
      `${index + 1}. ${item.sentiment} (${item.confidence}%)`,
      20,
      y
    );

    y += 8;

    doc.text(
      item.text.substring(0, 80),
      20,
      y
    );

    y += 15;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("sentiment-report.pdf");
}

const themeToggle =
  document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {

    themeToggle.innerText =
      "☀️ Light Mode";

  }

  else {

    themeToggle.innerText =
      "🌙 Dark Mode";
  }
});

updateDashboard();