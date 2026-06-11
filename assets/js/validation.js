document.addEventListener('DOMContentLoaded', function () {
const form = document.querySelector('form');
            
form.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopPropagation();
                
    let isValid = true;
    const errorSummary = document.querySelector('[data-error-summary]');
                
    // 1. NAME VALIDATION
    const nameInput = document.getElementById('inputName3');
    const nameError = document.querySelector('[data-error-for="name"]');
    if (nameInput.value.trim().length < 3) {
        showError(nameInput, nameError, 'the name must be 3 characters at least');
        isValid = false;
    } else {
        clearError(nameInput, nameError);
    }

// 2. EMAIL VALIDATION
    const emailInput = document.getElementById('inputEmail3');
    const emailError = document.querySelector('[data-error-for="email"]');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        showError(emailInput, emailError, 'please enter a valid email');
        isValid = false;
    } else {
        clearError(emailInput, emailError);
    }

// 3. MESSAGE VALIDATION
const messageInput = document.getElementById('exampleFormControlTextarea1');
const messageError = document.querySelector('[data-error-for="message"]');
if (messageInput.value.trim() === '') {
    showError(messageInput, messageError, 'please write your message here');
    isValid = false;
} else if (messageInput.value.trim().length < 10) {
    showError(messageInput, messageError, 'the message must contain 10 characters at least');
    isValid = false;
} else {
    clearError(messageInput, messageError);
}


if (!isValid) {
form.classList.add('was-validated');
errorSummary.textContent = ' correct the errors above before submitting';
errorSummary.style.display = 'block';
} else {
    errorSummary.style.display = 'none';
    alert('Sent successfully');
    form.reset();
    form.classList.remove('was-validated');     
    nameInput.classList.remove('is-valid');
    emailInput.classList.remove('is-valid');
    messageInput.classList.remove('is-valid');
}
});

function showError(input, errorElement, message) {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearError(input, errorElement) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}
});