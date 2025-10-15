/**
import fastify from 'fastify'
import view from '@fastify/view'
import pug from 'pug'
import formbody from '@fastify/formbody'
import yup from 'yup'
import {plugin as fastifyReverseRoutes} from 'fastify-reverse-routes'


const app = fastify({exposeHeadRoutes: false})
const port = 3000

const route = (name, palceholderValues) => app.reverse(name,palceholderValues)

await app.register(formbody)
await app.register(fastifyReverseRoutes)
await app.register(view, {
  engine: { pug },
  defaultContext: {
    route,
  },
})
*/

import bcrypt from 'bcrypt'
import yup from 'yup'
export default async function(app, opts) {
const state = {
    articles: [
      {
        id: 1,
        articleName: 'JS: Массивы',
        description: 'Курс про массивы в JavaScript',
      },
      {
        id: 2,
        articleName: 'JS: Функции',
        description: 'Курс про функции в JavaScript',
      },
    ],
  }

  function requireAuth(req, res) {
    if (!req.session || !req.session.userId) {
      req.flash('warning', 'Войдите в систему, чтобы продолжить')
      res.redirect('/login')
        return false
    }
    return true
}

 //Доступ к статьям только для зарегистрированных пользователей 
app.get('/articles', {name:'articlesList'}, (req, res) => {
  if (!requireAuth(req, res)) return
  /**const flash = {
    success: req.flash('success') || [],
    warning: req.flash('warning') || [],
    error: req.flash('error') || [], 
  }*/
  const data = {flash: res.flash(), articles:state.articles}
  console.log(data)
  res.view('courses/index', data )
})

//Доступ для создания статьи только для зарегеистрированных пользователей 
app.get('/articles/new', {name: 'newArticles'}, (req, res) => {
  if (!requireAuth(req, res)) return
  res.view('courses/new', {articles:state.articles})
})

//Создание нового поста
app.post('/articles', {
  attachValidation: true,
  schema: {
    body: yup.object({
      //id: yup.number(),
      articleName: yup.string().min(2).required(),
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
  }
}, (req, res) => {
    const {
      articleName = '', 
      description= ''
    } = req.body
  
    if(req.validationError) { 
      req.flash('warning', req.validationError.message);
      const data = {
        articleName, description,
        flash: res.flash(),
        articles: state.articles,
      }

      res.view('courses/new', data)
      return
    }
    req.flash('success', 'Пост создан')
    const article = {
      articleName,
      description,
    }

    state.articles.push(article)

    res.redirect(app.reverse('articlesList'))
  })

//Просмотр конкретного курса
app.get('/articles/:id', {name:'thisArticle'}, (req, res) => {
  if (!requireAuth(req, res)) return
  const {id} = req.params
  const oneArticle = state.articles.find(article => article.id === parseInt(id))
  if (!oneArticle) {
    res.code(404).send({message:'Cтатья не найдена'})
    //res.redirect(app.reverse('thisCourse'))
    return
  }
  const data = {
    oneArticle,
  }
    //const url = `/courses/${req.params.id}`
    res.view('courses/show', data)
    //res.send(`Courses ID: ${req.params.id}`)
    //res.send(`Ссылка:${url}`)
})

//Редактирование курса
app.get('/articles/:id/edit', {name:'editArticle'}, (req, res) => {
  const {id} = req.params
  const editThisArticle = state.articles.find(article => article.id === parseInt(id))
  if (!editThisArticle) {
    res.code(404).send({message:'Статья не найдена'})
    return
  }
  const data = {
    editThisArticle,
  }
  res.view('courses/edit', data)
})

app.patch('/articles/:id', (req, res) => {
  const {id} = req.params
  const {articleName, description} = req.body
  const articleIndex = state.articles.findIndex((item) => item.id === parseInt(id))
  if (articleIndex === -1) {
    res.code(404).send({message:'Статья не найдена'})
  } else {
    state.articles[articleIndex] = {...state.articles[articleIndex], articleName, description}
    //res.send(state.courses[courseIndex])
    res.redirect(app.reverse('articlesList'))
  }
})

app.delete('/articles/:id', (req,res) => {
  const {id} = req.params
  const articleIndex = state.articles.findIndex((item) => item.id === parseInt(id))
  if (articleIndex === -1) {
    res.code(404).send({message:'Статья не найдена'})
  } else {
    state.articles.splice(articleIndex, 1)
    res.redirect(app.reverse('articlesList'))
  }
})
}
/** 
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

/**
app.listen({port}, () => {
    console.log(`Example app listening on ${port}`)
})
*/