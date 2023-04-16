
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./list_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcryptjs')

const Blog = require('../models/blog')
const User = require('../models/user')
jest.setTimeout(1000000)

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.totalBlogs)
//    await User.deleteMany({})
})

describe('when there is initially some notes saved', () => {
    test('blogs are returned as json', async () => {
        console.log('Beginning Test')
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.totalBlogs.length)
    })
    test('verify id', async () => {
        const response = await api.get('/api/blogs')
        response.body.forEach(blog =>
            expect(blog.id).toBeDefined())
    })
    test('a blog without the likes property will default to 0', async () => {
        const response = await api.get('/api/blogs')
        const blogs = response.body

        blogs.forEach(blog => {
            expect(blog.likes).toBeDefined()
            if (!blog.likes) {
                blog.likes = 0
            }
        })
        expect(blogs).toHaveLength(helper.totalBlogs.length)
    })
})

describe('viewing a specific blog', () => {
    test('succeeds with valid id', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToView = blogsAtStart[0]

        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(resultBlog.body).toEqual(blogToView)
    })
    test('fails with statuscode 404 if blog does not exist', async () => {
        const validNonexistingId = await helper.nonExistingId()
        await api
            .get(`/api/blogs/${validNonexistingId}`)
            .expect(404)
    })

    test('fails with statuscode 400 if id is invalid', async () => {
        const invalidId = '5a3d5da59070081a82a3445'
        await api
            .get(`/api/blogs/${invalidId}`)
            .expect(400)
    })
})

describe('addition and deletion of a new blog', () => {
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: "Truckin",
            author: "I.P. Freely",
            url: "https://frameworkkittens.org",
            likes: 82
        }
      const user = await User.findOne({})
      const token = await helper.getToken(user, process.env.SECRET)
      console.log('token', token)

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `bearer ${token}`)
            .expect('Content-Type', /application\/json/)
            .expect(201)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.totalBlogs.length + 1)

        const titles = blogsAtEnd.map((blog) => blog.title)
        expect(titles).toContain('Truckin')

        const savedBlog = blogsAtEnd.find((blog) => blog.title === 'Truckin')
        expect(savedBlog.user.toString()).toEqual(user._id.toString())
    })
    test('a blog can be deleted', async () => {
      const user = await User.findOne({})
      const newBlog = {
            title: "Truckin",
            author: "I.P. Freely",
            url: "https://frameworkkittens.org",
            likes: 82,
            user: user._id
      }
      const token = await helper.getToken(user, process.env.SECRET)
      const createdBlog = await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `bearer ${token}`)
        .expect('Content-Type', /application\/json/)
//        .expect(201)

      const blogsAtStart = await helper.blogsInDb()
      expect(blogsAtStart).toHaveLength(helper.totalBlogs.length + 1)

      await api
        .delete(`/api/blogs/${createdBlog.body.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.totalBlogs.length)

      const titles = blogsAtEnd.map((blog) => blog.title)
      expect(titles).not.toContain(newBlog.title)
    })
    test('fails with status code 400 if data invalid', async () => {
        const newBlog = {
            author: "Jeberdiaerh",
            url: "http://gangstalking101.org",
            likes: 4,
        }
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.totalBlogs.length)
    })
    test('posting a blog without url returns 400 Bad Request', async () => {
        const newBlog = {
            title: "Bad things happening to Bad people",
            author: "Grandpa Perkins",
            likes: 1
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.totalBlogs.length)
    })
    test('update the "likes" field of a blog post', async () => {
        const blog = new Blog({
            title: 'Test blog post',
            author: 'Test author',
            url: 'http://example.com',
            likes: 5,
          })
          await blog.save()

        const updatedBlog = { ...blog.toObject(), likes: 10 }
        await api
            .put(`/api/blogs/${blog.id}`)
            .send(updatedBlog)
            .expect(200)

        const retreivedBlog = await api
            .get(`/api/blogs/${blog.id}`)
            .expect(200)

        expect(retreivedBlog.body.likes).toBe(10)
    })
})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash('jailman', 10)
        const user = new User({ username: 'root', passwordHash })
        await user.save()
    })
    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'jaris',
            name: 'Jari',
            password: 'jailman',
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'jailman',
        }
        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('expected `username` to be unique')
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
})

test('valid token is created for user', async () => {
    const user = {
      username: 'testuser',
      name: 'Test User',
      password: 'password'
    }

    // create user
    await api.post('/api/users').send(user)

    // login user and get token
    const response = await api.post('/api/login').send({
      username: user.username,
      password: user.password
    })

    // check that response contains token and it is not empty
    expect(response.body.token).toBeDefined()
    expect(response.body.token).not.toBe('')
  })

/*
describe('blog API with token authentication', () => {
    let user, token

    beforeAll(async () => {
      // create a new user and generate a token for them
      user = new User({
        username: 'TrestUser',
        password: 'trestpassword'
      })
      await user.save()

      const response = await api
        .post('/api/login')
        .send({ username: 'TrestUser', password: 'trestpassword' })

      token = response.body.token
    })

    beforeEach(async () => {
      // clear the database and create a new blog for each test
      await Blog.deleteMany({})

      const blog = new Blog({
        title: 'Test Blog',
        author: 'Test Author',
        url: 'http://testblog.com',
        likes: 0,
        user: user._id
      })

      await blog.save()
    })

    test('new blog can be added with valid token', async () => {
      const newBlog = {
        title: 'New Blog',
        author: 'New Author',
        url: 'http://newblog.com',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/blogs')

      expect(response.body).toHaveLength(2)
      expect(response.body.map(blog => blog.title)).toContain('New Blog')
    })

    test('new blog cannot be added without token', async () => {
      const newBlog = {
        title: 'New Blog',
        author: 'New Author',
        url: 'http://newblog.com',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
    })

    test('new blog cannot be added with invalid token', async () => {
      const newBlog = {
        title: 'New Blog',
        author: 'New Author',
        url: 'http://newblog.com',
        likes: 0
      }

      const invalidToken = 'invalid-token'

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send(newBlog)
        .expect(401)
    })
    test('blog can be deleted by authenticated user', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

        const titles = blogsAtEnd.map((blog) => blog.title)
        expect(titles).not.toContain(blogToDelete.title)
      })

      test('blog cannot be deleted without token', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .expect(401)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length)

        const titles = blogsAtEnd.map((blog) => blog.title)
        expect(titles).toContain(blogToDelete.title)
      })

      test('blog cannot be deleted with invalid token', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        const invalidToken = 'invalid-token'

        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .set('Authorization', `Bearer ${invalidToken}`)
          .expect(401)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length)

        const titles = blogsAtEnd.map((blog) => blog.title)
        expect(titles).toContain(blogToDelete.title)
      })
  }) */

afterAll(async () => {
    await mongoose.connection.close()
})