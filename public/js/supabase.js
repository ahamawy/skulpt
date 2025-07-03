// Supabase configuration
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { config } from './config.js'

// Create Supabase client only if we have valid credentials
export const supabase = config.hasValidCredentials() 
    ? createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)
    : null

// Database schema functions
export async function initializeDatabase() {
    try {
        // Tables are now created via migration
        // Just verify connection by attempting a simple query
        const { error } = await supabase.from('teachers').select('count').single()
        if (!error || error.code === 'PGRST116') { // PGRST116 = no rows returned (which is fine)
            console.log('Database connection verified successfully')
        } else {
            throw error
        }
    } catch (error) {
        console.error('Error connecting to database:', error)
    }
}

// Teacher functions
export async function getTeachers(room = null) {
    let query = supabase.from('teachers').select('*')
    if (room) {
        query = query.eq('room', room)
    }
    const { data, error } = await query
    if (error) throw error
    return data
}

export async function addTeacher(name, room) {
    const { data, error } = await supabase
        .from('teachers')
        .insert({ name, room })
        .select()
    if (error) throw error
    return data[0]
}

export async function updateTeacher(id, updates) {
    const { data, error } = await supabase
        .from('teachers')
        .update(updates)
        .eq('id', id)
        .select()
    if (error) throw error
    return data[0]
}

export async function deleteTeacher(id) {
    const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id)
    if (error) throw error
}

// Class types functions
export async function getClassTypes(room = null) {
    let query = supabase.from('class_types').select('*')
    if (room) {
        query = query.eq('room', room)
    }
    const { data, error } = await query
    if (error) throw error
    return data
}

export async function addClass(name, room, level) {
    const { data, error } = await supabase
        .from('class_types')
        .insert({ name, room, level })
        .select()
    if (error) throw error
    return data[0]
}

export async function updateClass(id, updates) {
    const { data, error } = await supabase
        .from('class_types')
        .update(updates)
        .eq('id', id)
        .select()
    if (error) throw error
    return data[0]
}

export async function deleteClass(id) {
    const { error } = await supabase
        .from('class_types')
        .delete()
        .eq('id', id)
    if (error) throw error
}

// Schedule functions
export async function getSchedule() {
    const { data, error } = await supabase
        .from('schedule_entries')
        .select(`
            *,
            class:class_types(*),
            teacher:teachers(*)
        `)
    if (error) throw error
    return data
}

export async function addScheduleEntry(entry) {
    // Ensure duration is included with default of 15
    const entryWithDuration = {
        ...entry,
        duration: entry.duration || 15
    }
    const { data, error } = await supabase
        .from('schedule_entries')
        .insert(entryWithDuration)
        .select()
    if (error) throw error
    return data[0]
}

export async function updateScheduleEntry(id, updates) {
    const { data, error } = await supabase
        .from('schedule_entries')
        .update(updates)
        .eq('id', id)
        .select()
    if (error) throw error
    return data[0]
}

export async function deleteScheduleEntry(day, time, room) {
    const { error } = await supabase
        .from('schedule_entries')
        .delete()
        .eq('day', day)
        .eq('time', time)
        .eq('room', room)
    if (error) throw error
}

// Real-time subscriptions
export function subscribeToScheduleChanges(callback) {
    return supabase
        .channel('schedule-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule_entries' }, callback)
        .subscribe()
}

export function subscribeToTeacherChanges(callback) {
    return supabase
        .channel('teacher-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, callback)
        .subscribe()
}

export function subscribeToClassChanges(callback) {
    return supabase
        .channel('class-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'class_types' }, callback)
        .subscribe()
}