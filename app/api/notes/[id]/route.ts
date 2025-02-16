import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: { category: true }
    });
    
    if (!note) {
      return new Response('Note not found', { status: 404 });
    }
    
    return NextResponse.json(note);
  } catch (error) {
    return new Response('Error fetching note', { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const note = await prisma.note.update({
      where: { id: params.id },
      data: body,
      include: { category: true }
    });
    return NextResponse.json(note);
  } catch (error) {
    return new Response('Error updating note', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await prisma.note.delete({
      where: { id: params.id }
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response('Error deleting note', { status: 500 });
  }
} 
} 