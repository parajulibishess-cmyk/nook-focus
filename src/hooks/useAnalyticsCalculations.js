import { useStats } from '../context/StatsContext';
import { useTasks } from '../context/TaskContext';

export const useAnalyticsCalculations = () => {
    const { stats } = useStats();
    const { tasks } = useTasks();

    // --- HELPER FUNCTIONS ---
    
    const getTodayMinutes = () => {
        if (!stats.dailyHistory) return 0;
        const today = new Date().toLocaleDateString('en-CA');
        return stats.dailyHistory[today] || 0;
    };

    const getFlowScore = () => {
        const focus = stats.sessionCounts?.focus || 0;
        const abandoned = stats.abandonedSessions || 0;
        const total = focus + abandoned;
        
        if (total === 0) return 0;
        return Math.round((focus / total) * 100);
    };

    const getGoldenHour = () => {
        if (!stats.hourlyActivity || stats.hourlyActivity.every(h => h === 0)) return null;
        const maxVal = Math.max(...stats.hourlyActivity);
        const hour = stats.hourlyActivity.indexOf(maxVal);
        return { time: `${hour}:00 - ${(hour + 1) % 24}:00` };
    };

    const getDailyAverage = () => {
        if (!stats.installDate) return 0;
        const start = new Date(stats.installDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); 
        return Math.round(stats.minutes / diffDays);
    };

    const getEstimationAccuracy = () => {
        const completedWithEstimates = tasks.filter(t => t.completed);
        
        if (completedWithEstimates.length === 0) return { val: 100, text: "No data", color: "#a4b0be" };
        
        let totalEst = 0, totalAct = 0;
        completedWithEstimates.forEach(t => { 
            totalEst += (t.estimatedPomos || 1); 
            totalAct += (t.completedPomos || 0); 
        });
        
        if (totalAct === 0 && totalEst > 0) return { val: 0, text: "Needs focus", color: "#ff6b6b" };
        
        const ratio = (totalAct / totalEst); 
        const percentage = Math.round(ratio * 100);
        
        if (percentage > 120) return { val: percentage, text: `Underestimating (${percentage}%)`, color: "#ff6b6b" };
        if (percentage < 80) return { val: percentage, text: `Overestimating (${percentage}%)`, color: "#54a0ff" };
        return { val: percentage, text: "Spot on!", color: "#78b159" };
    };

    const getPriorityFocus = () => {
        const dist = stats.priorityDist || {};
        const high = (dist[4] || 0) + (dist[3] || 0); // P1 & P2
        const total = Object.values(dist).reduce((a,b) => a+b, 0);
        if (total === 0) return 0;
        return Math.round((high / total) * 100);
    };

    const getProcrastinationIndex = () => {
        const completedTasks = tasks.filter(t => t.completed && t.completedAt);
        if (completedTasks.length === 0) return "0h";
        
        let totalDiff = 0;
        let count = 0;

        completedTasks.forEach(t => { 
            let createdTime = null;
            if (t.createdAt) {
                 createdTime = new Date(t.createdAt).getTime();
            } else if (typeof t.id === 'number' && t.id > 1577836800000) {
                 createdTime = t.id;
            }
            
            if (createdTime && !isNaN(createdTime) && t.completedAt > createdTime) {
                totalDiff += (t.completedAt - createdTime);
                count++;
            }
        });
        
        if (count === 0) return "0h";

        const avgMs = totalDiff / count;
        const avgHours = Math.round(avgMs / (1000 * 60 * 60));
        if (avgHours > 24) return `${Math.round(avgHours/24)} days`;
        return `${avgHours} hours`;
    };

    const getCategoryChampion = () => {
        const cats = {};
        tasks.forEach(t => {
            if (!cats[t.category]) cats[t.category] = { total: 0, completed: 0 };
            cats[t.category].total++;
            if (t.completed) cats[t.category].completed++;
        });
        
        let champ = "None";
        let maxCount = -1;
        
        Object.entries(cats).forEach(([name, data]) => {
            if (data.total < 1) return;
            if (data.completed > maxCount) { 
                maxCount = data.completed; 
                champ = name; 
            }
        });
        return champ;
    };

    const getFlowDepth = () => {
        const totalSessions = stats.sessionCounts?.focus || 1;
        return ((stats.totalPauses || 0) / totalSessions).toFixed(1);
    };

    const getAbandonmentRate = () => {
        const total = (stats.sessionCounts?.focus || 0) + (stats.abandonedSessions || 0);
        if (total === 0) return 0;
        return Math.round(((stats.abandonedSessions || 0) / total) * 100);
    };

    const getWeekSplit = () => {
        let wd = 0, we = 0;
        Object.entries(stats.dailyHistory || {}).forEach(([date, mins]) => {
            const d = new Date(date).getDay();
            if (d === 0 || d === 6) we += mins;
            else wd += mins;
        });
        const total = wd + we;
        if (total === 0) return { wd: 0, we: 0 };
        return { wd: Math.round((wd/total)*100), we: Math.round((we/total)*100) };
    };

    const getNightOwlScore = () => {
        if (!stats.hourlyActivity) return 0;
        const lateHours = stats.hourlyActivity[22] + stats.hourlyActivity[23] + stats.hourlyActivity[0] + stats.hourlyActivity[1];
        const total = stats.hourlyActivity.reduce((a,b) => a+b, 0);
        if (total === 0) return 0;
        return Math.round((lateHours / total) * 100);
    };

    const getMonthlyVelocity = () => {
        const months = {};
        Object.entries(stats.dailyHistory || {}).forEach(([date, mins]) => {
            const m = date.substring(0, 7); // YYYY-MM
            months[m] = (months[m] || 0) + Math.round(mins / 60); // Hours
        });
        return Object.entries(months).sort().slice(-6);
    };

    const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;
    const distMax = Math.max(...Object.values(stats.categoryDist || { "General": 0 }), 1);

    return {
        todayMinutes: getTodayMinutes(),
        flowScore: getFlowScore(),
        goldenHour: getGoldenHour(),
        dailyAverage: getDailyAverage(),
        estimationAccuracy: getEstimationAccuracy(),
        priorityFocus: getPriorityFocus(),
        procrastinationIndex: getProcrastinationIndex(),
        categoryChampion: getCategoryChampion(),
        flowDepth: getFlowDepth(),
        abandonmentRate: getAbandonmentRate(),
        weekSplit: getWeekSplit(),
        nightOwlScore: getNightOwlScore(),
        monthlyVelocity: getMonthlyVelocity(),
        completionRate,
        distMax
    };
};