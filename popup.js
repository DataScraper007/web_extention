// document.getElementById("submitName").addEventListener("click", () => {
//     const name = document.getElementById("nameInput").value;
//     if (name) {
//       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         chrome.scripting.executeScript({
//           target: { tabId: tabs[0].id },
//           // function: displayCenterName,
// function: displayXpathValues,
//           args: [name]
//         });
//       });
//     }
//   });

// function displayCenterName(name) {
//   const nameElement = document.createElement("div");
//   nameElement.textContent = name;
//   nameElement.id = "name-display";

//   // Apply basic styling
//   Object.assign(nameElement.style, {
//     position: "fixed",
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//     color: "white",
//     padding: "20px",
//     borderRadius: "8px",
//     fontSize: "2em",
//     zIndex: "1000"
//   });

//   // Remove any existing name display to prevent duplicates
//   document.getElementById("name-display")?.remove();

//   // Append the element to the body
//   document.body.appendChild(nameElement);
// }


// document.getElementById("submitName").addEventListener("click", () => {
//   const name = document.getElementById("nameInput").value;
//   if (name) {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       chrome.scripting.executeScript({
//         target: { tabId: tabs[0].id },
//         function: displayXpathValues,
//         args: [name],
//       }, (result) => {
//         // Display the result in the popup after script execution
//         if (result && result[0] && result[0].result) {
//           const output = result[0].result;
//           document.getElementById('result').innerHTML = output.join('<br>');
//         } else {
//           document.getElementById('result').innerHTML = 'No results found.';
//         }
//       });
//     });
//   }
// });

// function displayXpathValues(name) {
//   const xpathExpression = name;
//   const result = [];
//   const nodes = document.evaluate(xpathExpression, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

//   // Loop through the result and push each node's text content to the result array
//   for (let i = 0; i < nodes.snapshotLength; i++) {
//     result.push(nodes.snapshotItem(i).textContent.trim());
//   }
//   return result;  // Return the result to the popup
// }


document.getElementById("submitName").addEventListener("click", () => {
    // Get the JSON string from the input field
    const jsonString = document.getElementById("nameInput").value;
    try {
      // Parse the JSON string into an actual object
      const xPaths = JSON.parse(jsonString);
      // Check if the parsed object is a valid object
      if (typeof xPaths === 'object' && xPaths !== null) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: extractXpathValues,
            args: [xPaths]  // Pass the parsed JSON object to the content script
          }, (result) => {
            // Display the result in the popup after script execution
            if (result && result[0] && result[0].result) {
              document.getElementById('result').innerHTML = JSON.stringify(result[0].result);
              const results = result[0].result
              const maxLength = Math.max(...Object.values(results).map(arr => arr.length));
  
              // Initialize an empty array to hold the rows of data
              const data = [];
  
              // Iterate over the maximum length and create rows for the Excel file
              for (let i = 0; i < maxLength; i++) {
                const row = {};
  
                // Iterate over each key in the JSON object
                for (const key in results) {
                  // If the key exists in the current row, use the value; otherwise, use an empty string
                  row[key] = results[key][i] || '';
                }
  
                // Add the row to the data array
                data.push(row);
              }
  
              // Create an Excel worksheet from the data
              const ws = XLSX.utils.json_to_sheet(data);
  
              // Create a new workbook and append the worksheet
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Results');
  
              // Trigger the download of the Excel file
              XLSX.writeFile(wb, 'results.xlsx');
            } else {
              document.getElementById('result').innerHTML = '';
            }
          });
        });
      } else {
        document.getElementById('result').innerHTML = 'Invalid JSON format.';
      }
    } catch (e) {
      document.getElementById('result').innerHTML = 'Invalid JSON format.';
    }
  });
  
  // Content script function to extract values based on provided JSON of XPaths
  function extractXpathValues(xPaths) {
    const results = {};
  
    // Iterate over each key-value pair in the JSON
    for (const key in xPaths) {
      const xpathExpression = xPaths[key];
      const result = [];
      const nodes = document.evaluate(xpathExpression, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  
      // Collect all matched nodes' text content into an array
      for (let i = 0; i < nodes.snapshotLength; i++) {
        result.push(nodes.snapshotItem(i).textContent.trim());
      }
  
      // Store the result in the results object
      results[key] = result.length > 0 ? result : ["No matching elements"];
    }
  
    return results;  // Return the collected results to the popup
  }
  
  
