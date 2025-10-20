// components/calendar/CalendarView.tsx
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Post } from '../content/PostCard' // Import your Post type

const localizer = momentLocalizer(moment)

interface Props {
  posts: Post[]
}

export default function CalendarView({ posts }: Props) {
  // Transform posts into events for the calendar
  const events = posts
    .filter(post => post.scheduledAt) // Only show posts that are scheduled
    .map(post => ({
      id: post.id,
      title: post.content.substring(0, 50) + '...', // Show a snippet
      start: new Date(post.scheduledAt!),
      end: new Date(post.scheduledAt!),
      allDay: false,
      resource: post, // Attach the full post object
    }))

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg" style={{ height: 700 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        className="aesthetic-calendar"
        // You can add onSelectEvent to open a modal with post details
      />
    </div>
  )
}