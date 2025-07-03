// Wrapper to enhance the existing SkulptApp with Supabase support
import { dataAccess } from './dataAccess.js'
import { needsMigration, migrateDataToSupabase, markMigrationComplete } from './migration.js'
import { config } from './config.js'

// Store original methods
const originalMethods = {};

// Enhance SkulptApp after it's loaded
function enhanceApp() {
    if (!window.SkulptApp) {
        console.error('SkulptApp not found');
        return;
    }

    // Store original methods
    originalMethods.loadTeachersAndClasses = SkulptApp.prototype.loadTeachersAndClasses;
    originalMethods.loadScheduleData = SkulptApp.prototype.loadScheduleData;
    originalMethods.saveTeachersAndClasses = SkulptApp.prototype.saveTeachersAndClasses;
    originalMethods.saveScheduleData = SkulptApp.prototype.saveScheduleData;
    originalMethods.init = SkulptApp.prototype.init;

    // Override init to add migration check
    SkulptApp.prototype.init = async function() {
        // Check if we need to migrate data
        if (needsMigration() && config.hasValidCredentials()) {
            console.log('Migrating data to Supabase...');
            const migrationSuccess = await migrateDataToSupabase();
            if (migrationSuccess) {
                markMigrationComplete();
                console.log('Data successfully migrated to Supabase!');
            }
        }

        // Call original init
        originalMethods.init.call(this);

        // Set up real-time subscriptions if using Supabase
        if (config.USE_SUPABASE && config.hasValidCredentials()) {
            this.setupRealtimeSubscriptions();
        }
    };

    // Add real-time subscription setup
    SkulptApp.prototype.setupRealtimeSubscriptions = function() {
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
    };

    // Override data loading methods to use dataAccess
    SkulptApp.prototype.loadTeachersAndClasses = async function() {
        if (config.USE_SUPABASE && config.hasValidCredentials()) {
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
                console.error('Error loading from Supabase, falling back to localStorage:', error);
                originalMethods.loadTeachersAndClasses.call(this);
            }
        } else {
            originalMethods.loadTeachersAndClasses.call(this);
        }
    };

    SkulptApp.prototype.loadScheduleData = async function() {
        if (config.USE_SUPABASE && config.hasValidCredentials()) {
            try {
                const { movementSchedule, reformerSchedule } = await dataAccess.getSchedule();
                this.movementSchedule = movementSchedule || {};
                this.reformerSchedule = reformerSchedule || {};
            } catch (error) {
                console.error('Error loading from Supabase, falling back to localStorage:', error);
                originalMethods.loadScheduleData.call(this);
            }
        } else {
            originalMethods.loadScheduleData.call(this);
        }
    };

    // Override save methods to use dataAccess
    SkulptApp.prototype.saveTeachersAndClasses = async function() {
        if (config.USE_SUPABASE && config.hasValidCredentials()) {
            // With Supabase, saves are handled individually through add/remove operations
            return;
        } else {
            originalMethods.saveTeachersAndClasses.call(this);
        }
    };

    SkulptApp.prototype.saveScheduleData = async function() {
        if (config.USE_SUPABASE && config.hasValidCredentials()) {
            // With Supabase, saves are handled individually through add/remove operations
            return;
        } else {
            originalMethods.saveScheduleData.call(this);
        }
    };

    // Override add/remove methods to use dataAccess
    const originalAddClass = SkulptApp.prototype.addClass;
    SkulptApp.prototype.addClass = async function(roomType) {
        const inputField = document.getElementById(`${roomType}ClassInput`);
        const className = inputField.value.trim();
        
        if (className && config.USE_SUPABASE && config.hasValidCredentials()) {
            try {
                await dataAccess.addClass(className, roomType, 'Intermediate');
                await this.loadTeachersAndClasses();
                this.showSettings();
                inputField.value = '';
            } catch (error) {
                console.error('Error adding class:', error);
                originalAddClass.call(this, roomType);
            }
        } else {
            originalAddClass.call(this, roomType);
        }
    };

    const originalRemoveClass = SkulptApp.prototype.removeClass;
    SkulptApp.prototype.removeClass = async function(className, roomType) {
        if (className && roomType && config.USE_SUPABASE && config.hasValidCredentials()) {
            try {
                await dataAccess.deleteClass(null, className, roomType);
                await this.loadTeachersAndClasses();
                this.showSettings();
            } catch (error) {
                console.error('Error removing class:', error);
                originalRemoveClass.call(this, className, roomType);
            }
        } else {
            originalRemoveClass.call(this, className, roomType);
        }
    };

    const originalAddTeacher = SkulptApp.prototype.addTeacher;
    SkulptApp.prototype.addTeacher = async function(roomType) {
        const inputField = document.getElementById(`${roomType}TeacherInput`);
        const teacherName = inputField.value.trim();
        
        if (teacherName && config.USE_SUPABASE && config.hasValidCredentials()) {
            try {
                await dataAccess.addTeacher(teacherName, roomType);
                await this.loadTeachersAndClasses();
                this.showSettings();
                inputField.value = '';
            } catch (error) {
                console.error('Error adding teacher:', error);
                originalAddTeacher.call(this, roomType);
            }
        } else {
            originalAddTeacher.call(this, roomType);
        }
    };

    const originalRemoveTeacher = SkulptApp.prototype.removeTeacher;
    SkulptApp.prototype.removeTeacher = async function(teacherName, roomType) {
        if (teacherName && roomType && config.USE_SUPABASE && config.hasValidCredentials()) {
            try {
                await dataAccess.deleteTeacher(null, teacherName, roomType);
                await this.loadTeachersAndClasses();
                this.showSettings();
            } catch (error) {
                console.error('Error removing teacher:', error);
                originalRemoveTeacher.call(this, teacherName, roomType);
            }
        } else {
            originalRemoveTeacher.call(this, teacherName, roomType);
        }
    };

    const originalSaveClass = SkulptApp.prototype.saveClass;
    SkulptApp.prototype.saveClass = async function() {
        if (config.USE_SUPABASE && config.hasValidCredentials() && this.currentCell && this.selectedClass) {
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
                originalSaveClass.call(this);
            }
        } else {
            originalSaveClass.call(this);
        }
    };

    const originalRemoveClassSchedule = SkulptApp.prototype.removeClass;
    SkulptApp.prototype.removeClass = async function() {
        // If called with parameters, it's removing a class type
        if (arguments.length > 0) {
            return originalRemoveClass.call(this, arguments[0], arguments[1]);
        }
        
        // Otherwise, it's removing from schedule
        if (config.USE_SUPABASE && config.hasValidCredentials() && this.currentCell) {
            const { day, time, room } = this.currentCell;
            
            try {
                await dataAccess.deleteScheduleEntry(day, time, room);
                await this.loadScheduleData();
                this.renderSchedule();
                this.updateStats();
                this.closeModal();
            } catch (error) {
                console.error('Error removing class:', error);
                originalRemoveClassSchedule.call(this);
            }
        } else {
            originalRemoveClassSchedule.call(this);
        }
    };

    console.log('SkulptApp enhanced with Supabase support');
}

// Export the enhance function
export { enhanceApp };