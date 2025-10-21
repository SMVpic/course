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
export default (app, db) => {
/**const state = {
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
  */
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

  const filterOptions = req.query
  const query = filterOptions.articleName ? `SELECT * FROM articles WHERE articleName LIKE "%${filterOptions.articleName}%"` :
  'SELECT * FROM articles'

  db.all(query,(error,data) => {
    if (error) {
      console.log(error)
      req.flash('warning', 'Ошибка получения списка статей')
      res.redirect('/articles')
      return
    }
    const templateData = {
      articles: data,
      flash: res.flash()
    }
    console.log(templateData)
  res.view('courses/index', templateData )
  }) 
})

//Доступ для создания статьи только для зарегеистрированных пользователей 
app.get('/articles/new', {name: 'newArticles'}, (req, res) => {
  if (!requireAuth(req, res)) return
  res.view('courses/new', {articles:state.articles})
})
/** 
//Создание нового поста
app.post('/articles', {
  attachValidation: true,
  schema: {
    body: yup.object({
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
*/
//Просмотр конкретного курса
app.get('/articles/:id', {name:'article'}, (req, res) => {
  if (!requireAuth(req, res)) return

  const {id} = req.params
  db.get(`SELECT * FROM articles WHERE id = ${id}`, (err,data) => {
    if(err) {
      req.flash('warning', 'Ошибка запроса')
      res.redirect(app.reverse('articles'));        
      return;
    }
    if(!data) {
      req.flash('warning', 'Курс не найден')
    }
    const templateData = {
      article: data,
      flash: res.flash()
    }
    //const url = `/courses/${req.params.id}`
    res.view('courses/show', templateData)
    //res.send(`Courses ID: ${req.params.id}`)
    //res.send(`Ссылка:${url}`)
  })
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



}