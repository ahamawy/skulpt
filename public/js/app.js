// Skulpt Studio Booking System - Main Application
class SkulptApp {
    constructor() {
        // Check URL parameters for user type
        const urlParams = new URLSearchParams(window.location.search);
        this.userType = urlParams.get('user') || 'ghazal'; // Default to ghazal if no param
        
        // Data structures
        this.timeSlots = this.generateTimeSlots();

        this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Movement Classes with default levels
        this.movementClassesData = {
            'Barre Skulpt': 'Intermediate',
            'Skulpt X Strength': 'Intermediate',
            'Skulpt Ground': 'Intermediate',
            'Mobility: Strength X Flexibility': 'Beginner',
            'Hatha Yoga - Sun': 'Intermediate',
            'Hatha Yoga - Moon': 'Beginner',
            'Yin Yoga': 'Beginner',
            'SKULPT X Mama': 'Beginner',
            'Teens X Skulpt Ground': 'Teens'
        };

        this.movementClasses = Object.keys(this.movementClassesData);
        this.movementTeachers = ['Ann', 'Zeena', 'Haya', 'Vicktoria', 'Natalie'];

        // Reformer Classes with default levels
        this.reformerClassesData = {
            'Strong Start (Beginner)': 'Beginner',
            'Skulpt & Tone (Intermediate)': 'Intermediate',
            'Skulpt Vertical: Tower': 'Advanced',
            'Chair & Tower': 'Intermediate',
            'Cardio Skulpt Reformer': 'Advanced',
            'Skulpt BarreFormer': 'Intermediate',
            'Reformer for Active Aging': 'Beginner',
            'Strong Mama Reformer': 'Beginner',
            'Teen SKULPT Reformer': 'Teens',
            'SKULPT Core X Booty Reformer': 'Advanced'
        };

        this.reformerClasses = Object.keys(this.reformerClassesData);
        this.reformerTeachers = ['Natalie', 'Tina', 'Sara A', 'Rebecca', 'Nour', 'Nadeen H', 'Nadeen S', 'Deena'];

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

        // Load all data from localStorage or use defaults
        this.loadAllData();

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

    init() {
        // Initialize event listeners
        this.setupEventListeners();
        // Update UI based on user type
        this.updateUIForUserType();
        // Update UI
        this.updateTime();
        setInterval(() => this.updateTime(), 60000);
        this.renderSchedule();
        this.updateStats();
    }

    updateUIForUserType() {
        // Update the user display in navigation
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay) {
            userDisplay.textContent = this.userType === 'superadmin' ? 'Superadmin' : 'Ghazal';
        }
        
        // Update welcome message
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            if (this.userType === 'ghazal') {
                welcomeMessage.innerHTML = 'Hello Ghazal <span style="font-size: 0.6em; opacity: 0.7;">✨</span>';
            } else {
                welcomeMessage.innerHTML = 'Hello There <span style="font-size: 0.6em; opacity: 0.7;">👋</span>';
            }
        }
        
