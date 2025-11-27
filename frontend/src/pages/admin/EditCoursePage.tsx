import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Save,
  X,
  Trash2,
  Hash,
  ArrowLeft,
  BookOpen,
  Layers,
  FileText,
  Video,
  HelpCircle,
  Award,
  GraduationCap,
  Settings,
  Download,
  Plus,
  Edit2,
  GripVertical,
  PlayCircle,
  File,
  Presentation,
  CheckCircle2,
} from 'lucide-react';
import { getCourse, updateCourse, deleteCourse, Course } from '@/lib/api/courses';
import { getCategories } from '@/lib/api/categories';
import { getDepartments } from '@/lib/api/departments';
import { getTags, Tag } from '@/lib/api/tags';
import { getBadges } from '@/lib/api/badges';
import { getLearningPaths } from '@/lib/api/learningPaths';
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  getContentItem,
  Module,
  ContentItem,
} from '@/lib/api/modules';
import { createQuiz, addQuizQuestion, updateQuiz, Quiz, QuizQuestion } from '@/lib/api/quizzes';
import toast, { toastSuccess, toastError } from '@/lib/toast';

type Tab = 'overview' | 'modules' | 'quizzes' | 'settings' | 'resources';

type QuizContentItem = ContentItem & {
  quiz?: Quiz & {
    questions?: QuizQuestion[];
  };
};

const FINAL_EXAM_MARKER = '__FINAL_EXAM__';


