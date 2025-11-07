export const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};

export function convertToSeconds(customTimeString) {
    const parts = customTimeString.split(':').map(p => parseInt(p.trim(), 10));

    let totalSeconds = 0;

    if (parts.length === 3) {
        // HH:MM:SS format
        const hours = parts[0];
        const minutes = parts[1];
        const seconds = parts[2];
        totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

    } else if (parts.length === 2) {
        // MM:SS format
        const minutes = parts[0];
        const seconds = parts[1];
        totalSeconds = (minutes * 60) + seconds;

    } else {
        console.error('Invalid time format:', customTimeString);
        return null;
    }

    return totalSeconds;
}

export function convertSecondsToTimestamp(totalSeconds, forceHHMMSS = false) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => num.toString().padStart(2, '0');

    if (forceHHMMSS || hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else {
        return `${pad(minutes)}:${pad(seconds)}`;
    }
}