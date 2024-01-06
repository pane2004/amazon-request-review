const INTERVALBEFOREREQUEST = 14;

let validReviewRequests = 0;
let invalidReviewRequests = 0;

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
      //console.log(diffDays);
      return diffDays >= INTERVALBEFOREREQUEST;
    }
  }
  return false;
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
    validReviewRequests++;
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          action: "openNewTabOrder",
          url: orderLink.firstChild.href,
        },
        () => {
          resolve();
        }
      );
    });
  } else {
    invalidReviewRequests++;
  }
}

async function processTable(tbody) {
  if (tbody) {
    //let i = 0;
    // console.log(tbody);
    for (const tr of tbody.querySelectorAll("tr")) {
      //i++;
      await processRow(tr);
      //if (i > 5) break;
    }
  }
}

function createButton() {
  let newButton = document.createElement("span");
  newButton.innerHTML = `
      <span class="a-button-inner">
          <input class="a-button-input" type="button" value="Run Review Script">
          <span class="a-button-text">Request All Reviews</span>
      </span>`;
  newButton.className = "a-button";
  newButton.style.backgroundColor = "#F05B42";

  newButton.addEventListener("click", () => {
    validReviewRequests = 0;
    invalidReviewRequests = 0;
    // script portion
    processTable(document.querySelector("#orders-table tbody")).then(() => {
      // now that all reviews have been processed, inject action report under the order buttons
      let reportTable = document.createElement("table");
      reportTable.innerHTML = `
      <ul>
        <li><strong>Bulk Review Request Complete ✅</strong>
            <ul>
                <li><strong>Review Requests Processed:</strong> ${validReviewRequests}</li>
                <li><strong>Review Requests Skipped:</strong> ${invalidReviewRequests}</li>
            </ul>
        </li>
      </ul>
      `;
      reportTable.id = "inserted-report-chrome-tool";
      let appendTarget = document.querySelector("#inserted-report-chrome-tool");
      if (!appendTarget) {
        appendTarget = document.querySelector("#myo-sorting-bar");
        appendTarget.appendChild(reportTable);
      } else {
        appendTarget.replaceWith(reportTable);
      }
    });
  });

  return newButton;
}

function insertButton() {
  let targetDiv = document.querySelector("div.push-right");
  if (targetDiv) {
    targetDiv.appendChild(createButton());
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", insertButton);
} else {
  insertButton();
}
