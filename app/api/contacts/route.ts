import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tasks: true },
  })
  return NextResponse.json(contacts)
}

export async function POST(request: Request) {
  const body = await request.json()
  const contact = await prisma.contact.create({
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      status: body.status || 'lead',
      notes: body.notes || null,
    },
  })
  return NextResponse.json(contact, { status: 201 })
}
