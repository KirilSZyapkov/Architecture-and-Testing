const { chromium } = require('playwright-chromium');
const { expect } = require('chai');
const { request } = require('http');

let browser, page; // Declare reusable variables

const oBj = {
    author: "",
    content: '',
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
    this.timeout(10000);
    before(async () => {
        browser = await chromium.launch({ headless: false, slowMo: 500 });
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

    it('load messeges', async () => {
        await page.goto('http://localhost:3000');
        await page.click('text=Refresh');
        const txt = await page.isVisible('#messages');
        expect(txt).to.be.true;
    });

    it('send message', async () => {
        await page.route('http://localhost:3030/jsonstore/messenger', (request) => {
            request.fulfill(obj(oBj));
        });

        await page.goto('http://localhost:3000');
        await page.fill('#author', 'Pesho');
        await page.fill('#content', 'hello');

        const [request] = await Promise.all([
            page.waitForRequest(request => request.url().includes('jsonstore/messenger') && request.method() === 'POST'),
            page.click('text=Send'),
        ])

        const data = JSON.parse(request.postData());
        expect(data.author).to.equal('Pesho');
        expect(data.content).to.equal('hello');

    })


});