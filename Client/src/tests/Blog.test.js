
import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/react'
//import userEvent from '@testing-library/user-event'
import Blog from '../components/Blog'

describe('Blog', () => {
    let component
    let blog
    let handleDelete
    let handleLikes

    beforeEach(() => {
        blog = {
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            user: {
                name: 'Test User',
                username: 'testuser'
            }
        }
        handleDelete = jest.fn()
        handleLikes = jest.fn()
        component = render(<Blog blog={blog} handleDelete={handleDelete} handleLikes={handleLikes} />)
    })

      test('renders title and author but not url and likes initially', () => {
        const blogTitle = component.container.querySelector('.blog > div:first-child')
        expect(blogTitle).toHaveTextContent('Canonical string reduction')

        const blogAuthor = component.container.querySelector('.blog > div:nth-child(2)')
        expect(blogAuthor).toHaveTextContent('Edsger W. Dijkstra')

        const url = component.container.querySelector('.blogAll')
        expect(url).toBeNull()

        const likes = component.container.querySelector('.blogAll')
        expect(likes).toBeNull()
      })

      test('renders url and likes when view button is clicked', () => {
        const button = component.getByText('View')
        fireEvent.click(button)

        const url = component.container.querySelector('.blogAll > div:first-child')
        expect(url).toHaveTextContent('http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html')

        const likes = component.container.querySelector('.blogAll > div:nth-child(2)')
        expect(likes).toHaveTextContent('12')
      })
      test('tests whether the like button registers two clicks', async () => {
        const mockHandler = jest.fn()
        const component = render(<Blog blog={blog} handleDelete={handleDelete} handleLikes={mockHandler} />)
        const viewButton = component.queryAllByTestId('view-button')[1]
        fireEvent.click(viewButton)

        const buttonLike = component.getByText('Like')

        fireEvent.click(buttonLike)
        fireEvent.click(buttonLike)

        expect(mockHandler.mock.calls).toHaveLength(2)
      })
})