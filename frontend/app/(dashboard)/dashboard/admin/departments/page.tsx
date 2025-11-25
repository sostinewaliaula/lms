'use client';

import { useEffect, useState } from 'react';
import { Building2, Plus, Edit, Trash2, Users, BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  Department,
} from '@/lib/api/departments';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const depts = await getDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, formData);
      } else {
        await createDepartment(formData);
      }
      setShowModal(false);
      setEditingDept(null);
      setFormData({ name: '', description: '' });
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Failed to save department');
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDepartment(id);
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Failed to delete department');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Departments</h1>
          <p className="text-text-muted">Manage departments for Caava Group</p>
        </div>
        <button
          onClick={() => {
            setEditingDept(null);
            setFormData({ name: '', description: '' });
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Department
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-background-card rounded-lg p-6 border border-secondary/30 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{dept.name}</h3>
                    {dept.manager_first_name && (
                      <p className="text-sm text-text-muted">
                        Manager: {dept.manager_first_name} {dept.manager_last_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="text-primary hover:text-primary/80"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {dept.description && (
                <p className="text-sm text-text-muted mb-4">{dept.description}</p>
              )}

              {dept.stats && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-secondary/20">
                  <div>
                    <div className="flex items-center gap-2 text-text-muted mb-1">
                      <BookOpen size={16} />
                      <span className="text-xs">Courses</span>
                    </div>
                    <p className="text-lg font-semibold text-text-primary">
                      {dept.stats.total_courses || 0}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-text-muted mb-1">
                      <Users size={16} />
                      <span className="text-xs">Users</span>
                    </div>
                    <p className="text-lg font-semibold text-text-primary">
                      {dept.stats.total_users || 0}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-text-muted mb-1">
                      <GraduationCap size={16} />
                      <span className="text-xs">Enrollments</span>
                    </div>
                    <p className="text-lg font-semibold text-text-primary">
                      {dept.stats.total_enrollments || 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-card rounded-lg p-6 w-full max-w-md border border-secondary/30">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {editingDept ? 'Edit Department' : 'Create Department'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                  placeholder="e.g., IT, Engineering, LMS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                  rows={3}
                  placeholder="Department description..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  {editingDept ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDept(null);
                    setFormData({ name: '', description: '' });
                  }}
                  className="flex-1 bg-secondary/30 text-text-primary px-4 py-2 rounded-lg hover:bg-secondary/50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

