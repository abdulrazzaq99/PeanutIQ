import { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, ShieldCheck, Activity, Database, CheckCircle, 
  XCircle, FileText, AlertTriangle, Settings, Check, X, Clock, Server, Brain,
  Bean, ScanSearch, Edit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useKnowledge } from '../context/KnowledgeContext';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import farmBannerBg from '../assets/farm-banner-bg.png';
import Logo from '../components/Logo';

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
  const { showToast } = useToast();
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
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      


      {/* Tabs */}
      <div className="bg-white border border-earth rounded-2xl p-2 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <nav className="flex space-x-2 overflow-x-auto no-scrollbar">
          {authorizedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center flex-shrink-0 whitespace-nowrap py-2.5 px-4 rounded-xl font-bold text-[14px] transition-all duration-300
                ${activeTab === tab.id 
                  ? 'bg-forest text-white shadow-md' 
                  : 'text-charcoal/70 hover:text-[#07571C] hover:bg-forest/10'
                }
              `}
            >
              <tab.icon className={`w-4 h-4 rtl:ml-2 ltr:mr-2 ${activeTab === tab.id ? 'text-white' : 'text-charcoal/50 group-hover:text-[#07571C]'}`} />
              {t(tab.translationKey)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      
      {/* 1. Users & Roles Tab */}
      {activeTab === 'users' && role === 'admin' && (
        <div className="space-y-6">
          <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden hover:border-forest/30 transition-colors">
            <div className="pb-5 border-b border-earth/60 flex flex-wrap gap-4 justify-between items-center mb-2">
              <h3 className="text-[17px] font-bold text-charcoal">{t('admin.management.userAccountsManagement')}</h3>
              <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-[#07571C] text-white text-[13px] font-bold rounded-lg hover:bg-[#0a7526] cursor-pointer shadow-sm shrink-0">{t('admin.management.addUser')}</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-sand/50">
                  <tr>
                    <th className="px-6 py-3 text-left rtl:text-right text-[12px] font-bold text-charcoal/50 uppercase tracking-wider">{t('admin.dashboard.farmer')}</th>
                    <th className="px-6 py-3 text-center text-[12px] font-bold text-charcoal/50 uppercase tracking-wider">{t('admin.management.role')}</th>
                    <th className="px-6 py-3 text-center text-[12px] font-bold text-charcoal/50 uppercase tracking-wider">{t('admin.management.status')}</th>
                    <th className="px-6 py-3 text-left rtl:text-right text-[12px] font-bold text-charcoal/50 uppercase tracking-wider">{t('admin.management.lastLogin')}</th>
                    <th className="px-6 py-3 text-right rtl:text-left text-[12px] font-bold text-charcoal/50 uppercase tracking-wider">{t('admin.management.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userList.map((user) => (
                    <tr key={user.id} className="hover:bg-forest/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full shadow-sm" src={`https://ui-avatars.com/api/?name=${user.name.replace(' ','+')}&background=2D5A27&color=fff`} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-[14px] font-bold text-charcoal">{user.nameKey ? t(`admin.management.names.${user.nameKey}`) : user.name}</div>
                            <div className="text-[13px] text-charcoal/70">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="w-24 justify-center text-center px-2.5 py-1 inline-flex text-[11px] font-bold rounded-full bg-gray-100 text-charcoal">
                          {t(`admin.management.roles.${user.role.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`w-24 justify-center text-center px-2.5 py-1 inline-flex text-[11px] font-bold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-[#07571C]' : 'bg-red-100 text-red-700'}`}>
                          {t(`admin.management.statuses.${user.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[13px] font-medium text-charcoal/70">{user.loginKey ? t(`admin.management.times.${user.loginKey}`) : user.login}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-[13px] font-bold">
                        <div className="flex justify-end rtl:justify-start items-center gap-">
                          <button onClick={() => setEditingUserId(user.id)} title={t('admin.management.editRole')} aria-label={t('admin.management.editRole')} className="p-2 text-gray-400 hover:text-[#07571C] hover:bg-forest/10 rounded-lg cursor-pointer transition-colors">
                            <Edit2 className="w-4 h-4"/>
                          </button>
                          {user.status === 'Active' ? (
                            <button onClick={() => toggleUserStatus(user.id)} title={t('admin.management.suspend')} aria-label={t('admin.management.suspend')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
                              <XCircle className="w-4 h-4"/>
                            </button>
                          ) : (
                            <button onClick={() => toggleUserStatus(user.id)} title={t('admin.management.activate')} aria-label={t('admin.management.activate')} className="p-2 text-gray-400 hover:text-forest hover:bg-forest/10 rounded-lg cursor-pointer transition-colors">
                              <CheckCircle className="w-4 h-4"/>
                            </button>
                          )}
                        </div>
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
          <div className="bg-[#FDE8E8] border border-red-200 p-4 rounded-2xl flex items-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex-shrink-0 bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="mx-4 flex-1">
              <h3 className="text-[14px] font-bold text-red-800">{t('admin.management.reviewRequired')}</h3>
              <p className="text-[13px] font-medium text-red-700/80 mt-0.5">{t('admin.management.reviewRequiredDesc')}</p>
            </div>
          </div>

          <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-forest/30 transition-colors overflow-hidden">
            <div className="pb-5 border-b border-earth/60 mb-2">
              <h3 className="text-[17px] font-bold text-charcoal">{t('admin.management.pendingApprovals')} ({pendingArticles.length})</h3>
            </div>
            
            {pendingArticles.length === 0 ? (
              <div className="p-8 text-center text-charcoal/50 font-medium">{t('admin.management.noPendingArticles')}</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pendingArticles.map(item => (
                  <li key={item.id} className="p-5 hover:bg-forest/5 rounded-xl transition-colors border border-transparent hover:border-earth/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase">{item.typeKey ? t(`admin.management.contentData.${item.typeKey}`) : item.type}</span>
                          <span className="text-[12px] font-bold text-charcoal/50 flex items-center"><Clock className="w-3.5 h-3.5 mx-1"/> {item.dateKey ? t(`admin.management.contentData.${item.dateKey}`) : item.date}</span>
                        </div>
                        <h4 className="text-[16px] font-bold text-charcoal">{item.titleKey ? t(`admin.management.contentData.${item.titleKey}`) : item.title}</h4>
                        <p className="text-[13px] font-medium text-charcoal/70 mt-1">{t('admin.management.contentData.by', 'By')} {item.authorKey ? t(`admin.management.names.${item.authorKey}`) : item.author}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setReviewingContentId(item.id)} className="px-4 py-2 border border-earth/70 bg-white rounded-lg text-[13px] font-bold text-charcoal/80 hover:bg-forest/5 hover:text-charcoal cursor-pointer transition-colors shadow-sm">{t('admin.management.reviewDocument')}</button>
                        <button onClick={() => handleContentAction(item.id, 'reject')} className="p-2 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"><X className="w-5 h-5"/></button>
                        <button onClick={() => handleContentAction(item.id, 'approve')} className="p-2 border border-green-200 bg-green-50 text-forest rounded-lg hover:bg-green-100 transition-colors shadow-sm"><Check className="w-5 h-5"/></button>
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
            <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-t-4 border-t-forest hover:border-forest/30 transition-colors flex flex-col">
              <div className="flex items-center space-x-3 mb-4 rtl:space-x-reverse">
                <div className="p-2.5 bg-green-50 rounded-xl">
                  <Bean className="w-5 h-5 text-[#07571C]" />
                </div>
                <h3 className="text-charcoal font-bold text-[14px]">{t('admin.management.seedIntelligenceCNN')}</h3>
              </div>
              <div className="flex items-end gap- mt-2">
                <span className="text-4xl font-black text-charcoal tracking-tight" dir="ltr">98.4%</span>
                <span className="text-[13px] text-[#07571C] font-bold mb-1.5">{t('admin.management.accuracy')}</span>
              </div>
              <div className="w-full mt-auto pt-5">
                <div className="w-full bg-green-50 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#07571C] h-2 rounded-full" style={{ width: '98.4%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-t-4 border-t-terracotta hover:border-forest/30 transition-colors flex flex-col">
              <div className="flex items-center space-x-3 mb-4 rtl:space-x-reverse">
                <div className="p-2.5 bg-orange-50 rounded-xl">
                  <ScanSearch className="w-5 h-5 text-terracotta" />
                </div>
                <h3 className="text-charcoal font-bold text-[14px]">{t('admin.management.diseaseDetectionCNN')}</h3>
              </div>
              <div className="flex items-end gap- mt-2">
                <span className="text-4xl font-black text-charcoal tracking-tight" dir="ltr">94.2%</span>
                <span className="text-[13px] text-terracotta font-bold mb-1.5">{t('admin.management.accuracy')}</span>
              </div>
              <div className="w-full mt-auto pt-5">
                <div className="w-full bg-orange-50 rounded-full h-2 overflow-hidden">
                  <div className="bg-terracotta h-2 rounded-full" style={{ width: '94.2%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-t-4 border-t-amber-500 hover:border-forest/30 transition-colors flex flex-col">
              <div className="flex items-center space-x-3 mb-4 rtl:space-x-reverse">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <Activity className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-charcoal font-bold text-[14px]">Avg Inference Time</h3>
              </div>
              <div className="flex items-end space-x-2 mt-2 rtl:space-x-reverse">
                <span className="text-4xl font-black text-charcoal tracking-tight">1.2s</span>
                <span className="text-[13px] text-charcoal/50 font-bold mb-1.5">per image</span>
              </div>
              <div className="mt-auto pt-5"><span className="text-[12px] font-bold text-amber-700 uppercase tracking-wider bg-amber-100/50 inline-block px-3 py-1.5 rounded-full border border-amber-200">API Load: 342 req/min</span></div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Issues & Maintenance Tab */}
      {activeTab === 'issues' && role === 'admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-forest/30 transition-colors overflow-hidden flex flex-col">
              <div className="pb-5 border-b border-earth/60 mb-2">
                <h3 className="text-[17px] font-bold text-charcoal">{t('admin.management.openIssues')}</h3>
              </div>
              <ul className="divide-y divide-earth/40 flex-1">
                {issues.map(issue => (
                  <li key={issue.id} className="py-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap- mb-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${issue.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {t(`admin.management.priorities.${issue.priority.toLowerCase()}`)} Priority
                          </span>
                          <span className="text-[12px] font-medium text-charcoal/50">Reported by <span className="font-bold text-charcoal/70">{issue.reporterKey ? t(`admin.management.names.${issue.reporterKey}`) : issue.reporter}</span></span>
                        </div>
                        <h4 className="text-[15px] font-bold text-charcoal">{issue.titleKey ? t(`admin.management.issues.${issue.titleKey}`) : issue.title}</h4>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-[12px] font-bold border shadow-sm ${issue.status === 'Open' ? 'border-red-200 text-red-700 bg-red-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                          {t(`admin.management.issueStatuses.${issue.status === 'In Progress' ? 'inProgress' : issue.status.toLowerCase()}`)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-1 bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-forest/30 transition-colors flex flex-col">
              <div className="flex items-center gap- mb-6">
                <div className="p-2.5 bg-sand rounded-xl border border-gray-100">
                  <Server className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-[17px] font-bold text-charcoal">{t('admin.management.systemMaintenance')}</h3>
              </div>
              
              <div className="space-y-4 mt-auto">
                <div className="p-5 bg-[#F8FAFC] border border-earth/60 rounded-xl">
                  <h4 className="text-[14px] font-bold text-charcoal">{t('admin.management.maintenance.nextWindow', 'Next Scheduled Window')}</h4>
                  <p className="text-[13px] font-medium text-charcoal/70 mt-2">{t('admin.management.maintenance.date', 'Saturday, 15 Aug 2026')}</p>
                  <p className="text-[13px] font-bold text-[#07571C] mt-1" dir="ltr">{t('admin.management.maintenance.time', '02:00 AM - 04:00 AM PKT')}</p>
                </div>
                <button 
                  onClick={() => showToast(t('admin.management.maintenance.scheduledSuccess', 'Maintenance scheduled successfully!'), '', 'success')}
                  className="w-full py-3 border border-earth/70 rounded-xl text-[13px] font-bold text-charcoal hover:bg-forest/5 hover:border-[#07571C]/30 transition-colors cursor-pointer shadow-sm"
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
              <input name="name" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-forest focus:border-forest" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.management.modals.emailAddress', 'Email Address')}</label>
              <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-forest focus:border-forest" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.management.modals.roleLabel', 'Role')}</label>
              <select name="role" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-forest focus:border-forest">
                <option value="Farmer">{t('admin.management.roles.farmer', 'Farmer')}</option>
                <option value="Researcher">{t('admin.management.roles.researcher', 'Researcher')}</option>
                <option value="Admin">{t('admin.management.roles.admin', 'Admin')}</option>
              </select>
            </div>
            <div className="flex justify-end gap- pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-forest/10 hover:text-forest hover:border-transparent font-medium cursor-pointer">{t('admin.management.cancel', 'Cancel')}</button>
              <button type="submit" className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest hover:opacity-90 font-medium cursor-pointer">{t('admin.management.addUser', 'Add User')}</button>
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
              <select name="role" defaultValue={userList.find(u => u.id === editingUserId)?.role} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-forest focus:border-forest">
                <option value="Farmer">{t('admin.management.roles.farmer', 'Farmer')}</option>
                <option value="Researcher">{t('admin.management.roles.researcher', 'Researcher')}</option>
                <option value="Admin">{t('admin.management.roles.admin', 'Admin')}</option>
              </select>
            </div>
            <div className="flex justify-end gap- pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setEditingUserId(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-forest/10 hover:text-forest hover:border-transparent font-medium cursor-pointer">{t('admin.management.modals.cancel', 'Cancel')}</button>
              <button type="submit" className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest hover:opacity-90 font-medium cursor-pointer">{t('admin.management.modals.saveChanges', 'Save Changes')}</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Review Document Modal */}
    {reviewingContentId && (
      <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-sand">
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
                
                <div className="prose prose-sm text-gray-700 bg-sand p-4 rounded-lg border border-gray-200">
                  <p>
                    {pendingArticles.find(c => c.id === reviewingContentId).contentKey ? t(`admin.management.contentData.${pendingArticles.find(c => c.id === reviewingContentId).contentKey}`) : (pendingArticles.find(c => c.id === reviewingContentId).content || pendingArticles.find(c => c.id === reviewingContentId).excerpt)}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-sand flex justify-end space-x-3">
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
              className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest hover:opacity-90 font-medium cursor-pointer"
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
