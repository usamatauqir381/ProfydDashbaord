import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    // If you're using Supabase
    const supabase = await createClient();
    
    // Fetch retention data from your database
    // Adjust this query based on your actual schema
    const { data: retentionData, error: retentionError } = await supabase
      .from('employee_retention') // Replace with your actual table name
      .select('*')
      .order('created_at', { ascending: false });
    
    if (retentionError) {
      console.error('Supabase error:', retentionError);
      return NextResponse.json(
        { 
          success: false, 
          error: retentionError.message 
        },
        { status: 500 }
      );
    }
    
    // Fetch status data if needed
    const { data: statusData, error: statusError } = await supabase
      .from('employee_status') // Replace with your actual table name
      .select('*');
    
    if (statusError) {
      console.error('Status fetch error:', statusError);
      return NextResponse.json(
        { 
          success: false, 
          error: statusError.message 
        },
        { status: 500 }
      );
    }
    
    // Process and return the data
    return NextResponse.json({ 
      success: true, 
      data: {
        retention: retentionData || [],
        status: statusData || []
      }
    });
    
  } catch (error) {
    console.error('API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Optional: POST method if you need to update retention data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    
    // Example: Update retention data
    const { data, error } = await supabase
      .from('employee_retention')
      .insert(body)
      .select();
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}