import { createClient } from '@supabase/supabase-js'

// Helper to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default async function handler(req: any, res: any) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Get apps to check
    const { data: apps, error } = await supabase
      .from('apps')
      .select('*')
      .eq('status', 'Online')

    if (error) throw error
    if (!apps || apps.length === 0) {
      return res.status(200).json({ message: 'No apps to monitor' })
    }

    const results = []

    // 2. Check each app
    for (const app of apps) {
      try {
        let isOnline = true
        
        // Google Play Check
        if (app.platform === 'Google Play') {
          // Use a realistic User-Agent to avoid immediate blocking
          const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          
          const checkRes = await fetch(`https://play.google.com/store/apps/details?id=${app.package_id}`, {
            method: 'GET',
            headers: { 'User-Agent': userAgent }
          })
          
          // Google Play returns 404 for removed apps
          if (checkRes.status === 404) {
            isOnline = false
          }
        }
        
        if (!isOnline) {
          console.log(`[Alert] App ${app.name} (${app.package_id}) seems to be removed.`)
          
          // Update status
          await supabase.from('apps').update({ 
            status: 'Removed', 
            last_check: new Date().toISOString() 
          }).eq('id', app.id)

          // Create Alert
          await supabase.from('alerts').insert({
            app_name: app.name,
            package_id: app.package_id,
            platform: app.platform,
            region: app.region,
            alert_group: 'System',
            alert_time: new Date().toISOString()
          })

          // Send Notification (Telegram)
          // const botToken = process.env.TELEGRAM_BOT_TOKEN
          // const chatId = process.env.TELEGRAM_CHAT_ID
          // if (botToken && chatId) {
          //   const text = `🚨 *App Removed Alert* 🚨\n\nName: ${app.name}\nID: ${app.package_id}\nPlatform: ${app.platform}\nTime: ${new Date().toLocaleString()}`
          //   await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          //     method: 'POST',
          //     headers: { 'Content-Type': 'application/json' },
          //     body: JSON.stringify({
          //       chat_id: chatId,
          //       text: text,
          //       parse_mode: 'Markdown'
          //     })
          //   })
          // }
          
          results.push({ id: app.id, name: app.name, status: 'Removed' })
        } else {
          // Update last check
          await supabase.from('apps').update({ 
            last_check: new Date().toISOString() 
          }).eq('id', app.id)
          
          results.push({ id: app.id, name: app.name, status: 'Online' })
        }

        // Delay to prevent rate limiting
        await delay(1000)

      } catch (err: any) {
        console.error(`Error checking app ${app.id}:`, err)
        results.push({ id: app.id, name: app.name, error: err.message })
      }
    }

    return res.status(200).json({ 
      success: true, 
      checked: apps.length, 
      results 
    })

  } catch (err: any) {
    console.error('Cron job error:', err)
    return res.status(500).json({ error: err.message })
  }
}
