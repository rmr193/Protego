import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  FileWarning,
  Boxes,
  FileBarChart,
  Bell,
  X,
  Radio,
  Settings,
  User,
  Camera
} from 'lucide-react';
import { usePoliceStore } from '../../store/policeStore';
import { useAuthStore } from '../../store/authStore';
import Logo from '../common/Logo';

const navItems = [
  { path: '/police', label: 'Dashboard', icon: LayoutGrid },
  { path: '/police/incidents', label: 'Incidents', icon: FileWarning },
  { path: '/police/resources', label: 'Resources', icon: Boxes },
  { path: '/police/reports', label: 'Reports', icon: FileBarChart }
];

const PoliceLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { incidents, notificationsRead, markNotificationsRead, sosActive } = usePoliceStore();
  const { user, logout, updateProfile } = useAuthStore();

  const [bellOpen, setBellOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const openEditProfile = () => {
    setEditName(user?.full_name || '');
    setEditPhone(user?.phone || '');
    setEditAvatar(null);
    setAvatarPreview(user?.avatar_url ? `http://localhost:5000${user.avatar_url}` : null);
    setEditProfileModalOpen(true);
    setProfileOpen(false);
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
    navigate('/');
  };

  const newIncidents = incidents.filter(i => i.status === 'NEW');
  const unreadCount = notificationsRead ? 0 : newIncidents.length;

  const initials = user?.full_name
    ? user.full_name
        .trim()
        .split(/\s+/)
        .map((part: string) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'PO';

  return (
    <div className="min-h-screen bg-[#eef1f5] flex flex-col font-sans">
      {/* Top Bar Header */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-6 sticky top-0 z-40">
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <Logo onClick={() => navigate('/police')} />
        </div>

        {/* Global Search Bar Removed */}

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3.5 shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setBellOpen(!bellOpen);
                setProfileOpen(false);
              }}
              className="relative text-slate-500 hover:text-slate-900 transition-colors p-1"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 sm:h-4 px-1 bg-red-500 text-white text-[8px] sm:text-[9px] font-extrabold rounded-full flex items-center justify-center border border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">Live Incident Alerts</span>
                    <button
                      onClick={markNotificationsRead}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {incidents.slice(0, 5).map(i => (
                      <button
                        key={i.id}
                        onClick={() => {
                          setBellOpen(false);
                          navigate('/police/incidents');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start justify-between space-x-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{i.title || i.type}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{i.id} · {i.time}</p>
                        </div>
                        {i.status === 'NEW' && !notificationsRead && (
                          <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-ping"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setBellOpen(false);
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white text-[11px] sm:text-xs font-extrabold shadow-sm hover:scale-105 transition-transform overflow-hidden"
            >
              {user?.avatar_url ? (
                <img src={`http://localhost:5000${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{user?.full_name || 'Sgt. Marcus Miller'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{user?.email || 'Central Command · Badge #4829'}</p>
                  </div>
                  <button
                    onClick={openEditProfile}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 relative">
        
        {/* Desktop Fixed Sidebar */}
        <aside className="hidden lg:flex w-52 bg-white border-r border-slate-200 flex-col py-5 px-3 sticky top-[49px] h-[calc(100vh-49px)] shrink-0 justify-between">
          <nav className="space-y-1">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Real-Time Telemetry / Dispatch Status indicator */}
          <div className="pt-3 border-t border-slate-100">
            {sosActive ? (
              <div 
                onClick={() => navigate('/police/incidents')}
                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 p-2.5 rounded-xl cursor-pointer transition-all flex items-center space-x-2 animate-pulse"
              >
                <Radio className="w-4 h-4 text-red-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-wider">Citizen SOS Active</p>
                  <p className="text-[9px] text-red-500 font-bold">Click to view dispatch</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                <div className="flex items-center justify-center space-x-1.5 text-[11px] font-black text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>DISPATCH ONLINE</span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">Monitoring Citizen SOS Feeds</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area (With bottom padding on mobile for the bottom bar) */}
        <main className="flex-1 p-3.5 sm:p-6 pb-20 sm:pb-24 lg:pb-6 min-w-0">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modern Bottom Navigation Bar on Mobile & Tablets */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] z-40 px-2 py-1.5 flex items-center justify-around safe-area-bottom">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          const isIncidents = item.path === '/police/incidents';

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 py-1.5 px-2 flex flex-col items-center justify-center transition-all relative rounded-xl ${
                active
                  ? 'text-indigo-600 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110 text-indigo-600' : 'text-slate-500'}`} />
                {isIncidents && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${active ? 'font-black text-indigo-600' : 'font-semibold text-slate-500'}`}>
                {item.label}
              </span>
              {active && (
                <div className="w-5 h-1 bg-indigo-600 rounded-full mt-0.5"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Edit Profile Modal */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4 sm:p-6 relative">
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

    </div>
  );
};

export default PoliceLayout;
