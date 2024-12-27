const tableBody = document.getElementById("entry-table");
const form = document.getElementById("myForm");
const addButton = document.getElementById("openPopup");
const cancelButton = document.getElementById("closePopup");
const popupWrapepr = document.getElementById("popup-wrapper");

var data = [];
var totalIncome = 0;
var totalExpense = 0;
var balance = 0;

function showPopUp() {
  popupWrapepr.style.display = "flex";
}

function hidePopUp() {
  popupWrapepr.style.display = "none";
  resetForm();
}

addButton.addEventListener("click", () => {
  form.setAttribute("data-form-mode", "add");
  showPopUp();
});

cancelButton.addEventListener("click", hidePopUp);

// to add entries to table
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
            <button class="edit-btn text-blue-400 hover:text-blue-500" data-id="${entry.id}">Edit</button>
            <button class="delete-btn text-red-400 hover:text-red-500" data-id="${entry.id}">Delete</button>
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

  // Add click funtion to Edit buttons
  const editButtons = document.querySelectorAll(".edit-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const entryId = e.target.getAttribute("data-id");

      form.setAttribute("data-form-mode", "edit");
      form.setAttribute("data-id", entryId);

      const entryToEdit = entries.find((entry) => entry.id === entryId);
      populateFormForEdit(entryToEdit);
      showPopUp();
    });
  });

  // to delete entry
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const entryId = e.target.getAttribute("data-id");
      deleteData(entryId);
    });
  });
}

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

// calculate ratio
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

// get data
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

// Post data
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

    form.reset();
    getData();
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
}

// edit entry
async function updateData(id, data) {
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
    getData();

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
}

// Delete  entry
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

    getData();
  } catch (error) {
    console.error("Error deleting data:", error);
  }
}

// Reset all
function resetForm() {
  form.reset();
  form.removeAttribute("data-mode");
  form.removeAttribute("data-id");
}

// Handle form add edit
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

  if (form.getAttribute("data-form-mode") === "edit") {
    const entryId = form.getAttribute("data-id");
    updateData(entryId, addData);
  } else {
    postData(addData);
  }

  resetForm();
  hidePopUp();
});

getData();
