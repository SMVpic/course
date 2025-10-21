export default async function(app,db) {
    //главная страница
    app.get('/', (req, res) => {
        const templateData = {
            flash: res.flash(),
          };
        res.view ('../views/courses/about',templateData)
    })
}