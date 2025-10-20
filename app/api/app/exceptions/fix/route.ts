import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { exceptionId, fixType, fixData } = body

    if (!exceptionId || !fixType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update exception status to fixed
    const result = await query(
      `UPDATE exceptions 
       SET status = 'fixed', 
           fixed_at = CURRENT_TIMESTAMP,
           fix_type = $1,
           fix_data = $2
       WHERE id = $3 
       RETURNING id, status`,
      [fixType, JSON.stringify(fixData), exceptionId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Exception not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      exception: result.rows[0]
    })

  } catch (error) {
    console.error('Fix exception error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exceptionId = searchParams.get('id')

    if (!exceptionId) {
      return NextResponse.json(
        { error: 'Exception ID required' },
        { status: 400 }
      )
    }

    const result = await query(
      'SELECT * FROM exceptions WHERE id = $1',
      [exceptionId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Exception not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      exception: result.rows[0]
    })

  } catch (error) {
    console.error('Get exception error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
