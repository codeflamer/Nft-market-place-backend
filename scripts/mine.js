const { moveBlocks } = require("../utils/move-blocks");

const BlOCKS =2 
const SLEEP_AMOUNT = 1000

const mine = () =>{
    await moveBlocks(BlOCKS,(sleepAmount=SLEEP_AMOUNT))
}

mine()
.then(() => process.exit(0))
.catch((err) => {
    console.log(err);
    process.exit(1);
});