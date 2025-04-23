// src/pages/Communications.jsx
import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { 
  PlusIcon, 
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  MegaphoneIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import Loading from '../components/Loading';
import Error from '../components/Error';

export default function Communications() {
  const [view, setView] = useState('templates'); // 'templates' or 'announcements'
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'pre-race',
  });
  const [sendEmailForm, setSendEmailForm] = useState({
    templateId: '',
    subject: '',
    categories: []
  });
  const [sendAnnouncementForm, setSendAnnouncementForm] = useState({
    title: '',
    message: '',
    categories: [],
    scheduleDate: ''
  });
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);

  useEffect(() => {
    if (view === 'templates') {
      fetchTemplates();
    }
  }, [view]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // In a real application, we would fetch from the API
      // const response = await axios.get('/communications/templates');
      // setTemplates(response.data.data);
      
      // Mock data for demonstration
      const mockTemplates = [
        {
          _id: '1',
          name: 'Pre-Race Information',
          subject: 'Get Ready for the Victoria Falls Marathon!',
          content: `<h1>Get Ready for Race Day!</h1>
          <p>Dear {{runner.name}},</p>
          <p>We're excited to have you join us for the {{race.name}}. Here are some important details to help you prepare:</p>
          <ul>
            <li>Race Date: {{race.date}}</li>
            <li>Your Runner Number: {{runner.number}}</li>
            <li>Start Time: 7:00 AM</li>
          </ul>
          <p>Make sure to get plenty of rest, stay hydrated, and arrive early!</p>
          <p>Best of luck,</p>
          <p>The Econet Marathon Team</p>`,
          category: 'pre-race',
          variables: ['runner.name', 'runner.number', 'race.name', 'race.date'],
          createdAt: '2023-04-10T08:00:00.000Z'
        },
        {
          _id: '2',
          name: 'Race Day Instructions',
          subject: 'Important Instructions for Today\'s Marathon',
          content: `<h1>Race Day Instructions</h1>
          <p>Dear {{runner.name}},</p>
          <p>Today's the day! Here are your final instructions for the {{race.name}}:</p>
          <ul>
            <li>Your Runner Number: {{runner.number}}</li>
            <li>Start Time: 7:00 AM</li>
            <li>Starting Point: Victoria Falls Hotel Entrance</li>
          </ul>
          <p>Remember to stay hydrated and pace yourself!</p>
          <p>Good luck,</p>
          <p>The Econet Marathon Team</p>`,
          category: 'race-day',
          variables: ['runner.name', 'runner.number', 'race.name'],
          createdAt: '2023-04-15T08:00:00.000Z'
        },
        {
          _id: '3',
          name: 'Post-Race Congratulations',
          subject: 'Congratulations on Completing the Marathon!',
          content: `<h1>Congratulations!</h1>
          <p>Dear {{runner.name}},</p>
          <p>You did it! You successfully completed the {{race.name}}. What an amazing achievement!</p>
          <p>Your certificate is now available in the app. We hope you enjoyed the experience and look forward to seeing you at our next event.</p>
          <p>Thank you for participating,</p>
          <p>The Econet Marathon Team</p>`,
          category: 'post-race',
          variables: ['runner.name', 'race.name'],
          createdAt: '2023-04-16T08:00:00.000Z'
        }
      ];
      
      setTemplates(mockTemplates);
      setError(null);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err.response?.data?.message || 'Failed to fetch email templates');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (template = null) => {
    if (template) {
      setCurrentTemplate(template);
      setFormData({
        name: template.name,
        subject: template.subject,
        content: template.content,
        category: template.category
      });
    } else {
      setCurrentTemplate(null);
      setFormData({
        name: '',
        subject: '',
        content: '',
        category: 'pre-race'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTemplate(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // In a real application, we would submit to the API
      if (currentTemplate) {
        // Update existing template
        // const response = await axios.put(`/communications/templates/${currentTemplate._id}`, formData);
        // Update the templates array with the updated template
        setTemplates(templates.map(template => 
          template._id === currentTemplate._id ? { ...template, ...formData } : template
        ));
      } else {
        // Create new template
        // const response = await axios.post('/communications/templates', formData);
        // Add the new template to the templates array
        const newTemplate = {
          _id: `${templates.length + 1}`,
          ...formData,
          variables: extractVariables(formData.content),
          createdAt: new Date().toISOString()
        };
        setTemplates([...templates, newTemplate]);
      }
      
      closeModal();
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.response?.data?.message || 'Failed to save email template');
    } finally {
      setLoading(false);
    }
  };

  const extractVariables = (content) => {
    // Simple regex to extract variables like {{variable}}
    const regex = /{{([^}]+)}}/g;
    const matches = content.match(regex) || [];
    return [...new Set(matches.map(match => match.slice(2, -2).trim()))];
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      // In a real application, we would call the API
      // await axios.delete(`/communications/templates/${templateId}`);
      
      // Remove from the templates array
      setTemplates(templates.filter(template => template._id !== templateId));
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err.response?.data?.message || 'Failed to delete template');
    }
  };

  const openSendModal = () => {
    if (templates.length === 0) {
      alert('No templates available. Please create a template first.');
      return;
    }
    
    setSendEmailForm({
      templateId: templates[0]._id,
      subject: templates[0].subject,
      categories: []
    });
    
    setIsSendModalOpen(true);
  };

  const closeSendModal = () => {
    setIsSendModalOpen(false);
  };

  const handleSendEmailFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'templateId') {
      const selectedTemplate = templates.find(template => template._id === value);
      setSendEmailForm({
        ...sendEmailForm,
        templateId: value,
        subject: selectedTemplate.subject
      });
    } else if (type === 'checkbox') {
      const categories = [...sendEmailForm.categories];
      if (checked) {
        categories.push(value);
      } else {
        const index = categories.indexOf(value);
        if (index !== -1) {
          categories.splice(index, 1);
        }
      }
      setSendEmailForm({
        ...sendEmailForm,
        categories
      });
    } else {
      setSendEmailForm({
        ...sendEmailForm,
        [name]: value
      });
    }
  };

  const handleSendAnnouncementFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const categories = [...sendAnnouncementForm.categories];
      if (checked) {
        categories.push(value);
      } else {
        const index = categories.indexOf(value);
        if (index !== -1) {
          categories.splice(index, 1);
        }
      }
      setSendAnnouncementForm({
        ...sendAnnouncementForm,
        categories
      });
    } else {
      setSendAnnouncementForm({
        ...sendAnnouncementForm,
        [name]: value
      });
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    
    if (sendEmailForm.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    
    try {
      setIsSendingEmail(true);
      
      // In a real application, we would call the API
      // await axios.post('/communications/email', sendEmailForm);
      
      // Simulate API call
      setTimeout(() => {
        setIsSendingEmail(false);
        closeSendModal();
        alert('Email notification queued successfully!');
      }, 1500);
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.response?.data?.message || 'Failed to send email notification');
      setIsSendingEmail(false);
    }
  };

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    
    if (sendAnnouncementForm.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    
    try {
      setIsSendingAnnouncement(true);
      
      // In a real application, we would call the API
      // await axios.post('/communications/announce', sendAnnouncementForm);
      
      // Simulate API call
      setTimeout(() => {
        setIsSendingAnnouncement(false);
        setSendAnnouncementForm({
          title: '',
          message: '',
          categories: [],
          scheduleDate: ''
        });
        alert('Announcement sent successfully!');
      }, 1500);
    } catch (err) {
      console.error('Error sending announcement:', err);
      setError(err.response?.data?.message || 'Failed to send announcement');
      setIsSendingAnnouncement(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Template Modal
  const TemplateModal = () => (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {currentTemplate ? 'Edit Email Template' : 'Create New Email Template'}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Template Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="pre-race">Pre-Race</option>
                        <option value="race-day">Race Day</option>
                        <option value="post-race">Post-Race</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Email Content (HTML)
                      </label>
                      <div className="mt-1 text-xs text-gray-500">
                        Available variables: {'{{'} runner.name {'}}'},  {'{{'} runner.number {'}}'},  {'{{'} race.name {'}}'},  {'{{'} race.date {'}}'}
                      </div>
                      <textarea
                        name="content"
                        id="content"
                        rows="10"
                        value={formData.content}
                        onChange={handleInputChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {currentTemplate ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Send Email Modal
  const SendEmailModal = () => (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeSendModal}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={sendEmail}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Send Email Notification
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">
                        Email Template
                      </label>
                      <select
                        name="templateId"
                        id="templateId"
                        value={sendEmailForm.templateId}
                        onChange={handleSendEmailFormChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        {templates.map(template => (
                          <option key={template._id} value={template._id}>{template.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        value={sendEmailForm.subject}
                        onChange={handleSendEmailFormChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Send to Categories
                      </label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                          <input
                            id="category-half"
                            name="categories"
                            type="checkbox"
                            value="Half Marathon"
                            checked={sendEmailForm.categories.includes('Half Marathon')}
                            onChange={handleSendEmailFormChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="category-half" className="ml-2 block text-sm text-gray-900">
                            Half Marathon
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="category-full"
                            name="categories"
                            type="checkbox"
                            value="Full Marathon"
                            checked={sendEmailForm.categories.includes('Full Marathon')}
                            onChange={handleSendEmailFormChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="category-full" className="ml-2 block text-sm text-gray-900">
                            Full Marathon
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="category-fun"
                            name="categories"
                            type="checkbox"
                            value="Fun Run"
                            checked={sendEmailForm.categories.includes('Fun Run')}
                            onChange={handleSendEmailFormChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="category-fun" className="ml-2 block text-sm text-gray-900">
                            Fun Run
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSendingEmail}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingEmail ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Email'
                )}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={closeSendModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const TemplatesView = () => (
    <>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Email Templates</h1>
          <p className="mt-1 text-sm text-gray-500">Manage email templates for runner communications</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Create Template
          </button>
          <button
            type="button"
            onClick={openSendModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <EnvelopeIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Send Email
          </button>
        </div>
      </div>

      {/* Templates List */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="px-6 py-4 flex items-center justify-center">
            <Loading />
          </div>
        ) : templates.length === 0 ? (
          <div className="px-6 py-4 text-center text-gray-500">
            No email templates available. Create your first template to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {templates.map((template) => (
              <li key={template._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">
                        <EnvelopeIcon className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500">{template.subject}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => openModal(template)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(template._id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        {template.category === 'pre-race'
                          ? 'Pre-Race'
                          : template.category === 'race-day'
                          ? 'Race Day'
                          : 'Post-Race'}
                      </span>
                      <span>Created on {formatDate(template.createdAt)}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-500 line-clamp-2 overflow-hidden">
                      <span dangerouslySetInnerHTML={{ __html: template.content.replace(/<[^>]*>?/gm, '') }} />
                    </div>
                  </div>
                  {template.variables && template.variables.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.variables.map((variable, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {variable}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && <TemplateModal />}
      {isSendModalOpen && <SendEmailModal />}
    </>
  );

  const AnnouncementsView = () => (
    <>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Send Announcements</h1>
        <p className="mt-1 text-sm text-gray-500">Send in-app announcements to runners</p>
      </div>

      {/* Send Announcement Form */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={sendAnnouncement}>
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Announcement Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={sendAnnouncementForm.title}
                  onChange={handleSendAnnouncementFormChange}
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Race Day Weather Update"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  value={sendAnnouncementForm.message}
                  onChange={handleSendAnnouncementFormChange}
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Due to expected rain, please bring appropriate gear for the marathon tomorrow."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Send to Categories
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="announcement-half"
                      name="categories"
                      type="checkbox"
                      value="Half Marathon"
                      checked={sendAnnouncementForm.categories.includes('Half Marathon')}
                      onChange={handleSendAnnouncementFormChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="announcement-half" className="ml-2 block text-sm text-gray-900">
                      Half Marathon
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="announcement-full"
                      name="categories"
                      type="checkbox"
                      value="Full Marathon"
                      checked={sendAnnouncementForm.categories.includes('Full Marathon')}
                      onChange={handleSendAnnouncementFormChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="announcement-full" className="ml-2 block text-sm text-gray-900">
                      Full Marathon
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="announcement-fun"
                      name="categories"
                      type="checkbox"
                      value="Fun Run"
                      checked={sendAnnouncementForm.categories.includes('Fun Run')}
                      onChange={handleSendAnnouncementFormChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="announcement-fun" className="ml-2 block text-sm text-gray-900">
                      Fun Run
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700">
                  Schedule Date/Time (Optional)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="datetime-local"
                    name="scheduleDate"
                    id="scheduleDate"
                    value={sendAnnouncementForm.scheduleDate}
                    onChange={handleSendAnnouncementFormChange}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty to send immediately
                </p>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSendingAnnouncement}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingAnnouncement ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <MegaphoneIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Send Announcement
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setView('templates')}
            className={`${
              view === 'templates'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
          >
            Email Templates
          </button>
          <button
            onClick={() => setView('announcements')}
            className={`${
              view === 'announcements'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Announcements
          </button>
        </nav>
      </div>

      {/* View Content */}
      {view === 'templates' ? <TemplatesView /> : <AnnouncementsView />}
    </div>
  );
}