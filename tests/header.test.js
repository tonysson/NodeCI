Number.prototype._called = {};

const Page = require('./helpers/page')

let  page

// BeforeEach is invoced before every test we 'll write in this file
 beforeEach( async () => {
     page = await Page.build()
     //go to the address
    await page.goto('http://localhost:3000');
})

// this we'll be executed after every test
afterEach( async() => {
    await page.close()
})



test('The header have the correct text' , async () => {
    // get the logo text element
    // const  text = await  page.$eval('a.brand-logo', el => el.innerHTML)
    const text = await page.getContentsOf('a.brand-logo')
    expect(text).toEqual('Blogster');
});

test('clicking loging start oauth flow' , async() => {
    // click the link to login In in our page
    await page.click('.right a');
    // get the url of the page we launch after clicking the link
    const url = await page.url()
    expect(url).toMatch(/accounts\.google\.com/);
})

test('when signed in shows logout button', async() => {

    await page.login()
 // const  text = await  page.$eval('a[href="/auth/logout"]', el => el.innerHTML)
   const text = await page.getContentsOf('a[href="/auth/logout"]')
   expect(text).toEqual('Logout');

})









