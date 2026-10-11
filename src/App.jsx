import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import PrivateRoute from './guards/PrivateRoute.jsx'
import GuestRoute from './guards/GuestRoute.jsx'
import Home from './pages/Home/Home.jsx'
import Catalog from './pages/Catalog/Catalog.jsx'
import Details from './pages/Details/Details.jsx'
import Create from './pages/Create/Create.jsx'
import Edit from './pages/Edit/Edit.jsx'
import Profile from './pages/Profile/Profile.jsx'
import Login from './pages/Login/Login.jsx'
import Register from './pages/Register/Register.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:id" element={<Details />} />
        <Route path="/profile/:userId" element={<Profile />} />

        <Route element={<PrivateRoute />}>
          <Route path="/create" element={<Create />} />
          <Route path="/catalog/:id/edit" element={<Edit />} />
        </Route>

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
