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

  // Styles
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    modalHeader: {
      padding: '1.5rem 1.5rem 0.5rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0,
      marginBottom: '0.5rem',
    },
    courseTitleText: {
      color: '#6b7280',
      fontSize: '0.875rem',
    },
    courseTitleSpan: {
      color: '#4f46e5',
      fontWeight: '600',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: '#6b7280',
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    form: {
      padding: '1.5rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    formControl: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      lineHeight: '1.5',
      backgroundColor: 'white',
    },
    formControlError: {
      borderColor: '#dc2626',
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    errorMessage: {
      color: '#dc2626',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      display: 'block',
    },
    formHint: {
      color: '#6b7280',
      fontSize: '0.75rem',
      marginTop: '0.25rem',
      display: 'block',
    },
    contentEditor: {
      marginTop: '0.5rem',
    },
    markdownTips: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      marginTop: '0.5rem',
    },
    tipsLabel: {
      color: '#6b7280',
      fontSize: '0.75rem',
      marginRight: '0.5rem',
    },
    code: {
      padding: '0.125rem 0.5rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      color: '#374151',
    },
    checkboxGroup: {
      marginBottom: '2rem',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      userSelect: 'none',
    },
    checkboxInput: {
      marginRight: '0.75rem',
      width: '1rem',
      height: '1rem',
    },
    checkboxText: {
      color: '#374151',
      fontSize: '0.875rem',
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e5e7eb',
    },
    btn: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'background-color 0.2s',
    },
    btnPrimary: {
      background: '#4f46e5',
      color: 'white',
    },
    btnOutline: {
      background: 'white',
      color: '#374151',
      border: '1px solid #d1d5db',
    },
    contentTypeSelect: {
      position: 'relative',
    },
    contentTypeIcon: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6b7280',
      pointerEvents: 'none',
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>
              {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
            </h2>
            <p style={styles.courseTitleText}>
              For: <span style={styles.courseTitleSpan}>{course.title}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={styles.closeButton}
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Title *</label>
            <input
              type="text"
              style={{
                ...styles.formControl,
                ...(errors.title ? styles.formControlError : {})
              }}
              placeholder="Enter lesson title"
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' }
              })}
            />
            {errors.title && (
              <span style={styles.errorMessage}>{errors.title.message}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Description *</label>
            <textarea
              style={{
                ...styles.formControl,
                ...(errors.description ? styles.formControlError : {})
              }}
              rows="2"
              placeholder="Brief description of what students will learn in this lesson"
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              })}
            ></textarea>
            {errors.description && (
              <span style={styles.errorMessage}>{errors.description.message}</span>
            )}
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Content Type *</label>
              <div style={styles.contentTypeSelect}>
                <select
                  style={{
                    ...styles.formControl,
                    ...(errors.content_type ? styles.formControlError : {})
                  }}
                  {...register('content_type', { required: 'Content type is required' })}
                >
                  <option value="">Select Type</option>
                  <option value="text">Text Lesson</option>
                  <option value="video">Video Lesson</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                </select>
                <div style={styles.contentTypeIcon}>
                  {contentType ? renderContentTypeIcon(contentType) : <FiFileText />}
                </div>
              </div>
              {errors.content_type && (
                <span style={styles.errorMessage}>{errors.content_type.message}</span>
              )}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Order</label>
              <input
                type="number"
                style={styles.formControl}
                min="1"
                placeholder="1"
                {...register('order')}
              />
              <span style={styles.formHint}>Lower numbers appear first</span>
            </div>
          </div>

          {contentType === 'video' && (
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Video URL</label>
              <input
                type="url"
                style={styles.formControl}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                {...register('video_url')}
              />
              <span style={styles.formHint}>Supported platforms: YouTube, Vimeo, or direct video URLs</span>
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              {contentType === 'quiz' ? 'Quiz Instructions *' : 'Content *'}
            </label>
            <div style={styles.contentEditor}>
              <textarea
                style={{
                  ...styles.formControl,
                  ...(errors.content ? styles.formControlError : {})
                }}
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
              <div style={{ marginTop: '0.5rem' }}>
                {contentType === 'text' && (
                  <div style={styles.markdownTips}>
                    <span style={styles.tipsLabel}>Markdown Tips:</span>
                    <code style={styles.code}># Header</code>
                    <code style={styles.code}>**Bold**</code>
                    <code style={styles.code}>*Italic*</code>
                    <code style={styles.code}>`Code`</code>
                  </div>
                )}
              </div>
            </div>
            {errors.content && (
              <span style={styles.errorMessage}>{errors.content.message}</span>
            )}
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Duration (minutes)</label>
              <input
                type="number"
                style={styles.formControl}
                min="1"
                max="480"
                placeholder="e.g., 45"
                {...register('duration_minutes')}
              />
              <span style={styles.formHint}>Estimated time to complete this lesson</span>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Attachment URL (optional)</label>
              <input
                type="url"
                style={styles.formControl}
                placeholder="https://example.com/document.pdf"
                {...register('attachment')}
              />
              <span style={styles.formHint}>PDFs, slides, or other resources</span>
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                {...register('is_active')}
                defaultChecked
                style={styles.checkboxInput}
              />
              <span style={styles.checkboxText}>Active (available to students)</span>
            </label>
          </div>

          <div style={styles.modalFooter}>
            <button 
              type="submit" 
              style={{ ...styles.btn, ...styles.btnPrimary }}
            >
              {isEditing ? 'Update Lesson' : 'Create Lesson'}
            </button>
            {isEditing && (
              <button 
                type="button" 
                style={{ ...styles.btn, ...styles.btnOutline }}
                onClick={handleReset}
              >
                Reset Changes
              </button>
            )}
            <button 
              type="button" 
              style={{ ...styles.btn, ...styles.btnOutline }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLessonModal;