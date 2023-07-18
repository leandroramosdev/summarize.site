export function calculateReadTime(content){
    let words_by_minute_read = 200; //This data may be relative, but it was taken from a general average
    let total_words          = content.split(' ').length;
    let average_time         = Math.ceil(total_words / words_by_minute_read);
    return average_time + " minutes";
}