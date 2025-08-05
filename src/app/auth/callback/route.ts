import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Check if user has an organization
        const { data: user } = await supabase.auth.getUser()
        
        if (user?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.user.id)
            .single()
          
          // Redirect based on whether user has completed organization setup
          if (profile?.organization_id) {
            return NextResponse.redirect(`${origin}/dashboard`)
          } else {
            return NextResponse.redirect(`${origin}/organization`)
          }
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // If something went wrong, redirect to sign-in with error
  return NextResponse.redirect(`${origin}/auth/signin?error=auth_callback_error`)
}