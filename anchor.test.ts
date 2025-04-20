describe("Wall of Wishes", () => {
  // Persist program data keypair across tests
  let programDataKp;

  it("initialize", async () => {
    programDataKp = new web3.Keypair();
    console.log(`KP: ${programDataKp}`);
    const txHash = await pg.program.methods
      .initialize()
      .accounts({
        programData: programDataKp.publicKey,
        authority: pg.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([programDataKp])
      .rpc();

    console.log(`Initialize TX: ${txHash}`);
    await pg.connection.confirmTransaction(txHash);

    const programData = await pg.program.account.programData.fetch(programDataKp.publicKey);
    console.log("Program Data:", {
      owner: programData.owner.toBase58(),
      timestamp: new Date(programData.createTimestamp * 1000).toLocaleString(),
    });
  });

  it("createWish", async () => {
    const title = "My First Wish";
    const details = "test details";

    const [wishPDA] = await web3.PublicKey.findProgramAddress(
      [
        Buffer.from("wish"),
        pg.wallet.publicKey.toBuffer(),
        Buffer.from(title),
        Buffer.from(details),
      ],
      pg.program.programId
    );

    const txHash = await pg.program.methods
      .createWish(title, details)
      .accounts({
        user: pg.wallet.publicKey,
        wish: wishPDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log(`✅ Create Wish TX: ${txHash}`);
    await pg.connection.confirmTransaction(txHash);

    const wish = await pg.program.account.aWish.fetch(wishPDA);
    console.log("🌠 Wish Info:", {
      title: wish.title,
      details: wish.details,
      author: wish.author.toBase58(),
      timestamp: new Date(wish.timestamp * 1000).toLocaleString(),
    });

    // Simple assertions
    assert.equal(wish.title, title);
    assert.equal(wish.details, details);
    assert.equal(wish.author.toBase58(), pg.wallet.publicKey.toBase58());
    assert(wish.timestamp > 0);
  });
});
