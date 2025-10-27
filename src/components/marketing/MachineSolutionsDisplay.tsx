/**
 * Machine Solutions Display
 * Shows solutions and problems for a selected machine
 */

'use client';

import { useState } from 'react';
import LeadCaptureForm from './LeadCaptureForm';

interface Problem {
  problem_id: string;
  problem_title: string;
  problem_description: string;
  pitch_headline: string;
  pitch_detail: string;
  action_cta: string;
}

interface Solution {
  solution_id: string;
  solution_name: string;
  solution_core_benefit: string;
  solution_long_description: string;
  solution_media_urls: string[];
  problems: Problem[];
}

interface MachineSolutionsDisplayProps {
  machineData: {
    machine_brand: string;
    machine_model: string;
    machine_display_name: string;
    machine_id: string;
    solutions: Solution[];
  };
}

export default function MachineSolutionsDisplay({ machineData }: MachineSolutionsDisplayProps) {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const handleGetHelp = (problem: Problem) => {
    setSelectedProblem(problem);
    setShowLeadForm(true);
  };

  if (showLeadForm && selectedProblem) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <button
          onClick={() => setShowLeadForm(false)}
          className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          ← Back to solutions
        </button>
        <LeadCaptureForm
          machineId={machineData.machine_id}
          problemId={selectedProblem.problem_id}
          problemTitle={selectedProblem.problem_title}
          onSuccess={() => {
            setShowLeadForm(false);
            setSelectedProblem(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">{machineData.machine_display_name}</h1>
        <p className="text-gray-300 text-lg">
          Production-proven solutions for your {machineData.machine_brand} {machineData.machine_model}
        </p>
      </div>

      {machineData.solutions.map((solution) => (
        <div key={solution.solution_id} className="bg-white rounded-lg border border-gray-200 p-8">
          {/* Solution header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{solution.solution_name}</h2>
            <p className="text-lg text-blue-600 font-semibold mb-4">{solution.solution_core_benefit}</p>
            <p className="text-gray-700 leading-relaxed">{solution.solution_long_description}</p>
          </div>

          {/* Solution media */}
          {solution.solution_media_urls && solution.solution_media_urls.length > 0 && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {solution.solution_media_urls.slice(0, 2).map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`${solution.solution_name} ${idx + 1}`}
                  className="rounded-lg border border-gray-200 w-full h-64 object-cover"
                />
              ))}
            </div>
          )}

          {/* Problems this solution fixes */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Problems this fixes:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solution.problems.map((problem) => (
                <div
                  key={problem.problem_id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <h4 className="font-bold text-gray-900 mb-2">{problem.pitch_headline}</h4>
                  <p className="text-sm text-gray-600 mb-4">{problem.pitch_detail}</p>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      This is happening on my machine
                    </label>
                  </div>

                  <button
                    onClick={() => handleGetHelp(problem)}
                    className="mt-4 w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors group-hover:bg-blue-700"
                  >
                    {problem.action_cta || 'Get help with this'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
