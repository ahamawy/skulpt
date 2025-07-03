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
        // Create tables if they don't exist
        await createTables()
        console.log('Database initialized successfully')
    } catch (error) {
        console.error('Error initializing database:', error)
    }
}

async function createTables() {
    // Teachers table
    await supabase.rpc('create_table_if_not_exists', {
        table_query: `
            CREATE TABLE IF NOT EXISTS teachers (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                room VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `
    })

    // Class types table
    await supabase.rpc('create_table_if_not_exists', {
        table_query: `
            CREATE TABLE IF NOT EXISTS class_types (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                room VARCHAR(50) NOT NULL,
                level VARCHAR(50) DEFAULT 'Intermediate',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `
    })

    // Schedule entries table
    await supabase.rpc('create_table_if_not_exists', {
        table_query: `
            CREATE TABLE IF NOT EXISTS schedule_entries (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                day VARCHAR(20) NOT NULL,
                time VARCHAR(20) NOT NULL,
                room VARCHAR(50) NOT NULL,
                class_id UUID REFERENCES class_types(id),
                teacher_id UUID REFERENCES teachers(id),
                type VARCHAR(50) DEFAULT 'Mixed',
                start_date DATE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(day, time, room)
            );
        `
    })
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
    const { data, error } = await supabase
        .from('schedule_entries')
        .insert(entry)
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