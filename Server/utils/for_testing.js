

const dummy = (blogs) => {
    const one = () => {
        return (blogs.length * 0) + 1
    }
    return one()
}

const totalLikes = (blogs) => {
    return blogs.reduce((total, blog) => {
        return total + blog.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    const maxLikes = Math.max(...blogs.map(blog => blog.likes))
    const blog = blogs.find(blog => blog.likes === maxLikes)

    return {
        title: blog.title,
        author: blog.author,
        likes: blog.likes
    }
}

const mostBlogs = (blogs) => {
    const blogCounts = {}
    let maxAuthor = ''
    let maxBlogs = 0

    blogs.forEach((blog) => {
        if (blog.author in blogCounts) {
            blogCounts[blog.author] += 1
        } else {
            blogCounts[blog.author] = 1
        }
    })
    Object.entries(blogCounts).forEach(([author, blogCount]) => {
        if (blogCount > maxBlogs) {
            maxBlogs = blogCount
            maxAuthor = author
        }
    })

    return {
        author: maxAuthor,
        blogs: maxBlogs
    }
}

const mostLikes = (blogs) => {
    const authors = blogs.reduce((result, blog) => {
        result[blog.author] = (result[blog.author] || 0) + blog.likes
        return result
    }, {})
    const authorWithMostLikes = Object.keys(authors).reduce((a, b) => authors[a] > authors[b] ? a : b)
    return {
        author: authorWithMostLikes,
        likes: authors[authorWithMostLikes]
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
}