export default function EditCoursePage() {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [moduleFormData, setModuleFormData] = useState({ title: '', description: '' });
  const [contentFormData, setContentFormData] = useState({
    title: '',
    content_type: 'video' as ContentItem['content_type'],
    content_url: '',
    content_text: '',
    duration_minutes: '',
    is_preview: false,
    is_required: true,
  });
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [activeQuizModule, setActiveQuizModule] = useState<Module | null>(null);
  const [activeQuizContent, setActiveQuizContent] = useState<ContentItem | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    description: '',
    passing_score: 70,
    max_attempts: 3,
    time_limit_minutes: '',
  });
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice' as QuizQuestion['question_type'],
    options: [''],
    correct_answer: '',
    points: 1,
  });
  const [finalExam, setFinalExam] = useState<{
    module: Module;
    content: QuizContentItem;
    quiz: Quiz | null;
  } | null>(null);
  const [finalExamLoading, setFinalExamLoading] = useState(false);
  const [finalExamSaving, setFinalExamSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    category_id: '',
    department_id: '',
    visibility: 'public',
    difficulty_level: '',
    language: 'en',
    duration_hours: '',
    is_published: false,
  });

  // Course settings
  const [courseSettings, setCourseSettings] = useState({
    final_exam_passmark: 70,
    final_exam_max_attempts: 3,
    final_exam_time_limit: '',
    module_quiz_required: false,
    badge_id: '',
    certificate_enabled: true,
    auto_assign_learning_path: '',
    downloadable_resources: true,
  });

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setDataLoading(true);
      const [course, cats, depts, tagsData, badgesData, pathsData] = await Promise.all([
        getCourse(courseId),
        getCategories(),
        getDepartments(),
        getTags(),
        getBadges(),
        getLearningPaths(),
      ]);

      setCategories(Array.isArray(cats) ? cats : []);
      setDepartments(Array.isArray(depts) ? depts : []);
      setTags(Array.isArray(tagsData) ? tagsData : []);
      setBadges(Array.isArray(badgesData) ? badgesData : []);
      setLearningPaths(Array.isArray(pathsData) ? pathsData : []);

      setFormData({
        title: course.title || '',
        description: course.description || '',
        short_description: course.short_description || '',
        category_id: course.category_id || '',
        department_id: course.department_id || '',
        visibility: course.visibility || 'public',
        difficulty_level: course.difficulty_level || '',
        language: course.language || 'en',
        duration_hours: course.duration_hours?.toString() || '',
        is_published: course.is_published ?? false,
      });

      if (Array.isArray((course as any).tags)) {
        setSelectedTagIds((course as any).tags.map((t: any) => t.id));
      }

      // Fetch modules and content
      const modulesData = await getModules(courseId);
      let finalExamModule: Module | null = null;
      const regularModules: Module[] = [];

      modulesData.forEach((mod) => {
        if (mod.description === FINAL_EXAM_MARKER || mod.title === 'Final Exam') {
          finalExamModule = mod;
        } else {
          regularModules.push(mod);
        }
      });

      setModules(regularModules);

      if (finalExamModule) {
        const quizItem = finalExamModule.content_items?.find((item) => item.content_type === 'quiz');
        if (quizItem) {
          try {
            const fullContent = (await getContentItem(quizItem.id)) as QuizContentItem;
            const quizData = fullContent.quiz || null;
            setFinalExam({
              module: finalExamModule,
              content: fullContent,
              quiz: quizData,
            });
            if (quizData) {
              setCourseSettings((prev) => ({
                ...prev,
                final_exam_passmark: quizData.passing_score ?? prev.final_exam_passmark,
                final_exam_max_attempts: quizData.max_attempts ?? prev.final_exam_max_attempts,
                final_exam_time_limit: quizData.time_limit_minutes?.toString() || '',
              }));
            }
          } catch (error) {
            console.error('Error loading final exam content:', error);
            setFinalExam(null);
          }
        }
      } else {
        setFinalExam(null);
      }

      // TODO: Fetch additional course settings (badge, auto-assign, etc.) from course metadata
    } catch (error) {
      console.error('Error fetching course:', error);
      toastError('Failed to load course', {
        subtitle: 'Please try again or go back to the courses list.',
      });
      navigate('/dashboard/admin/courses');
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const courseData = {
        ...formData,
        price: 0,
        is_free: true,
        duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : undefined,
        category_id: formData.category_id || undefined,
        department_id: formData.department_id || undefined,
        difficulty_level: formData.difficulty_level || undefined,
        tag_ids: selectedTagIds,
      };

      await updateCourse(courseId, courseData);
      toastSuccess('Course updated', {
        subtitle: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
      console.error('Error updating course:', error);
      toastError('Failed to update course', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCourse(courseId);
      toastSuccess('Course deleted', {
        subtitle: 'The course has been removed successfully.',
      });
      navigate('/dashboard/admin/courses');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toastError('Failed to delete course', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    }
    setDeleteConfirm(false);
  };

  const getModuleQuizItem = (module: Module) =>
    (module.content_items || []).find((item) => item.content_type === 'quiz');

  const handleCreateModule = async () => {
    try {
      const newModule = await createModule({
        course_id: courseId,
        title: moduleFormData.title,
        description: moduleFormData.description || undefined,
        order_index: modules.length,
      });
      setModules([...modules, newModule]);
      setShowModuleModal(false);
      setModuleFormData({ title: '', description: '' });
      toastSuccess('Module created', {
        subtitle: 'You can now add content to this module.',
      });
    } catch (error: any) {
      console.error('Error creating module:', error);
      toastError('Failed to create module', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    }
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;
    try {
      const updated = await updateModule(editingModule.id, {
        title: moduleFormData.title,
        description: moduleFormData.description || undefined,
      });
      setModules(modules.map((m) => (m.id === updated.id ? updated : m)));
      setShowModuleModal(false);
      setEditingModule(null);
      setModuleFormData({ title: '', description: '' });
      toastSuccess('Module updated', {
        subtitle: 'Changes have been saved.',
      });
    } catch (error: any) {
      console.error('Error updating module:', error);
      toastError('Failed to update module', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? All content will be removed.')) {
      return;
    }
    try {
      await deleteModule(moduleId);
      setModules(modules.filter((m) => m.id !== moduleId));
      toastSuccess('Module deleted', {
        subtitle: 'The module and all its content have been removed.',
      });
    } catch (error: any) {
      console.error('Error deleting module:', error);
      toastError('Failed to delete module', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    }
  };

  const handleCreateContent = async () => {
    if (!selectedModuleId) return;
    try {
      const newContent = await createContentItem({
        module_id: selectedModuleId,
        title: contentFormData.title,
        content_type: contentFormData.content_type,
        content_url: contentFormData.content_url || undefined,
        content_text: contentFormData.content_text || undefined,
        duration_minutes: contentFormData.duration_minutes ? parseInt(contentFormData.duration_minutes) : undefined,
        order_index: 0,
        is_preview: contentFormData.is_preview,
        is_required: contentFormData.is_required,
      });
      setModules(
        modules.map((m) =>
          m.id === selectedModuleId
            ? { ...m, content_items: [...(m.content_items || []), newContent] }
            : m
        )
      );
      setShowContentModal(false);
      setSelectedModuleId(null);
      setContentFormData({
        title: '',
        content_type: 'video',
        content_url: '',
        content_text: '',
        duration_minutes: '',
        is_preview: false,
        is_required: true,
      });
      toastSuccess('Content added', {
        subtitle: 'The content item has been added to the module.',
      });
    } catch (error: any) {
      console.error('Error creating content:', error);
      toastError('Failed to add content', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    }
  };

  const handleDeleteContent = async (contentId: string, moduleId: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) {
      return;
    }
    try {
      await deleteContentItem(contentId);
      setModules(
        modules.map((m) =>
          m.id === moduleId
            ? { ...m, content_items: (m.content_items || []).filter((c) => c.id !== contentId) }
            : m
        )
      );
      toastSuccess('Content deleted', {
        subtitle: 'The content item has been removed.',
      });
    } catch (error: any) {
      console.error('Error deleting content:', error);
      toastError('Failed to delete content', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    }
  };

  const handleCreateFinalExam = async () => {
    setFinalExamLoading(true);
    try {
      const examModule = await createModule({
        course_id: courseId,
        title: 'Final Exam',
        description: FINAL_EXAM_MARKER,
        order_index: modules.length + 1,
      });
      const examContent = await createContentItem({
        module_id: examModule.id,
        title: 'Final Exam',
        content_type: 'quiz',
        is_preview: false,
        is_required: true,
      });
      const quiz = await createQuiz({
        content_item_id: examContent.id,
        title: 'Final Exam',
        passing_score: courseSettings.final_exam_passmark,
        max_attempts: courseSettings.final_exam_max_attempts,
        time_limit_minutes: courseSettings.final_exam_time_limit
          ? parseInt(courseSettings.final_exam_time_limit)
          : undefined,
      });
      const contentWithQuiz: QuizContentItem = {
        ...examContent,
        quiz: { ...quiz, questions: [] },
      };
      setFinalExam({
        module: examModule,
        content: contentWithQuiz,
        quiz,
      });
      toastSuccess('Final exam created', {
        subtitle: 'Add questions to activate the final assessment.',
      });
    } catch (error: any) {
      console.error('Error creating final exam:', error);
      toastError('Failed to create final exam', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    } finally {
      setFinalExamLoading(false);
    }
  };

  const handleUpdateFinalExamSettings = async () => {
    if (!finalExam?.quiz) {
      await handleCreateFinalExam();
      return;
    }
    setFinalExamSaving(true);
    try {
      const updated = await updateQuiz(finalExam.quiz.id, {
        passing_score: courseSettings.final_exam_passmark,
        max_attempts: courseSettings.final_exam_max_attempts,
        time_limit_minutes: courseSettings.final_exam_time_limit
          ? parseInt(courseSettings.final_exam_time_limit)
          : null,
      });
      setFinalExam((prev) =>
        prev
          ? {
              ...prev,
              quiz: updated,
            }
          : prev
      );
      toastSuccess('Final exam updated', {
        subtitle: 'Settings saved successfully.',
      });
    } catch (error: any) {
      console.error('Error updating final exam:', error);
      toastError('Failed to update final exam', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    } finally {
      setFinalExamSaving(false);
    }
  };

  const handleDisableFinalExam = async () => {
    if (!finalExam?.module) return;
    if (!confirm('Disable the final exam? This will remove all associated questions.')) {
      return;
    }
    try {
      await deleteModule(finalExam.module.id);
      setFinalExam(null);
      setCourseSettings((prev) => ({
        ...prev,
        final_exam_passmark: 70,
        final_exam_max_attempts: 3,
        final_exam_time_limit: '',
      }));
      toastSuccess('Final exam removed', {
        subtitle: 'Learners will no longer see the final exam.',
      });
    } catch (error: any) {
      console.error('Error removing final exam:', error);
      toastError('Failed to remove final exam', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    }
  };

  const handleManageFinalExam = () => {
    if (finalExam?.module && finalExam.content) {
      handleOpenQuizModal(finalExam.module, finalExam.content);
    } else {
      toastError('Final exam not ready yet');
    }
  };

  const resetQuizState = () => {
    setShowQuizModal(false);
    setActiveQuizModule(null);
    setActiveQuizContent(null);
    setActiveQuiz(null);
    setQuizQuestions([]);
    setQuizFormData({
      title: '',
      description: '',
      passing_score: 70,
      max_attempts: 3,
      time_limit_minutes: '',
    });
    setQuestionFormData({
      question_text: '',
      question_type: 'multiple_choice',
      options: [''],
      correct_answer: '',
      points: 1,
    });
  };

  const handleEnableQuiz = async (module: Module) => {
    try {
      toast.info('Creating module quiz...', { duration: 2000 });
      const quizContent = await createContentItem({
        module_id: module.id,
        title: `${module.title} Quiz`,
        content_type: 'quiz',
        is_preview: false,
        is_required: true,
      });
      const quiz = await createQuiz({
        content_item_id: quizContent.id,
        title: `${module.title} Quiz`,
        passing_score: 70,
        max_attempts: 3,
      });
      const enrichedContent = { ...quizContent, quiz };
      setModules((prev) =>
        prev.map((m) =>
          m.id === module.id ? { ...m, content_items: [...(m.content_items || []), enrichedContent] } : m
        )
      );
      toastSuccess('Module quiz enabled', {
        subtitle: 'Add questions to activate this assessment.',
      });
      handleOpenQuizModal(module, enrichedContent);
    } catch (error: any) {
      console.error('Error enabling quiz:', error);
      toastError('Failed to enable quiz', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    }
  };

  const handleDisableQuiz = async (module: Module, quizContentId: string) => {
    if (!confirm('Disable module quiz? All associated questions will be removed.')) {
      return;
    }
    try {
      await deleteContentItem(quizContentId);
      setModules((prev) =>
        prev.map((m) =>
          m.id === module.id
            ? { ...m, content_items: (m.content_items || []).filter((item) => item.id !== quizContentId) }
            : m
        )
      );
      toastSuccess('Module quiz removed', {
        subtitle: 'Learners will no longer see the quiz for this module.',
      });
    } catch (error: any) {
      console.error('Error disabling quiz:', error);
      toastError('Failed to remove quiz', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    }
  };

  const handleOpenQuizModal = async (module: Module, quizContent: ContentItem) => {
    try {
      setQuizLoading(true);
      const content = await getContentItem(quizContent.id);
      const quizData = (content as any).quiz as Quiz | undefined;
      if (!quizData) {
        toastError('Quiz data unavailable', {
          subtitle: 'Please try reloading the page.',
        });
        return;
      }
      setActiveQuizModule(module);
      setActiveQuizContent(quizContent);
      setActiveQuiz(quizData);
      setQuizQuestions((quizData as any).questions || []);
      setQuizFormData({
        title: quizData.title || quizContent.title,
        description: quizData.description || '',
        passing_score: quizData.passing_score || 70,
        max_attempts: quizData.max_attempts || 3,
        time_limit_minutes: quizData.time_limit_minutes?.toString() || '',
      });
      if (finalExam?.content.id === quizContent.id) {
        setFinalExam((prev) =>
          prev
            ? {
                ...prev,
                content: content as QuizContentItem,
                quiz: quizData || prev.quiz,
              }
            : prev
        );
        if (quizData) {
          setCourseSettings((prev) => ({
            ...prev,
            final_exam_passmark: quizData.passing_score ?? prev.final_exam_passmark,
            final_exam_max_attempts: quizData.max_attempts ?? prev.final_exam_max_attempts,
            final_exam_time_limit: quizData.time_limit_minutes?.toString() || '',
          }));
        }
      }
      setShowQuizModal(true);
    } catch (error) {
      console.error('Error loading quiz:', error);
      toastError('Failed to load quiz', {
        subtitle: 'Please try again.',
      });
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!activeQuiz) return;
    if (!questionFormData.question_text.trim()) {
      toastError('Question is required');
      return;
    }
    try {
      const payload: any = {
        question_text: questionFormData.question_text,
        question_type: questionFormData.question_type,
        correct_answer: questionFormData.correct_answer,
        points: questionFormData.points,
      };

      if (questionFormData.question_type === 'multiple_choice') {
        payload.options = questionFormData.options.filter((opt) => opt.trim());
      } else if (questionFormData.question_type === 'true_false') {
        payload.options = ['True', 'False'];
      }

      const newQuestion = await addQuizQuestion(activeQuiz.id, payload);
      setQuizQuestions((prev) => [...prev, newQuestion]);
      setQuestionFormData({
        question_text: '',
        question_type: questionFormData.question_type,
        options: [''],
        correct_answer: '',
        points: 1,
      });
      toastSuccess('Question added', {
        subtitle: 'Remember to add at least one question per quiz.',
      });
    } catch (error: any) {
      console.error('Error adding question:', error);
      toastError('Failed to add question', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    }
  };

  const updateQuestionOption = (index: number, value: string) => {
    setQuestionFormData((prev) => {
      const updated = [...prev.options];
      updated[index] = value;
      return { ...prev, options: updated };
    });
  };

  const addQuestionOption = () => {
    setQuestionFormData((prev) => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeQuestionOption = (index: number) => {
    setQuestionFormData((prev) => {
      const updated = prev.options.filter((_, i) => i !== index);
      return { ...prev, options: updated.length ? updated : [''] };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-emerald-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: BookOpen },
    { id: 'modules' as Tab, label: 'Modules & Content', icon: Layers },
    { id: 'quizzes' as Tab, label: 'Quizzes & Exams', icon: HelpCircle },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
    { id: 'resources' as Tab, label: 'Resources', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/dashboard/admin/courses"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{formData.title || 'Edit Course'}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage course content, settings, and structure</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 font-medium"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter course title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Brief description shown in course cards"
                      maxLength={150}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.short_description.length}/150 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      rows={6}
                      placeholder="Detailed course description..."
                    />
                  </div>
                </div>
              </div>

              {/* Course Settings */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Course Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      disabled={dataLoading}
                    >
                      <option value="">{dataLoading ? 'Loading...' : 'Select Category'}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      disabled={dataLoading}
                    >
                      <option value="">{dataLoading ? 'Loading...' : 'No Department'}</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Courses can be assigned to or removed from departments
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty_level}
                      onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Select Level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.duration_hours}
                      onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., 10.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visibility</label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No tags available. Create tags in Admin → Tags.</p>
                  ) : (
                    tags.map((tag) => {
                      const active = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() =>
                            setSelectedTagIds((prev) =>
                              prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            active
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Hash size={14} className="inline mr-1" />
                          {tag.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Publication Status */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Publication</h2>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="is_published" className="text-gray-900 dark:text-white font-medium cursor-pointer">
                    Publish this course (make it visible to students)
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
              <Link
                to="/dashboard/admin/courses"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Modules & Content Tab */}
        {activeTab === 'modules' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Modules & Content</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Organize your course into modules with videos, PDFs, presentations, and more
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingModule(null);
                  setModuleFormData({ title: '', description: '' });
                  setShowModuleModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                Add Module
              </button>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No modules yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Start building your course by adding your first module
                </p>
                <button
                  onClick={() => {
                    setEditingModule(null);
                    setModuleFormData({ title: '', description: '' });
                    setShowModuleModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus size={18} />
                  Create First Module
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, index) => {
                  const quizContent = getModuleQuizItem(module);
                  return (
                    <div
                      key={module.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                    >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 pt-1">
                        <GripVertical className="text-gray-400 cursor-move" size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Module {index + 1}: {module.title}
                            </h3>
                            {module.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{module.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingModule(module);
                                setModuleFormData({ title: module.title, description: module.description || '' });
                                setShowModuleModal(true);
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
                              title="Edit module"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteModule(module.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                              title="Delete module"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Content Items */}
                        <div className="mt-4 space-y-2">
                          {module.content_items && module.content_items.length > 0 ? (
                            module.content_items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                              >
                                {item.content_type === 'video' && <Video size={18} className="text-blue-600" />}
                                {item.content_type === 'document' && <FileText size={18} className="text-emerald-600" />}
                                {item.content_type === 'quiz' && <HelpCircle size={18} className="text-purple-600" />}
                                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{item.title}</span>
                                {item.duration_minutes && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.duration_minutes} min
                                  </span>
                                )}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDeleteContent(item.id, module.id)}
                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition-colors"
                                    title="Delete content"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No content items yet</p>
                          )}
                          <button
                            onClick={() => {
                              setSelectedModuleId(module.id);
                              setEditingContent(null);
                              setContentFormData({
                                title: '',
                                content_type: 'video',
                                content_url: '',
                                content_text: '',
                                duration_minutes: '',
                                is_preview: false,
                                is_required: true,
                              });
                              setShowContentModal(true);
                            }}
                            className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium mt-2"
                          >
                            <Plus size={16} />
                            Add Content
                          </button>
                        </div>

                        {/* Module Quiz Toggle */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">Module Quiz</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Keep learners accountable at the end of this module
                              </p>
                            </div>
                            {quizContent ? (
                              <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                                Enabled
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">
                                Disabled
                              </span>
                            )}
                          </div>

                          {quizContent ? (
                            <div className="flex flex-col gap-3 rounded-lg border border-emerald-100 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                                    {quizContent.title}
                                  </p>
                                  <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                                    {(quizContent as any)?.quiz?.questions?.length
                                      ? `${(quizContent as any).quiz.questions.length} questions`
                                      : 'No questions yet'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenQuizModal(module, quizContent)}
                                    className="px-3 py-1.5 rounded-lg bg-white text-emerald-700 text-xs font-semibold shadow-sm hover:bg-emerald-100 transition-colors"
                                  >
                                    Manage
                                  </button>
                                  <button
                                    onClick={() => handleDisableQuiz(module, quizContent.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xs">
                                Enable a quick quiz to reinforce learning for this module.
                              </p>
                              <button
                                onClick={() => handleEnableQuiz(module)}
                                className="px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                              >
                                Enable Quiz
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Quizzes & Exams Tab */}
        {activeTab === 'quizzes' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="space-y-6">
              {/* Final Exam Configuration */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Final Exam</h2>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 space-y-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Course Completion Exam</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Configure the final assessment learners must pass to finish this course.
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        finalExam
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {finalExam ? 'Enabled' : 'Not configured'}
                    </span>
                  </div>

                  {finalExam ? (
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-800 bg-white dark:bg-emerald-900/10">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Pass mark</p>
                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">
                          {finalExam.quiz?.passing_score ?? courseSettings.final_exam_passmark}%
                        </p>
                      </div>
                      <div className="px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-800 bg-white dark:bg-emerald-900/10">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Max attempts</p>
                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">
                          {finalExam.quiz?.max_attempts ?? courseSettings.final_exam_max_attempts}
                        </p>
                      </div>
                      <div className="px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-800 bg-white dark:bg-emerald-900/10">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Time limit</p>
                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">
                          {finalExam.quiz?.time_limit_minutes
                            ? `${finalExam.quiz?.time_limit_minutes} min`
                            : 'Not set'}
                        </p>
                      </div>
                      <div className="flex-1 text-right">
                        <button
                          onClick={handleManageFinalExam}
                          className="px-4 py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Manage Questions
                        </button>
                        <button
                          onClick={handleDisableFinalExam}
                          className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                          Disable
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800/70 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg">
                        Require learners to pass a comprehensive exam before they receive badges or certificates.
                      </p>
                      <button
                        onClick={handleCreateFinalExam}
                        disabled={finalExamLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-60"
                      >
                        {finalExamLoading ? 'Creating...' : 'Create Final Exam'}
                      </button>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateFinalExamSettings();
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Passing Score (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={courseSettings.final_exam_passmark}
                        onChange={(e) =>
                          setCourseSettings({
                            ...courseSettings,
                            final_exam_passmark: parseInt(e.target.value) || 70,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Attempts <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={courseSettings.final_exam_max_attempts}
                        onChange={(e) =>
                          setCourseSettings({
                            ...courseSettings,
                            final_exam_max_attempts: parseInt(e.target.value) || 3,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={courseSettings.final_exam_time_limit}
                        onChange={(e) =>
                          setCourseSettings({
                            ...courseSettings,
                            final_exam_time_limit: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-60"
                        disabled={finalExamLoading || finalExamSaving}
                      >
                        {finalExam ? (finalExamSaving ? 'Saving...' : 'Update Settings') : 'Save Defaults'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Module Quizzes */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Module Quizzes</h2>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Require Module Quizzes</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        When enabled, each module can have an optional quiz at the end
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseSettings.module_quiz_required}
                        onChange={(e) =>
                          setCourseSettings({ ...courseSettings, module_quiz_required: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
            {/* Badge & Certificate */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Badge & Certificate</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Completion Badge
                  </label>
                  <select
                    value={courseSettings.badge_id}
                    onChange={(e) => setCourseSettings({ ...courseSettings, badge_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">No Badge</option>
                    {badges.map((badge) => (
                      <option key={badge.id} value={badge.id}>
                        {badge.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Badge awarded upon course completion
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Issue Certificate</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Generate a certificate when students complete the course
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={courseSettings.certificate_enabled}
                      onChange={(e) =>
                        setCourseSettings({ ...courseSettings, certificate_enabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Learning Path Assignment */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Learning Path Assignment</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Auto-Assign to Learning Path
                </label>
                <select
                  value={courseSettings.auto_assign_learning_path}
                  onChange={(e) =>
                    setCourseSettings({ ...courseSettings, auto_assign_learning_path: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">No Auto-Assignment</option>
                  <option value="onboarding">Onboarding (Auto-assign to new users)</option>
                  <option value="company_policies">Company Policies (Auto-assign to new users)</option>
                  {learningPaths.map((path) => (
                    <option key={path.id} value={path.id}>
                      {path.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Courses can be automatically assigned when users are created (e.g., onboarding, company policies)
                </p>
              </div>
            </div>

            {/* Department Assignment */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Department Assignment</h2>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current department: <span className="font-medium">{formData.department_id ? 'Assigned' : 'Not assigned'}</span>
                </p>
                <div className="flex items-center gap-3">
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Remove from Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Downloadable Resources</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Add PDFs, documents, and other files that learners can download
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                <Plus size={18} />
                Add Resource
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Enable Downloads</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow learners to download course resources
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={courseSettings.downloadable_resources}
                  onChange={(e) =>
                    setCourseSettings({ ...courseSettings, downloadable_resources: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="text-center py-12">
              <Download className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No resources yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Add downloadable files that learners can access after enrollment
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModuleModal(false);
              setEditingModule(null);
              setModuleFormData({ title: '', description: '' });
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingModule ? 'Edit Module' : 'Create Module'}
                </h3>
                <button
                  onClick={() => {
                    setShowModuleModal(false);
                    setEditingModule(null);
                    setModuleFormData({ title: '', description: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Module Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={moduleFormData.title}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Introduction to React"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={moduleFormData.description}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Optional description for this module"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModuleModal(false);
                    setEditingModule(null);
                    setModuleFormData({ title: '', description: '' });
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingModule ? handleUpdateModule : handleCreateModule}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingModule ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {showContentModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowContentModal(false);
              setSelectedModuleId(null);
              setEditingContent(null);
              setContentFormData({
                title: '',
                content_type: 'video',
                content_url: '',
                content_text: '',
                duration_minutes: '',
                is_preview: false,
                is_required: true,
              });
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingContent ? 'Edit Content' : 'Add Content'}
                </h3>
                <button
                  onClick={() => {
                    setShowContentModal(false);
                    setSelectedModuleId(null);
                    setEditingContent(null);
                    setContentFormData({
                      title: '',
                      content_type: 'video',
                      content_url: '',
                      content_text: '',
                      duration_minutes: '',
                      is_preview: false,
                      is_required: true,
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contentFormData.title}
                    onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Introduction Video"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contentFormData.content_type}
                    onChange={(e) =>
                      setContentFormData({
                        ...contentFormData,
                        content_type: e.target.value as ContentItem['content_type'],
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="video">Video</option>
                    <option value="document">Document (PDF, PPT)</option>
                    <option value="text">Text Content</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>

                {(contentFormData.content_type === 'video' || contentFormData.content_type === 'document') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content URL
                    </label>
                    <input
                      type="url"
                      value={contentFormData.content_url}
                      onChange={(e) => setContentFormData({ ...contentFormData, content_url: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                )}

                {contentFormData.content_type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content Text
                    </label>
                    <textarea
                      value={contentFormData.content_text}
                      onChange={(e) => setContentFormData({ ...contentFormData, content_text: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      rows={5}
                      placeholder="Enter text content..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={contentFormData.duration_minutes}
                    onChange={(e) => setContentFormData({ ...contentFormData, duration_minutes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., 15"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentFormData.is_preview}
                      onChange={(e) => setContentFormData({ ...contentFormData, is_preview: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Preview (free access)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentFormData.is_required}
                      onChange={(e) => setContentFormData({ ...contentFormData, is_required: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Required</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowContentModal(false);
                    setSelectedModuleId(null);
                    setEditingContent(null);
                    setContentFormData({
                      title: '',
                      content_type: 'video',
                      content_url: '',
                      content_text: '',
                      duration_minutes: '',
                      is_preview: false,
                      is_required: true,
                    });
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateContent}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Content
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetQuizState();
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl border border-gray-200 dark:border-gray-700 max-h-[92vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Module Quiz</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {quizFormData.title || activeQuizContent?.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activeQuizModule?.title} · Passing score {quizFormData.passing_score}% · Max attempts{' '}
                    {quizFormData.max_attempts}
                  </p>
                </div>
                <button
                  onClick={resetQuizState}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={22} />
                </button>
              </div>

              {quizLoading ? (
                <div className="py-20 text-center text-gray-500 dark:text-gray-400">Loading quiz...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Questions</h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {quizQuestions.length} / unlimited
                        </span>
                      </div>

                      {quizQuestions.length === 0 ? (
                        <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No questions yet. Add your first multiple-choice, true/false, or short answer question.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {quizQuestions.map((question, idx) => (
                            <div
                              key={question.id}
                              className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/60 dark:bg-gray-700/30"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Q{idx + 1} · {question.question_type.replace('_', ' ')}
                                  </p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {question.question_text}
                                  </p>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                                  {question.points} pts
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-2 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-gray-50/60 dark:bg-gray-900/40 space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Add Question</h4>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Question Type
                        </label>
                        <select
                          value={questionFormData.question_type}
                          onChange={(e) => {
                            const nextType = e.target.value as QuizQuestion['question_type'];
                            setQuestionFormData((prev) => ({
                              ...prev,
                              question_type: nextType,
                              options: nextType === 'multiple_choice' ? [''] : prev.options,
                              correct_answer: nextType === 'true_false' ? 'True' : '',
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True / False</option>
                          <option value="short_answer">Short Answer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Question
                        </label>
                        <textarea
                          value={questionFormData.question_text}
                          onChange={(e) =>
                            setQuestionFormData((prev) => ({ ...prev, question_text: e.target.value }))
                          }
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Ask something meaningful..."
                        />
                      </div>

                      {questionFormData.question_type === 'multiple_choice' && (
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Options
                          </label>
                          {questionFormData.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateQuestionOption(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder={`Option ${index + 1}`}
                              />
                              {questionFormData.options.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeQuestionOption(index)}
                                  className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addQuestionOption}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            + Add option
                          </button>
                        </div>
                      )}

                      {questionFormData.question_type === 'true_false' && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                            Correct Answer
                          </label>
                          <select
                            value={questionFormData.correct_answer || 'True'}
                            onChange={(e) =>
                              setQuestionFormData((prev) => ({ ...prev, correct_answer: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="True">True</option>
                            <option value="False">False</option>
                          </select>
                        </div>
                      )}

                      {questionFormData.question_type !== 'true_false' && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                            Correct Answer
                          </label>
                          <input
                            type="text"
                            value={questionFormData.correct_answer}
                            onChange={(e) =>
                              setQuestionFormData((prev) => ({ ...prev, correct_answer: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                            Points
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={questionFormData.points}
                            onChange={(e) =>
                              setQuestionFormData((prev) => ({ ...prev, points: parseInt(e.target.value) || 1 }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleAddQuestion}
                        className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeleteConfirm(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Trash2 className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Course?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You're about to delete <span className="font-semibold text-red-600 dark:text-red-400">{formData.title}</span>. 
                  This will permanently remove the course, all modules, content, and student progress.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
