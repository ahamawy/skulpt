// Data Access Layer - Abstracts between Supabase and localStorage
import { config } from './config.js'
import * as supabaseOps from './supabase.js'

class DataAccess {
    constructor() {
        this.useSupabase = config.USE_SUPABASE && config.hasValidCredentials()
        this.cache = {
            teachers: null,
            classes: null,
            schedule: null
        }
    }

    // Teachers operations
    async getTeachers(room = null) {
        if (this.useSupabase) {
            try {
                return await supabaseOps.getTeachers(room)
            } catch (error) {
                console.error('Supabase error, falling back to localStorage:', error)
                this.useSupabase = false
            }
        }
        
        // localStorage fallback
        const movementTeachers = JSON.parse(localStorage.getItem('movementTeachers') || '[]')
        const reformerTeachers = JSON.parse(localStorage.getItem('reformerTeachers') || '[]')
        
        if (!room) {
            return [
                ...movementTeachers.map(name => ({ name, room: 'movement' })),
                ...reformerTeachers.map(name => ({ name, room: 'reformer' }))
            ]
        }
        
        const teachers = room === 'movement' ? movementTeachers : reformerTeachers
        return teachers.map(name => ({ name, room }))
    }

    async addTeacher(name, room) {
        if (this.useSupabase) {
            try {
                return await supabaseOps.addTeacher(name, room)
            } catch (error) {
                console.error('Supabase error, falling back to localStorage:', error)
                this.useSupabase = false
            }
        }
        
        // localStorage fallback
        const key = room === 'movement' ? 'movementTeachers' : 'reformerTeachers'
        const teachers = JSON.parse(localStorage.getItem(key) || '[]')
        if (!teachers.includes(name)) {
            teachers.push(name)
            localStorage.setItem(key, JSON.stringify(teachers))
        }
        return { name, room }
    }

    async deleteTeacher(id, name, room) {
        if (this.useSupabase) {
            try {
                return await supabaseOps.deleteTeacher(id)
            } catch (error) {
                console.error('Supabase error, falling back to localStorage:', error)
                this.useSupabase = false
            }
        }
        
        // localStorage fallback
        const key = room === 'movement' ? 'movementTeachers' : 'reformerTeachers'
        const teachers = JSON.parse(localStorage.getItem(key) || '[]')
        const index = teachers.indexOf(name)
        if (index > -1) {
            teachers.splice(index, 1)
            localStorage.setItem(key, JSON.stringify(teachers))
        }
    }

    // Class types operations
    async getClassTypes(room = null) {
        if (this.useSupabase) {
            try {
                return await supabaseOps.getClassTypes(room)
            } catch (error) {
                console.error('Supabase error, falling back to localStorage:', error)
                this.useSupabase = false
            }
        }
        
        // localStorage fallback
        const movementClasses = JSON.parse(localStorage.getItem('movementClassesData') || '{}')
        const reformerClasses = JSON.parse(localStorage.getItem('reformerClassesData') || '{}')
        
        const result = []
        
        if (!room || room === 'movement') {
            Object.entries(movementClasses).forEach(([name, level]) => {
                result.push({ name, level, room: 'movement' })
            })
        }
        
        if (!room || room === 'reformer') {
            Object.entries(reformerClasses).forEach(([name, level]) => {
                result.push({ name, level, room: 'reformer' })
            })
        }
        
        return result
    }

    async addClass(name, room, level) {
        if (this.useSupabase) {
            try {
                return await supabaseOps.addClass(name, room, level)
            } catch (error) {
                console.error('Supabase error, falling back to localStorage:', error)
                this.useSupabase = false
            }
        }
        
        // localStorage fallback
        const key = room === 'movement' ? 'movementClassesData' : 'reformerClassesData'
        const classes = JSON.parse(localStorage.getItem(key) || '{}')
        classes[name] = level
        localStorage.setItem(key, JSON.stringify(classes))
        return { name, room, level }
    }

