import bcrypt from 'bcrypt'
import yup from 'yup'
import formbody from '@fastify/formbody'
import encrypt from './encrypt.js'


export default (app, db) => {

/**const state = {
    users: [
        {   
            id: 1,
            name: 'one',
            email: 'email@mail.com',
            passwordDigest: '<bcrypt-hash>'
        }
    ]
}*/

//let nextUserId = 1


function requireAuth(req, res) {
    if (!req.session || !req.session.userId) {
        res.code(401).send({error: 'Вы не авторизованы'})
        return false
    }
    return true
}

/**
  app.post('/users', (req, res) => {
    const user = {
        name: req.body.name.trim(),
        email: req.body.email.trim().toLowerCase(),
        //password: req.body.password,
    }

    state.users.push(user)

    res.redirect('/users')
})
*/


// Создание нового пользователя
app.post('/users', {
    attachValidation: true,
    schema: {
        body: yup.object({
            name: yup.string().min(2, 'Имя должно быть не меньше двух символов'),
            email: yup.string().email(),
            password: yup.string().min(5, 'Пароль должен быть не меньше пяти символов'),
            passwordConfirmation: yup.string().min(5),
        }),
    },
    validatorCompiler: ({schema, method, url, httpPart}) => (data) => {
        if (data.password != data.passwordConfirmation) {
            return {
                error: Error('Пароли должны совпадать'),
            }
        }
        try {
            const result = schema.validateSync(data)
            return {value: result}
        }
        catch (e) {
            return {error: e}
        }
    }
},  (req, res) => {
    console.log('POST /users called with body:', req.body);
    const {
        name = '',
        email = '',
        password = '',
        passwordConfirmation = ''
    } = req.body || {}

    if(req.validationError) {
        req.flash('warning', req.validationError.message);
        //console.log('Flash before render:', res.flash('warning', req.validationError.message));
        const data = {
            name, email, password, passwordConfirmation,
            flash: res.flash(),
            //users:state.users
        }
        //console.log('Flash before render:', res.flash());
        res.view('users/new.pug', data)
        return
    }

    //проверить, что пользователь с таким email еще не зарегистрирован
    //if(users.find(u => u.email === email)) {
        //res.code(500).send({message:'Пользователь с таким email уже  зарегистрирован'})
        //res.flash('warning', 'Пользователь с таким email уже  зарегистрирован')
       // return
   // }
        
        db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, data) => {
            console.log([email])
            console.log(err)
            console.log(data)
           /** if(err) {
                req.flash('warning', 'Ошибка запроса к базе данных')
                res.redirect('/users/new')
                return
            }*/ 
            if(data){
                req.flash('warning', 'Пользователь с таким email уже зарегистрирован')
                res.redirect('/users/new')
                return
            }
        
    
        //const passwordDigest = await bcrypt.hash(password, 10);
        const passwordDigest = encrypt(password)
        const user = {
          name,
          email,
          passwordDigest,
        };

        const stmt = db.prepare('INSERT INTO users(name, email, passwordDigest) VALUES (?,?,?)')
        stmt.run([user.name, user.email, user.passwordDigest], function (err) {
            if(err) {
                req.flash('warning', 'Ошибка регистрации')
                res.code(500)
                return
            }
            req.session.userId = this.lastID
            req.flash('success', 'Пользователь зарегистрирован')
            res.redirect('/articles')
            return
        })
    })
       // state.users.push(user);
        //req.session.userId = user.id
        //console.log('Session after setting userId:', req.session);
    
        // Проверяем тип сообщения
    
       // console.log('Flash message to set:', flashMessage, 'Type:', typeof flashMessage);
       //req.flash('success', 'Пользователь зарегистрирован')
        //console.log('Flash messages set:', req.flash('success'));
    
        //return res.redirect('/articles')
     
    });


//Логин пользователя
app.post('/login', async (req, res) => {
    const {
    email= '', 
    password= ''
    } = req.body || {}
    if (!email || !password) { //если не введены пароль и почта
        req.flash('warning', "Почта и пароль обязательны")
        res.code(400)
        return
    }

    const user = state.users.find(u => u.email === email)
    if (!user) {//поиск пользователя по почте 
        req.flash('warning', "Нет пользователя с такой почтой")
        //res.code(400)
        return
    }

    /*const ok = await bcrypt.compare(password, user.passwordDigest) //сравнение введенного пароля и пароля в базе
    if (!ok) {
        res.code(401).send({error:'неверный пароль'})
        return
    }

    //Запоминаем пользователя в сессии
    req.session.userId = user.id
    req.flash('success', 'Вы вошли')
    res.redirect('/articles')
})
*/
if (passwordDigest !== encrypt(password)) {
    res.code(401).send({error:'неверный пароль'})
        return
}
    req.session.userId = user.id
    req.flash('success', 'Вы вошли')
    res.redirect('/articles')
})

//Форма входа 
app.get('/login', (req, res) => {
    res.view('users/entry.pug')
})

//Список пользователей
app.get('/users', (req, res) => {
    //res.send(state.users)
    const data = {flash: res.flash(), users:state.users}
    res.view('users/index.pug', data)
})

//Форма регистрации пользователя
app.get('/users/new', (req, res) => {
    const data = {flash: res.flash(),}
    res.view('users/new.pug', data)
})
}