        // Show/hide settings button based on user type
        const settingsBtn = document.querySelector('[data-view="settings"]');
        if (settingsBtn) {
            settingsBtn.style.display = this.userType === 'superadmin' ? 'inline-flex' : 'none';
        }
    }

    loadAllData() {
        // Load teachers and classes
        this.loadTeachersAndClasses();
        
        // Load schedules
        this.loadScheduleData();
    }

    loadTeachersAndClasses() {
        // Load custom teachers
        const savedMovementTeachers = localStorage.getItem('movementTeachers');
        const savedReformerTeachers = localStorage.getItem('reformerTeachers');
        
        if (savedMovementTeachers) {
            this.movementTeachers = JSON.parse(savedMovementTeachers);
        }
        if (savedReformerTeachers) {
            this.reformerTeachers = JSON.parse(savedReformerTeachers);
        }
        
        // Load custom classes
        const savedMovementClasses = localStorage.getItem('movementClassesData');
        const savedReformerClasses = localStorage.getItem('reformerClassesData');
        
        if (savedMovementClasses) {
            this.movementClassesData = JSON.parse(savedMovementClasses);
            this.movementClasses = Object.keys(this.movementClassesData);
        }
        if (savedReformerClasses) {
            this.reformerClassesData = JSON.parse(savedReformerClasses);
            this.reformerClasses = Object.keys(this.reformerClassesData);
        }
    }

    saveTeachersAndClasses() {
        localStorage.setItem('movementTeachers', JSON.stringify(this.movementTeachers));
        localStorage.setItem('reformerTeachers', JSON.stringify(this.reformerTeachers));
        localStorage.setItem('movementClassesData', JSON.stringify(this.movementClassesData));
        localStorage.setItem('reformerClassesData', JSON.stringify(this.reformerClassesData));
    }

    loadScheduleData() {
        // Try to load from localStorage
        const savedMovement = localStorage.getItem('movementSchedule');
        const savedReformer = localStorage.getItem('reformerSchedule');

        if (savedMovement) {
            this.movementSchedule = JSON.parse(savedMovement);
            // Migrate existing classes to have 45-minute duration
            this.migrateScheduleDurations(this.movementSchedule);
        } else {
            // Default schedule
            this.movementSchedule = {
                'Sunday': {
                    '10:00 AM': { class: 'Mobility: Strength X Flexibility', teacher: 'Vicktoria', level: 'Beginner', type: 'Mixed', duration: 45 },
                    '6:00 PM': { class: 'Skulpt X Strength', teacher: 'Zeena', level: 'Intermediate', type: 'Mixed', duration: 45 },
                    '7:00 PM': { class: 'Yin Yoga', teacher: 'Haya', level: 'Beginner', type: 'Mixed', duration: 45 }
                },
                'Monday': {
                    '9:00 AM': { class: 'SKULPT X Mama', teacher: 'Natalie', level: 'Beginner', type: 'Ladies Only', duration: 45 },
                    '10:00 AM': { class: 'Hatha Yoga - Sun', teacher: 'Haya', level: 'Intermediate', type: 'Mixed', duration: 45 },
                    '11:15 AM': { class: 'Barre Skulpt', teacher: 'Ann', level: 'Intermediate', type: 'Ladies Only', duration: 45 },
                    '12:15 PM': { class: 'Skulpt Ground', teacher: 'Zeena', level: 'Intermediate', type: 'Mixed', duration: 45 },
                    '6:00 PM': { class: 'Hatha Yoga - Moon', teacher: 'Haya', level: 'Beginner', type: 'Mixed', duration: 45 }
                },
                'Tuesday': {
                    '10:00 AM': { class: 'Hatha Yoga - Moon', teacher: 'Haya', level: 'Beginner', type: 'Mixed' },
                    '6:00 PM': { class: 'Skulpt Ground', teacher: 'Zeena', level: 'Intermediate', type: 'Mixed' },
                    '7:00 PM': { class: 'Hatha Yoga - Moon', teacher: 'Haya', level: 'Beginner', type: 'Mixed' }
                },
                'Wednesday': {
                    '9:00 AM': { class: 'SKULPT X Mama', teacher: 'Natalie', level: 'Beginner', type: 'Ladies Only' },
                    '10:00 AM': { class: 'Hatha Yoga - Sun', teacher: 'Haya', level: 'Intermediate', type: 'Mixed' },
                    '11:15 AM': { class: 'Barre Skulpt', teacher: 'Ann', level: 'Intermediate', type: 'Ladies Only' },
                    '12:15 PM': { class: 'Teens X Skulpt Ground', teacher: 'Zeena', level: 'Teens', type: 'Mixed' },
                    '6:00 PM': { class: 'Hatha Yoga - Moon', teacher: 'Haya', level: 'Beginner', type: 'Mixed' }
                },
                'Thursday': {
                    '10:00 AM': { class: 'Mobility: Strength X Flexibility', teacher: 'Vicktoria', level: 'Beginner', type: 'Mixed' },
                    '11:00 AM': { class: 'Skulpt X Strength', teacher: 'Zeena', level: 'Intermediate', type: 'Mixed' }
                },
                'Friday': {
                    '6:00 PM': { class: 'Yin Yoga', teacher: 'Haya', level: 'Beginner', type: 'Mixed' }
                },
                'Saturday': {
                    '10:00 AM': { class: 'Mobility: Strength X Flexibility', teacher: 'Vicktoria', level: 'Beginner', type: 'Mixed' }
                }
            };
        }

        if (savedReformer) {
            this.reformerSchedule = JSON.parse(savedReformer);
            // Migrate existing classes to have 45-minute duration
            this.migrateScheduleDurations(this.reformerSchedule);
        } else {
            // Default schedule
            this.reformerSchedule = {
                'Sunday': {
                    '7:00 AM': { class: 'Strong Start (Beginner)', teacher: 'Nadeen H', level: 'Beginner', type: 'Mixed' },
                    '9:30 AM': { class: 'Skulpt Vertical: Tower', teacher: 'Sara A', level: 'Advanced', type: 'Mixed' },
                    '10:30 AM': { class: 'Strong Start (Beginner)', teacher: 'Sara A', level: 'Beginner', type: 'Mixed' },
                    '11:30 AM': { class: 'Strong Mama Reformer', teacher: 'Nadeen H', level: 'Beginner', type: 'Ladies Only' },
                    '12:30 PM': { class: 'Teen SKULPT Reformer', teacher: 'Nadeen H', level: 'Teens', type: 'Mixed' },
                    '5:30 PM': { class: 'Skulpt BarreFormer', teacher: 'Natalie', level: 'Intermediate', type: 'Ladies Only' },
                    '6:30 PM': { class: 'Strong Start (Beginner)', teacher: 'Natalie', level: 'Beginner', type: 'Mixed' },
                    '7:30 PM': { class: 'Chair & Tower', teacher: 'Deena', level: 'Intermediate', type: 'Mixed' }
                },
                'Monday': {
                    '7:00 AM': { class: 'Skulpt & Tone (Intermediate)', teacher: 'Natalie', level: 'Intermediate', type: 'Mixed' },
                    '10:00 AM': { class: 'Cardio Skulpt Reformer', teacher: 'Nour', level: 'Advanced', type: 'Mixed' },
                    '11:00 AM': { class: 'Strong Start (Beginner)', teacher: 'Nour', level: 'Beginner', type: 'Mixed' },
                    '12:00 PM': { class: 'Skulpt & Tone (Intermediate)', teacher: 'Nadeen S', level: 'Intermediate', type: 'Mixed' },
                    '5:30 PM': { class: 'Skulpt & Tone (Intermediate)', teacher: 'Tina', level: 'Intermediate', type: 'Mixed' },
                    '6:30 PM': { class: 'Strong Start (Beginner)', teacher: 'Tina', level: 'Beginner', type: 'Mixed' },
                    '7:30 PM': { class: 'SKULPT Core X Booty Reformer', teacher: 'Tina', level: 'Advanced', type: 'Ladies Only' }
                },
                'Tuesday': {
                    '7:00 AM': { class: 'Strong Start (Beginner)', teacher: 'Tina', level: 'Beginner', type: 'Mixed' },
                    '9:30 AM': { class: 'Strong Start (Beginner)', teacher: 'Sara A', level: 'Beginner', type: 'Mixed' },
                    '10:30 AM': { class: 'Skulpt Vertical: Tower', teacher: 'Sara A', level: 'Advanced', type: 'Mixed' },
                    '11:30 AM': { class: 'Skulpt & Tone (Intermediate)', teacher: 'Tina', level: 'Intermediate', type: 'Mixed' },
                    '5:30 PM': { class: 'Skulpt & Tone (Intermediate)', teacher: 'Tina', level: 'Intermediate', type: 'Mixed' },
                    '6:30 PM': { class: 'Strong Start (Beginner)', teacher: 'Natalie', level: 'Beginner', type: 'Mixed' },
                    '7:30 PM': { class: 'Cardio Skulpt Reformer', teacher: 'Natalie', level: 'Advanced', type: 'Mixed' }
                },
                'Wednesday': {
                    '7:00 AM': { class: 'Strong Start (Beginner)', teacher: 'Natalie', level: 'Beginner', type: 'Mixed' },
                    '10:00 AM': { class: 'Strong Start (Beginner)', teacher: 'Nour', level: 'Beginner', type: 'Mixed' },
                    '11:00 AM': { class: 'Skulpt & Tone (Intermediate)', teacher: 'Nadeen S', level: 'Intermediate', type: 'Mixed' },
                    '12:00 PM': { class: 'SKULPT Core X Booty Reformer', teacher: 'Nadeen S', level: 'Advanced', type: 'Ladies Only' },
                    '5:30 PM': { class: 'Strong Start (Beginner)', teacher: 'Nadeen H', level: 'Beginner', type: 'Mixed' },
                    '6:30 PM': { class: 'SKULPT Core X Booty Reformer', teacher: 'Nadeen H', level: 'Advanced', type: 'Ladies Only' },
                    '7:30 PM': { class: 'Skulpt & Tone (Intermediate)', teacher: 'Nadeen H', level: 'Intermediate', type: 'Mixed' }
                },
                'Thursday': {
                    '9:30 AM': { class: 'Strong Start (Beginner)', teacher: 'Sara A', level: 'Beginner', type: 'Mixed' },
                    '10:30 AM': { class: 'Skulpt & Tone (Intermediate)', teacher: 'Sara A', level: 'Intermediate', type: 'Mixed' },
                    '11:30 AM': { class: 'Cardio Skulpt Reformer', teacher: 'Nadeen H', level: 'Advanced', type: 'Mixed' },
                    '12:30 PM': { class: 'Chair & Tower', teacher: 'Deena', level: 'Intermediate', type: 'Mixed' },
                    '5:30 PM': { class: 'Strong Start (Beginner)', teacher: 'Natalie', level: 'Beginner', type: 'Mixed' },
                    '6:30 PM': { class: 'SKULPT Core X Booty Reformer', teacher: 'Natalie', level: 'Advanced', type: 'Ladies Only' }
                },
                'Friday': {
                    '10:00 AM': { class: 'Strong Start (Beginner)', teacher: 'Deena', level: 'Beginner', type: 'Mixed' },
                    '10:30 AM': { class: 'Strong Start (Beginner)', teacher: 'Deena', level: 'Beginner', type: 'Mixed' },
                    '11:00 AM': { class: 'Cardio Skulpt Reformer', teacher: 'Natalie', level: 'Advanced', type: 'Mixed' },
                    '11:30 AM': { class: 'SKULPT Core X Booty Reformer', teacher: 'Deena', level: 'Advanced', type: 'Ladies Only' },
                    '12:00 PM': { class: 'Teen SKULPT Reformer', teacher: 'Natalie', level: 'Teens', type: 'Mixed' }
                },
                'Saturday': {}
            };
        }
    }

    saveScheduleData() {
        localStorage.setItem('movementSchedule', JSON.stringify(this.movementSchedule));
        localStorage.setItem('reformerSchedule', JSON.stringify(this.reformerSchedule));
    }

    setupEventListeners() {
        // Room tabs
        document.querySelectorAll('.tab-group .btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const rooms = ['movement', 'reformer', 'all'];
                this.switchRoom(rooms[index]);
            });
        });

        // View tabs
        document.querySelectorAll('.view-group .btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const views = ['schedule', 'stats', 'settings'];
                this.switchView(views[index]);
            });
        });

        // Export menu
        document.querySelector('.btn-export').addEventListener('click', () => this.toggleExportMenu());

        // Export options
        document.getElementById('exportPDF').addEventListener('click', () => this.exportToPDF());
        document.getElementById('exportWeekly').addEventListener('click', () => this.exportWeeklyStory());
        document.getElementById('exportDaily').addEventListener('click', () => this.exportDailyStory());
        document.getElementById('exportPrint').addEventListener('click', () => this.handlePrint());

        // Modal close
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('editModal');
            if (event.target === modal) {
                this.closeModal();
            }
        });

        // Modal buttons
        document.getElementById('cancelModal').addEventListener('click', () => this.closeModal());
        document.getElementById('saveClass').addEventListener('click', () => this.saveClass());
        document.getElementById('removeClass').addEventListener('click', () => this.removeClass());
        
        // Radio button for teacher deletion
        document.querySelectorAll('input[name="deleteOption"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const replacementGroup = document.getElementById('replacementTeacherGroup');
                replacementGroup.style.display = e.target.value === 'replace' ? 'block' : 'none';
            });
        });
    }

    updateTime() {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        document.getElementById('currentTime').textContent = dateString;
    }

    switchRoom(room) {
        this.currentRoom = room;
        document.querySelectorAll('.tab-group .btn').forEach(btn => btn.classList.remove('active'));
        const rooms = ['movement', 'reformer', 'all'];
        const index = rooms.indexOf(room);
        document.querySelectorAll('.tab-group .btn')[index].classList.add('active');
        this.renderSchedule();
        this.updateStats();
    }

    switchToAllRooms() {
        // Switch to schedule view and all rooms
        this.switchView('schedule');
        this.switchRoom('all');
    }

    switchView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-group .btn').forEach(btn => btn.classList.remove('active'));
        const views = ['schedule', 'stats', 'settings'];
        const index = views.indexOf(view);
        document.querySelectorAll('.view-group .btn')[index].classList.add('active');
        
        // Hide all views
        document.getElementById('scheduleView').style.display = 'none';
        document.getElementById('statsView').style.display = 'none';
        document.getElementById('settingsView').style.display = 'none';
        
        // Show selected view
        if (view === 'schedule') {
            document.getElementById('scheduleView').style.display = 'block';
        } else if (view === 'stats') {
            document.getElementById('statsView').style.display = 'block';
            this.updateStats();
        } else if (view === 'settings') {
            document.getElementById('settingsView').style.display = 'block';
            this.renderSettings();
        }
    }

    renderSchedule() {
        const table = document.getElementById('scheduleTable');
        table.innerHTML = '';
        
        if (this.currentRoom === 'all') {
            this.renderCombinedSchedule(table);
        } else {
            this.renderSingleRoomSchedule(table, this.currentRoom);
        }
    }

    isClassActive(classData) {
        if (!classData.startDate) return true; // No start date means always active
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of day
        
        const startDate = new Date(classData.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        return today >= startDate;
    }

    renderSingleRoomSchedule(table, room) {
        const schedule = room === 'movement' ? this.movementSchedule : this.reformerSchedule;
        
        // Create header row
        const headerRow = table.insertRow();
        const timeHeader = headerRow.insertCell();
        timeHeader.textContent = 'Time';
        timeHeader.className = 'time-cell';
        
        this.days.forEach(day => {
            const dayHeader = headerRow.insertCell();
            dayHeader.textContent = day;
        });
        
        // Create time slot rows
        this.timeSlots.forEach((time, index) => {
            const row = table.insertRow();
            const timeCell = row.insertCell();
            
            // Only show time for hour marks (XX:00)
            const isHourMark = time.includes(':00');
            if (isHourMark) {
                timeCell.textContent = time;
                timeCell.className = 'time-cell hour-mark';
            } else {
                timeCell.textContent = '';
                timeCell.className = 'time-cell quarter-hour';
            }
            
            this.days.forEach(day => {
                const cell = row.insertCell();
                cell.className = 'class-cell';
                cell.onclick = () => this.openModal(day, time, cell, room);
                
                // Check if this slot is part of a multi-slot class
                const multiSlotInfo = this.isMultiSlotOccupied(day, time, room);
                
                if (multiSlotInfo.occupied) {
                    cell.classList.add('filled', `multi-slot-${multiSlotInfo.position}`);
                    if (multiSlotInfo.position === 'start') {
                        const typeClass = multiSlotInfo.classData.type === 'Ladies Only' ? 'ladies' : '';
                        const duration = multiSlotInfo.classData.duration || 45;
                        const slots = Math.ceil(duration / 15);
                        const height = slots * 25; // 25px per slot
                        
                        cell.innerHTML = `
                            <div class="multi-slot-content" style="height: ${height}px; position: absolute; top: 0; left: 0; right: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, rgba(211, 183, 163, 0.2) 0%, rgba(211, 183, 163, 0.3) 100%); border: 1px solid rgba(211, 183, 163, 0.4); border-radius: 4px; padding: 4px; z-index: 10;">
                                <div class="class-name">${multiSlotInfo.classData.class}</div>
                                <div class="teacher-name">${multiSlotInfo.classData.teacher}</div>
                                <div class="class-info">
                                    <span class="class-level">${multiSlotInfo.classData.level || ''}</span>
                                    <span class="class-type ${typeClass}">${multiSlotInfo.classData.type || 'Mixed'}</span>
                                </div>
                            </div>
                        `;
                        cell.style.position = 'relative';
                    } else {
                        cell.innerHTML = '';
                        cell.style.background = 'transparent';
                        cell.style.border = 'none';
                        cell.onclick = null; // Disable clicking on occupied slots
                    }
                } else {
                    const classData = schedule[day] && schedule[day][time];
                    if (classData && this.isClassActive(classData)) {
                        cell.classList.add('filled');
                        
                        // Check if this is a multi-slot class starting here
                        const duration = classData.duration || 45;
                        if (duration > 15) {
                            cell.classList.add('multi-slot-start');
                            const slots = Math.ceil(duration / 15);
                            cell.classList.add(`slots-${slots}`);
                        }
                        
                        const typeClass = classData.type === 'Ladies Only' ? 'ladies' : '';
                        let dateInfo = '';
                        if (classData.startDate && !this.isClassActive(classData)) {
                            const startDate = new Date(classData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            dateInfo = `<span class="class-future">Starts ${startDate}</span>`;
                        }
                        cell.innerHTML = `
                            <div class="class-name">${classData.class}</div>
                            <div class="teacher-name">${classData.teacher}</div>
                            <div class="class-info">
                                <span class="class-level">${classData.level || ''}</span>
                                <span class="class-type ${typeClass}">${classData.type || 'Mixed'}</span>
                                ${dateInfo}
                            </div>
                        `;
                    } else if (classData && !this.isClassActive(classData)) {
                        cell.classList.add('future');
                        const startDate = new Date(classData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        cell.innerHTML = `
                            <div class="class-name future-class">${classData.class}</div>
                            <div class="class-future">Starts ${startDate}</div>
                        `;
                    } else {
                        cell.innerHTML = '<span class="empty-cell">+ Add class</span>';
                    }
                }
            });
        });
    }

    renderCombinedSchedule(table) {
        table.classList.add('combined-table');
        
        // Create header row
        const headerRow = table.insertRow();
        const timeHeader = headerRow.insertCell();
        timeHeader.textContent = 'Time';
        timeHeader.className = 'time-cell';
        
        // Create day headers with room subheaders
        this.days.forEach(day => {
            const dayHeader = headerRow.insertCell();
            dayHeader.textContent = day;
            dayHeader.colSpan = 2;
        });
        
        // Create room subheaders
        const roomHeaderRow = table.insertRow();
        roomHeaderRow.insertCell(); // Empty cell for time column
        
        this.days.forEach(() => {
            const movementHeader = roomHeaderRow.insertCell();
            movementHeader.textContent = 'Movement';
            movementHeader.className = 'room-header movement-header';
            
            const reformerHeader = roomHeaderRow.insertCell();
            reformerHeader.textContent = 'Reformer';
            reformerHeader.className = 'room-header reformer-header';
        });
        
        // Create time slot rows
        this.timeSlots.forEach((time, index) => {
            const row = table.insertRow();
            const timeCell = row.insertCell();
            
            // Only show time for hour marks (XX:00)
            const isHourMark = time.includes(':00');
            if (isHourMark) {
                timeCell.textContent = time;
                timeCell.className = 'time-cell hour-mark';
            } else {
                timeCell.textContent = '';
                timeCell.className = 'time-cell quarter-hour';
            }
            
            this.days.forEach(day => {
                // Movement room cell
                const movementCell = row.insertCell();
                movementCell.className = 'class-cell movement-room';
                movementCell.onclick = () => this.openModal(day, time, movementCell, 'movement');
                
                // Check if this slot is part of a multi-slot class
                const multiSlotInfo = this.isMultiSlotOccupied(day, time, 'movement');
                
                if (multiSlotInfo.occupied) {
                    movementCell.classList.add('filled', `multi-slot-${multiSlotInfo.position}`);
                    if (multiSlotInfo.position === 'start') {
                        const typeClass = multiSlotInfo.classData.type === 'Ladies Only' ? 'ladies' : '';
                        movementCell.innerHTML = `
                            <div class="class-name">${multiSlotInfo.classData.class}</div>
                            <div class="teacher-name">${multiSlotInfo.classData.teacher}</div>
                            <div class="class-info">
                                <span class="class-level">${multiSlotInfo.classData.level}</span>
                                <span class="class-type ${typeClass}">${multiSlotInfo.classData.type}</span>
                            </div>
                        `;
                    } else {
                        movementCell.innerHTML = '<span class="empty-cell">&nbsp;</span>';
                    }
                    movementCell.onclick = null; // Disable clicking on occupied slots
                } else {
                    const movementClass = this.movementSchedule[day] && this.movementSchedule[day][time];
                    if (movementClass && this.isClassActive(movementClass)) {
                        movementCell.classList.add('filled');
                        
                        // Check if this is a multi-slot class
                        const duration = movementClass.duration || 45;
                        if (duration > 15) {
                            movementCell.classList.add('multi-slot-start');
                            const slots = Math.ceil(duration / 15);
                            movementCell.classList.add(`slots-${slots}`);
                        }
                        
                        const typeClass = movementClass.type === 'Ladies Only' ? 'ladies' : '';
                        movementCell.innerHTML = `
                            <div class="class-name">${movementClass.class}</div>
                            <div class="teacher-name">${movementClass.teacher}</div>
                            <div class="class-info">
                                <span class="class-level">${movementClass.level}</span>
                                <span class="class-type ${typeClass}">${movementClass.type}</span>
                            </div>
                        `;
                    } else if (movementClass && !this.isClassActive(movementClass)) {
                        movementCell.classList.add('future');
                        const startDate = new Date(movementClass.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        movementCell.innerHTML = `
                            <div class="class-name future-class">${movementClass.class}</div>
                            <div class="class-future">Starts ${startDate}</div>
                        `;
                    } else {
                        movementCell.innerHTML = '<span class="empty-cell">+</span>';
                    }
                }
                
                // Reformer room cell
                const reformerCell = row.insertCell();
                reformerCell.className = 'class-cell reformer-room';
                reformerCell.onclick = () => this.openModal(day, time, reformerCell, 'reformer');
                
                // Check if this slot is part of a multi-slot class
                const reformerMultiSlotInfo = this.isMultiSlotOccupied(day, time, 'reformer');
                
                if (reformerMultiSlotInfo.occupied) {
                    reformerCell.classList.add('filled', `multi-slot-${reformerMultiSlotInfo.position}`);
                    if (reformerMultiSlotInfo.position === 'start') {
                        const typeClass = reformerMultiSlotInfo.classData.type === 'Ladies Only' ? 'ladies' : '';
                        reformerCell.innerHTML = `
                            <div class="class-name">${reformerMultiSlotInfo.classData.class}</div>
                            <div class="teacher-name">${reformerMultiSlotInfo.classData.teacher}</div>
                            <div class="class-info">
                                <span class="class-level">${reformerMultiSlotInfo.classData.level}</span>
                                <span class="class-type ${typeClass}">${reformerMultiSlotInfo.classData.type}</span>
                            </div>
                        `;
                    } else {
                        reformerCell.innerHTML = '<span class="empty-cell">&nbsp;</span>';
                    }
                    reformerCell.onclick = null; // Disable clicking on occupied slots
                } else {
                    const reformerClass = this.reformerSchedule[day] && this.reformerSchedule[day][time];
                    if (reformerClass && this.isClassActive(reformerClass)) {
                        reformerCell.classList.add('filled');
                        
                        // Check if this is a multi-slot class
                        const duration = reformerClass.duration || 45;
                        if (duration > 15) {
                            reformerCell.classList.add('multi-slot-start');
                            const slots = Math.ceil(duration / 15);
                            reformerCell.classList.add(`slots-${slots}`);
                        }
                        
                        const typeClass = reformerClass.type === 'Ladies Only' ? 'ladies' : '';
                        reformerCell.innerHTML = `
                            <div class="class-name">${reformerClass.class}</div>
                            <div class="teacher-name">${reformerClass.teacher}</div>
                            <div class="class-info">
                                <span class="class-level">${reformerClass.level}</span>
                                <span class="class-type ${typeClass}">${reformerClass.type}</span>
                            </div>
                        `;
                    } else if (reformerClass && !this.isClassActive(reformerClass)) {
                        reformerCell.classList.add('future');
                        const startDate = new Date(reformerClass.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        reformerCell.innerHTML = `
                            <div class="class-name future-class">${reformerClass.class}</div>
                            <div class="class-future">Starts ${startDate}</div>
                        `;
                    } else {
                        reformerCell.innerHTML = '<span class="empty-cell">+</span>';
                    }
                }
            });
        });
    }

    openModal(day, time, cell, roomOverride = null) {
        const room = roomOverride || this.currentRoom;
        this.currentCell = { day, time, cell, room };
        
        const modal = document.getElementById('editModal');
        const classGrid = document.getElementById('classGrid');
        const teacherSelect = document.getElementById('teacherSelect');
        const modalTitle = document.getElementById('modalTitle');
        const removeButton = document.getElementById('removeClass');
        
        // Check if there's an existing class
        const schedule = room === 'movement' ? this.movementSchedule : this.reformerSchedule;
        const existingClass = schedule[day] && schedule[day][time];
        
        // Update modal title and show/hide remove button
        if (existingClass) {
            modalTitle.textContent = 'Edit Class';
            removeButton.style.display = 'block';
        } else {
            modalTitle.textContent = 'Add Class';
            removeButton.style.display = 'none';
        }
        
        // Populate class grid
        const classes = room === 'movement' ? this.movementClasses : this.reformerClasses;
        const classesData = room === 'movement' ? this.movementClassesData : this.reformerClassesData;
        
        classGrid.innerHTML = '';
        classes.forEach(cls => {
            const option = document.createElement('div');
            option.className = 'class-option';
            option.textContent = cls;
            option.dataset.class = cls;
            option.onclick = () => this.selectClass(cls, classesData[cls]);
            classGrid.appendChild(option);
        });
        
        // Populate teacher dropdown
        const teachers = room === 'movement' ? this.movementTeachers : this.reformerTeachers;
        teacherSelect.innerHTML = '<option value="">-- Select Instructor --</option>';
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher;
            option.textContent = teacher;
            teacherSelect.appendChild(option);
        });
        
        // Reset selections
        this.selectedClass = '';
        this.selectedLevel = '';
        this.selectedType = 'Mixed';
        
        // Set current values if editing existing class
        if (existingClass) {
            this.selectedClass = existingClass.class;
            teacherSelect.value = existingClass.teacher;
            this.selectedLevel = existingClass.level || '';
            this.selectedType = existingClass.type || 'Mixed';
            
            // Update UI
            document.querySelectorAll('.class-option').forEach(opt => {
                if (opt.dataset.class === this.selectedClass) {
                    opt.classList.add('selected');
                }
            });
            
            document.querySelectorAll('.level-pill').forEach(pill => {
                pill.classList.toggle('active', pill.dataset.level === this.selectedLevel);
            });
            
            document.querySelectorAll('.toggle-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.type === this.selectedType);
            });
        } else {
            // Set defaults
            document.querySelectorAll('.level-pill').forEach(pill => pill.classList.remove('active'));
            document.querySelectorAll('.toggle-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.type === 'Mixed');
            });
        }
        
        // Add event listeners
        document.querySelectorAll('.level-pill').forEach(pill => {
            pill.onclick = () => this.selectLevel(pill.dataset.level);
        });
        
        document.querySelectorAll('.toggle-option').forEach(opt => {
            opt.onclick = () => this.selectType(opt.dataset.type);
        });
        
        // Duration selection
        document.querySelectorAll('.duration-pill').forEach(pill => {
            pill.onclick = () => this.selectDuration(parseInt(pill.dataset.duration));
        });
        
        // Set default duration to 45 minutes
        this.selectedDuration = existingClass?.duration || 45;
        document.querySelectorAll('.duration-pill').forEach(pill => {
            pill.classList.toggle('active', parseInt(pill.dataset.duration) === this.selectedDuration);
        });
        
        modal.style.display = 'flex';
    }

    selectClass(className, defaultLevel) {
        this.selectedClass = className;
        document.querySelectorAll('.class-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.class === className);
        });
        
        // Auto-select default level
        if (defaultLevel && !this.selectedLevel) {
            this.selectLevel(defaultLevel);
        }
    }

    selectLevel(level) {
        this.selectedLevel = level;
        document.querySelectorAll('.level-pill').forEach(pill => {
            pill.classList.toggle('active', pill.dataset.level === level);
        });
    }

    selectType(type) {
        this.selectedType = type;
        document.querySelectorAll('.toggle-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.type === type);
        });
    }

    selectDuration(duration) {
        this.selectedDuration = duration;
        document.querySelectorAll('.duration-pill').forEach(pill => {
            pill.classList.toggle('active', parseInt(pill.dataset.duration) === duration);
        });
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentCell = null;
    }

    saveClass() {
        const teacherValue = document.getElementById('teacherSelect').value;
        const schedule = this.currentCell.room === 'movement' ? this.movementSchedule : this.reformerSchedule;
        const startDate = document.getElementById('classStartDate').value;
        
        if (!schedule[this.currentCell.day]) {
            schedule[this.currentCell.day] = {};
        }
        
        if (this.selectedClass && teacherValue && this.selectedLevel) {
            const classData = {
                class: this.selectedClass,
                teacher: teacherValue,
                level: this.selectedLevel,
                type: this.selectedType,
                duration: this.selectedDuration || 45
            };
            
            // Add start date if specified
            if (startDate) {
                classData.startDate = startDate;
            }
            
            // Check if class duration would overlap with existing classes
            if (classData.duration > 15) {
                const overlappingSlots = this.getOverlappingSlots(
                    this.currentCell.day,
                    this.currentCell.time,
                    this.selectedDuration,
                    this.currentCell.room
                );
                
                // Check if any overlapping slots are already occupied
                for (const slot of overlappingSlots) {
                    if (schedule[this.currentCell.day] && schedule[this.currentCell.day][slot]) {
                        this.showNotification('Cannot add class - it would overlap with existing classes', 'error');
                        return;
                    }
                }
            }
            
            schedule[this.currentCell.day][this.currentCell.time] = classData;
            
            // Update the display
            this.renderSchedule();
            this.saveScheduleData();
            this.showNotification('Class added successfully!', 'success');
        } else {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }
        
        this.closeModal();
        this.updateStats();
    }

    removeClass() {
        if (!this.currentCell) return;
        
        const schedule = this.currentCell.room === 'movement' ? this.movementSchedule : this.reformerSchedule;
        
        if (schedule[this.currentCell.day] && schedule[this.currentCell.day][this.currentCell.time]) {
            delete schedule[this.currentCell.day][this.currentCell.time];
            
            // Clean up empty days
            if (Object.keys(schedule[this.currentCell.day]).length === 0) {
                delete schedule[this.currentCell.day];
            }
            
            this.renderSchedule();
            this.saveScheduleData();
            this.updateStats();
            this.showNotification('Class removed successfully!', 'success');
        }
        
        this.closeModal();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-text">${message}</span>
            <span class="notification-close" onclick="this.parentElement.remove()">✕</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    updateStats() {
        let totalClasses = 0;
        let teacherCounts = {};
        let classTypes = new Set();
        
        if (this.currentRoom === 'all') {
            // Combine stats from both rooms
            [this.movementSchedule, this.reformerSchedule].forEach(schedule => {
                Object.values(schedule).forEach(daySchedule => {
                    Object.values(daySchedule).forEach(classData => {
                        totalClasses++;
                        classTypes.add(classData.class);
                        teacherCounts[classData.teacher] = (teacherCounts[classData.teacher] || 0) + 1;
                    });
                });
            });
        } else {
            const schedule = this.currentRoom === 'movement' ? this.movementSchedule : this.reformerSchedule;
            Object.values(schedule).forEach(daySchedule => {
                Object.values(daySchedule).forEach(classData => {
                    totalClasses++;
                    classTypes.add(classData.class);
                    teacherCounts[classData.teacher] = (teacherCounts[classData.teacher] || 0) + 1;
                });
            });
        }
        
        // Update stat cards with animation
        this.animateValue('totalClasses', 0, totalClasses, 500);
        this.animateValue('activeTeachers', 0, Object.keys(teacherCounts).length, 500);
        this.animateValue('classTypes', 0, classTypes.size, 500);
        
        // Update teacher list
        const teacherList = document.getElementById('teacherList');
        teacherList.innerHTML = '';
        
        // Sort teachers by class count
        const sortedTeachers = Object.entries(teacherCounts)
            .sort((a, b) => b[1] - a[1]);
        
        sortedTeachers.forEach(([teacher, count], index) => {
            setTimeout(() => {
                const teacherItem = document.createElement('div');
                teacherItem.className = 'teacher-item slide-up';
                teacherItem.innerHTML = `
                    <span class="teacher-name-stat">${teacher}</span>
                    <span class="teacher-count">${count}</span>
                `;
                teacherList.appendChild(teacherItem);
            }, index * 50);
        });

        // Update charts
        this.updateCharts(teacherCounts, totalClasses);
    }

    updateCharts(teacherCounts, totalClasses) {
        // Only show charts for Ghazal view
        if (this.userType !== 'ghazal') return;

        // Brand colors
        const brandColors = [
            '#D3B7A3', // Main accent
            '#7D7A78', // Secondary
            '#E8E2D6', // Background
            '#4A4A4A', // Dark neutral
            '#C4A690', // Lighter accent
            '#968B87', // Mid tone
            '#F0EBE5', // Light background
            '#A89F9A'  // Another mid tone
        ];

        // 1. Teacher Load Distribution - Changed to Bar Chart
        const teacherCtx = document.getElementById('teacherLoadChart');
        if (teacherCtx) {
            const teacherChart = Chart.getChart('teacherLoadChart');
            if (teacherChart) teacherChart.destroy();
            
            // Sort teachers by class count for better visualization
            const sortedTeacherData = Object.entries(teacherCounts)
                .sort((a, b) => b[1] - a[1]);
            
            new Chart(teacherCtx, {
                type: 'bar',
                data: {
                    labels: sortedTeacherData.map(([name]) => name),
                    datasets: [{
                        label: 'Number of Classes',
                        data: sortedTeacherData.map(([, count]) => count),
                        backgroundColor: '#D3B7A3',
                        borderColor: '#D3B7A3',
                        borderWidth: 0,
                        borderRadius: 4,
                        barThickness: 'flex',
                        maxBarThickness: 50
                    }]
                },
                options: {
                    indexAxis: 'y', // Horizontal bars
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.raw + ' classes';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                                color: '#4A4A4A',
                                font: { size: 11 },
                                stepSize: 1
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#4A4A4A',
                                font: { size: 11 }
                            }
                        }
                    }
                }
            });
        }

        // 2. Room Schedule Split
        const roomCtx = document.getElementById('roomSplitChart');
        if (roomCtx) {
            const roomChart = Chart.getChart('roomSplitChart');
            if (roomChart) roomChart.destroy();

            let movementCount = 0;
            let reformerCount = 0;
            
            Object.values(this.movementSchedule).forEach(day => {
                movementCount += Object.keys(day).length;
            });
            
            Object.values(this.reformerSchedule).forEach(day => {
                reformerCount += Object.keys(day).length;
            });

            new Chart(roomCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Movement Room', 'Reformer Room'],
                    datasets: [{
                        data: [movementCount, reformerCount],
                        backgroundColor: ['#D3B7A3', '#7D7A78'],
                        borderColor: '#FFFFFF',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 11 },
                                color: '#4A4A4A',
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(0);
                                        return {
                                            text: label + ' (' + value + ' - ' + percentage + '%)',
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return context.label + ': ' + value + ' classes (' + percentage + '%)';
                                }
                            }
                        }
                    },
                    cutout: '60%'
                }
            });
        }

        // 3. Class Type Distribution
        const classTypeCtx = document.getElementById('classTypeChart');
        if (classTypeCtx) {
            const classTypeChart = Chart.getChart('classTypeChart');
            if (classTypeChart) classTypeChart.destroy();

            const classTypeCounts = {};
            [this.movementSchedule, this.reformerSchedule].forEach(schedule => {
                Object.values(schedule).forEach(day => {
                    Object.values(day).forEach(classData => {
                        classTypeCounts[classData.type] = (classTypeCounts[classData.type] || 0) + 1;
                    });
                });
            });

            new Chart(classTypeCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(classTypeCounts),
                    datasets: [{
                        data: Object.values(classTypeCounts),
                        backgroundColor: ['#D3B7A3', '#C4A690'],
                        borderColor: '#FFFFFF',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 11 },
                                color: '#4A4A4A',
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(0);
                                        return {
                                            text: label + ' (' + value + ' - ' + percentage + '%)',
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return context.label + ': ' + value + ' classes (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });
        }

        // 4. Daily Class Volume
        const dailyCtx = document.getElementById('dailyVolumeChart');
        if (dailyCtx) {
            const dailyChart = Chart.getChart('dailyVolumeChart');
            if (dailyChart) dailyChart.destroy();

            const dailyCounts = {};
            this.days.forEach(day => {
                let count = 0;
                if (this.movementSchedule[day]) {
                    count += Object.keys(this.movementSchedule[day]).length;
                }
                if (this.reformerSchedule[day]) {
                    count += Object.keys(this.reformerSchedule[day]).length;
                }
                dailyCounts[day] = count;
            });

            new Chart(dailyCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(dailyCounts),
                    datasets: [{
                        label: 'Classes per Day',
                        data: Object.values(dailyCounts),
                        backgroundColor: '#D3B7A3',
                        borderColor: '#D3B7A3',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                color: '#4A4A4A'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#4A4A4A'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + context.raw + ' classes';
                                }
                            }
                        }
                    }
                }
            });
        }

        // 5. Skill Level Breakdown
        const skillCtx = document.getElementById('skillLevelChart');
        if (skillCtx) {
            const skillChart = Chart.getChart('skillLevelChart');
            if (skillChart) skillChart.destroy();

            const skillCounts = {
                'Beginner': 0,
                'Intermediate': 0,
                'Advanced': 0,
                'Teens': 0
            };

            // Count skill levels based on current room filter
            if (this.currentRoom === 'all') {
                [this.movementSchedule, this.reformerSchedule].forEach(schedule => {
                    Object.values(schedule).forEach(day => {
                        Object.values(day).forEach(classData => {
                            const level = classData.level || 'Intermediate';
                            if (skillCounts.hasOwnProperty(level)) {
                                skillCounts[level]++;
                            }
                        });
                    });
                });
            } else {
                const schedule = this.currentRoom === 'movement' ? this.movementSchedule : this.reformerSchedule;
                Object.values(schedule).forEach(day => {
                    Object.values(day).forEach(classData => {
                        const level = classData.level || 'Intermediate';
                        if (skillCounts.hasOwnProperty(level)) {
                            skillCounts[level]++;
                        }
                    });
                });
            }

            // Filter out levels with 0 count
            const filteredLabels = [];
            const filteredData = [];
            Object.entries(skillCounts).forEach(([level, count]) => {
                if (count > 0) {
                    filteredLabels.push(level);
                    filteredData.push(count);
                }
            });

            new Chart(skillCtx, {
                type: 'pie',
                data: {
                    labels: filteredLabels,
                    datasets: [{
                        data: filteredData,
                        backgroundColor: ['#E8E2D6', '#D3B7A3', '#7D7A78', '#A89F9A'],
                        borderColor: '#FFFFFF',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 11 },
                                color: '#4A4A4A',
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(0);
                                        return {
                                            text: label + ' (' + value + ' - ' + percentage + '%)',
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return context.label + ': ' + value + ' classes (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        const range = end - start;
        const minTimer = 50;
        let stepTime = Math.abs(Math.floor(duration / range));
        stepTime = Math.max(stepTime, minTimer);
        const startTime = new Date().getTime();
        const endTime = startTime + duration;
        let timer;

        function run() {
            const now = new Date().getTime();
            const remaining = Math.max((endTime - now) / duration, 0);
            const value = Math.round(end - (remaining * range));
            obj.innerHTML = value;
            if (value == end) {
                clearInterval(timer);
            }
        }

        timer = setInterval(run, stepTime);
        run();
    }

    getOverlappingSlots(day, startTime, duration, room) {
        const overlappingSlots = [];
        const startIndex = this.timeSlots.indexOf(startTime);
        
        if (startIndex === -1) return overlappingSlots;
        
        const slotsNeeded = Math.ceil(duration / 15);
        
        // Get the slots that would be occupied (excluding the first one)
        for (let i = 1; i < slotsNeeded && startIndex + i < this.timeSlots.length; i++) {
            overlappingSlots.push(this.timeSlots[startIndex + i]);
        }
        
        return overlappingSlots;
    }

    getClassDuration(day, time, room) {
        const schedule = room === 'movement' ? this.movementSchedule : this.reformerSchedule;
        const classData = schedule[day] && schedule[day][time];
        return classData ? (classData.duration || 45) : 0;
    }

    isMultiSlotOccupied(day, time, room) {
        const schedule = room === 'movement' ? this.movementSchedule : this.reformerSchedule;
        const timeIndex = this.timeSlots.indexOf(time);
        
        // Check if this slot is occupied by a multi-slot class from a previous time
        for (let i = Math.max(0, timeIndex - 5); i < timeIndex; i++) {
            const prevTime = this.timeSlots[i];
            const prevClass = schedule[day] && schedule[day][prevTime];
            
            if (prevClass && (prevClass.duration || 45) > 15) {
                const slotsNeeded = Math.ceil((prevClass.duration || 45) / 15);
                const endIndex = i + slotsNeeded - 1;
                
                if (timeIndex <= endIndex) {
                    return {
                        occupied: true,
                        startTime: prevTime,
                        position: timeIndex === i ? 'start' : (timeIndex === endIndex ? 'end' : 'middle'),
                        classData: prevClass
                    };
                }
            }
        }
        
        return { occupied: false };
    }

    toggleExportMenu() {
        const menu = document.getElementById('exportMenu');
        menu.classList.toggle('active');
        
        // Close menu when clicking outside
        if (menu.classList.contains('active')) {
            setTimeout(() => {
                document.addEventListener('click', this.closeExportMenu);
            }, 100);
        }
    }

    closeExportMenu(e) {
        const menu = document.getElementById('exportMenu');
        const exportBtn = document.querySelector('.btn-export');
        
        if (!menu.contains(e.target) && !exportBtn.contains(e.target)) {
            menu.classList.remove('active');
            document.removeEventListener('click', this.closeExportMenu);
        }
    }

    showLoading(text = 'Generating...') {
        const loading = document.getElementById('loadingIndicator');
        document.getElementById('loadingText').textContent = text;
        loading.classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingIndicator').classList.remove('active');
    }

    exportToPDF() {
        document.getElementById('exportMenu').classList.remove('active');
        
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            alert('PDF export libraries are still loading. Please try again in a moment.');
            return;
        }

        const { jsPDF } = window.jspdf;
        
        this.showLoading('Generating PDF...');

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Function to generate schedule table for a room
            const addScheduleTable = (room, startY) => {
                const schedule = room === 'movement' ? this.movementSchedule : this.reformerSchedule;
                const cellWidth = 25;
                const cellHeight = 22;
                const startX = 10;
                
                // Add room title
                pdf.setFontSize(16);
                pdf.text(`${room === 'movement' ? 'Movement Room' : 'Reformer Room'} Schedule`, pageWidth / 2, startY, { align: 'center' });
                
                let currentY = startY + 10;
                
                // Table header
                pdf.setFontSize(8);
                pdf.setFillColor(232, 226, 214);
                pdf.rect(startX, currentY, cellWidth, 8, 'F');
                pdf.text('Time', startX + 2, currentY + 5);
                
                this.days.forEach((day, index) => {
                    pdf.rect(startX + cellWidth * (index + 1), currentY, cellWidth, 8, 'F');
                    pdf.text(day.substring(0, 3), startX + cellWidth * (index + 1) + 2, currentY + 5);
                });
                
                currentY += 8;
                
                // Table content
                this.timeSlots.forEach(time => {
                    // Time column
                    pdf.setFillColor(245, 245, 245);
                    pdf.rect(startX, currentY, cellWidth, cellHeight, 'F');
                    pdf.setFontSize(7);
                    pdf.text(time, startX + 2, currentY + 5);
                    
                    // Day columns
                    this.days.forEach((day, index) => {
                        const classData = schedule[day] && schedule[day][time];
                        const cellX = startX + cellWidth * (index + 1);
                        
                        // Cell border
                        pdf.setDrawColor(200, 200, 200);
                        pdf.rect(cellX, currentY, cellWidth, cellHeight);
                        
                        if (classData) {
                            // Class name
                            pdf.setFontSize(6);
                            pdf.setFont(undefined, 'bold');
                            const className = classData.class.length > 20 ? 
                                classData.class.substring(0, 18) + '...' : classData.class;
                            pdf.text(className, cellX + 1, currentY + 5);
                            
                            // Teacher
                            pdf.setFont(undefined, 'normal');
                            pdf.text(classData.teacher, cellX + 1, currentY + 10);
                            
                            // Level
                            pdf.setTextColor(211, 183, 163);
                            pdf.text(classData.level, cellX + 1, currentY + 15);
                            
                            // Type
                            pdf.setTextColor(classData.type === 'Ladies Only' ? 211 : 74, 
                                            classData.type === 'Ladies Only' ? 183 : 74, 
                                            classData.type === 'Ladies Only' ? 163 : 74);
                            pdf.setFontSize(5);
                            pdf.text(classData.type, cellX + 1, currentY + 19);
                            pdf.setTextColor(0, 0, 0);
                        }
                    });
                    
                    currentY += cellHeight;
                    
                    // Check if we need a new page
                    if (currentY > pageHeight - 30) {
                        pdf.addPage();
                        currentY = 20;
                    }
                });
                
                return currentY + 10;
            };

            // Function to add statistics
            const addStatistics = (room, startY) => {
                const schedule = room === 'movement' ? this.movementSchedule : this.reformerSchedule;
                let totalClasses = 0;
                let teacherCounts = {};
                let classTypes = new Set();
                
                Object.values(schedule).forEach(daySchedule => {
                    Object.values(daySchedule).forEach(classData => {
                        totalClasses++;
                        classTypes.add(classData.class);
                        teacherCounts[classData.teacher] = (teacherCounts[classData.teacher] || 0) + 1;
                    });
                });
                
                // Title
                pdf.setFontSize(16);
                pdf.text(`${room === 'movement' ? 'Movement Room' : 'Reformer Room'} Statistics`, pageWidth / 2, startY, { align: 'center' });
                
                let currentY = startY + 15;
                
                // Stats boxes
                const boxWidth = 50;
                const boxHeight = 25;
                const spacing = 10;
                const totalWidth = (boxWidth * 3) + (spacing * 2);
                const startX = (pageWidth - totalWidth) / 2;
                
                // Weekly Classes
                pdf.setFillColor(245, 245, 245);
                pdf.rect(startX, currentY, boxWidth, boxHeight, 'F');
                pdf.setFontSize(10);
                pdf.text('WEEKLY CLASSES', startX + boxWidth/2, currentY + 8, { align: 'center' });
                pdf.setFontSize(20);
                pdf.setTextColor(211, 183, 163);
                pdf.text(totalClasses.toString(), startX + boxWidth/2, currentY + 18, { align: 'center' });
                pdf.setTextColor(0, 0, 0);
                
                // Active Teachers
                pdf.setFillColor(245, 245, 245);
                pdf.rect(startX + boxWidth + spacing, currentY, boxWidth, boxHeight, 'F');
                pdf.setFontSize(10);
                pdf.text('ACTIVE TEACHERS', startX + boxWidth + spacing + boxWidth/2, currentY + 8, { align: 'center' });
                pdf.setFontSize(20);
                pdf.setTextColor(211, 183, 163);
                pdf.text(Object.keys(teacherCounts).length.toString(), startX + boxWidth + spacing + boxWidth/2, currentY + 18, { align: 'center' });
                pdf.setTextColor(0, 0, 0);
                
                // Class Varieties
                pdf.setFillColor(245, 245, 245);
                pdf.rect(startX + (boxWidth + spacing) * 2, currentY, boxWidth, boxHeight, 'F');
                pdf.setFontSize(10);
                pdf.text('CLASS VARIETIES', startX + (boxWidth + spacing) * 2 + boxWidth/2, currentY + 8, { align: 'center' });
                pdf.setFontSize(20);
                pdf.setTextColor(211, 183, 163);
                pdf.text(classTypes.size.toString(), startX + (boxWidth + spacing) * 2 + boxWidth/2, currentY + 18, { align: 'center' });
                pdf.setTextColor(0, 0, 0);
                
                currentY += boxHeight + 15;
                
                // Teacher list
                pdf.setFontSize(12);
                pdf.text('Teacher Schedule', 20, currentY);
                currentY += 8;
                
                const sortedTeachers = Object.entries(teacherCounts).sort((a, b) => b[1] - a[1]);
                const colWidth = 60;
                let colIndex = 0;
                
                sortedTeachers.forEach(([teacher, count]) => {
                    const x = 20 + (colIndex % 3) * colWidth;
                    const y = currentY + Math.floor(colIndex / 3) * 8;
                    
                    pdf.setFontSize(10);
                    pdf.text(`${teacher}: ${count} classes`, x, y);
                    
                    colIndex++;
                });
                
                return currentY + Math.ceil(sortedTeachers.length / 3) * 8 + 10;
            };

            // Page 1: Header
            pdf.setFontSize(24);
            pdf.text('SKULPT STUDIO', pageWidth / 2, 30, { align: 'center' });
            pdf.setFontSize(14);
            pdf.text('Class Schedule & Statistics', pageWidth / 2, 40, { align: 'center' });
            pdf.setFontSize(12);
            pdf.text('Move Deeply. Breathe Deeply. Align Fully.', pageWidth / 2, 50, { align: 'center' });
            
            // Add Movement Room Schedule
            let nextY = addScheduleTable('movement', 70);
            
            // Page 2: Reformer Room Schedule
            pdf.addPage();
            addScheduleTable('reformer', 30);
            
            // Page 3: Movement Room Stats
            pdf.addPage();
            addStatistics('movement', 30);
            
            // Page 4: Reformer Room Stats
            pdf.addPage();
            addStatistics('reformer', 30);
            
            // Save PDF
            pdf.save('skulpt-studio-schedule.pdf');
            
            this.hideLoading();
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.hideLoading();
            
            // Offer print alternative
            if (confirm('There was an error generating the PDF. Would you like to use the print function instead? You can save as PDF from the print dialog.')) {
                this.handlePrint();
            }
        }
    }

    createStoryCanvas() {
        let canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        return canvas;
    }

    downloadCanvas(canvas, filename) {
        canvas.toBlob(function(blob) {
            const link = document.createElement('a');
            link.download = filename;
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }, 'image/png');
    }

    exportWeeklyStory() {
        document.getElementById('exportMenu').classList.remove('active');
        this.showLoading('Creating weekly story...');
        
        const canvas = this.createStoryCanvas();
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#E8E2D6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Header
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, 300);
        
        // Logo
        ctx.fillStyle = '#4A4A4A';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SKULPT STUDIO', canvas.width / 2, 120);
        
        // Subtitle
        ctx.font = '30px Arial';
        ctx.fillText('Weekly Schedule', canvas.width / 2, 180);
        
        // Tagline
        ctx.font = '24px Arial';
        ctx.fillStyle = '#7D7A78';
        ctx.fillText('Move Deeply • Breathe Deeply • Align Fully', canvas.width / 2, 240);
        
        // Week overview
        let yPos = 380;
        
        this.days.forEach((day) => {
            // Day header
            ctx.fillStyle = '#D3B7A3';
            ctx.fillRect(50, yPos, canvas.width - 100, 40);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(day, 70, yPos + 28);
            
            // Count classes for the day
            let classCount = 0;
            if (this.movementSchedule[day]) classCount += Object.keys(this.movementSchedule[day]).length;
            if (this.reformerSchedule[day]) classCount += Object.keys(this.reformerSchedule[day]).length;
            
            ctx.textAlign = 'right';
            ctx.fillText(`${classCount} Classes`, canvas.width - 70, yPos + 28);
            
            yPos += 50;
            
            // Classes preview
            ctx.font = '18px Arial';
            ctx.fillStyle = '#4A4A4A';
            ctx.textAlign = 'left';
            
            let classText = [];
            if (this.movementSchedule[day]) {
                Object.values(this.movementSchedule[day]).forEach(cls => {
                    classText.push(cls.class);
                });
            }
            if (this.reformerSchedule[day]) {
                Object.values(this.reformerSchedule[day]).forEach(cls => {
                    classText.push(cls.class);
                });
            }
            
            const previewText = classText.slice(0, 3).join(' • ');
            if (classText.length > 3) {
                ctx.fillText(previewText + '...', 70, yPos + 25);
            } else if (classText.length > 0) {
                ctx.fillText(previewText, 70, yPos + 25);
            } else {
                ctx.fillStyle = '#7D7A78';
                ctx.fillText('No classes scheduled', 70, yPos + 25);
            }
            
            yPos += 90;
        });
        
        // Footer
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(0, canvas.height - 150, canvas.width, 150);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Book your spot today!', canvas.width / 2, canvas.height - 90);
        ctx.fillText('@skulptstudio', canvas.width / 2, canvas.height - 50);
        
        // Download
        setTimeout(() => {
            this.downloadCanvas(canvas, 'skulpt-weekly-story.png');
            this.hideLoading();
        }, 100);
    }

    exportDailyStory() {
        document.getElementById('exportMenu').classList.remove('active');
        this.showLoading('Creating daily stories...');
        
        let dayIndex = 0;
        
        const generateNextDay = () => {
            if (dayIndex >= this.days.length) {
                this.hideLoading();
                return;
            }
            
            const day = this.days[dayIndex];
            this.createDailyStory(day, () => {
                dayIndex++;
                setTimeout(generateNextDay, 500);
            });
        };
        
        generateNextDay();
    }

    createDailyStory(day, callback) {
        const canvas = this.createStoryCanvas();
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#E8E2D6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Header
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, 350);
        
        // Logo
        ctx.fillStyle = '#4A4A4A';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SKULPT STUDIO', canvas.width / 2, 120);
        
        // Day
        ctx.fillStyle = '#D3B7A3';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(day.toUpperCase(), canvas.width / 2, 200);
        
        // Date (example)
        ctx.font = '24px Arial';
        ctx.fillStyle = '#7D7A78';
        ctx.fillText('Schedule', canvas.width / 2, 250);
        
        // Tagline
        ctx.font = '20px Arial';
        ctx.fillText('Move Deeply • Breathe Deeply • Align Fully', canvas.width / 2, 300);
        
        // Classes
        let yPos = 450;
        const classHeight = 100;
        
        // Combine both room schedules
        const allClasses = [];
        
        this.timeSlots.forEach(time => {
            if (this.movementSchedule[day] && this.movementSchedule[day][time]) {
                allClasses.push({
                    time,
                    ...this.movementSchedule[day][time],
                    room: 'Movement'
                });
            }
            if (this.reformerSchedule[day] && this.reformerSchedule[day][time]) {
                allClasses.push({
                    time,
                    ...this.reformerSchedule[day][time],
                    room: 'Reformer'
                });
            }
        });
        
        if (allClasses.length === 0) {
            ctx.fillStyle = '#7D7A78';
            ctx.font = '36px Arial';
            ctx.fillText('Rest Day', canvas.width / 2, canvas.height / 2);
            ctx.font = '24px Arial';
            ctx.fillText('See you tomorrow!', canvas.width / 2, canvas.height / 2 + 50);
        } else {
            allClasses.forEach((classData) => {
                if (yPos + classHeight > canvas.height - 200) return; // Don't overflow
                
                // Class card
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(50, yPos, canvas.width - 100, classHeight - 10);
                
                // Time
                ctx.fillStyle = '#D3B7A3';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(classData.time, 80, yPos + 35);
                
                // Room
                ctx.font = '18px Arial';
                ctx.fillStyle = '#7D7A78';
                ctx.fillText(classData.room, 80, yPos + 60);
                
                // Class name
                ctx.fillStyle = '#4A4A4A';
                ctx.font = 'bold 28px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(classData.class, canvas.width / 2, yPos + 40);
                
                // Teacher & Level
                ctx.font = '20px Arial';
                ctx.fillStyle = '#7D7A78';
                ctx.fillText(`${classData.teacher} • ${classData.level}`, canvas.width / 2, yPos + 70);
                
                // Type badge
                if (classData.type === 'Ladies Only') {
                    ctx.fillStyle = '#D3B7A3';
                    ctx.fillRect(canvas.width - 200, yPos + 20, 120, 30);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Ladies Only', canvas.width - 140, yPos + 40);
                }
                
                yPos += classHeight;
            });
        }
        
        // Footer
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(0, canvas.height - 150, canvas.width, 150);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Book your spot today!', canvas.width / 2, canvas.height - 90);
        ctx.fillText('@skulptstudio', canvas.width / 2, canvas.height - 50);
        
        // Download
        setTimeout(() => {
            this.downloadCanvas(canvas, `skulpt-${day.toLowerCase()}-story.png`);
            if (callback) callback();
        }, 100);
    }

    handlePrint() {
        document.getElementById('exportMenu').classList.remove('active');
        
        const originalView = this.currentView;
        const originalRoom = this.currentRoom;
        
        // Show all views for printing
        document.getElementById('scheduleView').style.display = 'block';
        document.getElementById('statsView').style.display = 'block';
        
        // First show movement room
        this.currentRoom = 'movement';
        this.renderSchedule();
        this.updateStats();
        
        setTimeout(() => {
            window.print();
            
            // Restore original state
            this.currentRoom = originalRoom;
            if (originalView === 'schedule') {
                document.getElementById('statsView').style.display = 'none';
            } else {
                document.getElementById('scheduleView').style.display = 'none';
            }
            this.renderSchedule();
        }, 500);
    }

    // Settings Methods
    renderSettings() {
        // Initialize with all rooms visible
        this.currentSettingsRoom = 'all';
        this.updateSettingsDisplay();
        
        // Set schedule date
        const scheduleDate = localStorage.getItem('scheduleStartDate');
        if (scheduleDate) {
            document.getElementById('scheduleStartDate').value = scheduleDate;
        }
    }
    
    switchSettingsRoom(room) {
        this.currentSettingsRoom = room;
        
        // Update tab buttons
        document.querySelectorAll('.settings-room-tabs .btn').forEach((btn, index) => {
            const rooms = ['movement', 'reformer', 'all'];
            btn.classList.toggle('active', rooms[index] === room);
        });
        
        this.updateSettingsDisplay();
    }
    
    updateSettingsDisplay() {
        const room = this.currentSettingsRoom || 'all';
        
        // Show/hide sections based on room
        const movementSections = document.querySelectorAll('.setting-item:has(#movementTeachersList), .setting-item:has(#movementClassesList)');
        const reformerSections = document.querySelectorAll('.setting-item:has(#reformerTeachersList), .setting-item:has(#reformerClassesList)');
        
        if (room === 'movement') {
            movementSections.forEach(el => el.style.display = 'block');
            reformerSections.forEach(el => el.style.display = 'none');
            this.renderTeachersList('movement');
            this.renderClassesList('movement');
        } else if (room === 'reformer') {
            movementSections.forEach(el => el.style.display = 'none');
            reformerSections.forEach(el => el.style.display = 'block');
            this.renderTeachersList('reformer');
            this.renderClassesList('reformer');
        } else {
            // Show all
            movementSections.forEach(el => el.style.display = 'block');
            reformerSections.forEach(el => el.style.display = 'block');
            this.renderTeachersList('movement');
            this.renderTeachersList('reformer');
            this.renderClassesList('movement');
            this.renderClassesList('reformer');
        }
    }

    renderTeachersList(room) {
        const teachers = room === 'movement' ? this.movementTeachers : this.reformerTeachers;
        const listElement = document.getElementById(`${room}TeachersList`);
        listElement.innerHTML = '';
        
        teachers.forEach(teacher => {
            const classCount = this.getTeacherClassCount(teacher, room);
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div>
                    <span class="list-item-name">${teacher}</span>
                    <span class="list-item-info">${classCount} classes</span>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-small btn-primary" onclick="window.skulptApp.editTeacher('${teacher}', '${room}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="window.skulptApp.deleteTeacher('${teacher}', '${room}')">Delete</button>
                </div>
            `;
            listElement.appendChild(item);
        });
    }

    renderClassesList(room) {
        const classes = room === 'movement' ? this.movementClassesData : this.reformerClassesData;
        const listElement = document.getElementById(`${room}ClassesList`);
        listElement.innerHTML = '';
        
        Object.entries(classes).forEach(([className, defaultLevel]) => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div>
                    <span class="list-item-name">${className}</span>
                    <span class="list-item-info">Default: ${defaultLevel}</span>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-small btn-primary" onclick="window.skulptApp.editClass('${className}', '${room}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="window.skulptApp.deleteClass('${className}', '${room}')">Delete</button>
                </div>
            `;
            listElement.appendChild(item);
        });
    }

    getTeacherClassCount(teacher, room) {
        let count = 0;
        const schedule = room === 'movement' ? this.movementSchedule : 
                         room === 'reformer' ? this.reformerSchedule :
                         null;
        
        if (!schedule) {
            // Count in both rooms
            Object.values(this.movementSchedule).forEach(daySchedule => {
                Object.values(daySchedule).forEach(classData => {
                    if (classData.teacher === teacher) count++;
                });
            });
            Object.values(this.reformerSchedule).forEach(daySchedule => {
                Object.values(daySchedule).forEach(classData => {
                    if (classData.teacher === teacher) count++;
                });
            });
        } else {
            Object.values(schedule).forEach(daySchedule => {
                Object.values(daySchedule).forEach(classData => {
                    if (classData.teacher === teacher) count++;
                });
            });
        }
        
        return count;
    }

    addTeacher(room) {
        const name = prompt('Enter teacher name:');
        if (!name || name.trim() === '') return;
        
        const teachers = room === 'movement' ? this.movementTeachers : this.reformerTeachers;
        
        if (teachers.includes(name.trim())) {
            this.showNotification('Teacher already exists', 'error');
            return;
        }
        
        teachers.push(name.trim());
        teachers.sort();
        
        this.saveTeachersAndClasses();
        this.renderTeachersList(room);
        this.showNotification(`Teacher ${name} added successfully`, 'success');
    }

    editTeacher(oldName, room) {
        const newName = prompt('Edit teacher name:', oldName);
        if (!newName || newName.trim() === '' || newName.trim() === oldName) return;
        
        const teachers = room === 'movement' ? this.movementTeachers : this.reformerTeachers;
        
        // Check if new name already exists
        if (teachers.includes(newName.trim())) {
            this.showNotification('Teacher name already exists', 'error');
            return;
        }
        
        // Update teacher array
        const index = teachers.indexOf(oldName);
        if (index !== -1) {
            teachers[index] = newName.trim();
            teachers.sort();
        }
        
        // Update all schedule entries
        const schedule = room === 'movement' ? this.movementSchedule : this.reformerSchedule;
        Object.keys(schedule).forEach(day => {
            Object.keys(schedule[day]).forEach(time => {
                if (schedule[day][time].teacher === oldName) {
                    schedule[day][time].teacher = newName.trim();
                }
            });
        });
        
        this.saveTeachersAndClasses();
        this.saveScheduleData();
        this.renderTeachersList(room);
        this.renderSchedule();
        this.updateStats();
        this.showNotification(`Teacher name updated successfully`, 'success');
    }

    deleteTeacher(teacher, room) {
        this.teacherToDelete = { teacher, room };
        const classCount = this.getTeacherClassCount(teacher, room);
        
        document.getElementById('deleteTeacherMessage').innerHTML = 
            `<strong>${teacher}</strong> currently teaches <strong>${classCount}</strong> classes in the ${room} room.`;
        
        // Populate replacement teachers
        const teachers = room === 'movement' ? this.movementTeachers : this.reformerTeachers;
        const replacementSelect = document.getElementById('replacementTeacher');
        replacementSelect.innerHTML = '<option value="">-- Select Teacher --</option>';
        
        teachers.filter(t => t !== teacher).forEach(t => {
            const option = document.createElement('option');
            option.value = t;
            option.textContent = t;
            replacementSelect.appendChild(option);
        });
        
        document.getElementById('teacherDeleteModal').style.display = 'flex';
    }

    closeTeacherDeleteModal() {
        document.getElementById('teacherDeleteModal').style.display = 'none';
        this.teacherToDelete = null;
    }

    confirmDeleteTeacher() {
        if (!this.teacherToDelete) return;
        
        const { teacher, room } = this.teacherToDelete;
        const deleteOption = document.querySelector('input[name="deleteOption"]:checked').value;
        const replacementTeacher = document.getElementById('replacementTeacher').value;
        
        if (deleteOption === 'replace' && !replacementTeacher) {
            this.showNotification('Please select a replacement teacher', 'error');
            return;
        }
        
        // Remove teacher from list
        const teachers = room === 'movement' ? this.movementTeachers : this.reformerTeachers;
        const index = teachers.indexOf(teacher);
        if (index > -1) {
            teachers.splice(index, 1);
        }
        
        // Handle classes
        const schedule = room === 'movement' ? this.movementSchedule : this.reformerSchedule;
        
        Object.keys(schedule).forEach(day => {
            Object.keys(schedule[day]).forEach(time => {
                if (schedule[day][time].teacher === teacher) {
                    if (deleteOption === 'replace') {
                        schedule[day][time].teacher = replacementTeacher;
                    } else {
                        delete schedule[day][time];
                    }
                }
            });
            
            // Clean up empty days
            if (Object.keys(schedule[day]).length === 0) {
                delete schedule[day];
            }
        });
        
        // Save changes
        this.saveTeachersAndClasses();
        this.saveScheduleData();
        
        // Update UI
        this.closeTeacherDeleteModal();
        this.renderSettings();
        this.renderSchedule();
        this.updateStats();
        
        this.showNotification(`Teacher ${teacher} deleted successfully`, 'success');
    }

    addClass(room) {
        const name = prompt('Enter class name:');
        if (!name || name.trim() === '') return;
        
        const defaultLevel = prompt('Enter default level (Beginner, Intermediate, Advanced, Teens):') || 'Intermediate';
        
        const classes = room === 'movement' ? this.movementClassesData : this.reformerClassesData;
        
        if (classes.hasOwnProperty(name.trim())) {
            this.showNotification('Class type already exists', 'error');
            return;
        }
        
        classes[name.trim()] = defaultLevel;
        
        // Update class arrays
        if (room === 'movement') {
            this.movementClasses = Object.keys(this.movementClassesData);
        } else {
            this.reformerClasses = Object.keys(this.reformerClassesData);
        }
        
        this.saveTeachersAndClasses();
        this.renderClassesList(room);
        this.showNotification(`Class type ${name} added successfully`, 'success');
    }

    editClass(oldName, room) {
        const newName = prompt('Edit class name:', oldName);
        if (!newName || newName.trim() === '' || newName.trim() === oldName) return;
        
        const classes = room === 'movement' ? this.movementClassesData : this.reformerClassesData;
        
        // Check if new name already exists
        if (classes.hasOwnProperty(newName.trim())) {
            this.showNotification('Class name already exists', 'error');
            return;
        }
        
        // Save the default level
        const defaultLevel = classes[oldName];
        
        // Update classes object
        delete classes[oldName];
        classes[newName.trim()] = defaultLevel;
        
        // Update class arrays
        if (room === 'movement') {
            this.movementClasses = Object.keys(this.movementClassesData);
        } else {
            this.reformerClasses = Object.keys(this.reformerClassesData);
        }
        
        // Update all schedule entries
        const schedule = room === 'movement' ? this.movementSchedule : this.reformerSchedule;
        Object.keys(schedule).forEach(day => {
            Object.keys(schedule[day]).forEach(time => {
                if (schedule[day][time].class === oldName) {
                    schedule[day][time].class = newName.trim();
                }
            });
        });
        
        this.saveTeachersAndClasses();
        this.saveScheduleData();
        this.renderClassesList(room);
        this.renderSchedule();
        this.updateStats();
        this.showNotification(`Class name updated successfully`, 'success');
    }

    deleteClass(className, room) {
        // Check if class is in use
        const schedule = room === 'movement' ? this.movementSchedule : this.reformerSchedule;
        let inUse = false;
        
        Object.values(schedule).forEach(daySchedule => {
            Object.values(daySchedule).forEach(classData => {
                if (classData.class === className) {
                    inUse = true;
                }
            });
        });
        
        if (inUse) {
            if (!confirm(`${className} is currently scheduled. Deleting it will remove all instances from the schedule. Continue?`)) {
                return;
            }
            
            // Remove all instances
            Object.keys(schedule).forEach(day => {
                Object.keys(schedule[day]).forEach(time => {
                    if (schedule[day][time].class === className) {
                        delete schedule[day][time];
                    }
                });
                
                // Clean up empty days
                if (Object.keys(schedule[day]).length === 0) {
                    delete schedule[day];
                }
            });
            
            this.saveScheduleData();
        }
        
        // Remove class type
        const classes = room === 'movement' ? this.movementClassesData : this.reformerClassesData;
        delete classes[className];
        
        // Update class arrays
        if (room === 'movement') {
            this.movementClasses = Object.keys(this.movementClassesData);
        } else {
            this.reformerClasses = Object.keys(this.reformerClassesData);
        }
        
        this.saveTeachersAndClasses();
        this.renderClassesList(room);
        this.renderSchedule();
        this.updateStats();
        
        this.showNotification(`Class type ${className} deleted successfully`, 'success');
    }

    saveScheduleSettings() {
        const startDate = document.getElementById('scheduleStartDate').value;
        if (startDate) {
            localStorage.setItem('scheduleStartDate', startDate);
            this.scheduleStartDate = new Date(startDate);
        }
        
        this.showNotification('Settings saved successfully', 'success');
    }
    
    migrateScheduleDurations(schedule) {
        let migrated = false;
        Object.keys(schedule).forEach(day => {
            Object.keys(schedule[day]).forEach(time => {
                if (!schedule[day][time].duration) {
                    schedule[day][time].duration = 45;
                    migrated = true;
                }
            });
        });
        if (migrated) {
            // Save the migrated data
            this.saveScheduleData();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.skulptApp = new SkulptApp();
});