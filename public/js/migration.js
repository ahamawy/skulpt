// Migration script to move data from localStorage to Supabase
import { supabase, addTeacher, addClass, addScheduleEntry } from './supabase.js'

export async function migrateDataToSupabase() {
    console.log('Starting migration from localStorage to Supabase...')
    
    try {
        // Migrate teachers
        await migrateTeachers()
        
        // Migrate classes
        await migrateClasses()
        
        // Migrate schedule
        await migrateSchedule()
        
        console.log('Migration completed successfully!')
        return true
    } catch (error) {
        console.error('Migration failed:', error)
        return false
    }
}

async function migrateTeachers() {
    console.log('Migrating teachers...')
    
    // Get teachers from localStorage
    const movementTeachers = JSON.parse(localStorage.getItem('movementTeachers') || '[]')
    const reformerTeachers = JSON.parse(localStorage.getItem('reformerTeachers') || '[]')
    
    // Migrate movement teachers
    for (const teacher of movementTeachers) {
        try {
            await addTeacher(teacher, 'movement')
            console.log(`Migrated movement teacher: ${teacher}`)
        } catch (error) {
            console.error(`Failed to migrate movement teacher ${teacher}:`, error)
        }
    }
    
    // Migrate reformer teachers
    for (const teacher of reformerTeachers) {
        try {
            await addTeacher(teacher, 'reformer')
            console.log(`Migrated reformer teacher: ${teacher}`)
        } catch (error) {
            console.error(`Failed to migrate reformer teacher ${teacher}:`, error)
        }
    }
}

async function migrateClasses() {
    console.log('Migrating classes...')
    
    // Get classes from localStorage
    const movementClasses = JSON.parse(localStorage.getItem('movementClassesData') || '{}')
    const reformerClasses = JSON.parse(localStorage.getItem('reformerClassesData') || '{}')
    
    // Create a map to store class names to IDs
    const classMap = {}
    
    // Migrate movement classes
    for (const [className, level] of Object.entries(movementClasses)) {
        try {
            const classData = await addClass(className, 'movement', level)
            classMap[`movement_${className}`] = classData.id
            console.log(`Migrated movement class: ${className}`)
        } catch (error) {
            console.error(`Failed to migrate movement class ${className}:`, error)
        }
    }
    
    // Migrate reformer classes
    for (const [className, level] of Object.entries(reformerClasses)) {
        try {
            const classData = await addClass(className, 'reformer', level)
            classMap[`reformer_${className}`] = classData.id
            console.log(`Migrated reformer class: ${className}`)
        } catch (error) {
            console.error(`Failed to migrate reformer class ${className}:`, error)
        }
    }
    
    // Store class map for schedule migration
    window.classMap = classMap
}

async function migrateSchedule() {
    console.log('Migrating schedule...')
    
    // Get schedules from localStorage
    const movementSchedule = JSON.parse(localStorage.getItem('movementSchedule') || '{}')
    const reformerSchedule = JSON.parse(localStorage.getItem('reformerSchedule') || '{}')
    
    // Get teachers and classes from database to map names to IDs
    const { data: teachers } = await supabase.from('teachers').select('*')
    const { data: classes } = await supabase.from('class_types').select('*')
    
    const teacherMap = {}
    teachers.forEach(t => teacherMap[`${t.room}_${t.name}`] = t.id)
    
    const classMap = {}
    classes.forEach(c => classMap[`${c.room}_${c.name}`] = c.id)
    
    // Migrate movement schedule
    for (const [day, times] of Object.entries(movementSchedule)) {
        for (const [time, classInfo] of Object.entries(times)) {
            try {
                const teacherId = teacherMap[`movement_${classInfo.teacher}`]
                const classId = classMap[`movement_${classInfo.class}`]
                
                if (teacherId && classId) {
                    await addScheduleEntry({
                        day,
                        time,
                        room: 'movement',
                        class_id: classId,
                        teacher_id: teacherId,
                        type: classInfo.type || 'Mixed',
                        start_date: classInfo.startDate || null
                    })
                    console.log(`Migrated movement schedule entry: ${day} ${time}`)
                }
            } catch (error) {
                console.error(`Failed to migrate movement schedule ${day} ${time}:`, error)
            }
        }
    }
    
    // Migrate reformer schedule
    for (const [day, times] of Object.entries(reformerSchedule)) {
        for (const [time, classInfo] of Object.entries(times)) {
            try {
                const teacherId = teacherMap[`reformer_${classInfo.teacher}`]
                const classId = classMap[`reformer_${classInfo.class}`]
                
                if (teacherId && classId) {
                    await addScheduleEntry({
                        day,
                        time,
                        room: 'reformer',
                        class_id: classId,
                        teacher_id: teacherId,
                        type: classInfo.type || 'Mixed',
                        start_date: classInfo.startDate || null
                    })
                    console.log(`Migrated reformer schedule entry: ${day} ${time}`)
                }
            } catch (error) {
                console.error(`Failed to migrate reformer schedule ${day} ${time}:`, error)
            }
        }
    }
}

// Check if data needs migration
export function needsMigration() {
    // Check if we have data in localStorage but haven't migrated yet
    const hasMigrated = localStorage.getItem('supabase_migration_complete')
    if (hasMigrated) return false
    
    // Check if there's data to migrate
    const hasMovementSchedule = localStorage.getItem('movementSchedule')
    const hasReformerSchedule = localStorage.getItem('reformerSchedule')
    
    return !!(hasMovementSchedule || hasReformerSchedule)
}

// Mark migration as complete
export function markMigrationComplete() {
    localStorage.setItem('supabase_migration_complete', 'true')
}