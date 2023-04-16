import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import BlogForm from '../components/blogForm'
import userEvent from '@testing-library/user-event'

describe('<BlogForm />', () => {
    test('calls createBlog with the right details when a new blog is created', async () => {
      const createBlog = jest.fn()
      const user = userEvent.setup()

      render(<BlogForm createBlog={createBlog} />)

      const titleInput = screen.getByTestId('title')
      const authorInput = screen.getByTestId('author')
      const urlInput = screen.getByTestId('url')
      const submitButton = screen.getByText('Save')

      await user.type(titleInput, 'test title')
      await user.type(authorInput, 'test author')
      await user.type(urlInput, 'http://test-url.com')
      await user.click(submitButton)

      expect(createBlog.mock.calls).toHaveLength(1)
      expect(createBlog.mock.calls[0][0].title).toBe('test title')
      expect(createBlog.mock.calls[0][0].author).toBe('test author')
      expect(createBlog.mock.calls[0][0].url).toBe('http://test-url.com')
    })
  })