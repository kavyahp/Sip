// Initialize chart
let investmentChart;

// DOM Elements
const monthlySIPInput = document.getElementById('monthlySIP');
const durationInput = document.getElementById('duration');
const returnRateInput = document.getElementById('returnRate');
const calculateBtn = document.getElementById('calculateBtn');
const totalInvestmentEl = document.getElementById('totalInvestment');
const expectedReturnsEl = document.getElementById('expectedReturns');
const totalValueEl = document.getElementById('totalValue');

// Format currency to Indian Rupees
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
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
                    '#4299e1',
                    '#48bb78'
                ],
                borderColor: [
                    '#3182ce',
                    '#38a169'
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
                            size: 14
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
                    }
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

// Real-time updates on input change
[monthlySIPInput, durationInput, returnRateInput].forEach(input => {
    input.addEventListener('input', handleCalculation);
});

// Initial calculation
handleCalculation(); 