let database;
const databaseRequest = indexedDB.open("budget-tracker", 1);
function saveRecord(record) 
{
  var transaction = database.transaction(["pending-transaction"], "readwrite");
  var transactionStore = transaction.objectStore("pending-transaction");
  transactionStore.add(record);
}

function checkLocalDB() {
  var transaction = database.transaction(["pending-transaction"], "readwrite");
  var transactionStore = transaction.objectStore("pending-transaction");
  var getAll = transactionStore.getAll();

  getAll.onsuccess = function () {
    var result  = getAll.result
    if (result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }}).then(response => response.json()).then(() => {
          const transaction = database.transaction(["pending-transaction"], "readwrite");
          const transactionStore = transaction.objectStore("pending-transaction");
          transactionStore.clear();
        });
    }
  };
}

databaseRequest.onupgradeneeded =  (event) =>{
  const database = event.target.result;
  database.createObjectStore("pending-transaction", { autoIncrement: true });
};

databaseRequest.onsuccess =  (event) =>
{
  database = event.target.result;
  if (navigator.onLine) {
    checkLocalDB();
  }
}

databaseRequest.onerror =  (event) =>{
  console.log("Error! " + event.target.errorCode);
};



// listen for app coming back online
window.addEventListener("online", checkLocalDB);