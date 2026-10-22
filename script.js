
const STORAGE_KEY = "expenseTrackerTransactions";
const BUDGET_KEY = "expenseTrackerMonthlyBudget";

const app = document.getElementById("app");
const page = document.body.dataset.page || "dashboard";

const pages = [
  { id: "dashboard", label: "Dashboard", file: "index.html", icon: "🏠" },
  { id: "add", label: "Add Transaction", file: "add-transaction.html", icon: "➕" },
  { id: "transactions", label: "Transactions", file: "transactions.html", icon: "📋" },
  { id: "analytics", label: "Analytics", file: "analytics.html", icon: "📊" },
  { id: "budget", label: "Monthly Budget", file: "budget.html", icon: "🎯" }
];

const titles = {
  dashboard: ["Dashboard", "Your financial overview"],
  add: ["Add Transaction", "Record your income or expenses"],
  transactions: ["Transaction History", "View and manage your transactions"],
  analytics: ["Analytics", "Understand your income and spending"],
  budget: ["Monthly Budget", "Plan and manage your monthly spending"]
};

// Get today's date
function localDate() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// Get current month
function currentMonth() {
  return localDate().slice(0, 7);
}

// Format Indian Rupees
function money(value) {
  return "₹" + Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Escape HTML
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Load transactions
function loadTransactions() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved
      .filter(t =>
        t &&
        typeof t.description === "string" &&
        Number.isFinite(Number(t.amount)) &&
        Number(t.amount) > 0 &&
        ["income", "expense"].includes(t.type) &&
        typeof t.date === "string"
      )
      .map(t => ({
        id: String(t.id || crypto.randomUUID()),
        description: t.description,
        amount: Number(t.amount),
        type: t.type,
        date: t.date,
        category: t.category || "Other"
      }));
  } catch (error) {
    console.error("Error loading transactions:", error);
    return [];
  }
}

let transactions = loadTransactions();

// Save transactions
function saveTransactions() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    );

    return true;
  } catch (error) {
    alert("Data save avvaledu. Browser storage check cheyyi.");
    console.error(error);
    return false;
  }
}

