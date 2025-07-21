import React, { useState, useEffect, useCallback, useMemo } from 'react';

/*
  This app is now self-contained and uses local state (data is reset on refresh).
  It has no external library dependencies for its core functionality.
*/

// --- Icon Components (using SVG for simplicity) ---
const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125H20.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h17.25" />
  </svg>
);

const CurrencyRupeeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c-.34-.059-.68-.114-1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const ArrowPathIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

const DocumentArrowDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

// --- Main App Component ---
function App() {
  const [people, setPeople] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [groupName, setGroupName] = useState("My Bill Split");

  const [newPersonName, setNewPersonName] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [expenseParticipants, setExpenseParticipants] = useState([]);
  
  const [settlements, setSettlements] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // --- Data Handling Functions ---
  const handleAddPerson = () => {
    if (!newPersonName.trim()) {
      setMessage({ text: "Person's name cannot be empty.", type: "warning" });
      return;
    }
    const newPerson = { id: crypto.randomUUID(), name: newPersonName.trim() };
    const updatedPeople = [...people, newPerson];
    setPeople(updatedPeople);
    
    if (people.length === 0) { 
        setPaidBy(newPerson.id);
    }
    setNewPersonName("");
    setShowPersonModal(false);
    setMessage({ text: `${newPerson.name} added successfully.`, type: "success" });
  };

  const handleDeletePerson = (personIdToDelete) => {
    const personToDelete = people.find(p => p.id === personIdToDelete);
    if (!personToDelete) return;

    const isPayer = expenses.some(expense => expense.paidBy === personIdToDelete);
    const isParticipant = expenses.some(expense => expense.participants.includes(personIdToDelete));

    if (isPayer || isParticipant) {
      setMessage({ 
        text: `${personToDelete.name} is part of existing expenses and cannot be deleted.`, 
        type: "error" 
      });
      return;
    }

    const updatedPeople = people.filter(p => p.id !== personIdToDelete);
    setPeople(updatedPeople);
    
    if (paidBy === personIdToDelete) {
        setPaidBy(updatedPeople.length > 0 ? updatedPeople[0].id : "");
    }
    setMessage({ text: `${personToDelete.name} removed.`, type: "success" });
  };

  const handleAddExpense = () => {
    if (!expenseDescription.trim() || !expenseAmount || parseFloat(expenseAmount) <= 0) {
      setMessage({ text: "Expense description and valid amount are required.", type: "warning" });
      return;
    }
    if (!paidBy) {
      setMessage({ text: "Please select who paid.", type: "warning" });
      return;
    }
    if (expenseParticipants.length === 0) {
      setMessage({ text: "Please select at least one participant.", type: "warning" });
      return;
    }

    const newExpense = {
      id: crypto.randomUUID(),
      description: expenseDescription.trim(),
      amount: parseFloat(expenseAmount),
      paidBy: paidBy,
      participants: expenseParticipants,
    };
    setExpenses(prevExpenses => [...prevExpenses, newExpense]);

    setExpenseDescription("");
    setExpenseAmount("");
    setExpenseParticipants([]);
    setShowExpenseModal(false);
    setMessage({ text: `Expense "${newExpense.description}" added.`, type: "success" });
  };

  const handleDeleteExpense = (expenseIdToDelete) => {
    setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseIdToDelete));
    setMessage({ text: "Expense removed.", type: "success" });
  };

  const toggleParticipant = (personId) => {
    setExpenseParticipants(prev =>
      prev.includes(personId) ? prev.filter(id => id !== personId) : [...prev, personId]
    );
  };

  const handleClearAllData = () => {
    setPeople([]);
    setExpenses([]);
    setSettlements([]);
    setGroupName("My Bill Split"); 
    setPaidBy(""); 
    setExpenseParticipants([]); 
    setMessage({ text: "All data has been cleared. Ready for a new split!", type: "success" });
  };

  // --- Calculations ---
  useEffect(() => {
    if (people.length === 0 || expenses.length === 0) {
      setSettlements([]);
      return;
    }

    const balances = {};
    people.forEach(p => balances[p.id] = 0);

    expenses.forEach(expense => {
      balances[expense.paidBy] += expense.amount;
      const share = expense.amount / expense.participants.length;
      expense.participants.forEach(participantId => {
        balances[participantId] -= share;
      });
    });

    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([personId, balance]) => {
      if (balance < -0.01) debtors.push({ id: personId, amount: balance });
      else if (balance > 0.01) creditors.push({ id: personId, amount: balance });
    });

    debtors.sort((a, b) => a.amount - b.amount); 
    creditors.sort((a, b) => b.amount - a.amount); 

    const newSettlements = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amountToSettle = Math.min(-debtor.amount, creditor.amount);

      if (amountToSettle > 0.01) { 
          newSettlements.push({
            from: people.find(p => p.id === debtor.id)?.name || 'Unknown',
            to: people.find(p => p.id === creditor.id)?.name || 'Unknown',
            amount: amountToSettle,
          });
      }

      debtor.amount += amountToSettle;
      creditor.amount -= amountToSettle;

      if (Math.abs(debtor.amount) < 0.01) i++;
      if (Math.abs(creditor.amount) < 0.01) j++;
    }
    setSettlements(newSettlements);
  }, [people, expenses]);

  // --- CSV Export ---
  const handleExportCSV = () => {
    if (people.length === 0 || expenses.length === 0) {
      setMessage({ text: "No data to export.", type: "warning" });
      return;
    }

    // Helper to sanitize CSV fields to handle commas and quotes
    const escapeCsvField = (field) => {
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    let csvContent = "";

    // Section 1: Expenses
    csvContent += "Expenses Summary\n";
    const expenseHeaders = ["Description", "Amount (₹)", "Paid By", "Participants"];
    csvContent += expenseHeaders.join(",") + "\n";

    expenses.forEach(exp => {
      const paidByName = people.find(p => p.id === exp.paidBy)?.name || 'N/A';
      // Use a different separator for participants to avoid CSV issues
      const participantNames = exp.participants.map(pid => people.find(p => p.id === pid)?.name).join('; ');
      const row = [
        exp.description,
        exp.amount.toFixed(2),
        paidByName,
        participantNames
      ].map(escapeCsvField).join(",");
      csvContent += row + "\n";
    });

    csvContent += "\n\n"; // Add space between sections

    // Section 2: Settlements
    csvContent += "Settlement Summary\n";
    const settlementHeaders = ["From", "To", "Amount (₹)"];
    csvContent += settlementHeaders.join(",") + "\n";

    if (settlements.length > 0) {
        settlements.forEach(s => {
            const row = [s.from, s.to, s.amount.toFixed(2)].map(escapeCsvField).join(",");
            csvContent += row + "\n";
        });
    } else {
        csvContent += "All debts are settled.\n";
    }

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { // Check for download attribute support
      const url = URL.createObjectURL(blob);
      const fileName = `${groupName.replace(/\s+/g, '_') || 'Bill_Split'}_Report.csv`;
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setMessage({ text: "CSV report downloaded.", type: "success" });
  };


  // --- Message Timeout ---
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 font-sans p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <input 
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="text-4xl md:text-5xl font-bold bg-transparent border-b-2 border-slate-700 focus:border-sky-500 outline-none text-center text-sky-400 py-2 transition-colors duration-300 w-full max-w-lg"
            placeholder="Group Name (e.g., Trip Expenses)"
          />
        </header>

        {/* Message Display */}
        {message.text && (
          <div className={`p-3 mb-6 rounded-md text-sm text-center transition-opacity duration-300 ${
            message.type === 'success' ? 'bg-green-500/20 text-green-300' : 
            message.type === 'error' ? 'bg-red-500/20 text-red-300' : 
            'bg-yellow-500/20 text-yellow-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column: People & Expenses */}
          <div className="space-y-6">
            {/* People Section */}
            <section className="bg-slate-800/70 p-6 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-sky-400">People</h2>
                <button
                  onClick={() => setShowPersonModal(true)}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                  <UserPlusIcon /> Add Person
                </button>
              </div>
              {people.length === 0 ? (
                <p className="text-slate-400">No people added yet. Click "Add Person" to start.</p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2"> 
                  {people.map(p => (
                    <li key={p.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg hover:bg-slate-600/50 transition-colors duration-200">
                      <span className="text-slate-200">{p.name}</span>
                      <button 
                        onClick={() => handleDeletePerson(p.id)}
                        className="text-red-500 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-500/20"
                        title={`Delete ${p.name}`}
                      >
                        <TrashIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Expenses Section */}
            <section className="bg-slate-800/70 p-6 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-teal-400">Expenses</h2>
                <button
                  onClick={() => {
                    if (people.length === 0) {
                      setMessage({ text: "Please add at least one person first.", type: "warning"});
                      return;
                    }
                    if (!paidBy) setPaidBy(people[0].id); 
                    setExpenseParticipants(people.map(p => p.id)); 
                    setShowExpenseModal(true);
                  }}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center"
                  disabled={people.length === 0}
                >
                  <CurrencyRupeeIcon /> Add Expense
                </button>
              </div>
              {expenses.length === 0 ? (
                <p className="text-slate-400">No expenses recorded yet.</p>
              ) : (
                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2"> 
                  {expenses.map(exp => (
                    <li key={exp.id} className="bg-slate-700/50 p-4 rounded-lg hover:bg-slate-600/50 transition-colors duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-slate-100">{exp.description}</h3>
                          <p className="text-sm text-slate-400">
                            Paid by: <span className="font-semibold text-teal-400">{people.find(p => p.id === exp.paidBy)?.name || 'N/A'}</span>
                          </p>
                        </div>
                        <div className="text-right">
                           <p className="text-lg font-semibold text-slate-100">₹{exp.amount.toFixed(2)}</p>
                           <button 
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="text-red-500 hover:text-red-400 transition-colors mt-1 p-1 rounded-full hover:bg-red-500/20"
                            title={`Delete ${exp.description}`}
                           >
                             <TrashIcon />
                           </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Right Column: Summary / Settlements */}
          <div className="bg-slate-800/70 p-6 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700 md:sticky md:top-8 self-start">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">Summary</h2>
            {people.length === 0 && expenses.length === 0 && (
                 <p className="text-slate-400">Add people and expenses to see the settlement summary.</p>
            )}
            {settlements.length === 0 && (people.length > 0 || expenses.length > 0) && (
              <p className="text-slate-400">All debts are settled, or no expenses to split yet!</p>
            )}
            {settlements.length > 0 && (
              <ul className="space-y-3">
                {settlements.map((s, index) => (
                  <li key={index} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between hover:bg-slate-600/50 transition-colors duration-200">
                    <div className="flex items-center">
                       <span className="font-medium text-purple-300">{s.from}</span>
                       <span className="mx-2 text-slate-400">&rarr;</span>
                       <span className="font-medium text-green-400">{s.to}</span>
                    </div>
                    <span className="font-semibold text-slate-100">₹{s.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Footer Actions */}
        <footer className="mt-12 text-center space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <button
                onClick={handleClearAllData}
                className="w-full md:w-auto bg-rose-700 hover:bg-rose-600 text-white font-medium py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
                <ArrowPathIcon /> Clear & Start New Split
            </button>
            <button
                onClick={handleExportCSV}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                disabled={(people.length === 0 && expenses.length === 0)}
                title={(people.length === 0 && expenses.length === 0) ? "Add data to export" : "Download Summary as CSV"}
            >
                <DocumentArrowDownIcon /> Download Summary (CSV)
            </button>
        </footer>

      </div>

      {/* Add Person Modal */}
      {showPersonModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-sky-400">Add New Person</h3>
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder="Enter person's name"
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg mb-4 focus:ring-2 focus:ring-sky-500 outline-none text-slate-100 placeholder-slate-400"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowPersonModal(false)} className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors">Cancel</button>
              <button onClick={handleAddPerson} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 transition-colors text-white">Add Person</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto"> 
            <h3 className="text-xl font-semibold mb-6 text-teal-400">Add New Expense</h3>
            <div className="space-y-4">
              <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Expense description (e.g., Dinner, Groceries)"
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-100 placeholder-slate-400"
              />
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Amount"
                min="0.01"
                step="0.01"
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-100 placeholder-slate-400"
              />
              <div>
                <label htmlFor="paidBy" className="block text-sm font-medium text-slate-300 mb-1">Paid by:</label>
                <select
                  id="paidBy"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-100"
                >
                  {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Split between (participants):</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2"> 
                  {people.map(p => (
                    <label key={p.id} className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-all duration-200 ${expenseParticipants.includes(p.id) ? 'bg-teal-600/80' : 'bg-slate-700 hover:bg-slate-600'}`}>
                      <input
                        type="checkbox"
                        checked={expenseParticipants.includes(p.id)}
                        onChange={() => toggleParticipant(p.id)}
                        className="form-checkbox h-5 w-5 text-teal-500 bg-slate-600 border-slate-500 rounded focus:ring-teal-400 focus:ring-offset-slate-800"
                      />
                      <span className="text-slate-200">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => {setShowExpenseModal(false);}} className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors">Cancel</button>
              <button onClick={handleAddExpense} className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 transition-colors text-white">Add Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
