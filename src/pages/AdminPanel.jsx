import { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, ShieldCheck, Activity, Database, CheckCircle, 
  XCircle, FileText, AlertTriangle, Settings, Check, X, Clock, Server, Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useKnowledge } from '../context/KnowledgeContext';
import { useTranslation } from 'react-i18next';

const users = [
  { id: 1, name: 'Dr. Faisal', nameKey: 'faisal', email: 'faisal@narc.gov.pk', role: 'Researcher', status: 'Active', login: '2 mins ago', loginKey: 'min2' },
  { id: 2, name: 'Ahmad Khan', nameKey: 'ahmad', email: 'ahmad@farmer.pk', role: 'Farmer', status: 'Active', login: '1 hr ago', loginKey: 'hr1' },
  { id: 3, name: 'System Admin', nameKey: 'admin', email: 'admin@peanutiq.pk', role: 'Admin', status: 'Active', login: 'Just now', loginKey: 'justNow' },
  { id: 4, name: 'Ali Raza', nameKey: 'ali', email: 'ali@farmer.pk', role: 'Farmer', status: 'Suspended', login: '2 weeks ago', loginKey: 'weeks2' },
];


const issues = [
  { id: 1, title: 'Image Upload Timeout on 3G Networks', titleKey: 'uploadTimeout', status: 'Open', priority: 'High', reporter: 'Ahmad Khan', reporterKey: 'ahmad' },
  { id: 2, title: 'Incorrect Translation in Sindhi UI', titleKey: 'sindhiTranslation', status: 'In Progress', priority: 'Medium', reporter: 'System Monitor', reporterKey: 'systemMonitor' },
];

const ALL_TABS = [
  { id: 'users', translationKey: 'admin.management.usersAndRoles', icon: UsersIcon, allowedRoles: ['admin'] },
  { id: 'content', translationKey: 'admin.management.contentVerification', icon: FileText, allowedRoles: ['admin'] },
  { id: 'ai', translationKey: 'admin.management.aiMonitoring', icon: Brain, allowedRoles: ['admin', 'researcher'] },
  { id: 'issues', translationKey: 'admin.management.issuesMaintenance', icon: Settings, allowedRoles: ['admin'] },
];

