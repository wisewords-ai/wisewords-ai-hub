import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jhffowinsjiynhrdkqfr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZmZvd2luc2ppeW5ocmRrcWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NjQzNjYsImV4cCI6MjA3NTA0MDM2Nn0.mzirtQ_UV8g7T1L3FZXbD9SIFxX-JVb91Ko9ol4Mfbg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
