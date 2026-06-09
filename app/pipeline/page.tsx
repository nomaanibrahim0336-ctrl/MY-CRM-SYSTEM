'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { STAGES, getStage, NEXT_STAGE } from '@/lib/pipeline'

interface Project {
  id: string
  title: string
  stage: string
  revisionCount: number
  client: { name: string }
}

const KANBAN_STAGES = STAGES.filter(s => s.id !== 'changes_requested')

export default function PipelinePage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [changingId, setChangingId] = useState<string | null>(null)
  const [revNote, setRevNote] = useState('')
  const [revProjectId, setRevProjectId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const advance = async (project: Project, toStage: string, note?: string) => {
    setChangingId(project.id)
    await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: toStage, note }),
    })
    await load()
    setChangingId(null)
    setRevProjectId(null)
    setRevNote('')
    router.refresh()
  }

  const needsRevision = projects.filter(p => p.stage === 'changes_requested')

  if (loading) return <div className="p-6 text-gray-500">Loading pipeline...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pipeline</h1>

      {needsRevision.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">
            ⚠ Needs Revision ({needsRevision.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {needsRevision.map(p => (
              <div key={p.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Link href={`/projects/${p.id}`} className="font-medium text-red-800 hover:underline text-sm">
                    {p.title}
                  </Link>
                  {p.revisionCount > 0 && (
                    <span className="text-xs bg-red-200 text-red-700 rounded-full px-2 py-0.5 whitespace-nowrap">
                      Rev #{p.revisionCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-red-600 mb-3">{p.client.name}</p>
                <button
                  disabled={changingId === p.id}
                  onClick={() => advance(p, 'forward_to_designer')}
                  className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Send to Designer →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: `${KANBAN_STAGES.length * 220}px` }}>
          {KANBAN_STAGES.map(stage => {
            const stageProjects = projects.filter(p => p.stage === stage.id)
            return (
              <div key={stage.id} className="flex-shrink-0 w-52">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{stage.label}</h3>
                  <span className="ml-auto text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{stageProjects.length}</span>
                </div>
                <div className="space-y-3">
                  {stageProjects.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg h-20 flex items-center justify-center text-xs text-gray-300">
                      Empty
                    </div>
                  )}
                  {stageProjects.map(p => {
                    const nextStage = NEXT_STAGE[p.stage]
                    const isForwardToPM = p.stage === 'forward_to_pm'
                    const isLoading = changingId === p.id
                    return (
                      <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <Link href={`/projects/${p.id}`} className="font-medium text-gray-800 hover:text-indigo-600 text-sm leading-snug">
                            {p.title}
                          </Link>
                          {p.revisionCount > 0 && (
                            <span className="text-xs bg-red-100 text-red-600 rounded-full px-1.5 py-0.5 whitespace-nowrap flex-shrink-0">
                              Rev #{p.revisionCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{p.client.name}</p>

                        {isForwardToPM ? (
                          <div className="space-y-1.5">
                            <button
                              disabled={isLoading}
                              onClick={() => advance(p, 'approved')}
                              className="w-full text-xs bg-green-600 text-white px-2 py-1.5 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              ✓ Approve
                            </button>
                            {revProjectId === p.id ? (
                              <div>
                                <textarea
                                  value={revNote}
                                  onChange={e => setRevNote(e.target.value)}
                                  placeholder="Describe changes needed..."
                                  className="w-full text-xs border border-gray-200 rounded p-1.5 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-red-300"
                                />
                                <div className="flex gap-1 mt-1">
                                  <button
                                    disabled={isLoading}
                                    onClick={() => advance(p, 'changes_requested', revNote)}
                                    className="flex-1 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                                  >
                                    Submit
                                  </button>
                                  <button
                                    onClick={() => { setRevProjectId(null); setRevNote('') }}
                                    className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setRevProjectId(p.id)}
                                className="w-full text-xs border border-red-300 text-red-600 px-2 py-1.5 rounded hover:bg-red-50"
                              >
                                ✗ Request Changes
                              </button>
                            )}
                          </div>
                        ) : nextStage ? (
                          <button
                            disabled={isLoading}
                            onClick={() => advance(p, nextStage)}
                            className="w-full text-xs bg-indigo-600 text-white px-2 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isLoading ? 'Moving...' : 'Move Forward →'}
                          </button>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
