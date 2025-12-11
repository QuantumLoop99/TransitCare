import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface PriorityRule {
  id: string;
  name: string;
  conditions: string;
  priority: 'high' | 'medium' | 'low';
  active: boolean;
  createdAt: string;
}

export const PriorityRulesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<PriorityRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch priority rules from API
    const fetchRules = async () => {
      setLoading(true);
      setTimeout(() => {
        setRules([
          {
            id: '1',
            name: 'Safety Issues',
            conditions: 'category = safety',
            priority: 'high',
            active: true,
            createdAt: '2025-01-01T00:00:00'
          },
          {
            id: '2',
            name: 'Multiple Complaints Same Vehicle',
            conditions: 'count > 3 in 24 hours',
            priority: 'high',
            active: true,
            createdAt: '2025-01-05T00:00:00'
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchRules();
  }, []);

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, active: !rule.active } : rule
    ));
    // TODO: Update rule status via API
  };

  const deleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setRules(rules.filter(r => r.id !== ruleId));
      // TODO: Delete rule via API
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Priority Rules Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure automated priority assignment rules
          </p>
        </div>
        <Button onClick={() => navigate('/admin/priority-rules/add')}>
          Add New Rule
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading rules...</p>
        </div>
      ) : rules.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Rules Configured
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first priority rule to automate complaint handling
          </p>
          <Button onClick={() => navigate('/admin/priority-rules/add')}>
            Create First Rule
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {rule.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      rule.active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {rule.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      rule.priority === 'high' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : rule.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {rule.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Conditions:</strong> {rule.conditions}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {new Date(rule.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/priority-rules/edit/${rule.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleRule(rule.id)}
                  >
                    {rule.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
