import { useState } from 'react'
import loginService from '../services/login'
import userService from '../services/users'
import PropTypes from "prop-types"

const RegistrationForm = ({ visible }) => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)

  const handleRegister = async (event) => {
    event.preventDefault()

    try {
      const newUser = await userService.create({
        name: name,
        username: username,
        password: password
      })

      await loginService.login({
        username: newUser.username,
        password: password
      })

      // Redirect the user to the home page after registration
      window.location.href = '/'
    } catch (error) {
      setErrorMessage(error.response.data.error)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }
  if (!visible) {
    return null
  }
  return (
    <div>
      <h2>Register</h2>
      {errorMessage && <div className="error">{errorMessage}</div>}
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
RegistrationForm.propTypes = {
  handleRegister: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  setPassword: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
}
export default RegistrationForm