    async deleteClass(id, name, room) {
        if (this.useSupabase) {
            try {
                return await supabaseOps.deleteClass(id)
            } catch (error) {
                console.error('Supabase error, falling back to localStorage:', error)
                this.useSupabase = false
            }
        }
        
        // localStorage fallback
        const key = room === 'movement' ? 'movementClassesData' : 'reformerClassesData'
        const classes = JSON.parse(localStorage.getItem(key) || '{}')
        delete classes[name]
        localStorage.setItem(key, JSON.stringify(classes))
    }

    // Schedule operations
    async getSchedule() {
        if (this.useSupabase) {
            try {
                const entries = await supabaseOps.getSchedule()
                return this.transformScheduleFromSupabase(entries)
            } catch (error) {
                console.error('Supabase error, falling back to localStorage:', error)
                this.useSupabase = false
            }
        }
        
        // localStorage fallback
        const movementSchedule = JSON.parse(localStorage.getItem('movementSchedule') || '{}')
        const reformerSchedule = JSON.parse(localStorage.getItem('reformerSchedule') || '{}')
        return { movementSchedule, reformerSchedule }
    }

    async addScheduleEntry(day, time, room, classInfo) {
        if (this.useSupabase) {
            try {
                // Find teacher and class IDs
                const teachers = await this.getTeachers(room)
                const classes = await this.getClassTypes(room)
                
                const teacher = teachers.find(t => t.name === classInfo.teacher)
                const classType = classes.find(c => c.name === classInfo.class)
                
                if (teacher && classType) {
                    return await supabaseOps.addScheduleEntry({
                        day,
                        time,
                        room,
                        class_id: classType.id,
                        teacher_id: teacher.id,
                        type: classInfo.type || 'Mixed',
                        start_date: classInfo.startDate || null
                    })
                }
            } catch (error) {
                console.error('Supabase error, falling back to localStorage:', error)
                this.useSupabase = false
            }
        }
        
        // localStorage fallback
        const key = room === 'movement' ? 'movementSchedule' : 'reformerSchedule'
        const schedule = JSON.parse(localStorage.getItem(key) || '{}')
        
        if (!schedule[day]) schedule[day] = {}
        schedule[day][time] = classInfo
        
        localStorage.setItem(key, JSON.stringify(schedule))
    }

    async deleteScheduleEntry(day, time, room) {
        if (this.useSupabase) {
            try {
                return await supabaseOps.deleteScheduleEntry(day, time, room)
            } catch (error) {
                console.error('Supabase error, falling back to localStorage:', error)
                this.useSupabase = false
            }
        }
        
        // localStorage fallback
        const key = room === 'movement' ? 'movementSchedule' : 'reformerSchedule'
        const schedule = JSON.parse(localStorage.getItem(key) || '{}')
        
        if (schedule[day] && schedule[day][time]) {
            delete schedule[day][time]
            if (Object.keys(schedule[day]).length === 0) {
                delete schedule[day]
            }
            localStorage.setItem(key, JSON.stringify(schedule))
        }
    }

    // Helper method to transform Supabase data to app format
    transformScheduleFromSupabase(entries) {
        const movementSchedule = {}
        const reformerSchedule = {}
        
        entries.forEach(entry => {
            const schedule = entry.room === 'movement' ? movementSchedule : reformerSchedule
            
            if (!schedule[entry.day]) schedule[entry.day] = {}
            
            schedule[entry.day][entry.time] = {
                class: entry.class.name,
                teacher: entry.teacher.name,
                level: entry.class.level,
                type: entry.type,
                startDate: entry.start_date
            }
        })
        
        return { movementSchedule, reformerSchedule }
    }

    // Real-time subscriptions
    subscribeToChanges(onScheduleChange, onTeacherChange, onClassChange) {
        if (this.useSupabase && config.ENABLE_REALTIME) {
            supabaseOps.subscribeToScheduleChanges(onScheduleChange)
            supabaseOps.subscribeToTeacherChanges(onTeacherChange)
            supabaseOps.subscribeToClassChanges(onClassChange)
        }
    }
}

// Export singleton instance
export const dataAccess = new DataAccess()