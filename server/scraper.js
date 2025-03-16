import puppeteer from "puppeteer";
const calculateContestDate = (countdown) => {
  const now = new Date();
  const regex = /(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/;
  const match = countdown.match(regex);

  if (!match) return "Invalid Timer Format";
  const days = match[1] ? parseInt(match[1]) : 0;
  const hours = match[2] ? parseInt(match[2]) : 0;
  const minutes = match[3] ? parseInt(match[3]) : 0;
  const seconds = match[4] ? parseInt(match[4]) : 0;

  const totalMilliseconds =
    (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds) * 1000;

  const contestDate = new Date(now.getTime() + totalMilliseconds);

  return contestDate.toLocaleString();
};

export const leetCodeScraper = async () => {
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
    console.log("📌 Finding upcoming contests...");
    const upcomingElements = await page.$$(
      "div.swiper-wrapper > div.swiper-slide"
    );

    upcomingContests = await Promise.all(
      upcomingElements.map(async (el) => {
        return await page.evaluate((element) => {
          const [countdown, name, rawDate, time] =
            element.innerText.split("\n");
          return {
            name,
            countdown: countdown.includes(" in ")
              ? countdown.split(" in ")[1].trim()
              : "No Timer Found",
            time,
            link: element.querySelector("a")?.href || "No Link Found",
          };
        }, el);
      })
    );

    upcomingContests = upcomingContests.filter(
      (contest) => !contest.name.includes("Ended")
    );
    upcomingContests.forEach((contest) => {
      if (contest.countdown !== "No Timer Found") {
        const contestDateWithTime = calculateContestDate(contest.countdown);
        const contestDate = contestDateWithTime.split(",")[0];
        const date = new Date(contestDate);
        const monthAbbr = date.toLocaleString("en-US", { month: "short" });
        contest.date = `${monthAbbr}/${date.getDate()}/${date.getFullYear()}`;
        contest.time = contest.name.includes("Biweekly") ? "20:00" : "8:00";
        contest.duration = "2 Hrs";
        console.log(`🕒 ${contest.name} will be held on: ${contest.date}`);
      }
    });

    console.log(`✅ Found ${upcomingContests.length} upcoming contests.`);
  } catch (error) {
    console.error("❌ Error scraping upcoming contests:", error.message);
  }

  try {
    console.log("📌 Finding past contests...");

    let hasNextPage = true;
    let pageIndex = 0;

    while (hasNextPage && pageIndex < 40) {
      const pageData = await page.evaluate(() => {
        const pastContestElements = document.querySelectorAll(
          "div.min-h-\\[966px\\] div.mt-\\[11px\\] > div > div.px-4"
        );
        let pastContestsData = [];

        pastContestElements.forEach((el) => {
          const contestLink = el.querySelector("a")?.href || "No Link Found";
          const contestText = el.innerText.split("\n");
          if (contestText.length >= 2) {
            const dateString = contestText[1].trim();
            const datePart = dateString.match(/^[A-Za-z]+ \d{1,2}, \d{4}/)[0];
            const date = new Date(datePart);
            const monthAbbr = date.toLocaleString("en-US", { month: "short" });
            const formattedDate = `${monthAbbr}/${date.getDate()}/${date.getFullYear()}`;
            pastContestsData.push({
              name: contestText[0].trim(),
              date: formattedDate,
              duration: "2 Hrs",
              time: contestText[0].trim().includes("Biweekly")
                ? "20:00"
                : "8:00",
              link: contestLink,
            });
          }
        });

        return pastContestsData;
      });

      pastContests.push(...pageData);
      console.log(
        `✅ Scraped ${pageData.length} contests from page ${pageIndex + 1}.`
      );

      // Select next pagination button (instead of relying on aria-label)
      const nextButton = await page.$("button[aria-label='next']");
      console.log();
      if (nextButton) {
        await nextButton.click();
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        hasNextPage = false; // Stop pagination if no next button is found
      }
      pageIndex++;
    }

    console.log(`✅ Total past contests found: ${pastContests.length}`);
  } catch (error) {
    console.error("❌ Error scraping past contests:", error.message);
  }

  // console.log("📅 Upcoming Contests:", upcomingContests);
  // console.log("📅 Past Contests:", pastContests);
  await browser.close();
  return { upcomingContests, pastContests };
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

  const contests = await page.$$("div._dataTable__container_7s2sw_417");
  let upcomingContests = [];
  let pastContests = [];

  for (const contestTable of contests) {
    const sectionTitle = await page.evaluate(
      (el) => el.previousElementSibling?.innerText.trim() || "Unknown",
      contestTable
    );

    // Scroll to load all past contests (max 10 times)
    if (sectionTitle.includes("Past")) {
      let previousHeight = 0;
      let scrollCount = 0;
      const maxScrolls = 30; // Prevent excessive scrolling

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
    }

    const contestRows = await contestTable.$$("table > tbody.css-y6j1my > tr");

    let contestData = await Promise.all(
      contestRows.map(async (row) => {
        return await page.evaluate((element) => {
          const columns = element.querySelectorAll("td");
          const dateText = columns[2]?.innerText.trim().split("\n\n")[0] || "";
          const date = new Date(dateText);
          const monthAbbr = date.toLocaleString("en-US", { month: "short" });
          const formattedDate = `${monthAbbr}/${date.getDate()}/${date.getFullYear()}`;

          return {
            name: columns[0]?.innerText.trim() || "Unknown Contest",
            link: columns[1]?.querySelector("a")?.href || "No Link",
            date: formattedDate || "No Date",
            time:
              columns[2]?.innerText
                .trim()
                .split("\n\n")[1]
                ?.split(" ")[1]
                .trim() || "No time",
            duration: columns[3]?.innerText.trim() || "No Duration",
          };
        }, row);
      })
    );

    if (sectionTitle.includes("Upcoming")) {
      upcomingContests = contestData;
    } else if (sectionTitle.includes("Past")) {
      pastContests = contestData;
    }
  }

  // console.log("📅 Upcoming Contests:", upcomingContests);
  // console.log("📅 Past Contests:", pastContests);
  await browser.close();
  return { upcomingContests, pastContests };
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

  console.log("🔄 Opening Codeforces...");
  await page.goto("https://codeforces.com/contests", {
    waitUntil: "networkidle2",
  });

  let upcomingContests = [];
  let pastContests = [];

  // 🟢 Scrape Upcoming/Current Contests
  const upcomingTable = await page.$("div.datatable");
  if (upcomingTable) {
    console.log("✅ Found upcoming contests table");
    const contestRows = await upcomingTable.$$("table > tbody > tr");

    upcomingContests = await Promise.all(
      contestRows.map(async (row) => {
        return await page.evaluate((element) => {
          const columns = element.querySelectorAll("td");
          return {
            name:
              columns[0]?.innerText.trim().split("\n")[0] || "Unknown Contest",
            link: columns[5]?.querySelector("a")?.href || "No Link",
            date: columns[2]?.innerText.trim().split(" ")[0]?.trim(),
            time:
              columns[2]?.innerText.trim().split(" ")[1]?.trim() || "No Time",
            duration: columns[3]?.innerText.trim() || "No Time",
          };
        }, row);
      })
    );
  } else {
    console.log("❌ No upcoming contests found.");
  }

  // 🔴 Scrape Past Contests
  console.log("Selecting past contests table...");
  const pastTable = await page.$("div.contestList");
  if (pastTable) {
    const contestRows = await pastTable.$$("table > tbody > tr");

    pastContests = await Promise.all(
      contestRows.map(async (row) => {
        return await page.evaluate((element) => {
          function formatDate(dateString) {
            const date = new Date(dateString);
            if (isNaN(date)) return "Invalid Date";
            return date.toISOString().split("T")[0];
          }
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
  } else {
    console.log("❌ No past contests found.");
  }

  // console.log("📅 Upcoming Contests:", upcomingContests);
  // console.log("📅 Past Contests:", pastContests);

  await browser.close();
  return { upcomingContests, pastContests };
};

// Run scrapers
// codeforcesScraper();
// codechefScraper();
// leetCodeScraper();
