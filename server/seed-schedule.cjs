const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

function getNextDayOfWeek(date, dayOfWeek) {
    const resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (dayOfWeek + 7 - date.getDay()) % 7);
    return resultDate;
}

// 0 = Sun, 1 = Mon, ...
const schedule = [
    { day: 1, title: 'Math 101', type: 'class', time: '10:00', duration: 60, color: '#4f46e5' },
    { day: 1, title: 'Science Lab', type: 'lab', time: '13:00', duration: 90, color: '#16a34a' },
    { day: 2, title: 'History', type: 'class', time: '09:00', duration: 45, color: '#ca8a04' },
    { day: 2, title: 'Math 101', type: 'class', time: '11:00', duration: 60, color: '#4f46e5' },
    { day: 3, title: 'Physics', type: 'class', time: '10:00', duration: 60, color: '#9333ea' },
    { day: 3, title: 'Staff Meeting', type: 'meeting', time: '15:00', duration: 60, color: '#dc2626' },
    { day: 4, title: 'Math 101', type: 'class', time: '10:00', duration: 60, color: '#4f46e5' },
    { day: 4, title: 'Chemistry', type: 'class', time: '13:00', duration: 60, color: '#0891b2' },
    { day: 5, title: 'Math 101', type: 'class', time: '10:00', duration: 60, color: '#4f46e5' },
    { day: 5, title: 'Weekly Review', type: 'other', time: '14:00', duration: 45, color: '#ea580c' },
];

db.serialize(() => {
    // Clear existing events
    db.run("DELETE FROM events");

    const stmt = db.prepare(`INSERT INTO events (id, title, start, end, category, color) VALUES (?, ?, ?, ?, ?, ?)`);

    const today = new Date();
    // Start from this week (Monday)
    const currentDay = today.getDay(); // 0-6
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // If Sun (0), go back 6 days. If Mon (1), 0.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    // Generate for this week and next week
    for (let week = 0; week < 2; week++) {
        const weekStart = new Date(startOfWeek);
        weekStart.setDate(weekStart.getDate() + (week * 7));

        schedule.forEach(item => {
            const eventDate = new Date(weekStart);
            eventDate.setDate(eventDate.getDate() + (item.day - 1)); // schedule uses 1=Mon, so offset 0 for Mon

            const [hours, minutes] = item.time.split(':').map(Number);
            eventDate.setHours(hours, minutes, 0, 0);

            const endDate = new Date(eventDate);
            endDate.setMinutes(endDate.getMinutes() + item.duration);

            const id = crypto.randomUUID();

            stmt.run(
                id,
                item.title,
                eventDate.toISOString(),
                endDate.toISOString(),
                item.type, // Maps to category
                item.color
            );
        });
    }

    stmt.finalize();
    console.log("Schedule seeded for 2 weeks.");
});
