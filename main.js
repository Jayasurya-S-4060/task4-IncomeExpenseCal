// Variables
const tableBody = document.getElementById("entry-table");
const form = document.getElementById("myForm");
const addButton = document.getElementById("openPopup");
const cancelButton = document.getElementById("closePopup");
const popupWrapepr = document.getElementById("popup-wrapper");

var data = [];
var totalIncome = 0;
var totalExpense = 0;
var balance = 0;

// Show pop-up form
function showPopUp() {
  popupWrapepr.style.display = "flex"; // Show the pop-up form
}

// Hide pop-up form
function hidePopUp() {
  popupWrapepr.style.display = "none"; // Hide the pop-up form
}

addButton.addEventListener("click", showPopUp);

cancelButton.addEventListener("click", hidePopUp);

// Populate table with entries
function populateTable(entries, type = "all") {
  tableBody.innerHTML = "";

  let filteredData =
    type === "all"
      ? entries
      : entries.filter((e) => e.type.toLowerCase() === type);

  filteredData.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${entry.description}</td>
          <td>${entry.type}</td>
          <td>${entry.amount}</td>
          <td>
            <button class="edit-btn" data-id="${entry.id}">Edit</button>
            <button class="delete-btn" data-id="${entry.id}">Delete</button>
          </td>
        `;
    tableBody.appendChild(row);
  });

  const filterRadios = document.querySelectorAll('input[name="filter"]');

  filterRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      const selectedValue = this.value;
      populateTable(data, selectedValue);
    });
  });

  document.getElementById("filters");

  // Add event listeners to Edit buttons
  const editButtons = document.querySelectorAll(".edit-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const entryId = e.target.getAttribute("data-id");
      const entryToEdit = entries.find((entry) => entry.id === entryId);
      console.log(entryToEdit, "entryToEdit");
      populateFormForEdit(entryToEdit);
      showPopUp();
    });
  });

  // Add event listeners to Delete buttons
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const entryId = e.target.getAttribute("data-id");
      deleteData(entryId); // Delete the entry
    });
  });
}

// Populate form with data for editing
function populateFormForEdit(entry) {
  const descriptionInput = form.querySelector('input[name="description"]');
  const amountInput = form.querySelector('input[name="amount"]');
  const typeInput = form.querySelector(
    `input[name="type"][value="${entry.type}"]`
  );

  descriptionInput.value = entry.description;
  amountInput.value = entry.amount;
  typeInput.checked = true;
}

// Calculate totals and balance
function calculateRatio(entries) {
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;

  entries.forEach((e) => {
    if (e.type.toLowerCase() === "expense") {
      totalExpense += e.amount;
      balance -= e.amount;
    } else if (e.type.toLowerCase() === "income") {
      totalIncome += e.amount;
      balance += e.amount;
    }
  });

  let income = document.getElementById("totalIncome");
  let expense = document.getElementById("totalExpense");
  let balanceElem = document.getElementById("netBalance");

  income.innerHTML = totalIncome;
  expense.innerHTML = totalExpense;
  balanceElem.innerHTML = balance;
}

// Fetch data from the API
async function getData() {
  try {
    const response = await fetch(
      "https://67697dcd863eaa5ac0dbd3d4.mockapi.io/incomeExpense/entries"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const fetchData = await response.json();
    data = fetchData;
    populateTable(fetchData, "all");
    calculateRatio(fetchData);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Post new data to the API
async function postData(data) {
  try {
    const response = await fetch(
      "https://67697dcd863eaa5ac0dbd3d4.mockapi.io/incomeExpense/entries",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    getData();
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
}

// Update existing entry
async function updateData(id, data) {
  console.log(id, "currebt");
  try {
    const response = await fetch(
      `https://67697dcd863eaa5ac0dbd3d4.mockapi.io/incomeExpense/entries/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    deleteData(id);
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
}

// Delete an entry
async function deleteData(id) {
  try {
    const response = await fetch(
      `https://67697dcd863eaa5ac0dbd3d4.mockapi.io/incomeExpense/entries/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    getData(); // Refresh the data after deletion
  } catch (error) {
    console.error("Error deleting data:", error);
  }
}

// Handle form submission (Add or Edit)
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const type = form.querySelector('input[name="type"]:checked').value;
  const description = form.description.value;
  const amount = form.amount.value;

  const addData = {
    type,
    description,
    amount: parseInt(amount),
  };

  if (form.dataset.mode === "edit") {
    const entryId = form.dataset.id;
    updateData(entryId, addData); // Update existing entry
  } else {
    postData(addData); // Add new entry
  }

  hidePopUp(); // Hide pop-up after submitting
});

// Initialize app by fetching data
getData();
