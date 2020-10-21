Number.prototype._called = {};

const Page = require('./helpers/page')

//IMPORTANT: any time we do an ajax call we have to insure the page to wait beacuse puppetter will not wait before the page rerender

beforeEach( async () => {
    page = await Page.build()
    await page.goto('http://localhost:3000')
})

afterEach( async () => {
    await page.close()
})

// when we are logging
describe('When logged in' , async() => {
 
    // before each test run we insure we are loggin we click create button
    beforeEach(async() => {
        await page.login()
        await page.click('a.btn-floating')
    })

    // we test if we have the form
    test('Can see blog create form' , async () => {
    const label = await page.getContentsOf('form label')
    expect(label).toEqual('Blog Title');
    })

    // when using invalid inputs
    describe('and using invalid inputs', async() => {

        //before each test we insure we click on the submit button
        beforeEach(async() => {
             await page.click('form button')
        })
        // we test if we have the rigths messages errors
        test('the form show an error message',async() =>{
            const textError = await page.getContentsOf('.title .red-text')
            const contentError = await page.getContentsOf('.content .red-text')

            expect(textError).toEqual('You must provide a value')
            expect(contentError).toEqual('You must provide a value')
        })
    })

    // when using the valid inputs
    describe('And using valid input', async() => {

        // before each test we insure we type a valid input and we click the submit button
        //type takes 2params , the selector of the input and the text in the input
        beforeEach(async() => {
            await page.type('.title input','My title');
            await page.type('.content input','My content');
            await page.click('form button');
        });

        test('submitting takes user to review screen', async() => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        })

        test('submitting the saving adds blog to index page', async() => {
            await page.click('button.green')
            // we are making an ajax call so we have to wait the page to be rerender
            await page.waitFor('.card')
            const textTitle = await page.getContentsOf('.card-title');
            const textContent = await page.getContentsOf('p');
            expect(textTitle).toEqual('My title')
            expect(textContent).toEqual('My content')

        })
    })
});

describe('User is not Logged In', async() => {

    test('User can not create a blog post', async() => {
        const result  =  await page.post('/api/blogs' , {title:'My title' , content:'My content'})
        expect(result).toEqual({error: 'You must log in!'})
    })

    test('User can not view list of posts', async() => {

         const result  =  await page.get('/api/blogs')
        expect(result).toEqual({error: 'You must log in!'})
    })
});









