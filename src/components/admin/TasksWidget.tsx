/**
 * Tasks Widget for Sales Center
 * Shows pending tasks with quick actions
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Task {
  task_id: string;
  task_type: string;
  priority: number;
  title: string;
  description: string | null;
  company_id: string | null;
  company_name?: string;
  quote_id: string | null;
  invoice_id: string | null;
  due_date: string | null;
  auto_generated: boolean;
  created_at: string;
}

export default function TasksWidget({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  async function fetchTasks() {
    try {
      const response = await fetch(`/api/admin/tasks/my-tasks`);
      const data = await response.json();

      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function completeTask(taskId: string) {
    setCompleting(taskId);
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        setTasks(tasks.filter(t => t.task_id !== taskId));
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setCompleting(null);
    }
  }

  async function dismissTask(taskId: string) {
    setDismissing(taskId);
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/dismiss`, {
        method: 'POST',
      });

      if (response.ok) {
        setTasks(tasks.filter(t => t.task_id !== taskId));
      }
    } catch (error) {
      console.error('Failed to dismiss task:', error);
    } finally {
      setDismissing(null);
    }
  }

  function getPriorityColor(priority: number) {
    if (priority >= 90) return 'bg-red-50 border-red-200';
    if (priority >= 70) return 'bg-orange-50 border-orange-200';
    if (priority >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-gray-50 border-gray-200';
  }

  function getPriorityBadge(priority: number) {
    if (priority >= 90) return <span className="text-xs font-semibold text-red-700">🔴 Urgent</span>;
    if (priority >= 70) return <span className="text-xs font-semibold text-orange-700">🟠 High</span>;
    if (priority >= 50) return <span className="text-xs font-semibold text-yellow-700">🟡 Normal</span>;
    return <span className="text-xs font-semibold text-gray-700">⚪ Low</span>;
  }

  function getTaskIcon(taskType: string) {
    switch (taskType) {
      case 'quote_follow_up': return '📞';
      case 'trial_ending': return '⏰';
      case 'payment_chase': return '💰';
      case 'reorder': return '🔄';
      default: return '📋';
    }
  }

  function formatDueDate(dueDate: string | null) {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays < 0) return <span className="text-red-600 font-semibold">Overdue</span>;
    if (diffDays === 0) return <span className="text-orange-600 font-semibold">Today</span>;
    if (diffDays === 1) return <span className="text-yellow-600">Tomorrow</span>;
    return <span className="text-gray-600">{diffDays} days</span>;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  const urgentTasks = tasks.filter(t => t.priority >= 70);
  const normalTasks = tasks.filter(t => t.priority < 70);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Your Tasks</h2>
          <p className="text-sm text-gray-600 mt-1">
            {tasks.length === 0 ? 'No pending tasks' : `${urgentTasks.length} urgent, ${normalTasks.length} normal`}
          </p>
        </div>
        {tasks.length > 0 && (
          <Link
            href="/admin/tasks"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </Link>
        )}
      </div>

      {/* Tasks List */}
      <div className="divide-y divide-gray-200">
        {tasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-sm text-gray-600">All caught up! No pending tasks.</div>
          </div>
        ) : (
          <>
            {urgentTasks.length > 0 && (
              <>
                <div className="px-6 py-2 bg-red-50">
                  <div className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                    Urgent ({urgentTasks.length})
                  </div>
                </div>
                {urgentTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.task_id}
                    className={`px-6 py-4 border-l-4 ${getPriorityColor(task.priority)}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getTaskIcon(task.task_type)}</span>
                          <div className="font-semibold text-gray-900 text-sm">
                            {task.title}
                          </div>
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {task.description}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <span>Due:</span>
                              {formatDueDate(task.due_date)}
                            </div>
                          )}
                          {getPriorityBadge(task.priority)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {task.company_id && (
                          <Link
                            href={`/admin/company/${task.company_id}`}
                            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-300 rounded"
                          >
                            View
                          </Link>
                        )}
                        <button
                          onClick={() => completeTask(task.task_id)}
                          disabled={completing === task.task_id}
                          className="text-xs text-green-600 hover:text-green-800 px-2 py-1 border border-green-300 rounded disabled:opacity-50"
                        >
                          {completing === task.task_id ? '...' : '✓'}
                        </button>
                        <button
                          onClick={() => dismissTask(task.task_id)}
                          disabled={dismissing === task.task_id}
                          className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-300 rounded disabled:opacity-50"
                        >
                          {dismissing === task.task_id ? '...' : '✕'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {normalTasks.length > 0 && (
              <>
                <div className="px-6 py-2 bg-gray-50">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Normal Priority ({normalTasks.length})
                  </div>
                </div>
                {normalTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.task_id}
                    className="px-6 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{getTaskIcon(task.task_type)}</span>
                          <div className="font-medium text-gray-900 text-sm">
                            {task.title}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.company_id && (
                          <Link
                            href={`/admin/company/${task.company_id}`}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                        )}
                        <button
                          onClick={() => completeTask(task.task_id)}
                          disabled={completing === task.task_id}
                          className="text-xs text-green-600 hover:text-green-800 px-2 py-1 border border-green-300 rounded disabled:opacity-50"
                        >
                          {completing === task.task_id ? '...' : '✓'}
                        </button>
                        <button
                          onClick={() => dismissTask(task.task_id)}
                          disabled={dismissing === task.task_id}
                          className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-300 rounded disabled:opacity-50"
                        >
                          {dismissing === task.task_id ? '...' : '✕'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