// Load budget
function loadBudget() {
  try {
    const value = Number(
      localStorage.getItem(BUDGET_KEY) || 0
    );

    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

let monthlyBudget = loadBudget();

// Save budget
function saveBudget() {
  try {
    localStorage.setItem(BUDGET_KEY, String(monthlyBudget));
    return true;
  } catch {
    alert("Budget save avvaledu.");
    return false;
  }
}

// Calculate totals
function totals(items) {
  const income = items
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = items
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expenses,
    balance: income - expenses
  };
}

// Monthly income
function monthIncome(month = currentMonth()) {
  return transactions
    .filter(t =>
      t.type === "income" &&
      t.date.startsWith(month)
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

// Monthly expenses
function monthExpenses(month = currentMonth()) {
  return transactions
    .filter(t =>
      t.type === "expense" &&
      t.date.startsWith(month)
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

// Summary card
function statCard(label, value, icon, color = "") {
  return `
    <div class="stat-card">
      <div class="symbol">${icon}</div>
      <p>${label}</p>
      <h2 class="${color}">${money(value)}</h2>
    </div>
  `;
}

// Transaction table
function transactionTable(items) {
  if (!items.length) {
    return `
      <p class="empty">
        No transactions found. Add your first transaction!
      </p>
    `;
  }

  const rows = [...items]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(t => `
      <tr>
        <td>${escapeHTML(t.description)}</td>
        <td>${escapeHTML(t.category)}</td>
        <td>${escapeHTML(t.date)}</td>

        <td>
          <span class="pill">
            ${t.type === "income" ? "Income" : "Expense"}
          </span>
        </td>

        <td class="${t.type === "income" ? "green" : "red"}">
          ${t.type === "income" ? "+" : "-"}${money(t.amount)}
        </td>

        <td>
          <button
            class="delete-btn"
            data-delete="${escapeHTML(t.id)}"
            type="button"
          >
            Delete
          </button>
        </td>
      </tr>
    `).join("");

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// Shared page layout
function shell(content) {
  const title = titles[page] || titles.dashboard;

  return `
    <div class="app">
      <aside class="sidebar">
        <div class="brand">💰 Expense<span>Track</span></div>

        <nav class="nav-list">
          ${pages.map(p => `
            <a
              class="nav-link ${p.id === page ? "active" : ""}"
              href="${p.file}"
              ${p.id === page ? 'aria-current="page"' : ""}
            >
              ${p.icon} &nbsp; ${p.label}
            </a>
          `).join("")}
        </nav>
      </aside>

      <main class="main">
        <header class="topbar">
          <div>
            <h1>${title[0]}</h1>
            <div class="muted">${title[1]}</div>
          </div>

          <div class="pill">B.Sc. CS Project</div>
        </header>

        ${content}

        <footer>
          Personal Expense Tracker · Manage your money wisely
        </footer>
      </main>
    </div>
  `;
}

// DASHBOARD
function dashboardPage() {
  const t = totals(transactions);

  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return shell(`
    <section class="stats">
      ${statCard("Total Income", t.income, "💵", "green")}
      ${statCard("Total Expenses", t.expenses, "💸", "red")}
      ${statCard("Current Balance", t.balance, "👛")}
    </section>

    <section class="panel">
      <div class="topbar">
        <div>
          <h2>Recent Transactions</h2>
          <p class="muted">Your latest five records</p>
        </div>

        <a
          class="primary-btn"
          href="add-transaction.html"
          style="text-decoration:none"
        >
          + Add New
        </a>
      </div>

      ${transactionTable(recent)}
    </section>

    <section class="panel">
      <h2>This Month's Budget</h2>

      <p>Budget: <strong>${money(monthlyBudget)}</strong></p>
      <p>Spent: <strong>${money(monthExpenses())}</strong></p>

      ${budgetProgress()}

      <a href="budget.html">Manage monthly budget →</a>
    </section>
  `);
}

// ADD TRANSACTION
function addPage() {
  return shell(`
    <section class="panel">
      <h2>Enter Transaction Details</h2>

      <p class="muted">
        Fill in the details and save your record.
      </p>

      <form id="transaction-form">
        <label for="description">Description</label>

        <input
          id="description"
          type="text"
          maxlength="100"
          placeholder="e.g. College fees, Bus fare, Salary"
          required
        >

        <div class="form-grid">
          <div>
            <label for="amount">Amount (₹)</label>

            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              required
            >
          </div>

          <div>
            <label for="type">Transaction Type</label>

            <select id="type">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        <div class="form-grid">
          <div>
            <label for="category">Category</label>

            <select id="category">
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Education">Education</option>
              <option value="Bills">Bills</option>
              <option value="Salary">Salary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label for="date">Date</label>

            <input
              id="date"
              type="date"
              value="${localDate()}"
              required
            >
          </div>
        </div>

        <button class="primary-btn" type="submit">
          Save Transaction
        </button>

        <a href="transactions.html" style="margin-left:12px">
          View history
        </a>
      </form>
    </section>
  `);
}

// TRANSACTIONS PAGE
function transactionsPage() {
  return shell(`
    <section class="panel">
      <h2>All Transactions</h2>

      <div class="toolbar">
        <div>
          <label for="month-filter">Filter by month</label>
          <input type="month" id="month-filter">
        </div>

        <div>
          <label for="type-filter">Filter by type</label>

          <select id="type-filter">
            <option value="all">All transactions</option>
            <option value="income">Income only</option>
            <option value="expense">Expenses only</option>
          </select>
        </div>
      </div>

      <div id="transaction-results"></div>
    </section>
  `);
}

// ANALYTICS PAGE
function analyticsPage() {
  const t = totals(transactions);

  return shell(`
    <section class="stats">
      ${statCard("Total Income", t.income, "💵", "green")}
      ${statCard("Total Expenses", t.expenses, "💸", "red")}
      ${statCard("Net Balance", t.balance, "👛")}
    </section>

    <section class="panel">
      <h2>Income vs Expenses</h2>
      <p class="muted">
        Compare your total recorded income and expenses.
      </p>

      <div style="position:relative;width:100%;height:320px;">
        <canvas id="incomeExpenseChart"></canvas>
      </div>
    </section>

    <section class="panel">
      <h2>Expenses by Category</h2>
      <p class="muted">
        See how your expenses are distributed.
      </p>

      <div style="position:relative;width:100%;height:320px;">
        <canvas id="expenseCategoryChart"></canvas>
      </div>

      <div id="category-empty-message"></div>
    </section>

    <section class="panel">
      <h2>Monthly Summary</h2>
      ${monthlySummary()}
    </section>
  `);
}

// DRAW ANALYTICS CHARTS
function renderAnalyticsCharts() {
  const incomeCanvas = document.getElementById("incomeExpenseChart");
  const categoryCanvas = document.getElementById("expenseCategoryChart");

  if (!incomeCanvas || !categoryCanvas) return;

  if (typeof Chart === "undefined") {
    const message = `
      <p class="empty">
        Charts library load avvaledu. Internet check chesi refresh cheyyi.
      </p>
    `;

    incomeCanvas.parentElement.innerHTML = message;
    categoryCanvas.parentElement.innerHTML = message;
    return;
  }

  // Remove previous chart instances
  if (window.incomeExpenseChartInstance) {
    window.incomeExpenseChartInstance.destroy();
  }

  if (window.expenseCategoryChartInstance) {
    window.expenseCategoryChartInstance.destroy();
  }

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // BAR CHART: Income vs Expenses
  window.incomeExpenseChartInstance = new Chart(incomeCanvas, {
    type: "bar",

    data: {
      labels: ["Income", "Expenses"],

      datasets: [{
        label: "Amount (₹)",
        data: [income, expenses],

        backgroundColor: ["#16a34a", "#dc2626"],
        borderColor: ["#15803d", "#b91c1c"],
        borderWidth: 1,
        borderRadius: 8,
        maxBarThickness: 100
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false
        },

        tooltip: {
          callbacks: {
            label: context =>
              "₹" + Number(context.raw).toLocaleString("en-IN")
          }
        }
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            callback: value =>
              "₹" + Number(value).toLocaleString("en-IN")
          }
        }
      }
    }
  });

  // Group expenses by category
  const categoryTotals = {};

  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      categoryTotals[t.category] =
        (categoryTotals[t.category] || 0) + t.amount;
    });

  const categories = Object.keys(categoryTotals);
  const amounts = Object.values(categoryTotals);

  // PIE CHART: Expenses by Category
  window.expenseCategoryChartInstance = new Chart(categoryCanvas, {
    type: "pie",

    data: {
      labels: categories.length
        ? categories
        : ["No expenses yet"],

      datasets: [{
        data: amounts.length ? amounts : [1],

        backgroundColor: [
          "#6366f1",
          "#f59e0b",
          "#10b981",
          "#ef4444",
          "#3b82f6",
          "#a855f7",
          "#64748b"
        ],

        borderColor: "#ffffff",
        borderWidth: 2
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: "bottom"
        },

        tooltip: {
          callbacks: {
            label: context => {
              if (categories.length === 0) {
                return "No expenses recorded";
              }

              return context.label + ": ₹" +
                Number(context.raw).toLocaleString("en-IN");
            }
          }
        }
      }
    }
  });

  const emptyMessage = document.getElementById(
    "category-empty-message"
  );

  if (emptyMessage) {
    emptyMessage.innerHTML = categories.length
      ? ""
      : '<p class="muted">Add an expense transaction to see your categories.</p>';
  }
}

// MONTHLY SUMMARY
function monthlySummary() {
  const months = [
    ...new Set(
      transactions.map(t => t.date.slice(0, 7))
    )
  ]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 12);

  if (!months.length) {
    return `
      <p class="empty">
        No monthly data available yet.
      </p>
    `;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Income</th>
            <th>Expenses</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody>
          ${months.map(month => {
            const monthTransactions = transactions.filter(
              item => item.date.startsWith(month)
            );

            const result = totals(monthTransactions);

            return `
              <tr>
                <td>${escapeHTML(month)}</td>
                <td class="green">${money(result.income)}</td>
                <td class="red">${money(result.expenses)}</td>
                <td>${money(result.balance)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// BUDGET PROGRESS
function budgetProgress() {
  const spent = monthExpenses();

  const percent = monthlyBudget > 0
    ? spent / monthlyBudget * 100
    : 0;

  const width = Math.min(100, percent);

  const over = monthlyBudget > 0 && spent > monthlyBudget;

  if (monthlyBudget <= 0) {
    return `
      <p class="muted">
        Set a monthly budget to track your progress.
      </p>
    `;
  }

  return `
    <div class="budget-track">
      <div
        class="budget-fill ${over ? "over" : ""}"
        style="width:${width}%"
      ></div>
    </div>

    <p>
      ${Math.round(percent)}% used
      ${over ? "— Budget exceeded!" : "— within budget"}
    </p>

    <p>
      Remaining:
      <strong>${money(monthlyBudget - spent)}</strong>
    </p>
  `;
}

// MONTHLY BUDGET PAGE
function budgetPage() {
  return shell(`
    <section class="panel">
      <h2>Set Monthly Budget</h2>

      <p class="muted">
        Choose how much you want to spend in a month.
      </p>

      <form id="budget-form">
        <label for="budget-amount">Monthly budget (₹)</label>

        <input
          id="budget-amount"
          type="number"
          min="0"
          step="0.01"
          value="${monthlyBudget}"
          required
        >

        <button class="primary-btn" type="submit">
          Save Budget
        </button>
      </form>
    </section>

    <section class="panel">
      <h2>Budget Overview — ${currentMonth()}</h2>

      <p>
        Monthly budget:
        <strong>${money(monthlyBudget)}</strong>
      </p>

      <p>
        Income this month:
        <strong class="green">${money(monthIncome())}</strong>
      </p>

      <p>
        Expenses this month:
        <strong class="red">${money(monthExpenses())}</strong>
      </p>

      ${budgetProgress()}
    </section>
  `);
}

// FILTER TRANSACTIONS
function renderTransactionResults() {
  const monthFilter = document.getElementById("month-filter");
  const typeFilter = document.getElementById("type-filter");
  const target = document.getElementById("transaction-results");

  if (!monthFilter || !typeFilter || !target) return;

  const month = monthFilter.value;
  const type = typeFilter.value;

  let filtered = [...transactions];

  if (month) {
    filtered = filtered.filter(
      t => t.date.startsWith(month)
    );
  }

  if (type !== "all") {
    filtered = filtered.filter(
      t => t.type === type
    );
  }

  target.innerHTML = transactionTable(filtered);
}

// DELETE TRANSACTION
function handleDelete(event) {
  const button = event.target.closest("[data-delete]");

  if (!button) return;

  const id = button.dataset.delete;

  if (!confirm("Delete this transaction?")) return;

  transactions = transactions.filter(t => t.id !== id);

  if (saveTransactions()) {
    renderPage();
  }
}

// BIND PAGE EVENTS
function bindPageEvents() {
  // Add transaction form
  const form = document.getElementById("transaction-form");

  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();

      const description = document
        .getElementById("description")
        .value.trim();

      const amount = Number(
        document.getElementById("amount").value
      );

      const type = document.getElementById("type").value;
      const category = document.getElementById("category").value;
      const date = document.getElementById("date").value;

      if (
        !description ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !date
      ) {
        alert("Please enter valid transaction details.");
        return;
      }

      transactions.unshift({
        id: crypto.randomUUID(),
        description,
        amount,
        type,
        category,
        date
      });

      if (saveTransactions()) {
        alert("Transaction saved successfully!");
        window.location.href = "transactions.html";
      }
    });
  }

  // Transaction filters
  const monthFilter = document.getElementById("month-filter");
  const typeFilter = document.getElementById("type-filter");

  if (monthFilter && typeFilter) {
    monthFilter.addEventListener(
      "change",
      renderTransactionResults
    );

    typeFilter.addEventListener(
      "change",
      renderTransactionResults
    );

    renderTransactionResults();
  }

  // Budget form
  const budgetForm = document.getElementById("budget-form");

  if (budgetForm) {
    budgetForm.addEventListener("submit", event => {
      event.preventDefault();

      const amount = Number(
        document.getElementById("budget-amount").value
      );

      if (!Number.isFinite(amount) || amount < 0) {
        alert("Please enter a valid budget.");
        return;
      }

      monthlyBudget = amount;

      if (saveBudget()) {
        alert("Monthly budget saved!");
        renderPage();
      }
    });
  }
}

// RENDER CURRENT PAGE
function renderPage() {
  if (!app) return;

  const renderers = {
    dashboard: dashboardPage,
    add: addPage,
    transactions: transactionsPage,
    analytics: analyticsPage,
    budget: budgetPage
  };

  app.innerHTML = (
    renderers[page] || dashboardPage
  )();

  bindPageEvents();

  if (page === "analytics") {
    renderAnalyticsCharts();
  }
}

// Event delegation: Delete works even after filtering
document.addEventListener("click", handleDelete);

// Start application
renderPage();
