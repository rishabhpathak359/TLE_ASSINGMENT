import dayjs from "dayjs";
import puppeteer from "puppeteer";

const formatDateTime = (date) => {
  const contestDateTime = dayjs(`${date}`, "MMM/DD/YYYY HH:mm").toISOString();
  return contestDateTime || "No Date";};

export const getUpcomingCodechefContests = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 1600 },
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await page.goto("https://www.codechef.com/contests", {
    waitUntil: "networkidle2",
  });
  console.log("📌 Scraping upcoming CodeChef contests...");
  const contests = await page.$$("div._dataTable__container_7s2sw_417");
  let upcomingContests = [];

  for (const contestTable of contests) {
    const sectionTitle = await page.evaluate(
      (el) => el.previousElementSibling?.innerText.trim() || "Unknown",
      contestTable
    );

    if (sectionTitle.includes("Upcoming")) {
      const contestRows = await contestTable.$$(
        "table > tbody.css-y6j1my > tr"
      );
      upcomingContests = await Promise.all(
        contestRows.map(async (row) => {
          return await page.evaluate((element) => {
            const columns = element.querySelectorAll("td");
            const dateText =
              columns[2]?.innerText.trim().split("\n\n")[0] || "";
            const date = new Date(dateText);
            const monthAbbr = date.toLocaleString("en-US", { month: "short" });
            const formattedDate = `${monthAbbr}/${date.getDate()}/${date.getFullYear()}`;
            const time = columns[2]?.innerText
              .trim()
              .split("\n\n")[1]
              ?.split(" ")[1]
              .trim();
            const contestDateTime = formattedDate + " " + time;
            // console.log(contestDateTime);
            return {
              name: columns[0]?.innerText.trim() || "Unknown Contest",
              link: columns[1]?.querySelector("a")?.href || "No Link",
              contestDateTime: contestDateTime || "No Date",
              duration: columns[3]?.innerText.trim() || "No Duration",
            };
          }, row);
        })
      );
    }
  }
  console.log(`✅ Found ${upcomingContests.length} upcoming contests.`);
  upcomingContests.forEach((contest) => {
    contest.contestDateTime = formatDateTime(contest.contestDateTime);
    // console.log(contest.contestDateTime);
  });
  await browser.close();
  // console.log(upcomingContests);
  return upcomingContests;
};

export const getPastCodechefContests = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 1600 },
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await page.goto("https://www.codechef.com/contests", {
    waitUntil: "networkidle2",
  });
  console.log("📌 Scraping past CodeChef contests...");
  const contests = await page.$$("div._dataTable__container_7s2sw_417");
  let pastContests = [];

  for (const contestTable of contests) {
    const sectionTitle = await page.evaluate(
      (el) => el.previousElementSibling?.innerText.trim() || "Unknown",
      contestTable
    );

    if (sectionTitle.includes("Past")) {
      let previousHeight = 0;
      let scrollCount = 0;
      const maxScrolls = 10;

      while (scrollCount < maxScrolls) {
        let newHeight = await page.evaluate(() => document.body.scrollHeight);
        if (newHeight === previousHeight) {
          console.log("✅ No more past contests to load.");
          break;
        }
        previousHeight = newHeight;
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight)
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
        scrollCount++;
        console.log(`🔄 Scrolled ${scrollCount} times`);
      }

      const contestRows = await contestTable.$$(
        "table > tbody.css-y6j1my > tr"
      );
      pastContests = await Promise.all(
        contestRows.map(async (row) => {
          return await page.evaluate((element) => {
            const columns = element.querySelectorAll("td");
            const dateText =
              columns[2]?.innerText.trim().split("\n\n")[0] || "";
            const date = new Date(dateText);
            const monthAbbr = date.toLocaleString("en-US", { month: "short" });
            const formattedDate = `${monthAbbr}/${date.getDate()}/${date.getFullYear()}`;
            const time = columns[2]?.innerText
              .trim()
              .split("\n\n")[1]
              ?.split(" ")[1]
              .trim();
            const contestDateTime = formattedDate + " " + time;
            console.log(contestDateTime);
            return {
              name: columns[0]?.innerText.trim() || "Unknown Contest",
              link: columns[1]?.querySelector("a")?.href || "No Link",
              contestDateTime: contestDateTime || "No Date",
              duration: columns[3]?.innerText.trim() || "No Duration",
            };
          }, row);
        })
      );
    }
  }
  console.log(`✅ Found ${pastContests.length} past contests.`);
  pastContests.forEach((contest) => {
    // console.log(contest.contestDateTime);
    contest.contestDateTime = formatDateTime(contest.contestDateTime);
    // console.log(contest.contestDateTime);
  });
  await browser.close();
  // console.log(pastContests);
  return pastContests;
};

export const codechefScraper = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 1600 },
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await page.goto("https://www.codechef.com/contests", {
    waitUntil: "networkidle2",
  });

  const upcomingContests = await getUpcomingCodechefContests();
  const pastContests = await getPastCodechefContests(page);

  await browser.close();
  return { upcomingContests, pastContests };
};

// getUpcomingCodechefContests();
// getPastCodechefContests();
