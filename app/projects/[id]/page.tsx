'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getStage, NEXT_STAGE, STAGES } from '@/lib/pipeline'

interface Comment {
  id: string
  body: string
  author: string
  createdAt: string
}

interface HistoryEntry {
  id: string
  fromStage: string
  toStage: string
  note: string | null
  createdAt: string
}

interface Project {
  id: string
  title: string
  description: string | null
  stage: string
  revisionCount: number
  createdAt: string
  updatedAt: string
  client: { id: string; name: string; company: string | null }
  comments: Comment[]
  history: HistoryEntry[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState(false)
  const [showRevForm, setShowRevForm] = useState(false)
  const [revNote, setRevNote] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`)
    if (res.ok) setProject(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const advance = async (toStage: string, note?: string) => {
    setAdvancing(true)
    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: toStage, note }),
    })
    setShowRevForm(false)
    setRevNote('')
    setAdvancing(false)
    await load()
    router.refresh()
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingComment(true)
    await fetch(`/api/projects/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: commentBody, author: commentAuthor }),
    })
    setCommentBody('')
    setSubmittingComment(false)
    await load()
  }

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>
  if (!project) return <div className="p-6 text-gray-500">Project not found.</div>

  const stage = getStage(project.stage)
  const nextStage = NEXT_STAGE[project.stage]
  const isForwardToPM = project.stage === 'forward_to_pm'
  const isApproved = project.stage === 'approved'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4 flex gap-3 text-sm text-gray-500">
        <Link href="/" className="hover:text-indigo-600">Dashboard</Link>
        <span>/</span>
        <Link href={`/clients/${project.client.id}`} className="hover:text-indigo-600">{project.client.name}</Link>
        <span>/</span>
        <span className="text-gray-800">{project.title}</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{project.client.name}{project.client.company ? ` · ${project.client.company}` : ''}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${stage.color}`}>
            <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
            {stage.label}
          </span>
        </div>
        {project.description && <p className="text-gray-600 text-sm mt-3">{project.description}</p>}
        {project.revisionCount > 0 && (
          <div className="mt-3">
            <span className="inline-block bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">
              Revision #{project.revisionCount}
            </span>
          </div>
        )}
      </div>

      {/* Stage Advancement */}
      {!isApproved && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Advance Stage</h2>
          {isForwardToPM ? (
            <div className="flex gap-3">
              <button
                disabled={advancing}
                onClick={() => advance('approved')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                ✓ Approve → Live
              </button>
              {!showRevForm ? (
                <button
                  onClick={() => setShowRevForm(true)}
                  className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50"
                >
                  ✗ Request Changes
                </button>
              ) : (
                <div className="flex-1">
                  <textarea
                    value={revNote}
                    onChange={e => setRevNote(e.target.value)}
                    placeholder="Describe the changes needed..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none h-20 mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={advancing}
                      onClick={() => advance('changes_requested', revNote)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      Submit Changes Request
                    </button>
                    <button
                      onClick={() => { setShowRevForm(false); setRevNote('') }}
                      className="text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : nextStage ? (
            <div className="flex items-center gap-3">
              <button
                disabled={advancing}
                onClick={() => advance(nextStage)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {advancing ? 'Moving...' : `Advance to ${getStage(nextStage).label} →`}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {isApproved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5 text-green-700 text-sm font-medium">
          ✓ This project is approved and live.
        </div>
      )}

      {/* Stage Timeline */}
      {project.history.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Stage History</h2>
          <div className="space-y-3">
            {project.history.map(h => {
              const from = getStage(h.fromStage)
              const to = getStage(h.toStage)
              return (
                <div key={h.id} className="flex items-start gap-3 text-sm">
                  <span className="text-gray-400 text-xs whitespace-nowrap mt-0.5">
                    {new Date(h.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${from.color}`}>{from.label}</span>
                    <span className="text-gray-400">→</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${to.color}`}>{to.label}</span>
                  </div>
                  {h.note && <span className="text-gray-500 text-xs">"{h.note}"</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Comments ({project.comments.length})</h2>

        <form onSubmit={submitComment} className="mb-5 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Your name"
              value={commentAuthor}
              onChange={e => setCommentAuthor(e.target.value)}
              className="w-36 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <textarea
              required
              placeholder="Add a comment..."
              value={commentBody}
              onChange={e => setCommentBody(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none h-10"
            />
            <button
              type="submit"
              disabled={submittingComment}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 self-end"
            >
              Post
            </button>
          </div>
        </form>

        {project.comments.length === 0 ? (
          <p className="text-sm text-gray-400">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {project.comments.map(c => (
              <div key={c.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{c.author}</span>
                  <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600">{c.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
