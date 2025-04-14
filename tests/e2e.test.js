const { test, describe, beforeEach, afterEach, beforeAll, afterAll, expect } = require('@playwright/test');
const { chromium } = require('playwright');

const host = 'http://localhost:3000';

let browser;
let context;
let page;

let user = {
    email: "",
    password: "123456",
    confirmPass: "123456",
};

let recipeName = "";

describe("e2e tests", () => {
    beforeAll(async () => {
        browser = await chromium.launch();
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        context = await browser.newContext();
        page = await context.newPage();
    });

    afterEach(async () => {
        await page.close();
        await context.close();
    });


    describe("authentication", () => {
        test("Registration with Valid Data", async () => {
            await page.goto(host);

            await page.click('text=Register');

            await page.waitForSelector('form');

            let random = Math.floor(Math.random() * 1000);
            user.email = `abv_${random}@abv.bg`;

            await page.locator("[name=email]").fill(user.email);
            await page.locator("[name=password]").fill(user.password);
            await page.locator("[name=conf-pass]").fill(user.confirmPass);

            page.click('//button[@type="submit"]');

            await expect(page.locator('nav >> text=Logout')).toBeVisible();
        });

        test("Login with Valid Data", async () => {
            await page.goto(host);

            await page.click('text=Login');

            await page.waitForSelector('form');

            await page.locator("[name=email]").fill(user.email);
            await page.locator("[name=password]").fill(user.password);

            page.click('//button[@type="submit"]');

            await expect(page.locator('nav >> text=Logout')).toBeVisible();
        });

        test("Logout from the Application", async () => {
            await page.goto(host);

            await page.click('text=Login');

            await page.locator("[name=email]").fill(user.email);
            await page.locator("[name=password]").fill(user.password);

            await page.click('//button[@type="submit"]');

            await page.locator('nav >> text=Logout').click();

            await expect(page.locator('nav >> text=Login')).toBeVisible();

            expect(page.url()).toBe(host + '/');
        });
    });

    describe("navbar", () => {
        test("Navigation for Logged-In User", async () => {
            await page.goto(host);

            await page.click('text=Login');

            await page.locator("[name=email]").fill(user.email);
            await page.locator("[name=password]").fill(user.password);

            await page.click('//button[@type="submit"]');

            await expect(page.locator('nav >> text=Home')).toBeVisible();
            await expect(page.locator('nav >> text=Discover')).toBeVisible();
            await expect(page.locator('nav >> text=Search')).toBeVisible();
            await expect(page.locator('nav >> text=Create Recipe')).toBeVisible();
            await expect(page.locator('nav >> text=Logout')).toBeVisible();
            await expect(page.locator('nav >> text=Login')).toBeHidden();
            await expect(page.locator('nav >> text=Register')).toBeHidden();
        });

        test("Navigation for Guest User", async () => {
            await page.goto(host);

            await expect(page.locator('nav >> text=Home')).toBeVisible();
            await expect(page.locator('nav >> text=Discover')).toBeVisible();
            await expect(page.locator('nav >> text=Search')).toBeVisible();
            await expect(page.locator('nav >> text=Login')).toBeVisible();
            await expect(page.locator('nav >> text=Register')).toBeVisible();
            await expect(page.locator('nav >> text=Create Recipe')).toBeHidden();
            await expect(page.locator('nav >> text=Logout')).toBeHidden();
        });
    });

    describe("CRUD", () => {
        beforeEach(async () => {
            await page.goto(host);

            await page.click('text=Login');
            await page.waitForSelector('form');
            await page.locator("[name=email]").fill(user.email);
            await page.locator("[name=password]").fill(user.password);
            await page.click('//button[@type="submit"]');
        });

        test("Create Recipe", async () => {
            await page.goto(host);

            await page.click('//a[@href="/create"]');

            await page.waitForSelector('form');

            let random = Math.floor(Math.random() * 10000);
            recipeName = `Random namer_${random}`;

            await page.fill('[name="recipeName"]', recipeName);
            await page.fill('[name="recipeImage"]', "/images/pancakes.jpg");
            await page.fill('[name="preparationTime"]', "15");
            await page.fill('[name="sharedBy"]', "Unknown");
            await page.fill('[name="cuisineType"]', "cuisineType");
            await page.fill('[name="steps"]', "testSteps");

            await page.click('//button[@type="submit"]');

            await expect(page.locator('div.recipe-details h2', { hasText: recipeName })).toHaveCount(1);

            expect(page.url()).toBe(host + '/discover');
        });

        test("Edit Recipe", async () => {
            await page.click('text=Search');

            await page.fill('[name="search"]', recipeName);

            await page.click('//button[@type="submit"]');

            await page.locator(`//section[@class="search-results"]//a`).first().click();

            await page.click('//a[@class="edit-btn"]');

            await page.waitForSelector('form');

            recipeName = recipeName + "_edited";
            await page.locator('[name="recipeName"]').fill(recipeName);

            await page.click('//button[@type="submit"]');

            await expect(page.locator("//h2", {hasText: recipeName})).toHaveCount(1);
        });

        test("Delete Recipe", async () => {
            await page.click('text=Search');

            await page.fill('[name="search"]', recipeName);

            await page.click('//button[@type="submit"]');

            await page.locator(`//section[@class="search-results"]//a`).first().click();

            await page.click('//a[@class="delete-btn"]');

            await expect(page.locator("//h2", {hasText: recipeName})).toHaveCount(0);

            expect(page.url()).toBe(host + '/discover');
        });
    });
});