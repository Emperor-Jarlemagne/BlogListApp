import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    url:''
})

  const addBlog = (event) => {
    event.preventDefault()
    createBlog(newBlog)
    setNewBlog({
      title: '',
      author: '',
      url: ''
  })
  }

    return (
      <div >
        <h2>Add a New Blog</h2>
        <form onSubmit={addBlog}>
          <div>
            Title:
              <input
                type="text"
                id="title"
                data-testid="title"
                value={newBlog.title}
                onChange={event => setNewBlog({ ...newBlog, title: event.target.value })}
                />
          </div>
          <div>
            Author:
              <input
              type="text"
              id="author"
              data-testid="author"
              value={newBlog.author}
              onChange={event => setNewBlog({ ...newBlog, author: event.target.value })}
              />
          </div>
          <div>
            Url:
              <input
              type="text"
              id="url"
              data-testid="url"
              value={newBlog.url}
              onChange={event => setNewBlog({ ...newBlog, url: event.target.value })}
              />
          </div>
          <button id="create-button" type="submit">Save</button>
        </form>
      </div>
    )
  }

  export default BlogForm