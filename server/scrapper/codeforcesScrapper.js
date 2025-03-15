import dayjs from "dayjs";
import puppeteer from "puppeteer";
const formatDateTime = (date) => {
  const contestDateTime = dayjs(`${date}`, "MMM/DD/YYYY HH:mm").toISOString();
  return contestDateTime;
};

export const getUpcomingCodeforcesContests = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 1600 },
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await page.goto("https://codeforces.com/contests", {
    waitUntil: "networkidle2",
  });
  console.log("📌 Scraping upcoming Codeforces contests...");
  const upcomingTable = await page.$("div.datatable");
  let upcomingContests = [];

  if (upcomingTable) {
    const contestRows = await upcomingTable.$$("table > tbody > tr");

    upcomingContests = await Promise.all(
      contestRows.map(async (row) => {
        return await page.evaluate((element) => {
          const columns = element.querySelectorAll("td");
          const date = columns[2]?.innerText.trim().split(" ")[0]?.trim();
          const time = columns[2]?.innerText.trim().split(" ")[1]?.trim();
          const match = time ? time.match(/^\d{2}:\d{2}/) : null;
          const contestDateTime = match ? `${date} ${match[0]}` : "Invalid Date";
          return {
            name:
              columns[0]?.innerText.trim().split("\n")[0] || "Unknown Contest",
            link: columns[5]?.querySelector("a")?.href || "No Link",
            contestDateTime: contestDateTime || "No Date",
            duration: columns[3]?.innerText.trim() || "No Duration",
          };
        }, row);
      })
    );
  }

  console.log(`✅ Found ${upcomingContests.length} upcoming contests.`);
  await browser.close();
  upcomingContests.shift();
  upcomingContests.forEach((contest) => {
    // console.log(contest.contestDateTime);
    contest.contestDateTime = formatDateTime(contest.contestDateTime); 
  });
  // console.log(upcomingContests);

  return upcomingContests;
};

export const getPastCodeforcesContests = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 1600 },
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await page.goto("https://codeforces.com/contests", {
    waitUntil: "networkidle2",
  });
  console.log("📌 Scraping past Codeforces contests...");
  const pastTable = await page.$("div.contestList");
  let pastContests = [];

  if (pastTable) {
    let previousHeight = 0;
    let scrollCount = 0;
    const maxScrolls = 30;

    while (scrollCount < maxScrolls) {
      let newHeight = await page.evaluate(() => document.body.scrollHeight);
      if (newHeight === previousHeight) {
        console.log("✅ No more past contests to load.");
        break;
      }
      previousHeight = newHeight;
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise((resolve) => setTimeout(resolve, 2000));
      scrollCount++;
      console.log(`🔄 Scrolled ${scrollCount} times`);
    }

    const contestRows = await pastTable.$$("table > tbody > tr");

    pastContests = await Promise.all(
      contestRows.map(async (row) => {
        return await page.evaluate((element) => {
          const columns = element.querySelectorAll("td");
          const date = columns[2]?.innerText.trim().split("\n")[0];
          const time = columns[2]?.innerText.trim().split("\n")[1] ;
          const match = time ? time.match(/^\d{2}:\d{2}/) : null;
          const contestDateTime = match ? `${date} ${match[0]}` : "Invalid Date";
          return {
            name:
              columns[0]?.innerText.trim().split("\n")[0] || "Unknown Contest",
            link: columns[0]?.querySelector("a")?.href || "No Link",
            contestDateTime: contestDateTime || "No Date",
            duration: columns[3]?.innerText.trim() || "No Duration",
          };
        }, row);
      })
    );
  }

  console.log(`✅ Found ${pastContests.length} past contests.`);
  await browser.close();
  pastContests.forEach((contest) => {
    // console.log(contest.contestDateTime);
    contest.contestDateTime = formatDateTime(contest.contestDateTime);
  });
  // console.log(pastContests);
  return pastContests;
};

export const codeforcesScraper = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 1600 },
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await page.goto("https://codeforces.com/contests", {
    waitUntil: "networkidle2",
  });

  const upcomingContests = await getUpcomingCodeforcesContests();
  const pastContests = await getPastCodeforcesContests(page);

  await browser.close();
  return { upcomingContests, pastContests };
};


// getUpcomingCodeforcesContests();
// getPastCodeforcesContests();