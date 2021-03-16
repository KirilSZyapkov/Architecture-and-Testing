const { chromium } = require('playwright-chromium');
const { expect } = require('chai');
const { pathToFileURL } = require('url');

let browser, page; // Declare reusable variables

const url = 'http://localhost:3000';

const oBj = {
    author: "",
    title: '',
    _id: ''
}

function obj(data) {
    return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }
}

describe('E2E tests', function () {
    this.timeout(20000);
    before(async () => {
        // browser = await chromium.launch({ headless: false, slowMo: 500 });
        browser = await chromium.launch();
    });

    after(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        page = await browser.newPage();
    });

    afterEach(async () => {
        await page.close();
    });

    it('loads static page', async () => {
        await page.goto('http://localhost:3000');
        await page.screenshot({ path: 'index.png' });

    });

    it('add new book', async () => {

        await page.goto(url);
        await page.fill('[name="title"]', 'book');
        await page.fill('[name="author"]', 'Pesho');
        await page.click('#createForm>button');
        this.timeout(300);
        await page.click('text=LOAD ALL BOOKS');
        await page.waitForSelector('tbody');
        const txt = await page.content();
        expect(txt).to.contains('book');
        expect(txt).to.contains('Pesho');

    });

    it('load books', async () => {
        await page.goto('http://localhost:3000');
        await page.click('text=LOAD ALL BOOKS');
        await page.waitForSelector('tbody');
        const txt = await page.content();
        expect(txt).to.contains('book');
        expect(txt).to.contains('Pesho');
    });

    it('aler us', async () => {
        await page.goto('http://localhost:3000');
        await page.click('#createForm>button');
        page.on('dialog', alert => dialog.accept('OK'));
        
    });

    
    it('edit book', async () => {

        await page.goto(url);
        await page.click('text=LOAD ALL BOOKS');
        await page.waitForSelector('tbody');
        this.timeout(300);
        await page.click('text=Edit');

        await page.fill('#editForm>[name=title]', 'HOHO');

        await page.click('#editForm>button');
        await page.click('text=LOAD ALL BOOKS');
        await page.waitForSelector('tbody');
        const txt = await page.content();
        expect(txt).to.contains('HOHO');
    });

    it('delete book', async () => {
        await page.route('http://localhost:3030/jsonstore', (request) => {
            request.fulfill(obj(oBj));
        });

        await page.goto(url);
        await page.click('text = LOAD ALL BOOKS');
        await page.waitForSelector('tbody');
        await page.click('text = Delete');
        page.on('dialog', dialog => dialog.accept());

        const [request] = await Promise.all([
            page.waitForRequest('**/jsonstore/collections/books/0001'),
            page.click('text = Delete'),

        ]);

        expect(request.method()).to.equal('DELETE');
    })

});