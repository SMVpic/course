import fastify from 'fastify'
import view from '@fastify/view'
import pug from 'pug'

const app = fastify()
const port = 3000

await app.register(view, { engine: { pug } })

const state = {
    users: [
        {
            id: 1,
            name: 'Михаил',
            description: 'Владелец курса',
        },
        {
            id:2,
            name: 'Евгений',
            description: 'Участник курса',
        },
    ],
}

const stote = {
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
    const data = {
      courses: stote.courses, // Где-то хранится список курсов
      header: 'Курсы по программированию',
    }
    res.view('view/users/showcourses', data)
})

//app.get('/courses/:id', (req, res) => {
 //   const url = `/courses/${req.params.id}`
    //res.send(`Courses ID: ${req.params.id}`)
 //   res.send(`Ссылка:${url}`)
//})

//app.get('/users/:id', (req, res) => {
//    const {id} = req.params
  //  const user = state.users.find(user => user.id === parseInt(id))
  //  if (!user) {
    //    res.code(404).send({message:'User not found'})
      //  return
    //}
    //const data = {
      //  user,
    //}
    //res.view ('view/users/show', data)
    
//})
app.get('/users/:id', (req, res) => {
  res.type('html')
  res.send(`<h1>${req.params.id}</h1>`)
})

app.listen({port}, () => {
    console.log(`Example app listening on ${port}`)
})