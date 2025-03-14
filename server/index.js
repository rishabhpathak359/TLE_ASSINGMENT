const puppeteer = require("puppeteer");


const leetCodeScraper = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 1600 },
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );

  console.log("🔄 Opening LeetCode contest page...");
  await page.goto("https://leetcode.com/contest/", {
    waitUntil: "networkidle2",
  });

  let upcomingContests = [];
  let pastContests = [];

  try {
    // **🟢 Scrape Upcoming Contests**
    console.log("📌 Finding upcoming contests...");
    const upcomingElements = await page.$$("div.swiper-wrapper > div.swiper-slide");

    upcomingContests = await Promise.all(
      upcomingElements.map(async (el) => {
        return await page.evaluate((element) => {
          const [_, name, date, time] = element.innerText.split("\n");
          return {
            name,
            date,
            time,
            link: element.querySelector("a")?.href || "No Link Found",
          };
        }, el);
      })
    );

    // **🔹 Filter out ended contests**
    upcomingContests = upcomingContests.filter((contest) => !contest.name.includes("Ended"));

    console.log(`✅ Found ${upcomingContests.length} upcoming contests.`);
  } catch (error) {
    console.error("❌ Error scraping upcoming contests:", error.message);
  }

  try {
    // **🔴 Scrape Past Contests**
    console.log("📌 Finding past contests...");
    pastContests = await page.evaluate(() => {
      const pastContestElements = document.querySelectorAll(
        "div.min-h-\\[966px\\] div.mt-\\[11px\\] > div > div.px-4"
      );

      let pastContestsData = [];
      pastContestElements.forEach((el) => {
        const contestLink = el.querySelector("a")?.href || "No Link Found";
        const contestText = el.innerText.split("\n");
        if (contestText.length >= 2) {
          pastContestsData.push({
            name: contestText[0].trim(),
            date: contestText[1].trim(),
            link: contestLink,
          });
        }
      });

      return pastContestsData;
    });

    console.log(`✅ Found ${pastContests.length} past contests.`);
  } catch (error) {
    console.error("❌ Error scraping past contests:", error.message);
  }

  console.log("📅 Upcoming Contests:", upcomingContests);
  console.log("📅 Past Contests:", pastContests);

  await browser.close();
};


const codechefScrapper = async () => {
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
  const contests = await page.$$("div._dataTable__container_7s2sw_417");

  let upcomingContests = [];
  let pastContests = [];

  for (const contestTable of contests) {
    // Get the section title (e.g., "Upcoming Contests" or "Past Contests")
    const sectionTitle = await page.evaluate((el) => {
      return el.previousElementSibling?.innerText.trim() || "Unknown";
    }, contestTable);

    // Get all rows inside this table
    const contestRows = await contestTable.$$("table > tbody.css-y6j1my > tr");

    let contestData = await Promise.all(
      contestRows.map(async (row) => {
        return await page.evaluate((element) => {
          const columns = element.querySelectorAll("td");
          return {
            name: columns[0]?.innerText.trim() || "Unknown Contest",
            link: columns[1]?.querySelector("a")?.href || "No Link",
            date: columns[2]?.innerText.trim() || "No Date",
            time: columns[3]?.innerText.trim() || "No Time",
          };
        }, row);
      })
    );

    // Categorize the contests
    if (sectionTitle.includes("Upcoming")) {
      upcomingContests = contestData;
    } else if (sectionTitle.includes("Past")) {
      pastContests = contestData;
    }
  }

  console.log("Upcoming Contests:", upcomingContests);
  console.log("Past Contests:", pastContests);
  await browser.close();
};
// codechefScrapper();


const codeforcesScraper = async () => {
  const browser = await puppeteer.launch({
    headless: true, 
    defaultViewport: { width: 1280, height: 1600 },
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );

  console.log("Opening Codeforces...");
  await page.goto("https://codeforces.com/contests", {
    waitUntil: "networkidle2",
  });

  let upcomingContests = [];
  let pastContests = [];

  // **🟢 Scrape Upcoming/Current Contests**
  const upcomingTable = await page.$("div.datatable");
  if (upcomingTable) {
    console.log("✅ Found upcoming contests table");
    const contestRows = await upcomingTable.$$("table > tbody > tr");
    console.log(`Found ${contestRows.length} upcoming contests`);

    upcomingContests = await Promise.all(
      contestRows.map(async (row) => {
        return await page.evaluate((element) => {
          const columns = element.querySelectorAll("td");
          return {
            name: columns[0]?.innerText.trim() || "Unknown Contest",
            link: columns[5]?.querySelector("a")?.href || "No Link",
            date: columns[2]?.innerText.split(" ")[0]?.trim() || "No Date",
            time: columns[2]?.innerText.split(" ")[1]?.trim() || "No Time",
          };
        }, row);
      })
    );
  } else {
    console.log("❌ No upcoming contests found.");
  }

  // **🔴 Scrape Past Contests**
  console.log("Selecting past contests table...");
  const pastTable = await page.$("div.contestList");
  if (pastTable) {
    const contestRows = await pastTable.$$("table > tbody > tr");

    pastContests = await Promise.all(
      contestRows.map(async (row) => {
        return await page.evaluate((element) => {
          const columns = element.querySelectorAll("td");
          return {
            name: columns[0]?.innerText.trim() || "Unknown Contest",
            link: columns[0]?.querySelector("a")?.href || "No Link",
            date: columns[2]?.innerText.split(" ")[0]?.trim() || "No Date",
            time: columns[2]?.innerText.split(" ")[1]?.trim() || "No Time",
          };
        }, row);
      })
    );
  } else {
    console.log("❌ No past contests found.");
  }

  console.log("✅ Upcoming Contests:", upcomingContests);
  console.log("✅ Past Contests:", pastContests);

  await browser.close();
};

leetCodeScraper();

module.exports = { leetCodeScraper, codechefScrapper };

