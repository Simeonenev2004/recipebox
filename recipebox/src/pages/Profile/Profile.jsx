import { useParams } from 'react-router-dom'
import './Profile.css'

function Profile() {
  const { userId } = useParams()

  return (
    <section className="profile">
      <h1>Profile</h1>
      <p>Here the user info and their recipes will be shown.</p>
      <p>User id: {userId}</p>
    </section>
  )
}

export default Profile
