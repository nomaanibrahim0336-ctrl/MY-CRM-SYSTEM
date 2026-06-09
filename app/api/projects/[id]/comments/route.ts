import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { body: commentBody, author } = body
    if (!commentBody || !author) {
      return NextResponse.json({ error: 'body and author required' }, { status: 400 })
    }
    const comment = await prisma.comment.create({
      data: { body: commentBody, author, projectId: id },
    })
    return NextResponse.json(comment, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
