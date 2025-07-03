// Skulpt Studio Booking System - Modular Version with Supabase Support
import { dataAccess } from './dataAccess.js'
import { needsMigration, migrateDataToSupabase, markMigrationComplete } from './migration.js'
import { config } from './config.js'

// Export the app class for global access
window.SkulptApp = class SkulptApp {
    constructor() {
        // Check URL parameters for user type
        const urlParams = new URLSearchParams(window.location.search);
        this.userType = urlParams.get('user') || 'ghazal'; // Default to ghazal if no param
        
        // Data structures
        this.timeSlots = this.generateTimeSlots();

        this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Initialize empty data structures
        this.movementClasses = [];
        this.movementTeachers = [];
        this.reformerClasses = [];
        this.reformerTeachers = [];
        this.movementClassesData = {};
        this.reformerClassesData = {};
        this.movementSchedule = {};
        this.reformerSchedule = {};

        // State
        this.currentRoom = 'movement';
        this.currentView = 'schedule';
        this.currentCell = null;
        this.selectedClass = '';
        this.selectedLevel = '';
        this.selectedType = 'Mixed';
        this.editMode = 'add'; // 'add' or 'remove'
        this.selectedDate = null;
        this.scheduleStartDate = new Date(); // Current date as default

        // Initialize the app
        this.init();
    }

    generateTimeSlots() {
        const slots = [];
        const startHour = 5; // 5:00 AM
        const endHour = 21; // 9:00 PM
        
        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minutes = 0; minutes < 60; minutes += 15) {
                if (hour === endHour && minutes > 0) break; // Stop at 9:00 PM
                
                const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                const period = hour >= 12 ? 'PM' : 'AM';
                const minutesStr = minutes.toString().padStart(2, '0');
                
                slots.push(`${displayHour}:${minutesStr} ${period}`);
            }
        }
        
        return slots;
    }

    async init() {
        // Check if we need to migrate data
        if (needsMigration() && config.hasValidCredentials()) {
            const migrationSuccess = await migrateDataToSupabase();
            if (migrationSuccess) {
                markMigrationComplete();
                console.log('Data successfully migrated to Supabase!');
            }
        }

        // Load all data from database or localStorage
        await this.loadAllData();

        // Initialize event listeners
        this.setupEventListeners();
        
        // Update UI based on user type
        this.updateUIForUserType();
        
        // Update UI
        this.updateTime();
        setInterval(() => this.updateTime(), 60000);
        this.renderSchedule();
        this.updateStats();

        // Subscribe to real-time updates if using Supabase
        this.setupRealtimeSubscriptions();
    }

    async loadAllData() {
        // Load teachers and classes
        await this.loadTeachersAndClasses();
        
        // Load schedules
        await this.loadScheduleData();
    }

    async loadTeachersAndClasses() {
        try {
            // Load teachers
            const teachers = await dataAccess.getTeachers();
            this.movementTeachers = teachers.filter(t => t.room === 'movement').map(t => t.name);
            this.reformerTeachers = teachers.filter(t => t.room === 'reformer').map(t => t.name);

            // Load classes
            const classes = await dataAccess.getClassTypes();
            this.movementClassesData = {};
            this.reformerClassesData = {};

            classes.forEach(cls => {
                if (cls.room === 'movement') {
                    this.movementClassesData[cls.name] = cls.level;
                } else {
                    this.reformerClassesData[cls.name] = cls.level;
                }
            });

            this.movementClasses = Object.keys(this.movementClassesData);
            this.reformerClasses = Object.keys(this.reformerClassesData);
        } catch (error) {
            console.error('Error loading teachers and classes:', error);
        }
    }

    async loadScheduleData() {
        try {
            const { movementSchedule, reformerSchedule } = await dataAccess.getSchedule();
            this.movementSchedule = movementSchedule || {};
            this.reformerSchedule = reformerSchedule || {};
        } catch (error) {
            console.error('Error loading schedule data:', error);
        }
    }

    setupRealtimeSubscriptions() {
        dataAccess.subscribeToChanges(
            // Schedule change handler
            async () => {
                await this.loadScheduleData();
                this.renderSchedule();
                this.updateStats();
            },
            // Teacher change handler
            async () => {
                await this.loadTeachersAndClasses();
                this.renderSchedule();
                if (this.currentView === 'settings') {
                    this.showSettings();
                }
            },
            // Class change handler
            async () => {
                await this.loadTeachersAndClasses();
                this.renderSchedule();
                if (this.currentView === 'settings') {
                    this.showSettings();
                }
            }
        );
    }

    // Copy all other methods from the original app.js
    // The rest of the methods remain the same, just need to update data saving methods
    // to use dataAccess instead of localStorage directly

    async saveScheduleData() {
        // Schedule saving is handled through individual entry operations
        // No need to save the entire schedule at once with database approach
    }

    async addClass(roomType) {
        const inputField = document.getElementById(`${roomType}ClassInput`);
        const className = inputField.value.trim();
        
        if (className) {
            try {
                await dataAccess.addClass(className, roomType, 'Intermediate');
                await this.loadTeachersAndClasses();
                this.showSettings();
                inputField.value = '';
            } catch (error) {
                console.error('Error adding class:', error);
                alert('Failed to add class. Please try again.');
            }
        }
    }

    async removeClass(className, roomType) {
        try {
            await dataAccess.deleteClass(null, className, roomType);
            await this.loadTeachersAndClasses();
            this.showSettings();
        } catch (error) {
            console.error('Error removing class:', error);
            alert('Failed to remove class. Please try again.');
        }
    }

    async addTeacher(roomType) {
        const inputField = document.getElementById(`${roomType}TeacherInput`);
        const teacherName = inputField.value.trim();
        
        if (teacherName) {
            try {
                await dataAccess.addTeacher(teacherName, roomType);
                await this.loadTeachersAndClasses();
                this.showSettings();
                inputField.value = '';
            } catch (error) {
                console.error('Error adding teacher:', error);
                alert('Failed to add teacher. Please try again.');
            }
        }
    }

    async removeTeacher(teacherName, roomType) {
        try {
            await dataAccess.deleteTeacher(null, teacherName, roomType);
            await this.loadTeachersAndClasses();
            this.showSettings();
        } catch (error) {
            console.error('Error removing teacher:', error);
            alert('Failed to remove teacher. Please try again.');
        }
    }

    async saveClass() {
        if (!this.currentCell || !this.selectedClass) return;
        
        const { day, time, room } = this.currentCell;
        const teacherSelect = document.getElementById('teacherSelect');
        const selectedTeacher = teacherSelect.value;
        
        if (!selectedTeacher) {
            alert('Please select a teacher');
            return;
        }
        
        const classLevel = room === 'movement' ? 
            this.movementClassesData[this.selectedClass] : 
            this.reformerClassesData[this.selectedClass];
        
        const classInfo = {
            class: this.selectedClass,
            teacher: selectedTeacher,
            level: classLevel || 'Intermediate',
            type: this.selectedType,
            startDate: this.selectedDate
        };
        
        try {
            await dataAccess.addScheduleEntry(day, time, room, classInfo);
            await this.loadScheduleData();
            this.renderSchedule();
            this.updateStats();
            this.closeModal();
        } catch (error) {
            console.error('Error saving class:', error);
            alert('Failed to save class. Please try again.');
        }
    }

    async removeClass() {
        if (!this.currentCell) return;
        
        const { day, time, room } = this.currentCell;
        
        try {
            await dataAccess.deleteScheduleEntry(day, time, room);
            await this.loadScheduleData();
            this.renderSchedule();
            this.updateStats();
            this.closeModal();
        } catch (error) {
            console.error('Error removing class:', error);
            alert('Failed to remove class. Please try again.');
        }
    }

    // Include all other methods from the original app.js file
    // (updateUIForUserType, setupEventListeners, updateTime, showView, etc.)
    // These methods remain exactly the same as in the original file
}