/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react'
import PropTypes from 'prop-types'

const Blog = ({ blog, user, handleDelete, handleLikes }) => {
  const [showDetails, setShowDetails] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 4,
    marginBottom: 5,
    marginRight: 15
  }

  const handleShowDetails = () => {
    setShowDetails(!showDetails)
  }

  const handleLikeChange = async (event) => {
    event.preventDefault()
    if (!blog || !blog.user) {
      return
    }
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: { //This includes the user property in the updated blog object
        ...blog.user,
        blogs: blog.user.blogs ? blog.user.blogs.concat(blog.id) : [blog.id]
      }
    }
    await handleLikes(updatedBlog.id, updatedBlog, updatedBlog.user)
  }

  const handleDeleteBlog = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      handleDelete(blog.id)
    }
  }

  return (
    <div style={blogStyle} className='blog' id="blogList">
    <div>"{blog.title}"</div>
    <div>{blog.author}</div>
    <button onClick={handleShowDetails} data-testid="view-button">
      {showDetails ? 'Hide' : 'View'}
    </button>
    {showDetails && (
        <div className="blogAll">
          <div>{blog.url}</div>
          <div id="blog-likes">{blog.likes}{' '} <button onClick={handleLikeChange} id="Like" >Like</button></div>
          <div>{blog.user ? `Added By ${blog.user.name || 'Unknown'}` : 'Author Unknown'}</div>
        </div>
      )}
      {user && user.username === blog.user.username && (
            <button onClick={handleDeleteBlog} id="Delete">Delete This Blog</button>
          )}
      <br />
  </div>
)}
Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  user: PropTypes.object,
  handleDelete: PropTypes.func.isRequired,
  handleLikes: PropTypes.func.isRequired,
}

export default Blog