import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Check if user has an organization
        const { data: user } = await supabase.auth.getUser()
        
        if (user?.user) {
          let { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.user.id)
            .single()
          
          // If profile doesn't exist, create it manually
          if (!profile) {
            try {
              // Create organization first
              const { data: org } = await supabase
                .from('organizations')
                .insert({
                  name: user.user.email?.split('@')[1] || 'My Company',
                  slug: (user.user.email?.split('@')[1] || 'company').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + user.user.id.substring(0, 8),
                  billing_email: user.user.email,
                  subscription_tier: 'free',
                  trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                })
                .select()
                .single()

              if (org) {
                // Create profile
                await supabase
                  .from('profiles')
                  .insert({
                    id: user.user.id,
                    email: user.user.email,
                    full_name: user.user.user_metadata?.full_name || user.user.email?.split('@')[0] || '',
                    organization_id: org.id,
                    role: 'owner',
                    is_active: true
                  })

                profile = { organization_id: org.id }
              }
            } catch (createError) {
              console.error('Error creating profile:', createError)
            }
          }
          
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

  // If something went wrong, redirect to home with error
  return NextResponse.redirect(`${origin}/?error=auth_callback_error`)
}