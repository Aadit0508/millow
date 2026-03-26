const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  const [seller, buyer, inspector, lender] = await ethers.getSigners()

  // Deploy Real Estate
  const RealEstate = await ethers.getContractFactory('RealEstate')
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()
  console.log(`Deployed Real Estate Contract at: ${realEstate.address}`)

  // Mint 6 properties with your Pinata IPFS URLs
  console.log(`Minting 6 properties...\n`)

  const metadataURIs = [
    "https://ipfs.io/ipfs/bafybeie35dshyocny65a2djnmcjnep7tew7c547cjov7fxbtqcx2lhigmq/1.json",
    "https://ipfs.io/ipfs/bafybeie35dshyocny65a2djnmcjnep7tew7c547cjov7fxbtqcx2lhigmq/2.json",
    "https://ipfs.io/ipfs/bafybeie35dshyocny65a2djnmcjnep7tew7c547cjov7fxbtqcx2lhigmq/3.json",
    "https://ipfs.io/ipfs/bafybeie35dshyocny65a2djnmcjnep7tew7c547cjov7fxbtqcx2lhigmq/4.json",
    "https://ipfs.io/ipfs/bafybeie35dshyocny65a2djnmcjnep7tew7c547cjov7fxbtqcx2lhigmq/5.json",
    "https://ipfs.io/ipfs/bafybeie35dshyocny65a2djnmcjnep7tew7c547cjov7fxbtqcx2lhigmq/6.json",
  ]

  for (let i = 0; i < 6; i++) {
    const transaction = await realEstate.connect(seller).mint(metadataURIs[i])
    await transaction.wait()
    console.log(`Minted property ${i + 1}`)
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

  // Approve all properties
  console.log(`Listing 6 properties...\n`)
  for (let i = 0; i < 6; i++) {
    const transaction = await realEstate.connect(seller).approve(escrow.address, i + 1)
    await transaction.wait()
  }

  // List all 6 properties on Escrow
  let transaction

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