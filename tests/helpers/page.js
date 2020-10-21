const puppeteer = require('puppeteer')
const sessionFactory = require('../factories/sessionFactory')
const userFactory = require('../factories/userFactory');


/**
 * @description The make goal of this file is to avoid duplicaation code
 * WE CAN NOW REFERENCE ALL FUNTIONS BY DOING page.get() , page.login() , .....
 */
class CustomPage {

    static async build(){
         // open the browser
        const browser = await puppeteer.launch({headless:true, args:['--no-sandbox']});

        // create a new Page
         const page = await browser.newPage()

        //extense of our class
         const customPage = new CustomPage(page)

         return new Proxy(customPage, {
             get: function(target, property){
                return customPage[property] || browser[property] || page[property] 
             }
         })
    }

   constructor(page){
       this.page = page
   }

   // all the loggin stuff 
    async login(){

    // create a  user
    const user = await userFactory()
    // create our session et a sig
    const {session , sig } = sessionFactory(user)

    // set new cookie on our launch page as session and session.sig
    await this.page.setCookie({
        name:'session',
        value:session
    })
    
    await this.page.setCookie({
        name:'session.sig',
        value: sig
    })

   await this.page.goto('http://localhost:3000/blogs');

   //Our test fail because the code is run too fast, React does not render the this.page , to avoid that behavior we will slow a little bit our process
   await this.page.waitFor('a[href="/auth/logout"]');
   }

   // select elements in our dom
   async getContentsOf(selector){
       return this.page.$eval(selector, el => el.innerHTML)
   }

    // What happen: puppetter take the function , converts it into a string and send it over the chromium
    // chromium excute it and take the result send it back to our test suites
   //Make Get request
   // we have to pass path as argument to the evaluate function. cf puppetter
   // path and _path are totaly different
   get(path){
     return  this.page.evaluate(
            async (_path) => {
            try {
                    const res = await fetch(_path, {
                        method: 'GET',
                        credentials:'same-origin',
                        headers:{
                            'Content-type' : 'application/json'
                        }
                    });
                    return await res.json();
                } catch (err) {
                    return console.log(err);
                }
            }, path)
   }

    // What happen: puppetter take the function , converts it into a string and send it over the chromium
    // chromium excute it and take the result send it back to our test suites
   //Make post resquest: take 2args : the path and what we send (data)
   // we received those argumets as _path and _data
   post(path , data){

     return   this.page.evaluate(
            async (_path , _data) => {
            try {
                    const res = await fetch(_path , _data, {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(_data)
                    });
                    return await res.json();
                } catch (err) {
                    return console.log(err);
                }
            }, path , data)
   }
}

module.exports = CustomPage;