export default function AdminPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  // Safe fallback to 'admin' if role is undefined just in case
  const role = user?.role || 'admin';
  
  const authorizedTabs = ALL_TABS.filter(tab => tab.allowedRoles.includes(role));
  const defaultTab = authorizedTabs.length > 0 ? authorizedTabs[0].id : '';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [userList, setUserList] = useState(users);
  
  const { pendingArticles, approveArticle, rejectArticle } = useKnowledge();

  // If role changes, ensure we aren't stuck on an unauthorized tab
  useEffect(() => {
    if (!authorizedTabs.find(t => t.id === activeTab)) {
      setActiveTab(defaultTab);
    }
  }, [role, activeTab, defaultTab, authorizedTabs]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [reviewingContentId, setReviewingContentId] = useState(null);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newUser = {
      id: Date.now(),
      name: fd.get('name'),
      email: fd.get('email'),
      role: fd.get('role'),
      status: 'Active',
      login: 'Never'
    };
    setUserList([...userList, newUser]);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setUserList(userList.map(u => u.id === editingUserId ? { ...u, role: fd.get('role') } : u));
    setEditingUserId(null);
  };

  const toggleUserStatus = (id) => {
    setUserList(userList.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return u;
    }));
  };

  const handleContentAction = (id, action) => {
    if (action === 'approve') {
      approveArticle(id);
    } else if (action === 'reject') {
      rejectArticle(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.management.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('admin.management.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {authorizedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className={`w-5 h-5 rtl:ml-2 ltr:mr-2 ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'}`} />
              {t(tab.translationKey)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      
      {/* 1. Users & Roles Tab */}
      {activeTab === 'users' && role === 'admin' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.management.userAccountsManagement')}</h3>
              <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 cursor-pointer">{t('admin.management.addUser')}</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.dashboard.farmer')}</th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.management.role')}</th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.management.status')}</th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.management.lastLogin')}</th>
                    <th className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.management.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userList.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full" src={`https://ui-avatars.com/api/?name=${user.name.replace(' ','+')}&background=16a34a&color=fff`} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.nameKey ? t(`admin.management.names.${user.nameKey}`) : user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {t(`admin.management.roles.${user.role.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {t(`admin.management.statuses.${user.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.loginKey ? t(`admin.management.times.${user.loginKey}`) : user.login}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                        <button onClick={() => setEditingUserId(user.id)} className="text-indigo-600 hover:text-indigo-900 mx-3 cursor-pointer">{t('admin.management.editRole')}</button>
                        {user.status === 'Active' ? (
                          <button onClick={() => toggleUserStatus(user.id)} className="text-red-600 hover:text-red-900 inline-flex items-center cursor-pointer"><XCircle className="w-4 h-4 mx-1"/> {t('admin.management.suspend')}</button>
                        ) : (
                          <button onClick={() => toggleUserStatus(user.id)} className="text-green-600 hover:text-green-900 inline-flex items-center cursor-pointer"><CheckCircle className="w-4 h-4 mx-1"/> {t('admin.management.activate')}</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Content Verification Tab */}
      {activeTab === 'content' && role === 'admin' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="mx-3">
                <h3 className="text-sm font-medium text-yellow-800">{t('admin.management.reviewRequired')}</h3>
                <p className="text-sm text-yellow-700 mt-1">{t('admin.management.reviewRequiredDesc')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.management.pendingApprovals')} ({pendingArticles.length})</h3>
            </div>
            
            {pendingArticles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">{t('admin.management.noPendingArticles')}</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pendingArticles.map(item => (
                  <li key={item.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded uppercase">{item.typeKey ? t(`admin.management.contentData.${item.typeKey}`) : item.type}</span>
                          <span className="text-sm text-gray-500 flex items-center"><Clock className="w-3 h-3 mx-1"/> {item.dateKey ? t(`admin.management.contentData.${item.dateKey}`) : item.date}</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{item.titleKey ? t(`admin.management.contentData.${item.titleKey}`) : item.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{t('admin.management.contentData.by', 'By')} {item.authorKey ? t(`admin.management.names.${item.authorKey}`) : item.author}</p>
                      </div>
                      <div className="flex space-x-3 rtl:space-x-reverse">
                        <button onClick={() => setReviewingContentId(item.id)} className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">{t('admin.management.reviewDocument')}</button>
                        <button onClick={() => handleContentAction(item.id, 'reject')} className="p-2 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X className="w-5 h-5"/></button>
                        <button onClick={() => handleContentAction(item.id, 'approve')} className="p-2 border border-green-200 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check className="w-5 h-5"/></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 3. AI Monitoring Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium text-sm">{t('admin.management.seedIntelligenceCNN')}</h3>
                <Brain className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-end space-x-2 rtl:space-x-reverse">
                <span className="text-3xl font-bold text-gray-900">98.4%</span>
                <span className="text-sm text-green-600 font-medium mb-1">{t('admin.management.accuracy')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '98.4%' }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium text-sm">{t('admin.management.diseaseDetectionCNN')}</h3>
                <Brain className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-end space-x-2 rtl:space-x-reverse">
                <span className="text-3xl font-bold text-gray-900">94.2%</span>
                <span className="text-sm text-blue-600 font-medium mb-1">{t('admin.management.accuracy')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '94.2%' }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium text-sm">Avg Inference Time</h3>
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-bold text-gray-900">1.2s</span>
                <span className="text-sm text-gray-500 font-medium mb-1">per image</span>
              </div>
              <div className="mt-4 text-xs text-gray-500">API Load: 342 req/min</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Issues & Maintenance Tab */}
      {activeTab === 'issues' && role === 'admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.management.openIssues')}</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {issues.map(issue => (
                  <li key={issue.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${issue.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {t(`admin.management.priorities.${issue.priority.toLowerCase()}`)} Priority
                          </span>
                          <span className="text-sm text-gray-500">Reported by {issue.reporterKey ? t(`admin.management.names.${issue.reporterKey}`) : issue.reporter}</span>
                        </div>
                        <h4 className="text-md font-bold text-gray-900">{issue.titleKey ? t(`admin.management.issues.${issue.titleKey}`) : issue.title}</h4>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${issue.status === 'Open' ? 'border-red-200 text-red-700 bg-red-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                          {t(`admin.management.issueStatuses.${issue.status === 'In Progress' ? 'inProgress' : issue.status.toLowerCase()}`)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                <Server className="w-6 h-6 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.management.systemMaintenance')}</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">{t('admin.management.maintenance.nextWindow', 'Next Scheduled Window')}</h4>
                  <p className="text-sm text-gray-600 mt-1">{t('admin.management.maintenance.date', 'Saturday, 15 Aug 2026')}</p>
                  <p className="text-sm text-gray-500" dir="ltr">{t('admin.management.maintenance.time', '02:00 AM - 04:00 AM PKT')}</p>
                </div>
                <button 
                  onClick={() => alert(t('admin.management.maintenance.scheduledSuccess', 'Maintenance scheduled successfully!'))}
                  className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  {t('admin.management.maintenance.schedule', 'Schedule Maintenance')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    {/* Add User Modal */}
    {isAddModalOpen && (
      <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">{t('admin.management.addNewUser')}</h3>
            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
          </div>
          <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.management.modals.fullName', 'Full Name')}</label>
              <input name="name" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.management.modals.emailAddress', 'Email Address')}</label>
              <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.management.modals.roleLabel', 'Role')}</label>
              <select name="role" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                <option value="Farmer">{t('admin.management.roles.farmer', 'Farmer')}</option>
                <option value="Researcher">{t('admin.management.roles.researcher', 'Researcher')}</option>
                <option value="Admin">{t('admin.management.roles.admin', 'Admin')}</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium cursor-pointer">{t('admin.management.cancel', 'Cancel')}</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer">{t('admin.management.addUser', 'Add User')}</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Edit Role Modal */}
    {editingUserId && (
      <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">{t('admin.management.editRole')}</h3>
            <button onClick={() => setEditingUserId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
          </div>
          <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
            <div className="mb-4">
              <p className="text-sm text-gray-500">{t('admin.management.modals.updatingRoleFor', 'Updating role for:')} <span className="font-bold text-gray-900">{userList.find(u => u.id === editingUserId)?.nameKey ? t(`admin.management.names.${userList.find(u => u.id === editingUserId)?.nameKey}`) : userList.find(u => u.id === editingUserId)?.name}</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.management.modals.roleLabel', 'Role')}</label>
              <select name="role" defaultValue={userList.find(u => u.id === editingUserId)?.role} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                <option value="Farmer">{t('admin.management.roles.farmer', 'Farmer')}</option>
                <option value="Researcher">{t('admin.management.roles.researcher', 'Researcher')}</option>
                <option value="Admin">{t('admin.management.roles.admin', 'Admin')}</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setEditingUserId(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium cursor-pointer">{t('admin.management.modals.cancel', 'Cancel')}</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium cursor-pointer">{t('admin.management.modals.saveChanges', 'Save Changes')}</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Review Document Modal */}
    {reviewingContentId && (
      <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900">{t('admin.management.modals.documentReview', 'Document Review')}</h3>
            <button onClick={() => setReviewingContentId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            {pendingArticles.find(c => c.id === reviewingContentId) && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded uppercase">
                    {pendingArticles.find(c => c.id === reviewingContentId).typeKey ? t(`admin.management.contentData.${pendingArticles.find(c => c.id === reviewingContentId).typeKey}`) : pendingArticles.find(c => c.id === reviewingContentId).type}
                  </span>
                  <span>•</span>
                  <span>{t('admin.management.contentData.by', 'By')} {pendingArticles.find(c => c.id === reviewingContentId).authorKey ? t(`admin.management.names.${pendingArticles.find(c => c.id === reviewingContentId).authorKey}`) : pendingArticles.find(c => c.id === reviewingContentId).author}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {pendingArticles.find(c => c.id === reviewingContentId).titleKey ? t(`admin.management.contentData.${pendingArticles.find(c => c.id === reviewingContentId).titleKey}`) : pendingArticles.find(c => c.id === reviewingContentId).title}
                </h2>
                
                <div className="prose prose-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p>
                    {pendingArticles.find(c => c.id === reviewingContentId).contentKey ? t(`admin.management.contentData.${pendingArticles.find(c => c.id === reviewingContentId).contentKey}`) : (pendingArticles.find(c => c.id === reviewingContentId).content || pendingArticles.find(c => c.id === reviewingContentId).excerpt)}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
            <button 
              onClick={() => {
                handleContentAction(reviewingContentId, 'reject');
                setReviewingContentId(null);
              }} 
              className="px-4 py-2 border border-red-300 text-red-700 bg-white rounded-lg hover:bg-red-50 font-medium cursor-pointer"
            >
              {t('admin.management.modals.rejectDocument', 'Reject Document')}
            </button>
            <button 
              onClick={() => {
                handleContentAction(reviewingContentId, 'approve');
                setReviewingContentId(null);
              }} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer"
            >
              {t('admin.management.modals.approvePublish', 'Approve & Publish')}
            </button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
}
