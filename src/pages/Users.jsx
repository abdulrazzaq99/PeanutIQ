import { useState } from 'react';
import { User, Mail, Phone, MapPin, Edit3, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Users() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: user?.location || '',
    language: user?.language || 'English',
    cropType: user?.cropType || 'Peanut',
    email: user?.email || user?.identifier || ''
  });



  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your personal information and preferences.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {isEditing ? (
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-700 flex items-center cursor-pointer transition-colors"
            >
              Save Changes
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center cursor-pointer transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}

        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex-shrink-0">
              <img 
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg" 
                src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=${user.role === 'admin' ? '0D8ABC' : '16a34a'}&color=fff&size=128`} 
                alt="Profile" 
              />
            </div>
            <div className="flex-1 text-center sm:text-left w-full">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-green-500 focus:outline-none bg-transparent w-full max-w-xs"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              )}
              <p className="text-sm text-gray-500 font-medium mt-1 capitalize">{user.role}</p>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600">
                  <Mail className="w-5 h-5 mr-3 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="border-b border-gray-300 focus:border-green-500 focus:outline-none bg-transparent w-full"
                      placeholder="Phone or Email"
                    />
                  ) : (
                    <>{user.email || user.identifier || 'No contact provided'}</>
                  )}
                </div>
                
                {user.role === 'farmer' && (
                  <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="border-b border-gray-300 focus:border-green-500 focus:outline-none bg-transparent w-full"
                        placeholder="Location"
                      />
                    ) : (
                      <>{user.location || 'Unknown Location'}</>
                    )}
                  </div>
                )}
                
                {user.role === 'farmer' && (
                  <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600">
                    <Target className="w-5 h-5 mr-3 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.cropType}
                        onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                        className="border-b border-gray-300 focus:border-green-500 focus:outline-none bg-transparent w-full"
                        placeholder="Crop Type"
                      />
                    ) : (
                      <>{user.cropType || 'Peanut'}</>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600">
                  <User className="w-5 h-5 mr-3 text-gray-400" />
                  ID: {user.id}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 sm:px-8 py-6 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Account Preferences</h3>
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Language Preference</p>
                <p className="text-xs text-gray-500">Choose your preferred language for the dashboard.</p>
              </div>
              <select 
                disabled={!isEditing}
                value={isEditing ? formData.language : user.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="mt-1 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm border bg-white disabled:opacity-75"
              >
                <option>English</option>
                <option>Urdu</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
