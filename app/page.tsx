export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'
import { getStage } from '@/lib/pipeline'
import Link from 'next/link'

export default async function DashboardPage() {
  const [totalClients, allProjects] = await Promise.all([
    prisma.client.count(),
    prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { client: { select: { name: true } } },
    }),
  ])

  const activeProjects = allProjects.filter(p => p.stage !== 'approved').length
  const changesRequested = allProjects.filter(p => p.stage === 'changes_requested').length
  const approvedProjects = allProjects.filter(p => p.stage === 'approved').length
  const recentProjects = allProjects.slice(0, 5)

  const stats = [
    { label: 'Total Clients', value: totalClients, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Active Projects', value: activeProjects, color: 'bg-blue-50 text-blue-700' },
    { label: 'Changes Requested', value: changesRequested, color: 'bg-red-50 text-red-700' },
    { label: 'Approved / Live', value: approvedProjects, color: 'bg-green-50 text-green-700' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Recent Projects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Project</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Client</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Stage</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Revisions</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No projects yet.{' '}
                    <Link href="/clients" className="text-indigo-600 hover:underline">
                      Add a client
                    </Link>{' '}
                    to get started.
                  </td>
                </tr>
              ) : (
                recentProjects.map(project => {
                  const stage = getStage(project.stage)
                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <Link href={`/projects/${project.id}`} className="font-medium text-indigo-600 hover:underline">
                          {project.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{project.client.name}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${stage.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
                          {stage.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {project.revisionCount > 0 ? `Rev #${project.revisionCount}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
