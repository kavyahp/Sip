// Theme handling
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Initialize chart
let investmentChart;

// DOM Elements
const monthlySIPInput = document.getElementById('monthlySIP');
const durationInput = document.getElementById('duration');
const returnRateInput = document.getElementById('returnRate');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const totalInvestmentEl = document.getElementById('totalInvestment');
const expectedReturnsEl = document.getElementById('expectedReturns');
const totalValueEl = document.getElementById('totalValue');

// Default values
const defaultValues = {
  monthlySIP: 5000,
  duration: 10,
  returnRate: 12
};

// Format currency to Indian Rupees
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// Reset calculator
const resetCalculator = () => {
    // Reset input fields to default values
    monthlySIPInput.value = defaultValues.monthlySIP;
    durationInput.value = defaultValues.duration;
    returnRateInput.value = defaultValues.returnRate;

    // Reset results
    totalInvestmentEl.textContent = formatCurrency(0);
    expectedReturnsEl.textContent = formatCurrency(0);
    totalValueEl.textContent = formatCurrency(0);

    // Reset chart
    if (investmentChart) {
        investmentChart.destroy();
        investmentChart = null;
    }

    // Recalculate with default values
    handleCalculation();
};

// Calculate SIP returns
const calculateSIP = (monthlyAmount, years, annualReturn) => {
    const monthlyRate = annualReturn / 12 / 100;
    const months = years * 12;
    const totalInvestment = monthlyAmount * months;
    
    // Future value of SIP formula
    const futureValue = monthlyAmount * 
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
        (1 + monthlyRate);
    
    const expectedReturns = futureValue - totalInvestment;
    
    return {
        totalInvestment,
        expectedReturns,
        futureValue
    };
};

// Update chart with new data
const updateChart = (results) => {
    const { totalInvestment, expectedReturns } = results;
    const isDarkMode = body.getAttribute('data-theme') === 'dark';
    
    if (investmentChart) {
        investmentChart.destroy();
    }
    
    const ctx = document.getElementById('investmentChart').getContext('2d');
    investmentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Total Investment', 'Expected Returns'],
            datasets: [{
                data: [totalInvestment, expectedReturns],
                backgroundColor: [
                    isDarkMode ? '#63b3ed' : '#4299e1',
                    isDarkMode ? '#48bb78' : '#48bb78'
                ],
                borderColor: [
                    isDarkMode ? '#4299e1' : '#3182ce',
                    isDarkMode ? '#38a169' : '#38a169'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            color: isDarkMode ? '#cbd5e0' : '#4a5568'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    },
                    backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
                    titleColor: isDarkMode ? '#f7fafc' : '#2d3748',
                    bodyColor: isDarkMode ? '#cbd5e0' : '#4a5568'
                }
            },
            cutout: '60%'
        }
    });
};

// Update results display
const updateResults = (results) => {
    totalInvestmentEl.textContent = formatCurrency(results.totalInvestment);
    expectedReturnsEl.textContent = formatCurrency(results.expectedReturns);
    totalValueEl.textContent = formatCurrency(results.futureValue);
};

// Handle calculation
const handleCalculation = () => {
    const monthlyAmount = parseFloat(monthlySIPInput.value);
    const years = parseFloat(durationInput.value);
    const annualReturn = parseFloat(returnRateInput.value);
    
    if (isNaN(monthlyAmount) || isNaN(years) || isNaN(annualReturn)) {
        alert('Please enter valid numbers for all fields');
        return;
    }
    
    const results = calculateSIP(monthlyAmount, years, annualReturn);
    updateChart(results);
    updateResults(results);
};

// Event Listeners
calculateBtn.addEventListener('click', handleCalculation);
resetBtn.addEventListener('click', resetCalculator);

// Real-time updates on input change
[monthlySIPInput, durationInput, returnRateInput].forEach(input => {
    input.addEventListener('input', handleCalculation);
});

// Initial calculation
handleCalculation(); 