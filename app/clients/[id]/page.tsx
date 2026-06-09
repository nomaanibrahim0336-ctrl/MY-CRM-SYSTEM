import prisma from '@/lib/prisma'
import { getStage } from '@/lib/pipeline'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AddProjectButton from './AddProjectButton'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await prisma.client.findUnique({
    where: { id },
    include: { projects: { orderBy: { updatedAt: 'desc' } } },
  })
  if (!client) notFound()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href="/clients" className="text-sm text-indigo-600 hover:underline">← Clients</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            {client.company && <p className="text-gray-500 text-sm mt-0.5">{client.company}</p>}
          </div>
          <AddProjectButton clientId={client.id} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {client.email && (
            <div><span className="text-gray-500">Email: </span><span className="text-gray-800">{client.email}</span></div>
          )}
          {client.phone && (
            <div><span className="text-gray-500">Phone: </span><span className="text-gray-800">{client.phone}</span></div>
          )}
          {client.notes && (
            <div className="col-span-2"><span className="text-gray-500">Notes: </span><span className="text-gray-800">{client.notes}</span></div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Projects ({client.projects.length})</h2>
        </div>
        {client.projects.length === 0 ? (
          <p className="px-5 py-8 text-center text-gray-400 text-sm">No projects yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {client.projects.map(p => {
              const stage = getStage(p.stage)
              return (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <Link href={`/projects/${p.id}`} className="font-medium text-indigo-600 hover:underline text-sm">
                      {p.title}
                    </Link>
                    {p.description && <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {p.revisionCount > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5">Rev #{p.revisionCount}</span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${stage.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
                      {stage.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
