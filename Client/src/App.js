import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import LoginForm from './components/loginForm'
import BlogForm from './components/blogForm'
import RegistrationForm from './components/registerForm'
import Togglable from './components/togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [message, setMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [formType, setFormType] = useState('login')
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then((blogs) => {
      setBlogs(blogs)
    })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('name')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
      const userWithToken = { ...user, token: user.token }
      setUser(userWithToken)
    }
  }, [])

  const setDisplayName = (displayName) => {
    setUsername(displayName)
  }

  const handleRegistration = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.register({
        username, password, name: username,
      })
      blogService.setToken(user.token)
      window.localStorage.setItem(
        'name', JSON.stringify(user)
      )
      setUser(user)
      setUsername('')
      setPassword('')
      setMessage({
        "text": `${username} Registered!`,
        "type": "notification",
      })
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    } catch (exception) {
      setMessage({
        "text": "Invalid Username or Password",
        "type": "error",
      })
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password,
      })
      blogService.setToken(user.token)
      window.localStorage.setItem(
        'name', JSON.stringify(user)
      )
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setMessage({
        "text": "Wrong Credentials",
        "type": "error",
      })
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.clear()
    setUser(null)
  }

  const addBlog = (blogObject) => {
    blogService
      .create(blogObject)
        .then((returnedBlog) => {
        returnedBlog.user = { username: user.username, name: user.name, id: user.id }
        setBlogs(blogs.concat(returnedBlog))
        if (blogFormRef.current) {
          blogFormRef.current.toggleVisibility()
        }
        setMessage({
          "text": `${blogObject.title} by ${blogObject.author} added`,
          "type": "notification"
        })
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
      .catch((error) => {
        setMessage({
          "text": error.response.data.error,
          "type": "error"
        })
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
  }

  const handleDelete = async (id) => {
    try {
      await blogService.remove(id)
      setBlogs(blogs.filter((blog) => blog.id !== id))
    } catch (exception) {
      setMessage({
        "text": `Error Deleting Blog ${exception.message}`,
        "type": "error"
      })
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
  }

  const handleLikes = async (id, updatedBlog, updatedUser) => {
    if (!user) {
      setMessage({
        text: "Please Log In To Like a Blog",
        type: 'error'
      })
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    } else {
    try {
    await blogService.update(id, updatedBlog)
    setBlogs(blogs.map((blog) => blog.id === id ? updatedBlog : blog))
    setUser(updatedUser)
    } catch (exception) {
      setMessage({
        text: `Error updating blog ${exception.message}`,
        type: 'error',
      })
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
  }
}

return (
    <div>
      <h1>BLOGS</h1>
      <Notification message={message} />
      {!user && formType === 'login' && (
        <div>
        <LoginForm
          username={username}
          password={password}
          handleUsernameChange={({ target }) => setUsername(target.value)}
          handlePasswordChange={({ target }) => setPassword(target.value)}
          handleSubmit={handleLogin}
          visible={formType === 'login'}
        />
        <p>Not a User yet?{" "}  <a href="#" onClick={() => setFormType('register')}>Register Here</a></p>
      </div>
      )}
    {formType === 'register' && (
      <div>
      <RegistrationForm
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          setDisplayName={setDisplayName}
          handleRegister={handleRegistration}
          visible={formType === 'register'}
        />
        <button onClick={() => setFormType('login')}>Cancel</button>
      </div>
    )}
      {user && (
      <div>
        <p>{user.name} Is Logged In</p>
        <Togglable buttonLabel="Add a New Blog" ref={blogFormRef}>
          <BlogForm createBlog={addBlog} />
        </Togglable>
        <button onClick={handleLogout}>Logout</button>
        </div>
        )}
      <h2>blogs</h2>
      <ul>
        {blogs
        .sort((a, b) => b.likes - a.likes)
        .map((blog) =>
          <Blog
          key={blog.id}
          blog={blog}
          user={user}
          handleDelete={handleDelete}
          handleLikes={handleLikes}
          />
        )}
      </ul>
    </div>
  )
}
export default App