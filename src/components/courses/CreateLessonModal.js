import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiFileText, FiVideo, FiCheckCircle, FiFile } from 'react-icons/fi';

const CreateLessonModal = ({ course, lesson: existingLesson, onClose, onSubmit, isEditing = false }) => {
  const [showQuizFields, setShowQuizFields] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset
  } = useForm();

  const contentType = watch('content_type');

  // Initialize form with lesson data if editing
  useEffect(() => {
    if (isEditing && existingLesson) {
      setValue('title', existingLesson.title || '');
      setValue('description', existingLesson.description || '');
      setValue('content_type', existingLesson.content_type || 'text');
      setValue('order', existingLesson.order || 0);
      setValue('content', existingLesson.content || '');
      setValue('duration_minutes', existingLesson.duration_minutes || 0);
      setValue('video_url', existingLesson.video_url || '');
      setValue('attachment', existingLesson.attachment || '');
      setValue('is_active', existingLesson.is_active ?? true);
    }
  }, [isEditing, existingLesson, setValue]);

  const onFormSubmit = (data) => {
    const lessonData = {
      ...data,
      course: course.id,
      duration_minutes: parseInt(data.duration_minutes) || 0,
      order: parseInt(data.order) || 0,
    };
    
    // Clean up data
    if (!data.video_url) delete lessonData.video_url;
    if (!data.attachment) delete lessonData.attachment;
    
    onSubmit(lessonData);
  };

  const handleReset = () => {
    if (isEditing && existingLesson) {
      reset({
        title: existingLesson.title || '',
        description: existingLesson.description || '',
        content_type: existingLesson.content_type || 'text',
        order: existingLesson.order || 0,
        content: existingLesson.content || '',
        duration_minutes: existingLesson.duration_minutes || 0,
        video_url: existingLesson.video_url || '',
        attachment: existingLesson.attachment || '',
        is_active: existingLesson.is_active ?? true,
      });
    }
  };

  const renderContentTypeIcon = (type) => {
    switch(type) {
      case 'text': return <FiFileText />;
      case 'video': return <FiVideo />;
      case 'quiz': return <FiCheckCircle />;
      case 'assignment': return <FiFile />;
      default: return <FiFileText />;
    }
  };

  return (
    <div className="lesson-modal-overlay">
      <div className="lesson-modal-content">
        <div className="lesson-modal-header">
          <div>
            <h2>{isEditing ? 'Edit Lesson' : 'Create New Lesson'}</h2>
            <p className="course-title-text">For: <span>{course.title}</span></p>
          </div>
          <button onClick={onClose} className="lesson-modal-close-btn">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="lesson-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className={`form-control ${errors.title ? 'error' : ''}`}
              placeholder="Enter lesson title"
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' }
              })}
            />
            {errors.title && (
              <span className="error-message">{errors.title.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className={`form-control ${errors.description ? 'error' : ''}`}
              rows="2"
              placeholder="Brief description of what students will learn in this lesson"
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              })}
            ></textarea>
            {errors.description && (
              <span className="error-message">{errors.description.message}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Content Type *</label>
              <div className="content-type-select">
                <select
                  className={`form-control ${errors.content_type ? 'error' : ''}`}
                  {...register('content_type', { required: 'Content type is required' })}
                >
                  <option value="">Select Type</option>
                  <option value="text">
                    <FiFileText /> Text Lesson
                  </option>
                  <option value="video">
                    <FiVideo /> Video Lesson
                  </option>
                  <option value="quiz">
                    <FiCheckCircle /> Quiz
                  </option>
                  <option value="assignment">
                    <FiFile /> Assignment
                  </option>
                </select>
                <div className="content-type-icon">
                  {contentType ? renderContentTypeIcon(contentType) : <FiFileText />}
                </div>
              </div>
              {errors.content_type && (
                <span className="error-message">{errors.content_type.message}</span>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">Order</label>
              <input
                type="number"
                className="form-control"
                min="1"
                placeholder="1"
                {...register('order')}
              />
              <span className="form-hint">Lower numbers appear first</span>
            </div>
          </div>

          {contentType === 'video' && (
            <div className="form-group">
              <label className="form-label">Video URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                {...register('video_url')}
              />
              <span className="form-hint">Supported platforms: YouTube, Vimeo, or direct video URLs</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              {contentType === 'quiz' ? 'Quiz Instructions *' : 'Content *'}
            </label>
            <div className="content-editor">
              <textarea
                className={`form-control ${errors.content ? 'error' : ''}`}
                rows="6"
                placeholder={
                  contentType === 'text'
                    ? 'Enter detailed lesson content (supports markdown)...'
                    : contentType === 'quiz'
                    ? 'Enter quiz instructions and rules...'
                    : contentType === 'assignment'
                    ? 'Enter assignment description and requirements...'
                    : 'Enter content...'
                }
                {...register('content', { 
                  required: 'Content is required',
                  minLength: { value: 20, message: 'Content must be at least 20 characters' }
                })}
              ></textarea>
              <div className="content-tools">
                {contentType === 'text' && (
                  <div className="markdown-tips">
                    <span className="tips-label">Markdown Tips:</span>
                    <code># Header</code>
                    <code>**Bold**</code>
                    <code>*Italic*</code>
                    <code>`Code`</code>
                  </div>
                )}
              </div>
            </div>
            {errors.content && (
              <span className="error-message">{errors.content.message}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max="480"
                placeholder="e.g., 45"
                {...register('duration_minutes')}
              />
              <span className="form-hint">Estimated time to complete this lesson</span>
            </div>
            
            <div className="form-group">
              <label className="form-label">Attachment URL (optional)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com/document.pdf"
                {...register('attachment')}
              />
              <span className="form-hint">PDFs, slides, or other resources</span>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('is_active')}
                defaultChecked
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">Active (available to students)</span>
            </label>
          </div>

          <div className="lesson-modal-footer">
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Lesson' : 'Create Lesson'}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-outline" onClick={handleReset}>
                Reset Changes
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLessonModal;