import mongoose from "mongoose";

const ConnectToDb = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("\n🟢 DB is connected.");
  } catch (e) {
    console.log(`\n⛏ Error in db connection. \n${e}'\n`);
  }
};

export default ConnectToDb;
