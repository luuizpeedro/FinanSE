// Manipulação do cartão
const cardNumberInput = document.getElementById("cardNumberInput");
const cardHolderInput = document.getElementById("cardHolderInput");
const cardExpiryInput = document.getElementById("cardExpiryInput");
const cardCvcInput = document.getElementById("cardCvcInput");

const cardNumberDisplay = document.getElementById("cardNumberDisplay");
const cardHolderDisplay = document.getElementById("cardHolderDisplay");
const cardExpiryDisplay = document.getElementById("cardExpiryDisplay");
const cardCvcDisplay = document.getElementById("cardCvcDisplay");

function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

cardNumberInput.addEventListener("input", () => {
  let formatted = formatCardNumber(cardNumberInput.value);
  cardNumberInput.value = formatted;
  cardNumberDisplay.textContent = formatted || "#### #### #### ####";
});

cardHolderInput.addEventListener("input", () => {
  cardHolderDisplay.textContent =
    cardHolderInput.value.toUpperCase() || "NOME DO TITULAR";
});

cardExpiryInput.addEventListener("input", () => {
  let val = cardExpiryInput.value;

  if (val.length === 2 && !val.includes("/")) {
    val += "/";
    cardExpiryInput.value = val;
  }

  cardExpiryInput.value = val.replace(/[^0-9\/]/g, "");
  cardExpiryDisplay.textContent = cardExpiryInput.value || "MM/AA";
});

cardCvcInput.addEventListener("input", () => {
  cardCvcInput.value = cardCvcInput.value.replace(/\D/g, "");
  cardCvcDisplay.textContent = cardCvcInput.value || "###";
});
