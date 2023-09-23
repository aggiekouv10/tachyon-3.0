const express = require('express');
const helper = require('./helper');
const app = express();
app.listen(80, () => console.log('listening at 80'));
app.use(express.static('public'));
app.get('/token-save', (request, response) => {
  async function a() {
    let redirect = 'https://www.nike.com/cart'
    if (!request.query.token || !request.query.region) {
      response.redirect('https://www.YOUmonitors.com/token-save')
      return
    } else {
      console.log(request.url)
      if (request.query.url) {
        redirect = request.query.url
      }
      let token = request.query.token
      let region = request.query.region
      console.log(token)
      console.log(region)
      response.cookie([`token=${token}`])
      response.cookie([`region=${region}`])
      response.redirect(redirect)
    }
  }
  a()
});
app.get('/nike', (request, response) => {
  async function a() {
    let pid = request.query.pid
    if (!request.headers.cookie) {
      response.redirect('https://www.YOUmonitors.com/token-save')
      return
    }
    try {
      console.log(request.headers.cookie)
      let token = request.headers.cookie.split('token=')[1].split('=')[0]
      region = 'US'
      try {
        region = request.headers.cookie.split('region=')[1].split('=')[0]
      } catch {

      }
      await helper.nikeAtc(pid, token, region)
      response.redirect('https://www.nike.com/favorites')
      return
    } catch (e) {
      console.log(e)
      response.redirect('https://www.YOUmonitors.com/token-save')
      return
    }
  }
  a()
});
app.get('/nike-atc', (request, response) => {
  async function a() {
    let prod = request.query.prod
    if (request.query.prod) {
      response.redirect(`https://www.nike.com/us/en/launch-checkout?productId=${prod.split(':')[0]}&channel=${prod.split(':')[1]}&threadId=${prod.split(':')[2]}&size=${prod.split(':')[3]}`)
      return
    }else {
      response.redirect('https://nike.com/cart')
      return
    }
  }
  a()
});


