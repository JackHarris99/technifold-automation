// Wrapper for Copy Editor with machine context
'use client';

import { useEffect, useState } from 'react';
import CopyEditor from '../CopyEditor';

export default function CopyEditorTab({ machines, selectedMachine }: any) {
  const [allMachines, setAllMachines] = useState([]);

  useEffect(() => {
    // Fetch all machines for the editor
    async function fetchMachines() {
      const response = await fetch('/api/admin/machines/all');
      const data = await response.json();
      setAllMachines(data.machines || []);
    }
    fetchMachines();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Copy Editor</h2>
      <CopyEditor machines={allMachines} />
    </div>
  );
}
