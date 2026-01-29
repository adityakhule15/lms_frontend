import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiX } from 'react-icons/fi';

const CreateCourseModal = ({ onClose, onSubmit }) => {
  const [learningOutcomes, setLearningOutcomes] = useState(['']);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleAddOutcome = () => {
    setLearningOutcomes([...learningOutcomes, '']);
  };

  const handleRemoveOutcome = (index) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
  };

  const handleOutcomeChange = (index, value) => {
    const newOutcomes = [...learningOutcomes];
    newOutcomes[index] = value;
    setLearningOutcomes(newOutcomes);
  };

  const onFormSubmit = (data) => {
    const courseData = {
      ...data,
      learning_outcomes: learningOutcomes.filter(outcome => outcome.trim() !== ''),
      duration_hours: parseInt(data.duration_hours),
      price: data.price ? parseFloat(data.price) : 0,
    };
    onSubmit(courseData);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Create New Course</h2>
          <button onClick={onClose} className="btn btn-sm" style={{ border: 'none', background: 'none' }}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              className="form-control"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <span className="error-message">{errors.title.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              className="form-control"
              rows="3"
              {...register('description', { required: 'Description is required' })}
            ></textarea>
            {errors.description && (
              <span className="error-message">{errors.description.message}</span>
            )}
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Category *</label>
              <input
                type="text"
                className="form-control"
                {...register('category', { required: 'Category is required' })}
              />
              {errors.category && (
                <span className="error-message">{errors.category.message}</span>
              )}
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Level *</label>
              <select
                className="form-control"
                {...register('level', { required: 'Level is required' })}
              >
                <option value="">Select Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {errors.level && (
                <span className="error-message">{errors.level.message}</span>
              )}
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Duration (hours) *</label>
              <input
                type="number"
                className="form-control"
                min="1"
                {...register('duration_hours', { required: 'Duration is required', min: 1 })}
              />
              {errors.duration_hours && (
                <span className="error-message">{errors.duration_hours.message}</span>
              )}
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Price (optional)</label>
              <input
                type="number"
                className="form-control"
                step="0.01"
                {...register('price')}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                {...register('is_published')}
                style={{ marginRight: '10px' }}
              />
              Publish immediately
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Create Course
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;

