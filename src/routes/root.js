export default async function(app,opts) {
    //главная страница
    app.get('/', (req, res) => {
        const templateData = {
            flash: res.flash(),
          };
        res.view ('../views/index',templateData)
    })
}