import fastify from 'fastify'
import view from '@fastify/view'
import pug from 'pug'
import formbody from '@fastify/formbody'
import yup from 'yup'

const app = fastify()
const port = 3000

await app.register(formbody)
await app.register(view, { engine: { pug } })

const state = {
    courses: [
      {
        id: 1,
        courseName: 'JS: Массивы',
        description: 'Курс про массивы в JavaScript',
      },
      {
        id: 2,
        courseName: 'JS: Функции',
        description: 'Курс про функции в JavaScript',
      },
    ],
  }

  
  app.get('/courses', (req, res) => {
    res.view('../views/courses/new', {courses:state.courses})
})


app.get('/courses/new', (req, res) => {
  res.view('../views/courses/new', {courses:state.courses})
})

app.post('/courses', {
  attachValidation: true,
  schema: {
    body: yup.object({
      courseName: yup.string().min(2).required(),
      description: yup.string().min(10).required(),
    }),
  },
  validatorCompiler: ({schema, method, url, httpPart}) => (data) => {
    try {
      const result = schema.validateSync(data)
      return {value: result}
    }
    catch(e) {
      return {error: e}
    }
  },
}, (req, res) => {
    const {courseName, description} = req.body
  
    if(req.validationError) { 
      const data = {
        courseName, description,
        error: req.validationError,
        courses: state.courses,
      }

      res.view('../views/courses/new', data)
      return
    }

    const course = {
      courseName,
      description,
    }

    state.courses.push(course)

    res.redirect('/courses')
  })

/**
app.get('/courses/:id', (req, res) => {
    const url = `/courses/${req.params.id}`
    res.send(`Courses ID: ${req.params.id}`)
    res.send(`Ссылка:${url}`)
})

app.get('/users/:id', (req, res) => {
    const {id} = req.params
    const user = state.users.find(user => user.id === parseInt(id))
    if (!user) {
        res.code(404).send({message:'User not found'})
        return
    }
    const data = {
        user,
    }
    res.view ('view/users/show', data)
    
})
*/

app.listen({port}, () => {
    console.log(`Example app listening on ${port}`)
})