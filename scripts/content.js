const INTERVALBEFOREREQUEST = 14;

// Function to check if within parsing date range
function validDate(dateDiv) {
  if (dateDiv) {
    const dateString = dateDiv.textContent.trim();
    const extractedDate = new Date(dateString);

    // Check if the date parsing was successful
    if (!isNaN(extractedDate.getTime())) {
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate - extractedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log(diffDays);
      return diffDays >= INTERVALBEFOREREQUEST;
    }
  }
  return false;
}

async function processTable(tbody) {
  if (tbody) {
    //let i = 0;
    for (const tr of tbody.querySelectorAll("tr")) {
      //i++;
      await processRow(tr); // Wait for each row to be processed before moving to the next
      //if(i > 20) break;
    }
  }
}

async function processRow(tr) {
  const orderDate = tr.querySelector(
    "td:nth-child(2) .cell-body div:nth-child(2) div"
  );
  const orderLink = tr.querySelector("td:nth-child(3) .cell-body-title");
  const orderRefunded = tr.querySelector(
    "td:nth-child(8) .secondary-status.refund-is-applied"
  );

  if (
    orderLink &&
    orderLink.firstChild.textContent.length > 5 &&
    validDate(orderDate) &&
    !orderRefunded
  ) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          action: "openNewTabOrder",
          url: orderLink.firstChild.href,
        },
        () => {
          resolve(); // Resolve the promise once the message is sent
        }
      );
    });
  }
}

// Function to create and style the new button
function createButton() {
  let newButton = document.createElement("span");
  newButton.innerHTML = `
      <span class="a-button-inner">
          <input class="a-button-input" type="button" value="Run Review Script">
          <span class="a-button-text">Request All Reviews</span>
      </span>`;
  newButton.className = "a-button";
  newButton.style.backgroundColor = "#F05B42";

  // Add event listener for your script
  newButton.addEventListener("click", () => {
    console.log("New button clicked");

    // script portion
    processTable(document.querySelector("tbody"));
  });

  return newButton;
}

// Function to insert the new button
function insertButton() {
  let targetDiv = document.querySelector("div.push-right");
  if (targetDiv) {
    targetDiv.appendChild(createButton()); // Append the new button to the div
  }
}

// Execute the insertion function when the DOM is fully loaded
if (document.readyState === "loading") {
  // Loading hasn't finished yet
  document.addEventListener("DOMContentLoaded", insertButton);
} else {
  // `DOMContentLoaded` has already fired
  insertButton();
}
