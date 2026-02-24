import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { isActive, isDefault } = body

    // If setting as default, unset other defaults first
    if (isDefault) {
      await prisma.bankAccount.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    const bankAccount = await prisma.bankAccount.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(isDefault !== undefined && { isDefault }),
      },
    })

    return NextResponse.json(bankAccount)
  } catch (error) {
    console.error('Error updating bank account:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate rekening' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    await prisma.bankAccount.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bank account:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus rekening' },
      { status: 500 }
    )
  }
}
