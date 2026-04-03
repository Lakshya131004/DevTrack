import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { projectsAPI, tasksAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const AVATAR_COLORS = [
  'from-indigo-400 to-violet-500',
  'from-pink-400 to-rose-500',
  'from-teal-400 to-cyan-500',
  'from-orange-400 to-amber-500',
  'from-purple-400 to-fuchsia-500',
]
const colorFor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

export default function TeamPage() {
  const { user: currentUser } = useAuth()
  const [members, setMembers] = useState([]) // { user, projects[], taskCount }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const projects = await projectsAPI.getAll()

      // Build a map: userId → { user object, projects[], taskCount }
      const memberMap = {}

      for (const project of projects) {
        // Collect all users (owner + members)
        const users = [project.owner, ...project.members].filter(Boolean)
        const uniqueUsers = users.filter(
          (u, i, arr) => arr.findIndex((x) => x._id === u._id) === i
        )

        for (const u of uniqueUsers) {
          if (!memberMap[u._id]) {
            memberMap[u._id] = { user: u, projects: [], taskCount: 0 }
          }
          // Avoid duplicate project entries
          if (!memberMap[u._id].projects.find((p) => p._id === project._id)) {
            memberMap[u._id].projects.push(project)
          }
        }

        // Count tasks assigned to each user in this project
        try {
          const tasks = await tasksAPI.getByProject(project._id)
          for (const task of tasks) {
            if (task.assignedTo?._id && memberMap[task.assignedTo._id]) {
              memberMap[task.assignedTo._id].taskCount++
            }
          }
        } catch { /* skip if no access */ }
      }

      setMembers(Object.values(memberMap))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Team" />

        <main className="flex-1 overflow-y-auto p-6">

          {/* Header */}
          <div className="mb-6 animate-fade-up">
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-500 text-sm mt-1">
              Everyone across your projects — {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1,2,3].map((n) => (
                <div key={n} className="skeleton bg-white rounded-2xl h-44 border border-gray-100" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center animate-fade-up">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-gray-500 font-medium">No team members found.</p>
              <p className="text-gray-400 text-sm">Create projects and add members to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {members.map(({ user, projects, taskCount }, i) => {
                const isYou = user._id === currentUser?._id || user.email === currentUser?.email
                return (
                  <div
                    key={user._id}
                    className={`project-card animate-fade-up bg-white rounded-2xl border border-gray-100 p-5 shadow-sm`}
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    {/* Avatar + name */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${colorFor(user.name)} flex items-center justify-center text-lg font-bold text-white shadow-md flex-shrink-0`}>
                        {initials(user.name)}
                        {isYou && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" title="You" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 truncate">{user.name}</p>
                          {isYou && (
                            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">You</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-indigo-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-indigo-600">{projects.length}</p>
                        <p className="text-xs text-gray-500 font-medium">Project{projects.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-amber-600">{taskCount}</p>
                        <p className="text-xs text-gray-500 font-medium">Task{taskCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Projects list */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Projects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {projects.slice(0, 3).map((p) => (
                          <span key={p._id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium truncate max-w-[120px]">
                            {p.name}
                          </span>
                        ))}
                        {projects.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                            +{projects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
