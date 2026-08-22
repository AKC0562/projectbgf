import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";

function BookingForm({
  activity,
  date,
  time,
  duration,
  activities = [],
  durationOptions = [],
  errors = {},
  onActivityChange,
  onDateChange,
  onTimeChange,
  onDurationChange,
  onSubmit,
  loading = false,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">

      <div>
        <Select
          label="Activity"
          name="activity"
          value={activity}
          onChange={onActivityChange}
          placeholder="Select activity"
          options={activities}
          error={errors.activity}
          required
        />
      </div>

      <div className="mt-6">
        <Input
          label="Date"
          name="date"
          type="date"
          value={date}
          onChange={onDateChange}
          error={errors.date}
          required
        />
      </div>

      <div className="mt-6">
        <Input
          label="Time"
          name="time"
          type="time"
          value={time}
          onChange={onTimeChange}
          error={errors.time}
          required
        />
      </div>

      <div className="mt-6">
        <Select
          label="Duration"
          name="duration"
          value={duration}
          onChange={onDurationChange}
          options={durationOptions.map(
            (option) => ({
              value: option.value,
              label: option.lable,
            })
          )}
          error={errors.duration}
          required
        />
      </div>

      <Button
        type="submit"
        onClick={onSubmit}
        loading={loading}
        className="mt-8 w-full"
      >
        Continue
      </Button>

    </div>
  );
}

export default BookingForm;