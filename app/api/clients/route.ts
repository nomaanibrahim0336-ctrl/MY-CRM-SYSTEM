import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { projects: true } } },
    })
    return NextResponse.json(clients)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, company, notes } = body
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const client = await prisma.client.create({
      data: { name, email, phone, company, notes },
    })
    return NextResponse.json(client, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
