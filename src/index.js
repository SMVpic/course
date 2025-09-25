import fastify from "fastify"  
import view from '@fastify/view'
import pug from 'pug'

const app = fastify()
const port = 8080


app.register(view, { engine: { pug } })

const state = {
    courses: [
      {
        id: 1,
        title: 'JS: Массивы',
        description: 'Курс про массивы в JavaScript',
      },
      {
        id: 2,
        title: 'JS: Функции',
        description: 'Курс про функции в JavaScript',
      },
    ],
  }
  
app.get('/courses', (req, res) => {
    const term = req.query.term
    let courses
    if (term !== null) {
        courses = state.courses.filter(course => course.title.toLowerCase().includes(term.toLowerCase()))
    } else {
        courses = state.courses
    }

    const data = {term, courses}
    res.view('view/users/index.pug', data)
})

  app.get('/courses/:id', (req, res) => {
    const { id } = req.params
    const course = state.courses.find(({ id: courseId }) => courseId === parseInt(id))
    if (!course) {
      res.code(404).send({ message: 'Course not found' })
      return
    }
    const data = {
        course,
        courses: state.courses, // добавляем courses в data
      };
      res.view('/view/users/index.pug', data);
  })

app.get('/users', (req, res) => {
    res.send('GET /users')
})

app.post('/users', (req, res) => {
    res.send('POST /users')
})

app.listen({port}, () => {
    console.log(`Example app listening on port ${port}`)
})