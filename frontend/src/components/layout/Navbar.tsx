import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Radio, 
  ShieldAlert, 
  Settings, 
  X, 
  Camera, 
  Bell, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCitizenStore } from '../../store/citizenStore';
import Logo from '../common/Logo';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuthStore();
  const { 
    activeSos, 
    notifications, 
    notificationsRead, 
    markNotificationsRead, 
    fetchCitizenData, 
    initSocketListeners 
  } = useCitizenStore();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCitizenData();
      const unsub = initSocketListeners();
      return () => unsub();
    }
  }, [isAuthenticated, fetchCitizenData, initSocketListeners]);

  const openEditProfile = () => {
    setEditName(user?.full_name || '');
    setEditPhone(user?.phone || '');
    setEditAvatar(null);
    setAvatarPreview(user?.avatar_url ? `http://localhost:5000${user.avatar_url}` : null);
    setEditProfileModalOpen(true);
    setShowUserMenu(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    let submitData: any = { full_name: editName, phone: editPhone };
    if (editAvatar) {
      const formData = new FormData();
      formData.append('full_name', editName);
      formData.append('phone', editPhone);
      formData.append('avatar', editAvatar);
      submitData = formData;
    }
    
    const res = await updateProfile(submitData);
    setIsUpdating(false);
    if (res.success) {
      setEditProfileModalOpen(false);
    } else {
      alert(res.error || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const roleName = user?.role?.name || (user?.email?.includes('officer') ? 'POLICE_OFFICER' : 'CITIZEN');
  const unreadCount = notificationsRead ? 0 : notifications.filter(n => !n.read).length;

  return (
    <>
      <nav className="flex items-center justify-between py-3 sm:py-4 px-4 sm:px-8 bg-[#f4f7f6] border-b border-slate-200/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-3 sm:space-x-6">
          <Logo onClick={() => navigate('/')} />
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3.5">
          {/* Case Notifications Button */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => {
                  setBellOpen(!bellOpen);
                  setShowUserMenu(false);
                }}
                className="relative text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-200/60"
                title="Case Notifications"
              >
                <Bell className="w-5 h-5 text-slate-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[17px] h-4 px-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-extrabold text-slate-900">Case & Report Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markNotificationsRead}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-bold text-slate-600">No new notifications</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">You will be notified here whenever your filed crimes or GDs are updated or resolved.</p>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setBellOpen(false);
                              if (notif.link) navigate(notif.link);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start space-x-3 cursor-pointer ${
                              !notif.read ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {notif.type === 'CRIME_RESOLVED' || notif.type === 'GD_APPROVED' ? (
                                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              ) : notif.type === 'SOS_RESOLVED' ? (
                                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                  <ShieldAlert className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                  <FileText className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-black text-slate-900 truncate">{notif.title}</p>
                                <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                              {!notif.read && (
                                <span className="inline-block mt-1 text-[9px] font-extrabold text-blue-600 uppercase tracking-wider">
                                  New update
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User Profile & Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setBellOpen(false);
              }}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-slate-300 shrink-0 bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {user?.avatar_url ? (
                  <img src={`http://localhost:5000${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.full_name || 'Guest Citizen'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user?.email || 'citizen@protego.org'}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-black uppercase rounded bg-slate-100 text-slate-800 border border-slate-300">
                    {roleName}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={openEditProfile}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/'); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <span>Sign In / Switch Account</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Emergency Broadcast Toast */}
      {activeSos && (
        <div className="fixed top-20 right-4 z-50 bg-rose-950 border border-rose-500 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-bounce">
          <Radio className="w-6 h-6 text-rose-400 animate-pulse shrink-0" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-rose-300">Emergency SOS Broadcast Active</p>
            <p className="text-xs text-rose-100">Live GPS Coordinates transmitted to Central Dispatch & Patrol Units.</p>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 sm:p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">Edit Profile</h3>
              <button onClick={() => setEditProfileModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="relative group cursor-pointer">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center relative">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditAvatar(e.target.files[0]);
                        setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">Click to change photo</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
