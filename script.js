// numbers = [ Bill, Tip, GuestNumber, TipAmount, Total]
const numbers = [0, 0, 0, 0, 0];
const priceInput = document.getElementById('price_input');
const tipInput = document.querySelectorAll('input[type="radio"]');
const customTipInput = document.getElementById('input_custom');
const guestNumberInput = document.getElementById('guest_number_input');
const tipAmountDisplay = document.getElementById('tip_amount');
const TotalAmountDisplay = document.getElementById('bill_total');
const form = document.getElementsByTagName('form');
const errorNotice = document.getElementsByTagName('span'); //Bill, People
const btn_reset = document.getElementById('btn_reset');
const defaultTip = document.getElementById('btn_p5');

const maxBillValue = 10000000;
const maxCustomTipValue = 1000;
const maxNumberOfPeople = 100;

function onPageLoad() {
    for (let i = 0; i < tipInput.length; i++) {
        tipInput[i].addEventListener('change', onRadioChanged);
        tipInput[i].setAttribute('tabindex', 0);
    }

    selectRadioButton(defaultTip, false);
    priceInput.addEventListener('input', onBillValueChanged);
    customTipInput.addEventListener('input', onCustomTipChanged);
    guestNumberInput.addEventListener('input', onGuestNumberChanged);
    btn_reset.addEventListener('click', onResetButtonClick);

    form[0].addEventListener('submit', function(event) {
        event.preventDefault();
    });

    form[0].addEventListener('keydown', function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const focusElements = Array.from(form[0].querySelectorAll('input, select, textarea, button, [tabindex]'));
            const eventIndex = focusElements.indexOf(event.target);

            if (eventIndex >=0 && eventIndex < focusElements.length - 1) {
                focusElements[eventIndex+1].focus();
            }
        }
    });

    let inputElements = [priceInput, customTipInput, guestNumberInput];

    for (i = 0; i < inputElements.length; i++) {
        inputElements[i].addEventListener('keydown', handleCustomKeydown);
    }
}

onPageLoad();

function removeSelection(selectDefault) {
    for (let i = 0; i < tipInput.length; i++) {
        if (tipInput[i].closest('div').classList.contains('selected')) {
            tipInput[i].closest('div').classList.remove('selected');
            tipInput[i].checked = false;
            if (selectDefault) { numbers[1] = defaultTip; }
            break;
        }
    }
}

function selectRadioButton(selected, remove) {
    if (remove) { removeSelection(true); }

    numbers[1] = Number(selected.value);
    selected.checked = true;
    selected.closest('div').classList.add('selected');
}

function handleCustomKeydown(event) {
    const isDigit = /[0-9]/.test(event.key);
    const isDot = event.key === ".";
    const isArrowKey = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key);
    const isModifier = ["Backspace", "Tab"].includes(event.key);
    const isBannedModifier = ["Control", "Alt", "AltGraph", "Shift", "Meta"].includes(event.key);
    const isNumpadDigit = (event.key >= '0' && event.key <='9') && (event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD);

    if (isBannedModifier) { //This is here because of Google Chrome, but it didn't help.
        event.preventDefault();
        return;
    }

    if (event.target == guestNumberInput) {
        if (!isDigit && !isArrowKey && !isModifier && !isNumpadDigit) {
            event.preventDefault();
        }
    }
    else {
        if (!isDigit && !isDot && !isArrowKey && !isModifier && !isNumpadDigit) {
            event.preventDefault();
           }

           if (isDot && event.target.value === "" || isDot && event.target.value.includes('.')) {
            event.preventDefault();
        }
    }
}

function isBelowMaxValue(target, maxValue) {
    if (Number(target.value) > 0) {
        if (Number(target.value) < maxValue) {
            return Number(target.value);
        }
        else {
            target.value = maxValue - 1;
            return maxValue - 1;
        }
    }
    else {
        /*Checking for a value greater than 0, and this line is here because
        Google Chrome somehow bypassed everything after pressing AltGr + any number key
        staging a special character, and then the next input let trough even letters.*/
        target.value = "";
        return 0;
    }
}

function onBillValueChanged() {
    if (priceInput.value !== "") {
        if (priceInput.value == 0) {
            showZeroInputError(priceInput);
        }
        else {
            if (priceInput.classList.contains('show-error')) {
                removeZeroInputError(priceInput);
            }
            numbers[0] = isBelowMaxValue(priceInput, maxBillValue);
            handleDisplayValues();
        }
    }
    else {
        removeZeroInputError(priceInput);
    }
}

function onRadioChanged() {
    selectRadioButton(this, true);
    if (customTipInput.value !== "") { customTipInput.value = ""; }
    handleDisplayValues();
}

function onCustomTipChanged() {
    if (customTipInput.value !== "" && customTipInput.value >= 0) {
        numbers[1] = roundToTwoDecimals(isBelowMaxValue(customTipInput, maxCustomTipValue));
        removeSelection(false);
        handleDisplayValues();
    }
}

function onGuestNumberChanged() {
    if (guestNumberInput.value !== "") {
        if (guestNumberInput.value == 0) {
            showZeroInputError(guestNumberInput);
        }
        else {
            if (guestNumberInput.classList.contains('show-error')) {
                removeZeroInputError(guestNumberInput);
            }
            numbers[2] = isBelowMaxValue(guestNumberInput,maxNumberOfPeople);
            handleDisplayValues();
        }
    }
    else {
        removeZeroInputError(guestNumberInput);
    }
}

function showZeroInputError(target) {
    switch (target) {
        case priceInput:
            errorNotice[0].classList.remove('hidden');
            priceInput.classList.add('show-error');
            break;
        case guestNumberInput:
            errorNotice[1].classList.remove('hidden'); 
            guestNumberInput.classList.add('show-error');
            break;
    }
}

function removeZeroInputError(target) {
    switch (target) {
        case priceInput:
            errorNotice[0].classList.add('hidden');
            priceInput.classList.remove('show-error');
            break;
        case guestNumberInput:
            errorNotice[1].classList.add('hidden');
            guestNumberInput.classList.remove('show-error');
            break;
    }
}

function handleDisplayValues () {
    if (numbers[0] > 0 && numbers[2] > 0) {
        if (numbers[2] > 0) {
            numbers[3] = roundToTwoDecimals((numbers[0] * (numbers[1] / 100) / numbers[2]));
            numbers[4] = roundToTwoDecimals(((numbers[0] + (numbers[0] * (numbers[1] / 100))) / numbers[2]));
            displayValues();
        }
    }

    if (btn_reset.classList.contains('empty_state')) {
        btn_reset.classList.remove('empty_state');
    }
}

function roundToTwoDecimals(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
}

function displayValues() {
    tipAmountDisplay.textContent = `$${numbers[3]}`;
    TotalAmountDisplay.textContent = `$${numbers[4]}`;
    //maybe i'll add animation later, now i don't feel like it.
}

function onResetButtonClick() {
    if (!btn_reset.classList.contains('empty_state')) {
        form[0].reset();
        numbers.fill(0);
        btn_reset.classList.add('empty_state');
        selectRadioButton(defaultTip, true);
        tipAmountDisplay.textContent = "$0.00";
        TotalAmountDisplay.textContent = "$0.00";
    }
}
