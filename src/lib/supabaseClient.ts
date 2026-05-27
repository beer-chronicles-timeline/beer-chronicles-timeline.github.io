import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jyvluckfkzkriuhrvigv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dmx1Y2tma3prcml1aHJ2aWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTU5MzgsImV4cCI6MjA5MzA3MTkzOH0.QmT_6dG1RvlcyWDbDGqqAH7dVTrkZo241XuLK7rzhh0'

export const supabase = createClient(supabaseUrl, supabaseKey)