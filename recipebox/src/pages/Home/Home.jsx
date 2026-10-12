import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <section className="home">
      <h1>Welcome to RecipeBox</h1>
      <p>
        RecipeBox is a place to share and discover recipes. Browse dishes
        from other cooks, or add your own favourites.
      </p>
      <Link to="/catalog" className="btn">Browse recipes</Link>
    </section>
  )
}

export default Home
