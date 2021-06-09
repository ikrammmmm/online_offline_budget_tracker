let database;
const request = indexedDB.open("budget-tracker", 1);

function saveRecord(transaction) 
{
  const transaction = database.transaction(["pending-transaction"], "readwrite");
  const store = transaction.objectStore("pending-transaction");
  store.add(transaction);
}

function checkLocalDB() {
  const transaction = database.transaction(["pending-transaction"], "readwrite");
  const store = transaction.objectStore("pending-transaction");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    var result  = getAll.result
    if (result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      }).then(response => response.json()).then(() => {
          const transaction = database.transaction(["pending-transaction"], "readwrite");
          const store = transaction.objectStore("pending-transaction");
          store.clear();
        });
    }
  };
}

request.onupgradeneeded =  (event) =>{
  const database = event.target.result;
  database.createObjectStore("pending-transaction", { autoIncrement: true });
};

request.onsuccess =  (event) =>
{
  database = event.target.result;
  if (navigator.onLine) {
    checkLocalDB();
  }
}

request.onerror =  (event) => {
  console.log("Error : " + event.target.errorCode);
};



// listen for app coming back online
window.addEventListener("online", checkLocalDB);