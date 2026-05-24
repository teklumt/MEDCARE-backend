import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";
const git = simpleGit();

const startDate = moment("2026-05-24");
const endDate = moment("2026-05-28");

let commits = [];

const makeCommits = async () => {
  let currentDay = startDate.clone();
  while (currentDay.isSameOrBefore(endDate, "day")) {
    // Pick from weighted list
    const commitsToday = commits[Math.floor(Math.random() * commits.length)];

    if (commitsToday === 0) {
      console.log(`Skipping day: ${currentDay.format("YYYY-MM-DD")}`);
      currentDay.add(1, "day");
      continue;
    }

    for (let i = 0; i < commitsToday; i++) {
      const commitTime = currentDay
        .clone()
        .add(random.int(0, 23), "hours")
        .add(random.int(0, 59), "minutes")
        .add(random.int(0, 59), "seconds");

      const dateStr = commitTime.format("ddd MMM DD HH:mm:ss YYYY ZZ");

      const data = { date: dateStr };
      console.log(`Commit on ${dateStr} (${i + 1}/${commitsToday})`);

      await jsonfile.writeFile(path, data);
      await git.add(".");
      await git.commit(dateStr, { "--date": dateStr });
    }

    currentDay.add(1, "day");
  }

  console.log("✅ All commits done, pushing...");
  await git.push();
};

const insertCommits = () => {
  let noneLimit = 20; // 35% zeros
  let lowLimit = 72; // 52% low commits (2, 3)
  let highLimit = 3; // 3% heavy commits (7)

  while (noneLimit > 0 || lowLimit > 0 || highLimit > 0) {
    if (noneLimit > 0) {
      commits.push(0);
      noneLimit--;
    }
    if (lowLimit > 0) {
      commits.push(random.int(1, 3));
      lowLimit--;
    }
    if (highLimit > 0) {
      commits.push(random.int(16, 18));
      highLimit--;
    }
  }
};

insertCommits();
makeCommits().catch((err) => console.error("Commit failed:", err));
