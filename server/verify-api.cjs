const fetch = require('node-fetch');

async function verify() {
    const baseUrl = 'http://localhost:3000/api';

    try {
        // 1. Check Events
        console.log("Checking Events...");
        const eventsRes = await fetch(`${baseUrl}/events`);
        const events = await eventsRes.json();
        const eventsList = events.data || events;
        console.log(`Events count: ${Array.isArray(eventsList) ? eventsList.length : 'Not array'}`);
        if (Array.isArray(eventsList) && eventsList.length > 0) {
            console.log("First event:", eventsList[0].title, eventsList[0].start);
        }

        // 2. Check Dashboard Stats
        console.log("\nChecking Dashboard Stats...");
        const statsRes = await fetch(`${baseUrl}/dashboard/stats`);
        const stats = await statsRes.json();
        // Stats is flat object
        console.log("Stats:", {
            students: stats.totalStudents,
            lessons: stats.totalLessons,
            recentActivityCount: stats.recentActivity ? stats.recentActivity.length : 0
        });

        if (stats.recentActivity && stats.recentActivity.length > 0) {
            console.log("Latest Activity:", stats.recentActivity[0]);
        }

    } catch (err) {
        console.error("Verification failed:", err.message);
    }
}

verify();
