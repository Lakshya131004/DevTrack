import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'

const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

export default function SettingsPage() {
  const { user }             = useAuth()
  const { addToast }         = useToast()
  const { theme, changeTheme } = useTheme()

  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
  })

  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: '',
  })

  const [notifications, setNotifications] = useState({
    taskAssigned:   true,
    taskCompleted:  true,
    projectUpdates: false,
    weeklyDigest:   true,
  })

  const [appearance, setAppearance] = useState({
    theme:    'light',
    density:  'comfortable',
    language: 'English',
  })

  const [savingProfile,  setSavingProfile]  = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // ── Handlers ──────────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profile.name.trim()) { addToast('Name cannot be empty.', 'error'); return }
    setSavingProfile(true)
    // Simulate API call — replace with real authAPI.updateProfile() when backend supports it
    await new Promise((r) => setTimeout(r, 700))
    addToast('Profile updated successfully!', 'success')
    setSavingProfile(false)
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (!passwords.current)           { addToast('Enter your current password.', 'error'); return }
    if (passwords.newPass.length < 6) { addToast('New password must be at least 6 characters.', 'error'); return }
    if (passwords.newPass !== passwords.confirm) { addToast('Passwords do not match.', 'error'); return }
    setSavingPassword(true)
    await new Promise((r) => setTimeout(r, 700))
    addToast('Password changed successfully!', 'success')
    setPasswords({ current: '', newPass: '', confirm: '' })
    setSavingPassword(false)
  }

  const handleNotifToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
    addToast('Notification preference saved.', 'info')
  }

  const Section = ({ title, subtitle, children }) => (
    <div className="animate-fade-up bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-gray-50">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )

  const InputField = ({ label, type = 'text', value, onChange, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:shadow-lg focus:shadow-indigo-100 transition-shadow"
      />
    </div>
  )

  const Toggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          checked ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Settings" />

        <main className="flex-1 overflow-y-auto p-6 max-w-2xl">

          {/* Profile header */}
          <div className="animate-fade-up flex items-center gap-4 mb-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0">
              {initials(user?.name)}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
                Member
              </span>
            </div>
          </div>

          {/* Profile section */}
          <Section title="Profile Information" subtitle="Update your name and email address">
            <form onSubmit={handleProfileSave} className="space-y-4">
              <InputField
                label="Full name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="Alice Johnson"
              />
              <InputField
                label="Email address"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="alice@example.com"
              />
              <button
                type="submit"
                disabled={savingProfile}
                className="btn-ripple bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
              >
                {savingProfile ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : 'Save Profile'}
              </button>
            </form>
          </Section>

          {/* Password section */}
          <Section title="Change Password" subtitle="Use a strong password you don't use elsewhere">
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <InputField
                label="Current password"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                placeholder="••••••••"
              />
              <InputField
                label="New password"
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                placeholder="Min. 6 characters"
              />
              <InputField
                label="Confirm new password"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="••••••••"
              />
              <button
                type="submit"
                disabled={savingPassword}
                className="btn-ripple bg-gray-800 hover:bg-gray-900 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg active:scale-95"
              >
                {savingPassword ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating…
                  </span>
                ) : 'Update Password'}
              </button>
            </form>
          </Section>

          {/* Notifications section */}
          <Section title="Notifications" subtitle="Choose what you want to be notified about">
            <Toggle
              label="Task assigned to me"
              description="Get notified when someone assigns a task to you"
              checked={notifications.taskAssigned}
              onChange={() => handleNotifToggle('taskAssigned')}
            />
            <Toggle
              label="Task completed"
              description="Get notified when a task you created is completed"
              checked={notifications.taskCompleted}
              onChange={() => handleNotifToggle('taskCompleted')}
            />
            <Toggle
              label="Project updates"
              description="Get notified when a project you're in is updated"
              checked={notifications.projectUpdates}
              onChange={() => handleNotifToggle('projectUpdates')}
            />
            <Toggle
              label="Weekly digest"
              description="Receive a weekly summary of your team's progress"
              checked={notifications.weeklyDigest}
              onChange={() => handleNotifToggle('weeklyDigest')}
            />
          </Section>

          {/* Appearance section */}
          <Section title="Appearance" subtitle="Customise how DevTrack looks for you">
            <div className="space-y-4">
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <div className="flex gap-3">
                  {['light', 'dark', 'system'].map((t) => (
                    <button
                      key={t}
                      onClick={() => { changeTheme(t); addToast(`Theme set to ${t}.`, 'info') }}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all capitalize ${
                        theme === t
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'} {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Density */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Density</label>
                <div className="flex gap-3">
                  {['compact', 'comfortable', 'spacious'].map((d) => (
                    <button
                      key={d}
                      onClick={() => { setAppearance((a) => ({ ...a, density: d })); addToast(`Density set to ${d}.`, 'info') }}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all capitalize ${
                        appearance.density === d
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Danger zone */}
          <Section title="Danger Zone" subtitle="These actions are permanent and cannot be undone">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-600">Delete account</p>
                <p className="text-xs text-gray-400">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={() => addToast('Account deletion is disabled in demo mode.', 'warning')}
                className="btn-ripple text-sm font-semibold text-red-500 border-2 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 px-4 py-2 rounded-xl transition-all active:scale-95"
              >
                Delete Account
              </button>
            </div>
          </Section>

        </main>
      </div>
    </div>
  )
}
