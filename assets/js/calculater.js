const display = document.getElementById('display');
const errorBox = document.getElementById('errorBox');
let shouldResetDisplay = false;

// 1. HARDLOCK KEYBOARD TEXT ENTRY
document.addEventListener('keydown', function(event) {
    event.preventDefault(); 
    
    const allowedNumbers = ['0','1','2','3','4','5','6','7','8','9'];
    const allowedOperators = ['+', '-', '*', '/'];
    
    if (allowedNumbers.includes(event.key)) {
        appendNumber(event.key);
    } else if (allowedOperators.includes(event.key)) {
        appendOperator(event.key);
    } else if (event.key === '.') {
        appendDecimal();
    } else if (event.key === '%') {
        applyPercentage();
    } else if (event.key === 'Enter' || event.key === '=') {
        calculate();
    } else if (event.key === 'Backspace') {
        backspace();
    } else if (event.key === 'Escape') {
        clearDisplay();
    }
});

//UI Error HelperS
function showError(message) {
    if (errorBox) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
    }
}

function clearError() {
    if (errorBox) {
        errorBox.textContent = '';
        errorBox.style.display = 'none';
    }
}


// Number & Operator Ingestion Inputs

function appendNumber(number) {
    clearError();
    if (display.value === '0' || display.value === 'Error' || shouldResetDisplay) {
        display.value = number;
        shouldResetDisplay = false;
    } else {
        display.value += number;
    }
}

function appendOperator(operator) {
    clearError();
    if (display.value === 'Error') return;
    
    shouldResetDisplay = false;
    const lastChar = display.value.slice(-1);
    
    // Prevent stacking consecutive mathematical operators by replacing the last one
    if (['+', '-', '*', '/'].includes(lastChar)) {
        display.value = display.value.slice(0, -1) + operator;
    } else {
        display.value += operator;
    }
}

function appendDecimal() {
    clearError();
    if (display.value === 'Error' || shouldResetDisplay) {
        display.value = '0.';
        shouldResetDisplay = false;
        return;
    }

    // Split by arithmetic blocks to confirm decimal availability for the current active sub-string
    const parts = display.value.split(/[\+\-\*\/]/);
    const currentNumber = parts[parts.length - 1];

    if (!currentNumber.includes('.')) {
        display.value += '.';
    } else {
        showError("Input Error: Number already contains a decimal point.");
    }
}


// Utility Actions

function backspace() {
    clearError();
    if (display.value === 'Error' || shouldResetDisplay || display.value.length <= 1) {
        display.value = '0';
        shouldResetDisplay = false;
    } else {
        display.value = display.value.slice(0, -1);
    }
}

function toggleSign() {
    clearError();
    if (display.value === '0' || display.value === 'Error') return;

    const parts = display.value.split(/([\+\-\*\/])/);
    let lastPart = parts[parts.length - 1];

    if (!lastPart || isNaN(lastPart) && lastPart !== '.') return;

    if (parts.length === 1) {
        // Simple single number inversion
        display.value = (parseFloat(display.value) * -1).toString();
    } else {
        // Advanced segment inversion for compound math lines
        if (parts[parts.length - 2] === '-') {
            parts[parts.length - 2] = '+';
        } else if (parts[parts.length - 2] === '+') {
            parts[parts.length - 2] = '-';
        } else {
            parts[parts.length - 1] = `(-${lastPart})`;
        }
        display.value = parts.join('');
    }
}

function applyPercentage() {
    clearError();
    if (display.value === 'Error' || display.value === '0') return;

    try {
        const parts = display.value.split(/([\+\-\*\/])/);
        let targetNumStr = parts[parts.length - 1];

        if (!targetNumStr || isNaN(targetNumStr)) {
            throw new Error("Invalid Placement");
        }

        // Convert trailing block into hundredths decimal form
        const percentVal = (parseFloat(targetNumStr) / 100).toString();
        parts[parts.length - 1] = percentVal;
        display.value = parts.join('');
    } catch (err) {
        showError("Math Error: Percentage cannot follow an operator.");
    }
}

function clearDisplay() {
    display.value = '0';
    shouldResetDisplay = false;
    clearError();
}


 // Core Math Engine Evaluation
function calculate() {
    clearError();
    if (display.value === 'Error') return;

    try {
        let expression = display.value;
        
        // Cleanup hanging trailing operators before running evaluations
        const lastChar = expression.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
            expression = expression.slice(0, -1);
        }

        // Safety Block: Explicit Division by Zero interceptor
        if (expression.includes('/0')) {
            throw new Error("DivisionByZero");
        }

        // Clean computing context using an encapsulated Function object evaluation mechanism
        const result = new Function(`return (${expression})`)();
        
        if (result === undefined || isNaN(result) || !isFinite(result)) {
            throw new Error("InvalidExpression");
        }

        // Truncate floating-point rounding abnormalities safely to 12 digits max
        display.value = Number(result.toPrecision(12)).toString();
        shouldResetDisplay = true;

    } catch (error) {
        if (error.message === "DivisionByZero") {
            showError("Calculation Error: Cannot divide a number by zero.");
        } else {
            showError("Syntax Error: Check expression format.");
        }
        display.value = 'Error';
        shouldResetDisplay = true;
    }
}
