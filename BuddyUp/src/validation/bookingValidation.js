export const validateBooking = ({
    activity,
    date,
    time,
    duration,
})=>{
    const errors = {};

    if (!activity.trim()) {
        errors.activity= "Please select an activity"
    }

     if (!date) {
        errors.date= "Please select an date"
    }

     if (!time) {
        errors.time= "Please select an time"
    }

     if (!duration || duration < 1) {
        errors.duration= "Please select an duration"
    }

}