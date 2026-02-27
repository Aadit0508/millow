const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  const [buyer, seller, inspector, lender] = await ethers.getSigners()

  // Deploy Real Estate
  const RealEstate = await ethers.getContractFactory('RealEstate')
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()

  console.log(`Deployed Real Estate Contract at: ${realEstate.address}`)
  console.log(`Minting 6 properties...\n`)

  for (let i = 0; i < 6; i++) {
    const transaction = await realEstate.connect(seller).mint(`http://localhost:3000/metadata/${i + 1}.json`)
    await transaction.wait()
  }

  // Deploy Escrow
  const Escrow = await ethers.getContractFactory('Escrow')
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  )
  await escrow.deployed()

  console.log(`Deployed Escrow Contract at: ${escrow.address}`)
  console.log(`Listing 6 properties...\n`)

  for (let i = 0; i < 6; i++) {
    let transaction = await realEstate.connect(seller).approve(escrow.address, i + 1)
    await transaction.wait()
  }

  // Listing properties
  transaction = await escrow.connect(seller).list(1, buyer.address, tokens(20), tokens(10))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(2, buyer.address, tokens(15), tokens(5))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(3, buyer.address, tokens(10), tokens(5))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(4, buyer.address, tokens(35), tokens(15))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(5, buyer.address, tokens(12), tokens(5))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(6, buyer.address, tokens(18), tokens(8))
  await transaction.wait()

  console.log(`Finished.`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
// ```

// The only two things that changed from your original are:

// 1. The mint loop now goes to `6` instead of `3`, and the URL points to `localhost:3000/metadata/${i+1}.json` — this assumes your React frontend is running on port 3000 and your `metadata/` folder is inside `public/` so it gets served statically. If your setup is different let me know.

// 2. Three more `.list()` calls for properties 4, 5, and 6 with prices matching the `Purchase Price` in each JSON.

// **One thing to verify** — make sure your `metadata/` folder is inside your `public/` directory if you're using React, like this:
// ```
// public/
//   metadata/
//     1.json
//     2.json
//     3.json
//     4.json  ← new
//     5.json  ← new
//     6.json  ← new
// ```