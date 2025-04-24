import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../hooks/useAdmin';
import { FaPlus, FaEdit, FaTrash, FaGripVertical } from 'react-icons/fa';
import { toast } from 'react-toastify';

const TrainingAdmin = () => {
  const [modules, setModules] = useState([]);
  const [editingModule, setEditingModule] = useState(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { isAdmin } = useAdmin();
  const db = getFirestore();

  useEffect(() => {
    const modulesQuery = query(collection(db, 'training_modules'), orderBy('order'));
    
    const unsubscribe = onSnapshot(modulesQuery, (snapshot) => {
      const modulesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setModules(modulesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const handleAddModule = async (moduleData) => {
    try {
      await addDoc(collection(db, 'training_modules'), {
        ...moduleData,
        order: modules.length,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid
      });
      setShowAddModule(false);
      toast.success('Module added successfully!');
    } catch (error) {
      console.error('Error adding module:', error);
      toast.error('Failed to add module');
    }
  };

  const handleUpdateModule = async (moduleId, updates) => {
    try {
      await updateDoc(doc(db, 'training_modules', moduleId), {
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.uid
      });
      setEditingModule(null);
      toast.success('Module updated successfully!');
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'training_modules', moduleId));
      toast.success('Module deleted successfully!');
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };

  const handleReorderModule = async (moduleId, newOrder) => {
    try {
      const updates = modules.map((module, index) => ({
        id: module.id,
        order: module.id === moduleId ? newOrder : index
      }));

      await Promise.all(
        updates.map(({ id, order }) =>
          updateDoc(doc(db, 'training_modules', id), { order })
        )
      );
      toast.success('Module order updated!');
    } catch (error) {
      console.error('Error reordering modules:', error);
      toast.error('Failed to reorder modules');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-xl font-bold">
          ACCESS DENIED: Administrator privileges required.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold military-header">TRAINING MANAGEMENT</h1>
          <button
            onClick={() => setShowAddModule(true)}
            className="button-military px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FaPlus />
            <span>ADD MODULE</span>
          </button>
        </header>

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((module, index) => (
            <div
              key={module.id}
              className="game-card p-4 rounded-lg border border-gray-700 flex items-center"
            >
              <div className="cursor-move mr-4 text-gray-500">
                <FaGripVertical />
              </div>

              <div className="flex-grow">
                <h3 className="font-bold">{module.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-1">{module.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingModule(module)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteModule(module.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Module Modal */}
        {(showAddModule || editingModule) && (
          <ModuleForm
            module={editingModule}
            onSubmit={editingModule ? handleUpdateModule : handleAddModule}
            onClose={() => {
              setShowAddModule(false);
              setEditingModule(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

const ModuleForm = ({ module, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: module?.title || '',
    description: module?.description || '',
    lessons: module?.lessons || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (module) {
      onSubmit(module.id, formData);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 military-header">
          {module ? 'EDIT MODULE' : 'NEW MODULE'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lessons</label>
            {formData.lessons.map((lesson, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={lesson.title}
                  onChange={(e) => {
                    const newLessons = [...formData.lessons];
                    newLessons[index] = { ...lesson, title: e.target.value };
                    setFormData({ ...formData, lessons: newLessons });
                  }}
                  className="flex-grow p-2 bg-gray-700 rounded border border-gray-600"
                  placeholder="Lesson title"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newLessons = formData.lessons.filter((_, i) => i !== index);
                    setFormData({ ...formData, lessons: newLessons });
                  }}
                  className="button-attack p-2 rounded"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  lessons: [...formData.lessons, { id: Date.now().toString(), title: '' }]
                });
              }}
              className="button-military px-4 py-2 rounded mt-2"
            >
              Add Lesson
            </button>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="button-attack px-6 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-military px-6 py-2 rounded"
            >
              {module ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingAdmin;
