import PropTypes from 'prop-types'

const LoginForm = ({
    handleSubmit,
    handleUsernameChange,
    handlePasswordChange,
    username,
    password,
    visible
}) => {
  if (!visible) {
    return null
  }
   return (
     <div>
       <h2>Login</h2>
       <form onSubmit={handleSubmit}>
         <div>
           Username:
           <input
           type="text"
           id="login-username"
           value={username}
           onChange={handleUsernameChange} />
         </div>
         <div>
           Password:
           <input
           type="password"
           id="login-password"
           value={password}
           onChange={handlePasswordChange} />
       </div>
         <button id="login-button" type="submit">Log In</button>
       </form>
     </div>
   )
  }
  LoginForm.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    handleUsernameChange: PropTypes.func.isRequired,
    handlePasswordChange: PropTypes.func.isRequired,
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
}
  export default LoginForm