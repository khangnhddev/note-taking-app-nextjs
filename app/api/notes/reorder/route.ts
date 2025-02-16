import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const { noteIds } = await request.json();

    // Update each note's order in a transaction
    await prisma.$transaction(
      noteIds.map(({ id, order }: { id: string; order: number }) =>
        prisma.note.update({
          where: { id },
          data: { order },
        })
      )
    );

    return NextResponse.json({ message: 'Notes reordered successfully' });
  } catch (error) {
    console.error('Error reordering notes:', error);
    return NextResponse.json(
      { error: 'Failed to reorder notes' },
      { status: 500 }
    );
  }
} 