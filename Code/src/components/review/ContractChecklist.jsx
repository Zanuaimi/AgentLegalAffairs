import { useState } from 'react';
import { contractChecklistItems } from '../../data/mockData';

function ContractChecklist() {
  // Each checklist item can be checked/unchecked by the reviewer in this frontend demo.
  const [checkedItems, setCheckedItems] = useState([]);

  function toggleItem(item) {
    const isAlreadyChecked = checkedItems.includes(item);

    if (isAlreadyChecked) {
      setCheckedItems(checkedItems.filter((checkedItem) => checkedItem !== item));
    } else {
      setCheckedItems([...checkedItems, item]);
    }

    // BACKEND TODO: PATCH /api/requests/:id/checklist
    // Save checklist progress for the selected request.
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-bold text-slate-900">Contract Review Checklist</h3>
      <p className="text-sm text-slate-500 mt-1">Based on Version 1 contract/agreement review requirements.</p>

      <div className="mt-4 space-y-3">
        {contractChecklistItems.map((item) => (
          <label key={item} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
            <input className="mt-1" type="checkbox" checked={checkedItems.includes(item)} onChange={() => toggleItem(item)} />
            <span className="text-slate-700">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default ContractChecklist;

/*
BEGINNER DOCUMENTATION:

1. What is a checkbox?
A checkbox lets the user mark something as true/false or complete/incomplete.

2. What is includes?
includes checks whether an array contains a value.

3. What is filter?
filter creates a new array without items we want to remove.

4. Why not modify the array directly?
React state should be updated using a new array/object so React knows the screen must update.
*/
