import { TutorChat } from '@/components/tutor/chat'
import { TutorSidebar } from '@/components/tutor/sidebar'

export default function TutorPage() {
  return (
    <div className="flex h-full">
      <TutorSidebar />
      <div className="flex-1 flex flex-col">
        <TutorChat />
      </div>
    </div>
  )
}
