export function calculateReadTime(content){
    let wordsByMinuteRead   = 200; //This data may be relative, but it was taken from a general average
    let totalWords          = content.split(' ').length;
    let totalMinutes        = Math.ceil(totalWords / wordsByMinuteRead);
    let hoursAndMinutes     = toHoursAndMinutes(totalMinutes);
    let hours               = hoursAndMinutes['hours'];
    let minutes             = hoursAndMinutes['minutes'];

    let averageTime = 
        (hours   > 0 ? hours + ' hour' + (hours > 1 ? 's and ' : ' and ')  : '') +
        (minutes > 0 ? minutes + ' minute' + (minutes > 1 ? 's' : '') : '');

    return averageTime;
}

function toHoursAndMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
}